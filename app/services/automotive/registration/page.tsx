"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Car, FileText, Wrench, Shield, Package, Plane, ChevronRight, ChevronDown, CreditCard, Scale, Tag, AlertCircle, Map, CheckCircle, CircleOff, UserCheck, Download, Calendar, ExternalLink } from "lucide-react"
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

export default function RegistrationPage() {
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
            <span className="text-foreground font-medium">Registration</span>
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
                <h2 className="text-3xl font-bold text-foreground mb-3">Vehicle Registration & ID</h2>
                <p className="text-primary mb-6">
                  Navigate vehicle registration requirements, non-operational filing, and military registration exemptions 
                  across different states.
                </p>
              </div>

              {/* Non-Operational Registration */}
              <Card className="border border-border overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("non-op-reg")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                    <CircleOff className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">Non-Operational (PNO) Registration</h3>
                    <p className="text-sm text-primary">Save money by filing Planned Non-Operation during deployment</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("non-op-reg") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("non-op-reg") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-background">
                    <p className="text-primary mb-4">
                      If you won't drive at all during deployment, you may save money by registering your vehicle as 
                      <strong> Planned Non-Operation (PNO)</strong> or <strong>Non-Op</strong>, depending on your state.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">What PNO/Non-Op Means:</h5>
                      <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                        <li>You do not have to pay full registration fees</li>
                        <li>You cannot legally drive the vehicle until you reactivate it</li>
                        <li>Vehicle must remain off public roads for the entire registration period</li>
                      </ul>
                    </div>
                    <h5 className="font-semibold text-foreground mb-3">States That Offer Non-Op Registration:</h5>
                    <div className="grid gap-2 md:grid-cols-3 mb-4">
                      <a href="https://www.dmv.ca.gov/portal/vehicle-registration/vehicle-registration-renewal/file-for-planned-non-operation" target="_blank" rel="noopener noreferrer" className="bg-card p-3 rounded-lg border hover:border-primary transition-colors text-center">
                        <span className="font-medium text-foreground">California (PNO)</span>
                        <ExternalLink className="h-3 w-3 inline ml-1 text-primary" />
                      </a>
                      <div className="bg-card p-3 rounded-lg border text-center">
                        <span className="font-medium text-foreground">Nevada</span>
                      </div>
                      <div className="bg-card p-3 rounded-lg border text-center">
                        <span className="font-medium text-foreground">Arizona</span>
                      </div>
                      <div className="bg-card p-3 rounded-lg border text-center">
                        <span className="font-medium text-foreground">Washington</span>
                      </div>
                      <div className="bg-card p-3 rounded-lg border text-center">
                        <span className="font-medium text-foreground">North Carolina</span>
                        <span className="text-xs text-muted0 block">(varies by county)</span>
                      </div>
                      <div className="bg-card p-3 rounded-lg border text-center">
                        <span className="font-medium text-foreground">Texas</span>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div className="bg-card p-4 rounded-lg border">
                        <h6 className="font-semibold text-foreground mb-2">Typical Costs</h6>
                        <p className="text-2xl font-bold text-green-600">$20-$30</p>
                        <p className="text-sm text-primary">in most states</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border">
                        <h6 className="font-semibold text-foreground mb-2">How to File</h6>
                        <ul className="text-sm text-primary space-y-1">
                          <li>Through your state DMV portal</li>
                          <li>Requires VIN + current registration</li>
                          <li>Must file before registration expires</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">California Specific:</h5>
                      <p className="text-amber-700 dark:text-amber-400 text-sm">
                        PNO filing can be made <strong>up to 60 days before</strong> registration expires or 
                        <strong> up to 90 days after</strong> it expires. Your renewal notice must show the correct 
                        address before filing.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Military Registration Exemptions */}
              <Card className="border border-border overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("military-reg-exemptions")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">Military Registration Exemptions</h3>
                    <p className="text-sm text-primary">Keep your home-state registration while stationed elsewhere</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("military-reg-exemptions") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("military-reg-exemptions") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-background">
                    <p className="text-primary mb-4">
                      Most states allow active-duty service members to keep their <strong>home-state registration</strong> 
                      while stationed elsewhere, which often eliminates the need for re-registration at your duty station.
                    </p>
                    <div className="space-y-4 mb-4">
                      <a href="https://www.dmv.ca.gov/portal/driver-education-and-safety/special-interest-driver-guides/veterans-and-active-duty-military" target="_blank" rel="noopener noreferrer" className="block bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-foreground flex items-center gap-2">
                          California
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-sm text-primary">
                          Active-duty members may operate a personally owned vehicle without obtaining California 
                          registration as long as the vehicle is validly registered in the home state and not used for business.
                        </p>
                      </a>
                      <a href="https://mva.maryland.gov/Pages/active-duty.aspx" target="_blank" rel="noopener noreferrer" className="block bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-foreground flex items-center gap-2">
                          Maryland
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-sm text-primary">
                          Issues a <strong>non-resident permit</strong> for temporarily stationed members, allowing the vehicle 
                          to remain registered elsewhere for one year.
                        </p>
                      </a>
                      <a href="https://www.pa.gov/services/dmv/register-a-vehicle-in-pennsylvania-as-military-personnel-assigned-out-of-state-or-deployed-overseas" target="_blank" rel="noopener noreferrer" className="block bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                        <h5 className="font-semibold text-foreground flex items-center gap-2">
                          Pennsylvania
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </h5>
                        <p className="text-sm text-primary">
                          Allows active-duty personnel to maintain Pennsylvania registration or re-title the vehicle 
                          where they are stationed.
                        </p>
                      </a>
                      <div className="bg-card p-4 rounded-lg border">
                        <h5 className="font-semibold text-foreground">Virginia</h5>
                        <p className="text-sm text-primary">
                          Generally requires titling and registration within 30 days of moving to the state, though 
                          service members should verify any exemption clauses.
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Fee Exemptions:</h5>
                      <p className="text-green-700 dark:text-green-400 text-sm">
                        Across many states, families on military orders may also be <strong>exempt from registration fees</strong> 
                        or other requirements. Check your specific state DMV website for details.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Registration Renewal While Deployed */}
              <Card className="border border-border overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("reg-renewal-deployed")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">Registration Renewal While Deployed</h3>
                    <p className="text-sm text-primary">Extensions and online options for service members</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("reg-renewal-deployed") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("reg-renewal-deployed") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-background">
                    <h5 className="font-semibold text-foreground mb-3">Options for Deployed Service Members:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Online renewal</strong> - most states offer online registration renewal</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Power of Attorney</strong> - authorize someone to renew on your behalf</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Military extensions</strong> - many states extend deadlines for deployed members</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Waived late fees</strong> - present deployment orders when returning</span>
                      </li>
                    </ul>
                    <h5 className="font-semibold text-foreground mb-3">Documents to Keep Accessible:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-primary">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Current vehicle registration</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Vehicle title (or copy)</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Proof of insurance</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>VIN documentation</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>PCS/deployment orders</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Military ID Requirements */}
              <Card className="border border-border overflow-hidden p-0">
                <button
                  onClick={() => toggleSection("military-id-requirements")}
                  className="w-full flex items-start gap-4 p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">CAC & Military ID for Vehicle Transactions</h3>
                    <p className="text-sm text-primary">Using your military ID for DMV and vehicle purchases</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections.includes("military-id-requirements") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes("military-id-requirements") && (
                  <div className="px-6 pb-6 pt-2 border-t bg-background">
                    <h5 className="font-semibold text-foreground mb-3">Your CAC/Military ID Can Be Used For:</h5>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Primary identification at most DMVs</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Proof of military status for exemptions/discounts</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Base access for on-base vehicle purchases</span>
                      </li>
                      <li className="flex items-start gap-3 text-primary">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>REAL ID compliant for base access (but NOT for domestic flights)</span>
                      </li>
                    </ul>
                    <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
                      <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Important Reminder:</h5>
                      <p className="text-amber-700 dark:text-amber-400 text-sm">
                        While your CAC counts as REAL ID for <strong>base access</strong>, it does <strong>NOT</strong> replace 
                        a REAL ID-compliant driver's license for domestic air travel. You'll still need a REAL ID license 
                        or passport for TSA checkpoints.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Quick Tools */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-foreground mb-4">Quick Resources</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <a href="https://www.dmv.ca.gov/portal/vehicle-registration/vehicle-registration-renewal/file-for-planned-non-operation" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <CircleOff className="h-5 w-5" />
                      <span>California PNO Filing</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.military.com/pcs/vehicle-registration-for-military-families.html" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <FileText className="h-5 w-5" />
                      <span>Military.com Registration Guide</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
        </a>
                  <a href="https://www.usa.gov/motor-vehicle-services" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <Map className="h-5 w-5" />
                      <span>State DMV Lookup (USA.gov)</span>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </a>
                  <a href="https://www.military.com/pcs/vehicle-registration-for-military-families.html" target="_blank" rel="noopener noreferrer">
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <Download className="h-5 w-5" />
                      <span>Military Registration Guide</span>
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
