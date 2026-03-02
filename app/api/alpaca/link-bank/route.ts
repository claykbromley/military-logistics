import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PlaidApi, Configuration, PlaidEnvironments, ProcessorTokenCreateRequestProcessorEnum  } from "plaid"

// ─── Plaid client ───────────────────────────────────────────────────────────────

const plaidConfig = new Configuration({
  basePath:
    PlaidEnvironments[
      (process.env.PLAID_ENV as "sandbox" | "development" | "production") ||
        "sandbox"
    ],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
    },
  },
})

const plaidClient = new PlaidApi(plaidConfig)

// ─── Alpaca API helper ──────────────────────────────────────────────────────────

const ALPACA_BASE_URL =
  process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets"

async function alpacaRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ALPACA_BASE_URL}${path}`, {
    ...options,
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const text = await res.text()

  if (!res.ok) {
    throw new Error(`Alpaca ${res.status}: ${text}`)
  }

  return JSON.parse(text)
}

// ─── POST: Link a Plaid bank account to Alpaca via processor token ──────────────
//
// This is the one-time flow that connects a user's Plaid bank account to their
// Alpaca brokerage account so ACH transfers can happen:
//
//   1. We call Plaid's /processor/token/create with processor "alpaca"
//      → Plaid returns a processor_token
//   2. We send that token to Alpaca's POST /v2/account/ach_relationships
//      → Alpaca creates an ACH relationship and returns a relationship_id
//   3. We store the mapping in our `ach_relationships` table
//
// After this, execute-rule can initiate deposits using the relationship_id.
//
// Request body:
//   { plaid_account_id: string }
//
// The plaid_account_id must correspond to a Plaid account the user has already
// linked via the standard Plaid Link flow (stored in your plaid_accounts table).

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { plaid_account_id } = body
  
  if (!plaid_account_id) {
    return NextResponse.json(
      { error: "plaid_account_id is required" },
      { status: 400 }
    )
  }

  // ─── Check if relationship already exists ─────────────────────────
  const { data: existing } = await supabase
    .from("ach_relationships")
    .select("id, alpaca_relationship_id, status")
    .eq("user_id", user.id)
    .eq("plaid_account_id", plaid_account_id)
    .single()

  if (existing && existing.status === "APPROVED") {
    return NextResponse.json({
      already_linked: true,
      relationship_id: existing.alpaca_relationship_id,
      message: "This bank account is already linked to Alpaca.",
    })
  }
  
  // ─── Look up the Plaid account to get the access_token ────────────
  // We need the plaid_item's access_token and the plaid account_id
  const { data: plaidAccount, error: acctError } = await supabase
    .from("plaid_accounts")
    .select("id, account_id_plaid, plaid_item_id, name, mask")
    .eq("id", plaid_account_id)
    .eq("user_id", user.id)
    .single()

  if (acctError || !plaidAccount) {
    return NextResponse.json(
      { error: "Plaid account not found" },
      { status: 404 }
    )
  }

  // Get the access_token from the plaid_items table
  const { data: plaidItem, error: itemError } = await supabase
    .from("plaid_items")
    .select("access_token, institution_name")
    .eq("id", plaidAccount.plaid_item_id)
    .eq("user_id", user.id)
    .single()

  if (itemError || !plaidItem) {
    return NextResponse.json(
      { error: "Plaid item not found - re-link your bank account" },
      { status: 404 }
    )
  }

  try {
    // ─── Step 1: Create a Plaid processor token for Alpaca ──────────

    const auth = await plaidClient.authGet({
      access_token: plaidItem.access_token,
    })

    const processorResponse = await plaidClient.processorTokenCreate({
      access_token: plaidItem.access_token,
      account_id: plaidAccount.account_id_plaid,
      processor: ProcessorTokenCreateRequestProcessorEnum.Alpaca
    })

    const processorToken = processorResponse.data.processor_token

    // ─── Step 2: Create ACH relationship in Alpaca ──────────────────
    const achRelationship = await alpacaRequest(
      "/v2/account/ach_relationships",
      {
        method: "POST",
        body: JSON.stringify({
          processor_token: processorToken,
        }),
      }
    )

    // ─── Step 3: Store the relationship in our database ─────────────
    const relationshipRow = {
      user_id: user.id,
      plaid_account_id: plaid_account_id,
      plaid_item_id: plaidAccount.plaid_item_id,
      alpaca_relationship_id: achRelationship.id,
      status: achRelationship.status || "QUEUED",
      bank_name: plaidItem.institution_name || null,
      account_name: plaidAccount.name || null,
      account_mask: plaidAccount.mask || null,
    }

    if (existing) {
      // Update the existing (possibly stale/failed) row
      await supabase
        .from("ach_relationships")
        .update({
          ...relationshipRow,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      await supabase.from("ach_relationships").insert(relationshipRow)
    }

    return NextResponse.json({
      success: true,
      relationship_id: achRelationship.id,
      status: achRelationship.status,
      message: `Bank account linked to Alpaca. Status: ${achRelationship.status}`,
    })
  } catch (err: any) {
    console.error("Link bank error:", err)

    // Parse common errors for better UX
    const message = err.message || "Failed to link bank account"

    if (message.includes("INVALID_INPUT")) {
      return NextResponse.json(
        {
          error:
            "This account type cannot be linked for ACH transfers. Please use a checking or savings account.",
        },
        { status: 400 }
      )
    }

    if (message.includes("already exists") || message.includes("DUPLICATE")) {
      // Alpaca says the relationship already exists — fetch and store it
      try {
        const relationships = await alpacaRequest(
          "/v2/account/ach_relationships"
        )
        // Try to find the matching one
        // (Alpaca doesn't give us a great way to match, so we store what we can)
        if (relationships.length > 0) {
          const latest = relationships[relationships.length - 1]
          await supabase.from("ach_relationships").upsert(
            {
              user_id: user.id,
              plaid_account_id: plaid_account_id,
              plaid_item_id: plaidAccount.plaid_item_id,
              alpaca_relationship_id: latest.id,
              status: latest.status,
              bank_name: plaidItem.institution_name,
              account_name: plaidAccount.name,
              account_mask: plaidAccount.mask,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,plaid_account_id" }
          )

          return NextResponse.json({
            success: true,
            already_linked: true,
            relationship_id: latest.id,
            status: latest.status,
            message: "Bank account was already linked to Alpaca.",
          })
        }
      } catch {
        // Fall through to generic error
      }
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── GET: List all ACH relationships for the current user ───────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: relationships, error } = await supabase
    .from("ach_relationships")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch ACH relationships" },
      { status: 500 }
    )
  }

  return NextResponse.json({ relationships: relationships || [] })
}

// ─── DELETE: Remove an ACH relationship ─────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const relationshipId = searchParams.get("id")

  if (!relationshipId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  // Look up in our DB
  const { data: rel } = await supabase
    .from("ach_relationships")
    .select("alpaca_relationship_id")
    .eq("id", relationshipId)
    .eq("user_id", user.id)
    .single()

  if (!rel) {
    return NextResponse.json(
      { error: "Relationship not found" },
      { status: 404 }
    )
  }

  try {
    // Delete from Alpaca
    await alpacaRequest(
      `/v2/account/ach_relationships/${rel.alpaca_relationship_id}`,
      { method: "DELETE" }
    )
  } catch (err: any) {
    // If Alpaca says it's already gone, that's fine
    if (!err.message?.includes("404")) {
      console.error("Alpaca delete failed:", err)
    }
  }

  // Delete from our DB
  await supabase
    .from("ach_relationships")
    .delete()
    .eq("id", relationshipId)
    .eq("user_id", user.id)

  // Clear any rules that referenced this account
  await supabase
    .from("investment_rules")
    .update({ funding_account_id: null, auto_fund: false })
    .eq("user_id", user.id)
    .eq("funding_account_id", relationshipId)

  return NextResponse.json({ success: true })
}