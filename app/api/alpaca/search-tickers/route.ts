import { NextRequest, NextResponse } from "next/server"
import { isConfigured, getAuthHeader } from "@/lib/broker"

const BROKER_BASE =
  process.env.ALPACA_BASE_URL ||
  "https://broker-api.sandbox.alpaca.markets"

/**
 * GET /api/alpaca/search-tickers?q=...
 *
 * Searches Alpaca's assets endpoint for matching symbols/names.
 * The frontend TickerSearchInput component calls this.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toUpperCase()

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] })
  }

  if (!isConfigured()) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Alpaca Broker API: GET /v1/assets with status=active
    // We fetch a broad set and filter client-side for flexibility
    const res = await fetch(
      `${BROKER_BASE}/v1/assets?status=active&asset_class=us_equity`,
      { headers: { Authorization: getAuthHeader() } }
    )

    if (!res.ok) {
      // Fallback: try the query as an exact symbol lookup
      const singleRes = await fetch(
        `${BROKER_BASE}/v1/assets/${q}`,
        { headers: { Authorization: getAuthHeader() } }
      )
      if (singleRes.ok) {
        const asset = await singleRes.json()
        if (asset.tradable) {
          return NextResponse.json({
            results: [
              {
                symbol: asset.symbol,
                name: asset.name,
                exchange: asset.exchange,
                type: asset.class || "us_equity",
              },
            ],
          })
        }
      }
      return NextResponse.json({ results: [] })
    }

    const assets: Array<{
      symbol: string
      name: string
      exchange: string
      class: string
      tradable: boolean
      status: string
    }> = await res.json()

    // Filter: symbol starts with query OR name contains query
    const matches = assets
      .filter(
        (a) =>
          a.tradable &&
          (a.symbol.startsWith(q) ||
            a.name.toUpperCase().includes(q))
      )
      .slice(0, 15)
      .map((a) => ({
        symbol: a.symbol,
        name: a.name,
        exchange: a.exchange,
        type: a.class || "us_equity",
      }))

    // Sort: exact symbol match first, then symbols starting with query, then name matches
    matches.sort((a, b) => {
      if (a.symbol === q) return -1
      if (b.symbol === q) return 1
      const aStarts = a.symbol.startsWith(q) ? 0 : 1
      const bStarts = b.symbol.startsWith(q) ? 0 : 1
      if (aStarts !== bStarts) return aStarts - bStarts
      return a.symbol.localeCompare(b.symbol)
    })

    return NextResponse.json({ results: matches.slice(0, 10) })
  } catch (err) {
    console.error("Ticker search error:", err)
    return NextResponse.json({ results: [] })
  }
}