"use client"

import { useState, useMemo } from "react"
import { SectionLayout } from "@/components/section-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  Calculator, 
  DollarSign, 
  Truck,
  Info,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Scale,
  Fuel,
  FileText
} from "lucide-react"
import { MILITARY_BRANCHES, RANKS, type MilitaryBranch, type PayGrade } from "@/lib/types"

// Base rates per pound per mile (simplified government rate)
const BASE_RATE_PER_POUND_PER_MILE = 0.00045 // Approximate rate

// Additional incentive percentages
const INCENTIVE_RATE = 0.95 // 95% of what government would pay a contractor

// Fuel costs per mile (approximate, varies by vehicle)
const FUEL_COSTS_PER_MILE = {
  sedan: 0.12,
  suv: 0.18,
  pickup: 0.20,
  truck_small: 0.35,
  truck_large: 0.55,
  trailer: 0.08 // Additional for towing
}

// POV (Privately Owned Vehicle) mileage rate
const POV_MILEAGE_RATE = 0.22 // per mile for PCS

// DLA (Dislocation Allowance) rates by pay grade (simplified)
const DLA_RATES: Record<string, { withDependents: number; withoutDependents: number }> = {
  "E-1": { withDependents: 2486, withoutDependents: 1944 },
  "E-2": { withDependents: 2486, withoutDependents: 1944 },
  "E-3": { withDependents: 2486, withoutDependents: 1944 },
  "E-4": { withDependents: 2612, withoutDependents: 2098 },
  "E-5": { withDependents: 2738, withoutDependents: 2252 },
  "E-6": { withDependents: 2864, withoutDependents: 2406 },
  "E-7": { withDependents: 2990, withoutDependents: 2560 },
  "E-8": { withDependents: 3116, withoutDependents: 2714 },
  "E-9": { withDependents: 3242, withoutDependents: 2868 },
  "W-1": { withDependents: 2864, withoutDependents: 2406 },
  "W-2": { withDependents: 2990, withoutDependents: 2560 },
  "W-3": { withDependents: 3116, withoutDependents: 2714 },
  "W-4": { withDependents: 3242, withoutDependents: 2868 },
  "W-5": { withDependents: 3368, withoutDependents: 3022 },
  "O-1": { withDependents: 2990, withoutDependents: 2560 },
  "O-2": { withDependents: 3116, withoutDependents: 2714 },
  "O-3": { withDependents: 3242, withoutDependents: 2868 },
  "O-4": { withDependents: 3494, withoutDependents: 3176 },
  "O-5": { withDependents: 3620, withoutDependents: 3330 },
  "O-6": { withDependents: 3746, withoutDependents: 3484 },
  "O-7": { withDependents: 3872, withoutDependents: 3638 },
  "O-8": { withDependents: 3998, withoutDependents: 3792 },
  "O-9": { withDependents: 4124, withoutDependents: 3946 },
  "O-10": { withDependents: 4250, withoutDependents: 4100 }
}

// Weight allowances by rank (lbs)
const WEIGHT_ALLOWANCES: Record<string, { withDependents: number; withoutDependents: number }> = {
  "E-1": { withDependents: 8000, withoutDependents: 5000 },
  "E-2": { withDependents: 8000, withoutDependents: 5000 },
  "E-3": { withDependents: 8000, withoutDependents: 5000 },
  "E-4": { withDependents: 8000, withoutDependents: 7000 },
  "E-5": { withDependents: 9000, withoutDependents: 7000 },
  "E-6": { withDependents: 11000, withoutDependents: 8000 },
  "E-7": { withDependents: 13000, withoutDependents: 11000 },
  "E-8": { withDependents: 14000, withoutDependents: 12000 },
  "E-9": { withDependents: 15000, withoutDependents: 13000 },
  "W-1": { withDependents: 12000, withoutDependents: 10000 },
  "W-2": { withDependents: 13000, withoutDependents: 11000 },
  "W-3": { withDependents: 14000, withoutDependents: 12000 },
  "W-4": { withDependents: 15000, withoutDependents: 13000 },
  "W-5": { withDependents: 16000, withoutDependents: 14000 },
  "O-1": { withDependents: 10000, withoutDependents: 8000 },
  "O-2": { withDependents: 12500, withoutDependents: 9000 },
  "O-3": { withDependents: 13000, withoutDependents: 10000 },
  "O-4": { withDependents: 14000, withoutDependents: 11000 },
  "O-5": { withDependents: 16000, withoutDependents: 12000 },
  "O-6": { withDependents: 18000, withoutDependents: 14000 },
  "O-7": { withDependents: 18000, withoutDependents: 14000 },
  "O-8": { withDependents: 18000, withoutDependents: 14000 },
  "O-9": { withDependents: 18000, withoutDependents: 14000 },
  "O-10": { withDependents: 18000, withoutDependents: 14000 }
}

