import { NextResponse } from "next/server"
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
  DepositoryAccountSubtype,
} from "plaid"
import { createClient } from "@/lib/supabase/server"

function getPlaidClient() {
  return new PlaidApi(
    new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
          "PLAID-SECRET": process.env.PLAID_SECRET!,
        },
      },
    })
  )
}

export async function POST() {
  if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
    return NextResponse.json({ not_configured: true }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const plaidClient = getPlaidClient()

    // Request Auth product so we can create processor tokens later
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: "Milify",
      products: [Products.Auth],
      country_codes: [CountryCode.Us],
      language: "en",
      account_filters: {
        depository: {
          account_subtypes: [
            DepositoryAccountSubtype.Checking,
            DepositoryAccountSubtype.Savings,
          ],
        },
      },
    })

    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create link token"
    console.error("Plaid create-link-token error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}