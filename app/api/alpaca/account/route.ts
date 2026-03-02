import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Alpaca Broker API
const BROKER_BASE = process.env.ALPACA_BASE_URL || "https://broker-api.sandbox.alpaca.markets"
const BROKER_KEY = process.env.ALPACA_API_KEY || ""
const BROKER_SECRET = process.env.ALPACA_SECRET_KEY || ""

function isConfigured() {
  return BROKER_KEY.length > 0 && BROKER_SECRET.length > 0
}

function getAuthHeader() {
  return `Basic ${Buffer.from(`${BROKER_KEY}:${BROKER_SECRET}`).toString("base64")}`
}

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({
      not_configured: true,
      message: "Alpaca Broker API keys not set. Add ALPACA_BROKER_API_KEY and ALPACA_BROKER_API_SECRET in the Vars sidebar.",
    })
  }

  try {
    const supabase = await createClient()

    // Get user's Alpaca account ID
    const { data: alpacaAccount, error: dbError } = await supabase
      .from("alpaca_accounts")
      .select("alpaca_account_id, status")
      .single()

    if (dbError || !alpacaAccount) {
      return NextResponse.json({ no_account: true, message: "No Alpaca account found. Connect a bank to create one." })
    }

    // Fetch account details from Alpaca Broker API
    const res = await fetch(`${BROKER_BASE}/v1/trading/accounts/${alpacaAccount.alpaca_account_id}/account`, {
      headers: {
        Authorization: getAuthHeader(),
      },
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Alpaca API error (${res.status}): ${text}`)
    }

    const account = await res.json()
    return NextResponse.json({
      ...account,
      alpaca_account_id: alpacaAccount.alpaca_account_id,
      db_status: alpacaAccount.status,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch Alpaca account"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
