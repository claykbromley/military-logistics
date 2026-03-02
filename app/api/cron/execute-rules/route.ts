import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ─── Supabase admin client (bypasses RLS for cron) ──────────────────────────────

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Alpaca helpers ─────────────────────────────────────────────────────────────

const ALPACA_BASE_URL =
  process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets"
const ALPACA_DATA_URL =
  process.env.ALPACA_DATA_URL || "https://data.alpaca.markets"

async function alpacaRequest(
  path: string,
  options: RequestInit = {},
  baseUrl = ALPACA_BASE_URL
) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_API_KEY_ID!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_API_SECRET_KEY!,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Alpaca ${res.status}: ${text}`)
  return JSON.parse(text)
}

// ─── Cron handler ───────────────────────────────────────────────────────────────
// This should be called by Vercel Cron, Supabase pg_cron, or an external
// scheduler (e.g., every 30 minutes during market hours).
//
// Protect this endpoint with a secret:
//   Authorization: Bearer <CRON_SECRET>

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if market is open
  try {
    const clock = await alpacaRequest("/v2/clock")
    if (!clock.is_open) {
      return NextResponse.json({
        skipped: true,
        reason: "Market is closed",
        next_open: clock.next_open,
      })
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to check market clock: ${err.message}` },
      { status: 500 }
    )
  }

  // Fetch all rules that need processing using the view
  const { data: dueRules, error } = await supabaseAdmin
    .from("rules_due_for_execution")
    .select("*")

  if (error) {
    console.error("Failed to fetch due rules:", error)
    return NextResponse.json(
      { error: "Failed to fetch due rules" },
      { status: 500 }
    )
  }

  if (!dueRules || dueRules.length === 0) {
    return NextResponse.json({ processed: 0, message: "No rules due" })
  }

  const results: Array<{
    rule_id: string
    symbol: string
    status: string
    detail?: string
  }> = []

  // Get account info once
  let account: any
  try {
    account = await alpacaRequest("/v2/account")
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to get Alpaca account: ${err.message}` },
      { status: 500 }
    )
  }

  let cashAvailable = parseFloat(account.cash)

  for (const rule of dueRules) {
    try {
      const result = await processRule(rule, cashAvailable)
      results.push({
        rule_id: rule.id,
        symbol: rule.symbol,
        status: result.status,
        detail: result.detail,
      })

      // If we spent cash, update our running total
      if (result.cashSpent) {
        cashAvailable -= result.cashSpent
      }
    } catch (err: any) {
      console.error(`Error processing rule ${rule.id}:`, err)
      results.push({
        rule_id: rule.id,
        symbol: rule.symbol,
        status: "error",
        detail: err.message,
      })
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  })
}

// ─── Process a single rule ──────────────────────────────────────────────────────

async function processRule(
  rule: any,
  cashAvailable: number
): Promise<{ status: string; detail?: string; cashSpent?: number }> {

  // ── Handle pending transfers first ────────────────────────────────
  if (rule.pending_execution && rule.pending_transfer_id) {
    return await handlePending(rule)
  }

  // ── Check strategy conditions ─────────────────────────────────────
  const currentPrice = await getLatestQuote(rule.symbol)
  const strategyCheck = checkStrategy(rule, currentPrice)

  if (strategyCheck.skip) {
    return { status: "skipped", detail: strategyCheck.reason }
  }

  // ── Calculate amount needed ───────────────────────────────────────
  const amountNeeded =
    rule.type === "amount"
      ? Number(rule.value)
      : Number(rule.value) * currentPrice

  // ── Enough cash → trade ───────────────────────────────────────────
  if (cashAvailable >= amountNeeded) {
    return await executeTrade(rule, currentPrice, amountNeeded)
  }

  // ── Not enough cash + auto-fund enabled → initiate deposit ────────
  if (rule.auto_fund && rule.funding_account_id && rule.alpaca_relationship_id) {
    const deficit = amountNeeded - cashAvailable
    const transferAmount = Math.ceil(deficit * 1.1 * 100) / 100

    try {
      const transfer = await alpacaRequest("/v2/account/ach_transfers", {
        method: "POST",
        body: JSON.stringify({
          relationship_id: rule.alpaca_relationship_id,
          amount: transferAmount.toFixed(2),
          direction: "INCOMING",
        }),
      })

      // Mark rule as pending
      await supabaseAdmin
        .from("investment_rules")
        .update({
          pending_execution: true,
          pending_transfer_id: transfer.id,
          pending_since: new Date().toISOString(),
        })
        .eq("id", rule.id)

      // Log the transfer
      await supabaseAdmin.from("funding_transfers").insert({
        user_id: rule.user_id,
        alpaca_transfer_id: transfer.id,
        direction: "INCOMING",
        amount: transferAmount,
        status: transfer.status || "QUEUED",
        funding_account_id: rule.funding_account_id,
        triggered_by_rule_id: rule.id,
      })

      return {
        status: "funding_initiated",
        detail: `Depositing $${transferAmount.toFixed(2)} — trade will execute on settlement`,
      }
    } catch (err: any) {
      return {
        status: "funding_failed",
        detail: `ACH deposit failed: ${err.message}`,
      }
    }
  }

  // ── Not enough cash, no auto-fund ─────────────────────────────────
  return {
    status: "insufficient_funds",
    detail: `Need $${amountNeeded.toFixed(2)}, have $${cashAvailable.toFixed(2)}. Auto-fund is off.`,
  }
}

// ─── Handle a rule with a pending deposit ───────────────────────────────────────

async function handlePending(
  rule: any
): Promise<{ status: string; detail?: string; cashSpent?: number }> {
  let transfer: any

  try {
    transfer = await alpacaRequest(
      `/v2/account/ach_transfers/${rule.pending_transfer_id}`
    )
  } catch {
    await clearPending(rule.id)
    return { status: "error", detail: "Pending transfer not found — cleared" }
  }

  // Sync status
  await supabaseAdmin
    .from("funding_transfers")
    .update({ status: transfer.status, updated_at: new Date().toISOString() })
    .eq("alpaca_transfer_id", rule.pending_transfer_id)

  if (["COMPLETE", "APPROVED"].includes(transfer.status)) {
    // Funds settled — try to execute
    const account = await alpacaRequest("/v2/account")
    const currentPrice = await getLatestQuote(rule.symbol)
    const amountNeeded =
      rule.type === "amount"
        ? Number(rule.value)
        : Number(rule.value) * currentPrice

    if (parseFloat(account.cash) >= amountNeeded) {
      await clearPending(rule.id)
      return await executeTrade(rule, currentPrice, amountNeeded)
    }

    await clearPending(rule.id)
    return {
      status: "insufficient_after_settlement",
      detail: `Funds settled but price moved. Cash: $${parseFloat(account.cash).toFixed(2)}, Need: $${amountNeeded.toFixed(2)}`,
    }
  }

  if (["CANCELED", "RETURNED"].includes(transfer.status)) {
    await clearPending(rule.id)
    return {
      status: "transfer_failed",
      detail: `Transfer was ${transfer.status.toLowerCase()}`,
    }
  }

  // Timeout check
  const daysPending = Math.floor(
    (Date.now() - new Date(rule.pending_since).getTime()) / 86_400_000
  )
  if (daysPending > 7) {
    await clearPending(rule.id)
    return { status: "transfer_timeout", detail: "Pending for 7+ days — cleared" }
  }

  return {
    status: "pending",
    detail: `Transfer ${transfer.status}, day ${daysPending} of ~1-3`,
  }
}

// ─── Execute a trade ────────────────────────────────────────────────────────────

async function executeTrade(
  rule: any,
  currentPrice: number,
  amountNeeded: number
): Promise<{ status: string; detail?: string; cashSpent?: number }> {
  const orderParams: any = {
    symbol: rule.symbol,
    side: "buy",
    type: "market",
    time_in_force: "day",
  }

  if (rule.type === "amount") {
    orderParams.notional = Math.floor(amountNeeded * 100) / 100
  } else {
    orderParams.qty = Number(rule.value)
  }

  const order = await alpacaRequest("/v2/orders", {
    method: "POST",
    body: JSON.stringify(orderParams),
  })

  await supabaseAdmin
    .from("investment_rules")
    .update({ last_executed_at: new Date().toISOString() })
    .eq("id", rule.id)

  return {
    status: "executed",
    detail: `Order ${order.id} for ${rule.symbol} @ ~$${currentPrice.toFixed(2)}`,
    cashSpent: amountNeeded,
  }
}

// ─── Strategy check (sync, no API calls needed beyond price) ────────────────────

function checkStrategy(
  rule: any,
  currentPrice: number
): { skip: boolean; reason?: string } {
  const strategy = rule.strategy || "dca"

  if (strategy === "dca") return { skip: false }

  if (strategy === "threshold") {
    const maxPrice =
      rule.strategy_params?.threshold_price || rule.max_price
    if (maxPrice && currentPrice > parseFloat(maxPrice)) {
      return {
        skip: true,
        reason: `$${currentPrice.toFixed(2)} above threshold $${parseFloat(maxPrice).toFixed(2)}`,
      }
    }
    return { skip: false }
  }

  // smart_dip: we'd ideally check the moving average, but for the cron
  // we simplify by using the stored max_price (computed at rule creation/edit)
  if (strategy === "smart_dip") {
    if (rule.max_price && currentPrice > parseFloat(rule.max_price)) {
      return {
        skip: true,
        reason: `$${currentPrice.toFixed(2)} above dip target $${parseFloat(rule.max_price).toFixed(2)}`,
      }
    }
    return { skip: false }
  }

  return { skip: false }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function getLatestQuote(symbol: string): Promise<number> {
  const data = await alpacaRequest(
    `/v2/stocks/${symbol}/quotes/latest`,
    {},
    ALPACA_DATA_URL
  )
  return parseFloat(data.quote?.ap || data.quote?.bp || "0")
}

async function clearPending(ruleId: string) {
  await supabaseAdmin
    .from("investment_rules")
    .update({
      pending_execution: false,
      pending_transfer_id: null,
      pending_since: null,
    })
    .eq("id", ruleId)
}