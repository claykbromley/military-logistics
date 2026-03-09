"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import useSWR, { type SWRResponse } from "swr"
import { createClient } from "@/lib/supabase/client"
import type { Bill, FinancialGoal, InvestmentRule, Advisor, AdvisorFilters, Account } from "@/lib/types"

async function getUserId(): Promise<string | undefined> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id
}

// ─── Bills ───────────────────────────────────────────────────────────────────

async function fetchBills(): Promise<Bill[]> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []
  
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .order("amount", { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useBills(): SWRResponse<Bill[]> & {
  addBill: (bill: Partial<Bill>) => Promise<void>
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>
  deleteBill: (id: string) => Promise<void>
} {
  const swr = useSWR<Bill[]>("supabase:bills", fetchBills, {
    revalidateOnFocus: false,
    errorRetryCount: 2,
    dedupingInterval: 5000,
  })

  const addBill = async (bill: Partial<Bill>) => {
    const userId = await getUserId()
    const supabase = createClient()
    const { error } = await supabase.from("bills").insert({
      user_id: userId,
      name: bill.name!,
      account_id: bill.account_id,
      merchant_name: bill.merchant_name ?? null,
      category: bill.category ?? "other",
      amount: bill.amount!,
      frequency: bill.frequency ?? "monthly",
      next_date: bill.next_date ?? null,
      is_essential: bill.is_essential ?? false,
    })
    if (error) throw error
    await swr.mutate()
  }

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    const userId = await getUserId()
    const supabase = createClient()
    const { error } = await supabase
      .from("bills")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    await swr.mutate()
  }

  const deleteBill = async (id: string) => {
    const userId = await getUserId()
    const supabase = createClient()
    const { error } = await supabase
      .from("bills")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    await swr.mutate()
  }

  return { ...swr, addBill, updateBill, deleteBill }
}

// ─── Financial Goals ─────────────────────────────────────────────────────────

async function fetchGoals(): Promise<FinancialGoal[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("financial_goals")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useGoals(): SWRResponse<FinancialGoal[]> & {
  addGoal: (goal: Partial<FinancialGoal>) => Promise<void>
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
} {
  const swr = useSWR<FinancialGoal[]>("supabase:goals", fetchGoals)

  const addGoal = async (goal: Partial<FinancialGoal>) => {
    const userId = await getUserId()
    const supabase = createClient()
    const { error } = await supabase.from("financial_goals").insert({
      user_id: userId,
      name: goal.name!,
      target_amount: goal.target_amount!,
      current_amount: goal.current_amount ?? 0,
      category: goal.category ?? "custom",
      target_date: goal.target_date ?? null,
    })
    if (error) throw error
    await swr.mutate()
  }

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    const userId = await getUserId()
    const supabase = createClient()

    if (updates.current_amount !== undefined) {
      const existing = swr.data?.find((g) => g.id === id)
      if (existing && Number(updates.current_amount) >= Number(existing.target_amount)) {
        updates.is_completed = true
      }
    }

    const { error } = await supabase
      .from("financial_goals")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    await swr.mutate()
  }

  const deleteGoal = async (id: string) => {
    const userId = await getUserId()
    const supabase = createClient()
    const { error } = await supabase
      .from("financial_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    await swr.mutate()
  }

  return { ...swr, addGoal, updateGoal, deleteGoal }
}

// ─── Investment Rules ────────────────────────────────────────────────────────

async function fetchRules(): Promise<InvestmentRule[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("investment_rules")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useInvestmentRules(): SWRResponse<InvestmentRule[]> & {
  addRule: (rule: Partial<InvestmentRule>) => Promise<void>
  updateRule: (id: string, updates: Partial<InvestmentRule>) => Promise<void>
  deleteRule: (id: string) => Promise<void>
} {
  const swr = useSWR<InvestmentRule[]>("supabase:investment-rules", fetchRules)

  const addRule = async (rule: Partial<InvestmentRule>) => {
    const userId = await getUserId()
    const supabase = createClient()
    const { data: alpacaAccount, error: alpacaError } = await supabase
      .from("alpaca_accounts")
      .select("alpaca_account_id")
      .eq("user_id", userId)
      .single()
    if (alpacaError) {throw alpacaError}

    const { error } = await supabase.from("investment_rules").insert({
      funding_account_id: rule.funding_account_id,
      user_id: userId,
      alpaca_account_id: alpacaAccount.alpaca_account_id,
      type: rule.type!,
      symbol: rule.symbol!.toUpperCase(),
      value: rule.value!,
      frequency: rule.frequency!,
      min_price: rule.min_price ?? null,
      max_price: rule.max_price ?? null,
      is_active: true,
      strategy: rule.strategy ?? "dca",
      strategy_params: rule.strategy_params ?? {},
      estimated_share_price: rule.estimated_share_price ?? null,
    })
    if (error) throw error
    await swr.mutate()
  }

  const updateRule = async (id: string, updates: Partial<InvestmentRule>) => {
    const userId = await getUserId()
    const supabase = createClient()
    if (updates.symbol) updates.symbol = updates.symbol.toUpperCase()

    const { error } = await supabase
      .from("investment_rules")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    await swr.mutate()
  }

  const deleteRule = async (id: string) => {
    const userId = await getUserId()
    const supabase = createClient()
    const { error } = await supabase
      .from("investment_rules")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    await swr.mutate()
  }

  return { ...swr, addRule, updateRule, deleteRule }
}

// ─── Advisors ────────────────────────────────────────────────────────────────

export async function fetchDistinctStates(): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("financial_advisors")
    .select("state")
    .order("state")
  if (!data) return []
  return [...new Set(data.map((r) => r.state))].filter(Boolean)
}

export async function fetchDistinctSpecialties(): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("financial_advisors")
    .select("specialties")
  if (!data) return []
  const all = data.flatMap((r) => r.specialties || [])
  return [...new Set(all)].sort()
}

export async function fetchDistinctBranches(): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("financial_advisors")
    .select("branch")
    .not("branch", "is", null)
    .order("branch")
  if (!data) return []
  return [...new Set(data.map((r) => r.branch))].filter(Boolean) as string[]
}

