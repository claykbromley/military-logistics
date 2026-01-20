"use client"
import { Header } from "@/components/header"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ChevronRight, ChevronDown, CreditCard, CircleDot, Paintbrush, Bug, Warehouse, Scale, Tag, AlertCircle, Map, CheckCircle, Battery, DollarSign, Lock, Droplets, Eye, Ship, ClipboardList, Fuel, Globe, ExternalLink } from "lucide-react"
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

export default function DeploymentPage() {
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
            <span className="text-foreground font-medium">Deployment/Storage</span>
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
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Deployment & Long-Term Storage</h2>
                <p className="text-slate-600 mb-6">
                  Complete guide to preparing your vehicle for deployment or extended storage, including battery care, 
                  fluid maintenance, tire protection, and security measures.
                </p>
              </div>

              {/* Battery Care */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("battery-care")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Battery className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Battery Care & Maintenance</h3>
                    <p className="text-sm text-slate-600">Prevent drain and ensure reliable starts after storage</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("battery-care") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("battery-care") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">Two Options for Battery Protection:</h5>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h6 className="font-semibold text-slate-900 mb-2">Option 1: Disconnect</h6>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Disconnect the negative terminal to prevent parasitic drain</li>
                          <li>Simple and free solution</li>
                          <li>Best for shorter deployments (1-3 months)</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h6 className="font-semibold text-green-700 mb-2">Option 2: Battery Maintainer (Recommended)</h6>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>Use a trickle charger/battery maintainer</li>
                          <li>Maintains optimal battery health</li>
                          <li>Best for long deployments (3+ months)</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 mb-2">Important Warning:</h5>
                      <p className="text-amber-700 text-sm">
                        Car batteries can drain fully in <strong>4-8 weeks</strong> without maintenance. Never leave your 
                        vehicle sitting without taking one of the above precautions.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Fluids Preparation */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("fluids-prep")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Droplets className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Fluid Preparation</h3>
                    <p className="text-sm text-slate-600">Engine oil, fuel, coolant, and brake fluid maintenance</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("fluids-prep") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("fluids-prep") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2">Engine Oil</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Top off engine oil to prevent moisture build-up inside the engine</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Consider a fresh oil change before storage for maximum protection</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2">Fuel System</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-slate-700">
                            <Fuel className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span><strong>Fill fuel tank to near capacity</strong> - minimizes air space and prevents condensation</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <Fuel className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span><strong>Add high-quality fuel stabilizer</strong> - prevents fuel degradation and gum buildup</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <Fuel className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Run engine for 10-15 minutes after adding stabilizer to circulate through system</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900 mb-2">Other Fluids</h5>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Check and top off coolant levels</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Verify brake fluid is at proper level</span>
                          </li>
                          <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Consider a full maintenance check before storing</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Tire Care */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("tire-care")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CircleDot className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Tire Protection</h3>
                    <p className="text-sm text-slate-600">Prevent flat spots and maintain tire integrity</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("tire-care") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("tire-care") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">Basic Tire Prep:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Inflate each tire to the upper recommended PSI</strong> to prevent flat spots from forming</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">For Long-Term Storage (6+ months):</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Tire cradles</strong> - distribute weight and prevent flat spots</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Jack stands</strong> - remove weight from tires entirely (best option)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Move the vehicle periodically</strong> - even a few inches helps (if someone is available)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Exterior Protection */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("exterior-protection")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Paintbrush className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Exterior Protection</h3>
                    <p className="text-sm text-slate-600">Paint protection, covers, and environmental considerations</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("exterior-protection") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("exterior-protection") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">Before Storing:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Wash and wax the car</strong> to protect the paint from dust, moisture, and UV damage</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Clean the interior thoroughly to prevent odors and mold</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">Car Cover Selection:</h5>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h6 className="font-semibold text-green-700 mb-2">DO Use:</h6>
                        <ul className="space-y-1 text-sm text-green-700">
                          <li>Breathable, weather-resistant car cover</li>
                          <li>Quality cover that protects from dust and damage</li>
                          <li>Fitted cover for your vehicle size</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h6 className="font-semibold text-red-700 mb-2">DO NOT Use:</h6>
                        <ul className="space-y-1 text-sm text-red-700">
                          <li>Thick plastic covers that trap moisture</li>
                          <li>Tarps without breathability</li>
                          <li>Loose covers that can scratch paint</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Ideal Storage Environment:</h5>
                      <p className="text-blue-700 text-sm">
                        Store your car in a <strong>cool, dry, consistent environment</strong> if possible. Climate-controlled 
                        storage is ideal but not always available or affordable for deployments.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Rodent & Pest Prevention */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("pest-prevention")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Bug className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Rodent & Pest Prevention</h3>
                    <p className="text-sm text-slate-600">Protect your vehicle from unwanted guests</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("pest-prevention") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("pest-prevention") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      Rodents can cause significant damage to wiring, upholstery, and air filters. Take these preventive measures:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Use rodent repellents</strong> - peppermint oil, mothballs, or commercial deterrents</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Block entry points</strong> - cover exhaust pipe with steel wool or mesh</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Remove food sources</strong> - clean all crumbs and remove any food items</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Set traps around the vehicle</strong> - catch pests before they get inside</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Use rodent tape on wiring</strong> - available at auto parts stores</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Parking Brake Warning */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("parking-brake")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Parking Brake Warning</h3>
                    <p className="text-sm text-slate-600">Critical information to avoid brake damage</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("parking-brake") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("parking-brake") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-red-800 mb-2">DO NOT Engage Parking Brake for Storage</h5>
                      <p className="text-red-700 text-sm">
                        Leaving the parking brake engaged for extended periods can cause the brake pads to <strong>seize to the 
                        rotors</strong>, resulting in expensive repairs when you return.
                      </p>
                    </div>
                    <h5 className="font-semibold text-slate-900 mb-3">Instead:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Use wheel chocks</strong> - place behind and in front of tires</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Leave transmission in Park (automatic)</strong> or in gear (manual)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Store on flat surface</strong> when possible</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Storage Location Options */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("storage-locations")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Warehouse className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Where to Store Your Vehicle</h3>
                    <p className="text-sm text-slate-600">On-base, off-base, and climate-controlled options</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("storage-locations") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("storage-locations") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">On-Base Storage</h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li><strong>Pros:</strong> Often free or low cost, secure, convenient</li>
                          <li><strong>Cons:</strong> Limited availability, may have time limits</li>
                          <li>Contact your base MWR or Transportation Office</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold text-slate-900 mb-2">Off-Base Storage</h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li><strong>Pros:</strong> More availability, flexible terms</li>
                          <li><strong>Cons:</strong> Monthly cost ($50-150+)</li>
                          <li>Look for military discounts at local facilities</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-700 mb-2">Climate-Controlled (Best)</h5>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li><strong>Pros:</strong> Best protection, consistent temperature</li>
                          <li><strong>Cons:</strong> Higher cost ($100-300+/month)</li>
                          <li>Ideal for valuable or classic vehicles</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Family/Friend Storage:</h5>
                      <p className="text-blue-700 text-sm">
                        If storing with family or friends, ensure they have a Power of Attorney to handle any issues that 
                        may arise. Provide clear instructions for periodic checks.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Non-Operational Registration */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("non-op-registration")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Non-Operational Vehicle Registration</h3>
                    <p className="text-sm text-slate-600">Save money by registering as non-op during deployment</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("non-op-registration") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("non-op-registration") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <p className="text-slate-700 mb-4">
                      Many states allow you to register your vehicle as "non-operational" or "planned non-operation" (PNO), 
                      which can save you money on registration fees and insurance.
                    </p>
                    <h5 className="font-semibold text-slate-900 mb-3">Benefits:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Reduced or suspended registration fees</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>May allow you to suspend insurance (check with your provider)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Protects you from tickets for expired registration</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">Process:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Contact your state DMV to file for non-operational status</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Provide deployment orders as documentation</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Re-register before driving the vehicle again</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Theft & Vandalism Protection */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("theft-protection")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Theft & Vandalism Protection</h3>
                    <p className="text-sm text-slate-600">Security measures to protect your vehicle during deployment</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("theft-protection") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("theft-protection") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">Physical Security:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Steering wheel lock</strong> - visible deterrent (e.g., The Club)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Wheel locks/boot</strong> - prevents towing or driving away</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Kill switch</strong> - prevents engine from starting without key knowledge</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">Electronic Security:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>GPS tracker</strong> - locate vehicle if stolen (e.g., AirTag, Tile, dedicated GPS)</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Dashcam with parking mode</strong> - records activity around vehicle</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-slate-900 mb-3">Documentation:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Take photos of vehicle condition before storing</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Record VIN, license plate, and any identifying features</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Keep copies with your deployment documents</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Insurance Considerations */}
              <Card className="border border-slate-200 overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("storage-insurance")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Insurance During Storage</h3>
                    <p className="text-sm text-slate-600">Adjust coverage and save money during deployment</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("storage-insurance") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("storage-insurance") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-slate-50">
                    <h5 className="font-semibold text-slate-900 mb-3">Options to Consider:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Comprehensive-only coverage</strong> - covers theft, vandalism, weather while stored</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Storage insurance</strong> - some insurers offer reduced rates for stored vehicles</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Military deployment discount</strong> - USAA, GEICO, and others offer special rates</span>
                      </li>
                    </ul>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 mb-2">Important:</h5>
                      <p className="text-amber-700 text-sm">
                        <strong>Never fully cancel insurance</strong> on a financed vehicle - your lender requires coverage. 
                        Contact your insurance company to discuss deployment options.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Quick Tools */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Access Tools</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <a href="https://www.militaryonesource.mil/moving-pcs/plan-your-move/deployment-checklist/" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <ClipboardList className="h-5 w-5" />
          <span>Deployment Prep Checklist (MilOneSource)</span>
          <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://www.mcbbutler.marines.mil/Portals/189/POA%20Vehicle%20(non%20rotating)-FILLABLE.pdf" target="_blank" rel="noopener noreferrer">
          <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
          <FileText className="h-5 w-5" />
          <span>Vehicle Power of Attorney Template (JAG)</span>
          <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>
          </a>
          <a href="https://www.pcsmypov.com/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Ship className="h-5 w-5" />
                      <span>PCSMyPOV - Official POV Shipping</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.militaryonesource.mil/resources/millife-guides/preparing-to-move-or-pcs/" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-transparent w-full" variant="outline">
                      <Globe className="h-5 w-5" />
                      <span>Military OneSource - PCS Guide</span>
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
