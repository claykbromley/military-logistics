"use client"

import { useState, useMemo, useEffect } from "react"
import { Receipt, Pause, Play, Search, Filter, AlertCircle, Plus, RefreshCw, Loader2, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useBills, useAccounts } from "@/hooks/use-financial-manager"
import { createClient } from "@/lib/supabase/client"

type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "semiannual" | "annual"

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semiannual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
]

/** Multiplier to convert a given frequency amount → monthly equivalent */
const MONTHLY_MULTIPLIER: Record<Frequency, number> = {
  weekly: 52 / 12,
  biweekly: 26 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  semiannual: 1 / 6,
  annual: 1 / 12,
}

/** Multiplier to convert a given frequency amount → annual equivalent */
const ANNUAL_MULTIPLIER: Record<Frequency, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
}

function toMonthly(amount: number, frequency: Frequency): number {
  return amount * (MONTHLY_MULTIPLIER[frequency] ?? 1)
}

function toAnnual(amount: number, frequency: Frequency): number {
  return amount * (ANNUAL_MULTIPLIER[frequency] ?? 12)
}

function frequencyLabel(frequency: string): string {
  return FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label ?? frequency
}

function frequencyShortSuffix(frequency: string): string {
  switch (frequency) {
    case "weekly": return "/wk"
    case "biweekly": return "/2wk"
    case "monthly": return "/mo"
    case "quarterly": return "/qtr"
    case "semiannual": return "/6mo"
    case "annual": return "/yr"
    default: return "/mo"
  }
}

