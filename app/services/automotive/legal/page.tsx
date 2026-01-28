"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ChevronRight, ChevronDown, CreditCard, BookOpen, Download, ClipboardList, Scale, Tag, AlertCircle, Map, CheckCircle, Gavel, Percent, Ban, ShieldCheck, Globe, FileSignature, CarFront, Lock, ExternalLink } from "lucide-react"
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

export default function LegalPage() {
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
            <span className="text-foreground font-medium">Legal Protections</span>
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
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Legal Protections for Military Members</h2>
                <p className="text-slate-600 mb-6">
                  Understand your rights under the Servicemembers Civil Relief Act (SCRA) and Military Lending Act (MLA), 
                  including interest rate caps, repossession protections, and lease termination rights.
                </p>
              </div>

              {/* SCRA Overview */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("scra-overview")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Gavel className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Servicemembers Civil Relief Act (SCRA)</h3>
                    <p className="text-sm text-slate-600">Comprehensive legal protections for active-duty service members</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("scra-overview") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("scra-overview") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      The SCRA provides a wide range of protections for service members entering active duty, including 
                      protections related to rental agreements, security deposits, prepaid rent, eviction, installment 
                      contracts, credit card interest rates, mortgage interest rates, mortgage foreclosure, civil judicial 
                      proceedings, automobile leases, life insurance, health insurance, and income tax payments.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Who Qualifies:</h5>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li>Active-duty service members (Army, Navy, Air Force, Marine Corps, Space Force, Coast Guard)</li>
                        <li>National Guard and Reserve members on federal active duty orders for 30+ consecutive days</li>
                        <li>Commissioned officers of NOAA and Public Health Service</li>
                      </ul>
                    </div>
                    <a 
                      href="https://www.consumerfinance.gov/consumer-tools/military-financial-lifecycle/the-servicemembers-civil-relief-act-scra" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      CFPB SCRA Information Page
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </Card>

              {/* SCRA 6% Interest Rate Cap */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("scra-interest-cap")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Percent className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">SCRA 6% Interest Rate Cap</h3>
                    <p className="text-sm text-slate-600">Reduce interest on pre-service debts to 6% APR</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("scra-interest-cap") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("scra-interest-cap") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-green-800 mb-2">Key Benefit: 6% Maximum Interest Rate</h5>
                      <p className="text-green-700 text-sm">
                        Interest rates on debts incurred <strong>before</strong> entering active duty are capped at 
                        <strong> 6% per year</strong>. This applies to car loans, credit cards, mortgages, and other 
                        consumer debts.
                      </p>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">What's Covered:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Auto loans</strong> taken out before active duty</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Credit card debt</strong> accumulated before service</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Mortgages</strong> obtained before active duty</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Student loans</strong> (both federal and private)</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">How to Apply:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Submit a written request to each creditor</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Include a copy of your military orders</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Request must be made within 180 days after end of military service</span>
                      </li>
                    </ul>
                    <a 
                      href="https://www.justice.gov/servicemembers/your-rights-servicemember-6-interest-rate-cap-servicemembers-pre-service-debts" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      DOJ SCRA Interest Rate Cap Information
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </Card>

              {/* SCRA Repossession Protection */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("scra-repossession")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Ban className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Vehicle Repossession Protection</h3>
                    <p className="text-sm text-slate-600">No repossession without a court order</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("scra-repossession") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("scra-repossession") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-red-800 mb-2">Critical Protection</h5>
                      <p className="text-red-700 text-sm">
                        A lender <strong>cannot repossess your vehicle</strong> without first obtaining a court order 
                        if you took out the loan before entering active duty.
                      </p>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">What This Means:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Creditors must go through the court system before repossessing</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Courts may delay proceedings or adjust payment terms</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Protection extends for 9 months after end of active duty</span>
                      </li>
                    </ul>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 mb-2">Important Note:</h5>
                      <p className="text-amber-700 text-sm">
                        This protection applies to loans obtained <strong>before</strong> active duty. Loans taken out 
                        during active duty have different protections. Always communicate with your lender if you're 
                        having difficulty making payments.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Lease Termination */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("lease-termination")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileSignature className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Vehicle Lease Termination Rights</h3>
                    <p className="text-sm text-slate-600">Terminate auto leases early for PCS or deployment</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("lease-termination") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("lease-termination") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      The SCRA allows you to terminate a motor vehicle lease <strong>without penalty</strong> if you 
                      receive military orders for a PCS lasting 180 days or more, or orders to deploy with a unit for 
                      180 days or more.
                    </p>
                    <h5 className="font-semibold text-slate-900 mb-3">Qualifying Events:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>PCS orders for 180+ days</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Deployment orders with a military unit for 180+ days</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>OCONUS (overseas) orders</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">How to Terminate:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Provide written notice to the lessor</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Include a copy of your military orders</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Return the vehicle within 15 days of notice</span>
                      </li>
                    </ul>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">No Early Termination Fees!</h5>
                      <p className="text-green-700 text-sm">
                        You are <strong>not responsible</strong> for early termination charges, and any prepaid lease 
                        amounts must be refunded within 30 days.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Military Lending Act */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("mla-protections")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ShieldCheck className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Military Lending Act (MLA)</h3>
                    <p className="text-sm text-slate-600">36% APR cap and predatory lending protection</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("mla-protections") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("mla-protections") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      The MLA protects active-duty service members and their dependents from predatory lending practices 
                      by capping the Military Annual Percentage Rate (MAPR) at <strong>36%</strong> for most consumer credit products.
                    </p>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-purple-800 mb-2">Key MLA Protections:</h5>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3 text-purple-700">
                          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span><strong>36% APR cap</strong> including fees (MAPR)</span>
                        </li>
                        <li className="flex items-start gap-3 text-purple-700">
                          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span><strong>No prepayment penalties</strong></span>
                        </li>
                        <li className="flex items-start gap-3 text-purple-700">
                          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span><strong>No mandatory arbitration</strong> - you can take disputes to court</span>
                        </li>
                        <li className="flex items-start gap-3 text-purple-700">
                          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span><strong>No mandatory allotment</strong> - can't require military pay allotment</span>
                        </li>
                        <li className="flex items-start gap-3 text-purple-700">
                          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span><strong>Mandatory disclosures</strong> - lenders must provide written MLA disclosures</span>
                        </li>
                      </ul>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">What Loans Are Covered:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CarFront className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Payday loans</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CarFront className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Vehicle title loans</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CarFront className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Tax refund anticipation loans</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CarFront className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Most other consumer loans (as of 2016 expansion)</span>
                      </li>
                    </ul>
                    <a 
                      href="https://www.consumerfinance.gov/consumer-tools/military-financial-lifecycle/military-lending-act-mla" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      CFPB Military Lending Act Information
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </Card>

              {/* Theft & Vandalism Protection */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("theft-vandalism-legal")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Lock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Protect Your Car from Theft & Vandalism</h3>
                    <p className="text-sm text-slate-600">Security measures during deployment</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("theft-vandalism-legal") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("theft-vandalism-legal") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-amber-800 mb-2">Warning</h5>
                      <p className="text-amber-700 text-sm">
                        Deployed service members are frequent targets for theft, especially near large bases. 
                        Take precautions before you leave.
                      </p>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">Security Tips:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Store in a gated or secured location</strong> when possible</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Install a steering wheel lock</strong> (e.g., The Club) as visible deterrent</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Remove all valuables</strong> from the vehicle</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Etch or mark VIN</strong> on windows if possible</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Never post deployment dates publicly</strong> on social media</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Give a trusted friend POA</strong> to check your vehicle periodically</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Disconnect the battery</strong> to prevent electronic break-ins</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Install a GPS tracker</strong> (AirTag, Tile, or dedicated device)</span>
                      </li>
                    </ul>
                    <a 
                      href="https://www.nhtsa.gov/vehicle-safety/vehicle-theft-prevention" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      NHTSA Vehicle Theft Prevention Guide
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </Card>

              {/* Multistate and PCS Rules */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("multistate-pcs")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Map className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Multistate & PCS Insurance Rules</h3>
                    <p className="text-sm text-slate-600">How changing duty locations affects your coverage</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("multistate-pcs") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("multistate-pcs") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">When You PCS:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Notify your insurer immediately</strong> - rates vary significantly by state</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Update your address</strong> - even if you keep home-state registration</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Review coverage requirements</strong> - minimum liability varies by state</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Consider uninsured motorist coverage</strong> - rates differ by location</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">Accident Reporting:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span><strong>On-base accidents:</strong> Report to Military Police and your insurance</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Off-base accidents:</strong> Report to local police and your insurance</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Always document:</strong> Photos, witness info, police report number</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* How to Apply Benefits */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("apply-benefits")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">How to Apply for SCRA Benefits</h3>
                    <p className="text-sm text-slate-600">Step-by-step guide to invoke your protections</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("apply-benefits") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("apply-benefits") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">Step 1: Gather Documentation</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Copy of your military orders</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>LES (Leave and Earnings Statement)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Account numbers for all debts</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">Step 2: Send Written Requests</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Send certified mail with return receipt requested</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Include copy of orders with each letter</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Keep copies of everything you send</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">Step 3: Follow Up</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Creditors must respond within 30 days</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Verify interest rate reduction on next statement</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>If denied, contact JAG for assistance</span>
                      </li>
                    </ul>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Free Legal Help:</h5>
                      <p className="text-blue-700 text-sm">
                        Your installation's Legal Assistance Office (JAG) can help you draft letters and enforce 
                        your SCRA rights at no cost.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Quick Tools */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Templates & Quick Resources</h3>
          <div className="grid gap-4 md:grid-cols-2">
          <a href="https://files.consumerfinance.gov/f/documents/cfpb_ymyg-servicemembers-tool_scra-example-letter-to-lenders.pdf" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <Download className="h-5 w-5" />
          <span>SCRA Interest Rate Request Letter (CFPB)</span>
          <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://www.jbsa.mil/Portals/102/Documents/Legal%20Services/SCRA%20-%20Letter%20for%20Residential%20Lease.pdf" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <Download className="h-5 w-5" />
          <span>Lease Termination Letter Template (JBSA)</span>
          <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://www.consumerfinance.gov/consumer-tools/military-financial-lifecycle/military-lending-act-mla" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <BookOpen className="h-5 w-5" />
                      <span>MLA Protections Guide (CFPB)</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
        </a>
          <a href="https://www.militaryonesource.mil/moving-pcs/plan-your-move/pcs-move-checklist/" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <ClipboardList className="h-5 w-5" />
          <span>PCS Insurance Update Checklist</span>
          <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://www.nhtsa.gov/vehicle-safety/vehicle-theft-prevention" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Lock className="h-5 w-5" />
                      <span>NHTSA Theft Prevention Guide</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.militaryonesource.mil/resources/podcasts/military-onesource/containerization-personal-property/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Globe className="h-5 w-5" />
                      <span>Military OneSource Property Guide</span>
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
