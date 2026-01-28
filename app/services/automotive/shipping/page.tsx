"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ChevronRight, ChevronDown, CreditCard, Scale, Tag, AlertCircle, Map, CheckCircle, DollarSign, Banknote, Truck, Ship, ExternalLink, Fuel, FileWarning, Receipt, Route, Calculator, MapPin, Download } from "lucide-react"
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

export default function ShippingPage() {
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
            <span className="text-foreground font-medium">PCS and Shipping</span>
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
                <h2 className="text-3xl font-bold text-slate-900 mb-3">PCS & Vehicle Shipping</h2>
                <p className="text-slate-600 mb-6">
                  Complete guide to shipping your POV, driving for PCS, reimbursement rates, and what the military covers.
                </p>
              </div>

              {/* What Military Pays For */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("military-pays")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">What the Military Pays For</h3>
                    <p className="text-sm text-slate-600">Government coverage for POV shipping</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("military-pays") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("military-pays") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">Government Typically Covers:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Vehicle transportation from pickup location to destination port</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Standard processing and inspection</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Storage while awaiting shipment</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Delivery to authorized destination</span>
                      </li>
                    </ul>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 mb-2">You Must Pay Out-of-Pocket For:</h5>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3 text-amber-700">
                          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span>Shipping a second POV</span>
                        </li>
                        <li className="flex items-start gap-3 text-amber-700">
                          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span>Additional accessories or oversized items inside the vehicle</span>
                        </li>
                        <li className="flex items-start gap-3 text-amber-700">
                          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span>Extra cleaning if vehicle fails agricultural inspection</span>
                        </li>
                        <li className="flex items-start gap-3 text-amber-700">
                          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span>Non-standard modifications (lifted trucks, oversized tires)</span>
                        </li>
                        <li className="flex items-start gap-3 text-amber-700">
                          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span>Towing a non-operational vehicle</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </Card>

              {/* Financial Reimbursements */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("financial-reimbursements")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Banknote className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Financial Reimbursements</h3>
                    <p className="text-sm text-slate-600">MALT, Per Diem, and DLA rates</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("financial-reimbursements") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("financial-reimbursements") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">MALT Rate</h5>
                        <p className="text-2xl font-bold text-primary mb-1">~$0.21/mile</p>
                        <p className="text-sm text-slate-600">Per-mile reimbursement for up to 2 POVs driven to new duty station</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">Per Diem</h5>
                        <p className="text-2xl font-bold text-primary mb-1">Daily Rate</p>
                        <p className="text-sm text-slate-600">Allowance for lodging and meals for each authorized travel day</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">DLA</h5>
                        <p className="text-2xl font-bold text-primary mb-1">One-Time</p>
                        <p className="text-sm text-slate-600">Dislocation Allowance for household relocation expenses</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Authorized Travel Days Calculation:</h5>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li><strong>First 400 miles:</strong> 1 travel day</li>
                        <li><strong>Beyond 400 miles:</strong> Divide remaining distance by 350</li>
                        <li><strong>Remainder of 51+ miles:</strong> Adds 1 extra day</li>
                      </ul>
                    </div>
                  </div>
                )}
              </Card>

              {/* Move Types */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("move-types")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Move Types & Restrictions</h3>
                    <p className="text-sm text-slate-600">CONUS, OCONUS, and PPM/DITY moves</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("move-types") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("move-types") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">CONUS to CONUS</h5>
                        <p className="text-sm text-slate-600">
                          The military generally does <strong>not</strong> pay to ship your car between bases in the continental 
                          United States. You must either drive it yourself or pay out-of-pocket for shipping.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">OCONUS (Overseas)</h5>
                        <p className="text-sm text-slate-600">
                          The military typically pays for shipment of <strong>one POV</strong>. Any additional vehicles must be 
                          shipped at your own expense.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">PPM/DITY Move</h5>
                        <p className="text-sm text-slate-600">
                          If moving your own household goods in a rental truck, you can tow your POV behind it. While towing 
                          equipment may not be directly reimbursable, it can often be claimed as a moving expense for tax purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Vehicle Turn-In Procedures */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("turn-in-procedures")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Ship className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Vehicle Turn-In Procedures</h3>
                    <p className="text-sm text-slate-600">Appointments, documents, and inspection requirements</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("turn-in-procedures") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("turn-in-procedures") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">Required Documents:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Valid military ID / CAC</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>PCS orders</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Vehicle title or registration</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Current insurance card</span>
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
                    <h5 className="font-semibold text-slate-900 mb-3">Inspection Requirements:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <Fuel className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Fuel level at or below 1/4 tank</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Clean interior and exterior (agricultural clearance)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>No personal items except allowed accessories</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Remove toll tags, parking passes, and transponders</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Check for fluid leaks</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Vehicle must be operational (unless approved as non-op)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Weight & Size Rules */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("weight-rules")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Weight Allowances & Shipping Rules</h3>
                    <p className="text-sm text-slate-600">Size restrictions and modification guidelines</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("weight-rules") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("weight-rules") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Standard POVs typically qualify under basic weight and dimension rules</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Oversized vehicles (lifted trucks, wide-body SUVs) may incur additional fees</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Roof racks or large modifications may disqualify the vehicle</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Only one POV is authorized for shipment at government expense</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Damage Claims */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("damage-claims")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FileWarning className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Damage Claims & Timelines</h3>
                    <p className="text-sm text-slate-600">How to file claims if your vehicle is damaged during transport</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("damage-claims") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("damage-claims") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-red-800 mb-2">Critical Timelines:</h5>
                      <ul className="space-y-1 text-sm text-red-700">
                        <li><strong>At Pickup:</strong> Inspect vehicle thoroughly and note ALL damages on Vehicle Inspection Form</li>
                        <li><strong>24 Hours:</strong> Report any hidden damages discovered after pickup</li>
                        <li><strong>75 Days:</strong> File final claims within this window</li>
                      </ul>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">Types of Claims:</h5>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-white p-4 rounded-lg border">
                        <h6 className="font-semibold text-slate-900 mb-1">Site Settlement</h6>
                        <p className="text-sm text-slate-600">On-the-spot repair/replacement with delivery agent</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h6 className="font-semibold text-slate-900 mb-1">IAL Claim</h6>
                        <p className="text-sm text-slate-600">Standard claim processed through International Auto Logistics</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h6 className="font-semibold text-slate-900 mb-1">Military Claim</h6>
                        <p className="text-sm text-slate-600">Filed with your branch's military claims office</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h6 className="font-semibold text-slate-900 mb-1">Inconvenience Claim</h6>
                        <p className="text-sm text-slate-600">For expenses like rental cars due to delayed delivery</p>
                      </div>
                    </div>
                    <a 
                      href="https://www.pcsmypov.com/faq" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium mt-4"
                    >
                      PCSMyPOV FAQ - Complete Claims Information
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </Card>

              {/* Driving Your Car for PCS */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("driving-pcs")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Route className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Driving Your Car for PCS</h3>
                    <p className="text-sm text-slate-600">Safety tips, route planning, and GTCC usage</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("driving-pcs") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("driving-pcs") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2">Government Travel Charge Card (GTCC):</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Use for PCS-related expenses: gas, hotels, meals</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>Only valid during authorized travel period</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2">Receipt Requirements:</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-slate-700">
                            <Receipt className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Keep all lodging receipts</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <Receipt className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Save receipts for any expense over $75</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <Receipt className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Digital copies are acceptable</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2">PPM Weight Tickets:</h5>
                        <p className="text-sm text-slate-600">
                          If doing a partial PPM (carrying household goods in your car), you must weigh your vehicle empty and 
                          full at a certified scale to receive weight-based reimbursement.
                        </p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2">Documentation to Carry:</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-slate-700">
                            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>PCS orders</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Vehicle registration</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Insurance card</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Spare key</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Quick Tools */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Access Tools</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <a href="https://www.pcsmypov.com/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Ship className="h-5 w-5" />
                      <span>PCSMyPOV - Official POV Shipping Portal</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://my.move.mil/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Truck className="h-5 w-5" />
                      <span>my.move.mil - Official DoD Moving Portal</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <Calculator className="h-5 w-5" />
                    <span>DITY/PPM Reimbursement Calculator</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <Route className="h-5 w-5" />
                    <span>PCS Travel Mileage Calculator</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <MapPin className="h-5 w-5" />
                    <span>Vehicle Drop-off / Inspection Locator</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <Download className="h-5 w-5" />
                    <span>Download: Deployment POA Template</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
