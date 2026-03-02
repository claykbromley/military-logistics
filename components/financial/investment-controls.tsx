"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import useSWR from "swr"
import {
  TrendingUp, Plus, Trash2, DollarSign, Hash, Calendar,
  Loader2, PlayCircle, Briefcase, Search, Brain,
  Zap, ShieldCheck, Info, Sparkles, X, Edit, ArrowRightLeft,
  ArrowDownRight, InfoIcon, Shield, ExternalLink, ArrowUpRight,
  Building2, Lock, CreditCard, HelpCircle, ChevronDown, ChevronRight,
  AlertTriangle, Check, Ban, Wallet, BanknoteIcon, Clock,
  CircleDollarSign, CheckCircle2, RefreshCw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { fetcher } from "@/lib/fetcher"
import { useInvestmentRules, useAccounts } from "@/hooks/use-financial-manager"
import type { AlpacaAccount, AlpacaPosition, Account } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

// ── Types ──────────────────────────────────────────────────────────────────────

interface TickerSearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
  price?: number
}

interface SellOrderState {
  symbol: string
  qty: string
  currentQty: string
  currentPrice: number
  marketValue: number
  orderType: "market" | "limit"
  limitPrice: string
  sellAll: boolean
}

interface TradeNotification {
  id: string
  type: "buy" | "sell" | "error" | "skip" | "funding" | "withdraw"
  symbol: string
  message: string
  detail?: string
  timestamp: number
}

interface FundingTransfer {
  id: string
  alpaca_transfer_id: string
  direction: "INCOMING" | "OUTGOING"
  amount: number | string
  status: string
  funding_account_id?: string
  bank_name?: string
  triggered_by_rule_id?: string
  created_at: string
  updated_at?: string
}

// ── Ticker Search Hook ─────────────────────────────────────────────────────────

