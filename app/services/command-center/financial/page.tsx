"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { fetcher } from "@/lib/fetcher"
import useSWR from "swr"
import { BankConnection } from "@/components/financial/bank-connection"
import { BillsTracker } from "@/components/financial/bills-tracker"
import { InvestmentControls } from "@/components/financial/investment-controls"
import { FinancialGoals } from "@/components/financial/financial-goals"
import { AdvisorDirectory } from "@/components/financial/advisor-directory"
import { FinanceSummary } from "@/components/financial/finance-summary"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, PiggyBank, LayoutDashboard, TrendingUp, HandHelping, Receipt, Shield, Download, Building2, DollarSign, Target, ExternalLink } from "lucide-react"
import { useAccounts, useBills, useInvestmentRules, useGoals } from "@/hooks/use-financial-manager"

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "semiannual" | "annual"

const MONTHLY_MULTIPLIER: Record<Frequency, number> = {
  weekly: 52 / 12, biweekly: 26 / 12, monthly: 1,
  quarterly: 1 / 3, semiannual: 1 / 6, annual: 1 / 12,
}

function toMonthly(amount: number, frequency: Frequency): number {
  return amount * (MONTHLY_MULTIPLIER[frequency] ?? 1)
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Fetch data for the hero section
  const { data: accountsData } = useAccounts()
  const { data: bills } = useBills()
  const { data: rules } = useInvestmentRules()
  const { data: goals } = useGoals()

  const { data: alpacaAccount } = useSWR<any>(
      "/api/alpaca/account",
      fetcher,
      { onError: () => {}, revalidateOnFocus: false, refreshInterval: 60_000 }
    )
  const alpacaConnected =
    !!alpacaAccount &&
    !("error" in alpacaAccount) &&
    !("not_configured" in alpacaAccount)
    
  const alpacaPortfolioValue = alpacaConnected
    ? Number(alpacaAccount.portfolio_value || 0)
    : 0

  const accounts = accountsData?.accounts || []
  const billsList = bills || []
  const rulesList = rules || []
  const goalsList = goals || []

  // Compute hero stats
  const totalBalance = accounts.reduce(
    (sum, a) => sum + Number(a.balance_current || 0),
    0
  )
  const creditBalance = accounts
    .filter((a) => a.type === "credit")
    .reduce((sum, a) => sum + Number(a.balance_current || 0), 0)
  const netWorth = totalBalance + alpacaPortfolioValue - creditBalance

  const totalMonthlyBills = billsList.reduce(
    (sum, b) =>
      sum + (b.is_on_hold ? 0 : toMonthly(Number(b.amount), b.frequency as Frequency)),
    0
  )
  const activeBillsCount = billsList.filter((b) => !b.is_on_hold).length

  const totalGoalTarget = goalsList.reduce(
    (sum, g) => sum + Number(g.target_amount),
    0
  )
  const totalGoalCurrent = goalsList.reduce(
    (sum, g) => sum + Math.min(Number(g.current_amount), Number(g.target_amount)),
    0
  )
  const goalProgress =
    totalGoalTarget > 0
      ? Math.round((totalGoalCurrent / totalGoalTarget) * 100)
      : 0

  const activeRulesCount = rulesList.filter((r) => r.is_active).length
  const monthlyInvestment = rulesList
    .filter((r) => r.is_active)
    .reduce((sum, r) => {
      const mult =
        { daily: 21, weekly: 4, biweekly: 2, monthly: 1 }[r.frequency] || 1
      return r.type === "amount"
        ? sum + Number(r.value) * mult
        : sum +
            Number(r.value) *
              (Number((r as any).estimated_share_price) || 0) *
              mult
    }, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden border-b bg-primary dark:bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
          {/* Top row */}
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <Link href="./" aria-label="Go back">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Financial Manager
                  </h1>
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/10">
                    <Shield className="w-3 h-3" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                      Secure
                    </span>
                  </div>
                </div>
                <p className="text-white/70 mt-1.5 text-sm sm:text-base leading-relaxed">
                  Connect your accounts, manage bills, set goals, and configure
                  auto-investments.
                </p>
              </div>
            </div>
            <Button asChild className="bg-white text-primary dark:bg-primary dark:text-primary-foreground hover:bg-white/80 dark:hover:bg-primary/80 cursor-pointer">
              <Link href="/services/financial" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 mr-2" />
                Milify Financial Services
              </Link>
            </Button>
          </div>

          {/* Dynamic Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {accounts.length > 0 ? formatCurrency(netWorth) : "—"}
                  </p>
                  <p className="text-sm text-white/70">Net Worth</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {activeBillsCount > 0
                      ? formatCurrency(totalMonthlyBills)
                      : "—"}
                  </p>
                  <p className="text-sm text-white/70">
                    {activeBillsCount > 0
                      ? `${activeBillsCount} Bill${activeBillsCount !== 1 ? "s" : ""}/mo`
                      : "Monthly Bills"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {activeRulesCount > 0
                      ? formatCurrency(monthlyInvestment)
                      : "—"}
                  </p>
                  <p className="text-sm text-white/70">
                    {activeRulesCount > 0
                      ? `${activeRulesCount} Rule${activeRulesCount !== 1 ? "s" : ""} Active`
                      : "Auto-Investing"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {goalsList.length > 0 ? `${goalProgress}%` : "—"}
                  </p>
                  <p className="text-sm text-white/70">
                    {goalsList.length > 0
                      ? `${goalsList.filter((g) => g.is_completed).length}/${goalsList.length} Goals`
                      : "Goal Progress"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="w-full h-auto flex gap-3 overflow-x-auto rounded-2xl bg-muted/60 p-1.5 backdrop-blur-sm border border-border shadow-sm">
              {[
                { value: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
                { value: "banks", icon: Building2, label: "Banks" },
                { value: "bills", icon: Receipt, label: "Bills" },
                { value: "investments", icon: TrendingUp, label: "Investments" },
                { value: "goals", icon: PiggyBank, label: "Goals" },
                { value: "advisors", icon: HandHelping, label: "Advisors" },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/10 data-[state=active]:!bg-primary/30 data-[state=active]:!text-foreground cursor-pointer"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="pt-2">
              <TabsContent value="dashboard">
                <FinanceSummary />
              </TabsContent>
              <TabsContent value="banks">
                <BankConnection />
              </TabsContent>
              <TabsContent value="bills">
                <BillsTracker />
              </TabsContent>
              <TabsContent value="investments">
                <InvestmentControls />
              </TabsContent>
              <TabsContent value="goals">
                <FinancialGoals />
              </TabsContent>
              <TabsContent value="advisors">
                <AdvisorDirectory />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}