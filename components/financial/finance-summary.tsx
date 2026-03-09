"use client"

import { useMemo, useState, useEffect } from "react"
import { Wallet, Shield, PiggyBank, CheckCircle2, Circle, TrendingUp, Receipt, ArrowDownRight, Target, DollarSign, AlertCircle, Zap, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccounts, useBills, useInvestmentRules, useGoals, useNetWorthSnapshots } from "@/hooks/use-financial-manager"
import useSWR from "swr"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { createClient } from "@/lib/supabase/client"

const fetcher = (url: string) => fetch(url).then((r) => r.json())


// ─── Helpers ─────────────────────────────────────────────────────────────────

type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "semiannual" | "annual"

const MONTHLY_MULTIPLIER: Record<Frequency, number> = {
  weekly: 52 / 12, biweekly: 26 / 12, monthly: 1,
  quarterly: 1 / 3, semiannual: 1 / 6, annual: 1 / 12,
}

function toMonthly(amount: number, frequency: Frequency): number {
  return amount * (MONTHLY_MULTIPLIER[frequency] ?? 1)
}

function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ─── Category colors for pie chart ───────────────────────────────────────────
function resolveColor(variable: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  if (!raw) return "#888888";

  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "#888888";
  ctx.fillStyle = raw.includes("(") ? raw : `oklch(${raw})`;
  return ctx.fillStyle;
}

