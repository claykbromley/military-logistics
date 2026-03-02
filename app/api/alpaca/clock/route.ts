import { NextRequest, NextResponse } from "next/server"

const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || "https://broker-api.sandbox.alpaca.markets"
const ALPACA_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET = process.env.ALPACA_SECRET_KEY

export async function GET(_req: NextRequest) {
  if (!ALPACA_KEY || !ALPACA_SECRET) {
    return NextResponse.json({ error: "Alpaca not configured" }, { status: 500 })
  }

  try {
    const credentials = Buffer.from(`${ALPACA_KEY}:${ALPACA_SECRET}`).toString("base64")

    const res = await fetch(`${ALPACA_BASE_URL}/v1/clock`, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch market clock" }, { status: res.status })
    }

    const data = await res.json()

    return NextResponse.json({
      is_open: data.is_open,
      next_open: data.next_open,
      next_close: data.next_close,
      timestamp: data.timestamp,
    })
  } catch (err) {
    console.error("Clock fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch market clock" }, { status: 500 })
  }
}