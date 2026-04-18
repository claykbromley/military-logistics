"use client"

import { SectionLayout } from "@/components/section-layout"
import { InteractiveChecklist, ChecklistCategory } from "@/components/checklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Baby,
  Clock,
  CheckCircle2,
  FileText,
  Shield,
  Building,
  Heart,
  GraduationCap
} from "lucide-react"

const newChildChecklist: ChecklistCategory[] = [
  {
    name: "At the Hospital",
    description: "Tasks to complete before leaving the hospital",
    items: [
      {
        id: "birth-certificate-app",
        label: "Complete birth certificate application",
        description: "Hospital typically provides forms - request multiple certified copies",
        required: true,
        priority: "high"
      },
      {
        id: "ssn-application",
        label: "Apply for Social Security Number",
        description: "Can often be done at hospital when completing birth certificate",
        required: true,
        priority: "high"
      }
    ]
  },
  {
    name: "Within 30 Days",
    description: "Critical enrollment tasks",
    items: [
      {
        id: "command-notify",
        label: "Notify command of new dependent",
        description: "Required to update official records",
        required: true
      },
      {
        id: "deers-enrollment",
        label: "Enroll child in DEERS",
        description: "Bring birth certificate, SSN card, and your ID",
        required: true,
        priority: "high"
      },
      {
        id: "child-id",
        label: "Obtain dependent ID card (if over 10)",
        description: "Required for base access and benefits",
        required: false
      },
      {
        id: "tricare-enrollment",
        label: "Enroll child in TRICARE",
        description: "Automatic with DEERS enrollment - verify coverage",
        required: true
      }
    ]
  },
  {
    name: "Within 60 Days",
    description: "Additional administrative tasks",
    items: [
      {
        id: "dd-form-93",
        label: "Update DD Form 93 (Record of Emergency Data)",
        description: "Add child to emergency contact records",
        required: true
      },
      {
        id: "sgli-update",
        label: "Update SGLI beneficiary information",
        description: "Consider adding child or updating allocations",
        required: false
      },
      {
        id: "fsa-update",
        label: "Update FSA if enrolled",
        description: "Adding a dependent is a qualifying life event",
        required: false
      },
      {
        id: "family-care-plan",
        label: "Update Family Care Plan (if single parent or dual military)",
        description: "Required for deployability",
        required: false,
        priority: "high"
      }
    ]
  },
  {
    name: "Additional Considerations",
    description: "Other important items",
    items: [
      {
        id: "childcare-waitlist",
        label: "Add child to CDC/childcare waitlist",
        description: "Waitlists can be months long - apply early",
        required: false
      },
      {
        id: "will-update",
        label: "Update will and estate plan",
        description: "Include guardianship designations",
        required: false
      },
      {
        id: "passport",
        label: "Apply for passport (if OCONUS or planning PCS)",
        description: "Infant passports valid 5 years",
        required: false
      }
    ]
  }
]

const adoptionChecklist: ChecklistCategory[] = [
  {
    name: "Before Adoption",
    description: "Preparation and resources",
    items: [
      {
        id: "adoption-counseling",
        label: "Contact Military OneSource for adoption counseling",
        description: "Free resources for military families considering adoption",
        required: false
      },
      {
        id: "adoption-reimbursement",
        label: "Review adoption reimbursement eligibility",
        description: "Up to $2,000 per child reimbursement available",
        required: false
      },
      {
        id: "leave-planning",
        label: "Plan for adoption leave",
        description: "Up to 21 days of leave may be available",
        required: false
      }
    ]
  },
  {
    name: "After Adoption",
    description: "Administrative requirements",
    items: [
      {
        id: "legal-documents",
        label: "Obtain certified adoption decree",
        description: "Required for DEERS enrollment",
        required: true,
        priority: "high"
      },
      {
        id: "deers-adoption",
        label: "Enroll child in DEERS",
        description: "Bring adoption decree, new birth certificate, and SSN",
        required: true,
        priority: "high"
      },
      {
        id: "reimbursement-claim",
        label: "Submit adoption reimbursement claim",
        description: "Must submit within 1 year of adoption finalization",
        required: false
      }
    ]
  }
]

