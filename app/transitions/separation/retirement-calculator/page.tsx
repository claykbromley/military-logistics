"use client"

import { useState, useMemo } from "react"
import { SectionLayout } from "@/components/section-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator,
  DollarSign,
  TrendingUp,
  Calendar,
  Percent,
  Info,
  PiggyBank,
  Shield
} from "lucide-react"
import { MILITARY_BRANCHES, RANKS, type MilitaryBranch, type PayGrade } from "@/lib/types"

// 2024 Base Pay (monthly, simplified - high-3 calculation uses actual values)
const BASE_PAY: Record<string, Record<number, number>> = {
  "E-7": { 20: 5200, 22: 5350, 24: 5500, 26: 5650, 28: 5800, 30: 5950 },
  "E-8": { 20: 6000, 22: 6200, 24: 6400, 26: 6600, 28: 6800, 30: 7000 },
  "E-9": { 20: 7200, 22: 7450, 24: 7700, 26: 7950, 28: 8200, 30: 8450 },
  "O-3": { 20: 7500, 22: 7700, 24: 7900, 26: 8100, 28: 8300, 30: 8500 },
  "O-4": { 20: 8400, 22: 8650, 24: 8900, 26: 9150, 28: 9400, 30: 9650 },
  "O-5": { 20: 9200, 22: 9500, 24: 9800, 26: 10100, 28: 10400, 30: 10700 },
  "O-6": { 20: 10400, 22: 10750, 24: 11100, 26: 11450, 28: 11800, 30: 12150 },
}

// COLA adjustment estimate
const ANNUAL_COLA = 0.025 // 2.5% average

