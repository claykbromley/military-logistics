"use client"

import { useEffect, useState, useCallback } from "react"

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

interface CareerData {
  benefits: Benefit[]
  milestones: CareerMilestone[]
  tsp: TSPInfo
  giBill: GIBillInfo
  promotion: PromotionInfo
}

const STORAGE_KEY = "deployment-career-data"

const defaultBenefits: Benefit[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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

const defaultData: CareerData = {
  benefits: defaultBenefits,
  milestones: [],
  tsp: defaultTSP,
  giBill: defaultGIBill,
  promotion: defaultPromotion,
}

export function useCareer() {
  const [data, setData] = useState<CareerData>(defaultData)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setData({ ...defaultData, ...parsed })
      } catch {
        setData(defaultData)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data, isLoaded])

  const updateBenefit = useCallback((id: string, updates: Partial<Benefit>) => {
    setData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }))
  }, [])

  const addBenefit = useCallback((benefit: Omit<Benefit, "id">) => {
    const newBenefit: Benefit = { ...benefit, id: crypto.randomUUID() }
    setData((prev) => ({ ...prev, benefits: [...prev.benefits, newBenefit] }))
  }, [])

  const deleteBenefit = useCallback((id: string) => {
    setData((prev) => ({ ...prev, benefits: prev.benefits.filter((b) => b.id !== id) }))
  }, [])

  const addMilestone = useCallback((milestone: Omit<CareerMilestone, "id">) => {
    const newMilestone: CareerMilestone = { ...milestone, id: crypto.randomUUID() }
    setData((prev) => ({ ...prev, milestones: [...prev.milestones, newMilestone] }))
  }, [])

  const updateMilestone = useCallback((id: string, updates: Partial<CareerMilestone>) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }))
  }, [])

  const deleteMilestone = useCallback((id: string) => {
    setData((prev) => ({ ...prev, milestones: prev.milestones.filter((m) => m.id !== id) }))
  }, [])

  const updateTSP = useCallback((updates: Partial<TSPInfo>) => {
    setData((prev) => ({ ...prev, tsp: { ...prev.tsp, ...updates } }))
  }, [])

  const updateGIBill = useCallback((updates: Partial<GIBillInfo>) => {
    setData((prev) => ({ ...prev, giBill: { ...prev.giBill, ...updates } }))
  }, [])

  const updatePromotion = useCallback((updates: Partial<PromotionInfo>) => {
    setData((prev) => ({ ...prev, promotion: { ...prev.promotion, ...updates } }))
  }, [])

  const addPromotionRequirement = useCallback((name: string) => {
    const newReq = { id: crypto.randomUUID(), name, completed: false }
    setData((prev) => ({
      ...prev,
      promotion: { ...prev.promotion, requirements: [...prev.promotion.requirements, newReq] },
    }))
  }, [])

  const togglePromotionRequirement = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      promotion: {
        ...prev.promotion,
        requirements: prev.promotion.requirements.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)),
      },
    }))
  }, [])

  const deletePromotionRequirement = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      promotion: { ...prev.promotion, requirements: prev.promotion.requirements.filter((r) => r.id !== id) },
    }))
  }, [])

  return {
    benefits: data.benefits,
    milestones: data.milestones,
    tsp: data.tsp,
    giBill: data.giBill,
    promotion: data.promotion,
    isLoaded,
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
