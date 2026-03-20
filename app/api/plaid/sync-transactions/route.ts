import { NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { createClient } from "@/lib/supabase/server";

function getPlaidClient() {
  const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
        "PLAID-SECRET": process.env.PLAID_SECRET!,
      },
    },
  });
  return new PlaidApi(configuration);
}

// Categorize transactions into bill categories
function categorize(category: string[] | null | undefined, name: string): string {
  const cats = (category || []).map((c) => c.toLowerCase());
  const n = name.toLowerCase();

  if (cats.some((c) => c.includes("utilities")) || /electric|gas|water|power|energy/i.test(n)) return "utilities";
  if (cats.some((c) => c.includes("insurance")) || /insurance|geico|allstate|usaa ins/i.test(n)) return "insurance";
  if (cats.some((c) => c.includes("rent") || c.includes("mortgage")) || /rent|mortgage|housing/i.test(n)) return "housing";
  if (cats.some((c) => c.includes("subscription") || c.includes("streaming")) || /netflix|spotify|hulu|disney|apple|youtube|amazon prime/i.test(n)) return "subscription";
  if (cats.some((c) => c.includes("phone") || c.includes("internet") || c.includes("cable")) || /verizon|att|t-mobile|comcast|spectrum|xfinity/i.test(n)) return "telecom";
  if (cats.some((c) => c.includes("loan") || c.includes("credit")) || /loan|payment|sallie mae|navient|credit/i.test(n)) return "debt";
  if (cats.some((c) => c.includes("gym") || c.includes("fitness")) || /gym|fitness|planet|anytime/i.test(n)) return "fitness";
  return "other";
}

export async function POST() {
  if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
    return NextResponse.json({ not_configured: true }, { status: 400 });
  }
  try {
    const plaidClient = getPlaidClient();
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all Plaid items for this user
    const { data: items, error: itemsError } = await supabase
      .from("plaid_items")
      .select("*")
      .eq("user_id", user.id);

    if (itemsError) throw itemsError;
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No connected bank accounts" }, { status: 400 });
    }

    let totalBillsFound = 0;

    for (const item of items) {
      // Try recurring transactions endpoint first
      try {
        const recurringResponse = await plaidClient.transactionsRecurringGet({
          access_token: item.access_token,
          account_ids: [],
        });

        const streams = [
          ...recurringResponse.data.outflow_streams,
        ];

        // Get existing accounts for this plaid item
        const { data: accounts } = await supabase
          .from("plaid_accounts")
          .select("id, account_id_plaid")
          .eq("plaid_item_id", item.id);

        const accountMap = new Map(
          (accounts || []).map((a) => [a.account_id_plaid, a.id])
        );

        for (const stream of streams) {
          const name = stream.merchant_name || stream.description || "Unknown Bill";
          const category = categorize(
            stream.personal_finance_category
              ? [stream.personal_finance_category.primary]
              : stream.category,
            name
          );

          // Upsert bill by stream_id to avoid duplicates
          const { error: billError } = await supabase.from("bills").upsert(
            {
              user_id: user.id,
              account_id: accountMap.get(stream.account_id) || null,
              name,
              merchant_name: stream.merchant_name || null,
              category,
              amount: Math.abs(stream.average_amount?.amount || stream.last_amount?.amount || 0),
              frequency: stream.frequency === "WEEKLY"
                ? "weekly"
                : stream.frequency === "BIWEEKLY"
                  ? "biweekly"
                  : "monthly",
              last_date: stream.last_date || null,
              next_date: stream.predicted_next_date || null,
              is_essential: ["housing", "utilities", "insurance", "debt"].includes(category),
              stream_id: stream.stream_id,
            },
            { onConflict: "stream_id" }
          );

          if (!billError) totalBillsFound++;
        }

        // Also refresh account balances
        const balanceResponse = await plaidClient.accountsGet({
          access_token: item.access_token,
        });

        for (const acc of balanceResponse.data.accounts) {
          const localAccountId = accountMap.get(acc.account_id);
          if (localAccountId) {
            await supabase
              .from("plaid_accounts")
              .update({
                balance_current: acc.balances.current || 0,
                balance_available: acc.balances.available || null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", localAccountId);
          }
        }
      } catch {
        // Fallback: Use regular transactions sync if recurring is not available
        let hasMore = true;
        let cursor = item.cursor || undefined;
        const allTransactions: Array<{
          name: string;
          merchant_name?: string | null;
          amount: number;
          category?: string[] | null;
          personal_finance_category?: { primary: string } | null;
          account_id: string;
          date: string;
        }> = [];

        while (hasMore) {
          const response = await plaidClient.transactionsSync({
            access_token: item.access_token,
            cursor,
          });

          allTransactions.push(...response.data.added);
          cursor = response.data.next_cursor;
          hasMore = response.data.has_more;
        }

        // Update cursor
        await supabase
          .from("plaid_items")
          .update({ cursor })
          .eq("id", item.id);

        // Detect recurring by grouping by merchant name
        const merchantGroups = new Map<string, typeof allTransactions>();
        for (const tx of allTransactions) {
          const key = (tx.merchant_name || tx.name).toLowerCase().trim();
          if (!merchantGroups.has(key)) merchantGroups.set(key, []);
          merchantGroups.get(key)!.push(tx);
        }

        const { data: accounts } = await supabase
          .from("plaid_accounts")
          .select("id, account_id_plaid")
          .eq("plaid_item_id", item.id);

        const accountMap = new Map(
          (accounts || []).map((a) => [a.account_id_plaid, a.id])
        );

        // If merchant appears 2+ times, treat as recurring
        for (const [, txs] of merchantGroups) {
          if (txs.length < 2) continue;

          const representative = txs[0];
          const avgAmount = txs.reduce((s, t) => s + Math.abs(t.amount), 0) / txs.length;
          const name = representative.merchant_name || representative.name;
          const category = categorize(
            representative.personal_finance_category
              ? [representative.personal_finance_category.primary]
              : representative.category,
            name
          );

          const sortedDates = txs.map((t) => t.date).sort();
          const lastDate = sortedDates[sortedDates.length - 1];

          await supabase.from("bills").upsert(
            {
              user_id: user.id,
              account_id: accountMap.get(representative.account_id) || null,
              name,
              merchant_name: representative.merchant_name || null,
              category,
              amount: Math.round(avgAmount * 100) / 100,
              frequency: "monthly",
              last_date: lastDate,
              is_essential: ["housing", "utilities", "insurance", "debt"].includes(category),
              stream_id: `manual-${name.toLowerCase().replace(/\s+/g, "-")}`,
            },
            { onConflict: "stream_id" }
          );

          totalBillsFound++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      bills_found: totalBillsFound,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sync failed";
    console.error("Plaid sync error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
