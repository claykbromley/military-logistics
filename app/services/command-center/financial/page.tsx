"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BankConnection } from "@/components/financial/bank-connection"
import { BillsTracker } from "@/components/financial/bills-tracker"
import { InvestmentControls } from "@/components/financial/investment-controls"
import { FinanceSummary } from "@/components/financial/finance-summary"
import { Card } from "@/components/ui/card"
import { DollarSign, PiggyBank, CreditCard, Home, TrendingUp, Shield, ChevronRight, BriefcaseBusiness } from "lucide-react"

export default function FinancePage() {
  const serviceCategories = [
    { name: "Manage Finances", icon: DollarSign, description: "Control your monthly bills and investments" },
    { name: "Investments", icon: TrendingUp, description: "Learn about investment options to grow your capital" },
    { name: "Taxes and Income", icon: PiggyBank, description: "Analyze your income and file your taxes" },
    { name: "Loans", icon: Home, description: "Secure loans for important life changes" },
    { name: "Retirement", icon: Shield, description: "Prepare for a life after the military" },
    { name: "Start a Business", icon: BriefcaseBusiness, description: "Manage a side business while active duty" },
    { name: "Credit", icon: CreditCard, description: "Grow your credit and explore card options" },
  ]
  const [isConnected, setIsConnected] = useState(false)
  const [accounts, setAccounts] = useState<
    Array<{
      id: string
      name: string
      type: string
      balance: number
      institution: string
    }>
  >([])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center text-foreground tracking-tight">Financial Manager</h1>
            <p className="text-muted-foreground text-center mt-2">
              Automate your finances and investments. Connect your accounts, manage bills, and set up investments.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <BankConnection
                isConnected={isConnected}
                setIsConnected={setIsConnected}
                accounts={accounts}
                setAccounts={setAccounts}
              />
              <BillsTracker isConnected={isConnected} />
              <InvestmentControls isConnected={isConnected} />
            </div>
            <div className="space-y-6">
              <FinanceSummary accounts={accounts} isConnected={isConnected} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}