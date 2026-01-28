"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ChevronRight, ChevronDown, CreditCard, Scale, Tag, AlertCircle, Map, CheckCircle, FileCheck, Globe, ExternalLink } from "lucide-react"
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

export default function DriversLicensePage() {
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
            <span className="text-foreground font-medium">Driver's License</span>
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
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Driver's License Resources for Service Members</h2>
                <p className="text-slate-600 mb-6">
                  Military members face unique challenges when maintaining, renewing, or transferring their driver's license.
                  This section explains what you can keep, what you need to update, and how state protections apply to
                  you, whether you're CONUS, OCONUS, deployed, or PCSing.
                </p>
              </div>

              {/* SCRA Protections */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("scra-protections")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      Military Driver's License Protections (SCRA)
                    </h3>
                    <p className="text-sm text-slate-600">Servicemembers Civil Relief Act protections</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("scra-protections") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("scra-protections") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      Under the SCRA, service members do not need to change their driver's license when they move due to PCS.
                    </p>
                    <h4 className="font-semibold text-slate-900 mb-3">What This Means for You:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You may keep your home-state driver's license, even if stationed in another state</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You do not need to take new tests, pay local fees, or retake the DMV driving exam</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Your license remains valid as long as it is valid in your home state</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>This applies to both active-duty military and their spouses (Military Spouse Residency Relief Act)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Renewal While Deployed */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("renewal-deployed")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      Driver's License Renewal While Deployed
                    </h3>
                    <p className="text-sm text-slate-600">Extensions and options when stationed away from home</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("renewal-deployed") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("renewal-deployed") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">Many states offer automatic extensions when you're:</p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Deployed</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Stationed overseas</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>On unaccompanied orders</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Posted in a state far from home</span>
                      </li>
                    </ul>
                    <h4 className="font-semibold text-slate-900 mb-3">Common Benefits:</h4>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Renewal deadlines extended up to 90–180 days after returning</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Online renewal options even if normally unavailable</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Waived late fees for deployed members</span>
                      </li>
                    </ul>
                    <h4 className="font-semibold text-slate-900 mb-3">What You Should Do:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Check if your state offers a Military Service License Extension Card</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Carry deployment/PCS orders with your ID</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Renew early if possible, especially if OCONUS</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Out-of-State Driving */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("out-of-state")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Out-of-State Driving While Stationed</h3>
                    <p className="text-sm text-slate-600">When you need to update vs. when you don't</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("out-of-state") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("out-of-state") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      If you're stationed in a new state, you may drive with your home-state license, but:
                    </p>
                    <h4 className="font-semibold text-slate-900 mb-3">You May Need to Update If:</h4>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>You register a vehicle in the new state</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>You become a permanent resident (buy a home, claim taxes there)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Your insurance requires a local license</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Your home-state license expires</span>
                      </li>
                    </ul>
                    <h4 className="font-semibold text-slate-900 mb-3">You Do NOT Need to Update If:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You're temporarily stationed under PCS</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You're only in the state for duty</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You maintain legal residency elsewhere</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Military Spouse Rules */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("spouse-rules")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Military Spouse Driver's License Rules</h3>
                    <p className="text-sm text-slate-600">MSRRA protections for military spouses</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("spouse-rules") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("spouse-rules") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      Under MSRRA, spouses may also keep their home-state driver's license as long as they maintain:
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Legal residency in that state</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>A valid home-state license</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>PCS orders showing they are accompanying the service member</span>
                      </li>
                    </ul>
                    <h4 className="font-semibold text-slate-900 mb-3">When Spouses Should Update Their License:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>They choose to become residents of the new state</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Their home-state license expires and cannot be renewed remotely</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>The base or insurance provider requires a local license</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* OCONUS Driving */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("oconus")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Driver's License While OCONUS</h3>
                    <p className="text-sm text-slate-600">Germany, Japan, Korea, and international permits</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("oconus") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("oconus") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      When stationed overseas, your home-state license typically remains valid, but you often need an
                      additional military or international permit.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-slate-900 mb-2">Germany</h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Requires a USAREUR Driver's License</li>
                          <li>Must pass online test + written exam</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-slate-900 mb-2">Japan</h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Requires a SOFA Driver's License</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-slate-900 mb-2">Korea</h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Installation-specific driving permits</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-slate-900 mb-2">International Driving Permit (IDP)</h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Recommended for travel outside your duty station</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Lost/Stolen License */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("lost-stolen")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Lost, Stolen, or Damaged License</h3>
                    <p className="text-sm text-slate-600">What to do when stationed away from home</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("lost-stolen") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("lost-stolen") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h4 className="font-semibold text-slate-900 mb-3">If your license is lost while OCONUS or CONUS:</h4>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Contact your home-state DMV for a duplicate license</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Many states allow mailing to your unit or APO/FPO address</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Bring two forms of ID (passport, CAC, birth certificate, SSN)</span>
                      </li>
                    </ul>
                    <h4 className="font-semibold text-slate-900 mb-3">If stolen:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>File a police report (on or off base)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Notify your DMV</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Freeze your credit (military members get special protections)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* REAL ID */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("real-id")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">REAL ID Requirements for Military Members</h3>
                    <p className="text-sm text-slate-600">What you need to know about REAL ID compliance</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("real-id") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("real-id") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">REAL ID is required for domestic air travel and base access.</p>
                    <h4 className="font-semibold text-slate-900 mb-3">Military Notes:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>A CAC does count as a REAL ID for base access</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>A CAC does NOT replace REAL ID for domestic flights (you still need a REAL ID-compliant DL or passport)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Many states waive fees for military REAL ID upgrades</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Quick Action Buttons */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Resources</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <Map className="h-5 w-5" />
                    <span>State Military Driver's License Rules Lookup</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <FileText className="h-5 w-5" />
                    <span>Driver's License Renewal Extension Checker</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <Globe className="h-5 w-5" />
                    <span>Overseas Licensing Guide (Germany, Japan, Korea)</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <FileCheck className="h-5 w-5" />
                    <span>Printable Checklist: Renewing While Deployed</span>
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