function useTickerSearch(query: string) {
  const [results, setResults] = useState<TickerSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 1) { setResults([]); return }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/alpaca/search-tickers?q=${encodeURIComponent(q)}`)
      if (res.ok) { const data = await res.json(); setResults(data.results || data || []) }
    } catch { setResults([]) }
    setIsSearching(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  return { results, isSearching }
}

// ── Stock Price Hook ───────────────────────────────────────────────────────────

function useStockPrice(symbol: string | null) {
  const { data, isLoading } = useSWR<{ price: number; change: number; changePercent: number }>(
    symbol ? `/api/alpaca/quote/${symbol}` : null, fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )
  return { price: data?.price ?? null, change: data?.change, changePercent: data?.changePercent, isLoading }
}

// ── Funding Transfers Hook ─────────────────────────────────────────────────────

function useFundingTransfers(alpacaConnected: boolean) {
  const { data, isLoading, mutate } = useSWR<FundingTransfer[]>(
    alpacaConnected ? "/api/alpaca/transfer" : null, fetcher,
    { revalidateOnFocus: true, refreshInterval: 30_000, onError: () => {} }
  )
  return { transfers: data || [], isLoading, mutate }
}

// ── ACH Relationships Hook ─────────────────────────────────────────────────────

function useACHRelationships(alpacaConnected: boolean) {
  const { data, mutate } = useSWR<{ relationships: Array<{ id: string; plaid_account_id: string; alpaca_relationship_id: string; status: string }> }>(
    alpacaConnected ? "/api/alpaca/link-bank" : null, fetcher,
    { revalidateOnFocus: false, onError: () => {} }
  )
  return { relationships: data?.relationships || [], mutate }
}

// ── Link Bank Helper ───────────────────────────────────────────────────────────

async function ensureBankLinked(plaidAccountId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/alpaca/link-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plaid_account_id: plaidAccountId }),
    })
    const data = await res.json()
    if (res.ok || data.already_linked) return { success: true }
    return { success: false, error: data.error || "Failed to link bank" }
  } catch {
    return { success: false, error: "Network error linking bank" }
  }
}

// ── Strategy Definitions ───────────────────────────────────────────────────────

const STRATEGIES: Record<string, { label: string; icon: typeof Zap; description: string; color: string }> = {
  dca: {
    label: "Dollar-Cost Average", icon: Calendar, color: "text-blue-500",
    description: "Invest a fixed amount on a regular schedule regardless of price. The simplest, most proven long-term strategy.",
  },
  smart_dip: {
    label: "Buy the Dip", icon: TrendingUp, color: "text-emerald-500",
    description: "Checks continuously until the price drops below the recent moving average by your set %. If the dip never comes within the period, the purchase is skipped.",
  },
  threshold: {
    label: "Price Threshold", icon: ShieldCheck, color: "text-amber-500",
    description: "Monitors the price continuously and buys as soon as it drops below your limit. If the price never reaches your target within the period, the purchase is skipped.",
  },
}

// ── Ticker Search Combobox ─────────────────────────────────────────────────────

function TickerSearchInput({ value, selectedName, onSelect }: {
  value: string; selectedName: string
  onSelect: (symbol: string, name: string, price?: number) => void
}) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { results, isSearching } = useTickerSearch(query)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  if (value && selectedName) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
        <div className="flex-1 min-w-0">
          <span className="font-bold text-sm text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground ml-1.5 truncate">{selectedName}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"
          onClick={() => { onSelect("", "", undefined); setQuery("") }}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="!bg-card pl-8" placeholder="Search stocks & ETFs..." value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => query.length >= 1 && setIsOpen(true)} />
        {isSearching && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-48 overflow-y-auto">
          {results.map((r) => (
            <button key={r.symbol} className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/10 transition-colors text-left"
              onClick={() => { onSelect(r.symbol, r.name, r.price); setQuery(""); setIsOpen(false) }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{r.symbol}</span>
                  <Badge variant="outline" className="text-[9px] px-1">{r.type?.toUpperCase() || r.exchange}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{r.name}</p>
              </div>
              {r.price != null && <span className="text-sm font-semibold text-foreground ml-2 shrink-0">${r.price.toFixed(2)}</span>}
            </button>
          ))}
        </div>
      )}
      {isOpen && query.length >= 1 && !isSearching && results.length === 0 && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-lg p-3">
          <p className="text-sm text-muted-foreground text-center">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-muted-foreground text-center mt-1">Try a ticker symbol like VTI, AAPL, or SPY</p>
        </div>
      )}
    </div>
  )
}

// ── Trade Notification Banner ──────────────────────────────────────────────────

function TradeNotificationBanner({ notifications, onDismiss }: {
  notifications: TradeNotification[]; onDismiss: (id: string) => void
}) {
  if (notifications.length === 0) return null

  const getStyle = (type: TradeNotification["type"]) => {
    switch (type) {
      case "buy": return { bg: "bg-emerald-500/10 border-emerald-500/30", icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />, iconBg: "bg-emerald-500/20", badge: "text-emerald-500 border-emerald-500/30", label: "BOUGHT" }
      case "sell": return { bg: "bg-blue-500/10 border-blue-500/30", icon: <ArrowDownRight className="w-3.5 h-3.5 text-blue-500" />, iconBg: "bg-blue-500/20", badge: "text-blue-500 border-blue-500/30", label: "SOLD" }
      case "error": return { bg: "bg-destructive/10 border-destructive/30", icon: <AlertTriangle className="w-3.5 h-3.5 text-destructive" />, iconBg: "bg-destructive/20", badge: "text-destructive border-destructive/30", label: "FAILED" }
      case "skip": return { bg: "bg-amber-500/10 border-amber-500/30", icon: <Ban className="w-3.5 h-3.5 text-amber-500" />, iconBg: "bg-amber-500/20", badge: "text-amber-500 border-amber-500/30", label: "SKIPPED" }
      case "funding": return { bg: "bg-purple-500/10 border-purple-500/30", icon: <ArrowRightLeft className="w-3.5 h-3.5 text-purple-500" />, iconBg: "bg-purple-500/20", badge: "text-purple-500 border-purple-500/30", label: "TRANSFER" }
      case "withdraw": return { bg: "bg-orange-500/10 border-orange-500/30", icon: <BanknoteIcon className="w-3.5 h-3.5 text-orange-500" />, iconBg: "bg-orange-500/20", badge: "text-orange-500 border-orange-500/30", label: "WITHDRAW" }
    }
  }

  return (
    <div className="space-y-2 mb-4">
      {notifications.map((n) => {
        const s = getStyle(n.type)
        return (
          <div key={n.id} className={`relative overflow-hidden rounded-lg border p-3 animate-in slide-in-from-top-2 fade-in duration-300 ${s.bg}`}>
            <div className="flex items-start gap-2.5">
              <div className={`mt-0.5 rounded-full p-1 ${s.iconBg}`}>{s.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{n.symbol}</span>
                  <Badge variant="outline" className={`text-[9px] ${s.badge}`}>{s.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                {n.detail && <p className="text-[10px] text-muted-foreground mt-0.5">{n.detail}</p>}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => onDismiss(n.id)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Market Clock Hook ──────────────────────────────────────────────────────────

function useMarketClock(alpacaConnected: boolean) {
  const { data } = useSWR<{ is_open: boolean; next_open: string; next_close: string }>(
    alpacaConnected ? "/api/alpaca/clock" : null, fetcher,
    { revalidateOnFocus: true, refreshInterval: 60_000, onError: () => {} }
  )
  return { isOpen: data?.is_open ?? false, nextOpen: data?.next_open ?? null, nextClose: data?.next_close ?? null }
}

// ── Fund Management Modal ──────────────────────────────────────────────────────

function FundManagementModal({ open, onOpenChange, alpacaCash, plaidAccounts, transfers, onNotify, onComplete }: {
  open: boolean; onOpenChange: (o: boolean) => void
  alpacaCash: number; plaidAccounts: Account[]; transfers: FundingTransfer[]
  onNotify: (n: Omit<TradeNotification, "id" | "timestamp">) => void
  onComplete: () => void
}) {
  const [tab, setTab] = useState<"deposit" | "withdraw" | "history">("deposit")
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmStep, setConfirmStep] = useState(false)
  const [isLinking, setIsLinking] = useState(false)

  const depositoryAccounts = plaidAccounts.filter((a: any) => a.type === "depository")
  const selectedAccount = depositoryAccounts.find((a: any) => a.id === selectedAccountId) as any
  const selectedBalance = Number(selectedAccount?.balance_available ?? selectedAccount?.balance_current ?? 0)

  const isValidAmount = () => {
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) return false
    if (tab === "deposit" && selectedAccount && val > selectedBalance) return false
    if (tab === "withdraw" && val > alpacaCash) return false
    return true
  }

  const handleTransfer = async () => {
    if (!isValidAmount()) return
    setIsSubmitting(true)

    // Ensure the bank is linked to Alpaca first
    if (selectedAccountId) {
      setIsLinking(true)
      const linkResult = await ensureBankLinked(selectedAccountId)
      setIsLinking(false)
      if (!linkResult.success) {
        onNotify({ type: "error", symbol: "ACH", message: linkResult.error || "Failed to link bank to Alpaca" })
        setIsSubmitting(false)
        return
      }
    }

    try {
      const res = await fetch("/api/alpaca/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: tab === "deposit" ? "INCOMING" : "OUTGOING",
          amount: parseFloat(amount),
          plaid_account_id: selectedAccountId,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        onNotify({
          type: tab === "deposit" ? "funding" : "withdraw",
          symbol: "ACH",
          message: `${tab === "deposit" ? "Deposit" : "Withdrawal"} of $${parseFloat(amount).toFixed(2)} initiated`,
          detail: `Typically settles in 1-3 business days.`,
        })
        onComplete()
        setAmount(""); setConfirmStep(false); setSelectedAccountId("")
        onOpenChange(false)
      } else {
        onNotify({ type: "error", symbol: "ACH", message: data.error || "Transfer failed" })
      }
    } catch {
      onNotify({ type: "error", symbol: "ACH", message: "Network error. Please try again." })
    }
    setIsSubmitting(false)
  }

  const getStatusBadge = (status: string) => {
    if (["COMPLETE", "APPROVED"].includes(status))
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[9px]"><Check className="w-2.5 h-2.5 mr-0.5" />Complete</Badge>
    if (["PENDING", "QUEUED", "SENT_TO_CLEARING"].includes(status))
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[9px]"><Clock className="w-2.5 h-2.5 mr-0.5" />Pending</Badge>
    if (["CANCELED", "RETURNED"].includes(status))
      return <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[9px]"><X className="w-2.5 h-2.5 mr-0.5" />Failed</Badge>
    return <Badge variant="outline" className="text-[9px]">{status}</Badge>
  }

  const pendingCount = transfers.filter(t => ["QUEUED", "PENDING", "SENT_TO_CLEARING"].includes(t.status)).length

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setConfirmStep(false); setAmount("") } }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" />Fund Management</DialogTitle>
          <DialogDescription>Transfer money between your bank and Alpaca brokerage</DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Alpaca Available Cash</p>
                <p className="text-xl font-bold text-foreground">${alpacaCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            {pendingCount > 0 && (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                <Clock className="w-2.5 h-2.5 mr-0.5" />{pendingCount} pending
              </Badge>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setConfirmStep(false); setAmount("") }}>
          <TabsList className="grid w-full grid-cols-3 bg-card border">
            <TabsTrigger value="deposit" className="text-xs data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="text-xs data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground">
              <ArrowDownRight className="w-3.5 h-3.5 mr-1" />Withdraw
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground">
              <Clock className="w-3.5 h-3.5 mr-1" />History
            </TabsTrigger>
          </TabsList>

          {/* Deposit / Withdraw tabs share similar UI */}
          {(["deposit", "withdraw"] as const).map((direction) => (
            <TabsContent key={direction} value={direction} className="space-y-4 mt-4">
              {!confirmStep ? (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-muted-foreground" />{direction === "deposit" ? "Transfer From (Bank)" : "Withdraw To (Bank)"}</Label>
                    {depositoryAccounts.length === 0 ? (
                      <div className="p-3 rounded-lg border border-dashed border-border bg-card text-xs text-muted-foreground dark:border-slate-500">
                        No bank accounts linked. Connect a bank via Plaid first.
                      </div>
                    ) : (
                      <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                        <SelectTrigger className="bg-card cursor-pointer"><SelectValue placeholder="Select bank account..." /></SelectTrigger>
                        <SelectContent>
                          {depositoryAccounts.map((acct: any) => (
                            <SelectItem key={acct.id} value={acct.id}>
                              {acct.name} {acct.mask && `(...${acct.mask})`} — ${Number(acct.balance_available ?? acct.balance_current ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input type="number" placeholder="0.00" className="bg-card text-lg font-semibold" value={amount}
                      onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" />
                    {amount && direction === "deposit" && parseFloat(amount) > selectedBalance && selectedAccountId && (
                      <p className="text-xs text-destructive">Exceeds available balance of ${selectedBalance.toFixed(2)}</p>
                    )}
                    {amount && direction === "withdraw" && parseFloat(amount) > alpacaCash && (
                      <p className="text-xs text-destructive">Exceeds available cash of ${alpacaCash.toFixed(2)}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {direction === "deposit" ? (
                      [50, 100, 250, 500].map((val) => (
                        <Button key={val} variant="outline" size="sm" className="flex-1 text-xs cursor-pointer" onClick={() => setAmount(String(val))}>${val}</Button>
                      ))
                    ) : (
                      ["25%", "50%", "All Cash"].map((label, i) => {
                        const mult = [0.25, 0.5, 1][i]
                        return <Button key={label} variant="outline" size="sm" className="flex-1 text-xs cursor-pointer"
                          onClick={() => setAmount(String(Math.floor(alpacaCash * mult * 100) / 100))}>{label}</Button>
                      })
                    )}
                  </div>

                  <div className={`p-3 rounded-lg border ${direction === "deposit" ? "bg-blue-500/5 border-blue-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                    <div className="flex items-start gap-2">
                      <Info className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${direction === "deposit" ? "text-blue-500" : "text-amber-500"}`} />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        ACH {direction === "deposit" ? "deposits" : "withdrawals"} typically settle in 1-3 business days.
                        {direction === "withdraw" && " Only settled cash can be withdrawn."}
                      </p>
                    </div>
                  </div>

                  <Button className="w-full bg-primary text-primary-foreground hover:bg-accent cursor-pointer"
                    disabled={!selectedAccountId || !isValidAmount()}
                    onClick={() => setConfirmStep(true)}>
                    Review {direction === "deposit" ? "Deposit" : "Withdrawal"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border space-y-3 ${direction === "deposit" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                    <h4 className="text-sm font-semibold text-foreground">Confirm {direction === "deposit" ? "Deposit" : "Withdrawal"}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">From</span>
                        <span className="font-medium text-foreground">{direction === "deposit" ? `${selectedAccount?.name} (...${selectedAccount?.mask})` : "Alpaca Brokerage"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">To</span>
                        <span className="font-medium text-foreground">{direction === "deposit" ? "Alpaca Brokerage" : `${selectedAccount?.name} (...${selectedAccount?.mask})`}</span></div>
                      <div className={`flex justify-between pt-2 border-t ${direction === "deposit" ? "border-emerald-500/20" : "border-amber-500/20"}`}>
                        <span className="text-muted-foreground">Amount</span>
                        <span className="text-lg font-bold text-accent">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Settlement</span>
                        <span className="text-xs font-medium text-foreground">1-3 business days</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setConfirmStep(false)}>Back</Button>
                    <Button className="flex-1 bg-primary text-primary-foreground hover:bg-accent cursor-pointer" disabled={isSubmitting} onClick={handleTransfer}>
                      {isSubmitting ? (<>{isLinking ? "Linking bank..." : "Processing..."}<Loader2 className="w-4 h-4 ml-2 animate-spin" /></>) : (
                        <><ArrowRightLeft className="w-4 h-4 mr-2" />Confirm {direction === "deposit" ? "Deposit" : "Withdrawal"}</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}

          <TabsContent value="history" className="mt-4">
            {transfers.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg dark:border-slate-500">
                <ArrowRightLeft className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No transfers yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transfers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${t.direction === "INCOMING" ? "bg-emerald-500/10" : "bg-orange-500/10"}`}>
                        {t.direction === "INCOMING" ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-orange-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.direction === "INCOMING" ? "Deposit" : "Withdrawal"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          {t.bank_name && ` · ${t.bank_name}`}
                          {t.triggered_by_rule_id && " · Auto-funded"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`text-sm font-semibold ${t.direction === "INCOMING" ? "text-emerald-500" : "text-foreground"}`}>
                        {t.direction === "INCOMING" ? "+" : "-"}${Number(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      {getStatusBadge(t.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ── Alpaca Info Modal ──────────────────────────────────────────────────────────

function AlpacaInfoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    { q: "Is my money safe?", a: "Yes. Alpaca Securities LLC is a FINRA-registered broker-dealer and member of SIPC. Your securities are protected up to $500,000 (including $250,000 for cash claims) by the Securities Investor Protection Corporation. Your funds are held in your own brokerage account, not on our platform." },
    { q: "How does auto-funding work?", a: "When you enable auto-funding on an investment rule, the system checks your Alpaca cash balance before each scheduled trade. If there isn't enough cash, it automatically initiates an ACH deposit from your linked bank account for the exact amount needed (plus a small buffer for price changes). The trade is then queued and executes automatically once the deposit settles, typically 1-3 business days." },
    { q: "Can I access my money while deployed?", a: "Absolutely. You can withdraw funds through our Fund Management panel or the Alpaca dashboard at any time. Sell positions, then withdraw the cash to your linked bank account. Withdrawals typically settle in 1-3 business days via ACH. There are no lock-up periods or penalties." },
    { q: "What if a deposit fails?", a: "If an ACH deposit is returned by your bank, the system detects this and clears the pending state so your rule isn't stuck. The trade is skipped for that period, and the rule tries again on its next scheduled date. You'll see the failed transfer in Fund Management history." },
    { q: "What happens if I lose internet access?", a: "Everything runs on our servers. Your rules execute on schedule, auto-funding kicks in when needed, and trades are placed automatically through Alpaca's API. As long as your rules are active and your bank account has funds, everything continues while you're completely offline." },
    { q: "Are there any fees?", a: "Alpaca offers commission-free trading for US-listed stocks and ETFs. There are no account minimums, no maintenance fees, no inactivity fees, and no fees for ACH transfers. Our platform does not charge any additional fees." },
    { q: "What's paper vs live trading?", a: "Paper trading uses simulated money so you can test your strategies and auto-funding flow risk-free. Live trading uses real money. We recommend starting with paper trading to verify everything works, then switching to live when you're confident." },
    { q: "What about taxes?", a: "Alpaca provides tax documents (1099-B) for your trading activity each year. Investment income may be tax-advantaged if you're deployed to a combat zone. Consult a military tax advisor for guidance specific to your situation." },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-500" />How Your Money Is Protected</DialogTitle>
          <DialogDescription>Understanding how your investments are funded, executed, and kept safe</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Building2, color: "blue", label: "FINRA Registered", desc: "Alpaca Securities LLC is regulated by FINRA" },
            { icon: Shield, color: "emerald", label: "SIPC Protected", desc: "Up to $500K in securities protection" },
            { icon: Lock, color: "amber", label: "Your Account", desc: "Funds held in your own brokerage account" },
            { icon: CreditCard, color: "purple", label: "Commission Free", desc: "No trading fees, no transfer fees" },
          ].map((b) => (
            <div key={b.label} className={`p-3 rounded-lg bg-${b.color}-500/10 border border-${b.color}-500/20`}>
              <b.icon className={`w-5 h-5 text-${b.color}-500 mb-1.5`} />
              <p className="text-xs font-semibold text-foreground">{b.label}</p>
              <p className="text-[10px] text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">How It Works</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your money flows securely from your bank to your Alpaca brokerage account and into investments, fully automatically.
          </p>
          {[
            { s: "1", t: "Connect your bank via Plaid", d: "Securely link your checking or savings account. We never see your bank credentials." },
            { s: "2", t: "Create an Alpaca brokerage account", d: "A real, FINRA-regulated brokerage account in your name." },
            { s: "3", t: "Set up rules with a funding source", d: "Choose what to invest in, how much, your strategy, and which bank account to fund from. Enable auto-funding for hands-off operation." },
            { s: "4", t: "The system handles everything", d: "On schedule, it checks your Alpaca cash. Enough → trades immediately. Not enough → auto-deposits from your bank, then trades once funds settle." },
            { s: "5", t: "Monitor from anywhere (or don't)", d: "Check your portfolio and transfers anytime, or do nothing — rules run while you're deployed with zero internet." },
            { s: "6", t: "Withdraw or sell anytime", d: "Sell positions and withdraw cash to your bank. No lock-ups, no penalties." },
          ].map((item) => (
            <div key={item.s} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{item.s}</span>
              </div>
              <div><p className="text-xs font-medium text-foreground">{item.t}</p><p className="text-[11px] text-muted-foreground">{item.d}</p></div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-accent border border-border">
          <p className="text-[10px] font-semibold text-accent-foreground mb-2 uppercase tracking-wider">Money Flow</p>
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-500/30 border border-blue-500/20">
              <Building2 className="w-3.5 h-3.5 text-blue-500" /><span className="font-medium text-accent-foreground">Your Bank</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-accent-foreground">ACH</span>
              <ArrowRightLeft className="w-4 h-4 text-accent-foreground" />
              <span className="text-[9px] text-accent-foreground">1-3 days</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-500/30 border border-emerald-500/20">
              <Briefcase className="w-3.5 h-3.5 text-emerald-500" /><span className="font-medium text-accent-foreground">Alpaca</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-accent-foreground">Auto</span>
              <ArrowUpRight className="w-4 h-4 text-accent-foreground" />
              <span className="text-[9px] text-accent-foreground">Instant</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/30 border border-amber-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" /><span className="font-medium text-accent-foreground">Stocks</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-muted-foreground" />FAQ</h3>
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button className="w-full flex items-center justify-between p-3 text-left bg-card hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                <span className="text-xs font-medium text-foreground pr-2">{faq.q}</span>
                {expandedFaq === i ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
              </button>
              {expandedFaq === i && <div className="px-3 pb-3"><p className="text-[11px] text-muted-foreground leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-accent border border-border">
          <p className="text-xs text-accent-foreground mb-2">Your Alpaca account is fully yours:</p>
          <a href="https://app.alpaca.markets" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
            Open Alpaca Dashboard<ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Sell Shares Modal ──────────────────────────────────────────────────────────

function SellSharesModal({ open, onOpenChange, positions, marketIsOpen, marketNextOpen, onNotify, onSellComplete }: {
  open: boolean; onOpenChange: (o: boolean) => void; positions: AlpacaPosition[]
  marketIsOpen: boolean; marketNextOpen: string | null
  onNotify: (n: Omit<TradeNotification, "id" | "timestamp">) => void; onSellComplete: () => void
}) {
  const [selectedPosition, setSelectedPosition] = useState<AlpacaPosition | null>(null)
  const [sellState, setSellState] = useState<SellOrderState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmStep, setConfirmStep] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const resetSell = () => { setSelectedPosition(null); setSellState(null); setConfirmStep(false); setResult(null) }

  const selectPosition = (pos: AlpacaPosition) => {
    setSelectedPosition(pos)
    setSellState({ symbol: pos.symbol, qty: "", currentQty: pos.qty, currentPrice: Number(pos.current_price),
      marketValue: Number(pos.market_value), orderType: "market", limitPrice: parseFloat(pos.current_price).toFixed(2), sellAll: false })
    setConfirmStep(false); setResult(null)
  }

  const handleSell = async () => {
    if (!sellState) return
    setIsSubmitting(true)
    try {
      const qty = sellState.sellAll ? sellState.currentQty : sellState.qty
      const res = await fetch("/api/alpaca/sell", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sellState.symbol, qty: parseFloat(qty), order_type: sellState.orderType,
          limit_price: sellState.orderType === "limit" ? parseFloat(sellState.limitPrice) : undefined }) })
      const data = await res.json()
      if (res.ok) {
        setResult({ success: true, message: `Sell order placed for ${qty} shares of ${sellState.symbol}` })
        onNotify({ type: "sell", symbol: sellState.symbol,
          message: `Sold ${qty} share${parseFloat(qty) !== 1 ? "s" : ""} at ${sellState.orderType === "limit" ? `limit $${sellState.limitPrice}` : "market price"}`,
          detail: `Est. proceeds: $${(parseFloat(qty) * sellState.currentPrice).toFixed(2)}${data.order_id ? ` · Order ID: ${data.order_id}` : ""}` })
        onSellComplete()
      } else {
        setResult({ success: false, message: data.error || "Failed to place sell order" })
        onNotify({ type: "error", symbol: sellState.symbol, message: data.error || "Failed to place sell order" })
      }
    } catch { setResult({ success: false, message: "Network error. Please try again." }) }
    setIsSubmitting(false)
  }

  const sellQty = sellState?.sellAll ? parseFloat(sellState.currentQty) : parseFloat(sellState?.qty || "0")
  const estimatedProceeds = sellState ? sellQty * sellState.currentPrice : 0
  const isValidQty = sellQty > 0 && sellQty <= parseFloat(sellState?.currentQty || "0")

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetSell() }}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ArrowDownRight className="w-5 h-5 text-destructive" />Sell Shares</DialogTitle>
          <DialogDescription>Select a position to sell from your Alpaca portfolio</DialogDescription>
        </DialogHeader>

        {result && (
          <div className={`p-3 rounded-lg border ${result.success ? "bg-emerald-500/10 border-emerald-500/30" : "bg-destructive/10 border-destructive/30"}`}>
            <div className="flex items-center gap-2">
              {result.success ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
              <p className="text-sm font-medium text-foreground">{result.message}</p>
            </div>
            {result.success && <Button variant="outline" size="sm" className="mt-2 text-xs cursor-pointer" onClick={resetSell}>Sell another position</Button>}
          </div>
        )}

        {!marketIsOpen && !result && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />
              <div><p className="text-xs font-medium text-foreground">Market is currently closed</p>
                <p className="text-[10px] text-muted-foreground">{marketNextOpen ? `Opens ${new Date(marketNextOpen).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : "Your order will be queued."}</p>
              </div>
            </div>
          </div>
        )}

        {!selectedPosition && !result && (
          <div className="space-y-2">
            {positions.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-border rounded-lg dark:border-slate-500">
                <Ban className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No positions to sell</p>
              </div>
            ) : positions.map((pos) => (
              <button key={pos.symbol} className="w-full p-3 rounded-lg border border-border bg-card hover:bg-primary/40 transition-colors text-left cursor-pointer" onClick={() => selectPosition(pos)}>
                <div className="flex items-center justify-between">
                  <div><span className="font-bold text-sm text-foreground">{pos.symbol}</span>
                    <p className="text-xs text-muted-foreground">{pos.qty} shares @ ${Number(pos.avg_entry_price).toFixed(2)}</p></div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-foreground">${Number(pos.market_value).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    <span className={`text-xs font-medium ${Number(pos.unrealized_pl) >= 0 ? "text-accent" : "text-destructive"}`}>
                      {Number(pos.unrealized_pl) >= 0 ? "+" : ""}${Number(pos.unrealized_pl).toFixed(2)} ({(Number(pos.unrealized_plpc) * 100).toFixed(2)}%)</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedPosition && sellState && !confirmStep && !result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
              <div><span className="font-bold text-secondary-foreground">{sellState.symbol}</span><p className="text-xs text-secondary-foreground">{sellState.currentQty} shares available</p></div>
              <div className="text-right"><p className="text-sm font-semibold text-secondary-foreground">${sellState.currentPrice.toFixed(2)}</p><p className="text-[10px] text-secondary-foreground">current price</p></div>
            </div>
            <div className="space-y-2">
              <Label>Quantity to Sell</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="0" className="bg-card" value={sellState.sellAll ? sellState.currentQty : sellState.qty}
                  disabled={sellState.sellAll} onChange={(e) => setSellState({ ...sellState, qty: e.target.value, sellAll: false })} max={sellState.currentQty} min="0" step="any" />
                <Button variant={sellState.sellAll ? "default" : "outline"} size="sm" className="shrink-0 text-xs cursor-pointer"
                  onClick={() => setSellState({ ...sellState, sellAll: !sellState.sellAll, qty: "" })}>Sell All</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={sellState.orderType} onValueChange={(v) => setSellState({ ...sellState, orderType: v as "market" | "limit" })}>
                <SelectTrigger className="bg-card cursor-pointer"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Order (sell immediately)</SelectItem>
                  <SelectItem value="limit">Limit Order (minimum price)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sellState.orderType === "limit" && (
              <div className="space-y-2"><Label>Minimum Sell Price ($)</Label>
                <Input type="number" placeholder={sellState.currentPrice.toFixed(2)} className="bg-card" value={sellState.limitPrice}
                  onChange={(e) => setSellState({ ...sellState, limitPrice: e.target.value })} /></div>
            )}
            {isValidQty && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Est. proceeds</span>
                  <span className="text-lg font-bold text-accent">${estimatedProceeds.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 cursor-pointer" onClick={resetSell}>Back</Button>
              <Button className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/80 cursor-pointer" disabled={!isValidQty && !sellState.sellAll} onClick={() => setConfirmStep(true)}>Review Order</Button>
            </div>
          </div>
        )}

        {confirmStep && sellState && !result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Confirm Sell Order</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Symbol</span><span className="font-semibold text-foreground">{sellState.symbol}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-semibold text-foreground">{sellState.sellAll ? sellState.currentQty : sellState.qty} shares</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-semibold text-foreground capitalize">{sellState.orderType}</span></div>
                <div className="flex justify-between pt-2 border-t border-red-200 dark:border-red-700/40"><span className="text-muted-foreground">Est. Proceeds</span><span className="font-bold text-accent">${estimatedProceeds.toFixed(2)}</span></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setConfirmStep(false)}>Edit</Button>
              <Button className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/80 cursor-pointer" disabled={isSubmitting} onClick={handleSell}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Placing...</> : "Confirm Sell"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Edit Rule Modal ────────────────────────────────────────────────────────────

function EditRuleModal({ open, onOpenChange, rule, plaidAccounts, onSave }: {
  open: boolean; onOpenChange: (o: boolean) => void; rule: any; plaidAccounts: Account[]
  onSave: (id: string, updates: any) => Promise<void>
}) {
  const [editState, setEditState] = useState({
    value: "", frequency: "monthly" as "daily" | "weekly" | "biweekly" | "monthly",
    strategy: "dca" as "dca" | "smart_dip" | "threshold", dipPercentage: "5", thresholdPrice: "",
    type: "amount" as "amount" | "shares", fundingAccountId: "", autoFund: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showStrategyInfo, setShowStrategyInfo] = useState(false)
  const { price: livePrice, isLoading: priceLoading } = useStockPrice(rule?.symbol || null)

  useEffect(() => {
    if (rule) {
      const sp = rule.strategy_params || {}
      setEditState({ value: String(rule.value), frequency: rule.frequency || "monthly", strategy: rule.strategy || "dca",
        dipPercentage: String(sp.dip_percentage || "5"), thresholdPrice: String(sp.threshold_price || rule.max_price || ""),
        type: rule.type || "amount", fundingAccountId: rule.funding_account_id || "", autoFund: rule.auto_fund ?? false })
    }
  }, [rule])

  const handleSave = async () => {
    if (!rule) return
    setIsSaving(true)
    try {
      // If a funding account was selected, ensure it's linked to Alpaca
      if (editState.fundingAccountId) {
        const linkResult = await ensureBankLinked(editState.fundingAccountId)
        if (!linkResult.success) { console.error("Bank link failed:", linkResult.error) }
      }

      const updates: any = { value: parseFloat(editState.value), frequency: editState.frequency,
        strategy: editState.strategy, type: editState.type,
        funding_account_id: editState.fundingAccountId || null, auto_fund: editState.autoFund }
      if (editState.strategy === "smart_dip") {
        updates.strategy_params = { dip_percentage: parseFloat(editState.dipPercentage || "5") }
        if (livePrice) updates.max_price = Math.round(livePrice * (1 - parseFloat(editState.dipPercentage || "5") / 100) * 100) / 100
        updates.min_price = null
      } else if (editState.strategy === "threshold") {
        updates.strategy_params = { threshold_price: parseFloat(editState.thresholdPrice) || null }
        updates.max_price = parseFloat(editState.thresholdPrice) || null; updates.min_price = null
      } else { updates.strategy_params = {}; updates.min_price = null; updates.max_price = null }
      if (livePrice) updates.estimated_share_price = livePrice
      await onSave(rule.id, updates); onOpenChange(false)
    } catch (err) { console.error("Save failed:", err) }
    setIsSaving(false)
  }

  if (!rule) return null

  const getFreqMult = (f: string) => ({ daily: 21, weekly: 4, biweekly: 2, monthly: 1 }[f] || 1)
  const previewCost = () => {
    const val = parseFloat(editState.value); if (isNaN(val)) return null
    const mult = getFreqMult(editState.frequency)
    return editState.type === "amount" ? val * mult : livePrice ? val * livePrice * mult : null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Edit className="w-5 h-5 text-muted-foreground" />Edit Rule - {rule.symbol}</DialogTitle>
          <DialogDescription>Modify your investment rule settings.</DialogDescription>
        </DialogHeader>

        {livePrice != null && (
          <div className="flex items-center gap-2 text-xs px-1">
            <span className="text-muted-foreground">Current price:</span><span className="font-semibold text-foreground">${livePrice.toFixed(2)}</span>
            {priceLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>
        )}

        <Tabs value={editState.type} onValueChange={(v) => setEditState({ ...editState, type: v as "amount" | "shares" })}>
          <TabsList className="grid w-full grid-cols-2 bg-card border">
            <TabsTrigger value="amount" className="flex items-center gap-2 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground"><DollarSign className="w-4 h-4" />Fixed Amount</TabsTrigger>
            <TabsTrigger value="shares" className="flex items-center gap-2 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground"><Hash className="w-4 h-4" />Share Count</TabsTrigger>
          </TabsList>
          <TabsContent value="amount" className="space-y-4 mt-4">
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2"><Label>Amount per purchase ($)</Label><Input type="number" placeholder="100.00" className="bg-card" value={editState.value} onChange={(e) => setEditState({ ...editState, value: e.target.value })} /></div>
              <div className="w-50 space-y-2"><Label>Frequency</Label>
                <Select value={editState.frequency} onValueChange={(v) => setEditState({ ...editState, frequency: v as any })}>
                  <SelectTrigger className="w-full bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="biweekly">Bi-weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent>
                </Select></div>
            </div>
          </TabsContent>
          <TabsContent value="shares" className="space-y-4 mt-4">
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2"><Label>Shares per purchase</Label><Input type="number" placeholder="1" className="!bg-card" value={editState.value} onChange={(e) => setEditState({ ...editState, value: e.target.value })} />
                {editState.value && livePrice != null && <p className="text-xs text-muted-foreground px-1">&asymp; ${(parseFloat(editState.value) * livePrice).toFixed(2)} per purchase</p>}</div>
              <div className="w-50 space-y-2"><Label>Frequency</Label>
                <Select value={editState.frequency} onValueChange={(v) => setEditState({ ...editState, frequency: v as any })}>
                  <SelectTrigger className="w-full bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="biweekly">Bi-weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent>
                </Select></div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Strategy selector (same pattern as create) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between"><Label className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-muted-foreground" />Strategy</Label>
            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground cursor-pointer" onClick={() => setShowStrategyInfo(!showStrategyInfo)}><Info className="w-3 h-3 mr-1" />{showStrategyInfo ? "Hide" : "Info"}</Button></div>
          {showStrategyInfo && (
            <div className="p-3 rounded-lg bg-card border border-border space-y-2">
              {Object.entries(STRATEGIES).map(([k, s]) => (<div key={k} className="flex gap-2"><s.icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.color}`} /><div><p className="text-xs font-medium text-foreground">{s.label}</p><p className="text-xs text-muted-foreground">{s.description}</p></div></div>))}
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(STRATEGIES).map(([k, s]) => (
              <button key={k} onClick={() => setEditState({ ...editState, strategy: k as any })}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${editState.strategy === k ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-card hover:bg-secondary/50"}`}>
                <s.icon className={`w-5 h-5 mx-auto mb-1 ${editState.strategy === k ? s.color : "text-muted-foreground"}`} /><p className="text-xs font-medium text-foreground">{s.label}</p>
              </button>))}
          </div>
          {editState.strategy === "smart_dip" && (
            <div className="p-3 rounded-lg bg-secondary border border-border space-y-2">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /><span className="text-sm font-medium text-secondary-foreground">Buy the Dip</span></div>
              <Label className="text-xs text-secondary-foreground">Buy when price drops this % below average</Label>
              <div className="flex items-center gap-2"><Input className="!bg-card w-24" type="number" min="1" max="50" value={editState.dipPercentage} onChange={(e) => setEditState({ ...editState, dipPercentage: e.target.value })} /><span className="text-sm text-secondary-foreground">%</span></div>
              {livePrice != null && editState.dipPercentage && <p className="text-xs text-secondary-foreground">Would buy below ~${(livePrice * (1 - parseFloat(editState.dipPercentage) / 100)).toFixed(2)}</p>}
            </div>
          )}
          {editState.strategy === "threshold" && (
            <div className="p-3 rounded-lg bg-secondary border border-border space-y-2">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-500" /><span className="text-sm font-medium text-secondary-foreground">Price Threshold</span></div>
              <Label className="text-xs text-secondary-foreground">Only buy when price is below ($)</Label>
              <Input className="!bg-card" type="number" placeholder={livePrice ? `e.g., ${(livePrice * 0.95).toFixed(2)}` : "150.00"} value={editState.thresholdPrice} onChange={(e) => setEditState({ ...editState, thresholdPrice: e.target.value })} />
            </div>
          )}
        </div>

        {/* Funding source + auto-fund toggle */}
        {plaidAccounts.length > 0 && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-muted-foreground" />Funding Source</Label>
              <Select value={editState.fundingAccountId} onValueChange={(v) => setEditState({ ...editState, fundingAccountId: v })}>
                <SelectTrigger className="bg-card cursor-pointer"><SelectValue placeholder="Select bank account" /></SelectTrigger>
                <SelectContent>
                  {plaidAccounts.filter((a: any) => a.type === "depository").map((acct: any) => (
                    <SelectItem key={acct.id} value={acct.id}>{acct.name} {acct.mask && `(...${acct.mask})`} — ${Number(acct.balance_current).toFixed(2)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editState.fundingAccountId && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-purple-500" />
                  <div><p className="text-xs font-medium text-foreground">Auto-Fund</p>
                    <p className="text-[10px] text-muted-foreground">Auto-deposit from bank when Alpaca cash is low</p></div>
                </div>
                <Switch checked={editState.autoFund} onCheckedChange={(v) => setEditState({ ...editState, autoFund: v })} />
              </div>
            )}
          </div>
        )}

        {previewCost() != null && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Est. monthly cost</span>
              <span className="text-lg font-bold text-accent">~${previewCost()!.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-accent cursor-pointer" disabled={!editState.value || isSaving} onClick={handleSave}>
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function InvestmentControls() {
  const { data: rules, isLoading, mutate, addRule: addRuleToDb, updateRule, deleteRule: deleteRuleFromDb } = useInvestmentRules()
  const { data: alpacaAccount, mutate: mutateAccount } = useSWR<AlpacaAccount & { not_configured?: boolean }>("/api/alpaca/account", fetcher, { onError: () => {}, revalidateOnFocus: false, refreshInterval: 60_000 })
  const { data: positions, mutate: mutatePositions } = useSWR<AlpacaPosition[] | { not_configured?: boolean }>("/api/alpaca/positions", fetcher, { onError: () => {}, revalidateOnFocus: false, refreshInterval: 60_000 })
  const { data: plaidData } = useAccounts()
  const plaidAccounts = plaidData?.accounts || []

  const alpacaConnectedEarly = !!alpacaAccount && !("error" in alpacaAccount) && !("not_configured" in alpacaAccount)
  const { isOpen: marketIsOpen, nextOpen: marketNextOpen } = useMarketClock(alpacaConnectedEarly)
  const { transfers, mutate: mutateTransfers } = useFundingTransfers(alpacaConnectedEarly)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [investmentType, setInvestmentType] = useState<"amount" | "shares">("amount")
  const [executingRuleId, setExecutingRuleId] = useState<string | null>(null)
  const [showStrategyInfo, setShowStrategyInfo] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const [editingRule, setEditingRule] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSellModalOpen, setIsSellModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isFundModalOpen, setIsFundModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [notifications, setNotifications] = useState<TradeNotification[]>([])
  const addNotification = useCallback((n: Omit<TradeNotification, "id" | "timestamp">) => {
    const id = Math.random().toString(36).slice(2, 9)
    setNotifications((prev) => [{ ...n, id, timestamp: Date.now() }, ...prev].slice(0, 5))
    setTimeout(() => setNotifications((prev) => prev.filter((x) => x.id !== id)), 8000)
  }, [])
  const dismissNotification = useCallback((id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id)), [])

  const [newRule, setNewRule] = useState({
    symbol: "", symbolName: "", value: "", frequency: "monthly" as "daily" | "weekly" | "biweekly" | "monthly",
    strategy: "dca" as "dca" | "smart_dip" | "threshold", dipPercentage: "5", thresholdPrice: "",
    minPrice: "", maxPrice: "", fundingAccountId: "", autoFund: false,
  })

  const { price: livePrice, changePercent, isLoading: priceLoading } = useStockPrice(newRule.symbol || null)
  const currentPrice = livePrice ?? selectedPrice
  const rulesList = rules || []
  const alpacaConnected = !!alpacaAccount && !("error" in alpacaAccount) && !("not_configured" in alpacaAccount)
  const positionsList = Array.isArray(positions) ? positions : []
  const alpacaCash = alpacaConnected ? Number(alpacaAccount!.cash || 0) : 0
  const pendingTransfers = transfers.filter(t => ["QUEUED", "PENDING", "SENT_TO_CLEARING"].includes(t.status))

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
          mutatePositions(undefined, false)
          mutateAccount(undefined, false)
          mutateTransfers([], false)

          await Promise.all([
            mutate(),
            mutatePositions(),
            mutateAccount(),
            mutateTransfers(),
          ])
        }

        if (event === "SIGNED_OUT") {
          setIsLoggedIn(false)
          mutate([], false)
          mutatePositions(undefined, false)
          mutateAccount(undefined, false)
          mutateTransfers([], false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, mutate, mutateAccount, mutatePositions, mutateTransfers])

  const resetForm = () => {
    setNewRule({ symbol: "", symbolName: "", value: "", frequency: "monthly", strategy: "dca", dipPercentage: "5", thresholdPrice: "", minPrice: "", maxPrice: "", fundingAccountId: "", autoFund: false })
    setSelectedPrice(null)
  }

  const handleAddRule = async () => {
    if (!newRule.symbol || !newRule.value) return

    // Auto-link bank to Alpaca when creating a rule with funding source
    if (newRule.fundingAccountId) {
      const linkResult = await ensureBankLinked(newRule.fundingAccountId)
      if (!linkResult.success) {
        addNotification({ type: "error", symbol: newRule.symbol, message: `Failed to link bank: ${linkResult.error}` })
        // Continue anyway — the link can be retried later
      }
    }

    try {
      await addRuleToDb({
        type: investmentType, symbol: newRule.symbol.toUpperCase(), value: parseFloat(newRule.value), frequency: newRule.frequency,
        min_price: newRule.strategy === "threshold" ? null : newRule.minPrice ? parseFloat(newRule.minPrice) : null,
        max_price: newRule.strategy === "threshold" ? parseFloat(newRule.thresholdPrice) || null
          : newRule.strategy === "smart_dip" && currentPrice ? Math.round(currentPrice * (1 - parseFloat(newRule.dipPercentage || "5") / 100) * 100) / 100
          : newRule.maxPrice ? parseFloat(newRule.maxPrice) : null,
        strategy: newRule.strategy,
        strategy_params: newRule.strategy === "smart_dip" ? { dip_percentage: parseFloat(newRule.dipPercentage || "5") }
          : newRule.strategy === "threshold" ? { threshold_price: parseFloat(newRule.thresholdPrice) || null } : {},
        estimated_share_price: currentPrice ?? null,
        funding_account_id: newRule.fundingAccountId || null,
        auto_fund: newRule.autoFund,
      } as any)
      resetForm(); setIsDialogOpen(false)
    } catch (err) { console.error("Add rule failed:", err) }
  }

  const handleEditSave = async (id: string, updates: any) => { await updateRule(id, updates) }
  const toggleRule = async (rule: { id: string; is_active: boolean }) => { try { await updateRule(rule.id, { is_active: !rule.is_active }) } catch {} }
  const deleteRule = async (id: string) => { try { await deleteRuleFromDb(id) } catch {} }

  const executeRule = async (ruleId: string) => {
    setExecutingRuleId(ruleId)
    const rule = rulesList.find((r) => r.id === ruleId)
    const symbol = rule?.symbol || "Unknown"
    try {
      const res = await fetch("/api/alpaca/execute-rule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rule_id: ruleId }) })
      const ct = res.headers.get("content-type") || ""
      if (!ct.includes("application/json")) { addNotification({ type: "error", symbol, message: `Server error (${res.status})` }); setExecutingRuleId(null); return }
      const result = await res.json()

      if (!res.ok) {
        if (result.insufficient_funds && (rule as any)?.auto_fund && (rule as any)?.funding_account_id) {
          addNotification({ type: "funding", symbol, message: `Insufficient cash — auto-funding initiated`, detail: "ACH deposit started. Trade will execute once funds settle (1-3 days)." })
        } else if (result.insufficient_funds) {
          addNotification({ type: "error", symbol, message: `Insufficient cash ($${alpacaCash.toFixed(2)} available)`, detail: "Enable auto-funding on this rule or deposit funds via Manage Funds." })
        } else {
          addNotification({ type: "error", symbol, message: result.error || "Failed to execute" })
        }
      } else if (result.pending) {
        addNotification({ type: "funding", symbol, message: result.message || "Waiting for deposit to settle", detail: `Transfer status: ${result.transfer_status}` })
      } else if (result.funding_initiated) {
        addNotification({ type: "funding", symbol, message: `Auto-funded $${result.funded_amount?.toFixed(2)} from bank`, detail: `Trade queued — will execute once deposit settles.` })
      } else if (result.skipped) {
        addNotification({ type: "skip", symbol, message: result.reason || "Order was skipped", detail: "Conditions were not met for this trade window." })
      } else {
        const amt = rule?.type === "amount" ? `$${Number(rule.value).toFixed(2)}` : `${Number(rule?.value)} shares`
        addNotification({ type: "buy", symbol, message: `Purchase order placed for ${amt}`, detail: result.order_id ? `Order ID: ${result.order_id}` : undefined })
      }
      mutate(); mutatePositions(); mutateAccount(); mutateTransfers()
    } catch { addNotification({ type: "error", symbol, message: "Network error. Please try again." }) }
    setExecutingRuleId(null)
  }

  const getFreqLabel = (f: string) => ({ daily: "Daily", weekly: "Weekly", biweekly: "Bi-weekly", monthly: "Monthly" }[f] || f)
  const getFreqMult = (f: string) => ({ daily: 21, weekly: 4, biweekly: 2, monthly: 1 }[f] || 1)
  const calcMonthly = () => rulesList.filter(r => r.is_active).reduce((sum, r) => {
    const m = getFreqMult(r.frequency)
    return r.type === "amount" ? sum + Number(r.value) * m : sum + Number(r.value) * (Number((r as any).estimated_share_price) || Number(r.max_price) || 0) * m
  }, 0)

  const getStrategyBadge = (rule: any) => {
    const s = STRATEGIES[rule.strategy || "dca"]; if (!s) return null
    return <Badge variant="outline" className={`text-[9px] ${s.color}`}><s.icon className="w-2.5 h-2.5 mr-0.5" />{s.label}</Badge>
  }

  const previewMonthlyCost = () => {
    const val = parseFloat(newRule.value); if (isNaN(val)) return null
    const mult = getFreqMult(newRule.frequency)
    return investmentType === "amount" ? val * mult : currentPrice ? val * currentPrice * mult : null
  }

  if (isLoading) return (
    <Card><CardHeader><div className="flex items-center gap-3"><Skeleton className="w-9 h-9 rounded-lg" /><div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-48" /></div></div></CardHeader>
    <CardContent><div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div></CardContent></Card>
  )

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary"><TrendingUp className="w-5 h-5 text-secondary-foreground" /></div>
              <div><CardTitle className="text-lg">Auto-Invest Rules</CardTitle>
                <CardDescription>{alpacaConnected ? "Rules execute via Alpaca Markets" : "Set up rules now, connect Alpaca to execute"}</CardDescription></div>
            </div>
            <div className="text-right"><p className="text-sm text-muted-foreground">Est. Monthly</p>
              <p className="text-xl font-bold text-accent">${calcMonthly().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
          </div>
        </CardHeader>
        <CardContent>
          <TradeNotificationBanner notifications={notifications} onDismiss={dismissNotification} />

          {/* Alpaca account summary with fund management */}
          {alpacaConnected && (
            <div className="mb-4 p-4 rounded-lg bg-primary/40 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Alpaca Brokerage</span>
                  <Badge variant="outline" className="text-[10px]">{alpacaAccount!.status === "ACTIVE" ? "Paper Trading" : alpacaAccount!.status}</Badge>
                  {pendingTransfers.length > 0 && <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30"><Clock className="w-2.5 h-2.5 mr-0.5" />{pendingTransfers.length} pending</Badge>}
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-secondary-foreground cursor-pointer" onClick={() => setIsInfoModalOpen(true)}>
                  <InfoIcon className="w-3.5 h-3.5 mr-1" />How it works</Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><p className="text-xs text-muted-foreground">Portfolio</p><p className="font-semibold text-foreground">${Number(alpacaAccount!.portfolio_value || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p></div>
                <div><p className="text-xs text-muted-foreground">Cash</p><p className="font-semibold text-foreground">${alpacaCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p></div>
                <div><p className="text-xs text-muted-foreground">Positions</p><p className="font-semibold text-foreground">{positionsList.length}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50">
                <Button variant="outline" size="sm" className="w-full text-xs bg-white/5 hover:bg-white/20 border-border text-foreground hover:text-foreground cursor-pointer" onClick={() => setIsFundModalOpen(true)}>
                  <Wallet className="w-3.5 h-3.5 mr-1.5" />Manage Funds — Deposit or Withdraw
                  {plaidAccounts.filter((a: any) => a.type === "depository").length > 0 && (
                    <Badge variant="outline" className="ml-2 text-[9px] text-emerald-700 border-emerald-500/70">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />{plaidAccounts.filter((a: any) => a.type === "depository").length} bank{plaidAccounts.filter((a: any) => a.type === "depository").length > 1 ? "s" : ""} linked
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          )}

          {!alpacaConnected && (<div className="mb-4"><Button variant="outline" size="sm" className="w-full text-xs cursor-pointer dark:bg-primary dark:text-primary-foreground dark:hover:bg-accent" onClick={() => setIsInfoModalOpen(true)}><Shield className="w-3.5 h-3.5 mr-1.5" />Learn how your money is protected with Alpaca</Button></div>)}

          {/* Positions */}
          {positionsList.length > 0 && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Current Positions</p>
                <Button variant="ghost" size="sm" className="h-7 text-xs bg-primary/20 text-muted-foreground hover:text-secondary-foreground border border-border cursor-pointer" onClick={() => setIsSellModalOpen(true)} disabled={!marketIsOpen}>
                  <ArrowDownRight className="w-3.5 h-3.5 mr-1 text-destructive" />Sell Shares</Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {positionsList.slice(0, 4).map((pos) => (
                  <div key={pos.symbol} className="p-3 rounded-lg border border-border bg-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{pos.symbol}</span>
                      <span className={`text-xs font-medium ${Number(pos.unrealized_pl) >= 0 ? "text-accent" : "text-destructive"}`}>
                        {Number(pos.unrealized_plpc) >= 0 ? "+" : ""}{(Number(pos.unrealized_plpc) * 100).toFixed(2)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{pos.qty} shares @ ${Number(pos.avg_entry_price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              {positionsList.length > 4 && <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground cursor-pointer" onClick={() => setIsSellModalOpen(true)}>View all {positionsList.length} positions</Button>}
            </div>
          )}

          {/* Rules list */}
          {rulesList.length > 0 ? (
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {rulesList.map((rule) => (
                <div key={rule.id} className={`p-4 rounded-lg border transition-all ${rule.is_active ? "border-border bg-primary/20" : "border-accent/50 bg-accent/5 opacity-75"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch checked={rule.is_active} onCheckedChange={() => toggleRule(rule)} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-lg text-foreground">{rule.symbol}</span>
                          <Badge variant="outline" className="text-[10px]">{rule.type === "amount" ? "$ Amount" : "# Shares"}</Badge>
                          {getStrategyBadge(rule)}
                          {(rule as any).auto_fund && (rule as any).funding_account_id && (
                            <Badge variant="outline" className="text-[9px] text-purple-500 border-purple-500/30"><Zap className="w-2.5 h-2.5 mr-0.5" />Auto-Fund</Badge>
                          )}
                          {(rule as any).pending_execution && (
                            <Badge variant="outline" className="text-[9px] text-amber-500 border-amber-500/30"><Clock className="w-2.5 h-2.5 mr-0.5" />Awaiting Funds</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />{getFreqLabel(rule.frequency)}
                          {(rule.min_price || rule.max_price) && <span className="text-xs">{" · "}{(rule as any).strategy === "smart_dip" ? `Buy below $${rule.max_price}` : (rule as any).strategy === "threshold" ? `Threshold: $${rule.max_price}` : `$${rule.min_price || "0"} - $${rule.max_price || "∞"}`}</span>}
                        </div>
                        {rule.last_executed_at && <p className="text-xs text-muted-foreground mt-0.5">Last executed: {new Date(rule.last_executed_at).toLocaleDateString()}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-1">
                        <p className="font-semibold text-foreground">{rule.type === "amount" ? `$${Number(rule.value).toFixed(2)}` : `${Number(rule.value)} shares`}</p>
                        <p className="text-xs text-muted-foreground">per {rule.frequency === "daily" ? "day" : rule.frequency.replace("ly", "")}</p>
                        {plaidAccounts.find((a: any) => a.id === rule.funding_account_id) && (
                          <p className="text-[10px] text-muted-foreground">from {(plaidAccounts.find((a: any) => a.id === rule.funding_account_id) as any)?.name}</p>
                        )}
                      </div>
                      {alpacaConnected && rule.is_active && (
                        <Tooltip><TooltipTrigger asChild><span className="inline-flex">
                          <Button variant="ghost" size="icon" onClick={() => executeRule(rule.id)} disabled={executingRuleId === rule.id || !marketIsOpen}
                            className={marketIsOpen ? "text-muted-foreground hover:text-white cursor-pointer" : "text-muted-foreground opacity-50 cursor-not-allowed"}>
                            {executingRuleId === rule.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                          </Button></span></TooltipTrigger>
                          <TooltipContent>{marketIsOpen ? "Execute now" : `Market closed${marketNextOpen ? ` · Opens ${new Date(marketNextOpen).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}` : ""}`}</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white cursor-pointer" onClick={() => { setEditingRule(rule); setIsEditModalOpen(true) }}><Edit className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this rule?")) deleteRule(rule.id) }} className="text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg mb-4 dark:border-slate-500">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No investment rules set up</p>
              <p className="text-sm text-muted-foreground">Create rules to auto-invest while deployed</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer" disabled={!isLoggedIn}>
                  <Plus className="w-4 h-4 mr-2" />
                  {!isLoggedIn && "Log In to "}Add Investment Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Investment Rule</DialogTitle>
                  <DialogDescription>Choose a stock, set your strategy, and link a bank account for auto-funding.</DialogDescription></DialogHeader>

                <div className="space-y-2">
                  <Label>Stock / ETF</Label>
                  <TickerSearchInput value={newRule.symbol} selectedName={newRule.symbolName}
                    onSelect={(s, n, p) => { setNewRule({ ...newRule, symbol: s, symbolName: n }); if (p) setSelectedPrice(p) }} />
                  {newRule.symbol && currentPrice != null && (
                    <div className="flex items-center gap-2 text-xs px-1">
                      <span className="text-muted-foreground">Current price:</span><span className="font-semibold text-foreground">${currentPrice.toFixed(2)}</span>
                      {changePercent != null && <span className={changePercent >= 0 ? "text-accent" : "text-destructive"}>{changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%</span>}
                      {priceLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                    </div>
                  )}
                </div>

                <Tabs value={investmentType} onValueChange={(v) => setInvestmentType(v as "amount" | "shares")}>
                  <TabsList className="grid w-full grid-cols-2 bg-card border">
                    <TabsTrigger value="amount" className="flex items-center gap-2 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground"><DollarSign className="w-4 h-4" />Fixed Amount</TabsTrigger>
                    <TabsTrigger value="shares" className="flex items-center gap-2 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground"><Hash className="w-4 h-4" />Share Count</TabsTrigger>
                  </TabsList>
                  <TabsContent value="amount" className="space-y-4 mt-4">
                    <div className="flex gap-4 items-start"><div className="flex-1 space-y-2"><Label>Amount per purchase ($)</Label><Input type="number" placeholder="100.00" className="bg-card" value={newRule.value} onChange={(e) => setNewRule({ ...newRule, value: e.target.value })} /></div>
                      <div className="w-50 space-y-2"><Label>Frequency</Label><Select value={newRule.frequency} onValueChange={(v) => setNewRule({ ...newRule, frequency: v as any })}><SelectTrigger className="w-full bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="biweekly">Bi-weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div></div>
                  </TabsContent>
                  <TabsContent value="shares" className="space-y-4 mt-4">
                    <div className="flex gap-4 items-start"><div className="flex-1 space-y-2"><Label>Shares per purchase</Label><Input type="number" placeholder="1" className="!bg-card" value={newRule.value} onChange={(e) => setNewRule({ ...newRule, value: e.target.value })} />
                      {newRule.value && currentPrice != null && <p className="text-xs text-muted-foreground px-1">&asymp; ${(parseFloat(newRule.value) * currentPrice).toFixed(2)} per purchase</p>}</div>
                      <div className="w-50 space-y-2"><Label>Frequency</Label><Select value={newRule.frequency} onValueChange={(v) => setNewRule({ ...newRule, frequency: v as any })}><SelectTrigger className="w-full bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="biweekly">Bi-weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div></div>
                  </TabsContent>
                </Tabs>

                {/* Strategy */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><Label className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-muted-foreground" />Strategy</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground cursor-pointer" onClick={() => setShowStrategyInfo(!showStrategyInfo)}><Info className="w-3 h-3 mr-1" />{showStrategyInfo ? "Hide" : "Learn more"}</Button></div>
                  {showStrategyInfo && <div className="p-3 rounded-lg bg-card border border-border space-y-2">{Object.entries(STRATEGIES).map(([k, s]) => (<div key={k} className="flex gap-2"><s.icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.color}`} /><div><p className="text-xs font-medium text-foreground">{s.label}</p><p className="text-xs text-muted-foreground">{s.description}</p></div></div>))}</div>}
                  <div className="grid grid-cols-3 gap-2">{Object.entries(STRATEGIES).map(([k, s]) => (
                    <button key={k} onClick={() => setNewRule({ ...newRule, strategy: k as any })}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${newRule.strategy === k ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-card hover:bg-secondary/50"}`}>
                      <s.icon className={`w-5 h-5 mx-auto mb-1 ${newRule.strategy === k ? s.color : "text-muted-foreground"}`} /><p className="text-xs font-medium text-foreground">{s.label}</p>
                    </button>))}</div>
                  {newRule.strategy === "smart_dip" && (
                    <div className="p-3 rounded-lg bg-secondary border border-border space-y-2">
                      <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /><span className="text-sm font-medium text-secondary-foreground">Buy the Dip</span></div>
                      <Label className="text-xs text-secondary-foreground">Buy when price drops this % below average</Label>
                      <div className="flex items-center gap-2"><Input className="!bg-card w-24" type="number" min="1" max="50" value={newRule.dipPercentage} onChange={(e) => setNewRule({ ...newRule, dipPercentage: e.target.value })} /><span className="text-sm text-secondary-foreground">%</span></div>
                      {currentPrice != null && newRule.dipPercentage && <p className="text-xs text-secondary-foreground">Would buy below ~${(currentPrice * (1 - parseFloat(newRule.dipPercentage) / 100)).toFixed(2)}</p>}
                    </div>
                  )}
                  {newRule.strategy === "threshold" && (
                    <div className="p-3 rounded-lg bg-secondary border border-border space-y-2">
                      <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-500" /><span className="text-sm font-medium text-secondary-foreground">Price Threshold</span></div>
                      <Label className="text-xs text-secondary-foreground">Only buy below ($)</Label>
                      <Input className="!bg-card" type="number" placeholder={currentPrice ? `e.g., ${(currentPrice * 0.95).toFixed(2)}` : "150.00"} value={newRule.thresholdPrice} onChange={(e) => setNewRule({ ...newRule, thresholdPrice: e.target.value })} />
                    </div>
                  )}
                </div>

                {previewMonthlyCost() != null && (
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Est. monthly cost</span>
                      <span className="text-lg font-bold text-accent">~${previewMonthlyCost()!.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  </div>
                )}

                {/* Funding source + auto-fund */}
                {plaidAccounts.length > 0 && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-muted-foreground" />Funding Source</Label>
                      <Select value={newRule.fundingAccountId} onValueChange={(v) => setNewRule({ ...newRule, fundingAccountId: v })}>
                        <SelectTrigger className="bg-card cursor-pointer"><SelectValue placeholder="Select bank account" /></SelectTrigger>
                        <SelectContent>
                          {plaidAccounts.filter((a: any) => a.type === "depository").map((acct: any) => (
                            <SelectItem key={acct.id} value={acct.id}>{acct.name} {acct.mask && `(...${acct.mask})`} — ${Number(acct.balance_current).toFixed(2)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newRule.fundingAccountId && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-purple-500" />
                          <div><p className="text-xs font-medium text-foreground">Auto-Fund</p>
                            <p className="text-[10px] text-muted-foreground">Auto-deposit from bank when Alpaca cash is low</p></div>
                        </div>
                        <Switch checked={newRule.autoFund} onCheckedChange={(v) => setNewRule({ ...newRule, autoFund: v })} />
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={handleAddRule} disabled={!newRule.symbol || !newRule.value || !newRule.fundingAccountId}
                  className="w-full mt-2 bg-primary text-primary-foreground hover:bg-accent cursor-pointer">Create Investment Rule</Button>
              </DialogContent>
            </Dialog>

            {alpacaConnected && positionsList.length > 0 && (
              <Button variant="ghost" className="cursor-pointer border border-border dark:border-slate-500" onClick={() => setIsSellModalOpen(true)} disabled={!marketIsOpen}>
                <ArrowDownRight className="w-4 h-4 mr-2 text-destructive" />Sell</Button>
            )}

            {alpacaConnected && (
              <Button variant="ghost" className="cursor-pointer border border-border dark:border-slate-500" onClick={() => setIsFundModalOpen(true)}>
                <Wallet className="w-4 h-4 mr-2" />Funds</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <EditRuleModal open={isEditModalOpen} onOpenChange={(o) => { setIsEditModalOpen(o); if (!o) setEditingRule(null) }}
        rule={editingRule} plaidAccounts={plaidAccounts} onSave={handleEditSave} />

      <SellSharesModal open={isSellModalOpen} onOpenChange={setIsSellModalOpen} positions={positionsList}
        marketIsOpen={marketIsOpen} marketNextOpen={marketNextOpen} onNotify={addNotification}
        onSellComplete={() => { mutatePositions(); mutateAccount(); mutate() }} />

      <AlpacaInfoModal open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen} />

      <FundManagementModal open={isFundModalOpen} onOpenChange={setIsFundModalOpen}
        alpacaCash={alpacaCash} plaidAccounts={plaidAccounts} transfers={transfers}
        onNotify={addNotification} onComplete={() => { mutateAccount(); mutateTransfers() }} />
    </TooltipProvider>
  )
}