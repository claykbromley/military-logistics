"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ChevronRight, ChevronDown, CreditCard, FileSignature, Scale, Tag, AlertCircle, Map, CheckCircle, Phone, Hammer, LifeBuoy, FileDown, Download, ClipboardList, CloudRain, Wind, Droplets, Snowflake, ExternalLink } from "lucide-react"
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

export default function EmergencyPage() {
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
            <span className="text-foreground font-medium">Emergency</span>
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
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Emergency & Roadside Support</h2>
                <p className="text-slate-600 mb-6">
                  Be prepared for breakdowns, emergencies, and natural disasters. Find base assistance contacts, 
                  emergency kit essentials, and what to do if you break down during PCS.
                </p>
              </div>

              {/* Base Roadside Assistance */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("base-assistance")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Base Roadside Assistance Contacts</h3>
                    <p className="text-sm text-slate-600">Who to call when you're on or near base</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("base-assistance") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("base-assistance") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">On-Base Resources:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Military Police / Security Forces</strong> - For accidents or emergencies on base</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Auto Hobby Shop</strong> - Some offer towing assistance to their facility</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>MWR</strong> - May have emergency assistance programs</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">Off-Base Resources:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>USAA Roadside Assistance</strong> - Available 24/7 for members</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>AAA</strong> - Military discount on membership</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Insurance roadside coverage</strong> - Check if included in your policy</span>
                      </li>
                    </ul>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Store These Numbers:</h5>
                      <p className="text-blue-700 text-sm">
                        Save your base's emergency numbers, insurance roadside assistance, and a local tow company 
                        in your phone before you need them.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Auto Hobby Shops */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("auto-hobby-shops")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Hammer className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">On-Base Auto Hobby Shops</h3>
                    <p className="text-sm text-slate-600">DIY repairs with professional equipment</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("auto-hobby-shops") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("auto-hobby-shops") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      Most military installations have Auto Skills Centers (Auto Hobby Shops) where you can perform 
                      your own maintenance using professional-grade equipment.
                    </p>
                    <h5 className="font-semibold text-slate-900 mb-3">What's Available:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Vehicle lifts</strong> - Work underneath your car safely</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Diagnostic equipment</strong> - OBD scanners, multimeters</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Specialty tools</strong> - Spring compressors, bearing pullers, etc.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Trained staff</strong> - Available to assist and advise</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Classes</strong> - Many offer basic maintenance classes</span>
                      </li>
                    </ul>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h6 className="font-semibold text-green-800 mb-1">Typical Costs</h6>
                        <p className="text-sm text-green-700">$5-10/hour for bay rental</p>
                        <p className="text-sm text-green-700">Oil changes: $20-30 (supplies only)</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h6 className="font-semibold text-blue-800 mb-1">Who Can Use</h6>
                        <p className="text-sm text-blue-700">Active duty, retirees, dependents, DoD civilians</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Emergency Kit Checklist */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("emergency-kit")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-red-100 rounded-lg">
                    <LifeBuoy className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Emergency Kit Checklist</h3>
                    <p className="text-sm text-slate-600">Essential items to keep in your vehicle</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("emergency-kit") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("emergency-kit") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-3">Basic Essentials:</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Jumper cables or portable jump starter</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Flashlight with extra batteries</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>First-aid kit</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Reflective triangles or flares</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Spare tire, jack, lug wrench</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Tire pressure gauge</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-3">Survival Items:</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Bottled water (1 gallon minimum)</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Non-perishable snacks</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Emergency blanket</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Phone charger (car and portable)</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Rain poncho</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Multi-tool or basic tool kit</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 mb-2">PCS Addition:</h5>
                      <p className="text-amber-700 text-sm">
                        For long-distance PCS drives, also pack: paper maps (in case of no cell service), 
                        extra motor oil, coolant, duct tape, and important documents in a waterproof bag.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Breakdown During PCS */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("breakdown-pcs")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">What to Do in a Breakdown During PCS</h3>
                    <p className="text-sm text-slate-600">Step-by-step guide for roadside emergencies</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("breakdown-pcs") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("breakdown-pcs") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">Immediate Steps:</h5>
                    <ol className="space-y-2 mb-4 list-decimal list-inside">
                      <li className="text-slate-700"><strong>Get to safety</strong> - Pull off the road completely, turn on hazards</li>
                      <li className="text-slate-700"><strong>Assess the situation</strong> - Is it safe to check the car? Stay in vehicle if on highway</li>
                      <li className="text-slate-700"><strong>Set up warning devices</strong> - Reflective triangles 50-100 feet behind car</li>
                      <li className="text-slate-700"><strong>Call for help</strong> - Roadside assistance, then family/sponsor</li>
                      <li className="text-slate-700"><strong>Document everything</strong> - Photos, location, what happened</li>
                    </ol>
                    <h5 className="font-semibold text-slate-900 mb-3">Who to Call:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Your insurance roadside assistance</strong> - USAA, GEICO, etc.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>AAA</strong> - If you're a member</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Your gaining unit/sponsor</strong> - They may be able to help coordinate</span>
                      </li>
                    </ul>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Keep Receipts!</h5>
                      <p className="text-blue-700 text-sm">
                        Emergency repairs during PCS may be reimbursable. Keep all receipts for towing, repairs, 
                        and lodging if you're delayed. File claims through your travel voucher.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Natural Disaster Prep */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("disaster-prep")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CloudRain className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Natural Disaster Vehicle Prep</h3>
                    <p className="text-sm text-slate-600">Hurricanes, typhoons, flooding, and severe weather</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("disaster-prep") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("disaster-prep") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="h-5 w-5 text-blue-600" />
                          <h6 className="font-semibold text-slate-900">Hurricane/Typhoon</h6>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Fill gas tank completely</li>
                          <li>Park away from trees/structures</li>
                          <li>Move to high ground if flooding expected</li>
                          <li>Consider evacuation routes</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="h-5 w-5 text-blue-600" />
                          <h6 className="font-semibold text-slate-900">Flooding</h6>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Never drive through standing water</li>
                          <li>6 inches can stall most cars</li>
                          <li>Move vehicle to elevated parking</li>
                          <li>Know base flood zones</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Snowflake className="h-5 w-5 text-blue-600" />
                          <h6 className="font-semibold text-slate-900">Winter Weather</h6>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Install winter tires/chains</li>
                          <li>Keep extra blankets in car</li>
                          <li>Carry ice scraper, snow brush</li>
                          <li>Maintain at least 1/2 tank of gas</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 mb-2">OCONUS Considerations:</h5>
                      <p className="text-red-700 text-sm">
                        If stationed overseas (Japan, Guam, etc.), follow base evacuation procedures for typhoons. 
                        Your POV may need to be moved to designated safe parking areas.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Forms and Documents */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("forms-documents")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileDown className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Forms & Document Templates</h3>
                    <p className="text-sm text-slate-600">Downloadable checklists, POA templates, and more</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("forms-documents") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("forms-documents") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                        <FileText className="h-5 w-5" />
                        <span>Vehicle Power of Attorney Template</span>
                        <Download className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                        <FileText className="h-5 w-5" />
                        <span>Bill of Sale Template</span>
                        <Download className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                        <ClipboardList className="h-5 w-5" />
                        <span>Pre-Purchase Inspection Checklist</span>
                        <Download className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                        <ClipboardList className="h-5 w-5" />
                        <span>POV Shipping Checklist</span>
                        <Download className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                        <ClipboardList className="h-5 w-5" />
                        <span>Deployment Storage Checklist</span>
                        <Download className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button className="h-auto py-4 justify-start gap-3 bg-transparent" variant="outline">
                        <FileSignature className="h-5 w-5" />
                        <span>SCRA Interest Rate Request Letter</span>
                        <Download className="h-4 w-4 ml-auto" />
                      </Button>
        <a href="https://www.mcbbutler.marines.mil/Portals/189/POA%20Vehicle%20(non%20rotating)-FILLABLE.pdf" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <FileText className="h-5 w-5" />
          <span>Vehicle Power of Attorney (JAG Template)</span>
          <Download className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://eforms.com/bill-of-sale/vehicle" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <FileText className="h-5 w-5" />
          <span>Bill of Sale Template (by State)</span>
          <Download className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://www.military.com/off-duty/autos/vehicle-inspection-checklist.html" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <ClipboardList className="h-5 w-5" />
          <span>Pre-Purchase Inspection Checklist</span>
          <Download className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://www.mcieast.marines.mil/Portals/33/Documents/Safety/Traffic/POV-Inspection-Checklist-1.pdf" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <ClipboardList className="h-5 w-5" />
          <span>POV Shipping Inspection Checklist</span>
          <Download className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://www.militaryonesource.mil/moving-pcs/plan-your-move/pcs-move-checklist/" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <ClipboardList className="h-5 w-5" />
          <span>PCS Move Checklist (MilitaryOneSource)</span>
          <Download className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://files.consumerfinance.gov/f/documents/cfpb_ymyg-servicemembers-tool_scra-example-letter-to-lenders.pdf" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <FileSignature className="h-5 w-5" />
          <span>SCRA Interest Rate Request Letter</span>
          <Download className="h-4 w-4 ml-auto" />
          </Button>
          </a>
                    </div>
                  </div>
                )}
              </Card>

              {/* Quick Links */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Emergency Resources</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <a href="https://www.usaa.com/inet/wc/roadside-assistance" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Phone className="h-5 w-5" />
                      <span>USAA Roadside Assistance</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.aaa.com/membership/benefits/roadside-assistance" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <LifeBuoy className="h-5 w-5" />
                      <span>AAA Roadside Assistance</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.ready.gov/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <AlertCircle className="h-5 w-5" />
                      <span>Ready.gov - Emergency Preparedness</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.nhc.noaa.gov/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <CloudRain className="h-5 w-5" />
                      <span>National Hurricane Center</span>
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
