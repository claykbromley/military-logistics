import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  PlaidApi,
  Configuration,
  PlaidEnvironments,
  ProcessorTokenCreateRequestProcessorEnum,
} from "plaid"
import {
  isConfigured,
  brokerFetchGlobal,
  getAlpacaAccountId,
} from "@/lib/broker"

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

// ─── POST: Link a Plaid bank account to Alpaca via processor token ──────────────
//
//   1. Plaid processor token → Alpaca ACH relationship
//   2. Store in ach_relationships table
//
// IMPORTANT: This now uses the Broker API (/v1/accounts/{id}/...) with Basic
// auth, NOT the Trading API (APCA-API-KEY-ID headers) which was the source of
// auth errors.

export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Alpaca Broker API not configured" },
      { status: 400 }
    )
  }

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

  // Get user's Alpaca account ID
  const accountId = await getAlpacaAccountId()
  if (!accountId) {
    return NextResponse.json(
      { error: "No Alpaca brokerage account found. Complete account setup first." },
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

  // ─── Look up the Plaid account ────────────────────────────────────
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

  // Get the access_token from plaid_items
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
    const processorResponse = await plaidClient.processorTokenCreate({
      access_token: plaidItem.access_token,
      account_id: plaidAccount.account_id_plaid,
      processor: ProcessorTokenCreateRequestProcessorEnum.Alpaca,
    })

    const processorToken = processorResponse.data.processor_token

    // ─── Step 2: Create ACH relationship via BROKER API ─────────────
    // Key fix: Use brokerFetchGlobal with the Broker API path, not
    // the Trading API /v2/account/ach_relationships endpoint.
    const achRelationship = await brokerFetchGlobal(
      `/v1/accounts/${accountId}/ach_relationships`,
      {
        method: "POST",
        body: JSON.stringify({
          processor_token: processorToken,
        }),
      }
    )

    // ─── Step 3: Store the relationship ─────────────────────────────
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
      await supabase
        .from("ach_relationships")
        .update({ ...relationshipRow, updated_at: new Date().toISOString() })
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
    const message = err.message || "Failed to link bank account"

    if (message.includes("INVALID_INPUT")) {
      return NextResponse.json(
        {
          error:
            "This account type cannot be linked for ACH. Please use a checking or savings account.",
        },
        { status: 400 }
      )
    }

    // Detect any flavor of "relationship already exists" from Alpaca
    const isDuplicate =
      message.includes("already exists") ||
      message.includes("DUPLICATE") ||
      message.includes("only one active") ||
      message.includes("40910000")

    if (isDuplicate) {
      // Relationship already exists in Alpaca — fetch it and store in our DB
      try {
        const relationships = await brokerFetchGlobal(
          `/v1/accounts/${accountId}/ach_relationships`
        )

        const active = Array.isArray(relationships)
          ? relationships.find((r: any) => r.status === "APPROVED" || r.status === "QUEUED") || relationships[0]
          : relationships

        if (active?.id) {
          // Store it — use insert with on-conflict or plain insert
          const row = {
            user_id: user.id,
            plaid_account_id: plaid_account_id,
            plaid_item_id: plaidAccount.plaid_item_id,
            alpaca_relationship_id: active.id,
            status: active.status || "APPROVED",
            bank_name: plaidItem.institution_name,
            account_name: plaidAccount.name,
            account_mask: plaidAccount.mask,
            updated_at: new Date().toISOString(),
          }

          if (existing) {
            await supabase
              .from("ach_relationships")
              .update(row)
              .eq("id", existing.id)
          } else {
            // Try upsert first, fall back to plain insert
            const { error: upsertErr } = await supabase
              .from("ach_relationships")
              .upsert(row, { onConflict: "user_id,plaid_account_id" })

            if (upsertErr) {
              console.warn("Upsert failed, trying plain insert:", upsertErr.message)
              await supabase.from("ach_relationships").insert(row)
            }
          }

          return NextResponse.json({
            success: true,
            already_linked: true,
            relationship_id: active.id,
            status: active.status,
            message: "Bank account was already linked to Alpaca.",
          })
        }
      } catch (recoveryErr: any) {
        console.error("ACH recovery failed:", recoveryErr)
        // Fall through to generic error with helpful message
      }

      return NextResponse.json({
        error: "An ACH relationship already exists on Alpaca but we couldn't sync it to your account. Try refreshing the page.",
        detail: message,
      }, { status: 409 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── GET: List ACH relationships ────────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: relationships } = await supabase
    .from("ach_relationships")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return NextResponse.json({ relationships: relationships || [] })
}

// ─── DELETE: Remove an ACH relationship ─────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Alpaca not configured" },
      { status: 400 }
    )
  }

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

  const { data: rel } = await supabase
    .from("ach_relationships")
    .select("alpaca_relationship_id")
    .eq("id", relationshipId)
    .eq("user_id", user.id)
    .single()

  if (!rel) {
    return NextResponse.json({ error: "Relationship not found" }, { status: 404 })
  }

  const accountId = await getAlpacaAccountId()

  try {
    if (accountId) {
      await brokerFetchGlobal(
        `/v1/accounts/${accountId}/ach_relationships/${rel.alpaca_relationship_id}`,
        { method: "DELETE" }
      )
    }
  } catch (err: any) {
    if (!err.message?.includes("404")) {
      console.error("Alpaca delete ACH failed:", err)
    }
  }

  await supabase
    .from("ach_relationships")
    .delete()
    .eq("id", relationshipId)
    .eq("user_id", user.id)

  // Clear rules referencing this account
  await supabase
    .from("investment_rules")
    .update({ funding_account_id: null, auto_fund: false })
    .eq("user_id", user.id)
    .eq("funding_account_id", relationshipId)

  return NextResponse.json({ success: true })
}