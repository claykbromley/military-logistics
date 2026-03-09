/**
 * Shared Alpaca Broker API helpers.
 *
 * All routes that talk to Alpaca should import from here so auth logic
 * lives in one place.  The Broker API uses Basic auth with your broker
 * key/secret – this is *different* from the Trading API key headers
 * (APCA-API-KEY-ID / APCA-API-SECRET-KEY) that individual end-users use.
 *
 * Broker API docs: https://docs.alpaca.markets/reference/
 */

const BROKER_BASE =
  process.env.ALPACA_BASE_URL ||
  "https://broker-api.sandbox.alpaca.markets"

const BROKER_KEY = process.env.ALPACA_API_KEY || ""
const BROKER_SECRET = process.env.ALPACA_SECRET_KEY || ""

const ALPACA_DATA_BASE =
  process.env.ALPACA_DATA_URL || "https://data.sandbox.alpaca.markets"

// ── Guards ──────────────────────────────────────────────────────────────────────

export function isConfigured(): boolean {
  return BROKER_KEY.length > 0 && BROKER_SECRET.length > 0
}

export function getAuthHeader(): string {
  return `Basic ${Buffer.from(`${BROKER_KEY}:${BROKER_SECRET}`).toString("base64")}`
}

export function notConfiguredResponse() {
  const { NextResponse } = require("next/server")
  return NextResponse.json({
    not_configured: true,
    message:
      "Alpaca Broker API keys not set. Add ALPACA_API_KEY and ALPACA_SECRET_KEY in env vars.",
  })
}

// ── Generic fetch wrappers ──────────────────────────────────────────────────────

/** Call a Broker-level endpoint (not scoped to an account). */
export async function brokerFetchGlobal(
  path: string,
  options: RequestInit = {}
) {
  const url = `${BROKER_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Alpaca API error (${res.status}): ${text}`)
  }
  return res.json()
}

/** Call a Trading endpoint scoped to a specific account. */
export async function brokerTradingFetch(
  accountId: string,
  path: string,
  options: RequestInit = {}
) {
  const url = `${BROKER_BASE}/v1/trading/accounts/${accountId}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Alpaca API error (${res.status}): ${text}`)
  }
  return res.json()
}

/** Call the Alpaca Market Data API (quotes, bars, trades). */
export async function marketDataFetch(path: string) {
  const res = await fetch(`${ALPACA_DATA_BASE}${path}`, {
    headers: { Authorization: getAuthHeader() },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Alpaca Data API error (${res.status}): ${text}`)
  }
  return res.json()
}

// ── Supabase shorthand ──────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/server"

/** Returns the current user's Alpaca account ID from our DB, or null. */
export async function getAlpacaAccountId(): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("alpaca_accounts")
    .select("alpaca_account_id")
    .single()
  return data?.alpaca_account_id ?? null
}

/** Returns the current user's Alpaca account row, or null. */
export async function getAlpacaAccountRow() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("alpaca_accounts")
    .select("*")
    .single()
  return data
}

/** Returns the authenticated user or throws. */
export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Unauthorized")
  return { user, supabase }
}