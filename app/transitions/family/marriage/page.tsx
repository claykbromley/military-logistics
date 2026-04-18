"use client"

import { SectionLayout } from "@/components/section-layout"
import { InteractiveChecklist, ChecklistCategory } from "@/components/checklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  Shield,
  Home,
  Building
} from "lucide-react"

const marriageChecklist: ChecklistCategory[] = [
  {
    name: "Immediate (Within 72 Hours)",
    description: "Critical tasks to complete right after getting married",
    items: [
      {
        id: "report-command",
        label: "Report marriage to your command/supervisor",
        description: "Required within 72 hours of marriage",
        required: true,
        priority: "high"
      },
      {
        id: "obtain-certificates",
        label: "Obtain certified copies of marriage certificate",
        description: "Get at least 5 certified copies for various requirements",
        required: true,
        priority: "high"
      },
      {
        id: "personnel-office",
        label: "Visit personnel office to update records",
        description: "Submit marriage certificate and update emergency contacts",
        required: true
      }
    ]
  },
  {
    name: "Within 30 Days",
    description: "Important administrative tasks",
    items: [
      {
        id: "deers-enrollment",
        label: "Enroll spouse in DEERS",
        description: "Required for all dependent benefits - bring marriage certificate",
        required: true,
        priority: "high"
      },
      {
        id: "spouse-id",
        label: "Schedule and obtain spouse military ID card",
        description: "Required for base access and benefits",
        required: true
      },
      {
        id: "tricare-enrollment",
        label: "Enroll spouse in TRICARE",
        description: "Select TRICARE Prime or Select based on your situation",
        required: true
      },
      {
        id: "bah-update",
        label: "Update BAH to with-dependent rate",
        description: "Submit request through finance office",
        required: true
      },
      {
        id: "sgli-update",
        label: "Update SGLI beneficiary",
        description: "Consider adding spouse as beneficiary",
        required: false
      }
    ]
  },
  {
    name: "Within 60 Days",
    description: "Additional updates and registrations",
    items: [
      {
        id: "dd-form-93",
        label: "Update DD Form 93 (Record of Emergency Data)",
        description: "Add spouse as emergency contact and beneficiary",
        required: true
      },
      {
        id: "dental-enrollment",
        label: "Enroll spouse in TRICARE Dental Program",
        description: "Separate enrollment from medical TRICARE",
        required: false
      },
      {
        id: "power-of-attorney",
        label: "Consider Power of Attorney for spouse",
        description: "Useful for deployments and emergencies",
        required: false
      },
      {
        id: "housing-update",
        label: "Update housing office if on-base",
        description: "May qualify for larger quarters with dependent",
        required: false
      }
    ]
  },
  {
    name: "Name Change (If Applicable)",
    description: "Steps if your spouse is changing their name",
    items: [
      {
        id: "social-security",
        label: "Update Social Security card",
        description: "Must be done before other name changes",
        required: false
      },
      {
        id: "drivers-license",
        label: "Update driver's license",
        description: "State-specific requirements vary",
        required: false
      },
      {
        id: "passport",
        label: "Update passport",
        description: "Important for OCONUS assignments",
        required: false
      },
      {
        id: "bank-accounts",
        label: "Update bank accounts",
        description: "Update name on all financial accounts",
        required: false
      }
    ]
  }
]

const bahIncreaseExamples = [
  { location: "San Diego, CA", without: 2580, with: 3213, increase: 633 },
  { location: "Fort Bragg, NC", without: 1206, with: 1476, increase: 270 },
  { location: "Joint Base Lewis-McChord, WA", without: 2046, with: 2457, increase: 411 },
  { location: "Norfolk, VA", without: 1782, with: 2154, increase: 372 },
]

