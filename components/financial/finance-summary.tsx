"use client"

import { Wallet, Shield, PiggyBank, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  institution: string
}

interface FinanceSummaryProps {
  accounts: Account[]
  isConnected: boolean
}

export function FinanceSummary({ accounts, isConnected }: FinanceSummaryProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const checkingBalance = accounts.filter((a) => a.type === "checking").reduce((sum, acc) => sum + acc.balance, 0)
  const savingsBalance = accounts.filter((a) => a.type === "savings").reduce((sum, acc) => sum + acc.balance, 0)

  const deploymentReadiness = isConnected ? 75 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Shield className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Financial Readiness</CardTitle>
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">✓ Bank Connected</span>
                <span className={isConnected ? "text-accent" : "text-muted-foreground"}>
                  {isConnected ? "Complete" : "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">✓ Bills Reviewed</span>
                <span className={isConnected ? "text-accent" : "text-muted-foreground"}>
                  {isConnected ? "Complete" : "Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">○ Investments Set</span>
                <span className="text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">○ Emergency Fund</span>
                <span className="text-muted-foreground">Review</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Wallet className="w-5 h-5 text-foreground" />
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
                <p className="text-sm">Total Balance</p>
                <p className="text-3xl font-bold text-foreground">
                  ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">Checking</p>
                  <p className="font-semibold text-foreground">
                    ${checkingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">Savings</p>
                  <p className="font-semibold text-foreground">
                    ${savingsBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <PiggyBank className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Deployment Tips</CardTitle>
              <CardDescription>Smart money moves</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <AlertTriangle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">TSP Contribution</p>
                <p className="text-xs text-muted-foreground">
                  Consider maxing out TSP contributions during deployment for tax-free growth.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">SGLI Review</p>
                <p className="text-xs">
                  Verify your SGLI beneficiaries are up to date before deployment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
              <PiggyBank className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Savings Deposit Program</p>
                <p className="text-xs">SDP offers 10% guaranteed interest during deployment.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
