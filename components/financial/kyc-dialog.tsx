"use client"

import { useState } from "react"
import { Loader2, Shield, User, MapPin, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { STATES } from "@/lib/types"

interface KYCData {
  given_name: string
  family_name: string
  email: string
  phone: string
  date_of_birth: string
  tax_id: string
  street_address: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface KYCDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: KYCData) => Promise<void>
}

function isInvalidSSN(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 9) return true
  if (/^(\d)\1{8}$/.test(digits)) {return true}
  if (digits === "123456789") {return true}
  if (digits === "987654321") {return true}
  return false
}

export function KYCDialog({ open, onOpenChange, onComplete }: KYCDialogProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState<KYCData>({
    given_name: "",
    family_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    tax_id: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "USA",
  })

  const updateField = (field: keyof KYCData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isStep1Valid = formData.given_name && formData.family_name && formData.email && formData.phone && formData.date_of_birth
  const isStep2Valid = formData.street_address && formData.city && formData.state && formData.postal_code
  const isStep3Valid = formData.tax_id.length >= 9 && agreedToTerms

  const handleSubmit = async () => {
    if (!isStep3Valid) return
    setIsSubmitting(true)
    try {
      await onComplete(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            s === step
              ? "bg-primary text-primary-foreground"
              : s < step
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {s}
        </div>
      ))}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Investment Account Setup
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "We need some personal information to open your investment account."}
            {step === 2 && "Please provide your address for regulatory compliance."}
            {step === 3 && "Final step: Tax information and agreements."}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <User className="h-4 w-4" />
              Personal Information
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="given_name">First Name</Label>
                <Input
                  id="given_name"
                  placeholder="John"
                  value={formData.given_name}
                  onChange={(e) => updateField("given_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family_name">Last Name</Label>
                <Input
                  id="family_name"
                  placeholder="Doe"
                  value={formData.family_name}
                  onChange={(e) => updateField("family_name", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@military.mil"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Address Information */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              Address Information
            </div>
            <div className="space-y-2">
              <Label htmlFor="street_address">Street Address</Label>
              <Input
                id="street_address"
                placeholder="123 Main Street, Apt 4B"
                value={formData.street_address}
                onChange={(e) => updateField("street_address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="San Diego"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateField("state", value)}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state.abbr} value={state.abbr}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">ZIP Code</Label>
              <Input
                id="postal_code"
                placeholder="92101"
                value={formData.postal_code}
                onChange={(e) => updateField("postal_code", e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => setStep(3)} disabled={!isStep2Valid}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Tax & Agreements */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <FileText className="h-4 w-4" />
              Tax Information & Agreements
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">Social Security Number</Label>
              <Input
                id="tax_id"
                type="password"
                placeholder="XXX-XX-XXXX"
                value={formData.tax_id}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 9)
                  updateField("tax_id", value)
                }}
              />
              <p className="text-xs text-muted-foreground">
                Required for tax reporting. Your SSN is encrypted and stored securely.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <p className="text-sm font-medium">Agreements</p>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  className="border-2 border-border dark:border-slate-500 cursor-pointer"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the Customer Agreement, Margin Agreement, and Account Agreement. 
                  I confirm that I am not a control person, politically exposed person, or 
                  affiliated with a securities exchange or FINRA.
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-primary">
                <strong>Note:</strong> This is a sandbox/paper trading account for demonstration purposes. 
                No real money will be used.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => {
                  if (isInvalidSSN(formData.tax_id)) {alert("Please enter a valid SSN")}
                  else {handleSubmit()}}
                }
                disabled={!isStep3Valid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Investment Account"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
