"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ChevronRight, ChevronDown, CreditCard, Scale, Tag, AlertCircle, Map, CheckCircle, BadgeCheck, PiggyBank, Home, Heart, Wallet, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const serviceCategories = [
  { name: "Driver's License", icon: FileText, id: "drivers-license" },
  { name: "Buying/Selling a Car", icon: Car, id: "buying-selling" },
  { name: "Vehicle Maintenance", icon: Wrench, id: "maintenance" },
  { name: "PCS & Vehicle Shipping", icon: Plane, id: "shipping" },
  { name: "Deployment & Storage", icon: Package, id: "deployment" },
  { name: "Car Insurance", icon: Shield, id: "insurance" },
  { name: "Registrations / ID", icon: CreditCard, id: "registration" },
  { name: "Legal Protections", icon: Scale, id: "legal" },
  { name: "Military Discounts", icon: Tag, id: "discounts" },
  { name: "Emergency & Roadside", icon: AlertCircle, id: "emergency" },
]

export default function InsurancePage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([""])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
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
            <a href="/services/automotive" className="hover:text-primary transition-colors">
              Automotive
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Car Insurance</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-100 border-r">
          <div className="top-20 p-6">
            <a href="/services/automotive">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-300 text-center">
                Automotive Services
              </h2>
            </a>
            <div className="space-y-3">
              {serviceCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card
                    key={category.name}
                    className="p-4 hover:shadow-md transition-all cursor-pointer bg-white border-2 hover:border-primary group"
                  >
                    <a key={category.name} href={`/services/automotive/${category.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </a>
                  </Card>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="relative z-10 p-6 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Car Insurance for Military Members</h2>
                <p className="text-slate-600 mb-6">
                  Navigate auto insurance changes with every PCS, deployment, and life update. Learn how to save money 
                  during deployment and find the best military-friendly insurance providers.
                </p>
              </div>

              {/* Best Military Insurers */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("best-insurers")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BadgeCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Best Insurance Providers for Military</h3>
                    <p className="text-sm text-slate-600">USAA, GEICO Military, Navy Federal, and more</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("best-insurers") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("best-insurers") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <a href="https://www.usaa.com/inet/wc/auto-insurance" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          USAA
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Up to <strong>60% discount</strong> on stored vehicles during deployment</li>
                          <li>Exclusive to military members and families</li>
                          <li>Highly rated customer service</li>
                          <li>Deployment and PCS-specific coverage options</li>
                        </ul>
                      </a>
                      <a href="https://www.geico.com/information/military/" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          GEICO Military
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li><strong>Military Storage Protection</strong> - suspend/reduce coverage for 30+ days</li>
                          <li>Up to 15% military discount</li>
                          <li>Emergency deployment coverage</li>
                          <li>Overseas coverage options</li>
                        </ul>
                      </a>
                      <a href="https://www.navyfederal.org/loans-cards/auto-loans.html" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          Navy Federal Credit Union
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Competitive rates through partner insurers</li>
                          <li>Bundle discounts with auto loans</li>
                          <li>Member-exclusive benefits</li>
                        </ul>
                      </a>
                      <a href="https://www.aafmaa.com/insurance/auto-insurance" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          AAFMAA
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Military-exclusive organization</li>
                          <li>Competitive rates for service members</li>
                          <li>Bundled insurance options</li>
                        </ul>
                      </a>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Pro Tip:</h5>
                      <p className="text-blue-700 text-sm">
                        Always get quotes from multiple providers. USAA is often the cheapest for military, but GEICO 
                        and Progressive sometimes beat them depending on your situation.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Storage/Deployment Insurance */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("storage-deployment-insurance")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <PiggyBank className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Save Money During Deployment</h3>
                    <p className="text-sm text-slate-600">Storage insurance and coverage adjustments</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("storage-deployment-insurance") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("storage-deployment-insurance") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-green-800 mb-2">Potential Savings: 30-70% on Premiums</h5>
                      <p className="text-green-700 text-sm">
                        Many service members save significantly during deployment by adjusting their coverage.
                      </p>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">What You Can Adjust:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Switch to comprehensive-only coverage</strong> - covers theft, fire, hail, vandalism while stored</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Remove liability and collision</strong> - not needed if car won't be driven</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Drop roadside assistance</strong> - unnecessary during storage</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Reduce annual mileage estimate</strong> - even if family drives occasionally</span>
                      </li>
                    </ul>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 mb-2">Important Warnings:</h5>
                      <ul className="space-y-1 text-sm text-red-700">
                        <li><strong>Never fully cancel insurance</strong> unless your state allows it AND vehicle is non-operational</li>
                        <li><strong>Check with your lender</strong> - if you have a loan/lease, minimum coverage is required</li>
                        <li><strong>Check state laws</strong> - some states require minimum liability even for stored vehicles</li>
                      </ul>
                    </div>
                  </div>
                )}
              </Card>

              {/* Homeowner/Renters Insurance */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("home-insurance")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Homeowner/Renters Insurance During Deployment</h3>
                    <p className="text-sm text-slate-600">Protecting your home while you're away</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("home-insurance") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("home-insurance") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-amber-800 mb-2">Vacancy Warning (60-Day Rule)</h5>
                      <p className="text-amber-700 text-sm">
                        Standard homeowners policies often <strong>do not cover damage</strong> if a home is vacant for an 
                        extended period (commonly 60 days). Discuss "vacancy endorsement" with your agent.
                      </p>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">Steps to Take:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Notify your insurer</strong> about deployment and vacancy duration</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Request vacancy endorsement</strong> for extended absence coverage</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Consider a house sitter</strong> - having someone check regularly prevents voided claims</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Maintain personal property coverage</strong> - but note most policies exclude war zone coverage</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Life Insurance (SGLI) */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("life-insurance")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Life Insurance (SGLI)</h3>
                    <p className="text-sm text-slate-600">Servicemembers' Group Life Insurance and supplemental options</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("life-insurance") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("life-insurance") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-blue-800 mb-2">SGLI Coverage (Current as of 2026)</h5>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li><strong>Maximum Coverage:</strong> $500,000 (in $50,000 increments)</li>
                        <li><strong>Premium:</strong> $0.06 per $1,000 = $30/month for full $500,000</li>
                        <li><strong>TSGLI (Traumatic Injury):</strong> Additional $1/month</li>
                      </ul>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">What You Should Do:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Evaluate your needs</strong> - use a needs calculator to determine if supplemental insurance is required</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Review war clause exclusions</strong> - commercial policies may not cover combat zones</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Update beneficiaries</strong> - ensure they're current before deployment</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Update your will</strong> - free legal assistance at JAG office</span>
                      </li>
                    </ul>
                    <a 
                      href="https://www.va.gov/life-insurance/options-eligibility/sgli/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      VA SGLI Information Page
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </Card>

              {/* Other Financial Tips */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("financial-tips")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Other Financial Tips for Deployment</h3>
                    <p className="text-sm text-slate-600">SDP, SCRA benefits, and automatic payments</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("financial-tips") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("financial-tips") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2">Savings Deposit Program (SDP)</h5>
                        <ul className="space-y-1 text-sm text-green-700">
                          <li><strong>10% guaranteed annual interest</strong></li>
                          <li>Up to $10,000 while in combat zone</li>
                          <li>Best risk-free return available</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-2">SCRA Benefits</h5>
                        <ul className="space-y-1 text-sm text-blue-700">
                          <li><strong>6% interest rate cap</strong> on pre-service debts</li>
                          <li>Break leases/contracts without penalty</li>
                          <li>Protection from foreclosure</li>
                        </ul>
                      </div>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">Before You Deploy:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Set up automatic payments</strong> - avoid missed payments and credit score damage</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Establish a Power of Attorney</strong> - allows spouse/family to manage finances</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Review all subscriptions</strong> - cancel or pause unnecessary services</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Quick Tools */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Resources</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <a href="https://www.usaa.com/inet/wc/auto-insurance" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Shield className="h-5 w-5" />
                      <span>USAA Auto Insurance</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.geico.com/information/military/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Shield className="h-5 w-5" />
                      <span>GEICO Military</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.va.gov/life-insurance/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Heart className="h-5 w-5" />
                      <span>VA Life Insurance Options</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.militaryonesource.mil/financial-legal/personal-finance/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Wallet className="h-5 w-5" />
                      <span>Military OneSource Financial Resources</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
