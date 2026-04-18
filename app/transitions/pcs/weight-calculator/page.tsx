'use client'

import { useState, useEffect } from 'react'
import { SectionLayout } from '@/components/section-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import {
  Truck,
  ClipboardList,
  Calculator,
  MapPin,
  DollarSign,
  FileText,
  Scale,
  Info,
  Save,
  CheckCircle2,
} from 'lucide-react'
import { PAY_GRADES, WEIGHT_ALLOWANCES, PRO_GEAR_ALLOWANCE, SPOUSE_PRO_GEAR_ALLOWANCE, type PayGrade } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const navItems = [
  { name: 'Overview', href: '/pcs', icon: Truck },
  { name: 'Checklist', href: '/pcs/checklist', icon: ClipboardList },
  { name: 'Weight Calculator', href: '/pcs/weight-calculator', icon: Calculator },
  { name: 'Weigh Stations', href: '/pcs/weigh-stations', icon: MapPin },
  { name: 'PPM Estimator', href: '/pcs/ppm-estimator', icon: DollarSign },
  { name: 'Documents', href: '/pcs/documents', icon: FileText },
]

export default function WeightCalculatorPage() {
  const [payGrade, setPayGrade] = useState<PayGrade | ''>('')
  const [hasDependents, setHasDependents] = useState(false)
  const [hasProGear, setHasProGear] = useState(false)
  const [hasSpouseProGear, setHasSpouseProGear] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)

      if (user) {
        // Load user profile for defaults
        const { data: profile } = await supabase
          .from('profiles')
          .select('pay_grade')
          .eq('id', user.id)
          .single()

        if (profile?.pay_grade) {
          setPayGrade(profile.pay_grade as PayGrade)
        }
      }
    }
    checkAuth()
  }, [supabase])

  const calculateAllowance = () => {
    if (!payGrade || !(payGrade in WEIGHT_ALLOWANCES)) return null

    const baseAllowance = hasDependents
      ? WEIGHT_ALLOWANCES[payGrade].with
      : WEIGHT_ALLOWANCES[payGrade].without

    const proGear = hasProGear ? PRO_GEAR_ALLOWANCE : 0
    const spouseProGear = hasDependents && hasSpouseProGear ? SPOUSE_PRO_GEAR_ALLOWANCE : 0

    return {
      base: baseAllowance,
      proGear,
      spouseProGear,
      total: baseAllowance + proGear + spouseProGear,
    }
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const allowance = calculateAllowance()
    if (!allowance) return

    await supabase.from('saved_calculations').insert({
      user_id: user.id,
      calculator_type: 'weight_allowance',
      inputs: {
        pay_grade: payGrade,
        has_dependents: hasDependents,
        has_pro_gear: hasProGear,
        has_spouse_pro_gear: hasSpouseProGear,
      },
      results: allowance,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const allowance = calculateAllowance()

  return (
    <SectionLayout
      title="PCS"
      description="Permanent Change of Station moves made easier"
      icon={Truck}
      navItems={navItems}
      currentPath="/pcs/weight-calculator"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Weight Allowance Calculator</h2>
          <p className="mt-1 text-muted-foreground">
            Calculate your total weight allowance based on rank and dependents
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Calculator Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Your Information
              </CardTitle>
              <CardDescription>
                Enter your details to calculate your weight allowance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pay Grade */}
              <div className="space-y-2">
                <Label htmlFor="payGrade">Pay Grade</Label>
                <Select value={payGrade} onValueChange={(v) => setPayGrade(v as PayGrade)}>
                  <SelectTrigger id="payGrade">
                    <SelectValue placeholder="Select your pay grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 text-xs font-semibold text-muted-foreground">Enlisted</div>
                    {PAY_GRADES.filter(pg => pg.category === 'Enlisted').map((pg) => (
                      <SelectItem key={pg.value} value={pg.value}>
                        {pg.value}
                      </SelectItem>
                    ))}
                    <div className="p-2 text-xs font-semibold text-muted-foreground">Warrant Officer</div>
                    {PAY_GRADES.filter(pg => pg.category === 'Warrant Officer').map((pg) => (
                      <SelectItem key={pg.value} value={pg.value}>
                        {pg.value}
                      </SelectItem>
                    ))}
                    <div className="p-2 text-xs font-semibold text-muted-foreground">Officer</div>
                    {PAY_GRADES.filter(pg => pg.category === 'Officer').map((pg) => (
                      <SelectItem key={pg.value} value={pg.value}>
                        {pg.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dependents Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                <div>
                  <Label htmlFor="dependents" className="text-base">Do you have dependents?</Label>
                  <p className="text-sm text-muted-foreground">
                    Spouse and/or children increase your allowance
                  </p>
                </div>
                <Switch
                  id="dependents"
                  checked={hasDependents}
                  onCheckedChange={setHasDependents}
                />
              </div>

              {/* Pro Gear Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                <div>
                  <Label htmlFor="proGear" className="text-base">Professional Books/Equipment?</Label>
                  <p className="text-sm text-muted-foreground">
                    Up to {PRO_GEAR_ALLOWANCE.toLocaleString()} lbs additional
                  </p>
                </div>
                <Switch
                  id="proGear"
                  checked={hasProGear}
                  onCheckedChange={setHasProGear}
                />
              </div>

              {/* Spouse Pro Gear Toggle */}
              {hasDependents && (
                <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <Label htmlFor="spouseProGear" className="text-base">Spouse Professional Items?</Label>
                    <p className="text-sm text-muted-foreground">
                      Up to {SPOUSE_PRO_GEAR_ALLOWANCE.toLocaleString()} lbs additional
                    </p>
                  </div>
                  <Switch
                    id="spouseProGear"
                    checked={hasSpouseProGear}
                    onCheckedChange={setHasSpouseProGear}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card className={allowance ? 'border-primary/30' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Your Weight Allowance
              </CardTitle>
              <CardDescription>
                {allowance ? 'Based on your selections' : 'Select your pay grade to see results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allowance ? (
                <div className="space-y-6">
                  {/* Total */}
                  <div className="rounded-lg bg-primary/10 p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Total Weight Allowance</p>
                    <p className="mt-2 text-4xl font-bold text-primary">
                      {allowance.total.toLocaleString()} lbs
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {payGrade} {hasDependents ? 'with dependents' : 'without dependents'}
                    </Badge>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Breakdown</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Base HHG Allowance</span>
                        <span className="font-medium">{allowance.base.toLocaleString()} lbs</span>
                      </div>
                      <Progress value={(allowance.base / allowance.total) * 100} className="h-2" />
                    </div>

                    {allowance.proGear > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Pro-Gear (Member)</span>
                          <span className="font-medium">{allowance.proGear.toLocaleString()} lbs</span>
                        </div>
                        <Progress value={(allowance.proGear / allowance.total) * 100} className="h-2" />
                      </div>
                    )}

                    {allowance.spouseProGear > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Pro-Gear (Spouse)</span>
                          <span className="font-medium">{allowance.spouseProGear.toLocaleString()} lbs</span>
                        </div>
                        <Progress value={(allowance.spouseProGear / allowance.total) * 100} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  {isAuthenticated && (
                    <Button onClick={handleSave} className="w-full" variant="outline">
                      {saved ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Calculation
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-center">
                  <div>
                    <Scale className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-4 text-muted-foreground">
                      Select your pay grade to calculate your weight allowance
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Weight allowances are set by the Joint Travel Regulations (JTR). These are maximum
              allowances - you will only be reimbursed for the actual weight moved.
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Pro-gear must be necessary for your job duties</li>
              <li>Spouse pro-gear applies to professional books/equipment for their profession</li>
              <li>Exceeding your allowance means paying for the excess weight yourself</li>
              <li>Always weigh your shipment at a certified scale</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Pro Gear Info */}
        <Card>
          <CardHeader>
            <CardTitle>What Counts as Pro-Gear?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-foreground">Examples of Pro-Gear</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>- Professional reference books</li>
                  <li>- Specialized tools for your MOS/AFSC</li>
                  <li>- Professional equipment</li>
                  <li>- Communications equipment</li>
                  <li>- Medical/dental equipment (medical personnel)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">NOT Pro-Gear</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>- Personal computers (unless required for job)</li>
                  <li>- Recreational equipment</li>
                  <li>- Personal books and magazines</li>
                  <li>- General household items</li>
                  <li>- Furniture</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionLayout>
  )
}
