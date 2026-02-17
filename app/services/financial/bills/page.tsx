"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { DollarSign, PiggyBank, CreditCard, Home, Receipt, Building2, ExternalLink, Wallet, Landmark, ShieldCheck, BadgeCheck, Clock, Phone, ChevronDown, Lightbulb, TrendingUp, Shield, ChevronRight, BriefcaseBusiness, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BillsPage() {
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
    description: "Managing bills effectively is the foundation of financial stability, especially for military families dealing with deployments, PCS moves, and irregular schedules. Automating as much as possible ensures nothing falls through the cracks when you are in the field or deployed with limited connectivity. Beyond just paying bills, understanding budgeting strategies and building an emergency fund protects your family from unexpected expenses. Every service member should have at least 3 to 6 months of expenses saved before deployment, and free budgeting tools like YNAB (free for active duty) can help you get there.",
    keyFacts: [
      { label: "Emergency Fund Goal", value: "3-6 Months", icon: Wallet },
      { label: "YNAB for Military", value: "Free", icon: BadgeCheck },
      { label: "myPay Allotments", value: "Unlimited", icon: DollarSign },
      { label: "Base Financial Counseling", value: "Free", icon: Phone },
    ],
    importantNote: "Before any deployment, pay all bills one month ahead as a buffer. Set up autopay for everything and ensure your spouse or trusted POA holder has access to all accounts. Leave a binder or document with all account information, login details, and customer service numbers.",
    helpfulLinks: [
      { label: "myPay (DFAS)", url: "https://mypay.dfas.mil/" },
      { label: "Military OneSource Financial Help", url: "https://www.militaryonesource.mil/financial-legal/personal-finance/managing-your-money/" },
    ],
  }

  const icons = {
    "Automated Bill Pay Setup": Clock,
    "Budgeting Tools": DollarSign,
    "Emergency Funds": Wallet,
    "Debt Payoff Strategies": TrendingUp,
    "Military Pay & Allowances": Landmark,
    "Insurance for Military Families": ShieldCheck
  }

  const page = {
    title: "Manage Bills",
    sections: [
      {
        name: "Automated Bill Pay Setup",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Automating your bills ensures payments are never missed, especially during deployments or field exercises. Here is how to set up a bulletproof system.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">Automation Strategies</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Direct Debit:</strong> Allow creditors to automatically withdraw payments</li>
                <li><strong>Bank Bill Pay:</strong> Schedule payments through your bank</li>
                <li><strong>Military Allotments:</strong> Set up automatic deductions from pay through myPay</li>
                <li><strong>Credit Card Autopay:</strong> Link bills to credit cards, then autopay the card</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Deployment Tip</h5>
              <p className="text-sm text-green-700 dark:text-green-400">Before deployment, pay one month ahead on all bills. This gives a buffer if any automation fails while you have limited communication access.</p>
            </div>
            <a href="https://mypay.dfas.mil/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              myPay Allotments <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Budgeting Tools",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              A solid budget is the foundation of financial success. These tools can help military families manage their money effectively.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Free Budgeting Apps</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>YNAB:</strong> Free for active duty military</li>
                  <li><strong>Mint:</strong> Free budget tracking and alerts</li>
                  <li><strong>EveryDollar:</strong> Simple zero-based budgeting</li>
                  <li><strong>Personal Capital:</strong> Free net worth tracking</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Military-Specific Resources</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Personal Financial Counselors (free on base)</li>
                  <li>Military OneSource financial coaching</li>
                  <li>Command Financial Specialist</li>
                  <li>Fleet and Family Support Centers</li>
                </ul>
              </div>
            </div>
            <a href="https://www.militaryonesource.mil/financial-legal/personal-finance/managing-your-money/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline mt-4">
              MilitaryOneSource Financial Help <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Emergency Funds",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              An emergency fund is your financial safety net. Military families should aim for 3-6 months of expenses saved in an easily accessible account.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">Building Your Emergency Fund</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Start Small:</strong> Begin with $1,000 as a starter emergency fund</li>
                <li><strong>Build to 3-6 Months:</strong> Cover rent, utilities, food, insurance, minimum payments</li>
                <li><strong>Keep It Accessible:</strong> High-yield savings account, not investments</li>
                <li><strong>{"Don't"} Touch It:</strong> Only for true emergencies, not planned expenses</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">High-Yield Savings Options</h5>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <li>Navy Federal: Competitive rates for members</li>
                <li>USAA: Performance First Savings</li>
                <li>Ally Bank: No minimums, good rates</li>
                <li>Marcus by Goldman Sachs: High APY</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        name: "Debt Payoff Strategies",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Getting out of debt frees up money for savings and investments. Choose a strategy that works for your personality and stick with it.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Debt Snowball</h5>
                <p className="text-sm text-muted-foreground mb-2">Pay minimums on all debts, throw extra at the smallest balance first.</p>
                <p className="text-xs text-slate-500"><strong>Best for:</strong> People who need quick wins for motivation</p>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Debt Avalanche</h5>
                <p className="text-sm text-muted-foreground mb-2">Pay minimums on all debts, throw extra at the highest interest rate first.</p>
                <p className="text-xs text-slate-500"><strong>Best for:</strong> Saving the most money in interest</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4 mt-4">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Military Advantage: SCRA</h5>
              <p className="text-sm text-green-700 dark:text-green-400">Request SCRA rate reductions on pre-service debt to 6%. This can accelerate your payoff significantly on high-interest credit cards.</p>
            </div>
          </div>
        ),
      },
      {
        name: "Military Pay & Allowances",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Understanding your military compensation is the first step to managing your bills effectively. Your total military pay consists of base pay plus several allowances and special pays, many of which are not taxable.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Taxable Pay</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Base Pay:</strong> Determined by rank and time in service</li>
                  <li><strong>Special Pays:</strong> Hazardous duty, flight pay, dive pay, etc.</li>
                  <li><strong>Incentive Pays:</strong> Reenlistment bonuses, special skills</li>
                  <li><strong>Retired Pay:</strong> Taxable as ordinary income</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Tax-Free Allowances</h5>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                  <li><strong>BAH:</strong> Basic Allowance for Housing (based on location, rank, dependents)</li>
                  <li><strong>BAS:</strong> Basic Allowance for Subsistence ($460.25 enlisted / $316.98 officers in 2026)</li>
                  <li><strong>COLA:</strong> Cost of Living Allowance (OCONUS)</li>
                  <li><strong>FSA:</strong> Family Separation Allowance ($250/month when deployed)</li>
                  <li><strong>Combat Zone Pay:</strong> All pay earned in designated combat zones (enlisted)</li>
                </ul>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border mt-4">
              <h5 className="font-semibold text-foreground mb-2">Understanding Your LES</h5>
              <p className="text-sm text-muted-foreground mb-2">Your Leave and Earnings Statement (LES) is your military paycheck stub. Key sections to understand:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Entitlements:</strong> Everything you earn (base pay + allowances + special pays)</li>
                <li><strong>Deductions:</strong> Taxes, SGLI, TSP contributions, allotments</li>
                <li><strong>Allotments:</strong> Voluntary deductions you set up (savings, car payment, etc.)</li>
                <li><strong>Net Pay:</strong> What actually hits your bank account</li>
              </ul>
            </div>
            <a href="https://mypay.dfas.mil/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              View Your LES on myPay <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Insurance for Military Families",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              While the military provides TRICARE health coverage, there are other insurance needs that military families should address. Life insurance, renters insurance, and auto insurance are essential for financial protection.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">SGLI (Servicemembers Group Life Insurance)</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Coverage:</strong> Up to $500,000</li>
                  <li><strong>Cost:</strong> $25/month for $500,000 (very affordable)</li>
                  <li><strong>FSGLI:</strong> Spouse coverage up to $100,000</li>
                  <li><strong>TSGLI:</strong> Traumatic injury coverage ($25,000-$100,000)</li>
                  <li><strong>Conversion:</strong> Convert to VGLI within 240 days of separation</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Other Essential Insurance</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Renters Insurance:</strong> Protects personal property in base housing or rentals ($10-20/month)</li>
                  <li><strong>Auto Insurance:</strong> USAA and Navy Federal typically offer the best military rates</li>
                  <li><strong>Umbrella Policy:</strong> Extra liability protection ($150-300/year)</li>
                  <li><strong>Private Life Insurance:</strong> Consider supplementing SGLI if you have significant debts or many dependents</li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">PCS Insurance Tip</h5>
              <p className="text-sm text-amber-700 dark:text-amber-400">When PCSing to a new state, shop auto insurance rates immediately. Rates vary dramatically by state. USAA and Navy Federal both allow you to update your location before you move to ensure seamless coverage.</p>
            </div>
            <a href="https://www.va.gov/life-insurance/options-eligibility/sgli/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              VA SGLI Information <ExternalLink className="h-4 w-4" />
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
            <span className="text-foreground font-medium">Bills</span>
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
