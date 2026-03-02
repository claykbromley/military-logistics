import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const BROKER_BASE = process.env.ALPACA_BASE_URL || "https://broker-api.sandbox.alpaca.markets"
const BROKER_KEY = process.env.ALPACA_API_KEY || ""
const BROKER_SECRET = process.env.ALPACA_SECRET_KEY || ""
const ALPACA_DATA_BASE = "https://data.alpaca.markets"

function isConfigured() {
  return BROKER_KEY.length > 0 && BROKER_SECRET.length > 0
}

function getAuthHeader() {
  return `Basic ${Buffer.from(`${BROKER_KEY}:${BROKER_SECRET}`).toString("base64")}`
}

async function brokerFetch(accountId: string, path: string, options: RequestInit = {}) {
  const res = await fetch(`${BROKER_BASE}/v1/trading/accounts/${accountId}${path}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Alpaca API error (${res.status}): ${text}`)
  }
  return res.json()
}

async function marketDataFetch(path: string) {
  // Market data API uses the same broker credentials
  const res = await fetch(`${ALPACA_DATA_BASE}${path}`, {
    headers: {
      Authorization: getAuthHeader(),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Alpaca Data API error (${res.status}): ${text}`)
  }
  return res.json()
}

// Execute a specific investment rule - checks price constraints and places order
export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Alpaca Broker API keys not configured" }, { status: 400 })
  }

  try {
    const { rule_id } = await request.json()
    const supabase = await createClient()

    // Get user's Alpaca account
    const { data: alpacaAccount } = await supabase
      .from("alpaca_accounts")
      .select("alpaca_account_id")
      .single()

    if (!alpacaAccount) {
      return NextResponse.json({ error: "No Alpaca account found" }, { status: 400 })
    }

    // Get the investment rule
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

    // Check price constraints if set
    if (rule.min_price || rule.max_price) {
      try {
        const latestTrade = await marketDataFetch(`/v2/stocks/${rule.symbol}/trades/latest`)
        const currentPrice = latestTrade.trade?.p || 0

        if (rule.min_price && currentPrice < Number(rule.min_price)) {
          return NextResponse.json({
            skipped: true,
            reason: `Current price $${currentPrice.toFixed(2)} is below min $${rule.min_price}`,
          })
        }
        if (rule.max_price && currentPrice > Number(rule.max_price)) {
          return NextResponse.json({
            skipped: true,
            reason: `Current price $${currentPrice.toFixed(2)} is above max $${rule.max_price}`,
          })
        }
      } catch (priceError) {
        // If we can't get price, proceed with order anyway (market order)
        console.warn("Could not fetch current price:", priceError)
      }
    }

    // Place the order via Broker API
    const orderPayload: Record<string, unknown> = {
      symbol: rule.symbol,
      side: "buy",
      type: "market",
      time_in_force: "day",
    }

    if (rule.type === "amount") {
      orderPayload.notional = Number(rule.value)
    } else {
      orderPayload.qty = Number(rule.value)
    }

    const order = await brokerFetch(alpacaAccount.alpaca_account_id, "/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    })

    // Update last_executed_at
    await supabase
      .from("investment_rules")
      .update({ last_executed_at: new Date().toISOString() })
      .eq("id", rule_id)

    return NextResponse.json({ success: true, order })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to execute rule"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
