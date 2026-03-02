import { NextRequest, NextResponse } from "next/server"

const ALPACA_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET = process.env.ALPACA_SECRET_KEY

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 })
  }

  if (!ALPACA_KEY || !ALPACA_SECRET) {
    return NextResponse.json({ error: "Alpaca not configured" }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol.toUpperCase()}/snapshot`,
      {
        headers: {
          "APCA-API-KEY-ID": ALPACA_KEY,
          "APCA-API-SECRET-KEY": ALPACA_SECRET,
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const data = await res.json()

    const latestPrice = data.latestTrade?.p ?? data.minuteBar?.c ?? null
    const prevClose = data.prevDailyBar?.c ?? null

    let change = null
    let changePercent = null

    if (latestPrice != null && prevClose != null && prevClose > 0) {
      change = latestPrice - prevClose
      changePercent = (change / prevClose) * 100
    }

    return NextResponse.json({
      price: latestPrice,
      change,
      changePercent,
      high: data.dailyBar?.h ?? null,
      low: data.dailyBar?.l ?? null,
      volume: data.dailyBar?.v ?? null,
    })
  } catch (err) {
    console.error("Quote fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 })
  }
}