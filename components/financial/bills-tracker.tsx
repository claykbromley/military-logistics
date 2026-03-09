"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Receipt, Pause, Play, Search, Filter, AlertCircle, Plus, RefreshCw,
  Loader2, Trash2, Pencil, X, Check, ChevronDown, ChevronUp, TrendingDown,
  Zap, Shield, CreditCard, Calendar
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { useBills, useAccounts } from "@/hooks/use-financial-manager"
import { createClient } from "@/lib/supabase/client"

/* ───────────────────────── Types & constants ───────────────────────── */

type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "semiannual" | "annual"

interface BillFormState {
  name: string
  amount: string
  category: string
  frequency: Frequency
  is_essential: boolean
  account_id: string
  next_date: string
  merchant_name: string
}

const EMPTY_FORM: BillFormState = {
  name: "",
  amount: "",
  category: "other",
  frequency: "monthly",
  is_essential: false,
  account_id: "",
  next_date: "",
  merchant_name: "",
}

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semiannual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
]

const CATEGORY_OPTIONS = [
  { value: "utilities", label: "Utilities" },
  { value: "insurance", label: "Insurance" },
  { value: "subscription", label: "Subscription" },
  { value: "housing", label: "Housing" },
  { value: "telecom", label: "Telecom" },
  { value: "debt", label: "Debt" },
  { value: "fitness", label: "Fitness" },
  { value: "other", label: "Other" },
]

const MONTHLY_MULTIPLIER: Record<Frequency, number> = {
  weekly: 52 / 12, biweekly: 26 / 12, monthly: 1,
  quarterly: 1 / 3, semiannual: 1 / 6, annual: 1 / 12,
}

const ANNUAL_MULTIPLIER: Record<Frequency, number> = {
  weekly: 52, biweekly: 26, monthly: 12, quarterly: 4, semiannual: 2, annual: 1,
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
  const map: Record<string, string> = {
    weekly: "/wk", biweekly: "/2wk", monthly: "/mo",
    quarterly: "/qtr", semiannual: "/6mo", annual: "/yr",
  }
  return map[frequency] ?? "/mo"
}

const CATEGORY_STYLES: Record<string, string> = {
  utilities: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
  insurance: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30",
  subscription: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30",
  housing: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
  telecom: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30",
  debt: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30",
  fitness: "bg-lime-500/15 text-lime-700 dark:text-lime-400 border border-lime-500/30",
  other: "bg-muted text-muted-foreground border border-border",
}

const CATEGORY_ICONS: Record<string, typeof Zap> = {
  utilities: Zap,
  insurance: Shield,
  subscription: Receipt,
  housing: CreditCard,
  telecom: Zap,
  debt: TrendingDown,
  fitness: Zap,
  other: Receipt,
}

/* ───────────────────────── Bill Form Component ───────────────────────── */

function BillForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  submitLabel,
  plaidAccounts,
}: {
  form: BillFormState
  setForm: (f: BillFormState) => void
  onSubmit: () => void
  onCancel?: () => void
  submitLabel: string
  plaidAccounts: any[]
}) {
  const canSubmit = form.name.trim() && form.amount && parseFloat(form.amount) > 0

  return (
    <div className="space-y-5 py-2">
      {/* Name + Merchant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Bill Name
          </Label>
          <Input
            placeholder="e.g., Electric Company"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Merchant (optional)
          </Label>
          <Input
            placeholder="e.g., Duke Energy"
            value={form.merchant_name}
            onChange={(e) => setForm({ ...form, merchant_name: e.target.value })}
            className="bg-background"
          />
        </div>
      </div>

      {/* Amount + Frequency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Amount ($)
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Frequency
          </Label>
          <Select
            value={form.frequency}
            onValueChange={(v) => setForm({ ...form, frequency: v as Frequency })}
          >
            <SelectTrigger className="bg-background cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Equivalent preview */}
      {form.frequency !== "monthly" && form.amount && parseFloat(form.amount) > 0 && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 flex items-center gap-3">
          <span>≈ ${toMonthly(parseFloat(form.amount), form.frequency).toFixed(2)}/mo</span>
          <span className="text-muted-foreground/40">•</span>
          <span>≈ ${toAnnual(parseFloat(form.amount), form.frequency).toFixed(2)}/yr</span>
        </div>
      )}

      {/* Category + Funding Source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Category
          </Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger className="bg-background cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Funding Source
          </Label>
          <Select
            value={form.account_id}
            onValueChange={(v) => setForm({ ...form, account_id: v })}
          >
            <SelectTrigger className="bg-background cursor-pointer">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {plaidAccounts
                .filter((a: any) => a.type === "depository")
                .map((acct: any) => (
                  <SelectItem key={acct.id} value={acct.id}>
                    {acct.name} – ${Number(acct.balance_current).toFixed(2)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Next Due Date */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Next Due Date (optional)
        </Label>
        <Input
          type="date"
          value={form.next_date}
          onChange={(e) => setForm({ ...form, next_date: e.target.value })}
          className="bg-background"
        />
      </div>

      {/* Essential toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
        <div>
          <p className="text-sm font-medium">Essential Bill</p>
          <p className="text-xs text-muted-foreground">Mark as non-negotiable (housing, utilities, etc.)</p>
        </div>
        <Switch
          checked={form.is_essential}
          onCheckedChange={(v) => setForm({ ...form, is_essential: v })}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 cursor-pointer"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

/* ───────────────────────── Main Component ───────────────────────── */

export function BillsTracker() {
  const {
    data: bills, error, isLoading, mutate,
    addBill: addBillToDb, updateBill, deleteBill: deleteBillFromDb,
  } = useBills()
  const { data: accountsData } = useAccounts()

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"monthly" | "annual">("monthly")
  const [sortField, setSortField] = useState<"amount" | "name" | "category" | "next_date">("amount")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ count: number; show: boolean } | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newBill, setNewBill] = useState<BillFormState>({ ...EMPTY_FORM })
  const [editForm, setEditForm] = useState<BillFormState>({ ...EMPTY_FORM })

  const plaidAccounts = accountsData?.accounts || []
  const isConnected = plaidAccounts.length > 0
  const billsList = bills || []

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") { setIsLoggedIn(true); await mutate() }
      if (event === "SIGNED_OUT") { setIsLoggedIn(false); mutate([], false) }
    })
    return () => subscription.unsubscribe()
  }, [supabase, mutate])

  /* ── Sync ── */
  const syncBills = async () => {
    setIsSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch("/api/plaid/sync-transactions", { method: "POST" })
      const data = await res.json()
      await mutate()
      setSyncResult({ count: data.bills_found ?? 0, show: true })
      setTimeout(() => setSyncResult(null), 5000)
    } catch (err) {
      console.error("Sync failed:", err)
    }
    setIsSyncing(false)
  }

  /* ── Toggle hold ── */
  const toggleBillHold = async (bill: { id: string; is_on_hold: boolean }) => {
    try { await updateBill(bill.id, { is_on_hold: !bill.is_on_hold }) }
    catch (err) { console.error("Toggle hold failed:", err) }
  }

  /* ── Delete ── */
  const deleteBill = async (id: string) => {
    setDeletingId(id)
    try { await deleteBillFromDb(id) }
    catch (err) { console.error("Delete failed:", err) }
    setDeletingId(null)
  }

  /* ── Add ── */
  const handleAddBill = async () => {
    if (!newBill.name || !newBill.amount) return
    try {
      await addBillToDb({
        name: newBill.name,
        account_id: newBill.account_id || undefined,
        merchant_name: newBill.merchant_name || undefined,
        category: newBill.category,
        amount: parseFloat(newBill.amount),
        frequency: newBill.frequency,
        is_essential: newBill.is_essential,
        next_date: newBill.next_date || undefined,
      })
      setNewBill({ ...EMPTY_FORM })
      setIsAddDialogOpen(false)
    } catch (err) { console.error("Add bill failed:", err) }
  }

  /* ── Edit ── */
  const openEditDialog = useCallback((bill: any) => {
    setEditingBill(bill)
    setEditForm({
      name: bill.name || "",
      amount: String(bill.amount ?? ""),
      category: bill.category || "other",
      frequency: (bill.frequency || "monthly") as Frequency,
      is_essential: bill.is_essential ?? false,
      account_id: bill.account_id || "",
      next_date: bill.next_date ? bill.next_date.slice(0, 10) : "",
      merchant_name: bill.merchant_name || "",
    })
    setIsEditDialogOpen(true)
  }, [])

  const handleEditBill = async () => {
    if (!editingBill || !editForm.name || !editForm.amount) return
    try {
      await updateBill(editingBill.id, {
        name: editForm.name,
        merchant_name: editForm.merchant_name || null,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        frequency: editForm.frequency,
        is_essential: editForm.is_essential,
        account_id: editForm.account_id || null,
        next_date: editForm.next_date || null,
      })
      setIsEditDialogOpen(false)
      setEditingBill(null)
    } catch (err) { console.error("Edit bill failed:", err) }
  }

  /* ── Filtering & sorting ── */
  const filteredBills = useMemo(() => {
    let result = billsList.filter((bill) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = bill.name.toLowerCase().includes(q) ||
        (bill.merchant_name || "").toLowerCase().includes(q)
      const matchesCategory = categoryFilter === "all" || bill.category === categoryFilter
      const matchesFrequency = frequencyFilter === "all" || bill.frequency === frequencyFilter
      return matchesSearch && matchesCategory && matchesFrequency
    })

    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "amount":
          cmp = toMonthly(Number(a.amount), a.frequency as Frequency) -
                toMonthly(Number(b.amount), b.frequency as Frequency)
          break
        case "name":
          cmp = (a.merchant_name || a.name).localeCompare(b.merchant_name || b.name)
          break
        case "category":
          cmp = (a.category || "").localeCompare(b.category || "")
          break
        case "next_date":
          cmp = (a.next_date || "9999").localeCompare(b.next_date || "9999")
          break
      }
      return sortDir === "desc" ? -cmp : cmp
    })

    return result
  }, [billsList, searchQuery, categoryFilter, frequencyFilter, sortField, sortDir])

  /* ── Computed totals ── */
  const totalMonthly = billsList.reduce(
    (sum, b) => sum + (b.is_on_hold ? 0 : toMonthly(Number(b.amount), b.frequency as Frequency)), 0
  )
  const totalAnnual = billsList.reduce(
    (sum, b) => sum + (b.is_on_hold ? 0 : toAnnual(Number(b.amount), b.frequency as Frequency)), 0
  )
  const onHoldMonthly = billsList.reduce(
    (sum, b) => sum + (b.is_on_hold ? toMonthly(Number(b.amount), b.frequency as Frequency) : 0), 0
  )
  const essentialMonthly = billsList.reduce(
    (sum, b) => sum + (b.is_essential && !b.is_on_hold ? toMonthly(Number(b.amount), b.frequency as Frequency) : 0), 0
  )

  const activeBills = billsList.filter((b) => !b.is_on_hold)
  const heldBills = billsList.filter((b) => b.is_on_hold)

  const categories = [...new Set(billsList.map((b) => b.category))].sort()

  const frequencyBreakdown = FREQUENCY_OPTIONS.filter((f) =>
    billsList.some((b) => b.frequency === f.value && !b.is_on_hold)
  ).map((f) => {
    const matching = billsList.filter((b) => b.frequency === f.value && !b.is_on_hold)
    const total = matching.reduce((sum, b) => sum + Number(b.amount), 0)
    return { ...f, total, count: matching.length }
  })

  /* ── Sort toggle helper ── */
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === "desc" ? "asc" : "desc")
    else { setSortField(field); setSortDir("asc") }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    sortField === field
      ? sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      : <ChevronUp className="w-3 h-3 opacity-30" />
  )

  /* ── Loading state ── */
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
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ── Render ── */
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Receipt className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Bill Manager</CardTitle>
                <CardDescription>
                  {billsList.length > 0
                    ? `${activeBills.length} active${heldBills.length > 0 ? `, ${heldBills.length} on hold` : ""}`
                    : "Track and manage recurring expenses"}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => setViewMode(viewMode === "monthly" ? "annual" : "monthly")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-0.5"
              >
                {viewMode === "monthly" ? "Show Annual ↔" : "Show Monthly ↔"}
              </button>
              <p className="text-2xl font-bold tabular-nums text-foreground leading-tight">
                ${viewMode === "monthly" ? totalMonthly.toFixed(2) : totalAnnual.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground ml-0.5">
                  {viewMode === "monthly" ? "/mo" : "/yr"}
                </span>
              </p>
            </div>
          </div>

          {/* Summary chips */}
          {billsList.length > 0 && (
            <div className="flex flex-wrap gap-3 pb-4 border-b border-border items-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Essential:
                <span className="font-semibold text-foreground">
                  ${viewMode === "monthly" ? essentialMonthly.toFixed(0) : (essentialMonthly * 12).toFixed(0)}
                  {viewMode === "monthly" ? "/mo" : "/yr"}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Non-essential:
                <span className="font-semibold text-foreground">
                  ${viewMode === "monthly"
                    ? (totalMonthly - essentialMonthly).toFixed(0)
                    : ((totalMonthly - essentialMonthly) * 12).toFixed(0)}
                  {viewMode === "monthly" ? "/mo" : "/yr"}
                </span>
              </div>
              {onHoldMonthly > 0 && (
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    
                    On hold:
                    <span className="font-semibold text-foreground">
                      ${viewMode === "monthly" ? onHoldMonthly.toFixed(0) : (onHoldMonthly * 12).toFixed(0)}
                      {viewMode === "monthly" ? "/mo" : "/yr"} saved
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {error && !billsList.length && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Failed to load bills. Please try again.
            </div>
          )}

          {/* Sync success toast */}
          {syncResult?.show && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              Sync complete — {syncResult.count} recurring bill{syncResult.count !== 1 ? "s" : ""} detected from your bank transactions.
            </div>
          )}

          {/* Empty state */}
          {!isConnected && billsList.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-border dark:border-slate-500 rounded-xl">
              <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium mb-1">
                No bills tracked yet
              </p>
              <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">
                Connect a bank account to automatically detect recurring charges, or add bills manually.
              </p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={!isLoggedIn}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoggedIn ? "Add Your First Bill" : "Log In to Add Bills"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Bill</DialogTitle>
                    <DialogDescription>Track a new recurring bill.</DialogDescription>
                  </DialogHeader>
                  <BillForm
                    form={newBill}
                    setForm={setNewBill}
                    onSubmit={handleAddBill}
                    submitLabel="Add Bill"
                    plaidAccounts={plaidAccounts}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <>
              {/* Frequency breakdown pills */}
              {frequencyBreakdown.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {frequencyBreakdown.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFrequencyFilter(frequencyFilter === f.value ? "all" : f.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer ${
                        frequencyFilter === f.value
                          ? "bg-primary/15 border-primary/40 text-foreground font-medium"
                          : "bg-muted/50 border-border dark:border-slate-600 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      <span className="font-semibold">{f.count}</span> {f.label}
                      <span className="ml-1 opacity-60">
                        ${f.total.toFixed(0)}{frequencyShortSuffix(f.value)}
                      </span>
                    </button>
                  ))}
                  {frequencyFilter !== "all" && (
                    <button
                      onClick={() => setFrequencyFilter("all")}
                      className="text-xs px-2 py-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="w-3 h-3 inline mr-0.5" /> Clear
                    </button>
                  )}
                </div>
              )}

              {/* Search + filters */}
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
                  <SelectTrigger className="w-full sm:w-44 dark:border-slate-500">
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

              {/* Sort bar */}
              <div className="flex items-center gap-1 mb-3 text-[11px] text-muted-foreground">
                <span className="mr-1">Sort:</span>
                {([
                  ["amount", "Amount"],
                  ["name", "Name"],
                  ["category", "Category"],
                  ["next_date", "Due Date"],
                ] as [typeof sortField, string][]).map(([field, label]) => (
                  <button
                    key={field}
                    onClick={() => toggleSort(field)}
                    className={`flex items-center gap-0.5 px-2 py-1 rounded cursor-pointer transition-colors ${
                      sortField === field
                        ? "bg-primary/10 text-foreground font-medium"
                        : "hover:bg-muted"
                    }`}
                  >
                    {label} <SortIcon field={field} />
                  </button>
                ))}
              </div>

              {/* On-hold savings banner */}
              {onHoldMonthly > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-primary/40 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pause className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {heldBills.length} bill{heldBills.length !== 1 ? "s" : ""} on hold
                      </span>
                    </div>
                    <span className="font-bold text-muted-foreground tabular-nums">
                      Saving ${viewMode === "monthly" ? onHoldMonthly.toFixed(2) : (onHoldMonthly * 12).toFixed(2)}
                      {viewMode === "monthly" ? "/mo" : "/yr"}
                    </span>
                  </div>
                </div>
              )}

              {/* Bills list */}
              <div className="space-y-2 max-h-120 overflow-y-auto pr-1">
                {filteredBills.map((bill) => {
                  const freq = (bill.frequency || "monthly") as Frequency
                  const amount = Number(bill.amount)
                  const monthlyEquiv = toMonthly(amount, freq)
                  const isNonMonthly = freq !== "monthly"

                  return (
                    <div
                      key={bill.id}
                      className={`rounded-lg border transition-all ${
                        bill.is_on_hold
                          ? "border-accent/50 bg-accent/5 opacity-75"
                          : "border-border bg-primary/20"
                      }`}
                    >
                      {/* Main row */}
                      <div className="flex items-center justify-between p-3 sm:p-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Hold toggle */}
                          <button
                            onClick={() => toggleBillHold(bill)}
                            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center bg-secondary hover:bg-accent text-secondary-foreground justify-center transition-colors cursor-pointer`}
                            title={bill.is_on_hold ? "Resume bill" : "Put on hold"}
                          >
                            {bill.is_on_hold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          </button>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-medium truncate ${
                                bill.is_on_hold ? "line-through text-muted-foreground" : "text-foreground"
                              }`}>
                                {bill.merchant_name || bill.name}
                              </p>
                              {bill.is_essential && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0 border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
                                  Essential
                                </Badge>
                              )}
                              {bill.is_on_hold && (
                                <Badge className="text-[10px] px-1.5 py-0 flex-shrink-0 bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                  On Hold
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge className={`text-[10px] capitalize ${CATEGORY_STYLES[bill.category] || CATEGORY_STYLES.other}`}>
                                {bill.category}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground">
                                {frequencyLabel(freq)}
                              </span>
                              {bill.next_date && (
                                <>
                                  <span className="text-muted-foreground/30">•</span>
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(bill.next_date).toLocaleDateString(undefined, {
                                      month: "short", day: "numeric",
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount + actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <div className="text-right">
                            <p className={`font-semibold tabular-nums ${
                              bill.is_on_hold ? "text-muted-foreground" : "text-foreground"
                            }`}>
                              ${amount.toFixed(2)}
                              <span className="text-[11px] font-normal text-muted-foreground">
                                {frequencyShortSuffix(freq)}
                              </span>
                            </p>
                            {isNonMonthly && (
                              <p className="text-[10px] text-muted-foreground tabular-nums">
                                ≈ ${monthlyEquiv.toFixed(2)}/mo
                              </p>
                            )}
                          </div>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(bill)}
                            className="text-muted-foreground hover:text-white h-8 w-8 cursor-pointer"
                            title="Edit bill"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Delete "${bill.merchant_name || bill.name}"?`)) deleteBill(bill.id)
                            }}
                            disabled={deletingId === bill.id}
                            className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer"
                            title="Delete bill"
                          >
                            {deletingId === bill.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredBills.length === 0 && billsList.length > 0 && (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No bills match your filters.</p>
                  </div>
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
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Detecting Bills…</>
                    ) : (
                      <><RefreshCw className="w-4 h-4 mr-2" />Sync from Bank</>
                    )}
                  </Button>
                )}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 bg-transparent cursor-pointer dark:border-slate-500">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Bill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add Bill</DialogTitle>
                      <DialogDescription>Track a new recurring bill.</DialogDescription>
                    </DialogHeader>
                    <BillForm
                      form={newBill}
                      setForm={setNewBill}
                      onSubmit={handleAddBill}
                      submitLabel="Add Bill"
                      plaidAccounts={plaidAccounts}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
            <DialogDescription>
              Update details for {editingBill?.merchant_name || editingBill?.name || "this bill"}.
            </DialogDescription>
          </DialogHeader>
          <BillForm
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEditBill}
            onCancel={() => setIsEditDialogOpen(false)}
            submitLabel="Save Changes"
            plaidAccounts={plaidAccounts}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}