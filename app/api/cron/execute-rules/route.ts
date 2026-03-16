import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ─── Supabase admin client (bypasses RLS for cron) ──────────────────────────────

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Alpaca Broker API sandbox helpers ──────────────────────────────────────────
//
// Broker API uses HTTP Basic auth (base64 of key:secret) and scopes all
// trading / funding calls under a per-user account_id.
//
// Base URLs:
//   Broker:  https://broker-api.sandbox.alpaca.markets
//   Data:    https://data.sandbox.alpaca.markets

const BROKER_BASE_URL =
  process.env.ALPACA_BASE_URL || "https://broker-api.sandbox.alpaca.markets"
const BROKER_DATA_URL =
  process.env.ALPACA_BROKER_DATA_URL || "https://data.sandbox.alpaca.markets"

function brokerAuthHeader(): string {
  const key = process.env.ALPACA_API_KEY!
  const secret = process.env.ALPACA_SECRET_KEY!
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64")
}

async function brokerRequest(
  path: string,
  options: RequestInit = {},
  baseUrl = BROKER_BASE_URL
) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: brokerAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Alpaca Broker ${res.status}: ${text}`)
  return JSON.parse(text)
}

// ─── Frequency helpers ──────────────────────────────────────────────────────────
// Determines whether enough time has elapsed since last_executed_at for the
// rule's configured frequency.  Returns { isDue, reason }.

type Frequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual"

/** Minimum milliseconds that must pass before the next execution. */
const FREQUENCY_MIN_MS: Record<Frequency, number> = {
  daily: 0, // always due (runs every cron tick during market hours)
  weekly: 6 * 24 * 60 * 60 * 1000, // ~6 days (gives 1-day slack)
  biweekly: 13 * 24 * 60 * 60 * 1000,
  monthly: 27 * 24 * 60 * 60 * 1000,
  quarterly: 88 * 24 * 60 * 60 * 1000,
  semiannual: 175 * 24 * 60 * 60 * 1000,
  annual: 360 * 24 * 60 * 60 * 1000,
}

/**
 * For non-daily frequencies we also check the preferred day-of-week /
 * day-of-month so investments land on a consistent schedule.
 *
 * Weekly / biweekly: prefer the same weekday as `created_at` (or Monday).
 * Monthly+: prefer the same day-of-month as `created_at` (clamped to 28).
 */
function isScheduleDue(rule: {
  frequency: string
  last_executed_at: string | null
  created_at: string
  preferred_execution_day?: number | null
}): { isDue: boolean; reason?: string } {
  const freq = (rule.frequency || "monthly") as Frequency
  const now = new Date()

  // ── First execution ever → always due ──
  if (!rule.last_executed_at) {
    return { isDue: true }
  }

  const lastExec = new Date(rule.last_executed_at)
  const elapsed = now.getTime() - lastExec.getTime()
  const minMs = FREQUENCY_MIN_MS[freq] ?? FREQUENCY_MIN_MS.monthly

  // Not enough time has passed
  if (elapsed < minMs) {
    return {
      isDue: false,
      reason: `Only ${Math.floor(elapsed / 86_400_000)}d since last execution (${freq} requires ~${Math.floor(minMs / 86_400_000)}d)`,
    }
  }

  // ── Day-of-week / day-of-month alignment ──
  const preferredDay =
    rule.preferred_execution_day ??
    new Date(rule.created_at).getDate()

  if (freq === "daily") {
    return { isDue: true }
  }

  if (freq === "weekly" || freq === "biweekly") {
    // Preferred weekday (0=Sun … 6=Sat). Default to the weekday the rule was created.
    const preferredWeekday =
      rule.preferred_execution_day ?? new Date(rule.created_at).getDay()
    if (now.getDay() !== preferredWeekday) {
      return {
        isDue: false,
        reason: `Waiting for preferred weekday ${preferredWeekday} (today is ${now.getDay()})`,
      }
    }
    return { isDue: true }
  }

  // Monthly, quarterly, semiannual, annual → match day-of-month
  const targetDay = Math.min(preferredDay, 28) // clamp to avoid month-end issues
  const today = now.getDate()

  // Allow execution on the target day or the next business day (±1)
  if (Math.abs(today - targetDay) > 1) {
    return {
      isDue: false,
      reason: `Waiting for day ~${targetDay} of month (today is ${today})`,
    }
  }

  return { isDue: true }
}

// ─── Cron handler ───────────────────────────────────────────────────────────────
// Called by Vercel Cron / pg_cron / external scheduler.
// Recommended: every 30 minutes during market hours.
//
// Protect with:  Authorization: Bearer <CRON_SECRET>

export async function GET(req: NextRequest) {
  // ── Auth ──
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ── Market clock (Broker API) ──
  try {
    const clock = await brokerRequest("/v1/clock")
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

  // ── Fetch active rules ──
  // We pull all enabled, non-held rules and do schedule checks in code
  // so we have full control over frequency logic.
  const { data: allRules, error } = await supabaseAdmin
    .from("investment_rules")
    .select("*")
    .eq("is_active", true)

  if (error) {
    console.error("Failed to fetch rules:", error)
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 })
  }

  if (!allRules || allRules.length === 0) {
    return NextResponse.json({ processed: 0, message: "No active rules" })
  }

  // ── Filter to rules that are actually due based on their frequency ──
  const dueRules: typeof allRules = []
  const skippedSchedule: Array<{ rule_id: string; symbol: string; reason: string }> = []

  for (const rule of allRules) {
    const { isDue, reason } = isScheduleDue(rule)
    if (isDue) {
      dueRules.push(rule)
    } else {
      skippedSchedule.push({
        rule_id: rule.id,
        symbol: rule.symbol,
        reason: reason || "Not yet due",
      })
    }
  }

  if (dueRules.length === 0) {
    return NextResponse.json({
      processed: 0,
      message: "No rules due this cycle",
      skipped: skippedSchedule,
    })
  }

  // ── Group rules by alpaca_account_id to batch account lookups ──
  const rulesByAccount = new Map<string, typeof dueRules>()
  for (const rule of dueRules) {
    const acctId = rule.alpaca_account_id
    if (!acctId) {
      skippedSchedule.push({
        rule_id: rule.id,
        symbol: rule.symbol,
        reason: "No alpaca_account_id configured",
      })
      continue
    }
    if (!rulesByAccount.has(acctId)) rulesByAccount.set(acctId, [])
    rulesByAccount.get(acctId)!.push(rule)
  }

  const results: Array<{
    rule_id: string
    symbol: string
    status: string
    detail?: string
  }> = []

  // ── Process each account's rules ──
  for (const [accountId, accountRules] of rulesByAccount) {
    let tradingAccount: any
    try {
      tradingAccount = await brokerRequest(
        `/v1/trading/accounts/${accountId}/account`
      )
    } catch (err: any) {
      for (const rule of accountRules) {
        results.push({
          rule_id: rule.id,
          symbol: rule.symbol,
          status: "error",
          detail: `Failed to get trading account: ${err.message}`,
        })
      }
      continue
    }

    let cashAvailable = parseFloat(tradingAccount.cash || "0")

    for (const rule of accountRules) {
      try {
        const result = await processRule(rule, accountId, cashAvailable)
        results.push({
          rule_id: rule.id,
          symbol: rule.symbol,
          status: result.status,
          detail: result.detail,
        })
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
  }

  return NextResponse.json({
    processed: results.length,
    results,
    skipped_schedule: skippedSchedule,
    timestamp: new Date().toISOString(),
  })
}

// ─── Process a single rule ──────────────────────────────────────────────────────

async function processRule(
  rule: any,
  accountId: string,
  cashAvailable: number
): Promise<{ status: string; detail?: string; cashSpent?: number }> {
  // ── Handle pending transfers first ──
  if (rule.pending_execution && rule.pending_transfer_id) {
    return await handlePending(rule, accountId)
  }

  // ── Get current price ──
  const currentPrice = await getLatestQuote(rule.symbol)

  // ── Strategy gate ──
  const strategyCheck = checkStrategy(rule, currentPrice)
  if (strategyCheck.skip) {
    return { status: "skipped", detail: strategyCheck.reason }
  }

  // ── Calculate notional needed ──
  const amountNeeded =
    rule.type === "amount"
      ? Number(rule.value)
      : Number(rule.value) * currentPrice

  // ── Enough cash → trade immediately ──
  if (cashAvailable >= amountNeeded) {
    return await executeTrade(rule, accountId, currentPrice, amountNeeded)
  }

  // ── Auto-fund: initiate ACH deposit via Broker Transfer API ──
  // In sandbox, transfers settle in ~10-30 min (simulated ACH).
  if (rule.auto_fund && rule.funding_account_id && rule.alpaca_ach_relationship_id) {
    const deficit = amountNeeded - cashAvailable
    const transferAmount = Math.ceil(deficit * 1.1 * 100) / 100

    try {
      const transfer = await brokerRequest(
        `/v1/accounts/${accountId}/transfers`,
        {
          method: "POST",
          body: JSON.stringify({
            transfer_type: "ach",
            relationship_id: rule.alpaca_ach_relationship_id,
            amount: transferAmount.toFixed(2),
            direction: "INCOMING",
          }),
        }
      )

      // Mark rule as pending in DB
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
        detail: `Depositing $${transferAmount.toFixed(2)} via ACH — trade will execute on settlement`,
      }
    } catch (err: any) {
      return {
        status: "funding_failed",
        detail: `ACH deposit failed: ${err.message}`,
      }
    }
  }

  return {
    status: "insufficient_funds",
    detail: `Need $${amountNeeded.toFixed(2)}, have $${cashAvailable.toFixed(2)}. Auto-fund is off.`,
  }
}

// ─── Handle a rule with a pending deposit ───────────────────────────────────────

async function handlePending(
  rule: any,
  accountId: string
): Promise<{ status: string; detail?: string; cashSpent?: number }> {
  // Check transfer status via Broker Transfer API
  let transfers: any[]
  try {
    transfers = await brokerRequest(
      `/v1/accounts/${accountId}/transfers`
    )
  } catch {
    await clearPending(rule.id)
    return { status: "error", detail: "Could not query transfers — cleared pending" }
  }

  const transfer = Array.isArray(transfers)
    ? transfers.find((t: any) => t.id === rule.pending_transfer_id)
    : null

  if (!transfer) {
    await clearPending(rule.id)
    return { status: "error", detail: "Pending transfer not found — cleared" }
  }

  // Sync status to our DB
  await supabaseAdmin
    .from("funding_transfers")
    .update({ status: transfer.status, updated_at: new Date().toISOString() })
    .eq("alpaca_transfer_id", rule.pending_transfer_id)

  if (["COMPLETE", "APPROVED"].includes(transfer.status)) {
    // Funds settled — attempt trade
    const tradingAccount = await brokerRequest(
      `/v1/trading/accounts/${accountId}/account`
    )
    const currentPrice = await getLatestQuote(rule.symbol)
    const amountNeeded =
      rule.type === "amount"
        ? Number(rule.value)
        : Number(rule.value) * currentPrice

    if (parseFloat(tradingAccount.cash || "0") >= amountNeeded) {
      await clearPending(rule.id)
      return await executeTrade(rule, accountId, currentPrice, amountNeeded)
    }

    await clearPending(rule.id)
    return {
      status: "insufficient_after_settlement",
      detail: `Funds settled but price moved. Cash: $${parseFloat(tradingAccount.cash).toFixed(2)}, Need: $${amountNeeded.toFixed(2)}`,
    }
  }

  if (["CANCELED", "RETURNED", "REJECTED"].includes(transfer.status)) {
    await clearPending(rule.id)
    return {
      status: "transfer_failed",
      detail: `Transfer was ${transfer.status.toLowerCase()}`,
    }
  }

  // Timeout check (7 days — generous for sandbox's ~10-30 min settlement)
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

// ─── Execute a trade via Broker Trading API ─────────────────────────────────────

async function executeTrade(
  rule: any,
  accountId: string,
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
    // Notional (fractional dollar amount)
    orderParams.notional = Math.floor(amountNeeded * 100) / 100
  } else {
    // Share quantity
    orderParams.qty = String(Number(rule.value))
  }

  const order = await brokerRequest(
    `/v1/trading/accounts/${accountId}/orders`,
    {
      method: "POST",
      body: JSON.stringify(orderParams),
    }
  )

  // Update last_executed_at so the schedule knows when this last ran
  await supabaseAdmin
    .from("investment_rules")
    .update({ last_executed_at: new Date().toISOString() })
    .eq("id", rule.id)

  // Log the execution
  const {error} = await supabaseAdmin.from("rule_executions").insert({
    rule_id: rule.id,
    user_id: rule.user_id,
    alpaca_order_id: order.id,
    symbol: rule.symbol,
    side: "buy",
    type: rule.type,
    value: Number(rule.value),
    executed_price: currentPrice,
    notional: amountNeeded,
    status: order.status || "accepted",
  })
  
  if (error) {}

  return {
    status: "executed",
    detail: `Order ${order.id} for ${rule.symbol} @ ~$${currentPrice.toFixed(2)}`,
    cashSpent: amountNeeded,
  }
}

// ─── Strategy check ─────────────────────────────────────────────────────────────

function checkStrategy(
  rule: any,
  currentPrice: number
): { skip: boolean; reason?: string } {
  const strategy = rule.strategy || "dca"

  if (strategy === "dca") return { skip: false }

  if (strategy === "threshold") {
    const maxPrice = rule.strategy_params?.threshold_price || rule.max_price
    if (maxPrice && currentPrice > parseFloat(maxPrice)) {
      return {
        skip: true,
        reason: `$${currentPrice.toFixed(2)} above threshold $${parseFloat(maxPrice).toFixed(2)}`,
      }
    }
    return { skip: false }
  }

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
  const data = await brokerRequest(
    `/v2/stocks/${symbol}/quotes/latest`,
    {},
    BROKER_DATA_URL
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