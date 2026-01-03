"use client"

import { Header } from "@/components/header"
import { DollarSign, PiggyBank, CreditCard, Home, TrendingUp, Shield, ChevronRight, BriefcaseBusiness } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function FinancialPage() {
  const serviceCategories = [
    { name: "Manage Finances", icon: DollarSign, description: "Control your monthly bills and investments" },
    { name: "Investments", icon: TrendingUp, description: "Learn about investment options to grow your capital" },
    { name: "Taxes and Income", icon: PiggyBank, description: "Analyze your income and file your taxes" },
    { name: "Loans", icon: Home, description: "Secure loans for important life changes" },
    { name: "Retirement", icon: Shield, description: "Prepare for a life after the military" },
    { name: "Start a Business", icon: BriefcaseBusiness, description: "Manage a side business while active duty" },
    { name: "Credit", icon: CreditCard, description: "Grow your credit and explore card options" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4" />
            <a className="hover:text-primary transition-colors">
              Services
            </a>
            <ChevronRight className="h-4 w-4" />
            <a href="/services/financial" className="hover:text-primary transition-colors">
              Financial
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Taxes and Income</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-100 border-r">
          <div className="sticky top-20 p-6">
            <a href="/services/financial">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-300 text-center">
                Financial Services
              </h2>
            </a>
            <div className="space-y-3">
              {serviceCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card
                    key={category.name}
                    className="p-4 hover:shadow-md transition-all cursor-pointer bg-white border-2 hover:border-primary group"
                  >
                    <a key={category.name} href={`/services/financial/${category.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                    </a>
                  </Card>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="relative z-10 p-6 lg:p-12">
            <div className="flex flex-col max-w-6xl mx-auto h-screen min-h-full">
              
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