export default function MarriagePage() {
  return (
    <SectionLayout
      title="Getting Married"
      description="Complete guide to marriage in the military - from paperwork to benefits"
      backHref="/family"
      backLabel="Family Changes"
    >
      <div className="space-y-8">
        {/* Critical Alert */}
        <Card className="bg-patriot-red/10 border-patriot-red/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-patriot-red shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground">72-Hour Reporting Requirement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You must report your marriage to your command within 72 hours. Failure to do so can result 
                  in administrative action. Additionally, marrying solely for the purpose of obtaining military 
                  benefits is fraud and a violation of the UCMJ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="checklist" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <InteractiveChecklist
              checklistId="marriage"
              categories={marriageChecklist}
            />
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            {/* BAH Increase */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-gold" />
                  <CardTitle className="text-foreground">BAH Increase</CardTitle>
                </div>
                <CardDescription>
                  With-dependent BAH rates are significantly higher than without-dependent rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Location (E-5)</th>
                        <th className="text-right py-3 px-2 text-muted-foreground font-medium">Without Dep</th>
                        <th className="text-right py-3 px-2 text-muted-foreground font-medium">With Dep</th>
                        <th className="text-right py-3 px-2 text-muted-foreground font-medium">Increase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bahIncreaseExamples.map((row, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-3 px-2 text-foreground">{row.location}</td>
                          <td className="text-right py-3 px-2 text-foreground">${row.without.toLocaleString()}</td>
                          <td className="text-right py-3 px-2 text-foreground">${row.with.toLocaleString()}</td>
                          <td className="text-right py-3 px-2 text-emerald-400 font-medium">+${row.increase.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Rates are approximate and vary by rank and location. Check current rates at the Defense Travel Management Office.
                </p>
              </CardContent>
            </Card>

            {/* TRICARE */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gold" />
                  <CardTitle className="text-foreground">TRICARE Coverage</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <h4 className="font-medium text-foreground mb-2">TRICARE Prime</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        No enrollment fees for active duty families
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        No cost for most care at MTF
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        Low cost-shares for network care
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        Requires PCM referrals for specialists
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <h4 className="font-medium text-foreground mb-2">TRICARE Select</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        No enrollment fees for active duty families
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        See any TRICARE-authorized provider
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        No referrals needed
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        Higher cost-shares than Prime
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Benefits */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <DollarSign className="h-8 w-8 text-gold mb-3" />
                  <h4 className="font-medium text-foreground mb-1">Family Separation Allowance</h4>
                  <p className="text-sm text-muted-foreground">
                    $250/month when separated from family for 30+ days due to military orders
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <Building className="h-8 w-8 text-gold mb-3" />
                  <h4 className="font-medium text-foreground mb-1">Base Privileges</h4>
                  <p className="text-sm text-muted-foreground">
                    Spouse gains access to commissary, exchange, MWR facilities, and more
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <Shield className="h-8 w-8 text-gold mb-3" />
                  <h4 className="font-medium text-foreground mb-1">Legal Services</h4>
                  <p className="text-sm text-muted-foreground">
                    Free legal assistance for wills, powers of attorney, and other documents
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Required Documents</CardTitle>
                <CardDescription>
                  Documents needed to process your marriage and enroll your spouse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Certified Marriage Certificate",
                      description: "Official copy from county/state - not the commemorative certificate",
                      copies: "5+ copies recommended"
                    },
                    {
                      title: "Spouse's Birth Certificate",
                      description: "Or valid passport for proof of citizenship",
                      copies: "1 certified copy"
                    },
                    {
                      title: "Spouse's Social Security Card",
                      description: "Required for DEERS enrollment",
                      copies: "Original"
                    },
                    {
                      title: "Spouse's Photo ID",
                      description: "State driver's license or ID card",
                      copies: "Original"
                    },
                    {
                      title: "DD Form 1172-2",
                      description: "Application for ID Card/DEERS Enrollment",
                      copies: "Completed at RAPIDS office"
                    },
                    {
                      title: "Spouse's Previous Marriage Dissolution",
                      description: "If applicable - divorce decree or death certificate",
                      copies: "Certified copy"
                    }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                      <FileText className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">{doc.copies}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Before the Wedding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Inform your chain of command</strong> - Let them know about 
                    upcoming marriage, especially if you&apos;ll need time off.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Gather documents early</strong> - Get certified copies of 
                    birth certificates and other documents before the wedding.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Check RAPIDS availability</strong> - ID card offices can have 
                    long wait times; schedule appointments in advance.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">OCONUS Marriages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Marriage to foreign nationals</strong> - Requires additional 
                    approval and background checks. Start the process early.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Document authentication</strong> - Foreign documents may need 
                    apostilles or embassy authentication.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Visa/immigration</strong> - Your spouse may need a visa to 
                    return to the US with you.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Financial Considerations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">BAH effective date</strong> - Usually starts the day after 
                    marriage is reported. Don&apos;t delay reporting!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Joint accounts</strong> - Consider setting up joint accounts 
                    and updating allotments.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Tax implications</strong> - Marriage affects your tax filing 
                    status; consult with finance.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Spouse Orientation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">AFTB/SFAC programs</strong> - Army Family Team Building and 
                    similar programs help spouses understand military life.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">FRG/Key Spouse</strong> - Connect with Family Readiness 
                    Groups for support and information.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Military OneSource</strong> - Free counseling and resources 
                    for military families 24/7.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SectionLayout>
  )
}
