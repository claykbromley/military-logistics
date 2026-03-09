import { createClient } from "@/lib/supabase/client"

export async function POST(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient()
  const today = new Date().toISOString().slice(0, 10)

  // Get distinct user IDs with accounts
  const { data: rows } = await supabase
    .from("accounts")
    .select("user_id, balance_current, type")

  if (!rows || rows.length === 0) {
    return Response.json({ message: "No accounts found" })
  }

  // Group by user
  const byUser = new Map<string, typeof rows>()
  for (const row of rows) {
    const existing = byUser.get(row.user_id) ?? []
    existing.push(row)
    byUser.set(row.user_id, existing)
  }

  const snapshots = Array.from(byUser.entries()).map(([userId, accounts]) => {
    const bankBalance = accounts.reduce(
      (sum, a) => sum + Number(a.balance_current || 0),
      0
    )
    const investmentBalance = accounts
      .filter((a) => a.type === "investment")
      .reduce((sum, a) => sum + Number(a.balance_current || 0), 0)

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