export default function RetirementCalculatorPage() {
  const [branch, setBranch] = useState<MilitaryBranch | "">("")
  const [payGrade, setPayGrade] = useState<PayGrade | "">("")
  const [yearsOfService, setYearsOfService] = useState<number>(20)
  const [retirementSystem, setRetirementSystem] = useState<"high3" | "brs">("high3")
  const [highThreeAverage, setHighThreeAverage] = useState<number>(0)
  const [tspBalance, setTspBalance] = useState<number>(0)
  const [tspContributionPercent, setTspContributionPercent] = useState<number>(5)
  const [currentAge, setCurrentAge] = useState<number>(40)
  const [disabilityPercent, setDisabilityPercent] = useState<number>(0)

  const availableRanks = useMemo(() => {
    if (!branch) return []
    return RANKS[branch]?.filter(r => 
      r.payGrade.startsWith('E-7') || r.payGrade.startsWith('E-8') || r.payGrade.startsWith('E-9') ||
      r.payGrade.startsWith('O-3') || r.payGrade.startsWith('O-4') || r.payGrade.startsWith('O-5') || 
      r.payGrade.startsWith('O-6') || r.payGrade.startsWith('O-7') || r.payGrade.startsWith('O-8')
    ) || []
  }, [branch])

  const getBasePay = (grade: string, years: number): number => {
    const payTable = BASE_PAY[grade]
    if (!payTable) return 7000 // Default estimate
    
    const brackets = Object.keys(payTable).map(Number).sort((a, b) => a - b)
    let bracket = brackets[0]
    for (const b of brackets) {
      if (years >= b) bracket = b
    }
    return payTable[bracket] || 7000
  }

  const calculations = useMemo(() => {
    const basePay = payGrade ? getBasePay(payGrade, yearsOfService) : 7000
    const high3 = highThreeAverage || basePay

    // High-3 Calculation
    const high3Multiplier = yearsOfService * 0.025 // 2.5% per year
    const high3Pension = high3 * high3Multiplier

    // BRS Calculation
    const brsMultiplier = yearsOfService * 0.02 // 2% per year
    const brsPension = high3 * brsMultiplier
    
    // BRS TSP government match (up to 5%)
    const annualMatch = basePay * 12 * Math.min(tspContributionPercent, 5) / 100
    const yearsContributing = Math.max(0, yearsOfService - 2) // Match starts at year 3
    const estimatedTspFromMatch = annualMatch * yearsContributing * 1.07 // Assume 7% growth

    // Total BRS value (pension + TSP match estimate)
    const brsTotalValue = brsPension * 12 * 20 + tspBalance + estimatedTspFromMatch // 20 years of pension

    // COLA projections (10 years)
    const colaProjections = []
    let currentHigh3 = high3Pension
    let currentBRS = brsPension
    for (let i = 0; i <= 10; i++) {
      colaProjections.push({
        year: i,
        age: currentAge + i,
        high3: currentHigh3,
        brs: currentBRS
      })
      currentHigh3 *= (1 + ANNUAL_COLA)
      currentBRS *= (1 + ANNUAL_COLA)
    }

    // VA Disability offset (if applicable)
    const vaCompensation = disabilityPercent > 0 ? (disabilityPercent / 100) * 3500 : 0 // Rough estimate

    return {
      basePay,
      high3,
      high3Multiplier: high3Multiplier * 100,
      high3Pension,
      brsMultiplier: brsMultiplier * 100,
      brsPension,
      annualMatch,
      estimatedTspFromMatch,
      brsTotalValue,
      colaProjections,
      vaCompensation,
      monthlyHigh3: high3Pension,
      monthlyBRS: brsPension,
      annualHigh3: high3Pension * 12,
      annualBRS: brsPension * 12
    }
  }, [payGrade, yearsOfService, highThreeAverage, tspBalance, tspContributionPercent, currentAge, disabilityPercent])

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
      title="Retirement Calculator"
      description="Estimate your military retirement pension under High-3 or BRS"
      backLink="/separation"
      backLabel="Separation"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-gold" />
                Your Information
              </CardTitle>
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
                  <Label>Retirement Pay Grade</Label>
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
                  <Label>Years of Service at Retirement</Label>
                  <Input
                    type="number"
                    value={yearsOfService}
                    onChange={(e) => setYearsOfService(Number(e.target.value))}
                    min={20}
                    max={40}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age at Retirement</Label>
                  <Input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    min={38}
                    max={65}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>High-3 Average Monthly Pay</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={highThreeAverage || ""}
                    onChange={(e) => setHighThreeAverage(Number(e.target.value))}
                    placeholder={`Estimated: ${formatCurrency(calculations.basePay)}`}
                    className="bg-secondary border-border pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Average of your highest 36 months of basic pay
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Retirement System</Label>
                <RadioGroup value={retirementSystem} onValueChange={(val) => setRetirementSystem(val as "high3" | "brs")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high3" id="high3" />
                    <Label htmlFor="high3" className="font-normal">
                      High-3 (Legacy) - 2.5% per year
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="brs" id="brs" />
                    <Label htmlFor="brs" className="font-normal">
                      Blended Retirement System (BRS) - 2% per year + TSP match
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {retirementSystem === "brs" && (
                <>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Current TSP Balance</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={tspBalance || ""}
                          onChange={(e) => setTspBalance(Number(e.target.value))}
                          placeholder="$0"
                          className="bg-secondary border-border pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>TSP Contribution %</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={tspContributionPercent}
                          onChange={(e) => setTspContributionPercent(Number(e.target.value))}
                          min={0}
                          max={100}
                          className="bg-secondary border-border pr-9"
                        />
                        <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Government matches up to 5%
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>VA Disability Rating (if any)</Label>
                <Select value={disabilityPercent.toString()} onValueChange={(val) => setDisabilityPercent(Number(val))}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="60">60%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50 border-border">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Calculator Notes</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>This is an estimate only - actual pension depends on exact pay history</li>
                    <li>COLA adjustments assumed at 2.5% annually</li>
                    <li>VA disability may offset or add to retirement pay (CRSC/CRDP)</li>
                    <li>Consult a financial advisor for precise calculations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Primary Result */}
          <Card className="bg-card border-gold/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-gold">
                <DollarSign className="h-5 w-5" />
                {retirementSystem === "high3" ? "High-3" : "BRS"} Monthly Pension
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground mb-2">
                {formatCurrency(retirementSystem === "high3" ? calculations.monthlyHigh3 : calculations.monthlyBRS)}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-gold text-gold">
                  {retirementSystem === "high3" ? calculations.high3Multiplier : calculations.brsMultiplier}% multiplier
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({yearsOfService} years x {retirementSystem === "high3" ? "2.5" : "2.0"}%)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Annual Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Annual Retirement Income</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Military Pension</span>
                <span className="font-semibold">
                  {formatCurrency(retirementSystem === "high3" ? calculations.annualHigh3 : calculations.annualBRS)}
                </span>
              </div>
              
              {disabilityPercent > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">VA Disability (est.)</span>
                  <span className="font-semibold text-green-500">
                    +{formatCurrency(calculations.vaCompensation * 12)}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Annual Income</span>
                <span className="font-bold text-gold text-xl">
                  {formatCurrency(
                    (retirementSystem === "high3" ? calculations.annualHigh3 : calculations.annualBRS) +
                    (disabilityPercent > 0 ? calculations.vaCompensation * 12 : 0)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* TSP Info for BRS */}
          {retirementSystem === "brs" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PiggyBank className="h-5 w-5 text-gold" />
                  TSP Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className="font-medium">{formatCurrency(tspBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Est. Govt Match Value</span>
                  <span className="font-medium text-green-500">
                    +{formatCurrency(calculations.estimatedTspFromMatch)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Projected TSP at Retirement</span>
                  <span className="font-bold">{formatCurrency(tspBalance + calculations.estimatedTspFromMatch)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  *Assumes 7% annual growth and continued contributions
                </p>
              </CardContent>
            </Card>
          )}

          {/* COLA Projections */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-gold" />
                10-Year COLA Projection
              </CardTitle>
              <CardDescription>
                Estimated pension growth with 2.5% annual COLA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {calculations.colaProjections.filter((_, i) => i % 2 === 0).map((proj) => (
                  <div key={proj.year} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Year {proj.year} (Age {proj.age})
                    </span>
                    <span className="font-medium">
                      {formatCurrency(retirementSystem === "high3" ? proj.high3 : proj.brs)}/mo
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison */}
          <Card className="bg-secondary/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-gold" />
                System Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className={`p-4 rounded-lg ${retirementSystem === "high3" ? "bg-gold/20 border border-gold/30" : "bg-card"}`}>
                  <p className="text-xs text-muted-foreground mb-1">High-3</p>
                  <p className="text-xl font-bold">{formatCurrency(calculations.monthlyHigh3)}</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
                <div className={`p-4 rounded-lg ${retirementSystem === "brs" ? "bg-gold/20 border border-gold/30" : "bg-card"}`}>
                  <p className="text-xs text-muted-foreground mb-1">BRS</p>
                  <p className="text-xl font-bold">{formatCurrency(calculations.monthlyBRS)}</p>
                  <p className="text-xs text-muted-foreground">/month + TSP</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                BRS members also receive government TSP match and continuation pay at 12 years
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionLayout>
  )
}
