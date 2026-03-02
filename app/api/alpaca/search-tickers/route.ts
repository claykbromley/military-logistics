import { NextRequest, NextResponse } from "next/server"

// Alpaca asset search endpoint
// Docs: https://docs.alpaca.markets/reference/get-v2-assets
const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets"
const ALPACA_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET = process.env.ALPACA_SECRET_KEY

// Known ETF keywords / suffixes in asset names — Alpaca doesn't expose a
// dedicated "etf" flag, so we infer from the name and exchange.
const ETF_KEYWORDS = [
  "etf", "fund", "trust", "index", "ishares", "vanguard", "spdr",
  "proshares", "invesco", "schwab", "wisdomtree", "vaneck",
]

function inferAssetType(asset: { name: string; exchange: string; class?: string }): string {
  if (asset.class && asset.class !== "us_equity") return asset.class
  const nameLower = asset.name.toLowerCase()
  if (ETF_KEYWORDS.some((kw) => nameLower.includes(kw))) return "etf"
  if (asset.exchange === "ARCA" || asset.exchange === "BATS") return "etf"
  return "stock"
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q) return NextResponse.json({ results: [] })

  if (!ALPACA_KEY || !ALPACA_SECRET) {
    return NextResponse.json({ results: [], error: "Alpaca not configured" }, { status: 200 })
  }

  try {
    // Search Alpaca assets — the API doesn't have a dedicated search endpoint,
    // so we fetch all tradable US equities filtered client-side, or use the
    // assets endpoint with a symbol prefix.  For a better UX you could use a
    // third-party API like Alpha Vantage SYMBOL_SEARCH or Finnhub /search.

    // Option 1: Direct symbol lookup (fast, exact)
    const directRes = await fetch(`${ALPACA_BASE_URL}/v2/assets/${q.toUpperCase()}`, {
      headers: {
        "APCA-API-KEY-ID": ALPACA_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET,
      },
    })

    const results: Array<{
      symbol: string
      name: string
      exchange: string
      type: string
      price?: number
    }> = []

    if (directRes.ok) {
      const asset = await directRes.json()
      if (asset.tradable && asset.status === "active") {
        results.push({
          symbol: asset.symbol,
          name: asset.name,
          exchange: asset.exchange,
          type: inferAssetType(asset),
        })
      }
    }

    // Option 2: Fuzzy search via assets list (searches name & symbol)
    // This fetches tradable assets that match. For production, cache this list.
    const listRes = await fetch(
      `${ALPACA_BASE_URL}/v2/assets?status=active&asset_class=us_equity`,
      {
        headers: {
          "APCA-API-KEY-ID": ALPACA_KEY,
          "APCA-API-SECRET-KEY": ALPACA_SECRET,
        },
      }
    )

    if (listRes.ok) {
      const allAssets: Array<{
        symbol: string
        name: string
        exchange: string
        class: string
        tradable: boolean
        fractionable: boolean
      }> = await listRes.json()

      const query = q.toUpperCase()
      const matches = allAssets
        .filter(
          (a) =>
            a.tradable &&
            (a.symbol.startsWith(query) || a.name.toUpperCase().includes(query))
        )
        // Prioritize exact symbol prefix matches
        .sort((a, b) => {
          const aExact = a.symbol === query ? 0 : a.symbol.startsWith(query) ? 1 : 2
          const bExact = b.symbol === query ? 0 : b.symbol.startsWith(query) ? 1 : 2
          return aExact - bExact
        })
        .slice(0, 10)

      for (const asset of matches) {
        if (!results.find((r) => r.symbol === asset.symbol)) {
          results.push({
            symbol: asset.symbol,
            name: asset.name,
            exchange: asset.exchange,
            type: inferAssetType(asset),
          })
        }
      }
    }

    // Optionally fetch latest prices for the top results
    if (results.length > 0) {
      try {
        const symbols = results.slice(0, 5).map((r) => r.symbol).join(",")
        const quoteRes = await fetch(
          `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols}`,
          {
            headers: {
              "APCA-API-KEY-ID": ALPACA_KEY,
              "APCA-API-SECRET-KEY": ALPACA_SECRET,
            },
          }
        )
        if (quoteRes.ok) {
          const snapshots = await quoteRes.json()
          for (const r of results) {
            const snap = snapshots[r.symbol]
            if (snap?.latestTrade?.p) {
              r.price = snap.latestTrade.p
            }
          }
        }
      } catch {
        // Price fetch is optional, continue without
      }
    }

    return NextResponse.json({ results: results.slice(0, 10) })
  } catch (err) {
    console.error("Ticker search error:", err)
    return NextResponse.json({ results: [] })
  }
}