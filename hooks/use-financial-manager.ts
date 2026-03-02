"use client"

import useSWR, { type SWRResponse } from "swr"
import { createClient } from "@/lib/supabase/client"
import type { Bill, FinancialGoal, InvestmentRule, Advisor, Account } from "@/lib/types"

const supabase = createClient()
const {
  data: { user }
} = await supabase.auth.getUser();

// ─── Bills ───────────────────────────────────────────────────────────────────

async function fetchBills(): Promise<Bill[]> {
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
  const swr = useSWR<Bill[]>("supabase:bills", fetchBills)

  const addBill = async (bill: Partial<Bill>) => {
    const { error } = await supabase.from("bills").insert({
      user_id: user?.id,
      name: bill.name!,
      merchant_name: bill.merchant_name ?? null,
      category: bill.category ?? "other",
      amount: bill.amount!,
      frequency: bill.frequency ?? "monthly",
      next_date: bill.next_date ?? null,
      is_essential: bill.is_essential ?? false,
    })
    if (error) throw error
    swr.mutate()
  }

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    const { error } = await supabase
      .from("bills")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user?.id)
    if (error) throw error
    swr.mutate()
  }

  const deleteBill = async (id: string) => {
    const { error } = await supabase
      .from("bills")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id)
    if (error) throw error
    swr.mutate()
  }

  return { ...swr, addBill, updateBill, deleteBill }
}

// ─── Financial Goals ─────────────────────────────────────────────────────────

async function fetchGoals(): Promise<FinancialGoal[]> {
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
    const { error } = await supabase.from("financial_goals").insert({
      user_id: user?.id,
      name: goal.name!,
      target_amount: goal.target_amount!,
      current_amount: goal.current_amount ?? 0,
      category: goal.category ?? "custom",
      target_date: goal.target_date ?? null,
    })
    if (error) throw error
    swr.mutate()
  }

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    // Auto-complete when current reaches target
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
      .eq("user_id", user?.id)
    if (error) throw error
    swr.mutate()
  }

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from("financial_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id)
    if (error) throw error
    swr.mutate()
  }

  return { ...swr, addGoal, updateGoal, deleteGoal }
}

// ─── Investment Rules ────────────────────────────────────────────────────────

async function fetchRules(): Promise<InvestmentRule[]> {
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
    const { error } = await supabase.from("investment_rules").insert({
      funding_account_id: rule.funding_account_id,
      user_id: user?.id,
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
    swr.mutate()
  }

  const updateRule = async (id: string, updates: Partial<InvestmentRule>) => {
    if (updates.symbol) updates.symbol = updates.symbol.toUpperCase()

    const { error } = await supabase
      .from("investment_rules")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user?.id)
    if (error) throw error
    swr.mutate()
  }

  const deleteRule = async (id: string) => {
    const { error } = await supabase
      .from("investment_rules")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id)
    if (error) throw error
    swr.mutate()
  }

  return { ...swr, addRule, updateRule, deleteRule }
}

// ─── Advisors ────────────────────────────────────────────────────────────────

interface AdvisorFilters {
  specialty?: string
  state?: string
  militaryOnly?: boolean
  search?: string
}

async function fetchAdvisors([, filters]: [string, AdvisorFilters]): Promise<Advisor[]> {
  let query = supabase
    .from("advisors")
    .select("*")
    .order("rating", { ascending: false })

  if (filters.specialty && filters.specialty !== "all") {
    query = query.contains("specialties", [filters.specialty])
  }
  if (filters.state && filters.state !== "all") {
    query = query.eq("state", filters.state)
  }
  if (filters.militaryOnly) {
    query = query.eq("military_experience", true)
  }
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,firm.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export function useAdvisors(filters: AdvisorFilters): SWRResponse<Advisor[]> {
  return useSWR<Advisor[]>(
    ["supabase:advisors", filters],
    fetchAdvisors
  )
}

// ─── Accounts (Plaid-connected) ──────────────────────────────────────────────

interface AccountsData {
  items: Array<{ id: string; institution_name: string; institution_id: string }>
  accounts: Account[]
}

async function fetchAccounts(): Promise<AccountsData> {
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
  return useSWR<AccountsData>("supabase:plaid_accounts", fetchAccounts)
}
