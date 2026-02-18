"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { DollarSign, PiggyBank, CreditCard, Home, Receipt, Building2, ExternalLink, Briefcase, AlertCircle, FileText, GraduationCap, Users, Phone, ChevronDown, Lightbulb, TrendingUp, Shield, ChevronRight, BriefcaseBusiness } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BusinessPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const serviceCategories = [
    { name: "Investments", icon: TrendingUp},
    { name: "Taxes and Income", icon: PiggyBank},
    { name: "Loans", icon: Home},
    { name: "Retirement", icon: Shield},
    { name: "Start a Business", icon: BriefcaseBusiness},
    { name: "Credit", icon: CreditCard},
    { name: "Bills", icon: Receipt}
  ]

  const intro = {
    description: "Many service members dream of starting a business, and it is entirely possible to do so while serving on active duty. However, there are important Department of Defense regulations you must follow, including obtaining command approval, avoiding conflicts of interest, and never using your military position for business advantage. The Small Business Administration (SBA) offers programs specifically for military members and veterans, including the Boots to Business program available during transition. Military spouses also have access to unique entrepreneurship programs and can operate businesses without the same restrictions as active-duty members.",
    keyFacts: [
      { label: "SBA Veteran Programs", value: "Multiple", icon: Briefcase },
      { label: "Ethics Approval", value: "Required", icon: AlertCircle },
      { label: "Boots to Business", value: "Free Training", icon: GraduationCap },
      { label: "Spouse Businesses", value: "Fewer Restrictions", icon: Users },
    ],
    importantNote: "Always get written approval from your ethics counselor before starting any business activity. Failure to disclose outside employment or business ownership can result in UCMJ action. Keep your chain of command informed and renew your approval annually.",
    helpfulLinks: [
      { label: "SBA Veteran Resources", url: "https://www.sba.gov/business-guide/grow-your-business/veteran-owned-businesses" },
      { label: "Boots to Business", url: "https://www.sba.gov/sba-learning-platform/boots-business" },
    ],
  }

  const icons = {
    "DoD Regulations": Shield,
    "Balancing a Business with Military Life": Briefcase,
    "Business Setup and Management": FileText,
    "Marketing and Fundraising": TrendingUp,
    "Corporate Taxes": Receipt,
  }

  const page = {
    title: "Start a Business",
    sections: [
      {
        name: "DoD Regulations",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Active-duty military members may own businesses, but they must adhere to strict DoD regulations, including obtaining command approval, avoiding conflicts of interest, and ensuring operations do not interfere with military duties. Prohibited actions include using military titles, uniforms, or logos for endorsement, and soliciting subordinates.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">Key Regulations and Considerations</h5>
              <ul className="space-y-3 text-sm text-amber-800 dark:text-amber-300">
                <li>
                  <strong className="underline">Command Approval & Ethics:</strong> Service members should consult their unit{"'"}s legal office or ethics counselor to comply with the Joint Ethics Regulation (JER).
                </li>
                <li>
                  <strong className="underline">Conflicts of Interest:</strong> Businesses cannot conflict with official duties or violate statutes.
                </li>
                <li>
                  <strong className="underline">Marketing & Solicitation:</strong> Using military uniforms, ranks, or logos to promote a business is prohibited. Solicitation is restricted on installations, especially toward subordinates or during training.
                </li>
                <li>
                  <strong className="underline">Security Clearance:</strong> Business dealings with foreign nationals or questionable entities may impact security clearances.
                </li>
                <li>
                  <strong className="underline">DoD Contracting:</strong> To do business with the DoD, businesses must register in the System for Award Management (SAM) to obtain a CAGE code.
                </li>
                <li>
                  <strong className="underline">Senior Officer Restrictions:</strong> Officers (O-6 and below) and senior enlisted (E-9) in command positions may be restricted from serving on boards of companies doing business with the DoD.
                </li>
                <li>
                  <strong className="underline">Time Commitment:</strong> Military duties always take precedence over private business ventures.
                </li>
              </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Permitted Activities</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Passive investments (rental properties, stocks, mutual funds)</li>
                  <li>Spouse-operated businesses (you can assist off-duty)</li>
                  <li>Off-duty freelance work (with command approval)</li>
                  <li>Online businesses operated during personal time</li>
                  <li>Royalties from books, music, or creative works</li>
                  <li>Real estate investing and property management</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Prohibited Activities</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Using rank or position for business advantage</li>
                  <li>Soliciting subordinates as customers</li>
                  <li>Working for defense contractors you supervise</li>
                  <li>Using government email or systems for business</li>
                  <li>Wearing uniform for business purposes</li>
                  <li>Business activities during duty hours</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">How to Request Approval</h5>
              <ol className="space-y-1 text-sm text-blue-700 dark:text-blue-400 list-decimal list-inside">
                <li>Complete your service branch{"'"}s outside employment request form</li>
                <li>Describe business activities, time commitment, and potential conflicts</li>
                <li>Submit through your chain of command to the Ethics Counselor</li>
                <li>Await written approval before starting business activities</li>
                <li>Renew annually or when business activities change significantly</li>
              </ol>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                For detailed regulations, consult the <a href="https://dodsoco.ogc.osd.mil/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">Department of Defense Standards of Conduct Office (DoD Ethics)</a> and <strong>32 CFR § 552.60</strong>.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <a href="https://dodsoco.ogc.osd.mil/Portals/102/outside_activities_1.pdf" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  Outside Activities Guide <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">DoD guide for starting a business</p>
              </a>
              <a href="https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodm/550007r.pdf" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  DoD 5500.07-R Full Text <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Joint Ethics Regulation document</p>
              </a>
              <a href="https://dodsoco.ogc.osd.mil/" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  DoD Standards of Conduct <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Official ethics guidance office</p>
              </a>
            </div>
          </div>
        ),
      },
      {
        name: "Balancing a Business with Military Life",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Running a business while serving requires careful planning around deployments, PCS moves, and demanding military schedules.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">Tips for Success</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Choose Portable Businesses:</strong> Online businesses, consulting, and freelancing travel well</li>
                <li><strong>Build Systems:</strong> Create processes that can run without constant attention</li>
                <li><strong>Plan for Deployments:</strong> Have trusted partners or automation in place</li>
                <li><strong>Consider Your Spouse:</strong> Military spouse businesses can be the primary operator</li>
                <li><strong>Start Small:</strong> Test ideas before major investments</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Military Spouse Businesses</h5>
              <p className="text-sm text-green-700 dark:text-green-400">Military spouses can operate businesses without the same restrictions. Many successful military families run spouse-owned businesses with the service member providing support during off-duty hours.</p>
            </div>
          </div>
        ),
      },
      {
        name: "Business Setup and Management",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Setting up a business properly from the start saves headaches later. Consider these key steps and resources.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Business Structure Options</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Sole Proprietorship:</strong> Simplest, no formal registration</li>
                  <li><strong>LLC:</strong> Liability protection, flexible taxation</li>
                  <li><strong>S-Corp:</strong> Tax advantages for profitable businesses</li>
                  <li><strong>Partnership:</strong> For businesses with multiple owners</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">State of Incorporation</h5>
                <p className="text-sm text-muted-foreground mb-2">Consider registering in your state of legal residence to simplify taxes during PCS moves. Popular options:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Wyoming (no state income tax, privacy)</li>
                  <li>Delaware (business-friendly laws)</li>
                  <li>Your SLR (simplest option)</li>
                </ul>
              </div>
            </div>
            <a href="https://www.sba.gov/business-guide/launch-your-business/choose-business-structure" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              SBA Business Structure Guide <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Marketing and Fundraising",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Marketing your business and securing funding are critical for success. Military-specific resources can help.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">Funding Sources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>SBA Veterans Advantage:</strong> Fee relief on SBA loans for veteran-owned businesses</li>
                <li><strong>Boots to Business:</strong> Free SBA entrepreneurship training for transitioning service members</li>
                <li><strong>StreetShares:</strong> Veteran-focused small business lending</li>
                <li><strong>Hivers and Strivers:</strong> Angel investing for veteran entrepreneurs</li>
              </ul>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <a href="https://www.sba.gov/business-guide/grow-your-business/veteran-owned-businesses" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  SBA Veteran Resources <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Programs and resources for veteran business owners</p>
              </a>
              <a href="https://www.sba.gov/sba-learning-platform/boots-business" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  Boots to Business <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Free entrepreneurship training</p>
              </a>
            </div>
          </div>
        ),
      },
      {
        name: "Corporate Taxes",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Understanding business taxes is essential for any entrepreneur. Your business structure determines how you file.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">Tax Considerations by Structure</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Sole Proprietorship:</strong> Report on Schedule C of personal return</li>
                <li><strong>LLC (Single-Member):</strong> Default treated as sole proprietorship</li>
                <li><strong>LLC (Multi-Member):</strong> Default treated as partnership (Form 1065)</li>
                <li><strong>S-Corporation:</strong> Form 1120-S, income passes to personal return</li>
                <li><strong>C-Corporation:</strong> Form 1120, double taxation on dividends</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Estimated Taxes</h5>
              <p className="text-sm text-amber-700 dark:text-amber-400">Self-employment income requires quarterly estimated tax payments. Miss these and face penalties. Use IRS Form 1040-ES to calculate and pay.</p>
            </div>
            <a href="https://www.irs.gov/businesses/small-businesses-self-employed" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              IRS Small Business Resources <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
    ],
  }

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName) ? prev.filter(id => id !== sectionName) : [...prev, sectionName]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4" />
            <a className="hover:text-primary transition-colors">
              Services
            </a>
            <ChevronRight className="h-4 w-4" />
            <a href="/services/financial" className="hover:text-primary transition-colors">
              Financial
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Start a Business</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-sidebar border-r overflow-y-auto">
          <div className="top-20 p-6">
            <a href="/services/financial">
              <h2 className="text-2xl font-bold text-sidebar-foreground mb-6 pb-3 border-b-2 border-muted-foreground text-center">
                Financial Services
              </h2>
            </a>
            <div className="space-y-3">
              <a key={"finance-manager"} href={`/services/command-center/financial`} className="block">
                <Card
                  key={"finance-manager"}
                  className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        Financial Manager
                      </h3>
                    </div>
                  </div>
                </Card>
              </a>
              {serviceCategories.map((category) => {
                const Icon = category.icon
                const href = `/services/financial/${category.name.toLowerCase().replace(/\s+/g, "-")}`
                return (
                  <a key={category.name} href={href} className="block">
                    <Card
                      key={category.name}
                      className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </Card>
                  </a>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="relative z-10 p-6 lg:p-12">
            <div className="flex flex-col max-w-6xl mx-auto min-h-full space-y-8">
              {/* Title and description */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-3">{page.title}</h2>
                <p className="text-muted-foreground">
                  {intro.description}
                </p>
              </div>

              {/* Key Facts - outside of boxes, displayed as inline stats */}
              {intro?.keyFacts && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {intro.keyFacts.map((fact, idx) => {
                    const FactIcon = fact.icon
                    return (
                      <div key={idx} className="flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border shadow-sm">
                        <FactIcon className="h-6 w-6 text-primary mb-2" />
                        <span className="text-lg font-bold text-foreground">{fact.value}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{fact.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Important note - outside of boxes, styled as inline callout */}
              {intro?.importantNote && (
                <div className="flex items-start gap-3 p-1">
                  <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Good to know:</strong> {intro.importantNote}
                  </p>
                </div>
              )}

              {/* Quick helpful links - outside of boxes */}
              {intro?.helpfulLinks && (
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                  {intro.helpfulLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
                      <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                        <span>{link.label}</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </Button>
                    </a>
                  ))}
                </div>
              )}

              {/* Divider */}
              <hr className="border-muted-foreground" />

              {/* Section Cards */}
              {page.sections.map((section, idx) => {
                const isExpanded = expandedSections.includes(section.name)
                const SectionIcon = icons[section.name as keyof typeof icons]
                return (
                  <Card key={idx} className="border border overflow-hidden p-0">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.name)}
                      className="w-full flex items-start p-6 hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-full flex items-center gap-6">
                        <div className={`rounded-lg`}>
                          <SectionIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-1">{section.name}</h3>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t bg-background">
                        {section.content}
                      </div>
                    )}
                  </Card>
                )
              })}

              {/* Bottom helpful resources section - outside of main content boxes */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Every military installation has free financial counseling available. You do not need an appointment for most services, and everything is confidential. These resources are available to active duty, Guard, Reserve, and their families.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href="https://www.militaryonesource.mil/financial-legal/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <Phone className="h-4 w-4" />
                      Military OneSource (800-342-9647)
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                  <a
                    href="https://www.consumerfinance.gov/consumer-tools/military-financial-lifecycle/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <Building2 className="h-4 w-4" />
                      CFPB Military Resources
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
