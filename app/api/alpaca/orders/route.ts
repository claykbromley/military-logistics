import { NextResponse } from "next/server"
import {
  isConfigured,
  notConfiguredResponse,
  brokerTradingFetch,
  getAlpacaAccountId,
} from "@/lib/broker"

/**
 * GET /api/alpaca/orders
 * Returns recent orders.
 *
 * POST /api/alpaca/orders
 * Places a new order.  Body: { symbol, type, value, side?, time_in_force?, limit_price? }
 */

export async function GET() {
  if (!isConfigured()) return notConfiguredResponse()

  try {
    const accountId = await getAlpacaAccountId()
    if (!accountId) return NextResponse.json({ not_configured: true })

    const orders = await brokerTradingFetch(
      accountId,
      "/orders?status=all&limit=20&direction=desc"
    )
    return NextResponse.json(orders)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Alpaca Broker API not configured" },
      { status: 400 }
    )
  }

  try {
    const accountId = await getAlpacaAccountId()
    if (!accountId) {
      return NextResponse.json(
        { error: "No Alpaca account found" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      symbol,
      type,
      value,
      side = "buy",
      time_in_force = "day",
      limit_price,
    } = body

    const orderPayload: Record<string, unknown> = {
      symbol,
      side,
      type: limit_price ? "limit" : "market",
      time_in_force,
    }

    if (limit_price) orderPayload.limit_price = limit_price

    // "amount" type → notional (dollar amount), "shares" type → qty
    if (type === "amount") {
      orderPayload.notional = value
    } else {
      orderPayload.qty = value
    }

    const order = await brokerTradingFetch(accountId, "/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    })

    return NextResponse.json(order)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to place order"

    // Surface insufficient-buying-power errors cleanly
    if (message.includes("insufficient")) {
      return NextResponse.json(
        { error: message, insufficient_funds: true },
        { status: 422 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}