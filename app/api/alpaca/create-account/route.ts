import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const BROKER_BASE =
  process.env.ALPACA_BASE_URL ||
  "https://broker-api.sandbox.alpaca.markets"

const BROKER_KEY = process.env.ALPACA_API_KEY || ""
const BROKER_SECRET = process.env.ALPACA_SECRET_KEY || ""

function isConfigured(): boolean {
  return BROKER_KEY.length > 0 && BROKER_SECRET.length > 0
}

function getAuthHeader(): string {
  return `Basic ${Buffer.from(`${BROKER_KEY}:${BROKER_SECRET}`).toString("base64")}`
}

// ── POST: Create Alpaca brokerage account ───────────────────────────────────

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({
      error: "Alpaca Broker API keys not configured. Set ALPACA_API_KEY and ALPACA_SECRET_KEY.",
      debug: { broker_base: BROKER_BASE, has_key: BROKER_KEY.length > 0, has_secret: BROKER_SECRET.length > 0 },
    }, { status: 400 })
  }

  let kycData: any
  try {
    kycData = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // ── Auth ──────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ── Check for existing DB row ────────────────────────────────────
  const { data: existingAccount } = await supabase
    .from("alpaca_accounts")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (existingAccount) {
    return NextResponse.json({
      success: true,
      alpaca_account_id: existingAccount.alpaca_account_id,
      status: existingAccount.status,
      message: "Alpaca account already exists",
    })
  }

  // ── Validate & sanitize inputs ───────────────────────────────────
  const given_name = (kycData.given_name || "").trim()
  const family_name = (kycData.family_name || "").trim()
  const email = (kycData.email || "").trim()
  const dob = (kycData.date_of_birth || "").trim()
  const street = (kycData.street_address || "").trim()
  const city = (kycData.city || "").trim()
  const state = (kycData.state || "").trim().toUpperCase()
  const postal = (kycData.postal_code || "").trim()
  const country = (kycData.country || "USA").trim()

  // SSN: strip everything non-numeric, must be 9 digits
  const taxId = (kycData.tax_id || "").replace(/\D/g, "")

  // Phone: strip non-numeric, ensure +1 prefix
  let phone = (kycData.phone || "").replace(/\D/g, "")
  if (phone.length === 10) phone = `+1${phone}`
  else if (phone.length === 11 && phone.startsWith("1")) phone = `+${phone}`
  else phone = `+1${phone}`

  // Quick validation
  const missing: string[] = []
  if (!given_name) missing.push("first name")
  if (!family_name) missing.push("last name")
  if (!email) missing.push("email")
  if (!dob) missing.push("date of birth")
  if (taxId.length !== 9) missing.push("SSN (must be 9 digits)")
  if (!street) missing.push("street address")
  if (!city) missing.push("city")
  if (state.length !== 2) missing.push("state (2-letter code)")
  if (!postal) missing.push("zip code")

  if (missing.length > 0) {
    return NextResponse.json({
      error: `Invalid or missing fields: ${missing.join(", ")}`,
      debug: { taxId_length: taxId.length, phone, state, dob },
    }, { status: 400 })
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return NextResponse.json({
      error: `Date of birth must be YYYY-MM-DD format. Received: "${dob}"`,
    }, { status: 400 })
  }

  // ── Build Alpaca payload ─────────────────────────────────────────
  const accountPayload = {
    contact: {
      email_address: email,
      phone_number: phone,
      street_address: [street],
      city,
      state,
      postal_code: postal,
      country,
    },
    identity: {
      given_name,
      family_name,
      date_of_birth: dob,
      tax_id: taxId,
      tax_id_type: "USA_SSN",
      country_of_citizenship: country,
      country_of_birth: country,
      country_of_tax_residence: country,
      funding_source: ["employment_income"],
    },
    disclosures: {
      is_control_person: false,
      is_affiliated_exchange_or_finra: false,
      is_politically_exposed: false,
      immediate_family_exposed: false,
    },
    agreements: [
      { agreement: "customer_agreement", signed_at: new Date().toISOString(), ip_address: "0.0.0.0" },
      { agreement: "margin_agreement", signed_at: new Date().toISOString(), ip_address: "0.0.0.0" },
      { agreement: "account_agreement", signed_at: new Date().toISOString(), ip_address: "0.0.0.0" },
    ],
    enabled_assets: ["us_equity"],
  }

  const url = `${BROKER_BASE}/v1/accounts`

  // ── Call Alpaca Broker API ───────────────────────────────────────
  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountPayload),
      signal: AbortSignal.timeout(30_000),
    })
  } catch (fetchError: any) {
    // Network-level failure: DNS, TLS, timeout, wrong host
    const cause = fetchError.cause?.message || fetchError.message || "Unknown network error"
    console.error(`[create-account] fetch() failed for ${url}:`, cause)

    return NextResponse.json({
      error: `Network error connecting to Alpaca Broker API.`,
      detail: cause,
      debug: {
        url,
        broker_base: BROKER_BASE,
        is_broker_url: BROKER_BASE.includes("broker-api"),
        hint: !BROKER_BASE.includes("broker-api")
          ? "ALPACA_BASE_URL does not point to the Broker API. Set ALPACA_BROKER_BASE_URL=https://broker-api.sandbox.alpaca.markets"
          : "Check that your Broker API key/secret are valid.",
      },
    }, { status: 502 })
  }

  // ── Handle error responses from Alpaca ───────────────────────────
  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[create-account] Alpaca ${response.status}: ${errorText}`)

    // Try to parse Alpaca's error JSON
    let alpacaError: any = null
    try { alpacaError = JSON.parse(errorText) } catch {}

    // Duplicate account — try to recover
    const isDuplicate =
      response.status === 409 ||
      errorText.includes("already exists") ||
      errorText.includes("40910000") ||
      errorText.includes("DUPLICATE")

    if (isDuplicate) {
      return await recoverExistingAccount(supabase, user.id, kycData, taxId, email)
    }

    // Return full error details so the frontend can display them
    return NextResponse.json({
      error: alpacaError?.message || `Alpaca API error (${response.status})`,
      alpaca_status: response.status,
      alpaca_error: alpacaError || errorText,
      debug: {
        url,
        payload_preview: {
          email: accountPayload.contact.email_address,
          phone: accountPayload.contact.phone_number,
          state: accountPayload.contact.state,
          dob: accountPayload.identity.date_of_birth,
          tax_id_length: accountPayload.identity.tax_id.length,
          country: accountPayload.contact.country,
        },
      },
    }, { status: response.status })
  }

  // ── Success — store in Supabase ─────────────────────────────────
  const alpacaAccount = await response.json()

  const { error: insertError } = await supabase
    .from("alpaca_accounts")
    .insert({
      user_id: user.id,
      alpaca_account_id: alpacaAccount.id,
      account_number: alpacaAccount.account_number,
      status: alpacaAccount.status,
      given_name,
      family_name,
      email,
      phone,
      date_of_birth: dob,
      tax_id_last_four: taxId.slice(-4),
      street_address: street,
      city,
      state,
      postal_code: postal,
      country,
    })

  if (insertError) {
    console.error("[create-account] DB insert failed:", insertError)
    // Account was created on Alpaca — return success anyway but flag the DB issue
    return NextResponse.json({
      success: true,
      alpaca_account_id: alpacaAccount.id,
      account_number: alpacaAccount.account_number,
      status: alpacaAccount.status,
      warning: `Account created but DB insert failed: ${insertError.message}. The account will be recovered on next attempt.`,
    })
  }

  return NextResponse.json({
    success: true,
    alpaca_account_id: alpacaAccount.id,
    account_number: alpacaAccount.account_number,
    status: alpacaAccount.status,
  })
}

// ── Recovery: find existing Alpaca account and store it ─────────────────────

async function recoverExistingAccount(
  supabase: any,
  userId: string,
  kycData: any,
  taxId: string,
  email: string,
) {
  console.log("[create-account] Duplicate detected — attempting recovery...")

  try {
    const searchRes = await fetch(
      `${BROKER_BASE}/v1/accounts?query=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: getAuthHeader() },
        signal: AbortSignal.timeout(15_000),
      }
    )

    if (!searchRes.ok) {
      const searchErr = await searchRes.text()
      console.error("[create-account] Recovery search failed:", searchErr)
      return NextResponse.json({
        error: "An Alpaca account already exists for this identity. Recovery search failed.",
        detail: searchErr,
        hint: "You may need to delete the account from Alpaca's dashboard first, or use different KYC details for sandbox testing.",
      }, { status: 409 })
    }

    const accounts = await searchRes.json()
    const matched = Array.isArray(accounts) ? accounts[0] : accounts

    if (!matched?.id) {
      return NextResponse.json({
        error: "An Alpaca account already exists for this identity but could not be found via search.",
        hint: "Try using a different email/SSN for sandbox testing, or delete the account from Alpaca's broker dashboard.",
      }, { status: 409 })
    }

    // Store in our DB
    const { error: upsertError } = await supabase
      .from("alpaca_accounts")
      .upsert({
        user_id: userId,
        alpaca_account_id: matched.id,
        account_number: matched.account_number || null,
        status: matched.status || "ACTIVE",
        given_name: kycData.given_name || "",
        family_name: kycData.family_name || "",
        email: email,
        phone: kycData.phone || "",
        date_of_birth: kycData.date_of_birth || "",
        tax_id_last_four: taxId.slice(-4),
        street_address: kycData.street_address || "",
        city: kycData.city || "",
        state: kycData.state || "",
        postal_code: kycData.postal_code || "",
        country: kycData.country || "USA",
      }, { onConflict: "user_id" })

    if (upsertError) {
      console.error("[create-account] Recovery DB upsert failed:", upsertError)
      return NextResponse.json({
        error: `Found existing Alpaca account (${matched.id}) but failed to save to database: ${upsertError.message}`,
        alpaca_account_id: matched.id,
      }, { status: 500 })
    }

    console.log(`[create-account] Recovered account ${matched.id}`)
    return NextResponse.json({
      success: true,
      recovered: true,
      alpaca_account_id: matched.id,
      account_number: matched.account_number,
      status: matched.status,
      message: "Found and linked your existing Alpaca account.",
    })
  } catch (err: any) {
    console.error("[create-account] Recovery failed:", err)
    return NextResponse.json({
      error: "An Alpaca account already exists. Automatic recovery failed.",
      detail: err.message,
    }, { status: 409 })
  }
}

