import { NextResponse } from "next/server"
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"
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

export async function POST(request: Request) {
  if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
    return NextResponse.json({ not_configured: true }, { status: 400 })
  }

  try {
    const { public_token, institution } = await request.json()
    const plaidClient = getPlaidClient()
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const { access_token, item_id } = exchangeResponse.data

    // Check for duplicate item_id (user re-linking the same institution)
    const { data: existingItem } = await supabase
      .from("plaid_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", item_id)
      .single()

    if (existingItem) {
      // Update the access token on the existing item
      await supabase
        .from("plaid_items")
        .update({
          access_token,
          institution_name: institution?.name || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)

      // Refresh account balances
      const accountsResponse = await plaidClient.accountsGet({ access_token })
      for (const acc of accountsResponse.data.accounts) {
        await supabase
          .from("plaid_accounts")
          .update({
            balance_current: acc.balances.current || 0,
            balance_available: acc.balances.available || null,
          })
          .eq("plaid_item_id", existingItem.id)
          .eq("account_id_plaid", acc.account_id)
      }

      return NextResponse.json({
        success: true,
        item_id: existingItem.id,
        accounts_synced: accountsResponse.data.accounts.length,
        institution_name: institution?.name,
        updated: true,
      })
    }

    // Store the new Plaid item
    const { data: plaidItem, error: itemError } = await supabase
      .from("plaid_items")
      .insert({
        user_id: user.id,
        access_token,
        item_id,
        institution_id: institution?.institution_id || null,
        institution_name: institution?.name || null,
      })
      .select()
      .single()

    if (itemError) throw itemError

    // Fetch and store accounts
    const accountsResponse = await plaidClient.accountsGet({ access_token })
    const plaidAccounts = accountsResponse.data.accounts

    const accountInserts = plaidAccounts.map((acc) => ({
      user_id: user.id,
      plaid_item_id: plaidItem.id,
      account_id_plaid: acc.account_id,
      name: acc.name,
      official_name: acc.official_name || null,
      type: acc.type,
      subtype: acc.subtype || null,
      balance_current: acc.balances.current || 0,
      balance_available: acc.balances.available || null,
      mask: acc.mask || null,
    }))

    const { error: accError } = await supabase
      .from("plaid_accounts")
      .insert(accountInserts)

    if (accError) throw accError

    return NextResponse.json({
      success: true,
      item_id: plaidItem.id,
      accounts_synced: plaidAccounts.length,
      institution_name: institution?.name,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Token exchange failed"
    console.error("Plaid exchange-token error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}