export default function ChildrenPage() {
  return (
    <SectionLayout
      title="Having Children"
      description="Guide to adding children to your military family through birth or adoption"
      backHref="/family"
      backLabel="Family Changes"
    >
      <div className="space-y-8">
        <Tabs defaultValue="birth" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="birth">New Birth</TabsTrigger>
            <TabsTrigger value="adoption">Adoption</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="childcare">Childcare</TabsTrigger>
          </TabsList>

          <TabsContent value="birth">
            <InteractiveChecklist
              checklistId="new-child-birth"
              categories={newChildChecklist}
            />
          </TabsContent>

          <TabsContent value="adoption" className="space-y-6">
            <Card className="bg-gold/10 border-gold/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Military Adoption Benefits</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      The military provides adoption reimbursement of up to $2,000 per child (up to $5,000 per year) 
                      for qualified adoption expenses. Contact your finance office for details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <InteractiveChecklist
              checklistId="adoption"
              categories={adoptionChecklist}
            />
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Child Benefits Overview</CardTitle>
                <CardDescription>
                  Benefits available to your children as military dependents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <Shield className="h-8 w-8 text-gold mb-3" />
                    <h4 className="font-medium text-foreground mb-2">TRICARE Healthcare</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Full medical coverage
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Well-child visits
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Immunizations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Specialist care
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <Building className="h-8 w-8 text-gold mb-3" />
                    <h4 className="font-medium text-foreground mb-2">Installation Programs</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Child Development Centers
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Youth programs
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        School Liaison Officers
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Special needs support
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <GraduationCap className="h-8 w-8 text-gold mb-3" />
                    <h4 className="font-medium text-foreground mb-2">Education Benefits</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        GI Bill transfer eligibility
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        DoDEA schools (OCONUS)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Tutoring programs
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Scholarships
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <FileText className="h-8 w-8 text-gold mb-3" />
                    <h4 className="font-medium text-foreground mb-2">Special Programs</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        EFMP (Special needs)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        New Parent Support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Family Advocacy
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Respite care
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parental Leave */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Parental Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border border-border">
                    <h4 className="font-medium text-foreground mb-2">Primary Caregiver</h4>
                    <p className="text-2xl font-bold text-gold mb-1">12 Weeks</p>
                    <p className="text-sm text-muted-foreground">
                      Non-chargeable leave for the primary caregiver following birth or adoption
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <h4 className="font-medium text-foreground mb-2">Secondary Caregiver</h4>
                    <p className="text-2xl font-bold text-gold mb-1">21 Days</p>
                    <p className="text-sm text-muted-foreground">
                      Non-chargeable leave for the secondary caregiver (birth or adoption)
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Leave policies may vary. Check current DoD policy and your service-specific regulations.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="childcare" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Military Childcare Options</CardTitle>
                <CardDescription>
                  The military offers several subsidized childcare options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-start gap-4">
                      <Building className="h-6 w-6 text-gold shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-foreground">Child Development Centers (CDC)</h4>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          On-installation childcare centers offering full-day and hourly care for children 
                          6 weeks to 5 years old. Fees based on total family income.
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Apply early - waitlists can be 6+ months
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-start gap-4">
                      <Heart className="h-6 w-6 text-gold shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-foreground">Family Child Care (FCC)</h4>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          Certified providers who care for children in their on-base homes. Often more 
                          flexible hours, including evenings and weekends.
                        </p>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm text-muted-foreground">
                            Good option for shift workers needing non-standard hours
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-start gap-4">
                      <GraduationCap className="h-6 w-6 text-gold shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-foreground">School-Age Care (SAC)</h4>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          Before and after school programs for children ages 5-12. Also provides full-day 
                          care during school breaks and summer.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-start gap-4">
                      <Baby className="h-6 w-6 text-gold shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-foreground">Military Child Care Fee Assistance</h4>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          Subsidies available for off-installation childcare when on-installation care 
                          is unavailable. Helps cover costs at civilian childcare providers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">CDC Fee Categories</CardTitle>
                <CardDescription>
                  Monthly fees based on total family income
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Category</th>
                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Income Range</th>
                        <th className="text-right py-3 px-2 text-muted-foreground font-medium">Approx. Weekly Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { cat: "I", income: "Up to $35,000", cost: "$65-85" },
                        { cat: "II", income: "$35,001 - $50,000", cost: "$85-105" },
                        { cat: "III", income: "$50,001 - $65,000", cost: "$105-130" },
                        { cat: "IV", income: "$65,001 - $80,000", cost: "$130-160" },
                        { cat: "V", income: "$80,001 - $100,000", cost: "$160-190" },
                        { cat: "VI", income: "Over $100,000", cost: "$190-220" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-3 px-2 text-foreground">Category {row.cat}</td>
                          <td className="py-3 px-2 text-foreground">{row.income}</td>
                          <td className="text-right py-3 px-2 text-foreground">{row.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Fees are approximate and vary by installation. Contact your local CDC for exact rates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SectionLayout>
  )
}
