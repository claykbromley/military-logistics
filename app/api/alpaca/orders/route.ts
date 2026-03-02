import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const BROKER_BASE = process.env.ALPACA_BASE_URL || "https://broker-api.sandbox.alpaca.markets"
const BROKER_KEY = process.env.ALPACA_API_KEY || ""
const BROKER_SECRET = process.env.ALPACA_SECRET_KEY || ""

function isConfigured() {
  return BROKER_KEY.length > 0 && BROKER_SECRET.length > 0
}

function getAuthHeader() {
  return `Basic ${Buffer.from(`${BROKER_KEY}:${BROKER_SECRET}`).toString("base64")}`
}

async function getAlpacaAccountId() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("alpaca_accounts")
    .select("alpaca_account_id")
    .single()
  return data?.alpaca_account_id
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

// GET recent orders
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ not_configured: true })
  }

  try {
    const accountId = await getAlpacaAccountId()
    if (!accountId) {
      return NextResponse.json({ no_account: true })
    }

    const orders = await brokerFetch(accountId, "/orders?status=all&limit=20&direction=desc")
    return NextResponse.json(orders)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST a new order
export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Alpaca Broker API not configured" }, { status: 400 })
  }

  try {
    const accountId = await getAlpacaAccountId()
    if (!accountId) {
      return NextResponse.json({ error: "No Alpaca account found" }, { status: 400 })
    }

    const body = await request.json()
    const { symbol, type, value, side = "buy", time_in_force = "day", limit_price } = body

    const orderPayload: Record<string, unknown> = {
      symbol,
      side,
      type: limit_price ? "limit" : "market",
      time_in_force,
    }

    if (limit_price) {
      orderPayload.limit_price = limit_price
    }

    // "amount" type = notional (dollar amount), "shares" type = qty
    if (type === "amount") {
      orderPayload.notional = value
    } else {
      orderPayload.qty = value
    }

    const order = await brokerFetch(accountId, "/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    })

    return NextResponse.json(order)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to place order"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
