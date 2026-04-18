"use client"

import { useState, useMemo } from "react"
import { SectionLayout } from "@/components/section-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign,
  Calculator,
  PiggyBank,
  TrendingUp,
  Shield,
  Info,
  CheckCircle2,
  Clock,
  Percent,
  Wallet,
  CreditCard,
  AlertTriangle
} from "lucide-react"
import { MILITARY_BRANCHES, RANKS, type MilitaryBranch, type PayGrade } from "@/lib/types"

// 2024 Base Pay (monthly, simplified)
const BASE_PAY: Record<string, Record<number, number>> = {
  "E-1": { 2: 2000, 4: 2000, 6: 2000, 8: 2000, 10: 2000 },
  "E-2": { 2: 2260, 4: 2260, 6: 2260, 8: 2260, 10: 2260 },
  "E-3": { 2: 2380, 4: 2500, 6: 2500, 8: 2500, 10: 2500 },
  "E-4": { 2: 2634, 4: 2770, 6: 2900, 8: 2900, 10: 2900 },
  "E-5": { 2: 2872, 4: 3070, 6: 3270, 8: 3430, 10: 3530 },
  "E-6": { 2: 3134, 4: 3450, 6: 3600, 8: 3850, 10: 4050 },
  "E-7": { 2: 3620, 4: 3950, 6: 4150, 8: 4400, 10: 4650 },
  "E-8": { 2: 5200, 4: 5400, 6: 5650, 8: 5900, 10: 6150 },
  "E-9": { 2: 6350, 4: 6550, 6: 6800, 8: 7100, 10: 7400 },
  "O-1": { 2: 3640, 4: 3800, 6: 4500, 8: 4500, 10: 4500 },
  "O-2": { 2: 4200, 4: 4780, 6: 5500, 8: 5700, 10: 5700 },
  "O-3": { 2: 4850, 4: 5500, 6: 5950, 8: 6400, 10: 6750 },
  "O-4": { 2: 5520, 4: 6400, 6: 6850, 8: 7150, 10: 7600 },
  "O-5": { 2: 6400, 4: 7200, 6: 7700, 8: 8000, 10: 8500 },
  "O-6": { 2: 7680, 4: 8440, 6: 8990, 8: 8990, 10: 9270 },
}

// Deployment-specific pay additions
const HOSTILE_FIRE_PAY = 225 // per month
const IMMINENT_DANGER_PAY = 225 // per month (usually combined with HFP, but sometimes separate)
const FAMILY_SEPARATION_ALLOWANCE = 250 // per month
const HARDSHIP_DUTY_PAY = { low: 50, medium: 100, high: 150 } // per month based on location

// SDP details
const SDP_INTEREST_RATE = 0.10 // 10% annually
const SDP_MAX_DEPOSIT = 10000
const SDP_COMPOUND_QUARTERLY = true

