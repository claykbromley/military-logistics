import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALPACA_API_BASE = process.env.ALPACA_BASE_URL ?? "https://broker-api.alpaca.markets"
const ALPACA_API_KEY = process.env.ALPACA_API_KEY!
const ALPACA_API_SECRET = process.env.ALPACA_SECRET_KEY!

async function getAlpacaPortfolioValue(accountId: string): Promise<number> {
  const res = await fetch(
    `${ALPACA_API_BASE}/v1/trading/accounts/${accountId}/account`,
    {
      headers: {
        Authorization:
          "Basic " + btoa(`${ALPACA_API_KEY}:${ALPACA_API_SECRET}`),
      },
    }
  )
  if (!res.ok) return 0
  const data = await res.json()
  return Number(data.portfolio_value ?? data.equity ?? 0)
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)

  // Fetch bank accounts and alpaca account mappings in parallel
  const [{ data: bankRows }, { data: alpacaRows }] = await Promise.all([
    supabase
      .from("plaid_accounts")
      .select("user_id, balance_current"),
    supabase
      .from("alpaca_accounts")
      .select("user_id, alpaca_account_id"),
  ])

  if ((!bankRows || bankRows.length === 0) && (!alpacaRows || alpacaRows.length === 0)) {
    return Response.json({ message: "No accounts found" })
  }

  // Collect all unique user IDs
  const userIds = new Set<string>()
  bankRows?.forEach((r) => userIds.add(r.user_id))
  alpacaRows?.forEach((r) => userIds.add(r.user_id))

  // Bank balances by user
  const bankByUser = new Map<string, number>()
  for (const row of bankRows ?? []) {
    const prev = bankByUser.get(row.user_id) ?? 0
    bankByUser.set(row.user_id, prev + Number(row.balance_current || 0))
  }

  // Alpaca portfolio values by user (fetched in parallel)
  const investmentByUser = new Map<string, number>()
  if (alpacaRows && alpacaRows.length > 0) {
    const results = await Promise.all(
      alpacaRows.map(async (row) => ({
        userId: row.user_id,
        value: await getAlpacaPortfolioValue(row.alpaca_account_id),
      }))
    )
    for (const { userId, value } of results) {
      const prev = investmentByUser.get(userId) ?? 0
      investmentByUser.set(userId, prev + value)
    }
  }

  // Build snapshots
  const snapshots = Array.from(userIds).map((userId) => {
    const bankBalance = bankByUser.get(userId) ?? 0
    const investmentBalance = investmentByUser.get(userId) ?? 0
    return {
      user_id: userId,
      date: today,
      bank_balance: bankBalance,
      investment_balance: investmentBalance,
      total: bankBalance + investmentBalance,
    }
  })

  const { error } = await supabase
    .from("net_worth_snapshots")
    .upsert(snapshots, { onConflict: "user_id,date" })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ recorded: snapshots.length })
}