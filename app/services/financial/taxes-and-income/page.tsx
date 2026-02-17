"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { DollarSign, PiggyBank, CreditCard, Home, Receipt, Building2, ExternalLink, FileText, BadgeCheck, Clock, MapPin, HeartHandshake, Phone, ChevronDown, Lightbulb, TrendingUp, Shield, ChevronRight, BriefcaseBusiness } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TaxesPage() {
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
    description: "Military tax situations are uniquely complex. Service members may have income from multiple states, tax-free combat zone pay, and allowances that are not considered taxable income. The good news is that several free tax preparation services exist specifically for the military community. Understanding your tax benefits can save you thousands of dollars each year. Basic Allowance for Housing (BAH) and Basic Allowance for Subsistence (BAS) are not taxable, and combat zone pay is tax-exempt for enlisted members. Officers receive a partial exclusion up to the highest enlisted pay rate plus imminent danger pay.",
    keyFacts: [
      { label: "BAH/BAS Tax Status", value: "Tax-Free", icon: BadgeCheck },
      { label: "Combat Zone Filing Extension", value: "180 Days", icon: Clock },
      { label: "MilTax State Returns", value: "Up to 3 Free", icon: FileText },
      { label: "CZTE Enlisted Benefit", value: "100% Exempt", icon: Shield },
    ],
    importantNote: "If you PCS to a new state, you may need to file taxes in multiple states. Under the Military Spouses Residency Relief Act (MSRRA), your spouse can keep their tax domicile in your state of legal residence even when living in a different state due to military orders.",
    helpfulLinks: [
      { label: "MilTax Free Filing", url: "https://www.militaryonesource.mil/financial-legal/tax-resource-center/miltax-military-tax-services/" },
      { label: "IRS Military Tax Center", url: "https://www.irs.gov/individuals/military" },
    ],
  }

  const icons = {
    "Free Tax Filing through MilTax": FileText,
    "Free Tax Filing through TurboTax": FileText,
    "Income Calculator": DollarSign,
    "Tax Breaks": Receipt,
    "State Tax Guide": MapPin,
    "VITA (Volunteer Income Tax Assistance)": HeartHandshake,
  }

  const page = {
    title: "Tax and Income Services",
    sections: [
      {
        name: "Free Tax Filing through MilTax",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              MilTax is a suite of free tax services for the military community, including personalized support from tax consultants, easy-to-use tax preparation and e-filing software, and financial resources.
            </p>
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Who Qualifies</h5>
              <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                <li>Active duty service members</li>
                <li>National Guard and Reserve members</li>
                <li>Veterans (within one year of separation)</li>
                <li>Eligible family members</li>
              </ul>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">MilTax Features</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Free federal and up to 3 state returns</li>
                <li>Handles multiple states (common with PCS moves)</li>
                <li>Understands military-specific tax situations</li>
                <li>Live support from military tax experts</li>
                <li>Available 24/7 during filing season</li>
              </ul>
            </div>
            <a href="https://www.militaryonesource.mil/financial-legal/tax-resource-center/miltax-military-tax-services/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              Access MilTax <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Free Tax Filing through TurboTax",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              TurboTax offers free federal and state tax filing for active duty military members (E-1 to E-9) through its TurboTax Military discount program.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">TurboTax Military Benefits</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Free federal filing for enlisted active duty</li>
                <li>Free state filing included</li>
                <li>Discounts for officers and veterans</li>
                <li>Handles complex military tax situations</li>
                <li>Combat pay and deployment income guidance</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Important Note</h5>
              <p className="text-sm text-amber-700 dark:text-amber-400">Access the military discount through the official TurboTax Military landing page - starting from the regular TurboTax site may result in charges.</p>
            </div>
            <a href="https://turbotax.intuit.com/personal-taxes/online/military-edition.jsp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              TurboTax Military <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Income Calculator",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Understanding your total military compensation requires calculating base pay, allowances, and special pays. Use these official calculators to determine your full compensation package.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <a href="https://militarypay.defense.gov/calculators/" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  Military Pay Calculator <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Official DoD pay calculator</p>
              </a>
              <a href="https://militarypay.defense.gov/calculators/rmc-calculator/" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  RMC Calculator <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Regular Military Compensation</p>
              </a>
              <a href="https://www.defensetravel.dod.mil/site/bahCalc.cfm" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  BAH Calculator <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Basic Allowance for Housing rates</p>
              </a>
              <a href="https://www.dfas.mil/militarymembers/payentitlements/Pay-Tables/" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  2026 Pay Tables <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Current military pay charts</p>
              </a>
            </div>
          </div>
        ),
      },
      {
        name: "Tax Breaks",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Military members have access to several unique tax benefits. Understanding these can significantly reduce your tax burden.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-3">Military Tax Benefits</h5>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <strong>Combat Zone Tax Exclusion (CZTE):</strong> All military pay earned in a designated combat zone is tax-free for enlisted members. Officers have a monthly cap equal to the highest enlisted pay plus imminent danger/hostile fire pay.
                </li>
                <li>
                  <strong>BAH & BAS:</strong> Basic Allowance for Housing and Basic Allowance for Subsistence are not taxable income.
                </li>
                <li>
                  <strong>Moving Expenses:</strong> Military PCS moves may qualify for tax-free reimbursement of moving expenses.
                </li>
                <li>
                  <strong>State Tax Exemptions:</strong> Many states exempt military pay from state income tax. Some states allow you to maintain residency in a tax-free state.
                </li>
                <li>
                  <strong>Deadline Extensions:</strong> Service members in combat zones get automatic extensions for filing and paying taxes.
                </li>
              </ul>
            </div>
            <a href="https://www.irs.gov/individuals/military" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              IRS Military Tax Information <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "State Tax Guide",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              State taxes are a unique challenge for military families due to frequent PCS moves across state lines. The MSRRA and SCRA provide protections, but understanding each state{"'"}s rules helps you make the best decisions about your state of legal residence (SLR).
            </p>
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">States with No Income Tax</h5>
              <p className="text-sm text-green-700 dark:text-green-400 mb-2">These states do not tax military pay, making them popular choices for SLR:</p>
              <div className="flex flex-wrap gap-2">
                {["Alaska", "Florida", "Nevada", "New Hampshire", "South Dakota", "Tennessee", "Texas", "Washington", "Wyoming"].map((state) => (
                  <span key={state} className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs rounded font-medium">{state}</span>
                ))}
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">MSRRA (Military Spouses Residency Relief Act)</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Allows military spouses to keep the same SLR as the service member</li>
                <li>Spouses are only taxed by their SLR, not the state where they live or work</li>
                <li>Updated in 2018 -- spouses can also choose their own home state of record</li>
                <li>Must file appropriate state forms to claim this exemption</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Changing Your SLR</h5>
              <p className="text-sm text-amber-700 dark:text-amber-400">Changing your SLR requires genuine intent (driver{"'"}s license, voter registration, vehicle registration in the new state). Do not change SLR solely for tax reasons without establishing genuine ties -- it can be challenged. Consult your installation tax center or legal assistance office.</p>
            </div>
            <a href="https://www.militaryonesource.mil/financial-legal/tax-resource-center/state-tax-information/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              MilitaryOneSource State Tax Guide <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "VITA (Volunteer Income Tax Assistance)",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              VITA provides free tax preparation at military installations worldwide. Staffed by trained volunteers, VITA centers help service members file accurate returns, especially those with military-specific tax situations like multi-state filing or combat zone exclusions.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">VITA Center Details</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Locations:</strong> Available at most military installations, typically in the Legal Assistance or Tax Center offices</li>
                <li><strong>Season:</strong> Open January through mid-April (some operate year-round)</li>
                <li><strong>Services:</strong> Federal and state tax preparation, e-filing, multi-state returns</li>
                <li><strong>Eligibility:</strong> Active duty, retirees, reservists, and dependents</li>
                <li><strong>Walk-in/Appointment:</strong> Varies by location, check your installation website</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">What to Bring</h5>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <li>Military ID and SSN for you and all dependents</li>
                <li>All W-2s, 1099s, and income documents</li>
                <li>Prior year tax return</li>
                <li>Bank account and routing numbers for direct deposit</li>
                <li>State(s) of legal residence documentation</li>
              </ul>
            </div>
            <a href="https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              Find a VITA Location <ExternalLink className="h-4 w-4" />
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
            <span className="text-foreground font-medium">Taxes and Income</span>
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
