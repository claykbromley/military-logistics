"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Briefcase,
  TrendingUp,
  GraduationCap,
  Shield,
  PiggyBank,
  Heart,
  Home,
  Plus,
  CheckCircle2,
  Circle,
  ExternalLink,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  useCareer,
  type Benefit,
  type BenefitCategory,
  type BenefitStatus,
  type CareerMilestone,
} from "@/hooks/use-career"

const categoryConfig: Record<BenefitCategory, { label: string; icon: React.ReactNode; color: string }> = {
  retirement: { label: "Retirement", icon: <PiggyBank className="h-4 w-4" />, color: "bg-emerald-100 text-emerald-800" },
  education: { label: "Education", icon: <GraduationCap className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" },
  insurance: { label: "Insurance", icon: <Shield className="h-4 w-4" />, color: "bg-amber-100 text-amber-800" },
  healthcare: { label: "Healthcare", icon: <Heart className="h-4 w-4" />, color: "bg-red-100 text-red-800" },
  housing: { label: "Housing", icon: <Home className="h-4 w-4" />, color: "bg-violet-100 text-violet-800" },
  other: { label: "Other", icon: <Briefcase className="h-4 w-4" />, color: "bg-gray-100 text-gray-800" },
}

const statusLabels: Record<BenefitStatus, string> = {
  active: "Active",
  pending: "Pending",
  expired: "Expired",
  not_enrolled: "Not Enrolled",
}

const tspFundInfo = {
  G: { name: "Government Securities", risk: "Low" },
  F: { name: "Fixed Income Index", risk: "Low-Medium" },
  C: { name: "Common Stock Index (S&P 500)", risk: "Medium" },
  S: { name: "Small Cap Stock Index", risk: "Medium-High" },
  I: { name: "International Stock Index", risk: "Medium-High" },
  L: { name: "Lifecycle Funds", risk: "Varies" },
}

export default function CareerBenefitsPage() {
  const {
    benefits,
    milestones,
    tsp,
    giBill,
    promotion,
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
  } = useCareer()

  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null)
  const [isBenefitDialogOpen, setIsBenefitDialogOpen] = useState(false)
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false)
  const [newRequirement, setNewRequirement] = useState("")

  const [newBenefit, setNewBenefit] = useState<Partial<Benefit>>({
    name: "",
    category: "other",
    status: "not_enrolled",
    value: "",
    notes: "",
    url: "",
  })

  const [newMilestone, setNewMilestone] = useState<Partial<CareerMilestone>>({
    title: "",
    date: "",
    description: "",
    achieved: false,
  })

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-12 w-12 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your career data...</p>
        </div>
      </div>
    )
  }

  const handleAddBenefit = () => {
    if (newBenefit.name) {
      addBenefit({
        name: newBenefit.name,
        category: newBenefit.category as BenefitCategory,
        status: newBenefit.status as BenefitStatus,
        enrollmentDate: null,
        expirationDate: null,
        value: newBenefit.value || "",
        notes: newBenefit.notes || "",
        url: newBenefit.url || "",
      })
      setNewBenefit({ name: "", category: "other", status: "not_enrolled", value: "", notes: "", url: "" })
      setIsBenefitDialogOpen(false)
    }
  }

  const handleAddMilestone = () => {
    if (newMilestone.title) {
      addMilestone({
        title: newMilestone.title,
        date: newMilestone.date || "",
        description: newMilestone.description || "",
        achieved: newMilestone.achieved || false,
      })
      setNewMilestone({ title: "", date: "", description: "", achieved: false })
      setIsMilestoneDialogOpen(false)
    }
  }

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      addPromotionRequirement(newRequirement.trim())
      setNewRequirement("")
    }
  }

  const promotionProgress =
    promotion.requirements.length > 0
      ? Math.round((promotion.requirements.filter((r) => r.completed).length / promotion.requirements.length) * 100)
      : 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Briefcase className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Career & Benefits Tracker</h1>
                <p className="text-sm text-muted-foreground">TSP, GI Bill, promotions, and military benefits</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tsp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="tsp">TSP</TabsTrigger>
            <TabsTrigger value="gibill">GI Bill</TabsTrigger>
            <TabsTrigger value="promotion">Promotion</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          {/* TSP Tab */}
          <TabsContent value="tsp" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Thrift Savings Plan (TSP)</h3>
              <a
                href="https://www.tsp.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                TSP.gov <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contribution Settings</CardTitle>
                  <CardDescription>Track your TSP contribution percentages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Total Contribution</Label>
                      <span className="text-lg font-semibold text-foreground">{tsp.contributionPercentage}%</span>
                    </div>
                    <Slider
                      value={[tsp.contributionPercentage]}
                      onValueChange={([value]) => updateTSP({ contributionPercentage: value })}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Traditional</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={tsp.traditionalPercentage}
                          onChange={(e) => updateTSP({ traditionalPercentage: Number(e.target.value) })}
                          className="w-20"
                          min={0}
                          max={100}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Roth</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={tsp.rothPercentage}
                          onChange={(e) => updateTSP({ rothPercentage: Number(e.target.value) })}
                          className="w-20"
                          min={0}
                          max={100}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Government Matching (BRS)</span>
                      <span className="font-medium">{tsp.matchingPercentage}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Balance (optional)</Label>
                    <Input
                      value={tsp.currentBalance}
                      onChange={(e) => updateTSP({ currentBalance: e.target.value })}
                      placeholder="$0.00"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fund Allocation</CardTitle>
                  <CardDescription>Track your investment distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(Object.keys(tsp.allocationFunds) as Array<keyof typeof tsp.allocationFunds>).map((fund) => (
                    <div key={fund} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {fund} Fund{" "}
                          <span className="text-muted-foreground font-normal">({tspFundInfo[fund].name})</span>
                        </span>
                        <span>{tsp.allocationFunds[fund]}%</span>
                      </div>
                      <Slider
                        value={[tsp.allocationFunds[fund]]}
                        onValueChange={([value]) =>
                          updateTSP({
                            allocationFunds: { ...tsp.allocationFunds, [fund]: value },
                          })
                        }
                        max={100}
                        step={5}
                      />
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Allocation</span>
                      <span
                        className={`font-medium ${
                          Object.values(tsp.allocationFunds).reduce((a, b) => a + b, 0) === 100
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {Object.values(tsp.allocationFunds).reduce((a, b) => a + b, 0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">TSP Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={tsp.notes}
                  onChange={(e) => updateTSP({ notes: e.target.value })}
                  placeholder="Notes about your TSP strategy, goals, or reminders..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* GI Bill Tab */}
          <TabsContent value="gibill" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">GI Bill Benefits</h3>
              <a
                href="https://www.va.gov/education/about-gi-bill-benefits/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                VA.gov <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Benefit Status</CardTitle>
                  <CardDescription>Track your education benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>GI Bill Type</Label>
                    <Select
                      value={giBill.type}
                      onValueChange={(value) => updateGIBill({ type: value as "post911" | "montgomery" | "none" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post911">Post-9/11 GI Bill</SelectItem>
                        <SelectItem value="montgomery">Montgomery GI Bill</SelectItem>
                        <SelectItem value="none">Not Enrolled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Months Remaining</Label>
                      <span className="text-lg font-semibold text-foreground">{giBill.monthsRemaining}</span>
                    </div>
                    <Slider
                      value={[giBill.monthsRemaining]}
                      onValueChange={([value]) => updateGIBill({ monthsRemaining: value })}
                      max={36}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">Maximum 36 months of benefits</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Entitlement Percentage</Label>
                      <span className="font-medium">{giBill.percentageEntitlement}%</span>
                    </div>
                    <Slider
                      value={[giBill.percentageEntitlement]}
                      onValueChange={([value]) => updateGIBill({ percentageEntitlement: value })}
                      max={100}
                      step={10}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Transfer to Dependents</CardTitle>
                  <CardDescription>Track benefit transfers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Transferred to Dependent</Label>
                      <p className="text-sm text-muted-foreground">Have you transferred benefits?</p>
                    </div>
                    <Switch
                      checked={giBill.transferredToDependent}
                      onCheckedChange={(checked) => updateGIBill({ transferredToDependent: checked })}
                    />
                  </div>

                  {giBill.transferredToDependent && (
                    <div className="space-y-2">
                      <Label>Dependent Name</Label>
                      <Input
                        value={giBill.dependentName}
                        onChange={(e) => updateGIBill({ dependentName: e.target.value })}
                        placeholder="Name of dependent"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-2">Transfer Eligibility Requirements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>- At least 6 years of service</li>
                      <li>- Agree to serve 4 additional years</li>
                      <li>- Dependents must be in DEERS</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">GI Bill Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={giBill.notes}
                  onChange={(e) => updateGIBill({ notes: e.target.value })}
                  placeholder="Notes about schools, programs, transfer plans..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotion Tab */}
          <TabsContent value="promotion" className="space-y-6">
            <h3 className="text-lg font-medium text-foreground">Promotion Tracking</h3>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rank Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Rank</Label>
                      <Input
                        value={promotion.currentRank}
                        onChange={(e) => updatePromotion({ currentRank: e.target.value })}
                        placeholder="e.g., E-5, O-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Next Rank</Label>
                      <Input
                        value={promotion.nextRank}
                        onChange={(e) => updatePromotion({ nextRank: e.target.value })}
                        placeholder="e.g., E-6, O-4"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Eligibility Date</Label>
                      <Input
                        type="date"
                        value={promotion.eligibilityDate || ""}
                        onChange={(e) => updatePromotion({ eligibilityDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Board Date</Label>
                      <Input
                        type="date"
                        value={promotion.boardDate || ""}
                        onChange={(e) => updatePromotion({ boardDate: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Promotion Requirements</span>
                    {promotion.requirements.length > 0 && (
                      <Badge className="bg-accent/10 text-accent">{promotionProgress}% Complete</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {promotion.requirements.length > 0 && <Progress value={promotionProgress} className="h-2 mb-4" />}

                  <div className="space-y-2">
                    {promotion.requirements.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <button
                          onClick={() => togglePromotionRequirement(req.id)}
                          className="flex items-center gap-2 text-sm"
                        >
                          {req.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={req.completed ? "line-through text-muted-foreground" : ""}>{req.name}</span>
                        </button>
                        <Button variant="ghost" size="icon" onClick={() => deletePromotionRequirement(req.id)}>
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add requirement..."
                      onKeyDown={(e) => e.key === "Enter" && handleAddRequirement()}
                    />
                    <Button onClick={handleAddRequirement} size="icon" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Promotion Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={promotion.notes}
                  onChange={(e) => updatePromotion({ notes: e.target.value })}
                  placeholder="Notes about promotion timeline, mentors, action items..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">Military Benefits</h3>
              <Dialog open={isBenefitDialogOpen} onOpenChange={setIsBenefitDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Benefit
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
                      <Input
                        value={newBenefit.name}
                        onChange={(e) => setNewBenefit({ ...newBenefit, name: e.target.value })}
                        placeholder="e.g., Hazardous Duty Pay"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={newBenefit.category}
                          onValueChange={(value) => setNewBenefit({ ...newBenefit, category: value as BenefitCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(categoryConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={newBenefit.status}
                          onValueChange={(value) => setNewBenefit({ ...newBenefit, status: value as BenefitStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Value/Amount</Label>
                      <Input
                        value={newBenefit.value}
                        onChange={(e) => setNewBenefit({ ...newBenefit, value: e.target.value })}
                        placeholder="e.g., $400,000 or $500/month"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website URL</Label>
                      <Input
                        value={newBenefit.url}
                        onChange={(e) => setNewBenefit({ ...newBenefit, url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBenefitDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddBenefit} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Add Benefit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit) => {
                const category = categoryConfig[benefit.category]
                const isExpanded = expandedBenefit === benefit.id

                return (
                  <Card key={benefit.id}>
                    <CardContent className="pt-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedBenefit(isExpanded ? null : benefit.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>{category.icon}</div>
                          <div>
                            <h4 className="font-medium text-foreground">{benefit.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{category.label}</span>
                              {benefit.value && (
                                <>
                                  <span>-</span>
                                  <span className="font-medium text-foreground">{benefit.value}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              benefit.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : benefit.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-muted text-muted-foreground"
                            }
                          >
                            {statusLabels[benefit.status]}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={benefit.status}
                                onValueChange={(value) => updateBenefit(benefit.id, { status: value as BenefitStatus })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Value/Amount</Label>
                              <Input
                                value={benefit.value}
                                onChange={(e) => updateBenefit(benefit.id, { value: e.target.value })}
                                placeholder="Coverage amount or monthly value"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={benefit.notes}
                              onChange={(e) => updateBenefit(benefit.id, { notes: e.target.value })}
                              placeholder="Additional notes..."
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            {benefit.url && (
                              <a
                                href={benefit.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-accent hover:underline flex items-center gap-1"
                              >
                                Learn More <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => deleteBenefit(benefit.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">Career Milestones</h3>
              <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Career Milestone</DialogTitle>
                    <DialogDescription>Track important career achievements and goals.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Milestone Title</Label>
                      <Input
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                        placeholder="e.g., Completed PME, Made E-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newMilestone.date}
                        onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                        placeholder="Details about this milestone..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newMilestone.achieved}
                        onCheckedChange={(checked) => setNewMilestone({ ...newMilestone, achieved: checked })}
                      />
                      <Label>Already Achieved</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsMilestoneDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddMilestone}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Add Milestone
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {milestones.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Milestones Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track your career achievements, promotions, and goals.
                  </p>
                  <Button
                    onClick={() => setIsMilestoneDialogOpen(true)}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
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
                  .map((milestone) => (
                    <Card key={milestone.id} className={milestone.achieved ? "" : "border-dashed"}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${milestone.achieved ? "bg-emerald-100" : "bg-muted"}`}
                            >
                              {milestone.achieved ? (
                                <Award className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <Target className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{milestone.title}</h4>
                              {milestone.date && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(milestone.date).toLocaleDateString()}
                                </p>
                              )}
                              {milestone.description && (
                                <p className="text-sm text-muted-foreground mt-2">{milestone.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateMilestone(milestone.id, { achieved: !milestone.achieved })}
                            >
                              {milestone.achieved ? "Undo" : "Complete"}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteMilestone(milestone.id)}>
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
        </Tabs>
      </main>
    </div>
  )
}
