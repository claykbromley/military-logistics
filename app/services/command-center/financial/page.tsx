"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BankConnection } from "@/components/financial/bank-connection"
import { BillsTracker } from "@/components/financial/bills-tracker"
import { InvestmentControls } from "@/components/financial/investment-controls"
import { FinancialGoals } from "@/components/financial/financial-goals"
import { AdvisorDirectory } from "@/components/financial/advisor-directory"
import { FinanceSummary } from "@/components/financial/finance-summary"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, PiggyBank, LayoutDashboard, TrendingUp, HandHelping, Receipt, Shield, Download, DollarSign, ReceiptCent } from "lucide-react"

export default function FinanceDashboard() {

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden border-b bg-primary dark:bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
          {/* Top row */}
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                <Link href="./" aria-label="Go back">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Financial Manager</h1>
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/10">
                    <Shield className="w-3 h-3" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Secure</span>
                  </div>
                </div>
                <p className="text-white/70 mt-1.5 text-sm sm:text-base leading-relaxed">
                  Connect your accounts, manage bills, set goals, and configure auto-investments.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
                asChild
              >
                <div>
                  <HandHelping className="w-4 h-4 mr-2" />
                  Find a Financial Advisor
                </div>
              </Button>
              <Button
                className="bg-white text-primary dark:text-secondary hover:bg-white/90 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </div>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">$0</p>
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
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-sm text-white/70">Monthly Bills</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">46%</p>
                  <p className="text-sm text-white/70">Goal Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BankConnection />
            <BillsTracker />
            <InvestmentControls />
          </div>
          <div className="space-y-6">
            <FinanceSummary />
            <FinancialGoals />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
