"use client"

import { Wallet, Shield, PiggyBank, AlertTriangle, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccounts, useBills, useInvestmentRules, useGoals } from "@/hooks/use-financial-manager"

export function FinanceSummary() {
  const { data: accountsData, isLoading: loadingAccounts } = useAccounts()
  const { data: bills } = useBills()
  const { data: rules } = useInvestmentRules()
  const { data: goals } = useGoals()

  const accounts = accountsData?.accounts || []
  const billsList = bills || []
  const rulesList = rules || []
  const goalsList = goals || []

  const isConnected = accounts.length > 0
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance_current || 0), 0)
  const checkingBalance = accounts
    .filter((a) => a.subtype === "checking")
    .reduce((sum, a) => sum + Number(a.balance_current || 0), 0)
  const savingsBalance = accounts
    .filter((a) => a.subtype === "savings")
    .reduce((sum, a) => sum + Number(a.balance_current || 0), 0)

  // Calculate deployment readiness score
  const bankConnected = isConnected
  const billsReviewed = billsList.length > 0
  const investmentsSet = rulesList.filter((r) => r.is_active).length > 0
  const goalsSet = goalsList.length > 0
  const billsOnHold = billsList.filter((b) => b.is_on_hold).length
  const nonEssentialBills = billsList.filter((b) => !b.is_essential).length
  const holdProgress = nonEssentialBills > 0 ? billsOnHold / nonEssentialBills : 0

  const steps = [bankConnected, billsReviewed, investmentsSet, goalsSet]
  const completedSteps = steps.filter(Boolean).length
  const deploymentReadiness = Math.round(
    ((completedSteps / steps.length) * 70) + (holdProgress * 30)
  )

  const onHoldSavings = billsList.reduce(
    (sum, bill) => sum + (bill.is_on_hold ? Number(bill.amount) : 0), 0
  )

  if (loadingAccounts) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Deployment Readiness */}
      <Card>
        <CardHeader className="pb-3">
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Overall Progress</span>
                <span className="text-sm font-bold text-accent">{deploymentReadiness}%</span>
              </div>
              <Progress value={deploymentReadiness} className="h-2" />
            </div>

            <div className="space-y-2 pt-2">
              <ReadinessItem label="Bank Connected" done={bankConnected} />
              <ReadinessItem label="Bills Reviewed" done={billsReviewed} />
              <ReadinessItem label="Non-Essentail Bills on Hold" done={holdProgress === 1} />
              <ReadinessItem label="Investments Set" done={investmentsSet} />
              <ReadinessItem label="Goals Defined" done={goalsSet} />
            </div>

            {onHoldSavings > 0 && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deployment savings</span>
                  <span className="font-bold text-accent">${onHoldSavings.toFixed(2)}/mo</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Wallet className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Account Summary</CardTitle>
              <CardDescription>Your connected accounts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-secondary">
                <p className="text-sm text-secondary-foreground">Total Balance</p>
                <p className="text-3xl font-bold text-secondary-foreground">
                  ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border dark:border-slate-500">
                  <p className="text-xs text-muted-foreground">Checking</p>
                  <p className="font-semibold text-foreground">
                    ${checkingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border dark:border-slate-500">
                  <p className="text-xs text-muted-foreground">Savings</p>
                  <p className="font-semibold text-foreground">
                    ${savingsBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="pt-2 border-t border-border space-y-2 dark:border-slate-500">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active bills</span>
                  <span className="text-foreground font-medium">
                    {billsList.filter((b) => !b.is_on_hold).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Investment rules</span>
                  <span className="text-foreground font-medium">
                    {rulesList.filter((r) => r.is_active).length} active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Goals progress</span>
                  <span className="text-foreground font-medium">
                    {goalsList.filter((g) => g.is_completed).length}/{goalsList.length} complete
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Connect accounts to view summary</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ReadinessItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="w-4 h-4 text-accent" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground" />
        )}
        {label}
      </span>
      <span className={done ? "text-accent font-medium" : "text-muted-foreground"}>
        {done ? "Complete" : "Pending"}
      </span>
    </div>
  )
}
