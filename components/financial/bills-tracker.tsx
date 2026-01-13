"use client"

import { useState, useEffect } from "react"
import { Receipt, Pause, Play, Search, Filter, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Bill {
  id: string
  name: string
  category: string
  amount: number
  dueDate: string
  frequency: string
  isOnHold: boolean
  essential: boolean
}

const MOCK_BILLS: Bill[] = [
  {
    id: "1",
    name: "Electric Company",
    category: "utilities",
    amount: 145.0,
    dueDate: "15th",
    frequency: "Monthly",
    isOnHold: false,
    essential: true,
  },
  {
    id: "2",
    name: "Internet Service",
    category: "utilities",
    amount: 89.99,
    dueDate: "1st",
    frequency: "Monthly",
    isOnHold: false,
    essential: false,
  },
  {
    id: "3",
    name: "Car Insurance",
    category: "insurance",
    amount: 156.0,
    dueDate: "20th",
    frequency: "Monthly",
    isOnHold: false,
    essential: true,
  },
  {
    id: "4",
    name: "Gym Membership",
    category: "subscription",
    amount: 49.99,
    dueDate: "5th",
    frequency: "Monthly",
    isOnHold: false,
    essential: false,
  },
  {
    id: "5",
    name: "Streaming Service",
    category: "subscription",
    amount: 15.99,
    dueDate: "12th",
    frequency: "Monthly",
    isOnHold: false,
    essential: false,
  },
  {
    id: "6",
    name: "Phone Plan",
    category: "utilities",
    amount: 85.0,
    dueDate: "25th",
    frequency: "Monthly",
    isOnHold: false,
    essential: true,
  },
  {
    id: "7",
    name: "Renter's Insurance",
    category: "insurance",
    amount: 25.0,
    dueDate: "1st",
    frequency: "Monthly",
    isOnHold: false,
    essential: true,
  },
  {
    id: "8",
    name: "Storage Unit",
    category: "other",
    amount: 125.0,
    dueDate: "10th",
    frequency: "Monthly",
    isOnHold: false,
    essential: false,
  },
]

interface BillsTrackerProps {
  isConnected: boolean
}

export function BillsTracker({ isConnected }: BillsTrackerProps) {
  const [bills, setBills] = useState<Bill[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (isConnected && bills.length === 0) {
      scanForBills()
    }
  }, [isConnected])

  const scanForBills = async () => {
    setIsScanning(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setBills(MOCK_BILLS)
    setIsScanning(false)
  }

  const toggleBillHold = (id: string) => {
    setBills(bills.map((bill) => (bill.id === id ? { ...bill, isOnHold: !bill.isOnHold } : bill)))
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || bill.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalMonthly = bills.reduce((sum, bill) => sum + (bill.isOnHold ? 0 : bill.amount), 0)
  const onHoldSavings = bills.reduce((sum, bill) => sum + (bill.isOnHold ? bill.amount : 0), 0)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "utilities":
        return "bg-chart-3 text-foreground"
      case "insurance":
        return "bg-chart-1 text-accent-foreground"
      case "subscription":
        return "bg-chart-4 text-warning-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Receipt className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Monthly Bills</CardTitle>
              <CardDescription>Track and manage recurring expenses</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active Monthly</p>
            <p className="text-xl font-bold text-foreground">${totalMonthly.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Connect a bank account to scan for bills</p>
          </div>
        ) : isScanning ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-accent border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Scanning transactions for recurring bills...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="subscription">Subscriptions</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {onHoldSavings > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pause className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Bills on Hold</span>
                  </div>
                  <span className="font-bold text-accent">Saving ${onHoldSavings.toFixed(2)}/mo</span>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredBills.map((bill) => (
                <div
                  key={bill.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    bill.isOnHold ? "border-accent/50 bg-accent/5 opacity-75" : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <Switch checked={!bill.isOnHold} onCheckedChange={() => toggleBillHold(bill.id)} />
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {bill.isOnHold ? "Paused" : "Active"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-medium ${bill.isOnHold ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {bill.name}
                        </p>
                        {bill.essential && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Essential
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[10px] ${getCategoryColor(bill.category)}`}>{bill.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Due: {bill.dueDate} • {bill.frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-semibold ${bill.isOnHold ? "text-muted-foreground" : "text-foreground"}`}>
                      ${bill.amount.toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBillHold(bill.id)}
                      className={bill.isOnHold ? "text-accent" : "text-muted-foreground"}
                    >
                      {bill.isOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={scanForBills}>
              <Search className="w-4 h-4 mr-2" />
              Rescan Transactions
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
