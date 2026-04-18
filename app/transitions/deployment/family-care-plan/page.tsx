"use client"

import { useState } from "react"
import { SectionLayout } from "@/components/section-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Save,
  Download,
  Plus,
  Trash2,
  Shield,
  Heart,
  School,
  Stethoscope,
  DollarSign,
  Info
} from "lucide-react"

interface Caregiver {
  id: string
  name: string
  relationship: string
  phone: string
  altPhone: string
  email: string
  address: string
  city: string
  state: string
  zip: string
}

interface Dependent {
  id: string
  name: string
  dateOfBirth: string
  relationship: string
  specialNeeds: string
  schoolName: string
  schoolPhone: string
  doctorName: string
  doctorPhone: string
  medications: string
}

interface FinancialInfo {
  bankName: string
  accountType: string
  monthlyIncome: string
  monthlyExpenses: string
  allotmentAmount: string
  additionalNotes: string
}

const steps = [
  { id: 1, title: "Service Member Info", icon: User },
  { id: 2, title: "Dependents", icon: Users },
  { id: 3, title: "Short-Term Caregiver", icon: Shield },
  { id: 4, title: "Long-Term Caregiver", icon: Heart },
  { id: 5, title: "Financial Arrangements", icon: DollarSign },
  { id: 6, title: "Review & Export", icon: FileText }
]

const emptyCaregiver: Caregiver = {
  id: "",
  name: "",
  relationship: "",
  phone: "",
  altPhone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  zip: ""
}

const emptyDependent: Dependent = {
  id: "",
  name: "",
  dateOfBirth: "",
  relationship: "",
  specialNeeds: "",
  schoolName: "",
  schoolPhone: "",
  doctorName: "",
  doctorPhone: "",
  medications: ""
}

