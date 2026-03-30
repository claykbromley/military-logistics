"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { PAYGRADES } from "@/lib/types"

export type BenefitCategory = "retirement" | "education" | "insurance" | "healthcare" | "housing" | "other"
export type BenefitStatus = "enrolled" | "pending" | "expired" | "not_enrolled"

export interface Benefit {
  id: string
  name: string
  category: BenefitCategory
  status: BenefitStatus
  enrollmentDate: string | null
  expirationDate: string | null
  value: string
  notes: string
  url: string
}

export interface CareerMilestone {
  id: string
  title: string
  date: string
  description: string
  achieved: boolean
  milestoneType?: string
}

export interface TSPInfo {
  contributionPercentage: number
  rothPercentage: number
  traditionalPercentage: number
  matchingPercentage: number
  currentBalance: string
  allocationFunds: {
    G: number
    F: number
    C: number
    S: number
    I: number
    L: number
  }
  notes: string
}

export interface GIBillInfo {
  type: "post911" | "montgomery" | "none"
  monthsRemaining: number
  percentageEntitlement: number
  transferredToDependent: boolean
  dependentName: string
  notes: string
}

export interface PromotionInfo {
  currentRank: string
  nextRank: string
  requirements: {
    id: string
    name: string
    completed: boolean
  }[]
  notes: string
}

export interface ServiceProfile {
  rank: string
  yearsOfService: number
  branch: string
  dependentStatus: boolean
  zipCode: string
  mha: string
  retirementSystem: "brs" | "high3" | "redux"
}

// ── Supabase row types ──
export interface PayTableRow {
  rank: string
  yos: number
  monthly_pay: number
}

export interface BAHTableRow {
  zip_code: string
  mha_code: string
  mha_name: string
  rank: string
  with_dependents: number
  without_dependents: number
}

export interface BASRate {
  category: string
  monthly_rate: number
  year: number
}

// ── All possible ranks ──
export const ALL_RANKS = PAYGRADES.map(p => p.label)
export const ENLISTED_RANKS = ALL_RANKS.filter((r) => r.startsWith("E-"))
export const WARRANT_RANKS = ALL_RANKS.filter((r) => r.startsWith("W-"))
export const OFFICER_RANKS = ALL_RANKS.filter((r) => r.startsWith("O-"))

// ── Typical career progression paths ──
export const CAREER_PROGRESSION: Record<string, { rank: string; yos: number }[]> = {
  enlisted: [
    { rank: "E-1", yos: 0 }, { rank: "E-2", yos: 1 }, { rank: "E-3", yos: 2 },
    { rank: "E-4", yos: 3 }, { rank: "E-5", yos: 6 }, { rank: "E-6", yos: 10 },
    { rank: "E-7", yos: 16 }, { rank: "E-8", yos: 20 }, { rank: "E-9", yos: 24 },
  ],
  enlisted_fast: [
    { rank: "E-1", yos: 0 }, { rank: "E-2", yos: 0.5 }, { rank: "E-3", yos: 1 },
    { rank: "E-4", yos: 2 }, { rank: "E-5", yos: 4 }, { rank: "E-6", yos: 7 },
    { rank: "E-7", yos: 12 }, { rank: "E-8", yos: 17 }, { rank: "E-9", yos: 21 },
  ],
  warrant: [
    { rank: "W-1", yos: 8 }, { rank: "W-2", yos: 12 }, { rank: "W-3", yos: 16 },
    { rank: "W-4", yos: 22 }, { rank: "W-5", yos: 28 },
  ],
  officer: [
    { rank: "O-1", yos: 0 }, { rank: "O-2", yos: 2 }, { rank: "O-3", yos: 4 },
    { rank: "O-4", yos: 10 }, { rank: "O-5", yos: 16 }, { rank: "O-6", yos: 22 },
  ],
  officer_fast: [
    { rank: "O-1", yos: 0 }, { rank: "O-2", yos: 2 }, { rank: "O-3", yos: 4 },
    { rank: "O-4", yos: 8 }, { rank: "O-5", yos: 14 }, { rank: "O-6", yos: 20 },
    { rank: "O-7", yos: 24 },
  ],
}