export function useAdvisors(filters: AdvisorFilters = {}) {
  const [data, setData] = useState<Advisor[]>([])
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAdvisors = useCallback(async (f: AdvisorFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: rows, error: rpcError } = await supabase.rpc("search_advisors", {
        search_query:     f.search && f.search.trim() !== "" ? f.search.trim() : null,
        filter_specialty: f.specialty && f.specialty !== "all" ? f.specialty : null,
        filter_state:     f.state && f.state !== "all" ? f.state : null,
        filter_branch:    f.branch && f.branch !== "all" ? f.branch : null,
        filter_fee:       f.feeType && f.feeType !== "all" ? f.feeType : null,
        filter_military:  f.militaryOnly || null,
        filter_virtual:   f.virtualOnly || null,
        filter_tricare:   f.tricareOnly || null,
        sort_field:       f.sortBy || "rating",
        page_limit:       f.limit || 50,
        page_offset:      f.offset || 0,
      })
      if (rpcError) throw rpcError

      setData(rows as Advisor[])
      setCount(rows?.length ?? 0)
    } catch (err: any) {
      console.error("Failed to fetch advisors:", err)
      setError(err.message || "Failed to load advisors")
      setData([])
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchAdvisors(filters)
    }, filters.search ? 300 : 0)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [
    filters.search, filters.specialty, filters.state, filters.branch,
    filters.feeType, filters.militaryOnly, filters.virtualOnly,
    filters.tricareOnly, filters.sortBy, filters.limit, filters.offset,
    fetchAdvisors,
  ])

  return { data, count, isLoading, error, refetch: () => fetchAdvisors(filters) }
}

// ─── Accounts (Plaid-connected) ──────────────────────────────────────────────

interface AccountsData {
  items: Array<{ id: string; institution_name: string; institution_id: string }>
  accounts: Account[]
}

async function fetchAccounts(): Promise<AccountsData> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { accounts: [], items: [] }
  }

  const { data: items, error: itemsError } = await supabase
    .from("plaid_items")
    .select("id, institution_name, institution_id")

  if (itemsError) throw itemsError
  if (!items || items.length === 0) return { items: [], accounts: [] }

  const itemIds = items.map((i) => i.id)

  const { data: accounts, error: accError } = await supabase
    .from("plaid_accounts")
    .select("*")
    .in("plaid_item_id", itemIds)
    .order("balance_current", { ascending: false })

  if (accError) throw accError
  return { items: items ?? [], accounts: accounts ?? [] }
}

