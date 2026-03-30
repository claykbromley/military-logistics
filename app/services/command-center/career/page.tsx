"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  ArrowLeft, Briefcase, GraduationCap, Shield, PiggyBank, Heart, Home, Plus,
  ExternalLink, Trash2, ChevronDown, ChevronUp, Target,
  Award, Calendar, AlertTriangle, CheckCircle, Info, DollarSign, ArrowUpRight,
  Clock, Zap, MapPin, Users, Search, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  useCareer, ENLISTED_RANKS, WARRANT_RANKS, OFFICER_RANKS, CAREER_PROGRESSION,
  type Benefit, type BenefitCategory, type BenefitStatus,
  type CareerMilestone, type TSPInfo, type GIBillInfo, type ServiceProfile,
} from "@/hooks/use-career"
import { PAYGRADES } from "@/lib/types"

// ═══════════════════════════════════════════════════════
// CONSTANTS & UTILITIES
// ═══════════════════════════════════════════════════════

const BRANCHES = [
  { value: "army", label: "Army" },
  { value: "navy", label: "Navy" },
  { value: "air_force", label: "Air Force" },
  { value: "marines", label: "Marine Corps" },
  { value: "coast_guard", label: "Coast Guard" },
  { value: "space_force", label: "Space Force" },
]

interface TSPFund {
  name: string
  risk: number
  avgReturn: number
}

const TSP_FUND_DATA: Record<string, TSPFund> = {
  G: { name: "Govt Securities", risk: 1, avgReturn: 2.5 },
  F: { name: "Fixed Income", risk: 2, avgReturn: 4.0 },
  C: { name: "S&P 500 Index", risk: 3, avgReturn: 10.0 },
  S: { name: "Small Cap", risk: 4, avgReturn: 11.0 },
  I: { name: "International", risk: 4, avgReturn: 8.0 },
}

interface ResourceLink { name: string; url: string; description?: string }
interface ResourceCategory { category: string; icon: React.ReactNode; links: ResourceLink[] }

