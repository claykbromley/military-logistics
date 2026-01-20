"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, BadgeAlert, Handshake, DollarSign, Calculator, Download, ChevronRight, ChevronDown, ClipboardList, CreditCard, Scale, Tag, AlertCircle, Map, CheckCircle, ShoppingCart, Globe, ExternalLink, Building, Search } from "lucide-react"
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

export default function BuyingSellingPage() {
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
            <span className="text-foreground font-medium">Buying/Selling</span>
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
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Buying & Selling a Car</h2>
                <p className="text-slate-600 mb-6">
                  Complete guide for military members on buying and selling vehicles, including financing options, 
                  avoiding predatory practices, and navigating on-base sales procedures.
                </p>
              </div>

              {/* BUYING SECTION */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Buying a Car
                </h3>

                {/* Car Buying Checklist */}
                <Card className="border border-slate-200 overflow-hidden mb-4 p-0">
                  <button
                    onClick={() => toggleSection("buying-checklist")}
                    className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">Car Buying Checklist</h4>
                      <p className="text-sm text-slate-600">Budgeting, financing, inspection, and negotiation</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("buying-checklist") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.includes("buying-checklist") && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-2">Before You Shop:</h5>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Determine your budget (include insurance, taxes, registration)</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Check your credit score and get pre-approved for financing</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Research vehicle reliability and resale value</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-2">At the Dealership:</h5>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Negotiate the out-the-door price, not monthly payments</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Review all paperwork carefully before signing</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Decline unnecessary add-ons (extended warranties, paint protection)</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Avoiding Predatory Practices */}
                <Card className="border border-slate-200 overflow-hidden mb-4 p-0">
                  <button
                    onClick={() => toggleSection("predatory-practices")}
                    className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="p-3 bg-red-100 rounded-lg">
                      <BadgeAlert className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">Avoiding Predatory Military "Specials"</h4>
                      <p className="text-sm text-slate-600">Recognizing inflated APRs, hidden fees, and scams</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("predatory-practices") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.includes("predatory-practices") && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <h5 className="font-semibold text-red-800 mb-2">Warning Signs to Watch For:</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-red-700">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <span>Inflated APRs (anything over 10% for good credit is a red flag)</span>
                          </li>
                          <li className="flex items-start gap-3 text-red-700">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <span>Hidden fees and mandatory add-ons</span>
                          </li>
                          <li className="flex items-start gap-3 text-red-700">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <span>"Buy here, pay here" dealerships near military bases</span>
                          </li>
                          <li className="flex items-start gap-3 text-red-700">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <span>"E-1 and up approved" or "Military special" advertising</span>
                          </li>
                          <li className="flex items-start gap-3 text-red-700">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <span>Pressure to sign quickly or "today only" deals</span>
                          </li>
                        </ul>
                      </div>
                      <h5 className="font-semibold text-slate-900 mb-2">Common Unnecessary Add-ons to Decline:</h5>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3 text-slate-700">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Extended warranties (often overpriced)</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Paint protection / fabric protection</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>VIN etching (can do yourself for a few dollars)</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Gap insurance (often cheaper through your own insurer)</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Financing Options */}
                <Card className="border border-slate-200 overflow-hidden mb-4 p-0">
                  <button
                    onClick={() => toggleSection("financing-options")}
                    className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Building className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">Military-Friendly Financing Options</h4>
                      <p className="text-sm text-slate-600">Compare Navy Federal, USAA, PenFed, and local credit unions</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("financing-options") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.includes("financing-options") && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <a href="https://www.navyfederal.org/loans-cards/auto-loans.html" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors">
                          <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            Navy Federal Credit Union
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>Competitive rates for all credit types</li>
                            <li>Pre-approval available online</li>
                            <li>Up to 100% financing available</li>
                          </ul>
                        </a>
                        <a href="https://www.usaa.com/inet/wc/bank-auto-loan-main" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors">
                          <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            USAA
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>Car buying service with pre-negotiated prices</li>
                            <li>Exclusive member discounts</li>
                            <li>Low rates with no dealer markups</li>
                          </ul>
                        </a>
                        <a href="https://www.penfed.org/auto/new-auto-loans" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors">
                          <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            PenFed Credit Union
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>Often lowest advertised rates</li>
                            <li>Open to all military members</li>
                            <li>Flexible terms up to 84 months</li>
                          </ul>
                        </a>
                        <div className="bg-white p-4 rounded-lg border">
                          <h5 className="font-semibold text-slate-900 mb-2">Local Credit Unions</h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>May offer special military rates</li>
                            <li>Personal service and flexibility</li>
                            <li>Worth comparing to larger institutions</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Pro Tip:</h5>
                        <p className="text-blue-700 text-sm">
                          Always get pre-approved before visiting a dealership. This gives you negotiating power 
                          and protects you from dealer financing markups.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                {/* SCRA Car Loan Benefits */}
                <Card className="border border-slate-200 overflow-hidden mb-4 p-0">
                  <button
                    onClick={() => toggleSection("scra-car-loans")}
                    className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">Military SCRA Car Loan Benefits</h4>
                      <p className="text-sm text-slate-600">Lower interest, waived fees, and repossession protections</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("scra-car-loans") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.includes("scra-car-loans") && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <p className="text-slate-700 mb-4">
                        The Servicemembers Civil Relief Act provides important protections for car loans taken out before active duty:
                      </p>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start gap-3 text-slate-700">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>6% Interest Rate Cap:</strong> Loans taken before active duty can be reduced to 6% APR</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Repossession Protection:</strong> Lenders cannot repossess without a court order</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Waived Fees:</strong> Late fees and penalties may be waived during deployment</span>
                        </li>
                      </ul>
                      <a 
                        href="https://www.consumerfinance.gov/consumer-tools/auto-loans/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                      >
                        CFPB Auto Loan Shopping Worksheet
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </Card>

                {/* Used Car Inspection */}
                <Card className="border border-slate-200 overflow-hidden mb-4 p-0">
                  <button
                    onClick={() => toggleSection("used-car-inspection")}
                    className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">Used Car Inspection Guide</h4>
                      <p className="text-sm text-slate-600">What to check before buying - engine, tires, electronics, fluids, VIN</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("used-car-inspection") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.includes("used-car-inspection") && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-2">Exterior & Tires</h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>Check for rust, dents, and paint mismatches</li>
                            <li>Inspect tire tread depth and wear patterns</li>
                            <li>Look for signs of accident repair</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-2">Engine & Fluids</h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>Check oil level and color (should be amber)</li>
                            <li>Look for leaks under the car</li>
                            <li>Inspect coolant, brake, and transmission fluids</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-2">Electronics</h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>Test all lights, signals, and wipers</li>
                            <li>Check A/C, heat, and infotainment</li>
                            <li>Verify all warning lights turn off after starting</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-2">Documentation</h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>Run a VIN check (Carfax, AutoCheck)</li>
                            <li>Verify mileage matches records</li>
                            <li>Request maintenance history</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h5 className="font-semibold text-amber-800 mb-2">Always Get an Independent Inspection</h5>
                        <p className="text-amber-700 text-sm">
                          Pay $100-150 for a pre-purchase inspection by a trusted mechanic. This can save you thousands in hidden repair costs.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* SELLING SECTION */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Handshake className="h-6 w-6 text-primary" />
                  Selling a Car
                </h3>

                {/* Determine Market Value */}
                <Card className="border border-slate-200 overflow-hidden mb-4 p-0">
                  <button
                    onClick={() => toggleSection("market-value")}
                    className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">Determine Your Car's Market Value</h4>
                      <p className="text-sm text-slate-600">Research fair pricing before listing</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("market-value") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.includes("market-value") && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <p className="text-slate-700 mb-4">Use multiple sources to determine fair market value:</p>
                      <div className="grid gap-4 md:grid-cols-3 mb-4">
                        <a href="https://www.kbb.com/" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors text-center">
                          <h5 className="font-semibold text-slate-900 flex items-center justify-center gap-2">
                            Kelley Blue Book
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </h5>
                        </a>
                        <a href="https://www.edmunds.com/" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors text-center">
                          <h5 className="font-semibold text-slate-900 flex items-center justify-center gap-2">
                            Edmunds
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </h5>
                        </a>
                        <a href="https://www.nadaguides.com/" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:border-primary transition-colors text-center">
                          <h5 className="font-semibold text-slate-900 flex items-center justify-center gap-2">
                            NADA Guides
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </h5>
                        </a>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3 text-slate-700">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Compare private party value vs. trade-in value</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Check local listings on Craigslist, Facebook Marketplace</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Factor in your vehicle's condition and mileage</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Selling on Base */}
                <Card className="border border-slate-200 overflow-hidden mb-4 p-0">
                  <button
                    onClick={() => toggleSection("selling-on-base")}
                    className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">How to Sell on Base (Lemon Lot)</h4>
                      <p className="text-sm text-slate-600">POV Resale Lot procedures and requirements</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("selling-on-base") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.includes("selling-on-base") && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-2">On-Base Procedures:</h5>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-slate-700">
                              <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span><strong>Locate the POV Resale Lot:</strong> Contact MWR or Force Support Squadron for location and rules</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span><strong>Obtain a Permit:</strong> Pay a flat fee for a display permit</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span><strong>Display Requirements:</strong> Keep permit visible on vehicle at all times</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span><strong>Vehicle Requirements:</strong> Must be operable, clean, typically under 24 feet</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-2">Required Documentation:</h5>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-slate-700">
                              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Valid DoD or military ID</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Current vehicle registration and proof of ownership</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Proof of current vehicle insurance</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Lien release (if applicable)</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-700">
                              <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Power of Attorney (if joint owner cannot be present)</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <h5 className="font-semibold text-amber-800 mb-2">Important Note:</h5>
                          <p className="text-amber-700 text-sm">
                            Selling to a subordinate is generally legal but could raise conflict of interest issues. 
                            Ensure the transaction is transparent and at fair market value.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* OCONUS Selling */}
                <Card className="border border-slate-200 overflow-hidden mb-4 p-0">
                  <button
                    onClick={() => toggleSection("oconus-selling")}
                    className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">Selling While Stationed Overseas</h4>
                      <p className="text-sm text-slate-600">International considerations and customs procedures</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("oconus-selling") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.includes("oconus-selling") && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <p className="text-slate-700 mb-4">
                        If you are overseas (e.g., in Germany under a SOFA agreement), additional steps apply:
                      </p>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start gap-3 text-slate-700">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Obtain a U.S. Customs Form 550</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Visit local German customs and registration offices to de-register the vehicle</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Both buyer and seller may need to be present at Vehicle Registration office</span>
                        </li>
                      </ul>
                      <a 
                        href="https://www.militaryautosource.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                      >
                        Military AutoSource - Help with overseas vehicle sales
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </Card>

                {/* Alternative Selling Methods */}
                <Card className="border border-slate-200 overflow-hidden mb-4 p-0">
                  <button
                    onClick={() => toggleSection("alternative-selling")}
                    className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-1">Alternative Selling Methods</h4>
                      <p className="text-sm text-slate-600">Online marketplaces and trade-in options</p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("alternative-selling") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.includes("alternative-selling") && (
                    <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                      <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <h5 className="font-semibold text-slate-900 mb-2">Online Marketplaces</h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>Facebook Marketplace</li>
                            <li>Craigslist</li>
                            <li>MilitaryCarLot.com</li>
                            <li>CarGurus / Autotrader</li>
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <h5 className="font-semibold text-slate-900 mb-2">On-Base Options</h5>
                          <ul className="space-y-1 text-sm text-slate-600">
                            <li>Base Exchange lobby flyers</li>
                            <li>Dorm info boards</li>
                            <li>Local military social media groups</li>
                            <li>Unit bulletin boards</li>
                          </ul>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2">Trade-In Tips for Maximum Value:</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Clean and detail your car thoroughly before appraisal</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Get multiple trade-in quotes (Carmax, dealerships, online)</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Negotiate trade-in and purchase price separately</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Have maintenance records ready to show vehicle history</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* TOOLS AND CALCULATORS */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Tools & Quick Resources</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <Calculator className="h-5 w-5" />
                    <span>Car Affordability Calculator</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <DollarSign className="h-5 w-5" />
                    <span>Out-the-Door Price Calculator</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <Download className="h-5 w-5" />
                    <span>Download: Car Buying Checklist (PDF)</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <a 
                    href="https://dmv.ny.gov/more-info/information-for-military-and-veterans" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Map className="h-5 w-5" />
                      <span>NY DMV Military & Veterans Info</span>
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
