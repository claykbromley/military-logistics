import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    return NextResponse.json({ not_configured: true })
  }

  try {
    const supabase = await createClient()

    const { data: alpacaAccount } = await supabase
      .from("alpaca_accounts")
      .select("alpaca_account_id")
      .single()

    if (!alpacaAccount) {
      return NextResponse.json({ no_account: true })
    }

    const res = await fetch(
      `${BROKER_BASE}/v1/trading/accounts/${alpacaAccount.alpaca_account_id}/positions`,
      {
        headers: { Authorization: getAuthHeader() },
      }
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Alpaca API error (${res.status}): ${text}`)
    }

    return NextResponse.json(await res.json())
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch positions"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
