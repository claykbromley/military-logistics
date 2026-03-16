import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  isConfigured,
  brokerFetchGlobal,
  brokerTradingFetch,
  getAlpacaAccountId,
  getAuthHeader,
  requireUser,
} from "@/lib/broker"

const BROKER_BASE = process.env.ALPACA_BROKER_BASE_URL
  || (process.env.ALPACA_BASE_URL?.includes("broker-api") ? process.env.ALPACA_BASE_URL : null)
  || "https://broker-api.sandbox.alpaca.markets"

/**
 * GET   /api/alpaca/transfer          → List transfer history (refreshes pending statuses)
 * POST  /api/alpaca/transfer          → Initiate a deposit or withdrawal
 * PATCH /api/alpaca/transfer          → Sandbox only: settle a pending transfer
 */

// ─── GET: List transfers with live status refresh ───────────────────────────

export async function GET() {
  if (!isConfigured()) return NextResponse.json([])

  try {
    const { user, supabase } = await requireUser()
    const accountId = await getAlpacaAccountId()

    // First pass: read current transfers
    const { data: transfers } = await supabase
      .from("funding_transfers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (accountId && transfers) {
      const pending = transfers.filter((t) =>
        ["QUEUED", "PENDING", "SENT_TO_CLEARING"].includes(t.status)
      )

      const isSandbox = BROKER_BASE.includes("sandbox")

      for (const t of pending) {
        try {
          // In sandbox, settle first, then check status
          if (isSandbox) {
            try {
              await sandboxSettleTransfer(accountId, t.alpaca_transfer_id)
            } catch {
              // Settle may fail if already settled — that's fine
            }
          }

          // Check live status from Alpaca
          const live = await brokerFetchGlobal(
            `/v1/accounts/${accountId}/transfers/${t.alpaca_transfer_id}`
          )

          if (live.status !== t.status) {
            await supabase
              .from("funding_transfers")
              .update({ status: live.status, updated_at: new Date().toISOString() })
              .eq("id", t.id)
              .eq("user_id", user.id)

            if (
              (live.status === "COMPLETE" || live.status === "APPROVED") &&
              t.triggered_by_rule_id
            ) {
              await supabase
                .from("investment_rules")
                .update({ pending_execution: false })
                .eq("id", t.triggered_by_rule_id)
            }
          }
        } catch {
          // Non-critical — return cached status
        }
      }
    }

    // Re-read from DB to get the freshly updated statuses
    const { data: freshTransfers } = await supabase
      .from("funding_transfers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    return NextResponse.json(freshTransfers || [])
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("GET /api/alpaca/transfer error:", err)
    return NextResponse.json([])
  }
}

// ─── POST: Initiate a transfer ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Alpaca Broker API not configured" }, { status: 400 })
  }

  try {
    const { user, supabase } = await requireUser()
    const accountId = await getAlpacaAccountId()

    if (!accountId) {
      return NextResponse.json({ error: "No Alpaca account found" }, { status: 400 })
    }

    const body = await request.json()
    const { direction, amount, plaid_account_id } = body

    if (!direction || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "direction and a positive amount are required" },
        { status: 400 }
      )
    }

    // ── Find the ACH relationship ────────────────────────────────────
    let relationshipId: string | null = null
    let bankName: string | null = null

    if (plaid_account_id) {
      const { data: achRel } = await supabase
        .from("ach_relationships")
        .select("alpaca_relationship_id, bank_name, status")
        .eq("plaid_account_id", plaid_account_id)
        .eq("user_id", user.id)
        .single()

      if (!achRel) {
        return NextResponse.json(
          { error: "Bank account not linked to Alpaca. Try re-linking your bank." },
          { status: 400 }
        )
      }

      if (achRel.status !== "APPROVED") {
        return NextResponse.json(
          { error: `ACH relationship is ${achRel.status}. It may still be processing.` },
          { status: 400 }
        )
      }

      relationshipId = achRel.alpaca_relationship_id
      bankName = achRel.bank_name
    }

    if (!relationshipId) {
      const { data: anyRel } = await supabase
        .from("ach_relationships")
        .select("alpaca_relationship_id, bank_name")
        .eq("user_id", user.id)
        .eq("status", "APPROVED")
        .limit(1)
        .single()

      if (!anyRel) {
        return NextResponse.json(
          { error: "No linked bank account found. Connect a bank first." },
          { status: 400 }
        )
      }
      relationshipId = anyRel.alpaca_relationship_id
      bankName = anyRel.bank_name
    }

    // ── For withdrawals, check withdrawable cash first ─────────────
    if (direction === "OUTGOING") {
      try {
        const account = await brokerTradingFetch(accountId, "/account")
        const withdrawable = parseFloat(account.cash_withdrawable ?? account.cash ?? "0")

        if (amount > withdrawable) {
          // In sandbox, withdrawable is often $0 even if cash shows a balance
          // because paper deposits aren't real money
          const isSandbox = BROKER_BASE.includes("sandbox")
          const hint = isSandbox
            ? " In sandbox/paper trading mode, deposited funds may not be withdrawable since no real money entered the account. Withdrawable cash only reflects settled real deposits."
            : ""

          return NextResponse.json(
            {
              error: `Withdrawal amount ($${amount.toFixed(2)}) exceeds withdrawable cash ($${withdrawable.toFixed(2)}).${hint}`,
              withdrawable_cash: withdrawable,
              requested: amount,
            },
            { status: 422 }
          )
        }
      } catch (err) {
        console.warn("Could not check withdrawable cash:", err)
        // Proceed anyway — Alpaca will reject if invalid
      }
    }

    // ── Initiate the transfer ────────────────────────────────────────
    const transfer = await brokerFetchGlobal(
      `/v1/accounts/${accountId}/transfers`,
      {
        method: "POST",
        body: JSON.stringify({
          transfer_type: "ach",
          relationship_id: relationshipId,
          amount: String(amount),
          direction,
        }),
      }
    )

    // ── Store in DB ──────────────────────────────────────────────────
    await supabase.from("funding_transfers").insert({
      user_id: user.id,
      alpaca_transfer_id: transfer.id,
      direction,
      amount,
      status: transfer.status || "QUEUED",
      funding_account_id: plaid_account_id || null,
      bank_name: bankName,
    })

    // ── Sandbox: auto-settle immediately ─────────────────────────────
    const isSandbox = BROKER_BASE.includes("sandbox")
    let finalStatus = transfer.status || "QUEUED"

    if (isSandbox) {
      try {
        await sandboxSettleTransfer(accountId, transfer.id)

        const settled = await brokerFetchGlobal(
          `/v1/accounts/${accountId}/transfers/${transfer.id}`
        )
        finalStatus = settled.status

        await supabase
          .from("funding_transfers")
          .update({ status: finalStatus, updated_at: new Date().toISOString() })
          .eq("alpaca_transfer_id", transfer.id)
      } catch (settleErr) {
        console.warn("Sandbox auto-settle failed (non-critical):", settleErr)
      }
    }

    return NextResponse.json({
      success: true,
      transfer_id: transfer.id,
      status: finalStatus,
      amount,
      direction,
    })
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("POST /api/alpaca/transfer error:", err)

    const message = err.message || "Transfer failed"

    // Parse Alpaca-specific errors for better UX
    if (message.includes("withdrawable cash") || message.includes("40310000")) {
      const isSandbox = BROKER_BASE.includes("sandbox")
      return NextResponse.json({
        error: `Withdrawal exceeds withdrawable cash.${isSandbox ? " In sandbox mode, paper deposits are not withdrawable." : " Only settled funds can be withdrawn."}`,
      }, { status: 422 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── PATCH: Manually settle a transfer (sandbox only) ───────────────────────
//
// Call from browser console to settle a specific transfer:
//   fetch('/api/alpaca/transfer', {
//     method: 'PATCH',
//     headers: {'Content-Type': 'application/json'},
//     body: JSON.stringify({ transfer_id: 'xxx' })
//   }).then(r => r.json()).then(console.log)
//
// Or call with { settle_all: true } to settle all pending transfers.

export async function PATCH(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 400 })
  }

  const isSandbox = BROKER_BASE.includes("sandbox")
  if (!isSandbox) {
    return NextResponse.json(
      { error: "Manual settlement is only available in sandbox mode." },
      { status: 400 }
    )
  }

  try {
    const { user, supabase } = await requireUser()
    const accountId = await getAlpacaAccountId()
    if (!accountId) {
      return NextResponse.json({ error: "No Alpaca account" }, { status: 400 })
    }

    const body = await request.json()
    const { transfer_id, settle_all } = body

    const results: Array<{ id: string; alpaca_id: string; old_status: string; new_status: string }> = []

    if (settle_all) {
      // Settle all pending transfers
      const { data: pending } = await supabase
        .from("funding_transfers")
        .select("id, alpaca_transfer_id, status")
        .eq("user_id", user.id)
        .in("status", ["QUEUED", "PENDING", "SENT_TO_CLEARING"])

      for (const t of (pending || [])) {
        try {
          await sandboxSettleTransfer(accountId, t.alpaca_transfer_id)

          const live = await brokerFetchGlobal(
            `/v1/accounts/${accountId}/transfers/${t.alpaca_transfer_id}`
          )

          await supabase
            .from("funding_transfers")
            .update({ status: live.status, updated_at: new Date().toISOString() })
            .eq("id", t.id)

          results.push({
            id: t.id,
            alpaca_id: t.alpaca_transfer_id,
            old_status: t.status,
            new_status: live.status,
          })
        } catch (err: any) {
          results.push({
            id: t.id,
            alpaca_id: t.alpaca_transfer_id,
            old_status: t.status,
            new_status: `ERROR: ${err.message}`,
          })
        }
      }
    } else if (transfer_id) {
      // Settle a specific transfer
      const { data: t } = await supabase
        .from("funding_transfers")
        .select("id, alpaca_transfer_id, status")
        .eq("alpaca_transfer_id", transfer_id)
        .eq("user_id", user.id)
        .single()

      if (!t) {
        return NextResponse.json({ error: "Transfer not found" }, { status: 404 })
      }

      await sandboxSettleTransfer(accountId, t.alpaca_transfer_id)

      const live = await brokerFetchGlobal(
        `/v1/accounts/${accountId}/transfers/${t.alpaca_transfer_id}`
      )

      await supabase
        .from("funding_transfers")
        .update({ status: live.status, updated_at: new Date().toISOString() })
        .eq("id", t.id)

      results.push({
        id: t.id,
        alpaca_id: t.alpaca_transfer_id,
        old_status: t.status,
        new_status: live.status,
      })
    }

    return NextResponse.json({ success: true, settled: results })
  } catch (err: any) {
    console.error("PATCH /api/alpaca/transfer error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ─── Sandbox helper: settle a transfer ──────────────────────────────────────
//
// Alpaca sandbox provides an endpoint to simulate transfer completion:
//   POST /v1/sandbox/accounts/{id}/transfers/{transfer_id}
// with body: { "status": "COMPLETE" }

async function sandboxSettleTransfer(accountId: string, transferId: string) {
  const url = `${BROKER_BASE}/v1/sandbox/accounts/${accountId}/transfers/${transferId}`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "COMPLETE" }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Sandbox settle failed (${res.status}): ${text}`)
  }

  return res.json()
}