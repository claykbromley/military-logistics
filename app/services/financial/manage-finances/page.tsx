"use client"

import { Header } from "@/components/header"
import { DollarSign, PiggyBank, CreditCard, Home, TrendingUp, Shield, ChevronRight, BriefcaseBusiness } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Control } from "./controls-modal"
import { Button } from "@/components/ui/button"

export default function FinancialPage() {
  const [modal, setModal] = useState<boolean>(false);
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
    <div className="h-full bg-background overflow-hidden">
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
            <span className="text-foreground font-medium">Manage Finances</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-100 border-r overflow-y-auto">
          <div className="top-20 p-6">
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
        <main className="flex flex-1 ml-4 flex-col h-full min-h-0">
          <div className="flex h-full min-h-0">
            <div className="flex flex-3 flex-col border-r min-h-0">
              <h2 className="text-center m-0 text-xl font-bold">Financial Management Tool</h2>
              <div className="flex justify-center gap-4 items-center">
                <div className="bg-[lightgray] border-1 border-gray-400 mt-4 rounded-xl p-2">
                  <div className="flex gap-1 px-2">
                    <p className="m-0">Average Monthly Income:</p>
                    <p className="font-bold m-0">$5,520.00</p>
                  </div>
                  <p className="m-0 text-center">*After Taxes and TSP*</p>
                </div>
                <div className="flex bg-[lightgray] border-1 border-gray-400 mt-4 rounded-xl gap-1 py-5 px-2">
                  <p>Average Monthly Bills:</p>
                  <p className="font-bold">$956.00</p>
                </div>
              </div>
              <div className="flex justify-center gap-4 items-center border-b pb-3">
                <div className="flex bg-[lightgray] border-1 border-gray-400 mt-4 rounded-xl gap-1 py-5 px-2">
                  <p>Available Monthly Spending:</p>
                  <p className="font-bold">$4,564.00</p>
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                <div className='flex justify-center items-center bg-[lightgray] border-1 border-gray-400 m-[10px] mt-4 rounded-xl'>
                  <div className="flex-2 border-r border-black">
                    <h4 className="text-center text-large font-bold">AMEX</h4>
                  </div>
                  <div className="flex-2 border-r border-black">
                    <p className="text-center">Full Bill</p>
                  </div>
                  <div className="flex-2 border-r border-black">
                    <p className="text-center">From: NFCU</p>
                  </div>
                  <div className="flex-2 border-r border-black">
                    <p className="text-center">1st of Month</p>
                  </div>
                  <div className="flex-1">
                    <Button className="m-2">Edit</Button>
                  </div>
                </div>
                <div className='flex justify-center items-center bg-[lightgray] border-1 border-gray-400 m-[10px] mt-4 rounded-xl'>
                  <div className="flex-2 border-r border-black">
                    <h4 className="text-center text-large font-bold">QQQ</h4>
                  </div>
                  <div className="flex-2 border-r border-black">
                    <p className="text-center">$2000</p>
                  </div>
                  <div className="flex-2 border-r border-black">
                    <p className="text-center">From: NFCU</p>
                  </div>
                  <div className="flex-2 border-r border-black">
                    <p className="text-center">1st of Month</p>
                  </div>
                  <div className="flex-1">
                    <Button className="m-2">Edit</Button>
                  </div>
                </div>
                <div className='flex justify-center items-center bg-[lightgray] border-1 border-gray-400 m-[10px] mt-4 rounded-xl'>
                  <div className="flex-2 border-r border-black">
                    <h4 className="text-center text-large font-bold">GOOG</h4>
                  </div>
                  <div className="flex-2 border-r border-black">
                    <p className="text-center">$500</p>
                  </div>
                  <div className="flex-2 border-r border-black">
                    <p className="text-center">From: NFCU</p>
                  </div>
                  <div className="flex-2 border-r border-black">
                    <p className="text-center">15th of Month</p>
                  </div>
                  <div className="flex-1">
                    <Button className="m-2">Edit</Button>
                  </div>
                </div>
              </div>
              <div className="mt-2 mx-2">
                <Button className="w-full" onClick={() => setModal(true)}>
                  <h3 className="m-3">+ New Control</h3>
                </Button>
              </div>
              <Control
                open={modal}
                onClose={() => setModal(false)}
              />
            </div>
            <div className="flex flex-2 flex-col min-h-0">
              <h3 className="text-center text-lg font-bold m-3 p-3 border-b">Bills</h3>
              <div className="overflow-y-auto flex-1">
                <div className='flex align-flex-start bg-[lightgray] border-1 border-gray-400 m-[10px] mt-0 rounded-xl'>
                  <div className="w-10 h-10 rounded-[50%] m-[10px] bg-[white]" />
                  <div className="flex-1">
                    <h4 className="text-center font-bold mt-2">Netflix</h4>
                    <p className="text-center">$9.99 / Month</p>
                  </div>
                  <Button className="m-3">Cancel</Button>
                </div>
                <div className='flex align-flex-start bg-[lightgray] border-1 border-gray-400 m-[10px] mt-0 rounded-xl'>
                  <div className="w-10 h-10 rounded-[50%] m-[10px] bg-[white]" />
                  <div className="flex-1">
                    <h4 className="text-center font-bold mt-2">Spotify</h4>
                    <p className="text-center">$11.99 / Month</p>
                  </div>
                  <Button className="m-3">Cancel</Button>
                </div>
                <div className='flex align-flex-start bg-[lightgray] border-1 border-gray-400 m-[10px] mt-0 rounded-xl'>
                  <div className="w-10 h-10 rounded-[50%] m-[10px] bg-[white]" />
                  <div className="flex-1">
                    <h4 className="text-center font-bold mt-2">AT&T</h4>
                    <p className="text-center">$100.00 / Month</p>
                  </div>
                  <Button className="m-3">Cancel</Button>
                </div>
                <div className='flex align-flex-start bg-[lightgray] border-1 border-gray-400 m-[10px] mt-0 rounded-xl'>
                  <div className="w-10 h-10 rounded-[50%] m-[10px] bg-[white]" />
                  <div className="flex-1">
                    <h4 className="text-center font-bold mt-2">NFCU</h4>
                    <p className="text-center">$350.00 / Month</p>
                  </div>
                  <Button className="m-3">Cancel</Button>
                </div>
                <div className='flex align-flex-start bg-[lightgray] border-1 border-gray-400 m-[10px] mt-0 rounded-xl'>
                  <div className="w-10 h-10 rounded-[50%] m-[10px] bg-[white]" />
                  <div className="flex-1">
                    <h4 className="text-center font-bold mt-2">Disney+</h4>
                    <p className="text-center">$12.00 / Month</p>
                  </div>
                  <Button className="m-3">Cancel</Button>
                </div>
                <div className='flex align-flex-start bg-[lightgray] border-1 border-gray-400 m-[10px] mt-0 rounded-xl'>
                  <div className="w-10 h-10 rounded-[50%] m-[10px] bg-[white]" />
                  <div className="flex-1">
                    <h4 className="text-center font-bold mt-2">New York Times</h4>
                    <p className="text-center">$8.00 / Month</p>
                  </div>
                  <Button className="m-3">Cancel</Button>
                </div>
                <div className='flex align-flex-start bg-[lightgray] border-1 border-gray-400 m-[10px] mt-0 rounded-xl'>
                  <div className="w-10 h-10 rounded-[50%] m-[10px] bg-[white]" />
                  <div className="flex-1">
                    <h4 className="text-center font-bold mt-2">Hulu</h4>
                    <p className="text-center">$11.99 / Month</p>
                  </div>
                  <Button className="m-3">Cancel</Button>
                </div>
                <div className='flex align-flex-start bg-[lightgray] border-1 border-gray-400 m-[10px] mt-0 rounded-xl'>
                  <div className="w-10 h-10 rounded-[50%] m-[10px] bg-[white]" />
                  <div className="flex-1">
                    <h4 className="text-center font-bold mt-2">Verizon</h4>
                    <p className="text-center">$89.99 / Month</p>
                  </div>
                  <Button className="m-3">Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