const RESOURCES: ResourceCategory[] = [
  {
    category: "Pay & Finance",
    icon: <DollarSign className="h-4 w-4" />,
    links: [
      { name: "myPay (LES / W-2)", url: "https://mypay.dfas.mil", description: "View your Leave & Earnings Statement" },
      { name: "DFAS Pay Tables", url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/", description: "Official 2026 pay charts" },
      { name: "BAH Calculator", url: "https://www.defensetravel.dod.mil/site/bahCalc.cfm", description: "Look up housing allowance by location" },
      { name: "Military OneSource Finance", url: "https://www.militaryonesource.mil/financial-legal/", description: "Free financial counseling & tools" },
    ],
  },
  {
    category: "Retirement",
    icon: <PiggyBank className="h-4 w-4" />,
    links: [
      { name: "TSP.gov", url: "https://www.tsp.gov", description: "Manage your Thrift Savings Plan" },
      { name: "BRS Comparison Tool", url: "https://militarypay.defense.gov/calculators/BRS/", description: "Compare retirement systems" },
      { name: "DoD Retirement Calculators", url: "https://militarypay.defense.gov/calculators/", description: "Estimate your pension" },
      { name: "Survivor Benefit Plan", url: "https://militarypay.defense.gov/Benefits/Survivor-Benefit-Program/", description: "Protect your family" },
    ],
  },
  {
    category: "Education",
    icon: <GraduationCap className="h-4 w-4" />,
    links: [
      { name: "VA GI Bill Benefits", url: "https://www.va.gov/education/about-gi-bill-benefits/", description: "Check eligibility & apply" },
      { name: "Tuition Assistance", url: "https://www.militaryonesource.mil/education-employment/for-service-members/tuition-assistance/", description: "$4,500/year while serving" },
      { name: "CLEP / DSST Exams", url: "https://clep.collegeboard.org/clep-for-military", description: "Earn free college credits" },
      { name: "COOL Credentialing", url: "https://www.cool.osd.mil", description: "Fund civilian certifications" },
    ],
  },
  {
    category: "Healthcare & Insurance",
    icon: <Heart className="h-4 w-4" />,
    links: [
      { name: "TRICARE", url: "https://www.tricare.mil", description: "Health plan options" },
      { name: "SGLI / VGLI", url: "https://www.va.gov/life-insurance/", description: "Life insurance programs" },
      { name: "milConnect", url: "https://milconnect.dmdc.osd.mil", description: "Benefits & DEERS management" },
      { name: "Military OneSource", url: "https://www.militaryonesource.mil", description: "24/7 support services" },
    ],
  },
  {
    category: "Transition & Jobs",
    icon: <Briefcase className="h-4 w-4" />,
    links: [
      { name: "TAP Program", url: "https://www.dodtap.mil", description: "Transition Assistance Program" },
      { name: "VA Service Member Benefits", url: "https://www.va.gov/service-member-benefits/", description: "Pre-separation benefits" },
      { name: "USAJobs", url: "https://www.usajobs.gov", description: "Federal job listings" },
      { name: "Hire Heroes USA", url: "https://www.hireheroesusa.org", description: "Free career coaching for vets" },
    ],
  },
]

// ─── Utility functions ───
const fmt = (n: number): string => "$" + Math.round(n).toLocaleString()
const fmtK = (n: number): string =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : fmt(n)

function getRankCategory(rank: string): "enlisted" | "warrant" | "officer" {
  if (rank.startsWith("W-")) return "warrant"
  if (rank.startsWith("O-")) return "officer"
  return "enlisted"
}

const YOS_OPTIONS = Array.from({ length: 41 }, (_, i) => i)

// ═══════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════

export default function CareerBenefitsPage() {
  const {
    benefits, milestones, tsp, giBill, promotion, profile,
    isLoaded, isSyncing, isAuthenticated,
    payTable, bahRates, zipInput,
    updateBenefit, addBenefit, deleteBenefit,
    addMilestone, updateMilestone, deleteMilestone,
    updateTSP, updateGIBill, updatePromotion, updateProfile,
    lookupBAH, getBAH, getBasePay, getBAS, setZipInput,
  } = useCareer()

  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null)
  const [isBenefitDialogOpen, setIsBenefitDialogOpen] = useState(false)
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false)
  const [payTableFilter, setPayTableFilter] = useState<"enlisted" | "warrant" | "officer">("enlisted")
  const [retirementYears, setRetirementYears] = useState(20)
  const [retirementProgression, setRetirementProgression] = useState("typical")
  const [retirementAnnualRaise, setRetirementAnnualRaise] = useState(3.5)
  const [monthlyBonus, setMonthlyBonus] = useState("")

  const [newBenefit, setNewBenefit] = useState<Partial<Benefit>>({
    name: "", category: "other", status: "not_enrolled", value: "", notes: "", url: "",
  })
  const [newMilestone, setNewMilestone] = useState<Partial<CareerMilestone>>({
    title: "", date: "", description: "", achieved: false,
  })

  // Sync zip input with profile
  useEffect(() => { setZipInput(profile.zipCode) }, [profile.zipCode])

  // Auto-set payTableFilter based on current rank
  useEffect(() => {
    setPayTableFilter(getRankCategory(profile.rank))
  }, [profile.rank])

  // ─── Derived calculations ───
  const currentRank = PAYGRADES.find(p => p.label === (profile.rank)) || { value: "e5", label: "E-5", next: "E-6", note: "Promotion board, ~4-6 YOS typical" }
  const yos = profile.yearsOfService
  const basePay = getBasePay(currentRank.label, yos)
  const bas = getBAS(currentRank.label)
  const hasDependents = profile.dependentStatus
  const bah = getBAH(currentRank.value, hasDependents)
  const totalMonthlyComp = basePay + bas + bah + Number(monthlyBonus)

  // TSP calculations
  const tspMonthlyContrib = basePay * (tsp.contributionPercentage / 100)
  const tspAnnualContrib = tspMonthlyContrib * 12
  const tspMatchPct = Math.min(tsp.contributionPercentage, 5)
  const tspMatchAnnual = basePay * (tspMatchPct / 100) * 12
  const tspAnnualLimit = 24500
  const allocTotal = Object.values(tsp.allocationFunds).reduce((a, b) => a + b, 0)

  const weightedReturn = useMemo(() => {
    if (allocTotal === 0) return 7
    const funds = tsp.allocationFunds as Record<string, number>
    return Object.entries(funds).reduce((acc, [fund, pct]) => {
      const fundKey = fund as keyof typeof TSP_FUND_DATA
      return acc + (TSP_FUND_DATA[fundKey]?.avgReturn ?? 0) * (pct / allocTotal)
    }, 0)
  }, [tsp.allocationFunds, allocTotal])

  type AllocationFunds = TSPInfo["allocationFunds"]
  const rebalanceAllocations = (
    current: AllocationFunds,
    changedFund: keyof AllocationFunds,
    newValue: number
  ): AllocationFunds => {
    const totalOthers = Object.entries(current)
      .filter(([k]) => k !== changedFund)
      .reduce((sum, [, v]) => sum + v, 0)

    const delta = newValue - current[changedFund]

    const updated: AllocationFunds = { ...current }

    updated[changedFund] = newValue

    if (totalOthers === 0) return updated

    for (const key in current) {
      if (key === changedFund) continue

      const k = key as keyof AllocationFunds
      const proportion = current[k] / totalOthers

      updated[k] = Math.max(0, Math.round(current[k] - delta * proportion))
    }

    // Fix rounding drift
    const total = Object.values(updated).reduce((a, b) => a + b, 0)
    const diff = 100 - total

    if (diff !== 0) {
      const largest = (Object.keys(updated) as Array<keyof AllocationFunds>)
        .filter((k) => k !== changedFund)
        .sort((a, b) => updated[b] - updated[a])[0]

      if (largest) updated[largest] += diff
    }

    return updated
  }

  const tspBalance = parseFloat(tsp.currentBalance) || 0
  const yrsToRetirement = Math.max(0, 20 - yos)

  const tspProjection = useMemo(() => {
    const r = weightedReturn / 100
    let bal = tspBalance
    const annualAdd = tspAnnualContrib + tspMatchAnnual
    const pts: { year: number; balance: number }[] = [{ year: 0, balance: bal }]
    for (let i = 1; i <= 30; i++) {
      bal = bal * (1 + r) + (i <= yrsToRetirement ? annualAdd : 0)
      pts.push({ year: i, balance: bal })
    }
    return pts
  }, [tspBalance, tspAnnualContrib, tspMatchAnnual, weightedReturn, yrsToRetirement])

  const tspAtRetirement = tspProjection.find((p) => p.year === yrsToRetirement)?.balance ?? tspBalance

  // Retirement calculations
  const retirementSystem = profile.retirementSystem
  const multiplier = retirementSystem === "high3" ? 2.5 : retirementSystem === "redux" ? 2.0 : 2.0

  // ── Career progression retirement calculaLtor ──
  const retirementProjection = useMemo(() => {
    const cat = getRankCategory(currentRank.label)
    let progressionPath: { rank: string; yos: number }[]

    if (retirementProgression === "custom") {
      // Just use current rank for all years
      progressionPath = [{ rank: currentRank.label, yos: yos }]
    } else {
      const key = retirementProgression === "fast"
        ? (cat === "enlisted" ? "enlisted_fast" : cat === "officer" ? "officer_fast" : "warrant")
        : (cat === "enlisted" ? "enlisted" : cat === "officer" ? "officer" : "warrant")
      progressionPath = CAREER_PROGRESSION[key] || [{ rank: currentRank.label, yos }]
    }

    // Build year-by-year projection from current YOS to retirement
    const years: { yos: number; rank: string; basePay: number; adjustedPay: number }[] = []
    let cumulativeRaise = 1.0

    for (let y = yos; y <= retirementYears; y++) {
      // Find the rank at this YOS from progression
      let rankAtYos = currentRank.label
      for (const step of progressionPath) {
        if (step.yos <= y) rankAtYos = step.rank
      }

      const pay = getBasePay(rankAtYos, y)
      const adjustedPay = pay > 0 ? pay * cumulativeRaise : 0

      years.push({ yos: y, rank: rankAtYos, basePay: pay, adjustedPay })
      cumulativeRaise *= (1 + retirementAnnualRaise / 100)
    }

    // High-3 average: highest 36 months of base pay
    const allPays = years.map(y => y.adjustedPay).filter(p => p > 0)
    const sortedPays = [...allPays].sort((a, b) => b - a)
    const high3 = sortedPays.slice(0, 3).reduce((s, v) => s + v, 0) / Math.min(3, sortedPays.length)

    const pensionMultiplier = retirementYears * multiplier / 100
    const monthlyPension = high3 * pensionMultiplier
    const annualPension = monthlyPension * 12

    return {
      years,
      high3Average: high3,
      pensionMultiplier,
      monthlyPension,
      annualPension,
      finalRank: ["O-7", "O-8", "O-9", "O-10"].includes(currentRank.label)
        ? currentRank.label
        : years[years.length - 1]?.rank || currentRank.label,
    }
  }, [currentRank, yos, retirementYears, retirementProgression, retirementAnnualRaise, getBasePay, multiplier])

  // GI Bill value estimate
  const giBillMonthlyHousing = giBill.percentageEntitlement === 100 ? 2100 : giBill.percentageEntitlement * 21
  const giBillTuitionCap = giBill.type === "post911" ? 28937 : 0
  const giBillTotalValue =
    giBill.monthsRemaining * giBillMonthlyHousing + (giBill.monthsRemaining / 36) * giBillTuitionCap

  // Promotion progress
  const nextRank = currentRank.next || null
  const promoNote = PAYGRADES.find(p => p.label === currentRank.next)?.note || ""
  const nextRankPay = nextRank ? getBasePay(nextRank, yos) : 0
  const payRaise = nextRankPay > 0 ? nextRankPay - basePay : 0
  const promotionProgress =
    promotion.requirements.length > 0
      ? Math.round(
        (promotion.requirements.filter((r) => r.completed).length / promotion.requirements.length) * 100
      )
      : 0

  // ─── Smart alerts ───
  type AlertItem = { type: "warn" | "ok" | "info"; text: string }
  const alerts: AlertItem[] = useMemo(() => {
    const a: AlertItem[] = []
    if (retirementSystem === "brs") {
      if (tsp.contributionPercentage < 5) {
        const missing = fmt(basePay * ((5 - tsp.contributionPercentage) / 100) * 12)
        a.push({ type: "warn", text: `Contribute 5%+ to TSP for the full government match. You're missing ~${missing}/year in free money.` })
      } else {
        a.push({ type: "ok", text: "You're getting the full 5% TSP government match." })
      }
    }
    if (tspAnnualContrib > tspAnnualLimit) {
      a.push({ type: "warn", text: `TSP contributions (${fmt(tspAnnualContrib)}/yr) exceed the 2026 limit of $24,500. Adjust to avoid losing months of matching.` })
    }
    if (allocTotal !== 100 && allocTotal > 0) {
      a.push({ type: "warn", text: `TSP fund allocation totals ${allocTotal}% — should be exactly 100%.` })
    }
    if (giBill.monthsRemaining < 36 && giBill.monthsRemaining > 0) {
      a.push({ type: "info", text: `${giBill.monthsRemaining} months of GI Bill remaining (worth ~${fmtK(giBillTotalValue)}). Plan your education timeline.` })
    }
    if (yrsToRetirement > 0 && yrsToRetirement <= 4) {
      a.push({ type: "info", text: `${yrsToRetirement} years to retirement eligibility. Start your TAP transition planning.` })
    }
    if (!profile.zipCode) {
      a.push({ type: "info", text: "Enter your duty station ZIP code in the Pay tab to see your actual BAH rate." })
    }
    return a
  }, [tsp, tspAnnualContrib, allocTotal, giBill, yrsToRetirement, basePay, giBillTotalValue, retirementSystem, profile.zipCode])

  // ─── Handlers ───
  const handleAddBenefit = () => {
    if (newBenefit.name) {
      addBenefit({
        name: newBenefit.name,
        category: (newBenefit.category as BenefitCategory) || "other",
        status: (newBenefit.status as BenefitStatus) || "not_enrolled",
        enrollmentDate: null, expirationDate: null,
        value: newBenefit.value || "", notes: newBenefit.notes || "", url: newBenefit.url || "",
      })
      setNewBenefit({ name: "", category: "other", status: "not_enrolled", value: "", notes: "", url: "" })
      setIsBenefitDialogOpen(false)
    }
  }

  const handleAddMilestone = () => {
    if (newMilestone.title) {
      addMilestone({
        title: newMilestone.title, date: newMilestone.date || "",
        description: newMilestone.description || "", achieved: newMilestone.achieved || false,
      })
      setNewMilestone({ title: "", date: "", description: "", achieved: false })
      setIsMilestoneDialogOpen(false)
    }
  }

  const handleZipLookup = () => {
    if (zipInput.length >= 5) {
      lookupBAH(zipInput)
    }
  }

  // ─── Category config ───
  const categoryConfig: Record<BenefitCategory, { label: string; icon: React.ReactNode; color: string }> = {
    retirement: { label: "Retirement", icon: <PiggyBank className="h-4 w-4" />, color: "bg-[oklch(0.87_0.184_106/0.15)] text-[oklch(0.5_0.15_106)]" },
    education: { label: "Education", icon: <GraduationCap className="h-4 w-4" />, color: "bg-[oklch(0.68_0.148_237/0.15)] text-[oklch(0.45_0.15_237)]" },
    insurance: { label: "Insurance", icon: <Shield className="h-4 w-4" />, color: "bg-[oklch(0.76_0.165_70/0.15)] text-[oklch(0.5_0.15_70)]" },
    healthcare: { label: "Healthcare", icon: <Heart className="h-4 w-4" />, color: "bg-[oklch(0.63_0.208_25/0.15)] text-[oklch(0.45_0.2_25)]" },
    housing: { label: "Housing", icon: <Home className="h-4 w-4" />, color: "bg-[oklch(0.54_0.237_290/0.15)] text-[oklch(0.4_0.2_290)]" },
    other: { label: "Other", icon: <Briefcase className="h-4 w-4" />, color: "bg-muted text-muted-foreground" },
  }

  const statusConfig: Record<BenefitStatus, { label: string; className: string }> = {
    enrolled: { label: "Enrolled", className: "bg-[oklch(0.72_0.192_149/0.15)] text-[oklch(0.45_0.15_149)]" },
    pending: { label: "Pending", className: "bg-[oklch(0.76_0.165_70/0.15)] text-[oklch(0.5_0.15_70)]" },
    expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
    not_enrolled: { label: "Not Enrolled", className: "bg-muted text-muted-foreground" },
  }

  // ─── Build pay table from Supabase data ───
  const payTableByFilter = useMemo(() => {
    if (payTable.length === 0) return { ranks: [] as string[], yosKeys: [] as number[], data: {} as Record<string, Record<number, number>> }

    const filterRanks = payTableFilter === "enlisted" ? ENLISTED_RANKS
      : payTableFilter === "warrant" ? WARRANT_RANKS : OFFICER_RANKS

    const relevantRows = payTable.filter((r) => filterRanks.includes(r.rank))
    const ranks = [...new Set(relevantRows.map((r) => r.rank))].sort((a, b) => {
      return filterRanks.indexOf(a) - filterRanks.indexOf(b)
    })
    const yosKeys = [...new Set(relevantRows.map((r) => r.yos))].sort((a, b) => a - b)

    const data: Record<string, Record<number, number>> = {}
    for (const row of relevantRows) {
      if (!data[row.rank]) data[row.rank] = {}
      data[row.rank][row.yos] = row.monthly_pay
    }

    return { ranks, yosKeys, data }
  }, [payTable, payTableFilter])

  // ─── Loading state ───
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/20 mx-auto mb-4 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-accent animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your career data…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ─── Page Header ─── */}
      <div className="relative overflow-hidden border-b bg-primary dark:bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Link href="./">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Career Calculators and Milestones
                  </h1>
                </div>
                <p className="text-white/80 mt-1">
                  {currentRank.label} · {yos} YOS · TSP, GI Bill, promotions, pay & benefits
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSyncing && (
                <Badge variant="outline" className="text-xs text-white dark:border-slate-500">
                  <Clock className="h-3 w-3 mr-1 animate-spin" /> Saving…
                </Badge>
              )}
              {!isAuthenticated && (
                <Badge variant="outline" className="text-xs text-white dark:border-slate-500">Local Mode</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full h-auto flex gap-3 overflow-x-auto rounded-2xl bg-muted/60 p-1.5 backdrop-blur-sm border border-border shadow-sm">
            {[
              { value: "overview", label: "Overview" },
              { value: "pay", label: "Pay" },
              { value: "tsp", label: "TSP" },
              { value: "retirement", label: "Retire" },
              { value: "gibill", label: "GI Bill" },
              { value: "benefits", label: "Benefits" },
              { value: "resources", label: "Resources" },
            ].map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/10 data-[state=active]:!bg-primary/30 data-[state=active]:!text-foreground cursor-pointer"
              >
                <span className="whitespace-nowrap">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ════════════════════════════════════════════ */}
          {/* OVERVIEW TAB                                */}
          {/* ════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6">
            {/* Service Profile */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Service Profile</CardTitle>
                <CardDescription>Your service details drive all calculators. Edit here to update everything.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-start">
                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Current Rank</Label>
                    <Select value={currentRank.label}
                      onValueChange={(v) =>
                        {updateProfile({ rank: v });
                        const paygrade = PAYGRADES.find(p => p.label === v)
                        if (paygrade?.typicalYOS !== undefined && paygrade.typicalYOS > retirementYears) {
                          const yos = paygrade.typicalYOS
                          setRetirementYears(yos % 2 === 0 ? yos : yos + 1)
                        }}
                      }
                    >
                      <SelectTrigger className="w-full dark:border-slate-500 cursor-pointer"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem disabled value="__enlisted">── Enlisted ──</SelectItem>
                        {ENLISTED_RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        <SelectItem disabled value="__warrant">── Warrant ──</SelectItem>
                        {WARRANT_RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        <SelectItem disabled value="__officer">── Officer ──</SelectItem>
                        {OFFICER_RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Years of Service</Label>
                    <Select value={String(yos)} onValueChange={(v) => {updateProfile({ yearsOfService: parseInt(v) }); if (parseInt(v) > retirementYears) {setRetirementYears((parseInt(v) % 2 === 0) ? parseInt(v) : parseInt(v) + 1)}}}>
                      <SelectTrigger className="w-full dark:border-slate-500 cursor-pointer"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {YOS_OPTIONS.map((y) => <SelectItem key={y} value={String(y)}>{y} {y === 1 ? "year" : "years"}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Branch</Label>
                    <Select value={profile.branch} onValueChange={(v) => updateProfile({ branch: v })}>
                      <SelectTrigger className="w-full dark:border-slate-500 cursor-pointer"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Duty Station ZIP</Label>
                    <div className="flex gap-1">
                      <Input
                        value={zipInput}
                        className="w-full dark:border-slate-500 cursor-pointer"
                        onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        placeholder="e.g., 28307"
                        maxLength={5}
                        onKeyDown={(e) => e.key === "Enter" && handleZipLookup()}
                      />
                      <Button variant="outline" className="cursor-pointer" size="icon" onClick={handleZipLookup} disabled={zipInput.length < 5}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {profile.mha && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" /> {profile.mha}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 items-start border-t border-border dark:border-slate-500">
                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Next Rank</Label>
                    <Select value={promotion.nextRank || nextRank || ""} onValueChange={(e) => updatePromotion({ nextRank: e })}>
                      <SelectTrigger className="w-full dark:border-slate-500 cursor-pointer"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem disabled value="__enlisted">── Enlisted ──</SelectItem>
                        {ENLISTED_RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        <SelectItem disabled value="__warrant">── Warrant ──</SelectItem>
                        {WARRANT_RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        <SelectItem disabled value="__officer">── Officer ──</SelectItem>
                        {OFFICER_RANKS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
              
                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Dependents</Label>
                    <Switch
                      id="dependents"
                      className="dark:border-slate-500 cursor-pointer"
                      checked={profile.dependentStatus}
                      onCheckedChange={(checked) =>
                        updateProfile({ dependentStatus: checked })
                      }
                    />
                    <p className="text-xs font-bold">{profile.dependentStatus? "With Dependents" : "No Dependents"}</p>
                  </div>

                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Monthly Bonuses</Label>
                    <div className="w-full relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        value={monthlyBonus}
                        inputMode="numeric"
                        placeholder="0"
                        className="w-full pl-7 dark:border-slate-500 cursor-pointer"
                        onChange={(e) => {setMonthlyBonus(e.target.value.replace(/[^\d]/g, ""))}}
                      />
                    </div>
                    <a href="https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/" target="_blank" rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline flex items-center gap-1">
                      DFAS Official Pay Tables <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="space-y-1.5 flex flex-col items-center justify-center">
                    <Label className="text-xs text-muted-foreground">Retirement System</Label>
                    <Select value={profile.retirementSystem} onValueChange={(v) => updateProfile({ retirementSystem: v as ServiceProfile["retirementSystem"] })}>
                      <SelectTrigger className="w-full dark:border-slate-500 cursor-pointer"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brs">BRS (2.0%/yr)</SelectItem>
                        <SelectItem value="high3">High-3 (2.5%/yr)</SelectItem>
                        <SelectItem value="redux">REDUX (2.0%/yr)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard
                label="Total Monthly"
                value={totalMonthlyComp > 0 ? fmt(totalMonthlyComp) : "—"}
                sub={bah > 0 ? `Incl. ${fmt(bah)} BAH` : "Base + BAS" + (bah === 0 && profile.zipCode ? " (no BAH data)" : "")}
              />
              <StatCard label="Monthly Base" value={basePay > 0 ? fmt(basePay) : "—"} sub={`${currentRank.label} at ${yos} YOS`} />
              <StatCard
                label="TSP Match/Year"
                value={fmt(tspMatchAnnual)}
                sub={tspMatchPct >= 5 ? "✓ Full 5% match" : `${tspMatchPct}% — need 5%`}
                accent={tspMatchPct >= 5}
                warn={tspMatchPct < 5 && retirementSystem === "brs"}
              />
              <StatCard
                label={`Pension (${retirementYears}yr)`}
                value={fmt(retirementProjection.monthlyPension)}
                sub={`${(retirementProjection.pensionMultiplier * 100).toFixed(0)}% of High-3`}
              />
              {nextRank && (
                <StatCard
                  label="Next Promotion"
                  value={nextRank}
                  sub={payRaise > 0 ? `+${fmt(payRaise)}/mo raise` : promoNote}
                />
              )}
              <StatCard label="GI Bill Value" value={fmtK(giBillTotalValue)} sub={`${giBill.monthsRemaining} months left`} />
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" /> Smart Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {alerts.map((alert, i) => <AlertBanner key={i} type={alert.type} text={alert.text} />)}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ════════════════════════════════════════════ */}
          {/* PAY TAB                                     */}
          {/* ════════════════════════════════════════════ */}
          <TabsContent value="pay" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-medium text-foreground">2026 Military Pay</h3>
              <div className="flex items-center gap-2">
                <Select value={payTableFilter} onValueChange={(v) => setPayTableFilter(v as typeof payTableFilter)}>
                  <SelectTrigger className="w-[140px] cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enlisted">Enlisted</SelectItem>
                    <SelectItem value="warrant">Warrant</SelectItem>
                    <SelectItem value="officer">Officer</SelectItem>
                  </SelectContent>
                </Select>
                <a href="https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline flex items-center gap-1">
                  DFAS Official Pay Tables <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* BAH Lookup */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" /> Housing Allowance (BAH) Lookup
                </CardTitle>
                <CardDescription>Enter your duty station ZIP to see exact BAH rates for all ranks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 items-end mb-4">
                  <div className="space-y-1.5 flex-1 max-w-[200px]">
                    <Label className="text-xs">ZIP Code</Label>
                    <Input
                      value={zipInput}
                      className="dark:border-slate-500 cursor-pointer"
                      onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="e.g., 92134"
                      maxLength={5}
                      onKeyDown={(e) => e.key === "Enter" && handleZipLookup()}
                    />
                  </div>
                  <Button onClick={handleZipLookup} className="cursor-pointer" disabled={zipInput.length < 5}>
                    <Search className="h-4 w-4 mr-2" /> Look Up BAH
                  </Button>
                  <div className="flex items-center gap-2 ml-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm text-muted-foreground">Dependents</Label>
                    <Switch
                      className="cursor-pointer dark:border-slate-500"
                      checked={hasDependents}
                      onCheckedChange={(v) => updateProfile({ dependentStatus: v })}
                    />
                  </div>
                </div>

                {bahRates.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {profile.mha || "Location found"} · Showing {hasDependents ? "with" : "without"} dependents rates
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="px-2 py-2 text-left text-muted-foreground font-semibold border-b border-border dark:border-slate-500">Rank</th>
                            <th className="px-2 py-2 text-right text-muted-foreground font-semibold border-b border-border dark:border-slate-500">Without Dep.</th>
                            <th className="px-2 py-2 text-right text-muted-foreground font-semibold border-b border-border dark:border-slate-500">With Dep.</th>
                            <th className="px-2 py-2 text-right text-muted-foreground font-semibold border-b border-border dark:border-slate-500">Difference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bahRates
                            .filter((r) => {
                              if (payTableFilter === "enlisted") return r.rank.startsWith("e")
                              if (payTableFilter === "warrant") return r.rank.startsWith("w")
                              if (payTableFilter === "officer") return r.rank.startsWith("o")
                              return true
                            }).map((r) => {
                              const rank = PAYGRADES.find(p => p.value === r.rank)?.label
                              const isYou = rank === currentRank.label
                              return (
                                <tr key={r.rank} className={isYou ? "bg-accent/5" : ""}>
                                  <td className={`px-2 py-1.5 font-bold border-b border-border/50 dark:border-slate-500/50 ${isYou ? "text-accent" : "text-foreground"}`}>{rank}</td>
                                  <td className={`px-2 py-1.5 text-right border-b border-border/50 dark:border-slate-500/50 tabular-nums ${isYou && !profile.dependentStatus ? "text-accent font-bold" : "text-muted-foreground"}`}>
                                    {fmt(r.without_dependents)}
                                  </td>
                                  <td className={`px-2 py-1.5 text-right border-b border-border/50 dark:border-slate-500/50 tabular-nums ${isYou && profile.dependentStatus ? "text-accent font-bold" : "text-muted-foreground"}`}>
                                    {fmt(r.with_dependents)}
                                  </td>
                                  <td className="px-2 py-1.5 text-right border-b border-border/50 dark:border-slate-500/50 tabular-nums text-muted-foreground">
                                    +{fmt(r.with_dependents - r.without_dependents)}
                                  </td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {bahRates.length === 0 && profile.zipCode && (
                  <p className="text-sm text-muted-foreground">No BAH data found for ZIP {profile.zipCode}. Try a different ZIP or check the <a href="https://www.defensetravel.dod.mil/site/bahCalc.cfm" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">official calculator</a>.</p>
                )}
              </CardContent>
            </Card>

            {/* Pay Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {payTableFilter === "enlisted" ? "Enlisted" : payTableFilter === "warrant" ? "Warrant Officer" : "Officer"} Base Pay
                </CardTitle>
                <CardDescription>Monthly base pay by rank and years of service · 2026 rates (3.8% raise)</CardDescription>
              </CardHeader>
              <CardContent>
                {payTableByFilter.ranks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="px-2 py-2 text-left text-muted-foreground font-semibold border-b border-border dark:border-slate-500 sticky left-0 bg-card z-10">Rank</th>
                          {payTableByFilter.yosKeys.map((y) => (
                            <th key={y} className="px-2 py-2 text-right text-muted-foreground font-semibold border-b border-border dark:border-slate-500">
                              {y === 0 ? "<2" : y}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payTableByFilter.ranks.map((r) => {
                          let lastVal = 0

                          return (
                            <tr key={r} className={r === currentRank.label ? "bg-accent/5" : ""}>
                              <td
                                className={`px-2 py-1.5 font-bold border-b border-border/50 dark:border-slate-500/50 
                                sticky left-0 bg-card z-10 whitespace-nowrap 
                                ${r === currentRank.label ? "text-accent bg-accent/5" : "text-foreground"}`}
                              >
                                {r}
                              </td>

                              {payTableByFilter.yosKeys.map((y) => {
                                const rawVal = payTableByFilter.data[r]?.[y]

                                if (rawVal != null && rawVal > 0) {
                                  lastVal = rawVal
                                }

                                const val = lastVal
                                const isActive = r === currentRank.label && y === yos

                                return (
                                  <td
                                    key={y}
                                    className={`px-2 py-1.5 text-right border-b border-border/50 dark:border-slate-500/50 tabular-nums ${
                                      isActive
                                        ? "text-accent font-extrabold bg-accent/10"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {val > 0 ? `$${val.toLocaleString()}` : "—"}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Pay table data not loaded. Check your Supabase <code>pay_table_2026</code> table.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compensation Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Your Compensation Breakdown</CardTitle>
                  <CardDescription>
                    {currentRank.label} · {yos} YOS · {hasDependents ? "With" : "Without"} dependents
                    {profile.mha && ` · ${profile.mha}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-0">
                  {(() => {
                    const items = [
                      { label: "Base Pay", val: basePay, color: "bg-accent" },
                      { label: `BAH${profile.mha ? ` (${profile.mha})` : bah > 0 ? "" : " (enter ZIP)"}`, val: bah, color: "bg-[var(--chart-5)]" },
                      { label: "BAS", val: bas, color: "bg-[var(--chart-4)]" },
                      { label: "Monthly Bonuses", val: Number(monthlyBonus), color: "bg-[var(--chart-2)]" },
                    ]
                    const total = items.reduce((s, i) => s + i.val, 0)
                    return (
                      <>
                        {items.map((it) => (
                          <div key={it.label} className="flex justify-between items-center py-2.5 border-b border-border dark:border-slate-500">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${it.color}`} />
                              <span className="text-sm text-muted-foreground">{it.label}</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">{it.val > 0 ? fmt(it.val) : "—"}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-3">
                          <span className="font-bold text-foreground">Monthly Total</span>
                          <span className="text-xl font-extrabold text-accent">{total > 0 ? fmt(total) : "—"}/mo</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-sm text-muted-foreground">Annual Total</span>
                          <span className="text-sm font-bold text-foreground">{total > 0 ? fmt(total * 12) : "—"}/yr</span>
                        </div>
                        {bah === 0 && (
                          <p className="text-xs text-muted-foreground mt-3">
                            Enter your duty station ZIP above to include BAH ·{" "}
                            <a href="https://www.defensetravel.dod.mil/site/bahCalc.cfm" target="_blank" rel="noopener noreferrer"
                              className="text-accent hover:underline">BAH Calculator ↗</a>
                          </p>
                        )}
                      </>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Pay Progression */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Pay Progression · {currentRank.label}</CardTitle>
                  <CardDescription>Monthly base pay over career at current rank</CardDescription>
                </CardHeader>
                <CardContent>
                  {payTableByFilter.data[currentRank.label] ? (
                    <div className="h-48">
                      <svg viewBox="0 0 500 180" className="w-full h-full">
                        {(() => {
                          const data = payTableByFilter.yosKeys
                            .map((y) => ({ y, p: payTableByFilter.data[currentRank.label]?.[y] ?? 0 }))
                            .filter((d) => d.p > 0)
                          if (data.length === 0) return null
                          const mx = Math.max(...data.map((d) => d.p))
                          return data.map((d, i) => {
                            const x = (i / Math.max(data.length - 1, 1)) * 460 + 20
                            const h = (d.p / mx) * 140
                            const isCur = d.y <= yos && (i === data.length - 1 || (data[i + 1]?.y ?? 99) > yos)
                            return (
                              <g key={d.y}>
                                <rect x={x - 14} y={170 - h} width={28} height={h} rx={4}
                                  fill={isCur ? "var(--accent)" : "var(--muted-foreground)"} />
                                <text x={x} y={164 - h} textAnchor="middle"
                                  fill={isCur ? "var(--accent)" : "var(--muted-foreground)"}
                                  fontSize="9" fontWeight={isCur ? 700 : 400}>
                                  {`$${(d.p / 1000).toFixed(1)}K`}
                                </text>
                                <text x={x} y={180} textAnchor="middle" fill="var(--muted-foreground)" fontSize="8">
                                  {d.y}yr
                                </text>
                              </g>
                            )
                          })
                        })()}
                      </svg>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No pay data available for {currentRank.label}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════ */}
          {/* TSP TAB                                     */}
          {/* ════════════════════════════════════════════ */}
          <TabsContent value="tsp" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Thrift Savings Plan (TSP)</h3>
              <a href="https://www.tsp.gov/" target="_blank" rel="noopener noreferrer"
                className="text-sm text-accent hover:underline flex items-center gap-1">
                TSP.gov <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contributions</CardTitle>
                  <CardDescription>2026 limit: $24,500 · Catch-up (50+): $8,000</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Contribution Rate</Label>
                        <span className="text-lg font-bold text-accent">
                          {tsp.contributionPercentage}%
                        </span>
                      </div>

                      <Slider
                        value={[tsp.contributionPercentage]}
                        className="dark:[&_[data-slot=slider-track]]:bg-slate-700"
                        onValueChange={([v]) => {
                          const newTrad = Math.min(tsp.traditionalPercentage, v)
                          updateTSP({
                            contributionPercentage: v,
                            traditionalPercentage: newTrad,
                            rothPercentage: v - newTrad,
                          })
                        }}
                        max={60}
                        step={1}
                      />

                      <p className="text-xs text-muted-foreground">
                        {basePay > 0
                          ? `${fmt(tspMonthlyContrib)}/mo · ${fmt(tspAnnualContrib)}/yr`
                          : "Set rank to calculate"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Traditional vs Roth</Label>
                        <span className="text-sm text-muted-foreground">
                          Split your {tsp.contributionPercentage}%
                        </span>
                      </div>

                      <Slider
                        value={[tsp.traditionalPercentage]}
                        max={tsp.contributionPercentage}
                        step={1}
                        className="dark:[&_[data-slot=slider-track]]:bg-slate-700"
                        onValueChange={([v]) =>
                          updateTSP({
                            traditionalPercentage: v,
                            rothPercentage: tsp.contributionPercentage - v,
                          })
                        }
                      />

                      <div className="flex justify-between text-sm">
                        <span className="text-accent font-medium">
                          Traditional: {tsp.traditionalPercentage}%
                        </span>
                        <span className="text-[var(--chart-4)] font-medium">
                          Roth: {tsp.rothPercentage}%
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        {basePay > 0 ? (
                          <>
                            <span>
                              {fmt(
                                (tspMonthlyContrib * tsp.traditionalPercentage) /
                                  tsp.contributionPercentage || 0
                              )}/mo
                            </span>
                            <span>
                              {fmt(
                                (tspMonthlyContrib * tsp.rothPercentage) /
                                  tsp.contributionPercentage || 0
                              )}/mo
                            </span>
                          </>
                        ) : (
                          <span>Set rank to calculate</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {retirementSystem === "brs" && (
                    <div className="p-3 rounded-lg bg-primary/20">
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Government Match (BRS)</div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Auto 1% + up to 4% match</span>
                        <span className={`font-bold ${tspMatchPct >= 5 ? "text-[var(--chart-4)]" : "text-destructive"}`}>{tspMatchPct}%</span>
                      </div>
                      <p className="text-sm font-bold text-accent mt-1">Free money: {fmt(tspMatchAnnual)}/year</p>
                    </div>
                  )}

                  {retirementSystem !== "brs" && (
                    <div className="p-3 rounded-lg bg-primary/20">
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">No Government Match</div>
                      <p className="text-sm text-muted-foreground">High-3 / REDUX systems don't include TSP matching. All contributions are yours.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Current Balance</Label>
                    <Input value={tsp.currentBalance} className="dark:border-slate-500 cursor-pointer" onChange={(e) => updateTSP({ currentBalance: e.target.value })} placeholder="$0.00" />
                  </div>
                </CardContent>
              </Card>

              {/* Fund Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Fund Allocation</span>
                  </CardTitle>
                  <CardDescription>Investment distribution across TSP funds</CardDescription>
                  <p className="text-xs text-muted-foreground">
                    Adjust one fund and the others rebalance automatically
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(Object.keys(tsp.allocationFunds) as Array<keyof TSPInfo["allocationFunds"]>).map((fund) => {
                    const info = TSP_FUND_DATA[fund as keyof typeof TSP_FUND_DATA]
                    if (!info) return null
                    return (
                      <div key={fund} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">
                            {fund} Fund <span className="text-muted-foreground font-normal">({info.name})</span>
                          </span>
                          <span className="font-bold">{tsp.allocationFunds[fund]}%</span>
                        </div>
                        <Slider
                          value={[tsp.allocationFunds[fund]]}
                          className="dark:[&_[data-slot=slider-track]]:bg-slate-700"
                          onValueChange={([v]) => updateTSP({ allocationFunds: rebalanceAllocations( tsp.allocationFunds, fund, v)})}
                          max={100} step={5}
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Risk: {"●".repeat(info.risk)}{"○".repeat(4 - info.risk)}</span>
                          <span>Avg return: {info.avgReturn}%</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="p-3 rounded-lg bg-primary/20 text-sm text-muted-foreground">
                    Weighted avg return: <span className="font-bold text-accent">{weightedReturn.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TSP Projection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Growth Projection</CardTitle>
                <CardDescription>{weightedReturn.toFixed(1)}% avg return · {tsp.contributionPercentage}% contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <StatCard label={yrsToRetirement > 0 ? `At ${yrsToRetirement}yr (20 YOS)` : "Current"} value={fmtK(tspAtRetirement)} />
                  <StatCard label="Monthly (4% rule)" value={fmt(tspAtRetirement * 0.04 / 12)} sub="Safe withdrawal" />
                  <StatCard label="At 30 Years" value={fmtK(tspProjection[Math.min(30, tspProjection.length - 1)]?.balance ?? 0)} accent />
                </div>
                <div className="h-44">
                  <svg viewBox="0 0 600 160" className="w-full h-full">
                    {(() => {
                      const pts = tspProjection.filter((_, i) => i % 2 === 0 || i === tspProjection.length - 1)
                      const mx = Math.max(...pts.map((p) => p.balance), 1)
                      const path = pts.map((p, i) => {
                        const x = (i / (pts.length - 1)) * 560 + 20
                        const y = 148 - (p.balance / mx) * 128
                        return `${i === 0 ? "M" : "L"}${x},${y}`
                      }).join(" ")
                      return (
                        <>
                          <defs>
                            <linearGradient id="tspGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d={`${path} L580,150 L20,150 Z`} fill="url(#tspGrad)" />
                          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
                          {pts.filter((_, i) => i % 3 === 0 || i === pts.length - 1).map((p, idx) => {
                            const i = pts.indexOf(p)
                            const x = (i / (pts.length - 1)) * 560 + 20
                            const y = 148 - (p.balance / mx) * 128
                            return (
                              <g key={idx}>
                                <circle cx={x} cy={y} r={3} fill="var(--accent)" />
                                <text x={x} y={y - 8} textAnchor="middle" fill="var(--muted-foreground)" fontSize="8">{fmtK(p.balance)}</text>
                                <text x={x} y={158} textAnchor="middle" fill="var(--muted-foreground)" fontSize="7">Yr {p.year}</text>
                              </g>
                            )
                          })}
                        </>
                      )
                    })()}
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">TSP Notes</CardTitle></CardHeader>
              <CardContent>
                <Textarea className="border border-border dark:border-slate-500" value={tsp.notes} onChange={(e) => updateTSP({ notes: e.target.value })} placeholder="TSP strategy, goals, reminders…" rows={3} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════ */}
          {/* RETIREMENT TAB                              */}
          {/* ════════════════════════════════════════════ */}
          <TabsContent value="retirement" className="space-y-6">
            <h3 className="text-lg font-medium text-foreground">Retirement Calculator</h3>

            {/* Calculator Inputs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" /> Career Progression Model
                </CardTitle>
                <CardDescription>
                  Accounts for promotions over your career to calculate accurate High-3 pension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Retirement at (YOS)</Label>
                    <Select value={String(retirementYears)} onValueChange={(v) => setRetirementYears(parseInt(v))}>
                      <SelectTrigger className="cursor-pointer dark:border-slate-500"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[20, 22, 24, 25, 26, 28, 30, 32, 34, 36, 38, 40]
                        .filter((y) => y >= yos)
                        .map((y) => <SelectItem key={y} value={String(y)}>{y} years</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Promotion Pace</Label>
                    <Select value={retirementProgression} onValueChange={setRetirementProgression}>
                      <SelectTrigger className="cursor-pointer dark:border-slate-500" ><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="typical">Typical Timeline</SelectItem>
                        <SelectItem value="fast">Fast Track</SelectItem>
                        <SelectItem value="custom">Stay Current Rank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Assumed Annual Raise</Label>
                    <Select value={String(retirementAnnualRaise)} onValueChange={(v) => setRetirementAnnualRaise(parseFloat(v))}>
                      <SelectTrigger className="cursor-pointer dark:border-slate-500"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((r) => (
                          <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">System</Label>
                    <Select value={retirementSystem} onValueChange={(v) => updateProfile({ retirementSystem: v as ServiceProfile["retirementSystem"] })}>
                      <SelectTrigger className="cursor-pointer dark:border-slate-500"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brs">BRS ({2.0}%/yr)</SelectItem>
                        <SelectItem value="high3">High-3 ({2.5}%/yr)</SelectItem>
                        <SelectItem value="redux">REDUX ({2.0}%/yr)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pension Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Pension Estimate · {retirementSystem.toUpperCase()} · {retirementYears} Years
                </CardTitle>
                <CardDescription>
                  Based on career progression from {currentRank.label} to {retirementProjection.finalRank} ·{" "}
                  High-3 average: {fmt(retirementProjection.high3Average)}/mo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <StatCard label="Monthly Pension" value={fmt(retirementProjection.monthlyPension)} accent />
                  <StatCard label="Annual Pension" value={fmt(retirementProjection.annualPension)} />
                  <StatCard label="Multiplier" value={`${(retirementProjection.pensionMultiplier * 100).toFixed(0)}%`} sub={`${retirementYears} × ${multiplier}%`} />
                  <StatCard
                    label="Pension + TSP (4%)"
                    value={fmt(retirementProjection.monthlyPension + (tspAtRetirement * 0.04 / 12))}
                    sub="Combined monthly"
                    accent
                  />
                </div>

                {/* Career progression table */}
                {retirementProgression !== "custom" && retirementProjection.years.length > 1 && (
                  <div className="overflow-x-auto mt-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Projected Career Progression</h4>
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {["YOS", "Rank", "Base Pay (2026$)", "Adjusted*", "Annual"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold border-b border-border dark:border-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {retirementProjection.years
                          .filter((y, i) => i === 0 || y.rank !== retirementProjection.years[i - 1]?.rank || i === retirementProjection.years.length - 1)
                          .map((y) => {
                            const isCurrent = y.yos === yos
                            return (
                              <tr key={y.yos} className={isCurrent ? "bg-accent/5" : ""}>
                                <td className={`px-3 py-2 border-b border-border/50 dark:border-slate-500/50 ${isCurrent ? "text-accent font-bold" : "text-foreground"}`}>{y.yos}</td>
                                <td className={`px-3 py-2 border-b border-border/50 dark:border-slate-500/50 font-bold ${isCurrent ? "text-accent" : "text-foreground"}`}>{y.rank}</td>
                                <td className="px-3 py-2 border-b border-border/50 dark:border-slate-500/50 text-muted-foreground tabular-nums">{y.basePay > 0 ? fmt(y.basePay) : "—"}</td>
                                <td className="px-3 py-2 border-b border-border/50 dark:border-slate-500/50 text-foreground font-medium tabular-nums">{y.adjustedPay > 0 ? fmt(y.adjustedPay) : "—"}</td>
                                <td className="px-3 py-2 border-b border-border/50 dark:border-slate-500/50 text-muted-foreground tabular-nums">{y.adjustedPay > 0 ? fmt(y.adjustedPay * 12) : "—"}</td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      * Adjusted for {retirementAnnualRaise}% annual pay raises. High-3 pension uses highest 36 months.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comparison at different retirement points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pension at Different Service Lengths</CardTitle>
                <CardDescription>
                  Assuming {retirementProgression === "custom" ? "current rank" : retirementProgression + " progression"} ·{" "}
                  {retirementAnnualRaise}% annual raises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {["Years", "Multiplier", "Monthly Pension", "Annual Pension", "+TSP (4%)*"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-muted-foreground font-semibold border-b border-border dark:border-slate-500 text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[20, 24, 26, 30].map((y) => {
                        const mult = y * multiplier / 100
                        const mo = retirementProjection.high3Average * mult
                        const isSelected = y === retirementYears
                        return (
                          <tr key={y} className={isSelected ? "bg-accent/5" : ""}>
                            <td className={`px-3 py-2.5 font-bold border-b border-border/50 dark:border-slate-500/50 ${isSelected ? "text-accent" : "text-foreground"}`}>{y} yrs</td>
                            <td className="px-3 py-2.5 text-muted-foreground border-b border-border/50 dark:border-slate-500/50">{(mult * 100).toFixed(0)}%</td>
                            <td className="px-3 py-2.5 font-bold text-foreground border-b border-border/50 dark:border-slate-500/50">{fmt(mo)}</td>
                            <td className="px-3 py-2.5 text-muted-foreground border-b border-border/50 dark:border-slate-500/50">{fmt(mo * 12)}</td>
                            <td className="px-3 py-2.5 text-[var(--chart-4)] font-medium border-b border-border/50 dark:border-slate-500/50">
                              {fmt(mo + (tspAtRetirement * 0.04) / 12)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * TSP column assumes 4% safe withdrawal rate on projected balance at 20 YOS. Pension uses High-3 average.
                  {retirementSystem === "redux" && " REDUX includes a one-time $30,000 continuation payment at 15 YOS and COLA reduction of 1% until age 62."}
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Timeline */}
              <Card>
                <CardHeader><CardTitle className="text-base">Retirement Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="pl-5 relative">
                    {[
                      { yr: 20, label: "Retirement Eligible", desc: `${(20 * multiplier).toFixed(0)}% pension` },
                      { yr: 24, label: "24 YOS", desc: `${(24 * multiplier).toFixed(0)}% pension` },
                      { yr: 26, label: "26 YOS", desc: `${(26 * multiplier).toFixed(0)}% pension` },
                      { yr: 30, label: "Maximum Pension", desc: `${Math.min(30 * multiplier, 75).toFixed(0)}% (capped 75%)` },
                    ].map((m, i, arr) => {
                      const done = yos >= m.yr
                      return (
                        <div key={i} className="flex gap-3 mb-6 relative">
                          <div className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border-2 border-accent ${done ? "bg-accent" : "bg-card"}`} />
                          {i < arr.length - 1 && <div className="absolute -left-[14px] top-4 w-0.5 h-7 bg-border  dark:bg-slate-500/50" />}
                          <div className="ml-2">
                            <div className={`text-sm font-bold ${done ? "text-accent" : "text-foreground"}`}>{m.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {m.desc} · {m.yr - yos > 0 ? `${m.yr - yos} years away` : "Achieved"}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* System Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Retirement Systems Comparison</CardTitle>
                  <CardDescription>
                    <a href="https://militarypay.defense.gov/calculators/BRS/" target="_blank" rel="noopener noreferrer"
                      className="text-accent hover:underline">BRS Comparison Tool ↗</a>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-left text-muted-foreground font-semibold border-b border-border dark:border-slate-500 text-xs" />
                        <th className="px-2 py-2 text-left text-muted-foreground font-semibold border-b border-border dark:border-slate-500 text-xs">High-3</th>
                        <th className="px-2 py-2 text-left text-muted-foreground font-semibold border-b border-border dark:border-slate-500 text-xs">BRS</th>
                        <th className="px-2 py-2 text-left text-muted-foreground font-semibold border-b border-border dark:border-slate-500 text-xs">REDUX</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Multiplier", "2.5%/yr", "2.0%/yr", "2.0%/yr"],
                        ["20yr Pension", "50%", "40%", "40%"],
                        ["TSP Match", "None", "Up to 5%", "None"],
                        ["Continuation Pay", "No", "Yes (8-12yr)", "$30K at 15yr"],
                        ["Vest < 20yr", "No", "Yes (TSP)", "No"],
                        ["COLA", "Full CPI", "Full CPI", "CPI minus 1%"],
                      ].map(([label, h3, brs, redux]) => (
                        <tr key={label}>
                          <td className="px-2 py-2 font-semibold text-foreground border-b border-border/50 dark:border-slate-500/50 text-xs">{label}</td>
                          <td className={`px-2 py-2 border-b border-border/50 dark:border-slate-500/50 text-xs ${retirementSystem === "high3" ? "text-accent font-bold" : "text-muted-foreground"}`}>{h3}</td>
                          <td className={`px-2 py-2 border-b border-border/50 dark:border-slate-500/50 text-xs ${retirementSystem === "brs" ? "text-accent font-bold" : "text-muted-foreground"}`}>{brs}</td>
                          <td className={`px-2 py-2 border-b border-border/50 dark:border-slate-500/50 text-xs ${retirementSystem === "redux" ? "text-accent font-bold" : "text-muted-foreground"}`}>{redux}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════ */}
          {/* GI BILL TAB                                 */}
          {/* ════════════════════════════════════════════ */}
          <TabsContent value="gibill" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">GI Bill Benefits</h3>
              <a href="https://www.va.gov/education/about-gi-bill-benefits/" target="_blank" rel="noopener noreferrer"
                className="text-sm text-accent hover:underline flex items-center gap-1">VA.gov <ExternalLink className="h-3 w-3" /></a>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Benefit Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>GI Bill Type</Label>
                    <Select value={giBill.type} onValueChange={(v) => updateGIBill({ type: v as GIBillInfo["type"] })}>
                      <SelectTrigger className="cursor-pointer dark:border-slate-500"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post911">Post-9/11 GI Bill</SelectItem>
                        <SelectItem value="montgomery">Montgomery GI Bill</SelectItem>
                        <SelectItem value="none">Not Enrolled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Months Remaining</Label>
                      <span className="text-lg font-bold text-accent">{giBill.monthsRemaining}</span>
                    </div>
                    <Slider
                      value={[36 - giBill.monthsRemaining]}
                      className="dark:[&_[data-slot=slider-track]]:bg-slate-700"
                      onValueChange={([v]) =>
                        updateGIBill({ monthsRemaining: 36 - v })
                      }
                      max={36}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">Maximum 36 months</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Entitlement Percentage</Label>
                      <span className="font-medium text-foreground">{giBill.percentageEntitlement}%</span>
                    </div>
                    <Slider value={[giBill.percentageEntitlement]}
                      className="dark:[&_[data-slot=slider-track]]:bg-slate-700"
                      onValueChange={([v]) => updateGIBill({ percentageEntitlement: v })}
                      max={100} step={10}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Total Value (Est)" value={fmtK(giBillTotalValue)} />
                  <StatCard label="Monthly Housing" value={fmt(giBillMonthlyHousing)} />
                </div>
                <StatCard label="Annual Tuition Cap" value={fmt(giBillTuitionCap)} sub="2026 academic year" />

                <Card>
                  <CardHeader><CardTitle className="text-base">Transfer to Dependents</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Transferred to Dependent</Label>
                        <p className="text-sm text-muted-foreground">Have you transferred benefits?</p>
                      </div>
                      <Switch
                        className="dark:border-slate-500 cursor-pointer"
                        checked={giBill.transferredToDependent}
                        onCheckedChange={(v) => updateGIBill({ transferredToDependent: v })}
                      />
                    </div>
                    {giBill.transferredToDependent && (
                      <div className="space-y-2">
                        <Label>Dependent Name</Label>
                        <Input className="dark:border-slate-500 cursor-pointer" value={giBill.dependentName} onChange={(e) => updateGIBill({ dependentName: e.target.value })} placeholder="Name of dependent" />
                      </div>
                    )}
                    <div className="p-3 rounded-lg bg-primary/20">
                      <h4 className="text-xs font-semibold text-foreground mb-2">Transfer Eligibility</h4>
                      <div className="space-y-1.5">
                        {[
                          { req: "At least 6 years of service", met: yos >= 6 },
                          { req: "Agree to serve 4 additional years", met: false },
                          { req: "Dependents registered in DEERS", met: hasDependents },
                          { req: "Must transfer while serving", met: true },
                        ].map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className={r.met ? "text-[var(--chart-4)]" : "text-muted-foreground"}>{r.met ? "✓" : "○"}</span>
                            <span className="text-muted-foreground">{r.req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Education Benefits Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Education Benefits Overview</CardTitle>
                <CardDescription>Additional programs beyond GI Bill</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { title: "Tuition Assistance", value: "$4,500/yr", desc: "$250/credit hour cap · while serving", color: "var(--chart-4)" },
                    { title: "CLEP / DSST Exams", value: "FREE", desc: "Earn college credits via testing", color: "var(--chart-5)" },
                    { title: "COOL Credentialing", value: "Funded", desc: "Civilian certifications while serving", color: "var(--chart-2)" },
                    { title: "Yellow Ribbon", value: "Varies", desc: "Extra tuition for private schools with Post-9/11", color: "var(--chart-7)" },
                  ].map((item) => (
                    <div key={item.title} className="p-3 rounded-lg bg-primary/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-foreground">{item.title}</span>
                        <span className="text-sm font-extrabold" style={{ color: item.color }}>{item.value}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">GI Bill Notes</CardTitle></CardHeader>
              <CardContent>
                <Textarea className="dark:border-slate-500" value={giBill.notes} onChange={(e) => updateGIBill({ notes: e.target.value })} placeholder="Schools, programs, transfer plans…" rows={3} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════ */}
          {/* BENEFITS TAB                                */}
          {/* ════════════════════════════════════════════ */}
          <TabsContent value="benefits" className="space-y-6">
            {/* Benefits List */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">Military Benefits</h3>
              <Dialog open={isBenefitDialogOpen} onOpenChange={setIsBenefitDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" /> Add Benefit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Benefit</DialogTitle>
                    <DialogDescription>Track a military benefit or entitlement.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Benefit Name</Label>
                      <Input value={newBenefit.name} className="cursor-pointer dark:border-slate-500" onChange={(e) => setNewBenefit({ ...newBenefit, name: e.target.value })} placeholder="e.g., Hazardous Duty Pay" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newBenefit.category} onValueChange={(v) => setNewBenefit({ ...newBenefit, category: v as BenefitCategory })}>
                          <SelectTrigger className="cursor-pointer dark:border-slate-500"><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(categoryConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={newBenefit.status} onValueChange={(v) => setNewBenefit({ ...newBenefit, status: v as BenefitStatus })}>
                          <SelectTrigger className="cursor-pointer dark:border-slate-500"><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(statusConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Value / Amount</Label>
                      <Input value={newBenefit.value} className="cursor-pointer dark:border-slate-500" onChange={(e) => setNewBenefit({ ...newBenefit, value: e.target.value })} placeholder="e.g., $400,000 or $500/month" />
                    </div>
                    <div className="space-y-2">
                      <Label>Website URL</Label>
                      <Input value={newBenefit.url} className="cursor-pointer dark:border-slate-500" onChange={(e) => setNewBenefit({ ...newBenefit, url: e.target.value })} placeholder="https://…" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className="cursor-pointer" onClick={() => setIsBenefitDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddBenefit} disabled={!newBenefit.name} className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer">Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit) => {
                const cat = categoryConfig[benefit.category]
                const status = statusConfig[benefit.status]
                const isExpanded = expandedBenefit === benefit.id
                return (
                  <Card key={benefit.id}>
                    <CardContent>
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedBenefit(isExpanded ? null : benefit.id)}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${cat.color}`}>{cat.icon}</div>
                          <div>
                            <h4 className="font-medium text-foreground">{benefit.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{cat.label}</span>
                              {benefit.value && <><span>·</span><span className="font-medium text-foreground">{benefit.value}</span></>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={status.className}>{status.label}</Badge>
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select value={benefit.status} onValueChange={(v) => updateBenefit(benefit.id, { status: v as BenefitStatus })}>
                                <SelectTrigger className="cursor-pointer dark:border-slate-500"><SelectValue /></SelectTrigger>
                                <SelectContent>{Object.entries(statusConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Value / Amount</Label>
                              <Input value={benefit.value} className="cursor-pointer dark:border-slate-500" onChange={(e) => updateBenefit(benefit.id, { value: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={benefit.notes} className="cursor-pointer dark:border-slate-500" onChange={(e) => updateBenefit(benefit.id, { notes: e.target.value })} />
                          </div>
                          <div className="flex items-center justify-between">
                            {benefit.url && (
                              <a href={benefit.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1">
                                Learn More <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            <Button variant="ghost" className="cursor-pointer text-destructive hover:bg-destructive dark:hover:bg-destructive hover:text-white" size="sm" onClick={() => deleteBenefit(benefit.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Milestones */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">Career Milestones</h3>
              <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" /> Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Career Milestone</DialogTitle>
                    <DialogDescription>Track important career achievements and goals.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={newMilestone.title} className="cursor-pointer dark:border-slate-500" onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })} placeholder="e.g., Completed PME, Made E-6" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={newMilestone.date} className="cursor-pointer dark:border-slate-500" onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newMilestone.description} className="cursor-pointer dark:border-slate-500" onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={newMilestone.achieved} className="cursor-pointer dark:border-slate-500" onCheckedChange={(v) => setNewMilestone({ ...newMilestone, achieved: v })} />
                      <Label>Already Achieved</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className="cursor-pointer" onClick={() => setIsMilestoneDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMilestone} disabled={!newMilestone.title || !newMilestone.date} className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer">Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {milestones.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Milestones Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Track your career achievements, promotions, and goals.</p>
                  <Button onClick={() => setIsMilestoneDialogOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" /> Add Milestone
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {milestones
                  .sort((a, b) => {
                    if (!a.date && !b.date) return 0
                    if (!a.date) return 1
                    if (!b.date) return -1
                    return new Date(b.date).getTime() - new Date(a.date).getTime()
                  })
                  .map((ms) => (
                    <Card key={ms.id} className={ms.achieved ? "" : "border-dashed"}>
                      <CardContent>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${ms.achieved ? "bg-[var(--chart-4)]/10" : "bg-primary/20"}`}>
                              {ms.achieved ? <Award className="h-5 w-5 text-[var(--chart-4)]" /> : <Target className="h-5 w-5 text-muted-foreground" />}
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{ms.title}</h4>
                              {ms.date && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" /> {new Date(ms.date).toLocaleDateString()}
                                </p>
                              )}
                              {ms.description && <p className="text-sm text-muted-foreground mt-2">{ms.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => updateMilestone(ms.id, { achieved: !ms.achieved })}>
                              {ms.achieved ? "Undo" : "Complete"}
                            </Button>
                            <Button variant="ghost" className="cursor-pointer hover:bg-destructive dark:hover:bg-destructive" size="icon" onClick={() => deleteMilestone(ms.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* ════════════════════════════════════════════ */}
          {/* RESOURCES TAB                               */}
          {/* ════════════════════════════════════════════ */}
          <TabsContent value="resources" className="space-y-6 pb-6">
            <h3 className="text-lg font-medium text-foreground">External Resources & Tools</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RESOURCES.map((cat) => (
                <Card key={cat.category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-accent">{cat.icon}</span>
                      {cat.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cat.links.map((link) => (
                      <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-primary/20 hover:border-accent border border-transparent transition-colors group">
                        <div>
                          <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{link.name}</div>
                          {link.description && <div className="text-xs text-muted-foreground mt-0.5">{link.description}</div>}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                These calculators are designed only to be a planning tool for service members.
                All values reflect {new Date().getFullYear()} pay tables and do not account for every possible situation. Results may be inaccurate.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function StatCard({ label, value, sub, accent, warn }: { label: string; value: string; sub?: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="bg-primary/20 rounded-lg p-3.5">
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className={`text-lg font-extrabold ${warn ? "text-destructive" : accent ? "text-[var(--chart-4)]" : "text-accent"}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  )
}

function AlertBanner({ type, text }: { type: "warn" | "ok" | "info"; text: string }) {
  const config = {
    warn: { bg: "bg-amber-50 border dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-700/40", icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-800 dark:text-amber-300 flex-shrink-0 mt-0.5" /> },
    ok: { bg: "bg-green-50 border dark:bg-green-900/20", border: "border-green-200 dark:border-green-700/40", icon: <CheckCircle className="h-3.5 w-3.5 text-green-800 dark:text-green-300 flex-shrink-0 mt-0.5" /> },
    info: { bg: "bg-blue-50 border dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-700/40", icon: <Info className="h-3.5 w-3.5 text-blue-800 dark:text-blue-300 flex-shrink-0 mt-0.5" /> },
  }[type]

  return (
    <div className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border-l-[3px] ${config.bg} ${config.border}`}>
      {config.icon}
      <span className="text-xs text-foreground leading-relaxed">{text}</span>
    </div>
  )
}