"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type BenefitCategory = "retirement" | "education" | "insurance" | "healthcare" | "housing" | "other"
export type BenefitStatus = "active" | "pending" | "expired" | "not_enrolled"

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
  eligibilityDate: string | null
  boardDate: string | null
  requirements: {
    id: string
    name: string
    completed: boolean
  }[]
  notes: string
}

const defaultBenefits: Benefit[] = [
  {
    id: "default-1",
    name: "Servicemembers Group Life Insurance (SGLI)",
    category: "insurance",
    status: "active",
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
    status: "active",
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
    status: "active",
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
  eligibilityDate: null,
  boardDate: null,
  requirements: [],
  notes: "",
}

export function useCareer() {
  const [benefits, setBenefits] = useState<Benefit[]>(defaultBenefits)
  const [milestones, setMilestones] = useState<CareerMilestone[]>([])
  const [tsp, setTsp] = useState<TSPInfo>(defaultTSP)
  const [giBill, setGiBill] = useState<GIBillInfo>(defaultGIBill)
  const [promotion, setPromotion] = useState<PromotionInfo>(defaultPromotion)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Check auth and load data
  useEffect(() => {
    const supabase = createClient()
    
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      
      if (user) {
        setIsSyncing(true)
        try {
          // Fetch milestones from Supabase
          const { data: dbMilestones } = await supabase
            .from("career_milestones")
            .select("*")
            .order("date_achieved", { ascending: false })
          
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

          // Fetch TSP benefit
          const { data: tspData } = await supabase
            .from("benefits_tracker")
            .select("*")
            .eq("benefit_type", "tsp")
            .single()
          
          if (tspData) {
            try {
              const parsed = tspData.notes ? JSON.parse(tspData.notes) : {}
              setTsp({
                ...defaultTSP,
                currentBalance: tspData.current_value?.toString() || "",
                ...parsed,
              })
            } catch {
              setTsp({
                ...defaultTSP,
                currentBalance: tspData.current_value?.toString() || "",
              })
            }
          }

          // Fetch GI Bill benefit
          const { data: giBillData } = await supabase
            .from("benefits_tracker")
            .select("*")
            .eq("benefit_type", "gi_bill")
            .single()
          
          if (giBillData) {
            try {
              const parsed = giBillData.notes ? JSON.parse(giBillData.notes) : {}
              setGiBill({
                ...defaultGIBill,
                monthsRemaining: giBillData.current_value || 36,
                ...parsed,
              })
            } catch {
              setGiBill({
                ...defaultGIBill,
                monthsRemaining: giBillData.current_value || 36,
              })
            }
          }

          // Fetch profile for rank
          const { data: profile } = await supabase
            .from("profiles")
            .select("rank")
            .eq("id", user.id)
            .single()
          
          if (profile?.rank) {
            setPromotion((prev) => ({ ...prev, currentRank: profile.rank }))
          }

        } catch (error) {
          console.error("Failed to load career data:", error)
        } finally {
          setIsSyncing(false)
        }
      }
      setIsLoaded(true)
    }

    loadData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id || null
      if (newUserId !== userId) {
        setUserId(newUserId)
        if (newUserId) {
          loadData()
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

    if (error) {
      console.error("Failed to add milestone:", error)
      return
    }

    setMilestones((prev) => [{
      id: data.id,
      title: data.title,
      date: data.date_achieved || data.date_target || "",
      description: data.description || "",
      achieved: data.is_completed,
      milestoneType: data.milestone_type,
    }, ...prev])
  }, [userId])

  const updateMilestone = useCallback(async (id: string, updates: Partial<CareerMilestone>) => {
    if (!userId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("career_milestones")
      .update({
        title: updates.title,
        milestone_type: updates.milestoneType,
        date_achieved: updates.achieved ? updates.date : null,
        date_target: !updates.achieved ? updates.date : null,
        is_completed: updates.achieved,
        description: updates.description,
      })
      .eq("id", id)

    if (error) {
      console.error("Failed to update milestone:", error)
      return
    }

    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, ...updates } : m))
  }, [userId])

  const deleteMilestone = useCallback(async (id: string) => {
    if (!userId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("career_milestones")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Failed to delete milestone:", error)
      return
    }

    setMilestones((prev) => prev.filter((m) => m.id !== id))
  }, [userId])

  const updateTSP = useCallback(async (updates: Partial<TSPInfo>) => {
    const newTsp = { ...tsp, ...updates }
    setTsp(newTsp)

    if (!userId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("benefits_tracker")
      .upsert({
        user_id: userId,
        benefit_type: "tsp",
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
      }, { onConflict: "user_id,benefit_type" })

    if (error) console.error("Failed to update TSP:", error)
  }, [userId, tsp])

  const updateGIBill = useCallback(async (updates: Partial<GIBillInfo>) => {
    const newGiBill = { ...giBill, ...updates }
    setGiBill(newGiBill)

    if (!userId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("benefits_tracker")
      .upsert({
        user_id: userId,
        benefit_type: "gi_bill",
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
      }, { onConflict: "user_id,benefit_type" })

    if (error) console.error("Failed to update GI Bill:", error)
  }, [userId, giBill])

  const updatePromotion = useCallback(async (updates: Partial<PromotionInfo>) => {
    setPromotion((prev) => ({ ...prev, ...updates }))

    if (!userId || !updates.currentRank) return

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ rank: updates.currentRank })
      .eq("id", userId)

    if (error) console.error("Failed to update rank:", error)
  }, [userId])

  const updateBenefit = useCallback((id: string, updates: Partial<Benefit>) => {
    setBenefits((prev) => prev.map((b) => b.id === id ? { ...b, ...updates } : b))
  }, [])

  const addBenefit = useCallback((benefit: Omit<Benefit, "id">) => {
    setBenefits((prev) => [...prev, { ...benefit, id: crypto.randomUUID() }])
  }, [])

  const deleteBenefit = useCallback((id: string) => {
    setBenefits((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const addPromotionRequirement = useCallback((name: string) => {
    setPromotion((prev) => ({
      ...prev,
      requirements: [...prev.requirements, { id: crypto.randomUUID(), name, completed: false }],
    }))
  }, [])

  const togglePromotionRequirement = useCallback((id: string) => {
    setPromotion((prev) => ({
      ...prev,
      requirements: prev.requirements.map((r) => r.id === id ? { ...r, completed: !r.completed } : r),
    }))
  }, [])

  const deletePromotionRequirement = useCallback((id: string) => {
    setPromotion((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((r) => r.id !== id),
    }))
  }, [])

  return {
    benefits,
    milestones,
    tsp,
    giBill,
    promotion,
    isLoaded,
    isSyncing,
    isAuthenticated: !!userId,
    updateBenefit,
    addBenefit,
    deleteBenefit,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    updateTSP,
    updateGIBill,
    updatePromotion,
    addPromotionRequirement,
    togglePromotionRequirement,
    deletePromotionRequirement,
  }
}
