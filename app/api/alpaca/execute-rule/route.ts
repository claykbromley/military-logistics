import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  isConfigured,
  brokerTradingFetch,
  brokerFetchGlobal,
  marketDataFetch,
  getAlpacaAccountId,
} from "@/lib/broker"

const BROKER_BASE =
  process.env.ALPACA_BASE_URL ||
  "https://broker-api.sandbox.alpaca.markets"

/**
 * POST /api/alpaca/execute-rule
 *
 * Executes a single investment rule. Handles:
 *  1. Price-constraint checks (threshold / smart_dip strategies)
 *  2. Insufficient-cash detection
 *  3. Auto-funding via ACH if the rule has auto_fund enabled
 *  4. Pending-deposit detection (rule already waiting for funds)
 *
 * Response shapes the frontend expects:
 *  - { success, order_id, order }               → Trade placed
 *  - { skipped, reason }                        → Price outside bounds
 *  - { insufficient_funds: true }               → No cash, no auto-fund
 *  - { funding_initiated, funded_amount, ... }  → ACH deposit started
 *  - { pending, message, transfer_status }      → Already waiting for deposit
 *  - { error }                                  → Generic error
 */
export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Alpaca Broker API keys not configured" },
      { status: 400 }
    )
  }

  try {
    const { rule_id } = await request.json()
    const supabase = await createClient()

    // ── Get Alpaca account ─────────────────────────────────────────────
    const accountId = await getAlpacaAccountId()
    if (!accountId) {
      return NextResponse.json(
        { error: "No Alpaca account found" },
        { status: 400 }
      )
    }

    // ── Get the investment rule ────────────────────────────────────────
    const { data: rule, error } = await supabase
      .from("investment_rules")
      .select("*")
      .eq("id", rule_id)
      .single()

    if (error || !rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    if (!rule.is_active) {
      return NextResponse.json({ error: "Rule is paused" }, { status: 400 })
    }

    // ── Check for pending deposit from a prior auto-fund ───────────────
    if (rule.pending_execution) {
      // Check if the pending transfer has settled
      const { data: pendingTransfer } = await supabase
        .from("funding_transfers")
        .select("status, alpaca_transfer_id")
        .eq("triggered_by_rule_id", rule.id)
        .in("status", ["QUEUED", "PENDING", "SENT_TO_CLEARING"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (pendingTransfer) {
        // Optionally refresh status from Alpaca
        try {
          const transferStatus = await brokerFetchGlobal(
            `/v1/accounts/${accountId}/transfers/${pendingTransfer.alpaca_transfer_id}`
          )
          if (
            transferStatus.status === "COMPLETE" ||
            transferStatus.status === "APPROVED"
          ) {
            // Funds landed — clear pending flag and proceed to trade below
            await supabase
              .from("investment_rules")
              .update({ pending_execution: false })
              .eq("id", rule.id)

            await supabase
              .from("funding_transfers")
              .update({ status: transferStatus.status })
              .eq("alpaca_transfer_id", pendingTransfer.alpaca_transfer_id)
          } else if (
            transferStatus.status === "CANCELED" ||
            transferStatus.status === "RETURNED"
          ) {
            // Transfer failed — clear pending so rule can retry
            await supabase
              .from("investment_rules")
              .update({ pending_execution: false })
              .eq("id", rule.id)

            await supabase
              .from("funding_transfers")
              .update({ status: transferStatus.status })
              .eq("alpaca_transfer_id", pendingTransfer.alpaca_transfer_id)

            return NextResponse.json(
              {
                error: `Auto-fund transfer was ${transferStatus.status.toLowerCase()}. Please retry or deposit manually.`,
              },
              { status: 422 }
            )
          } else {
            // Still pending
            return NextResponse.json({
              pending: true,
              message:
                "Waiting for auto-fund deposit to settle (1-3 business days)",
              transfer_status: transferStatus.status,
            })
          }
        } catch {
          // Can't check status — tell the user it's still pending
          return NextResponse.json({
            pending: true,
            message: "Deposit is still being processed",
            transfer_status: "PENDING",
          })
        }
      } else {
        // No pending transfer found — clear the flag
        await supabase
          .from("investment_rules")
          .update({ pending_execution: false })
          .eq("id", rule.id)
      }
    }

    // ── Check price constraints ────────────────────────────────────────
    let currentPrice: number | null = null

    if (rule.min_price || rule.max_price || rule.strategy !== "dca") {
      try {
        const latestTrade = await marketDataFetch(
          `/v2/stocks/${rule.symbol}/trades/latest`
        )
        currentPrice = latestTrade.trade?.p || null

        if (currentPrice != null) {
          if (
            rule.min_price &&
            currentPrice < Number(rule.min_price)
          ) {
            return NextResponse.json({
              skipped: true,
              reason: `Current price $${currentPrice.toFixed(2)} is below min $${rule.min_price}`,
            })
          }
          if (
            rule.max_price &&
            currentPrice > Number(rule.max_price)
          ) {
            return NextResponse.json({
              skipped: true,
              reason: `Current price $${currentPrice.toFixed(2)} is above max $${rule.max_price}`,
            })
          }
        }
      } catch (priceError) {
        console.warn("Could not fetch current price:", priceError)
        // If we can't get price and strategy requires it, skip
        if (rule.strategy === "threshold" || rule.strategy === "smart_dip") {
          return NextResponse.json({
            skipped: true,
            reason: "Unable to fetch current price for price-dependent strategy",
          })
        }
      }
    }

    // ── Calculate required cash ────────────────────────────────────────
    let requiredCash: number

    if (rule.type === "amount") {
      requiredCash = Number(rule.value)
    } else {
      // shares — estimate cost
      if (!currentPrice) {
        try {
          const latestTrade = await marketDataFetch(
            `/v2/stocks/${rule.symbol}/trades/latest`
          )
          currentPrice = latestTrade.trade?.p || 0
        } catch {
          currentPrice = Number(rule.estimated_share_price) || 0
        }
      }
      requiredCash = Number(rule.value) * (currentPrice || 0)
    }

    // ── Check available cash ───────────────────────────────────────────
    let accountData: { cash: string; buying_power: string }
    try {
      accountData = await brokerTradingFetch(accountId, "/account")
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch account balance" },
        { status: 500 }
      )
    }

    const availableCash = parseFloat(accountData.cash) || 0

    if (availableCash < requiredCash) {
      // ── Auto-fund if enabled ──────────────────────────────────────
      if (rule.auto_fund && rule.funding_account_id) {
        const fundResult = await initiateAutoFund(
          supabase,
          accountId,
          rule,
          requiredCash,
          availableCash
        )

        if (fundResult.success) {
          return NextResponse.json({
            funding_initiated: true,
            funded_amount: fundResult.amount,
            transfer_id: fundResult.transferId,
            message: `Auto-funded $${fundResult.amount.toFixed(2)} from bank. Trade will execute once deposit settles.`,
          })
        } else {
          return NextResponse.json(
            {
              error: fundResult.error || "Auto-funding failed",
              insufficient_funds: true,
            },
            { status: 422 }
          )
        }
      }

      // No auto-fund — just report insufficient funds
      return NextResponse.json(
        { insufficient_funds: true, available: availableCash, required: requiredCash },
        { status: 422 }
      )
    }

    // ── Place the order ────────────────────────────────────────────────
    const orderPayload: Record<string, unknown> = {
      symbol: rule.symbol,
      side: "buy",
      type: "market",
      time_in_force: "day",
    }

    if (rule.type === "amount") {
      orderPayload.notional = Number(rule.value)
    } else {
      orderPayload.qty = String(Number(rule.value))
    }

    const order = await brokerTradingFetch(accountId, "/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    })

    // Update last_executed_at and store the price
    await supabase
      .from("investment_rules")
      .update({
        last_executed_at: new Date().toISOString(),
        estimated_share_price: currentPrice,
      })
      .eq("id", rule_id)

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to execute rule"
    console.error("POST /api/alpaca/execute-rule error:", message)

    // Detect insufficient buying power from Alpaca error messages
    if (
      message.includes("insufficient") ||
      message.includes("buying_power") ||
      message.includes("403")
    ) {
      return NextResponse.json(
        { error: message, insufficient_funds: true },
        { status: 422 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ── Auto-Fund Helper ────────────────────────────────────────────────────────────

async function initiateAutoFund(
  supabase: Awaited<ReturnType<typeof createClient>>,
  accountId: string,
  rule: any,
  requiredCash: number,
  availableCash: number
): Promise<{
  success: boolean
  amount: number
  transferId?: string
  error?: string
}> {
  // Add a 5% buffer for price fluctuations
  const deficit = requiredCash - availableCash
  const transferAmount = Math.ceil(deficit * 1.05 * 100) / 100

  try {
    // Look up the ACH relationship for this funding account
    const { data: achRel } = await supabase
      .from("ach_relationships")
      .select("alpaca_relationship_id, status")
      .eq("plaid_account_id", rule.funding_account_id)
      .eq("status", "APPROVED")
      .single()

    if (!achRel) {
      return {
        success: false,
        amount: 0,
        error:
          "No approved ACH relationship found for the funding account. Re-link your bank.",
      }
    }

    // Initiate the ACH transfer via Alpaca Broker API
    const transfer = await brokerFetchGlobal(
      `/v1/accounts/${accountId}/transfers`,
      {
        method: "POST",
        body: JSON.stringify({
          transfer_type: "ach",
          relationship_id: achRel.alpaca_relationship_id,
          amount: String(transferAmount),
          direction: "INCOMING",
        }),
      }
    )

    // Store the transfer in our DB
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!user) throw new Error("Not authenticated")

    await supabase.from("funding_transfers").insert({
      user_id: user.id,
      alpaca_transfer_id: transfer.id,
      direction: "INCOMING",
      amount: transferAmount,
      status: transfer.status || "QUEUED",
      funding_account_id: rule.funding_account_id,
      triggered_by_rule_id: rule.id,
    })

    // Mark the rule as pending execution
    await supabase
      .from("investment_rules")
      .update({ pending_execution: true })
      .eq("id", rule.id)

    return {
      success: true,
      amount: transferAmount,
      transferId: transfer.id,
    }
  } catch (err: any) {
    console.error("Auto-fund error:", err)
    return {
      success: false,
      amount: 0,
      error: err.message || "Failed to initiate auto-fund transfer",
    }
  }
}