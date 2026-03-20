import { NextResponse } from "next/server"
import {
  isConfigured,
  notConfiguredResponse,
  brokerTradingFetch,
  getAlpacaAccountId,
} from "@/lib/broker"

/**
 * GET /api/alpaca/positions
 *
 * Returns all open positions for the user's Alpaca account.
 * Frontend expects an array of AlpacaPosition objects, or { not_configured }.
 */
export async function GET() {
  if (!isConfigured()) return notConfiguredResponse()

  try {
    const accountId = await getAlpacaAccountId()
    if (!accountId) {
      return NextResponse.json({ not_configured: true })
    }

    const positions = await brokerTradingFetch(accountId, "/positions")
    return NextResponse.json(positions)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch positions"
    console.error("GET /api/alpaca/positions error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}