export default function FamilyCarePlanPage() {
  const [currentStep, setCurrentStep] = useState(1)
  
  // Service Member Info
  const [serviceMemberName, setServiceMemberName] = useState("")
  const [serviceMemberRank, setServiceMemberRank] = useState("")
  const [serviceMemberUnit, setServiceMemberUnit] = useState("")
  const [serviceMemberPhone, setServiceMemberPhone] = useState("")
  const [serviceMemberEmail, setServiceMemberEmail] = useState("")
  
  // Dependents
  const [dependents, setDependents] = useState<Dependent[]>([{ ...emptyDependent, id: "1" }])
  
  // Caregivers
  const [shortTermCaregiver, setShortTermCaregiver] = useState<Caregiver>({ ...emptyCaregiver, id: "short" })
  const [longTermCaregiver, setLongTermCaregiver] = useState<Caregiver>({ ...emptyCaregiver, id: "long" })
  
  // Financial
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo>({
    bankName: "",
    accountType: "",
    monthlyIncome: "",
    monthlyExpenses: "",
    allotmentAmount: "",
    additionalNotes: ""
  })
  
  // Acknowledgments
  const [caregiverAcknowledged, setCaregiverAcknowledged] = useState(false)
  const [financialAuthorized, setFinancialAuthorized] = useState(false)
  const [medicalAuthorized, setMedicalAuthorized] = useState(false)

  const addDependent = () => {
    setDependents([...dependents, { ...emptyDependent, id: Date.now().toString() }])
  }

  const removeDependent = (id: string) => {
    if (dependents.length > 1) {
      setDependents(dependents.filter(d => d.id !== id))
    }
  }

  const updateDependent = (id: string, field: keyof Dependent, value: string) => {
    setDependents(dependents.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ))
  }

  const calculateProgress = () => {
    let filled = 0
    let total = 0
    
    // Step 1: Service Member (5 fields)
    total += 5
    if (serviceMemberName) filled++
    if (serviceMemberRank) filled++
    if (serviceMemberUnit) filled++
    if (serviceMemberPhone) filled++
    if (serviceMemberEmail) filled++
    
    // Step 2: At least one dependent with name
    total += 1
    if (dependents.some(d => d.name)) filled++
    
    // Step 3: Short-term caregiver (name and phone)
    total += 2
    if (shortTermCaregiver.name) filled++
    if (shortTermCaregiver.phone) filled++
    
    // Step 4: Long-term caregiver (name and phone)
    total += 2
    if (longTermCaregiver.name) filled++
    if (longTermCaregiver.phone) filled++
    
    // Step 5: Financial basics
    total += 2
    if (financialInfo.bankName) filled++
    if (financialInfo.monthlyExpenses) filled++
    
    // Acknowledgments
    total += 3
    if (caregiverAcknowledged) filled++
    if (financialAuthorized) filled++
    if (medicalAuthorized) filled++
    
    return Math.round((filled / total) * 100)
  }

  const progress = calculateProgress()

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  Service Member Information
                </CardTitle>
                <CardDescription>
                  Your basic information for the Family Care Plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sm-name">Full Name *</Label>
                    <Input
                      id="sm-name"
                      value={serviceMemberName}
                      onChange={(e) => setServiceMemberName(e.target.value)}
                      placeholder="Last, First MI"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sm-rank">Rank *</Label>
                    <Input
                      id="sm-rank"
                      value={serviceMemberRank}
                      onChange={(e) => setServiceMemberRank(e.target.value)}
                      placeholder="e.g., SSG, CPT, PO2"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sm-unit">Unit/Command *</Label>
                  <Input
                    id="sm-unit"
                    value={serviceMemberUnit}
                    onChange={(e) => setServiceMemberUnit(e.target.value)}
                    placeholder="e.g., 1st Battalion, 101st Airborne Division"
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sm-phone">Phone Number *</Label>
                    <Input
                      id="sm-phone"
                      value={serviceMemberPhone}
                      onChange={(e) => setServiceMemberPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sm-email">Email *</Label>
                    <Input
                      id="sm-email"
                      type="email"
                      value={serviceMemberEmail}
                      onChange={(e) => setServiceMemberEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            {dependents.map((dependent, index) => (
              <Card key={dependent.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-gold" />
                      Dependent {index + 1}
                    </CardTitle>
                    {dependents.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDependent(dependent.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={dependent.name}
                        onChange={(e) => updateDependent(dependent.id, "name", e.target.value)}
                        placeholder="Full name"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={dependent.dateOfBirth}
                        onChange={(e) => updateDependent(dependent.id, "dateOfBirth", e.target.value)}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Input
                        value={dependent.relationship}
                        onChange={(e) => updateDependent(dependent.id, "relationship", e.target.value)}
                        placeholder="Child, Spouse, etc."
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        School/Daycare Name
                      </Label>
                      <Input
                        value={dependent.schoolName}
                        onChange={(e) => updateDependent(dependent.id, "schoolName", e.target.value)}
                        placeholder="School name"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>School Phone</Label>
                      <Input
                        value={dependent.schoolPhone}
                        onChange={(e) => updateDependent(dependent.id, "schoolPhone", e.target.value)}
                        placeholder="(555) 123-4567"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Primary Doctor
                      </Label>
                      <Input
                        value={dependent.doctorName}
                        onChange={(e) => updateDependent(dependent.id, "doctorName", e.target.value)}
                        placeholder="Doctor name"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Doctor Phone</Label>
                      <Input
                        value={dependent.doctorPhone}
                        onChange={(e) => updateDependent(dependent.id, "doctorPhone", e.target.value)}
                        placeholder="(555) 123-4567"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Current Medications</Label>
                    <Textarea
                      value={dependent.medications}
                      onChange={(e) => updateDependent(dependent.id, "medications", e.target.value)}
                      placeholder="List any medications, dosages, and frequency"
                      className="bg-secondary border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Special Needs or Considerations</Label>
                    <Textarea
                      value={dependent.specialNeeds}
                      onChange={(e) => updateDependent(dependent.id, "specialNeeds", e.target.value)}
                      placeholder="Allergies, medical conditions, special needs, etc."
                      className="bg-secondary border-border"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button variant="outline" onClick={addDependent} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Dependent
            </Button>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <Card className="bg-secondary/50 border-gold/30">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Short-Term Caregiver (72 Hours)</p>
                    <p className="text-muted-foreground">
                      This person must be able to assume care within 72 hours of notification 
                      in case of emergency deployment or unplanned absence. They should live 
                      nearby and be readily available.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gold" />
                  Short-Term Caregiver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={shortTermCaregiver.name}
                      onChange={(e) => setShortTermCaregiver({ ...shortTermCaregiver, name: e.target.value })}
                      placeholder="Full name"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input
                      value={shortTermCaregiver.relationship}
                      onChange={(e) => setShortTermCaregiver({ ...shortTermCaregiver, relationship: e.target.value })}
                      placeholder="e.g., Grandmother, Friend, Neighbor"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Primary Phone *
                    </Label>
                    <Input
                      value={shortTermCaregiver.phone}
                      onChange={(e) => setShortTermCaregiver({ ...shortTermCaregiver, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alternate Phone</Label>
                    <Input
                      value={shortTermCaregiver.altPhone}
                      onChange={(e) => setShortTermCaregiver({ ...shortTermCaregiver, altPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={shortTermCaregiver.email}
                    onChange={(e) => setShortTermCaregiver({ ...shortTermCaregiver, email: e.target.value })}
                    placeholder="email@example.com"
                    className="bg-secondary border-border"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Street Address
                  </Label>
                  <Input
                    value={shortTermCaregiver.address}
                    onChange={(e) => setShortTermCaregiver({ ...shortTermCaregiver, address: e.target.value })}
                    placeholder="123 Main Street"
                    className="bg-secondary border-border"
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={shortTermCaregiver.city}
                      onChange={(e) => setShortTermCaregiver({ ...shortTermCaregiver, city: e.target.value })}
                      placeholder="City"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={shortTermCaregiver.state}
                      onChange={(e) => setShortTermCaregiver({ ...shortTermCaregiver, state: e.target.value })}
                      placeholder="State"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code</Label>
                    <Input
                      value={shortTermCaregiver.zip}
                      onChange={(e) => setShortTermCaregiver({ ...shortTermCaregiver, zip: e.target.value })}
                      placeholder="ZIP"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-6">
            <Card className="bg-secondary/50 border-gold/30">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Long-Term Caregiver</p>
                    <p className="text-muted-foreground">
                      This person will assume care for the duration of your deployment or 
                      extended absence. They must be willing and able to provide care for 
                      months at a time if necessary.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-gold" />
                  Long-Term Caregiver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={longTermCaregiver.name}
                      onChange={(e) => setLongTermCaregiver({ ...longTermCaregiver, name: e.target.value })}
                      placeholder="Full name"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input
                      value={longTermCaregiver.relationship}
                      onChange={(e) => setLongTermCaregiver({ ...longTermCaregiver, relationship: e.target.value })}
                      placeholder="e.g., Parent, Sibling, Spouse"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Primary Phone *
                    </Label>
                    <Input
                      value={longTermCaregiver.phone}
                      onChange={(e) => setLongTermCaregiver({ ...longTermCaregiver, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alternate Phone</Label>
                    <Input
                      value={longTermCaregiver.altPhone}
                      onChange={(e) => setLongTermCaregiver({ ...longTermCaregiver, altPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={longTermCaregiver.email}
                    onChange={(e) => setLongTermCaregiver({ ...longTermCaregiver, email: e.target.value })}
                    placeholder="email@example.com"
                    className="bg-secondary border-border"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Street Address
                  </Label>
                  <Input
                    value={longTermCaregiver.address}
                    onChange={(e) => setLongTermCaregiver({ ...longTermCaregiver, address: e.target.value })}
                    placeholder="123 Main Street"
                    className="bg-secondary border-border"
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={longTermCaregiver.city}
                      onChange={(e) => setLongTermCaregiver({ ...longTermCaregiver, city: e.target.value })}
                      placeholder="City"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={longTermCaregiver.state}
                      onChange={(e) => setLongTermCaregiver({ ...longTermCaregiver, state: e.target.value })}
                      placeholder="State"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code</Label>
                    <Input
                      value={longTermCaregiver.zip}
                      onChange={(e) => setLongTermCaregiver({ ...longTermCaregiver, zip: e.target.value })}
                      placeholder="ZIP"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 5:
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gold" />
                  Financial Arrangements
                </CardTitle>
                <CardDescription>
                  Ensure your caregiver has access to funds for dependent care
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Bank/Credit Union Name</Label>
                    <Input
                      value={financialInfo.bankName}
                      onChange={(e) => setFinancialInfo({ ...financialInfo, bankName: e.target.value })}
                      placeholder="Bank name"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Input
                      value={financialInfo.accountType}
                      onChange={(e) => setFinancialInfo({ ...financialInfo, accountType: e.target.value })}
                      placeholder="Checking, Savings, Joint"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Estimated Monthly Income</Label>
                    <Input
                      value={financialInfo.monthlyIncome}
                      onChange={(e) => setFinancialInfo({ ...financialInfo, monthlyIncome: e.target.value })}
                      placeholder="$0.00"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Monthly Expenses *</Label>
                    <Input
                      value={financialInfo.monthlyExpenses}
                      onChange={(e) => setFinancialInfo({ ...financialInfo, monthlyExpenses: e.target.value })}
                      placeholder="$0.00"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Monthly Allotment to Caregiver</Label>
                  <Input
                    value={financialInfo.allotmentAmount}
                    onChange={(e) => setFinancialInfo({ ...financialInfo, allotmentAmount: e.target.value })}
                    placeholder="$0.00"
                    className="bg-secondary border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Additional Financial Notes</Label>
                  <Textarea
                    value={financialInfo.additionalNotes}
                    onChange={(e) => setFinancialInfo({ ...financialInfo, additionalNotes: e.target.value })}
                    placeholder="Any additional financial arrangements or instructions"
                    className="bg-secondary border-border"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Authorizations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="caregiver-ack" 
                    checked={caregiverAcknowledged}
                    onCheckedChange={(checked) => setCaregiverAcknowledged(checked as boolean)}
                  />
                  <Label htmlFor="caregiver-ack" className="font-normal leading-relaxed">
                    I confirm that I have discussed this Family Care Plan with my designated 
                    caregivers and they have agreed to assume care of my dependents when required.
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="financial-auth" 
                    checked={financialAuthorized}
                    onCheckedChange={(checked) => setFinancialAuthorized(checked as boolean)}
                  />
                  <Label htmlFor="financial-auth" className="font-normal leading-relaxed">
                    I authorize my designated caregiver(s) to access funds as specified for 
                    the care of my dependents.
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="medical-auth" 
                    checked={medicalAuthorized}
                    onCheckedChange={(checked) => setMedicalAuthorized(checked as boolean)}
                  />
                  <Label htmlFor="medical-auth" className="font-normal leading-relaxed">
                    I authorize my designated caregiver(s) to seek emergency medical care 
                    and make healthcare decisions for my dependents.
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 6:
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gold" />
                  Plan Summary
                </CardTitle>
                <CardDescription>
                  Review your Family Care Plan before exporting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Member */}
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-gold" />
                    Service Member
                  </h4>
                  <div className="bg-secondary rounded-lg p-3 text-sm">
                    <p><strong>Name:</strong> {serviceMemberName || "Not provided"}</p>
                    <p><strong>Rank:</strong> {serviceMemberRank || "Not provided"}</p>
                    <p><strong>Unit:</strong> {serviceMemberUnit || "Not provided"}</p>
                    <p><strong>Phone:</strong> {serviceMemberPhone || "Not provided"}</p>
                    <p><strong>Email:</strong> {serviceMemberEmail || "Not provided"}</p>
                  </div>
                </div>
                
                {/* Dependents */}
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gold" />
                    Dependents ({dependents.filter(d => d.name).length})
                  </h4>
                  <div className="space-y-2">
                    {dependents.filter(d => d.name).map((dep, i) => (
                      <div key={dep.id} className="bg-secondary rounded-lg p-3 text-sm">
                        <p><strong>{dep.name}</strong> ({dep.relationship || "Dependent"})</p>
                        <p>DOB: {dep.dateOfBirth || "Not provided"}</p>
                        {dep.schoolName && <p>School: {dep.schoolName}</p>}
                        {dep.specialNeeds && <p>Special Needs: {dep.specialNeeds}</p>}
                      </div>
                    ))}
                    {!dependents.some(d => d.name) && (
                      <p className="text-sm text-muted-foreground">No dependents added</p>
                    )}
                  </div>
                </div>
                
                {/* Caregivers */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gold" />
                      Short-Term Caregiver
                    </h4>
                    <div className="bg-secondary rounded-lg p-3 text-sm">
                      <p><strong>{shortTermCaregiver.name || "Not provided"}</strong></p>
                      <p>{shortTermCaregiver.relationship || "Relationship not specified"}</p>
                      <p>Phone: {shortTermCaregiver.phone || "Not provided"}</p>
                      {shortTermCaregiver.city && (
                        <p>{shortTermCaregiver.city}, {shortTermCaregiver.state}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-gold" />
                      Long-Term Caregiver
                    </h4>
                    <div className="bg-secondary rounded-lg p-3 text-sm">
                      <p><strong>{longTermCaregiver.name || "Not provided"}</strong></p>
                      <p>{longTermCaregiver.relationship || "Relationship not specified"}</p>
                      <p>Phone: {longTermCaregiver.phone || "Not provided"}</p>
                      {longTermCaregiver.city && (
                        <p>{longTermCaregiver.city}, {longTermCaregiver.state}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Authorizations Status */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Authorizations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {caregiverAcknowledged ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">Caregiver acknowledgment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {financialAuthorized ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">Financial authorization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {medicalAuthorized ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">Medical authorization</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/50 border-gold/30">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Next Steps</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Print this summary and complete DD Form 1561</li>
                      <li>Have caregivers sign acknowledgment forms</li>
                      <li>Submit to your unit S-1/Admin for commander approval</li>
                      <li>Keep copies for yourself and your caregivers</li>
                      <li>Update annually or when circumstances change</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-4">
              <Button className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90">
                <Save className="mr-2 h-4 w-4" />
                Save Plan
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export Summary
              </Button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <SectionLayout
      title="Family Care Plan Builder"
      description="Build your DD Form 1561 Family Care Plan with step-by-step guidance"
      backLink="/deployment"
      backLabel="Deployment"
    >
      <div className="space-y-6">
        {/* Progress */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Plan Completion</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
        
        {/* Step Indicators */}
        <div className="flex overflow-x-auto pb-2 gap-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                currentStep === step.id
                  ? "bg-gold text-gold-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <step.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{step.title}</span>
            </button>
          ))}
        </div>
        
        {/* Step Content */}
        {renderStepContent()}
        
        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </SectionLayout>
  )
}
