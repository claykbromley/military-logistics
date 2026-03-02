// app/api/alpaca/sell/route.ts
// API route to sell shares via Alpaca Markets

import { NextRequest, NextResponse } from "next/server"

// Replace with your actual Alpaca credential retrieval
const ALPACA_API_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY
const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets" // paper by default

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { symbol, qty, order_type, limit_price } = body

    if (!symbol || !qty) {
      return NextResponse.json(
        { error: "Missing required fields: symbol and qty" },
        { status: 400 }
      )
    }

    if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
      return NextResponse.json(
        { error: "Alpaca API credentials not configured" },
        { status: 500 }
      )
    }

    // Build the order payload
    const orderPayload: Record<string, any> = {
      symbol: symbol.toUpperCase(),
      qty: String(qty),
      side: "sell",
      type: order_type === "limit" ? "limit" : "market",
      time_in_force: order_type === "limit" ? "gtc" : "day", // GTC for limit, day for market
    }

    // Add limit price if limit order
    if (order_type === "limit" && limit_price) {
      orderPayload.limit_price = String(limit_price)
    }

    const response = await fetch(`${ALPACA_BASE_URL}/v2/orders`, {
      method: "POST",
      headers: {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to place sell order" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      order_id: data.id,
      symbol: data.symbol,
      qty: data.qty,
      side: data.side,
      type: data.type,
      status: data.status,
      limit_price: data.limit_price,
      filled_at: data.filled_at,
    })
  } catch (error: any) {
    console.error("Sell order error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}