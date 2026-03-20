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

/**
 * POST /api/plaid/refresh-balances
 *
 * Re-fetches account balances from Plaid for all of the user's linked
 * items and updates the plaid_accounts table.
 *
 * Note: In Plaid sandbox, balances are static mock data and won't reflect
 * Alpaca transfers (they are separate systems). In production, bank
 * balances lag 1-2 days behind real ACH movements.
 */
export async function POST() {
  if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
    return NextResponse.json({ error: "Plaid not configured" }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all Plaid items for this user
    const { data: items, error: itemsError } = await supabase
      .from("plaid_items")
      .select("id, access_token, institution_name")
      .eq("user_id", user.id)

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json({ error: "No linked bank accounts found" }, { status: 404 })
    }

    const plaidClient = getPlaidClient()
    let totalUpdated = 0

    for (const item of items) {
      try {
        const response = await plaidClient.accountsGet({
          access_token: item.access_token,
        })

        for (const acc of response.data.accounts) {
          const { error: updateError } = await supabase
            .from("plaid_accounts")
            .update({
              balance_current: acc.balances.current ?? 0,
              balance_available: acc.balances.available ?? null,
            })
            .eq("plaid_item_id", item.id)
            .eq("account_id_plaid", acc.account_id)
            .eq("user_id", user.id)

          if (!updateError) totalUpdated++
        }
      } catch (err) {
        console.error(`Failed to refresh balances for item ${item.id}:`, err)
        // Continue with other items
      }
    }

    return NextResponse.json({
      success: true,
      accounts_updated: totalUpdated,
      message: `Refreshed ${totalUpdated} account balance(s) from Plaid.`,
      note: "In sandbox mode, Plaid balances are static and won't reflect Alpaca transfers.",
    })
  } catch (error: any) {
    console.error("Refresh balances error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to refresh balances" },
      { status: 500 }
    )
  }
}