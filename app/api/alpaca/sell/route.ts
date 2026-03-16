import { NextResponse } from "next/server"
import {
  isConfigured,
  brokerTradingFetch,
  getAlpacaAccountId,
} from "@/lib/broker"

/**
 * POST /api/alpaca/sell
 *
 * Places a sell order. Body: { symbol, qty, order_type?, limit_price? }
 *
 * The frontend SellSharesModal calls this endpoint.
 */
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
    const { symbol, qty, order_type = "market", limit_price } = body

    if (!symbol || !qty || qty <= 0) {
      return NextResponse.json(
        { error: "symbol and qty are required" },
        { status: 400 }
      )
    }

    const orderPayload: Record<string, unknown> = {
      symbol,
      side: "sell",
      type: order_type === "limit" ? "limit" : "market",
      time_in_force: "day",
      qty: String(qty),
    }

    if (order_type === "limit" && limit_price) {
      orderPayload.limit_price = String(limit_price)
    }

    const order = await brokerTradingFetch(accountId, "/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    })

    return NextResponse.json({
      success: true,
      order_id: order.id,
      status: order.status,
      symbol: order.symbol,
      qty: order.qty,
      side: order.side,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to place sell order"
    console.error("POST /api/alpaca/sell error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}