export function BillsTracker() {
  const { data: bills, error, isLoading, mutate, addBill: addBillToDb, updateBill, deleteBill: deleteBillFromDb } = useBills()
  const { data: accountsData } = useAccounts()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"monthly" | "annual">("monthly")
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    category: "other",
    frequency: "monthly" as Frequency,
    is_essential: false,
  })

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const isConnected = (accountsData?.accounts?.length || 0) > 0
  const billsList = bills || []

  const supabase = useMemo(() => createClient(), [])
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          setIsLoggedIn(true)
          mutate([], false)
          await Promise.all([mutate()])
        }

        if (event === "SIGNED_OUT") {
          setIsLoggedIn(false)
          mutate([], false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, mutate])

  const syncBills = async () => {
    setIsSyncing(true)
    try {
      await fetch("/api/plaid/sync-transactions", { method: "POST" })
      await mutate()
    } catch (err) {
      console.error("Sync failed:", err)
    }
    setIsSyncing(false)
  }

  const toggleBillHold = async (bill: { id: string; is_on_hold: boolean }) => {
    try {
      await updateBill(bill.id, { is_on_hold: !bill.is_on_hold })
    } catch (err) {
      console.error("Toggle hold failed:", err)
    }
  }

  const deleteBill = async (id: string) => {
    try {
      await deleteBillFromDb(id)
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const handleAddBill = async () => {
    if (!newBill.name || !newBill.amount) return
    try {
      await addBillToDb({
        name: newBill.name,
        category: newBill.category,
        amount: parseFloat(newBill.amount),
        frequency: newBill.frequency,
        is_essential: newBill.is_essential,
      })
      setNewBill({ name: "", amount: "", category: "other", frequency: "monthly", is_essential: false })
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error("Add bill failed:", err)
    }
  }

  const filteredBills = billsList.filter((bill) => {
    const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.merchant_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || bill.category === categoryFilter
    const matchesFrequency = frequencyFilter === "all" || bill.frequency === frequencyFilter
    return matchesSearch && matchesCategory && matchesFrequency
  })

  // Normalized totals across all frequencies
  const totalMonthly = billsList.reduce(
    (sum, bill) => sum + (bill.is_on_hold ? 0 : toMonthly(Number(bill.amount), bill.frequency as Frequency)),
    0
  )
  const totalAnnual = billsList.reduce(
    (sum, bill) => sum + (bill.is_on_hold ? 0 : toAnnual(Number(bill.amount), bill.frequency as Frequency)),
    0
  )
  const onHoldMonthly = billsList.reduce(
    (sum, bill) => sum + (bill.is_on_hold ? toMonthly(Number(bill.amount), bill.frequency as Frequency) : 0),
    0
  )

  const categories = [...new Set(billsList.map((b) => b.category))].sort()

  // Group bills by frequency for summary
  const frequencyBreakdown = FREQUENCY_OPTIONS.filter((f) =>
    billsList.some((b) => b.frequency === f.value && !b.is_on_hold)
  ).map((f) => {
    const total = billsList
      .filter((b) => b.frequency === f.value && !b.is_on_hold)
      .reduce((sum, b) => sum + Number(b.amount), 0)
    const count = billsList.filter((b) => b.frequency === f.value && !b.is_on_hold).length
    return { ...f, total, count }
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "utilities": return "bg-chart-3/20 text-foreground border border-chart-3/40"
      case "insurance": return "bg-chart-1/20 text-foreground border border-chart-1/40"
      case "subscription": return "bg-chart-4/20 text-foreground border border-chart-4/40"
      case "housing": return "bg-primary/10 text-foreground border border-primary/30"
      case "telecom": return "bg-chart-2/20 text-foreground border border-chart-2/40"
      case "debt": return "bg-destructive/10 text-foreground border border-destructive/30"
      case "fitness": return "bg-accent/10 text-foreground border border-accent/30"
      default: return "bg-muted text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const addBillFormContent = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Bill Name</Label>
        <Input
          placeholder="e.g., Electric Company"
          value={newBill.name}
          onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount ($)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={newBill.amount}
            onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select
            value={newBill.frequency}
            onValueChange={(v) => setNewBill({ ...newBill, frequency: v as Frequency })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={newBill.category}
          onValueChange={(v) => setNewBill({ ...newBill, category: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="housing">Housing</SelectItem>
            <SelectItem value="telecom">Telecom</SelectItem>
            <SelectItem value="debt">Debt</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Monthly equivalent preview for non-monthly frequencies */}
      {newBill.frequency !== "monthly" && newBill.amount && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          ≈ ${toMonthly(parseFloat(newBill.amount) || 0, newBill.frequency).toFixed(2)}/mo ≈
          ${toAnnual(parseFloat(newBill.amount) || 0, newBill.frequency).toFixed(2)}/yr
        </div>
      )}
      <div className="flex items-center gap-3">
        <Switch
          checked={newBill.is_essential}
          onCheckedChange={(v) => setNewBill({ ...newBill, is_essential: v })}
        />
        <Label>Essential bill</Label>
      </div>
      <Button onClick={handleAddBill} disabled={!newBill.name || !newBill.amount} className="w-full bg-primary text-primary-foreground hover:bg-accent cursor-pointer">
        Add Bill
      </Button>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Receipt className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Recurring Bills</CardTitle>
              <CardDescription>
                {billsList.length > 0
                  ? `${billsList.length} recurring bill${billsList.length !== 1 ? "s" : ""} tracked`
                  : "Track and manage recurring expenses"}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <button
              onClick={() => setViewMode(viewMode === "monthly" ? "annual" : "monthly")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {viewMode === "monthly" ? "Monthly ↔" : "Annual ↔"}
            </button>
            <p className="text-xl font-bold text-foreground">
              ${viewMode === "monthly" ? totalMonthly.toFixed(2) : totalAnnual.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">
                {viewMode === "monthly" ? "/mo" : "/yr"}
              </span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
            Failed to load bills. Please try again.
          </div>
        )}

        {!isConnected && billsList.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border dark:border-slate-500 rounded-lg">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-1">Connect a bank account to auto-detect bills</p>
            <p className="text-xs text-muted-foreground mb-4">Or add bills manually below</p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={!isLoggedIn} className=" bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoggedIn ? "Add Bill Manually" : "Log In to Add Bills"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Bill</DialogTitle>
                  <DialogDescription>Manually track a recurring bill.</DialogDescription>
                </DialogHeader>
                {addBillFormContent}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <>
            {/* Frequency breakdown summary */}
            {frequencyBreakdown.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {frequencyBreakdown.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFrequencyFilter(frequencyFilter === f.value ? "all" : f.value)}
                    className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer dark:border-slate-500 ${
                      frequencyFilter === f.value
                        ? "bg-primary/15 border-primary/40 text-foreground"
                        : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-medium">{f.count}</span> {f.label}
                    <span className="ml-1 opacity-70">
                      ${f.total.toFixed(0)}{frequencyShortSuffix(f.value)}
                    </span>
                  </button>
                ))}
                {frequencyFilter !== "all" && (
                  <button
                    onClick={() => setFrequencyFilter("all")}
                    className="text-xs px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Search and filter bar */}
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
                <SelectTrigger className="w-full sm:w-40 dark:border-slate-500">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="capitalize">{cat}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Savings banner */}
            {onHoldMonthly > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pause className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Bills on Hold</span>
                  </div>
                  <span className="font-bold text-accent">
                    Saving ${viewMode === "monthly" ? onHoldMonthly.toFixed(2) : (onHoldMonthly * 12).toFixed(2)}
                    {viewMode === "monthly" ? "/mo" : "/yr"}
                  </span>
                </div>
              </div>
            )}

            {/* Bills list */}
            <div className="space-y-2 max-h-50 overflow-y-auto">
              {filteredBills.map((bill) => {
                const freq = (bill.frequency || "monthly") as Frequency
                const amount = Number(bill.amount)
                const monthlyEquiv = toMonthly(amount, freq)
                const isNonMonthly = freq !== "monthly"

                return (
                  <div
                    key={bill.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      bill.is_on_hold
                        ? "border-accent/50 bg-accent/5 opacity-75"
                        : "border-border bg-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <Switch
                          checked={!bill.is_on_hold}
                          onCheckedChange={() => toggleBillHold(bill)}
                        />
                        <span className="text-[10px] text-muted-foreground mt-1">
                          {bill.is_on_hold ? "Paused" : "Active"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${bill.is_on_hold ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {bill.merchant_name || bill.name}
                          </p>
                          {bill.is_essential && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Essential</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-[10px] capitalize ${getCategoryColor(bill.category)}`}>
                            {bill.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                            {frequencyLabel(freq)}
                          </Badge>
                          {bill.next_date && (
                            <span className="text-xs text-muted-foreground">
                              Next: {new Date(bill.next_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className={`font-semibold ${bill.is_on_hold ? "text-muted-foreground" : "text-foreground"}`}>
                          ${amount.toFixed(2)}
                          <span className="text-xs font-normal text-muted-foreground">
                            {frequencyShortSuffix(freq)}
                          </span>
                        </p>
                        {isNonMonthly && (
                          <p className="text-[10px] text-muted-foreground">
                            ≈ ${monthlyEquiv.toFixed(2)}/mo
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBillHold(bill)}
                        className={`cursor-pointer ${bill.is_on_hold ? "text-accent" : "text-muted-foreground"}`}
                      >
                        {bill.is_on_hold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBill(bill.id)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {filteredBills.length === 0 && billsList.length > 0 && (
                <p className="text-center text-muted-foreground py-6 text-sm">
                  No bills match your filters.
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              {isConnected && (
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent cursor-pointer dark:border-slate-500"
                  onClick={syncBills}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Syncing...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4 mr-2" />Sync Bills</>
                  )}
                </Button>
              )}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 bg-transparent cursor-pointer dark:border-slate-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Manually
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Bill</DialogTitle>
                    <DialogDescription>Manually track a recurring bill.</DialogDescription>
                  </DialogHeader>
                  {addBillFormContent}
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}