export function useAccounts(): SWRResponse<AccountsData> {
  return useSWR<AccountsData>("supabase:plaid_accounts", fetchAccounts, {
    revalidateOnFocus: false,
    errorRetryCount: 2,
    dedupingInterval: 5000,
  })
}

// ─── Net Worth Snapshots ─────────────────────────────────────────────────────

interface Snapshot {
  date: string
  bank_balance: number
  investment_balance: number
  total: number
}

interface ChartPoint {
  date: string
  fullDate: string
  bank: number
  investments: number
  total: number
}

function toChartPoint(date: Date, bank: number, investments: number): ChartPoint {
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fullDate: date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    bank,
    investments,
    total: bank + investments,
  }
}

async function fetchSnapshots([, days, isAll]: [string, number, boolean]): Promise<Snapshot[]> {
  const supabase = createClient()

  let query = supabase
    .from("net_worth_snapshots")
    .select("date, bank_balance, investment_balance, total")
    .order("date", { ascending: true })

  if (!isAll) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    query = query.gte("date", since.toISOString().slice(0, 10))
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

async function upsertSnapshot(
  bankBalance: number,
  investmentBalance: number
): Promise<void> {
  const supabase = createClient()
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10)
  const total = bankBalance + investmentBalance

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { error } = await supabase.from("net_worth_snapshots").upsert(
    {
      user_id: user.id,
      date: localDate,
      bank_balance: bankBalance,
      investment_balance: investmentBalance,
      total,
    },
    { onConflict: "user_id,date" }
  )

  if (error) console.error("Snapshot upsert failed:", error)
}

function buildHistory(snapshots: Snapshot[], days: number, isAll: boolean): ChartPoint[] {
  // "ALL" mode: only show actual data points, no zero padding
  if (isAll) {
    if (snapshots.length === 0) return []

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const firstDate = new Date(snapshots[0].date + "T00:00:00")

    const snapshotMap = new Map<string, Snapshot>()
    for (const s of snapshots) {
      snapshotMap.set(s.date, s)
    }

    const totalDays = Math.round((now.getTime() - firstDate.getTime()) / 86400000)
    const points: ChartPoint[] = []
    let lastBank = 0
    let lastInvestments = 0

    for (let i = totalDays; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const key = date.toISOString().slice(0, 10)

      const snapshot = snapshotMap.get(key)
      if (snapshot) {
        lastBank = Number(snapshot.bank_balance)
        lastInvestments = Number(snapshot.investment_balance)
      }
      points.push(toChartPoint(date, lastBank, lastInvestments))
    }

    return points
  }

  // Fixed range: zero-pad before first snapshot
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const snapshotMap = new Map<string, Snapshot>()
  for (const s of snapshots) {
    snapshotMap.set(s.date, s)
  }

  const points: ChartPoint[] = []
  let lastBank = 0
  let lastInvestments = 0

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const key = date.toISOString().slice(0, 10)

    const snapshot = snapshotMap.get(key)
    if (snapshot) {
      lastBank = Number(snapshot.bank_balance)
      lastInvestments = Number(snapshot.investment_balance)
    }
    points.push(toChartPoint(date, lastBank, lastInvestments))
  }

  return points
}

export function useNetWorthSnapshots(
  bankBalance: number,
  investmentBalance: number,
  days: number,
  hasData: boolean
) {
  const isAll = days === -1

  useEffect(() => {
    if (!hasData) return
    upsertSnapshot(bankBalance, investmentBalance)
  }, [bankBalance, investmentBalance, hasData])

  const { data: snapshots, isLoading } = useSWR<Snapshot[]>(
    hasData ? ["net_worth_snapshots", days, isAll] : null,
    fetchSnapshots,
    { revalidateOnFocus: false }
  )

  const history: ChartPoint[] = useMemo(() => {
    return buildHistory(snapshots ?? [], days, isAll)
  }, [snapshots, days, isAll])

  return { history, isLoading }
}