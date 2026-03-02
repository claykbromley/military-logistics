import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Alpaca Broker API (different from Trading API)
const BROKER_BASE = process.env.ALPACA_BASE_URL || "https://broker-api.sandbox.alpaca.markets"
const BROKER_KEY = process.env.ALPACA_API_KEY || ""
const BROKER_SECRET = process.env.ALPACA_SECRET_KEY || ""

interface KYCData {
  given_name: string
  family_name: string
  email: string
  phone: string
  date_of_birth: string // YYYY-MM-DD
  tax_id: string // SSN for US
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
}

export async function POST(request: Request) {
  if (!BROKER_KEY || !BROKER_SECRET) {
    return NextResponse.json(
      { error: "Alpaca Broker API keys not configured. Add ALPACA_BROKER_API_KEY and ALPACA_BROKER_API_SECRET." },
      { status: 400 }
    )
  }

  try {
    const kycData: KYCData = await request.json()
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser();

    // Check if user already has an Alpaca account
    const { data: existingAccount } = await supabase
      .from("alpaca_accounts")
      .select("*")
      .single()

    if (existingAccount) {
      return NextResponse.json({
        success: true,
        alpaca_account_id: existingAccount.alpaca_account_id,
        status: existingAccount.status,
        message: "Alpaca account already exists",
      })
    }

    // Create account via Alpaca Broker API
    const accountPayload = {
      contact: {
        email_address: kycData.email,
        phone_number: kycData.phone,
        street_address: [kycData.street_address],
        city: kycData.city,
        state: kycData.state,
        postal_code: kycData.postal_code,
        country: kycData.country || "USA",
      },
      identity: {
        given_name: kycData.given_name,
        family_name: kycData.family_name,
        date_of_birth: kycData.date_of_birth,
        tax_id: kycData.tax_id,
        tax_id_type: "USA_SSN",
        country_of_citizenship: kycData.country || "USA",
        country_of_birth: kycData.country || "USA",
        country_of_tax_residence: kycData.country || "USA",
        funding_source: ["employment_income"],
      },
      disclosures: {
        is_control_person: false,
        is_affiliated_exchange_or_finra: false,
        is_politically_exposed: false,
        immediate_family_exposed: false,
      },
      agreements: [
        {
          agreement: "customer_agreement",
          signed_at: new Date().toISOString(),
          ip_address: "127.0.0.1",
        },
        {
          agreement: "margin_agreement",
          signed_at: new Date().toISOString(),
          ip_address: "127.0.0.1",
        },
        {
          agreement: "account_agreement",
          signed_at: new Date().toISOString(),
          ip_address: "127.0.0.1",
        },
      ],
      enabled_assets: ["us_equity"],
    }

    const authHeader = Buffer.from(`${BROKER_KEY}:${BROKER_SECRET}`).toString("base64")
    
    const response = await fetch(`${BROKER_BASE}/v1/accounts`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Alpaca Broker API error:", errorText)
      return NextResponse.json(
        { error: `Failed to create Alpaca account: ${errorText}` },
        { status: response.status }
      )
    }

    const alpacaAccount = await response.json()

    // Store in Supabase
    const { error: insertError } = await supabase.from("alpaca_accounts").insert({
      user_id: user?.id,
      alpaca_account_id: alpacaAccount.id,
      account_number: alpacaAccount.account_number,
      status: alpacaAccount.status,
      given_name: kycData.given_name,
      family_name: kycData.family_name,
      email: kycData.email,
      phone: kycData.phone,
      date_of_birth: kycData.date_of_birth,
      tax_id_last_four: kycData.tax_id.slice(-4),
      street_address: kycData.street_address,
      city: kycData.city,
      state: kycData.state,
      postal_code: kycData.postal_code,
      country: kycData.country || "USA",
    })

    if (insertError) {
      console.error("Failed to store Alpaca account:", insertError)
      // Account was created but we couldn't store it - still return success
    }

    return NextResponse.json({
      success: true,
      alpaca_account_id: alpacaAccount.id,
      account_number: alpacaAccount.account_number,
      status: alpacaAccount.status,
    })
  } catch (error) {
    console.error("Create Alpaca account error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create account" },
      { status: 500 }
    )
  }
}

// GET - Check if user has an Alpaca account
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: account, error } = await supabase
      .from("alpaca_accounts")
      .select("*")
      .single()

    if (error || !account) {
      return NextResponse.json({ has_account: false })
    }

    return NextResponse.json({
      has_account: true,
      alpaca_account_id: account.alpaca_account_id,
      account_number: account.account_number,
      status: account.status,
    })
  } catch (error) {
    console.error("Get Alpaca account error:", error)
    return NextResponse.json({ has_account: false })
  }
}
