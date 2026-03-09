import { NextRequest, NextResponse } from "next/server"
import { isConfigured, marketDataFetch } from "@/lib/broker"

/**
 * GET /api/alpaca/quote/AAPL
 *
 * Returns the latest trade price and daily change for a symbol.
 * The useStockPrice hook in the frontend polls this.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 })
  }

  if (!isConfigured()) {
    return NextResponse.json({ error: "Alpaca not configured" }, { status: 500 })
  }

  try {
    // Get latest trade
    const tradeData = await marketDataFetch(
      `/v2/stocks/${symbol.toUpperCase()}/trades/latest`
    )
    const price = tradeData.trade?.p ?? 0

    // Try to get previous close for change calculation
    let change = 0
    let changePercent = 0

    try {
      const snapshotData = await marketDataFetch(
        `/v2/stocks/${symbol.toUpperCase()}/snapshot`
      )
      const prevClose = snapshotData.prevDailyBar?.c ?? price
      change = price - prevClose
      changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0
    } catch {
      // Snapshot not available for all symbols; just return price
    }

    return NextResponse.json({ price, change, changePercent })
  } catch (err) {
    console.error(`Quote error for ${symbol}:`, err)
    return NextResponse.json(
      { error: `Failed to fetch quote for ${symbol}` },
      { status: 500 }
    )
  }
}