const defaultBenefits: Benefit[] = [
  {
    id: "default-1",
    name: "Servicemembers Group Life Insurance (SGLI)",
    category: "insurance",
    status: "enrolled",
    enrollmentDate: null,
    expirationDate: null,
    value: "$400,000",
    notes: "",
    url: "https://www.va.gov/life-insurance/options-eligibility/sgli/",
  },
  {
    id: "default-2",
    name: "TRICARE",
    category: "healthcare",
    status: "enrolled",
    enrollmentDate: null,
    expirationDate: null,
    value: "",
    notes: "",
    url: "https://www.tricare.mil/",
  },
  {
    id: "default-3",
    name: "Basic Allowance for Housing (BAH)",
    category: "housing",
    status: "enrolled",
    enrollmentDate: null,
    expirationDate: null,
    value: "",
    notes: "",
    url: "https://www.defensetravel.dod.mil/site/bah.cfm",
  },
]

const defaultTSP: TSPInfo = {
  contributionPercentage: 5,
  rothPercentage: 0,
  traditionalPercentage: 5,
  matchingPercentage: 5,
  currentBalance: "",
  allocationFunds: { G: 20, F: 20, C: 20, S: 20, I: 20, L: 0 },
  notes: "",
}

const defaultGIBill: GIBillInfo = {
  type: "post911",
  monthsRemaining: 36,
  percentageEntitlement: 100,
  transferredToDependent: false,
  dependentName: "",
  notes: "",
}

const defaultPromotion: PromotionInfo = {
  currentRank: "",
  nextRank: "",
  requirements: [],
  notes: "",
}

const defaultProfile: ServiceProfile = {
  rank: "E-5",
  yearsOfService: 6,
  branch: "army",
  dependentStatus: false,
  zipCode: "",
  mha: "",
  retirementSystem: "brs",
}