function useChartColors() {
  const [colors, setColors] = useState<{
    chart: Record<string, string>;
    category: Record<string, string>;
    muted: string;
    mutedForeground: string;
    accent: string;
    background: string;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      setColors({
        chart: {
          chart1: resolveColor("--chart-1"),
          chart2: resolveColor("--chart-6"),
          chart3: resolveColor("--chart-4"),
        },
        category: {
          housing: resolveColor("--chart-6"),
          utilities: resolveColor("--chart-3"),
          telecom: resolveColor("--chart-5"),
          insurance: resolveColor("--chart-7"),
          debt: resolveColor("--chart-1"),
          fitness: resolveColor("--chart-4"),
          subscription: resolveColor("--chart-2"),
          other: resolveColor("--chart-8"),
        },
        muted: resolveColor("--muted"),
        mutedForeground: resolveColor("--muted-foreground"),
        accent: resolveColor("--accent"),
        background: resolveColor("--background"),
      });
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}

// ─── Time range options ──────────────────────────────────────────────────────

const TIME_RANGES = [
  { label: "3M", days: 90 },
  { label: "6M", days: 182 },
  { label: "1Y", days: 365 },
  { label: "2Y", days: 730 },
  { label: "ALL", days: -1 },
]

// ─── Custom tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-2">{payload[0]?.payload?.fullDate || label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.dataKey}</span>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function FinanceSummary() {
  const { data: accountsData, isLoading: loadingAccounts, mutate: mutateAccounts } = useAccounts()
  const { data: bills, mutate: mutateBills } = useBills()
  const { data: rules, mutate: mutateRules } = useInvestmentRules()
  const { data: goals, mutate: mutateGoals } = useGoals()
  const colors = useChartColors();

  // Alpaca brokerage data — mirrors the pattern in InvestmentControls
  const { data: alpacaAccount, mutate: mutateAlpaca } = useSWR<any>(
    "/api/alpaca/account",
    fetcher,
    { onError: () => {}, revalidateOnFocus: false, refreshInterval: 60_000 }
  )
  const [timeRange, setTimeRange] = useState(365) // days

  const supabase = useMemo(() => createClient(), [])
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          await Promise.all([
            mutateAccounts(),
            mutateBills(),
            mutateRules(),
            mutateGoals(),
            mutateAlpaca(),
          ])
        }

        if (event === "SIGNED_OUT") {
          mutateAccounts(undefined, false)
          mutateBills([], false)
          mutateRules([], false)
          mutateGoals([], false)
          mutateAlpaca(undefined, false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, mutateAccounts, mutateBills, mutateRules, mutateGoals, mutateAlpaca])

  const accounts = accountsData?.accounts || []
  const billsList = bills || []
  const rulesList = rules || []
  const goalsList = goals || []

  const alpacaConnected =
    !!alpacaAccount &&
    !("error" in alpacaAccount) &&
    !("not_configured" in alpacaAccount)
  const alpacaPortfolioValue = alpacaConnected
    ? Number(alpacaAccount.portfolio_value || 0)
    : 0

  // ── Computed values ──────────────────────────────────────────────────────

  const isConnected = accounts.length > 0
  const hasAnyData = isConnected || alpacaConnected

  const totalBalance = accounts.reduce(
    (sum, a) => sum + Number(a.balance_current || 0),
    0
  )
  const checkingBalance = accounts
    .filter((a) => a.subtype === "checking")
    .reduce((sum, a) => sum + Number(a.balance_current || 0), 0)
  const savingsBalance = accounts
    .filter((a) => a.subtype === "savings")
    .reduce((sum, a) => sum + Number(a.balance_current || 0), 0)
  const plaidInvestmentBalance = accounts
    .filter((a) => a.type === "investment")
    .reduce((sum, a) => sum + Number(a.balance_current || 0), 0)
  const creditBalance = accounts
    .filter((a) => a.type === "credit")
    .reduce((sum, a) => sum + Number(a.balance_current || 0), 0)

  // Combine Plaid investment accounts + Alpaca brokerage portfolio value
  const investmentBalance = plaidInvestmentBalance + alpacaPortfolioValue

  const netWorth = totalBalance + alpacaPortfolioValue - creditBalance

  // Monthly bills breakdown
  const totalMonthlyBills = billsList.reduce(
    (sum, b) =>
      sum + (b.is_on_hold ? 0 : toMonthly(Number(b.amount), b.frequency as Frequency)),
    0
  )
  const essentialMonthly = billsList.reduce(
    (sum, b) =>
      sum +
      (b.is_essential && !b.is_on_hold
        ? toMonthly(Number(b.amount), b.frequency as Frequency)
        : 0),
    0
  )
  const nonEssentialMonthly = totalMonthlyBills - essentialMonthly
  const onHoldSavings = billsList.reduce(
    (sum, b) =>
      sum + (b.is_on_hold ? toMonthly(Number(b.amount), b.frequency as Frequency) : 0),
    0
  )
  const activeBillsCount = billsList.filter((b) => !b.is_on_hold).length

  // Investment rules
  const activeRules = rulesList.filter((r) => r.is_active)
  const monthlyInvestment = activeRules.reduce((sum, r) => {
    const mult =
      { daily: 21, weekly: 4, biweekly: 2, monthly: 1 }[r.frequency] || 1
    return r.type === "amount"
      ? sum + Number(r.value) * mult
      : sum +
          Number(r.value) *
            (Number((r as any).estimated_share_price) || 0) *
            mult
  }, 0)

  // Goals
  const completedGoals = goalsList.filter((g) => g.is_completed).length
  const totalGoalTarget = goalsList.reduce(
    (sum, g) => sum + Number(g.target_amount),
    0
  )
  const totalGoalCurrent = goalsList.reduce(
    (sum, g) => sum + Math.min(Number(g.current_amount), Number(g.target_amount)),
    0
  )
  const overallGoalProgress =
    totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0

  // Deployment readiness
  const bankConnected = isConnected
  const billsReviewed = billsList.length > 0
  const investmentsSet = activeRules.length > 0
  const goalsSet = goalsList.length > 0
  const nonEssentialBills = billsList.filter((b) => !b.is_essential)
  const billsOnHold = nonEssentialBills.filter((b) => b.is_on_hold).length
  const holdProgress =
    nonEssentialBills.length > 0 ? billsOnHold / nonEssentialBills.length : 0

  const steps = [bankConnected, billsReviewed, investmentsSet, goalsSet]
  const completedSteps = steps.filter(Boolean).length
  const deploymentReadiness = Math.round(
    (completedSteps / steps.length) * 70 + holdProgress * 30
  )

  // ── Chart data ───────────────────────────────────────────────────────────

  const { history: netWorthHistory } = useNetWorthSnapshots(
    totalBalance,
    investmentBalance,
    timeRange,
    hasAnyData
  )

  // Category breakdown for spending pie chart
  const categoryBreakdown = useMemo(() => {
    const grouped: Record<string, number> = {};
    billsList
      .filter((b) => !b.is_on_hold)
      .forEach((b) => {
        const cat = b.category || "other";
        const monthly = toMonthly(Number(b.amount), b.frequency as Frequency);
        grouped[cat] = (grouped[cat] || 0) + monthly;
      });
    return Object.entries(grouped)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value * 100) / 100,
        key: name,
      }))
      .sort((a, b) => b.value - a.value);
  }, [billsList]);

  // Derive colors fresh every render (colors changes on theme switch)
  const categoryWithColors = categoryBreakdown.map((cat) => ({
    ...cat,
    color: colors?.category[cat.key] || "#888888",
  }));

  // ── Loading state ────────────────────────────────────────────────────────

  if (!colors || loadingAccounts) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-72 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ══ KPI Cards Row ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <Card className="relative overflow-hidden">
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Net Worth</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(netWorth)}
            </p>
            {hasAnyData && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-accent" />
                <span className="text-xs text-accent font-medium">
                  {[
                    accounts.length > 0 && `${accounts.length} account${accounts.length !== 1 ? "s" : ""}`,
                    alpacaConnected && "Alpaca",
                  ]
                    .filter(Boolean)
                    .join(" + ")}{" "}
                  linked
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Bills */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-destructive/10">
                <Receipt className="w-3.5 h-3.5 text-destructive" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Monthly Bills</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(totalMonthlyBills)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {onHoldSavings > 0 ? (
                <>
                  <ArrowDownRight className="w-3 h-3 text-accent" />
                  <span className="text-xs text-accent font-medium">
                    {formatCurrency(onHoldSavings)}/mo saved
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {activeBillsCount} active bill{activeBillsCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Investment */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-accent/10">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Auto-Investing</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(monthlyInvestment)}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {activeRules.length} active rule{activeRules.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-amber-500/10">
                <Target className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Goals</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {overallGoalProgress.toFixed(0)}%
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                {completedGoals}/{goalsList.length} complete
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══ Net Worth Chart ══ */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <BarChart3 className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Net Worth Over Time</CardTitle>
                <CardDescription>
                  Bank balances and investment portfolio value
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5 border border-border dark:border-slate-500/30">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setTimeRange(range.days)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    timeRange === range.days
                      ? "bg-primary/30 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasAnyData ? (
            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={netWorthHistory}
                  margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors?.chart["chart1"]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors?.chart["chart1"]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bankGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors?.chart["chart2"]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors?.chart["chart2"]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="investGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors?.chart["chart3"]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors?.chart["chart3"]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={colors?.category.other}
                    strokeOpacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: colors?.mutedForeground }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: colors?.mutedForeground }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    }
                    width={50}
                  />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={colors?.chart["chart1"]}
                    strokeWidth={2}
                    fill="url(#investGradient)"
                    name="Total"
                  />
                  <Area
                    type="monotone"
                    dataKey="bank"
                    stroke={colors?.chart["chart2"]}
                    strokeWidth={2}
                    fill="url(#bankGradient)"
                    name="Bank"
                  />
                  <Area
                    type="monotone"
                    dataKey="investments"
                    stroke={colors?.chart["chart3"]}
                    strokeWidth={2}
                    fill="url(#investGradient)"
                    name="Investments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Connect a bank or brokerage account to view net worth history
                </p>
              </div>
            </div>
          )}

          {/* Chart legend */}
          {hasAnyData && (
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors?.chart["chart1"] }} />
                <span className="text-xs text-muted-foreground">
                  Total ({formatCurrency(netWorth, true)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors?.chart["chart2"] }} />
                <span className="text-xs text-muted-foreground">
                  Bank ({formatCurrency(totalBalance, true)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors?.chart["chart3"] }} />
                <span className="text-xs text-muted-foreground">
                  Investments ({formatCurrency(investmentBalance, true)})
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══ Bottom Grid: Spending + Accounts + Readiness ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Receipt className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Spending Breakdown</CardTitle>
                <CardDescription>Monthly bill categories</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryWithColors}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        stroke={colors?.background}
                      >
                        {categoryWithColors.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm p-2 shadow-lg">
                              <p className="text-xs font-medium text-foreground">
                                {data.name}
                              </p>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {formatCurrency(data.value)}/mo
                              </p>
                            </div>
                          )
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {categoryWithColors.slice(0, 5).map((cat) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-muted-foreground">{cat.name}</span>
                      </div>
                      <span className="font-medium text-foreground tabular-nums">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Essential vs discretionary bar */}
                <div className="mt-4 pt-4 border-t border-border dark:border-slate-500">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Essential vs Discretionary</span>
                    <span className="text-muted-foreground tabular-nums">
                      {totalMonthlyBills > 0
                        ? `${((essentialMonthly / totalMonthlyBills) * 100).toFixed(0)}% essential`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
                    <div
                      className="bg-primary rounded-l-full transition-all"
                      style={{
                        width: `${totalMonthlyBills > 0 ? (essentialMonthly / totalMonthlyBills) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="bg-primary/40 transition-all"
                      style={{
                        width: `${totalMonthlyBills > 0 ? (nonEssentialMonthly / totalMonthlyBills) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Essential {formatCurrency(essentialMonthly)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary/40" />
                      Other {formatCurrency(nonEssentialMonthly)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <Receipt className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Add bills to see breakdown
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Balances */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Wallet className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Accounts</CardTitle>
                <CardDescription>Bank &amp; brokerage overview</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasAnyData ? (
              <div className="space-y-3">
                {/* Balance summary */}
                <div className="p-3 rounded-lg bg-primary">
                  <p className="text-xs text-primary-foreground/70">Total Net Worth</p>
                  <p className="text-2xl font-bold text-primary-foreground tabular-nums">
                    {formatCurrency(netWorth)}
                  </p>
                </div>

                {/* Account type breakdown */}
                <div className="space-y-2">
                  {[
                    {
                      label: "Checking",
                      value: checkingBalance,
                      icon: Wallet,
                      color: "text-blue-500",
                    },
                    {
                      label: "Savings",
                      value: savingsBalance,
                      icon: PiggyBank,
                      color: "text-emerald-500",
                    },
                    {
                      label: "Alpaca Portfolio",
                      value: alpacaPortfolioValue,
                      icon: TrendingUp,
                      color: "text-purple-500",
                    },
                    {
                      label: "Other Investments",
                      value: plaidInvestmentBalance,
                      icon: TrendingUp,
                      color: "text-violet-400",
                    },
                    {
                      label: "Credit",
                      value: creditBalance,
                      icon: Receipt,
                      color: "text-orange-500",
                      negative: true,
                    },
                  ]
                    .filter((a) => a.value > 0)
                    .map((acct) => (
                      <div
                        key={acct.label}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border dark:border-slate-500"
                      >
                        <div className="flex items-center gap-2.5">
                          <acct.icon className={`w-4 h-4 ${acct.color}`} />
                          <span className="text-sm text-muted-foreground">
                            {acct.label}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          {acct.negative ? "-" : ""}
                          {formatCurrency(acct.value)}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Quick stats */}
                <div className="pt-3 border-t border-border dark:border-slate-500 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active bills</span>
                    <span className="font-medium text-foreground">{activeBillsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Investment rules</span>
                    <span className="font-medium text-foreground">
                      {activeRules.length} active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Goals</span>
                    <span className="font-medium text-foreground">
                      {completedGoals}/{goalsList.length} complete
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <Wallet className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Connect accounts to view balances
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deployment Readiness */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Shield className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Deployment Readiness</CardTitle>
                <CardDescription>Financial preparation status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Circular-ish progress */}
              <div className="text-center py-3">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={colors?.background}
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={colors?.accent}
                      strokeWidth="8"
                      strokeDasharray={`${(deploymentReadiness / 100) * 314} 314`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">
                      {deploymentReadiness}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <ReadinessItem label="Bank Connected" done={bankConnected} />
                <ReadinessItem label="Bills Reviewed" done={billsReviewed} />
                <ReadinessItem
                  label="Non-Essential Bills on Hold"
                  done={holdProgress === 1}
                  partial={holdProgress > 0 && holdProgress < 1}
                  detail={
                    nonEssentialBills.length > 0
                      ? `${billsOnHold}/${nonEssentialBills.length}`
                      : undefined
                  }
                />
                <ReadinessItem label="Investments Configured" done={investmentsSet} />
                <ReadinessItem label="Goals Defined" done={goalsSet} />
              </div>

              {/* Savings highlight */}
              {onHoldSavings > 0 && (
                <div className="pt-3 border-t border-border dark:border-slate-500">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deployment savings</span>
                    <span className="font-bold text-accent tabular-nums">
                      {formatCurrency(onHoldSavings)}/mo
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══ Goals Progress Bar ══ */}
      {goalsList.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Target className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Goal Progress</CardTitle>
                <CardDescription>
                  {formatCurrency(totalGoalCurrent)} of {formatCurrency(totalGoalTarget)} across{" "}
                  {goalsList.length} goal{goalsList.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goalsList.map((goal) => {
                const progress = Math.min(
                  (Number(goal.current_amount) / Number(goal.target_amount)) * 100,
                  100
                )
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {goal.is_completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span
                          className={
                            goal.is_completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground font-medium"
                          }
                        >
                          {goal.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(Number(goal.current_amount))} /{" "}
                        {formatCurrency(Number(goal.target_amount))}
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ReadinessItem({
  label,
  done,
  partial,
  detail,
}: {
  label: string
  done: boolean
  partial?: boolean
  detail?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="w-4 h-4 text-accent" />
        ) : partial ? (
          <AlertCircle className="w-4 h-4 text-amber-500" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground" />
        )}
        {label}
      </span>
      <span
        className={
          done
            ? "text-accent font-medium"
            : partial
            ? "text-amber-500 font-medium"
            : "text-muted-foreground"
        }
      >
        {detail || (done ? "Complete" : partial ? "In Progress" : "Pending")}
      </span>
    </div>
  )
}