// ── GET: Check if user has an Alpaca account ────────────────────────────────

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ has_account: false })

    const { data: account, error } = await supabase
      .from("alpaca_accounts")
      .select("alpaca_account_id, account_number, status")
      .eq("user_id", user.id)
      .single()

    if (error || !account) return NextResponse.json({ has_account: false })

    return NextResponse.json({
      has_account: true,
      alpaca_account_id: account.alpaca_account_id,
      account_number: account.account_number,
      status: account.status,
    })
  } catch {
    return NextResponse.json({ has_account: false })
  }
}

// ── DELETE: Reset local Alpaca account link ─────────────────────────────────
//
// Removes the alpaca_accounts row from YOUR database so you can retry
// account creation. Does NOT delete the account on Alpaca's side.
//
// Call from browser console:
//   fetch('/api/alpaca/create-account', { method: 'DELETE' }).then(r => r.json()).then(console.log)

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Delete alpaca account row
    const { error: delError } = await supabase
      .from("alpaca_accounts")
      .delete()
      .eq("user_id", user.id)

    if (delError) {
      return NextResponse.json({
        error: `Delete failed: ${delError.message}`,
        hint: "This might be an RLS policy issue. Try running: DELETE FROM alpaca_accounts WHERE user_id = 'your-id'; in the Supabase SQL editor.",
      }, { status: 500 })
    }

    // Best-effort cleanup of related data
    try {
      await supabase.from("ach_relationships").delete().eq("user_id", user.id)
    } catch {}
    try {
      await supabase.from("funding_transfers").delete().eq("user_id", user.id)
    } catch {}
    try {
      await supabase
        .from("investment_rules")
        .update({ funding_account_id: null, auto_fund: false, pending_execution: false })
        .eq("user_id", user.id)
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Alpaca account unlinked from database. You can retry account creation.",
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || "Delete failed",
    }, { status: 500 })
  }
}