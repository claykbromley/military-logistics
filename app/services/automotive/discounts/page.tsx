"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ChevronRight, ChevronDown, CreditCard, Scale, Tag, AlertCircle, Map, CheckCircle, Settings, Droplets, CarFront, Sparkles, Download, BadgeCheck, ExternalLink } from "lucide-react"
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

export default function DiscountsPage() {
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
            <span className="text-foreground font-medium">Discounts</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-sidebar border-r">
          <div className="top-20 p-6">
            <a href="/services/automotive">
              <h2 className="text-2xl font-bold text-sidebar-foreground mb-6 pb-3 border-b-2 border-muted-foreground text-center">
                Automotive Services
              </h2>
            </a>
            <div className="space-y-3">
              <a key={"vehicle-manager"} href={`/services/command-center/property`} className="block">
                <Card
                  key={"vehicle-manager"}
                  className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        Vehicle Manager
                      </h3>
                    </div>
                  </div>
                </Card>
              </a>
              {serviceCategories.map((category) => {
                const Icon = category.icon
                return (
                  <a key={category.name} href={`/services/automotive/${category.id}`} className="block">
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
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-3">Military Discounts</h2>
                <p className="text-primary mb-6">
                  Take advantage of exclusive military discounts on new vehicles, auto parts, maintenance services, 
                  and rental cars. Save hundreds to thousands of dollars with your military ID.
                </p>
              </div>

              {/* New Vehicle Rebates */}
              <Card className="border border-border overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("vehicle-rebates")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Car className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">New Vehicle Military Rebates</h3>
                    <p className="text-sm text-primary">Save $500-$1,000+ on new car purchases</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("vehicle-rebates") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("vehicle-rebates") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-background">
                    <p className="text-primary mb-4">
                      Most major manufacturers offer military appreciation rebates that can be combined with other incentives:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <a href="https://www.ford.com/support/how-tos/shopping-tools-resources/military/how-do-i-get-a-military-discount-on-a-ford-vehicle/" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          Ford
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">$500-$1,000</p>
                        <p className="text-sm text-primary">Military Appreciation Bonus Cash (varies by promotion)</p>
                      </a>
                      <a href="https://www.toyota.com/military-rebate" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          Toyota
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">$500</p>
                        <p className="text-sm text-primary">Military Rebate Program</p>
                      </a>
                      <a href="https://www.chevrolet.com/chevy-cares/military-support" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          GM (Chevrolet, GMC, Buick, Cadillac)
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">$500+</p>
                        <p className="text-sm text-primary">Cash allowance + 20% off OnStar, 25% off SiriusXM</p>
                      </a>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Honda</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">$500</p>
                        <p className="text-sm text-primary">Military Appreciation Offer (check local dealer)</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Nissan</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">$500-$1,000</p>
                        <p className="text-sm text-primary">VPP (Vehicle Purchase Program)</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Hyundai/Kia</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">$400-$500</p>
                        <p className="text-sm text-primary">Military discount programs</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Pro Tip:</h5>
                      <p className="text-blue-700 dark:text-blue-400 text-sm">
                        Military rebates can typically be <strong>combined</strong> with other manufacturer incentives, 
                        dealer discounts, and financing specials. Always ask about stacking discounts!
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Auto Parts Discounts */}
              <Card className="border border-border overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("parts-discounts")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">Auto Parts Military Discounts</h3>
                    <p className="text-sm text-primary">Save 10% or more on parts and accessories</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("parts-discounts") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("parts-discounts") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-background">
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <a href="https://www.autozone.com/lp/military-discounts" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          AutoZone
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">10% Off</p>
                        <p className="text-sm text-primary">In-store with military ID (active, retired, dependents)</p>
                      </a>
                      <a href="https://www.oreillyauto.com/military-discount" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          O'Reilly Auto Parts
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">10% Off</p>
                        <p className="text-sm text-primary">In-store (active, reserve, retired, veterans, dependents)</p>
                      </a>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">NAPA Auto Parts</h5>
                        <p className="text-2xl font-bold text-amber-600 mb-1">Varies</p>
                        <p className="text-sm text-primary">Ask at local store - some locations offer military discounts</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Advance Auto Parts</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">10% Off</p>
                        <p className="text-sm text-primary">With military ID at participating stores</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Oil Changes & Service Discounts */}
              <Card className="border border-border overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("service-discounts")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">Oil Changes & Repair Services</h3>
                    <p className="text-sm text-primary">Discounted maintenance at national chains</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("service-discounts") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("service-discounts") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-background">
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Jiffy Lube</h5>
                        <p className="text-sm text-primary mb-2">Military discount on oil changes and services</p>
                        <p className="text-xs text-muted0">Discount varies by location - ask in store</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Firestone Complete Auto Care</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">10% Off</p>
                        <p className="text-sm text-primary">All services with military ID</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Goodyear</h5>
                        <p className="text-sm text-primary mb-2">Military pricing program on tires and services</p>
                        <p className="text-xs text-muted0">Check local store for current offers</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Midas</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">10% Off</p>
                        <p className="text-sm text-primary">All services at participating locations</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Pep Boys</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">10% Off</p>
                        <p className="text-sm text-primary">Parts and services with military ID</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Valvoline Instant Oil Change</h5>
                        <p className="text-sm text-primary mb-2">Military discount available</p>
                        <p className="text-xs text-muted0">Ask about current promotions</p>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">On-Base Auto Hobby Shops</h5>
                      <p className="text-green-700 dark:text-green-400 text-sm">
                        Most bases have auto skills centers where you can do your own maintenance using professional 
                        equipment at a fraction of the cost. Oil changes can be as low as $20-30 when you do it yourself!
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Rental Car Discounts */}
              <Card className="border border-border overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("rental-discounts")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <CarFront className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">Rental Car Military Rates</h3>
                    <p className="text-sm text-primary">Discounted rentals for PCS, leave, and personal travel</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("rental-discounts") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("rental-discounts") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-background">
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <a href="https://www.enterprise.com/en/help/faqs/government-rates.html" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          Enterprise
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">Up to 5% Off</p>
                        <p className="text-sm text-primary">Military/government rates on leisure travel</p>
                      </a>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Hertz</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">Up to 25% Off</p>
                        <p className="text-sm text-primary">Military discount with CDP code</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Avis</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">Up to 35% Off</p>
                        <p className="text-sm text-primary">Military rates available online</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">Budget</h5>
                        <p className="text-2xl font-bold text-green-600 mb-1">Up to 25% Off</p>
                        <p className="text-sm text-primary">Use BCD code for military discount</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">National Car Rental</h5>
                        <p className="text-sm text-primary mb-2">Government/military rates available</p>
                        <p className="text-xs text-muted0">Often comparable to Enterprise rates</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground mb-2">USAA Members</h5>
                        <p className="text-sm text-primary mb-2">Additional discounts through USAA partnerships</p>
                        <p className="text-xs text-muted0">Check USAA website for current codes</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">PCS Tip:</h5>
                      <p className="text-blue-700 dark:text-blue-400 text-sm">
                        If you're renting during PCS, use your <strong>GTCC (Government Travel Charge Card)</strong> 
                        for official travel. Government rates are often better than military leisure rates.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Car Wash Discounts */}
              <Card className="border border-border overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("carwash-discounts")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">Car Wash Discounts</h3>
                    <p className="text-sm text-primary">Keep your car clean for less</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("carwash-discounts") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("carwash-discounts") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-background">
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>On-base car washes</strong> - Often cheapest option, available at most installations</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Mister Car Wash</strong> - Military discount at many locations</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Local car washes near bases</strong> - Often offer military specials</span>
                      </li>
                    </ul>
                    <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Before PCS or Shipping:</h5>
                      <p className="text-amber-700 dark:text-amber-400 text-sm">
                        Your vehicle must pass an <strong>agricultural inspection</strong> before shipping. A thorough 
                        exterior and interior cleaning is required - budget for a detail if needed.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Quick Links */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-foreground mb-4">Quick Links</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <a href="https://www.military.com/discounts" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <Tag className="h-5 w-5" />
                      <span>Military.com Discount Directory</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.id.me/military" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <BadgeCheck className="h-5 w-5" />
                      <span>ID.me Military Verification</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.veteransadvantage.com" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <Shield className="h-5 w-5" />
                      <span>Veterans Advantage</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.shopmyexchange.com/veterans" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <Download className="h-5 w-5" />
                      <span>Military Exchange Benefits Info</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
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