export function useCareer() {
  const [benefits, setBenefits] = useState<Benefit[]>(defaultBenefits)
  const [milestones, setMilestones] = useState<CareerMilestone[]>([])
  const [tsp, setTsp] = useState<TSPInfo>(defaultTSP)
  const [giBill, setGiBill] = useState<GIBillInfo>(defaultGIBill)
  const [promotion, setPromotion] = useState<PromotionInfo>(defaultPromotion)
  const [profile, setProfile] = useState<ServiceProfile>(defaultProfile)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [zipInput, setZipInput] = useState(profile.zipCode)

  // ── Pay data from Supabase ──
  const [payTable, setPayTable] = useState<PayTableRow[]>([])
  const [bahRates, setBahRates] = useState<BAHTableRow[]>([])
  const [basRates, setBasRates] = useState<BASRate[]>([])
  const [payTableLoaded, setPayTableLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const resetToDefaults = () => {
      setUserId(null)
      setMilestones([])
      setTsp(defaultTSP)
      setGiBill(defaultGIBill)
      setBenefits(defaultBenefits)
      setProfile(defaultProfile)
      setPromotion(defaultPromotion)
      setBahRates([])
      setIsSyncing(false)
      setZipInput("")
    }

    const loadPayTables = async () => {
      try {
        const { data: payData } = await supabase
          .from("pay_table")
          .select("*")
          .order("rank")
          .order("yos")

        if (payData && isMounted) setPayTable(payData)

        const { data: basData } = await supabase
          .from("bas_rates")
          .select("*")
          .eq("year", 2026)

        if (basData && isMounted) setBasRates(basData)
      } catch (error) {
        console.error("Failed to load pay tables:", error)
      } finally {
        if (isMounted) setPayTableLoaded(true)
      }
    }

    const loadBAHForZip = async (zipCode: string) => {
      if (!zipCode || zipCode.length < 5) return

      try {
        const coords = await getZipCoords(zipCode)
        if (!coords || !isMounted) return

        const { data: closest } = await supabase.rpc("closest_mha", {
          lat_input: coords.lat,
          lng_input: coords.lng,
        })

        if (!closest || closest.length === 0 || !isMounted) return

        const mhaCode = closest[0].mha_code

        const { data } = await supabase
          .from("bah_rates")
          .select("*")
          .eq("mha_code", mhaCode)

        if (!isMounted) return

        if (data && data.length > 0) {
          setBahRates(data)
          setProfile((prev) => ({
            ...prev,
            zipCode,
            mha: data[0].mha_name,
          }))
        } else {
          setBahRates([])
        }
      } catch (error) {
        console.error("Failed to load BAH:", error)
      }
    }

    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!isMounted) return

      if (!user) {
        resetToDefaults()
        setIsLoaded(true)
        return
      }

      setUserId(user.id)
      setIsSyncing(true)

      // Load pay tables in parallel with user data
      await loadPayTables()

      try {
        const [
          { data: dbMilestones },
          { data: tspData },
          { data: giBillData },
          { data: dbBenefits },
          { data: dbProfile },
        ] = await Promise.all([
          supabase
            .from("career_milestones")
            .select("*")
            .order("date_achieved", { ascending: false }),
          supabase
            .from("benefits_tracker")
            .select("*")
            .eq("benefit_type", "tsp")
            .maybeSingle(),
          supabase
            .from("benefits_tracker")
            .select("*")
            .eq("benefit_type", "gi_bill")
            .maybeSingle(),
          supabase
            .from("benefits_tracker")
            .select("*")
            .eq("user_id", user.id)
            .eq("benefit_type", "military_benefit"),
          supabase
            .from("profiles")
            .select("paygrade, military_branch, zip_code")
            .eq("id", user.id)
            .maybeSingle(),
        ])

        if (!isMounted) return

        if (dbMilestones) {
          setMilestones(dbMilestones.map((m) => ({
            id: m.id,
            title: m.title,
            date: m.date_achieved || m.date_target || "",
            description: m.description || "",
            achieved: m.is_completed || !!m.date_achieved,
            milestoneType: m.milestone_type,
          })))
        }

        if (tspData) {
          try {
            const parsed = tspData.notes ? JSON.parse(tspData.notes) : {}
            setTsp({ ...defaultTSP, currentBalance: tspData.current_value?.toString() || "", ...parsed })
          } catch {
            setTsp({ ...defaultTSP, currentBalance: tspData.current_value?.toString() || "" })
          }
        }

        if (giBillData) {
          try {
            const parsed = giBillData.notes ? JSON.parse(giBillData.notes) : {}
            setGiBill({ ...defaultGIBill, monthsRemaining: giBillData.current_value || 36, ...parsed })
          } catch {
            setGiBill({ ...defaultGIBill, monthsRemaining: giBillData.current_value || 36 })
          }
        }

        if (dbBenefits && dbBenefits.length > 0) {
          setBenefits(dbBenefits.map((b) => {
            const parsed = b.notes ? JSON.parse(b.notes) : {}
            return {
              id: b.id,
              name: b.benefit_name || parsed.name || "",
              category: parsed.category || "pay",
              status: (b.enrollment_status as BenefitStatus) || "eligible",
              value: parsed.value || "",
              url: parsed.url || "",
              notes: parsed.notes || "",
              enrollmentDate: parsed.enrollmentDate || "",
              expirationDate: parsed.expirationDate || "",
            }
          }))
        } else {
          const seeded = defaultBenefits.map((b) => ({
            id: crypto.randomUUID(),
            user_id: user.id,
            benefit_type: "military_benefit" as const,
            benefit_name: b.name,
            current_value: null,
            enrollment_status: "enrolled",
            notes: JSON.stringify({
              category: b.category,
              value: b.value,
              url: b.url,
              notes: b.notes || "",
              enrollmentDate: b.enrollmentDate || "",
              expirationDate: b.expirationDate || "",
            }),
            last_updated: new Date().toISOString(),
          }))

          await supabase.from("benefits_tracker").insert(seeded)
          setBenefits(defaultBenefits)
        }

        if (dbProfile) {
          const rank = PAYGRADES.find(p => p.value === dbProfile.paygrade) || { value: "e5", label: "E-5", next: "E-6", note: "Promotion board, ~4-6 YOS typical" }
          setProfile((prev) => ({
            ...prev,
            rank: rank.label,
            yearsOfService: rank.typicalYOS ?? 4,
            branch: dbProfile.military_branch || "army",
            dependentStatus: false,
            zipCode: dbProfile.zip_code || "",
            retirementSystem: "brs",
          }))
          setPromotion((prev) => ({ ...prev, currentRank: rank.label }))

          // BAH lookup inlined — no stale closure
          if (dbProfile.zip_code) {
            loadBAHForZip(dbProfile.zip_code)
          }
        }
      } catch (error) {
        console.error("Failed to load career data:", error)
      } finally {
        if (isMounted) {
          setIsSyncing(false)
          setIsLoaded(true)
        }
      }
    }

    // Initial load
    loadUserData()

    // Listen for auth changes — skip INITIAL_SESSION to avoid double-loading
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === "INITIAL_SESSION") return

      if (event === "SIGNED_IN") {
        loadUserData()
      } else if (event === "SIGNED_OUT") {
        resetToDefaults()
        setIsLoaded(true)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ── BAH lookup ──
  const getZipCoords = async (zip: string) => {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
    if (!res.ok) return null

    const data = await res.json()
    return {
      lat: parseFloat(data.places[0].latitude),
      lng: parseFloat(data.places[0].longitude),
    }
  }

  const lookupBAH = useCallback(async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) return

    const supabase = createClient()

    const coords = await getZipCoords(zipCode)
    if (!coords) return

    // Step 1: get closest MHA (just one)
    const { data: closest } = await supabase.rpc("closest_mha", {
      lat_input: coords.lat,
      lng_input: coords.lng,
    })

    if (!closest || closest.length === 0) return

    const mhaCode = closest[0].mha_code

    // Step 2: get all rows for that MHA
    const { data } = await supabase
      .from("bah_rates")
      .select("*")
      .eq("mha_code", mhaCode)

    if (data && data.length > 0) {
      setBahRates(data)
      setProfile((prev) => ({
        ...prev,
        zipCode,
        mha: data[0].mha_name,
      }))
    } else {
      setBahRates([])
    }
  }, [])

  const getBAH = useCallback((rank: string, withDependents: boolean): number => {
    if (bahRates.length === 0) return 0
    const match = bahRates.find((r) => r.rank === rank)
    if (!match) return 0
    return withDependents ? match.with_dependents : match.without_dependents
  }, [bahRates])

  const getBasePay = useCallback((rank: string, yos: number): number => {
    if (payTable.length === 0) return 0
    const rankRows = payTable
      .filter((r) => r.rank === rank && r.yos <= yos)
      .sort((a, b) => b.yos - a.yos)
    return rankRows[0]?.monthly_pay ?? 0
  }, [payTable])

  const getBAS = useCallback((rank: string): number => {
    const effectiveCategory = rank.startsWith("O") ? "officer" : "enlisted"
    const rate = basRates.find((r) => r.category === effectiveCategory)
    return rate?.monthly_rate ?? (effectiveCategory === "enlisted" ? 452 : 311)
  }, [basRates])

  // ── Get pay at a point in career progression ──
  const getCareerPay = useCallback((rank: string, yos: number): number => {
    return getBasePay(rank, yos)
  }, [getBasePay])

  const updateProfile = useCallback(async (updates: Partial<ServiceProfile>) => {
    const newProfile = { ...profile, ...updates }

    // Auto-set YOS when rank changes (unless YOS was explicitly provided)
    if (updates.rank && updates.yearsOfService === undefined) {
      const typicalYos = PAYGRADES.find(p => p.label === updates.rank)?.typicalYOS
      if (typicalYos !== undefined) {
        newProfile.yearsOfService = Math.max(typicalYos, profile.yearsOfService)
      }
    }

    setProfile(newProfile)
  }, [profile])

  const addMilestone = useCallback(async (milestone: Omit<CareerMilestone, "id">) => {
    if (!userId) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("career_milestones")
      .insert({
        user_id: userId,
        title: milestone.title,
        milestone_type: milestone.milestoneType || "other",
        date_achieved: milestone.achieved ? milestone.date : null,
        date_target: !milestone.achieved ? milestone.date : null,
        is_completed: milestone.achieved,
        description: milestone.description,
      })
      .select()
      .single()

    if (error) { console.error("Failed to add milestone:", error); return }
    setMilestones((prev) => [{ id: data.id, title: data.title, date: data.date_achieved || data.date_target || "", description: data.description || "", achieved: data.is_completed, milestoneType: data.milestone_type }, ...prev])
  }, [userId])

  const updateMilestone = useCallback(async (id: string, updates: Partial<CareerMilestone>) => {
    if (!userId) return
    const supabase = createClient()
    const { error } = await supabase
      .from("career_milestones")
      .update({ title: updates.title, milestone_type: updates.milestoneType, date_achieved: updates.achieved ? updates.date : null, date_target: !updates.achieved ? updates.date : null, is_completed: updates.achieved, description: updates.description })
      .eq("id", id)
    if (error) { console.error("Failed to update milestone:", error); return }
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, ...updates } : m))
  }, [userId])

  const deleteMilestone = useCallback(async (id: string) => {
    if (!userId) return
    const supabase = createClient()
    const { error } = await supabase.from("career_milestones").delete().eq("id", id)
    if (error) { console.error("Failed to delete milestone:", error); return }
    setMilestones((prev) => prev.filter((m) => m.id !== id))
  }, [userId])

  const updateTSP = useCallback(async (updates: Partial<TSPInfo>) => {
    const newTsp = { ...tsp, ...updates }
    setTsp(newTsp)
    if (!userId) return
    const supabase = createClient()

    const payload = {
      current_value: Number.parseFloat(newTsp.currentBalance) || null,
      enrollment_status: "enrolled",
      notes: JSON.stringify({
        contributionPercentage: newTsp.contributionPercentage,
        rothPercentage: newTsp.rothPercentage,
        traditionalPercentage: newTsp.traditionalPercentage,
        matchingPercentage: newTsp.matchingPercentage,
        allocationFunds: newTsp.allocationFunds,
        notes: newTsp.notes,
      }),
      last_updated: new Date().toISOString(),
    }

    const { data: existing } = await supabase
      .from("benefits_tracker")
      .select("id")
      .eq("user_id", userId)
      .eq("benefit_type", "tsp")
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("benefits_tracker")
        .update(payload)
        .eq("id", existing.id)
      if (error) console.error("Failed to update TSP:", error)
    } else {
      const { error } = await supabase
        .from("benefits_tracker")
        .insert({
          user_id: userId,
          benefit_type: "tsp",
          ...payload,
        })
      if (error) console.error("Failed to insert TSP:", error)
    }
  }, [userId, tsp])

  const updateGIBill = useCallback(async (updates: Partial<GIBillInfo>) => {
    const newGiBill = { ...giBill, ...updates }
    setGiBill(newGiBill)
    if (!userId) return
    const supabase = createClient()

    const payload = {
      current_value: newGiBill.monthsRemaining,
      max_value: 36,
      enrollment_status: newGiBill.type === "none" ? "not_enrolled" : "enrolled",
      notes: JSON.stringify({
        type: newGiBill.type,
        percentageEntitlement: newGiBill.percentageEntitlement,
        transferredToDependent: newGiBill.transferredToDependent,
        dependentName: newGiBill.dependentName,
        notes: newGiBill.notes,
      }),
      last_updated: new Date().toISOString(),
    }

    // Try update first
    const { data: existing } = await supabase
      .from("benefits_tracker")
      .select("id")
      .eq("user_id", userId)
      .eq("benefit_type", "gi_bill")
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("benefits_tracker")
        .update(payload)
        .eq("id", existing.id)
      if (error) console.error("Failed to update GI Bill:", error)
    } else {
      const { error } = await supabase
        .from("benefits_tracker")
        .insert({
          user_id: userId,
          benefit_type: "gi_bill",
          ...payload,
        })
      if (error) console.error("Failed to insert GI Bill:", error)
    }
  }, [userId, giBill])

  const updatePromotion = useCallback(async (updates: Partial<PromotionInfo>) => {
    setPromotion((prev) => ({ ...prev, ...updates }))
  }, [userId])

  const updateBenefit = useCallback(async (id: string, updates: Partial<Benefit>) => {
    setBenefits((prev) => prev.map((b) => b.id === id ? { ...b, ...updates } : b))
    if (!userId) return
    const supabase = createClient()
    const updated = benefits.find((b) => b.id === id)
    if (!updated) return
    const merged = { ...updated, ...updates }
    const { error } = await supabase
      .from("benefits_tracker")
      .upsert({
        id,
        user_id: userId,
        benefit_type: "military_benefit",
        benefit_name: merged.name,
        current_value: null,
        enrollment_status: merged.status,
        notes: JSON.stringify({
          category: merged.category,
          value: merged.value,
          url: merged.url,
          notes: merged.notes,
        }),
        last_updated: new Date().toISOString(),
      }, { onConflict: "id" })
    if (error) console.error("Failed to update benefit:", error)
  }, [userId, benefits])

  const addBenefit = useCallback(async (benefit: Omit<Benefit, "id">) => {
    const id = crypto.randomUUID()
    setBenefits((prev) => [...prev, { ...benefit, id }])
    if (!userId) return
    const supabase = createClient()
    const { error } = await supabase
      .from("benefits_tracker")
      .insert({
        id,
        user_id: userId,
        benefit_type: "military_benefit",
        benefit_name: benefit.name,
        current_value: null,
        enrollment_status: benefit.status,
        notes: JSON.stringify({
          category: benefit.category,
          value: benefit.value,
          url: benefit.url,
          notes: benefit.notes || "",
        }),
        last_updated: new Date().toISOString(),
      })
    if (error) console.error("Failed to add benefit:", error)
  }, [userId])

  const deleteBenefit = useCallback(async (id: string) => {
    setBenefits((prev) => prev.filter((b) => b.id !== id))
    if (!userId) return
    const supabase = createClient()
    const { error } = await supabase
      .from("benefits_tracker")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    if (error) console.error("Failed to delete benefit:", error)
  }, [userId])

  return {
    benefits, milestones, tsp, giBill, promotion, profile,
    isLoaded, isSyncing, isAuthenticated: !!userId,
    payTable, bahRates, basRates, payTableLoaded, zipInput,
    updateBenefit, addBenefit, deleteBenefit,
    addMilestone, updateMilestone, deleteMilestone,
    updateTSP, updateGIBill, updatePromotion, setZipInput,
    updateProfile, lookupBAH, getBAH, getBasePay, getBAS, getCareerPay
  }
}