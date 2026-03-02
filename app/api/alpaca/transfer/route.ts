import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
  if (!res.ok) throw new Error(`Alpaca ${res.status}: ${text}`)
  return JSON.parse(text)
}

// ─── POST: Initiate a deposit or withdrawal ─────────────────────────────────────
//
// Body: {
//   direction: "INCOMING" | "OUTGOING",
//   amount: number,
//   plaid_account_id: string    // our DB id for the plaid account
// }

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { direction, amount, plaid_account_id } = await req.json()

  if (!direction || !amount || amount <= 0) {
    return NextResponse.json(
      { error: "direction and a positive amount are required" },
      { status: 400 }
    )
  }

  if (!["INCOMING", "OUTGOING"].includes(direction)) {
    return NextResponse.json(
      { error: "direction must be INCOMING or OUTGOING" },
      { status: 400 }
    )
  }

  // Look up ACH relationship for this bank account
  const { data: relationship, error: relError } = await supabase
    .from("ach_relationships")
    .select("alpaca_relationship_id, bank_name, account_name, account_mask")
    .eq("user_id", user.id)
    .eq("plaid_account_id", plaid_account_id)
    .eq("status", "APPROVED")
    .single()

  if (relError || !relationship) {
    // Maybe the relationship hasn't been created yet — try to auto-link
    return NextResponse.json(
      {
        error:
          "No approved ACH relationship found for this bank account. Please link it first via the Fund Management panel.",
        needs_linking: true,
        plaid_account_id,
      },
      { status: 400 }
    )
  }

  try {
    const transfer = await alpacaRequest("/v2/account/ach_transfers", {
      method: "POST",
      body: JSON.stringify({
        relationship_id: relationship.alpaca_relationship_id,
        amount: amount.toFixed(2),
        direction,
      }),
    })

    // Store in our funding_transfers table
    await supabase.from("funding_transfers").insert({
      user_id: user.id,
      alpaca_transfer_id: transfer.id,
      direction,
      amount,
      status: transfer.status || "QUEUED",
      funding_account_id: plaid_account_id,
      bank_name: relationship.bank_name || relationship.account_name,
    })

    return NextResponse.json({
      success: true,
      transfer_id: transfer.id,
      status: transfer.status,
      amount,
      direction,
    })
  } catch (err: any) {
    console.error("Transfer error:", err)
    return NextResponse.json(
      { error: err.message || "Transfer failed" },
      { status: 500 }
    )
  }
}

// ─── GET: List transfer history ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: transfers, error } = await supabase
    .from("funding_transfers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
      { status: 500 }
    )
  }

  // Also sync status of any pending transfers with Alpaca
  const pending = (transfers || []).filter((t) =>
    ["QUEUED", "PENDING", "SENT_TO_CLEARING"].includes(t.status)
  )

  for (const t of pending) {
    try {
      const alpacaTransfer = await alpacaRequest(
        `/v2/account/ach_transfers/${t.alpaca_transfer_id}`
      )
      if (alpacaTransfer.status !== t.status) {
        await supabase
          .from("funding_transfers")
          .update({
            status: alpacaTransfer.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", t.id)
        t.status = alpacaTransfer.status
      }
    } catch {
      // Skip — can't reach Alpaca for this one
    }
  }

  return NextResponse.json(transfers || [])
}