export default function PPMEstimatorPage() {
  const [branch, setBranch] = useState<MilitaryBranch | "">("")
  const [payGrade, setPayGrade] = useState<PayGrade | "">("")
  const [hasDependents, setHasDependents] = useState(false)
  const [distance, setDistance] = useState<number>(0)
  const [estimatedWeight, setEstimatedWeight] = useState<number>(0)
  const [vehicleType, setVehicleType] = useState<string>("suv")
  const [hasTowedVehicle, setHasTowedVehicle] = useState(false)
  const [includeDLA, setIncludeDLA] = useState(true)

  const availableRanks = useMemo(() => {
    if (!branch) return []
    return RANKS[branch] || []
  }, [branch])

  const calculations = useMemo(() => {
    if (!payGrade || !distance || !estimatedWeight) {
      return null
    }

    const allowance = WEIGHT_ALLOWANCES[payGrade]
    if (!allowance) return null

    const maxWeight = hasDependents ? allowance.withDependents : allowance.withoutDependents
    const effectiveWeight = Math.min(estimatedWeight, maxWeight)
    const excessWeight = Math.max(0, estimatedWeight - maxWeight)

    // Government cost calculation (what they would pay a contractor)
    const governmentCost = effectiveWeight * distance * BASE_RATE_PER_POUND_PER_MILE * 100
    
    // PPM incentive (95% of government cost)
    const ppmIncentive = governmentCost * INCENTIVE_RATE

    // Estimated fuel costs
    const fuelRate = FUEL_COSTS_PER_MILE[vehicleType as keyof typeof FUEL_COSTS_PER_MILE] || 0.18
    const trailerCost = hasTowedVehicle ? FUEL_COSTS_PER_MILE.trailer : 0
    const estimatedFuelCost = distance * (fuelRate + trailerCost)

    // POV mileage reimbursement
    const povReimbursement = distance * POV_MILEAGE_RATE

    // DLA
    const dlaRate = DLA_RATES[payGrade]
    const dlaAmount = includeDLA && dlaRate 
      ? (hasDependents ? dlaRate.withDependents : dlaRate.withoutDependents)
      : 0

    // Net profit estimate
    const totalReimbursement = ppmIncentive + povReimbursement + dlaAmount
    const estimatedExpenses = estimatedFuelCost + 200 // Adding $200 for misc (packing supplies, meals, etc.)
    const estimatedProfit = totalReimbursement - estimatedExpenses

    return {
      maxWeight,
      effectiveWeight,
      excessWeight,
      governmentCost,
      ppmIncentive,
      estimatedFuelCost,
      povReimbursement,
      dlaAmount,
      totalReimbursement,
      estimatedExpenses,
      estimatedProfit
    }
  }, [payGrade, distance, estimatedWeight, hasDependents, vehicleType, hasTowedVehicle, includeDLA])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatWeight = (weight: number) => {
    return new Intl.NumberFormat('en-US').format(weight)
  }

  return (
    <SectionLayout
      title="PPM Cost Estimator"
      description="Calculate your Personally Procured Move (DITY) reimbursement and estimate your potential profit"
      backLink="/pcs"
      backLabel="PCS"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-gold" />
                Move Details
              </CardTitle>
              <CardDescription>
                Enter your move information to estimate PPM reimbursement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Branch and Rank */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch of Service</Label>
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
                  <Label htmlFor="rank">Pay Grade</Label>
                  <Select value={payGrade} onValueChange={(val) => setPayGrade(val as PayGrade)} disabled={!branch}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder={branch ? "Select rank" : "Select branch first"} />
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

              {/* Dependents */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dependents" 
                  checked={hasDependents}
                  onCheckedChange={(checked) => setHasDependents(checked as boolean)}
                />
                <Label htmlFor="dependents" className="font-normal">
                  I have dependents (spouse/children)
                </Label>
              </div>

              <Separator />

              {/* Distance and Weight */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (miles)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="distance"
                      type="number"
                      placeholder="Enter distance"
                      value={distance || ""}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      className="bg-secondary border-border pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use Google Maps for accurate distance
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Estimated Weight (lbs)</Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Enter weight"
                      value={estimatedWeight || ""}
                      onChange={(e) => setEstimatedWeight(Number(e.target.value))}
                      className="bg-secondary border-border pl-9"
                    />
                  </div>
                  {payGrade && WEIGHT_ALLOWANCES[payGrade] && (
                    <p className="text-xs text-muted-foreground">
                      Your allowance: {formatWeight(hasDependents 
                        ? WEIGHT_ALLOWANCES[payGrade].withDependents 
                        : WEIGHT_ALLOWANCES[payGrade].withoutDependents)} lbs
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Vehicle Details */}
              <div className="space-y-4">
                <Label>Vehicle Type (for fuel estimate)</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan / Small Car</SelectItem>
                    <SelectItem value="suv">SUV / Crossover</SelectItem>
                    <SelectItem value="pickup">Pickup Truck</SelectItem>
                    <SelectItem value="truck_small">Small Rental Truck (10-12 ft)</SelectItem>
                    <SelectItem value="truck_large">Large Rental Truck (20+ ft)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="trailer" 
                    checked={hasTowedVehicle}
                    onCheckedChange={(checked) => setHasTowedVehicle(checked as boolean)}
                  />
                  <Label htmlFor="trailer" className="font-normal">
                    Towing a trailer or vehicle
                  </Label>
                </div>
              </div>

              <Separator />

              {/* DLA Option */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dla" 
                  checked={includeDLA}
                  onCheckedChange={(checked) => setIncludeDLA(checked as boolean)}
                />
                <Label htmlFor="dla" className="font-normal">
                  Include Dislocation Allowance (DLA)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-secondary/50 border-border">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Estimate Disclaimer</p>
                  <p>
                    This calculator provides estimates based on general rates. Actual reimbursement 
                    depends on official DTOD mileage, current rates, and your approved orders. 
                    Consult your Transportation Office for exact figures.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {calculations ? (
            <>
              {/* Summary Card */}
              <Card className="bg-card border-gold/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gold">
                    <TrendingUp className="h-5 w-5" />
                    Estimated Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {formatCurrency(calculations.estimatedProfit)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Potential profit from your PPM move
                  </p>
                </CardContent>
              </Card>

              {/* Detailed Breakdown */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gold" />
                    Detailed Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Weight Info */}
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Weight Allowance</span>
                      <span className="font-medium">{formatWeight(calculations.maxWeight)} lbs</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Your Estimated Weight</span>
                      <span className="font-medium">{formatWeight(estimatedWeight)} lbs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Reimbursable Weight</span>
                      <span className="font-medium text-green-500">{formatWeight(calculations.effectiveWeight)} lbs</span>
                    </div>
                    {calculations.excessWeight > 0 && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                        <span className="text-sm text-destructive">Excess Weight (not reimbursed)</span>
                        <span className="font-medium text-destructive">{formatWeight(calculations.excessWeight)} lbs</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Reimbursements */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Estimated Reimbursements
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">PPM Incentive (95% of gov cost)</span>
                        <span className="font-medium text-green-500">+{formatCurrency(calculations.ppmIncentive)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">POV Mileage ({distance} mi x ${POV_MILEAGE_RATE})</span>
                        <span className="font-medium text-green-500">+{formatCurrency(calculations.povReimbursement)}</span>
                      </div>
                      {includeDLA && calculations.dlaAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Dislocation Allowance (DLA)</span>
                          <span className="font-medium text-green-500">+{formatCurrency(calculations.dlaAmount)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center font-medium">
                        <span>Total Reimbursements</span>
                        <span className="text-green-500">{formatCurrency(calculations.totalReimbursement)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Estimated Expenses */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-destructive" />
                      Estimated Expenses
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Fuel Costs (est.)</span>
                        <span className="font-medium text-destructive">-{formatCurrency(calculations.estimatedFuelCost)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Misc. Expenses (supplies, meals)</span>
                        <span className="font-medium text-destructive">-$200</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center font-medium">
                        <span>Total Estimated Expenses</span>
                        <span className="text-destructive">{formatCurrency(calculations.estimatedExpenses)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Net Profit */}
                  <div className="p-4 bg-gold/10 rounded-lg border border-gold/30">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Estimated Net Profit</span>
                      <span className="text-2xl font-bold text-gold">{formatCurrency(calculations.estimatedProfit)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="h-5 w-5 text-gold" />
                    Maximize Your PPM Profit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      Pack efficiently and don&apos;t pay to move things you don&apos;t need
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      Get multiple quotes for rental trucks and choose the most fuel-efficient option
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      Save all receipts - fuel, tolls, lodging, and supplies are tax deductible
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      Consider a partial PPM if you have heavy items that would be cheaper to ship
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-xl text-foreground mb-2">Enter Your Move Details</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Fill in your rank, distance, and estimated weight to calculate your PPM reimbursement and potential profit.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SectionLayout>
  )
}
