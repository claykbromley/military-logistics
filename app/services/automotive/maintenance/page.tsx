"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ClipboardList, Building, Search, Calculator, Settings, Download, ChevronRight, ChevronDown, CreditCard, Scale, Tag, AlertCircle, Map, CheckCircle, Calendar, Globe, ExternalLink } from "lucide-react"
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

export default function MaintenancePage() {
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
            <span className="text-foreground font-medium">Vehicle Maintenance</span>
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
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Vehicle Maintenance</h2>
                <p className="text-slate-600 mb-6">
                  Keep your vehicle running smoothly with maintenance schedules, government programs, and military-specific resources for car ownership.
                </p>
              </div>

              {/* Maintenance Schedule */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("maintenance-schedule")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Maintenance Schedule Guide</h3>
                    <p className="text-sm text-slate-600">When to service your vehicle based on mileage and time</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("maintenance-schedule") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("maintenance-schedule") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">Every 3,000-5,000 Miles</h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Oil and filter change</li>
                          <li>Tire rotation</li>
                          <li>Visual brake inspection</li>
                          <li>Fluid level check</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">Every 15,000-30,000 Miles</h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Air filter replacement</li>
                          <li>Cabin air filter</li>
                          <li>Brake pad inspection/replacement</li>
                          <li>Tire alignment check</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">Every 30,000-60,000 Miles</h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Transmission fluid change</li>
                          <li>Coolant flush</li>
                          <li>Spark plugs</li>
                          <li>Power steering fluid</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">Every 60,000-100,000 Miles</h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Timing belt replacement</li>
                          <li>Water pump inspection</li>
                          <li>Battery replacement</li>
                          <li>Major tune-up</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Pro Tip for PCS:</h5>
                      <p className="text-blue-700 text-sm">
                        Before a long PCS drive or shipping your vehicle, get a full inspection. This protects you from breakdowns 
                        and ensures your car passes the agricultural inspection for shipping.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Pre-Trip Checklist */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("pre-trip-checklist")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Pre-PCS Vehicle Checklist</h3>
                    <p className="text-sm text-slate-600">Ensure your vehicle is ready for a long trip or shipment</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("pre-trip-checklist") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("pre-trip-checklist") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Oil Change:</strong> Fresh oil and filter before departure</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Fluids:</strong> Check coolant, brake, transmission, and windshield washer fluids</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Tires:</strong> Inspect tread depth and inflate to recommended PSI</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Brakes:</strong> Listen for squealing or grinding; replace worn pads</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Wipers:</strong> Replace worn wiper blades</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Lights:</strong> Test all headlights, taillights, and turn signals</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Battery:</strong> Test battery health; replace if older than 3-4 years</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-2">Emergency Kit Essentials:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Jumper cables or portable jump starter</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Flashlight with extra batteries</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Extra water and non-perishable snacks</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Spare tire with working jack and lug wrench</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>First-aid kit</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Reflective triangles or flares</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Government Programs */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("govt-programs")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Government Benefits & Programs</h3>
                    <p className="text-sm text-slate-600">Programs to help with car ownership costs</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("govt-programs") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("govt-programs") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">On-Base Auto Skills Centers</h5>
                        <p className="text-sm text-slate-600 mb-2">
                          Most military installations have Auto Hobby Shops where you can perform your own maintenance 
                          using professional-grade tools and equipment at a fraction of the cost.
                        </p>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Access to lifts, diagnostic equipment, and specialty tools</li>
                          <li>Trained staff available to assist</li>
                          <li>Classes on basic car maintenance often available</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">Military Discounts</h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li><strong>Jiffy Lube:</strong> Military discount on oil changes</li>
                          <li><strong>Firestone:</strong> 10% military discount</li>
                          <li><strong>Goodyear:</strong> Military pricing program</li>
                          <li><strong>NAPA Auto Parts:</strong> Military discount available</li>
                          <li><strong>AutoZone:</strong> Discount with military ID</li>
                        </ul>
                      </div>
                      <a href="https://www.militaryonesource.mil/" target="_blank" rel="noopener noreferrer" className="block bg-white p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          Military OneSource
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-sm text-slate-600">
                          Access financial counseling and resources for managing car-related expenses.
                        </p>
                      </a>
                    </div>
                  </div>
                )}
              </Card>

              {/* Quick Tools */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Tools & Resources</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <a href="https://www.carfax.com/service-shops" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Search className="h-5 w-5" />
                      <span>Find Trusted Service Shops (Carfax)</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://repairpal.com/estimator" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Calculator className="h-5 w-5" />
                      <span>Repair Cost Estimator (RepairPal)</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <Settings className="h-5 w-5" />
                    <span>Maintenance Schedule Generator</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                    <Download className="h-5 w-5" />
                    <span>Download: Vehicle Maintenance Log (PDF)</span>
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
