import { NextResponse } from "next/server"
import { isConfigured, brokerFetchGlobal } from "@/lib/broker"

/**
 * GET /api/alpaca/clock
 *
 * Returns market open/close status. The Broker API exposes the clock at
 * /v1/clock (NOT under /v1/trading/accounts/{id}).
 */
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Alpaca not configured" }, { status: 500 })
  }

  try {
    const data = await brokerFetchGlobal("/v1/clock")

    return NextResponse.json({
      is_open: data.is_open,
      next_open: data.next_open,
      next_close: data.next_close,
      timestamp: data.timestamp,
    })
  } catch (err) {
    console.error("Clock fetch error:", err)
    return NextResponse.json(
      { error: "Failed to fetch market clock" },
      { status: 500 }
    )
  }
}