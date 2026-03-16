import { NextResponse } from "next/server"
import {
  isConfigured,
  notConfiguredResponse,
  brokerTradingFetch,
  getAlpacaAccountRow,
} from "@/lib/broker"

/**
 * GET /api/alpaca/account
 *
 * Returns the user's Alpaca trading account details (cash, portfolio value,
 * buying power, etc.).
 *
 * Response shapes the frontend expects:
 *  - { not_configured: true }          → Alpaca keys missing
 *  - { not_configured: true }          → No DB row (treat same as above)
 *  - { cash, portfolio_value, ... }    → Success (AlpacaAccount type)
 */
export async function GET() {
  if (!isConfigured()) return notConfiguredResponse()

  try {
    const row = await getAlpacaAccountRow()

    if (!row) {
      // Frontend checks for `not_configured` to know there's no account yet
      return NextResponse.json({ not_configured: true })
    }

    // Fetch live account data from Alpaca Broker API
    const account = await brokerTradingFetch(
      row.alpaca_account_id,
      "/account"
    )

    return NextResponse.json({
      ...account,
      alpaca_account_id: row.alpaca_account_id,
      db_status: row.status,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch Alpaca account"
    console.error("GET /api/alpaca/account error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}