export default function DeploymentFinancesPage() {
  // Calculator state
  const [branch, setBranch] = useState<MilitaryBranch | "">("")
  const [payGrade, setPayGrade] = useState<PayGrade | "">("")
  const [yearsOfService, setYearsOfService] = useState<number>(4)
  const [hasDependents, setHasDependents] = useState(false)
  const [receiveHFP, setReceiveHFP] = useState(true)
  const [receiveIDP, setReceiveIDP] = useState(false)
  const [hardshipLevel, setHardshipLevel] = useState<string>("")
  const [deploymentMonths, setDeploymentMonths] = useState<number>(9)
  
  // SDP Calculator state
  const [sdpDeposit, setSdpDeposit] = useState<number>(10000)
  const [sdpMonths, setSdpMonths] = useState<number>(12)

  const availableRanks = useMemo(() => {
    if (!branch) return []
    return RANKS[branch] || []
  }, [branch])

  const getBasePay = (grade: string, years: number): number => {
    const payTable = BASE_PAY[grade]
    if (!payTable) return 0
    
    // Find closest years bracket
    const brackets = Object.keys(payTable).map(Number).sort((a, b) => a - b)
    let bracket = brackets[0]
    for (const b of brackets) {
      if (years >= b) bracket = b
    }
    return payTable[bracket]
  }

  const deploymentPay = useMemo(() => {
    if (!payGrade) return null

    const basePay = getBasePay(payGrade, yearsOfService)
    let additionalPay = 0
    const breakdown: { label: string; amount: number }[] = []

    // Base pay
    breakdown.push({ label: "Base Pay", amount: basePay })

    // Hostile Fire Pay
    if (receiveHFP) {
      additionalPay += HOSTILE_FIRE_PAY
      breakdown.push({ label: "Hostile Fire Pay", amount: HOSTILE_FIRE_PAY })
    }

    // Imminent Danger Pay (if separate from HFP)
    if (receiveIDP) {
      additionalPay += IMMINENT_DANGER_PAY
      breakdown.push({ label: "Imminent Danger Pay", amount: IMMINENT_DANGER_PAY })
    }

    // Family Separation Allowance
    if (hasDependents) {
      additionalPay += FAMILY_SEPARATION_ALLOWANCE
      breakdown.push({ label: "Family Separation Allowance", amount: FAMILY_SEPARATION_ALLOWANCE })
    }

    // Hardship Duty Pay
    if (hardshipLevel && hardshipLevel !== "none") {
      const hdp = HARDSHIP_DUTY_PAY[hardshipLevel as keyof typeof HARDSHIP_DUTY_PAY]
      additionalPay += hdp
      breakdown.push({ label: "Hardship Duty Pay", amount: hdp })
    }

    const totalMonthly = basePay + additionalPay
    const totalDeployment = totalMonthly * deploymentMonths

    // Combat Zone Tax Exclusion estimate (enlisted = all, officers capped)
    const isOfficer = payGrade.startsWith("O-")
    const taxExclusionMonthly = isOfficer ? Math.min(basePay, 9000) : totalMonthly
    const taxSavingsEstimate = taxExclusionMonthly * 0.22 * deploymentMonths // Assuming 22% marginal rate

    return {
      basePay,
      additionalPay,
      totalMonthly,
      totalDeployment,
      breakdown,
      taxSavingsEstimate,
      isOfficer
    }
  }, [payGrade, yearsOfService, receiveHFP, receiveIDP, hasDependents, hardshipLevel, deploymentMonths])

  const sdpCalculation = useMemo(() => {
    const principal = Math.min(sdpDeposit, SDP_MAX_DEPOSIT)
    const months = sdpMonths
    const rate = SDP_INTEREST_RATE
    
    // Quarterly compounding
    const quarters = Math.floor(months / 3)
    const quarterlyRate = rate / 4
    
    const finalBalance = principal * Math.pow(1 + quarterlyRate, quarters)
    const interestEarned = finalBalance - principal
    
    return {
      principal,
      finalBalance,
      interestEarned,
      effectiveRate: (interestEarned / principal) * 100,
      months
    }
  }, [sdpDeposit, sdpMonths])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <SectionLayout
      title="Financial Preparation"
      description="Calculate your deployment pay, understand tax benefits, and maximize the Savings Deposit Program"
      backLink="/deployment"
      backLabel="Deployment"
    >
      <Tabs defaultValue="pay-calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pay-calculator">Pay Calculator</TabsTrigger>
          <TabsTrigger value="sdp">SDP Calculator</TabsTrigger>
          <TabsTrigger value="checklist">Financial Checklist</TabsTrigger>
        </TabsList>

        {/* Pay Calculator Tab */}
        <TabsContent value="pay-calculator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-gold" />
                  Deployment Pay Calculator
                </CardTitle>
                <CardDescription>
                  Estimate your total pay during deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Branch of Service</Label>
                    <Select value={branch} onValueChange={(val) => {
                      setBranch(val as MilitaryBranch)
                      setPayGrade("")
                    }}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {MILITARY_BRANCHES.map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Grade</Label>
                    <Select value={payGrade} onValueChange={(val) => setPayGrade(val as PayGrade)} disabled={!branch}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRanks.map(rank => (
                          <SelectItem key={rank.payGrade} value={rank.payGrade}>
                            {rank.payGrade} - {rank.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Years of Service</Label>
                    <Input
                      type="number"
                      value={yearsOfService}
                      onChange={(e) => setYearsOfService(Number(e.target.value))}
                      min={0}
                      max={40}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deployment Length (months)</Label>
                    <Input
                      type="number"
                      value={deploymentMonths}
                      onChange={(e) => setDeploymentMonths(Number(e.target.value))}
                      min={1}
                      max={24}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-foreground">Special Pays</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hfp" 
                      checked={receiveHFP}
                      onCheckedChange={(checked) => setReceiveHFP(checked as boolean)}
                    />
                    <Label htmlFor="hfp" className="font-normal">
                      Hostile Fire Pay ($225/mo)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="idp" 
                      checked={receiveIDP}
                      onCheckedChange={(checked) => setReceiveIDP(checked as boolean)}
                    />
                    <Label htmlFor="idp" className="font-normal">
                      Imminent Danger Pay ($225/mo)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="fsa" 
                      checked={hasDependents}
                      onCheckedChange={(checked) => setHasDependents(checked as boolean)}
                    />
                    <Label htmlFor="fsa" className="font-normal">
                      Family Separation Allowance ($250/mo)
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hardship Duty Pay</Label>
                  <Select value={hardshipLevel} onValueChange={setHardshipLevel}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select level (location-based)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="low">Low ($50/mo)</SelectItem>
                      <SelectItem value="medium">Medium ($100/mo)</SelectItem>
                      <SelectItem value="high">High ($150/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {deploymentPay ? (
              <div className="space-y-6">
                <Card className="bg-card border-gold/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-gold">
                      <DollarSign className="h-5 w-5" />
                      Monthly Pay
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-foreground mb-1">
                      {formatCurrency(deploymentPay.totalMonthly)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      +{formatCurrency(deploymentPay.additionalPay)} in deployment special pays
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Pay Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {deploymentPay.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Monthly</span>
                      <span className="text-gold">{formatCurrency(deploymentPay.totalMonthly)}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total ({deploymentMonths} months)</span>
                      <span className="text-gold">{formatCurrency(deploymentPay.totalDeployment)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-green-500 text-lg">
                      <Shield className="h-5 w-5" />
                      Combat Zone Tax Exclusion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {deploymentPay.isOfficer 
                        ? "Officers: Base pay tax-free up to enlisted max rate"
                        : "Enlisted: All pay earned in combat zone is tax-free"
                      }
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-500">
                        ~{formatCurrency(deploymentPay.taxSavingsEstimate)}
                      </span>
                      <span className="text-sm text-muted-foreground">estimated tax savings</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-xl text-foreground mb-2">Select Your Info</h3>
                  <p className="text-muted-foreground">
                    Choose your branch and pay grade to calculate deployment pay
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* SDP Calculator Tab */}
        <TabsContent value="sdp" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-gold" />
                    Savings Deposit Program (SDP)
                  </CardTitle>
                  <CardDescription>
                    Calculate your earnings with the military&apos;s 10% interest savings program
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Deposit Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={sdpDeposit}
                        onChange={(e) => setSdpDeposit(Number(e.target.value))}
                        max={10000}
                        className="bg-secondary border-border pl-9"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum deposit: $10,000
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Deployment Length (months)</Label>
                    <Input
                      type="number"
                      value={sdpMonths}
                      onChange={(e) => setSdpMonths(Number(e.target.value))}
                      min={1}
                      max={24}
                      className="bg-secondary border-border"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/50 border-border">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">About SDP</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Available only during deployment to a combat zone</li>
                        <li>10% annual interest, compounded quarterly</li>
                        <li>Can deposit up to $10,000 total</li>
                        <li>Interest continues 90 days after leaving combat zone</li>
                        <li>Guaranteed by the U.S. government</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-gold/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gold">
                    <TrendingUp className="h-5 w-5" />
                    Your SDP Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Your Deposit</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(sdpCalculation.principal)}
                      </p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Interest Earned</p>
                      <p className="text-2xl font-bold text-green-500">
                        +{formatCurrency(sdpCalculation.interestEarned)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-gold/10 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Final Balance</p>
                    <p className="text-3xl font-bold text-gold">
                      {formatCurrency(sdpCalculation.finalBalance)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      After {sdpCalculation.months} months
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Percent className="h-4 w-4" />
                    <span>Effective return: {sdpCalculation.effectiveRate.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gold" />
                    How It Grows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After 3 months</span>
                      <span className="font-medium">
                        {formatCurrency(sdpCalculation.principal * Math.pow(1.025, 1))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After 6 months</span>
                      <span className="font-medium">
                        {formatCurrency(sdpCalculation.principal * Math.pow(1.025, 2))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After 9 months</span>
                      <span className="font-medium">
                        {formatCurrency(sdpCalculation.principal * Math.pow(1.025, 3))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After 12 months</span>
                      <span className="font-medium text-gold">
                        {formatCurrency(sdpCalculation.principal * Math.pow(1.025, 4))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Financial Checklist Tab */}
        <TabsContent value="checklist" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-gold" />
                  Before Deployment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Set up automatic bill payments",
                  "Create joint account access for spouse",
                  "Review and update SGLI beneficiaries",
                  "Set up allotments for savings and bills",
                  "Create a budget for deployment income",
                  "Brief spouse on all financial accounts",
                  "Share passwords securely (password manager)",
                  "Cancel unnecessary subscriptions",
                  "Pay down high-interest debt if possible",
                  "Max out TSP contributions (tax-free growth)"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gold" />
                  During Deployment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Enroll in Savings Deposit Program (SDP)",
                  "Monitor accounts regularly online",
                  "Continue TSP contributions (tax-free)",
                  "Track all receipts for tax purposes",
                  "Avoid large purchases or new debt",
                  "Review statements for fraud",
                  "Communicate with spouse about finances",
                  "Save deployment special pays",
                  "Consider increasing emergency fund",
                  "Plan for post-deployment purchases"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-destructive/10 border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Common Financial Mistakes to Avoid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Buying a new car or expensive items right before deployment",
                "Not setting up automatic payments (leads to late fees, credit damage)",
                "Forgetting to update SGLI or beneficiary information",
                "Not taking advantage of the Savings Deposit Program",
                "Leaving spouse without access to accounts",
                "Not maximizing TSP contributions during tax-free period",
                "Making major financial decisions without spouse input",
                "Falling for deployment scams targeting families"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SectionLayout>
  )
}
