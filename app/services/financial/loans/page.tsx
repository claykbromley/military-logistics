"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { DollarSign, PiggyBank, CreditCard, Home, Receipt, Building2, ExternalLink, Landmark, Heart, Scale, Phone, ChevronDown, Lightbulb, TrendingUp, Shield, ChevronRight, BriefcaseBusiness } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LoansPage() {
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
    description: "Service members have access to some of the best loan protections and products in the country. The VA home loan program alone has helped millions of veterans and service members achieve homeownership with zero down payment and no private mortgage insurance. Beyond VA loans, the Servicemembers Civil Relief Act (SCRA) caps interest rates at 6% on pre-service debt, and branch-specific relief societies offer interest-free emergency loans. Military-focused credit unions like Navy Federal and USAA consistently offer some of the most competitive rates available to any borrower.",
    keyFacts: [
      { label: "SCRA Interest Cap", value: "6% APR", icon: Shield },
      { label: "VA Loan Down Payment", value: "$0", icon: Home },
      { label: "NMCRS Loan Interest", value: "0% APR", icon: Heart },
      { label: "MLA Rate Cap", value: "36% MAPR", icon: Scale },
    ],
    importantNote: "Be cautious of predatory lenders near military installations. The Military Lending Act (MLA) protects you from certain high-cost loans, but not all predatory lending falls under its umbrella. Always check with your installation Financial Readiness office before taking out a loan from an unfamiliar lender.",
    helpfulLinks: [
      { label: "VA Home Loan Information", url: "https://www.va.gov/housing-assistance/home-loans/" },
      { label: "SCRA Information (DOJ)", url: "https://www.justice.gov/servicemembers/servicemembers-civil-relief-act-scra" },
    ],
  }

  const icons = {
    "Servicemembers Civil Relief Act (SCRA)": Shield,
    "USAA Loan Options": Landmark,
    "NFCU Loan Options": Landmark,
    "VA Home Loans": Home,
    "Navy and Marine Corps Relief Society": Heart,
  }

  const page = {
    title: "Loan and Debt Relief Benefits",
    sections: [
      {
        name: "Servicemembers Civil Relief Act (SCRA)",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              The SCRA provides important financial protections for service members, including interest rate caps and protection from certain legal actions.
            </p>
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Key SCRA Protections</h5>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                <li><strong>6% Interest Rate Cap:</strong> Debts incurred before military service can be reduced to 6% APR</li>
                <li><strong>Lease Termination:</strong> Can terminate residential and vehicle leases due to PCS or deployment</li>
                <li><strong>Foreclosure Protection:</strong> Protection from foreclosure during service and 12 months after</li>
                <li><strong>Default Judgments:</strong> Courts must appoint an attorney before entering judgment against service members</li>
                <li><strong>Stay of Proceedings:</strong> Can request court proceedings be delayed during military service</li>
              </ul>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">How to Request SCRA Benefits</h5>
              <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                <li>Obtain a copy of your military orders</li>
                <li>Write a letter to your creditor requesting SCRA benefits</li>
                <li>Include copies of orders showing active duty dates</li>
                <li>Send via certified mail with return receipt</li>
                <li>Keep copies of all correspondence</li>
              </ol>
            </div>
            <a href="https://www.justice.gov/servicemembers/servicemembers-civil-relief-act-scra" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              SCRA Information (DOJ) <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "USAA Loan Options",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              USAA offers a variety of loan products specifically designed for military members and their families, often with competitive rates and military-friendly terms.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Personal Loans</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Competitive rates for members</li>
                  <li>No collateral required</li>
                  <li>Flexible repayment terms</li>
                  <li>Quick approval process</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Auto Loans</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>New and used vehicle financing</li>
                  <li>Refinancing options</li>
                  <li>Car buying service</li>
                  <li>GAP coverage available</li>
                </ul>
              </div>
            </div>
<a href="https://www.usaa.com/banking/loans/auto/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
  USAA Loans <ExternalLink className="h-4 w-4" />
  </a>
          </div>
        ),
      },
      {
        name: "NFCU Loan Options",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Navy Federal Credit Union is the largest credit union in the world and offers excellent loan products for military members, veterans, and their families.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Loan Products</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Personal loans up to $50,000</li>
                  <li>Auto loans with competitive rates</li>
                  <li>Home equity loans and HELOCs</li>
                  <li>Student loan refinancing</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Member Benefits</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Military pay advance available</li>
                  <li>Deployment assistance programs</li>
                  <li>Free financial counseling</li>
                  <li>No PMI on many mortgages</li>
                </ul>
              </div>
            </div>
            <a href="https://www.navyfederal.org/loans-cards.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              Navy Federal Loans <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "VA Home Loans",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              VA home loans are one of the most valuable benefits available to service members, offering significant advantages over conventional mortgages.
            </p>
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">VA Loan Benefits</h5>
              <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                <li>No down payment required (in most cases)</li>
                <li>No private mortgage insurance (PMI)</li>
                <li>Competitive interest rates</li>
                <li>Limited closing costs</li>
                <li>No prepayment penalties</li>
                <li>Easier qualification standards</li>
              </ul>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">VA Loan Types</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Purchase Loan:</strong> Buy a home with no down payment</li>
                <li><strong>Cash-Out Refinance:</strong> Refinance and take cash from equity</li>
                <li><strong>IRRRL:</strong> Interest Rate Reduction Refinance Loan</li>
                <li><strong>Native American Direct Loan:</strong> For eligible Native American veterans</li>
              </ul>
            </div>
            <a href="https://www.va.gov/housing-assistance/home-loans/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              VA Home Loans <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Navy and Marine Corps Relief Society",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              The Navy-Marine Corps Relief Society (NMCRS) provides interest-free loans and grants to eligible Sailors and Marines facing financial hardship.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">Available Assistance</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Emergency travel (funeral, family emergency)</li>
                <li>Basic living expenses (rent, utilities, food)</li>
                <li>Medical and dental expenses</li>
                <li>Vehicle repairs</li>
                <li>Disaster relief</li>
                <li>Education assistance</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Key Features</h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">NMCRS loans are interest-free and repayment terms are flexible based on your situation. Grants may also be available for those in extreme need.</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Other branch-specific relief societies:</p>
              <div className="flex flex-wrap gap-2">
                <a href="https://www.nmcrs.org" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">NMCRS</a>
                <span className="text-slate-400">|</span>
                <a href="https://www.aerhq.org" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Army Emergency Relief</a>
                <span className="text-slate-400">|</span>
                <a href="https://www.afas.org" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Air Force Aid Society</a>
                <span className="text-slate-400">|</span>
                <a href="https://www.cgmahq.org" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Coast Guard Mutual Assistance</a>
              </div>
            </div>
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
            <span className="text-foreground font-medium">Loans</span>
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
