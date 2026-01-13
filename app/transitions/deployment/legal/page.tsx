import { Header } from "@/components/header"
import { DollarSign, Baby, Home, ChevronRight, BriefcaseBusiness } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function DeploymentPage() {
  const serviceCategories = [
    { name: "Legal", icon: BriefcaseBusiness, description: "Prepare your will and power of attorney" },
    { name: "Financial", icon: DollarSign, description: "Manage your finances in your absense" },
    { name: "Home and Auto", icon: Home, description: "Maintain control your property while you are gone" },
    { name: "Family", icon: Baby, description: "Prepare your family for life without you" },
  ]

  return (
    <>
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
              Transitions
            </a>
            <ChevronRight className="h-4 w-4" />
            <a href="/transitions/deployment" className="hover:text-primary transition-colors">
              Deployment
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Legal</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-100 border-r">
          <div className="top-20 p-6">
            <a href="/transitions/deployment">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-300 text-center">
                Preparing for Deployment
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
                    <a key={category.name} href={`/transitions/deployment/${category.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
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
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex-1">
          <h1 className="text-4xl font-bold text-foreground text-center p-4">Legal Preparations for Deployment</h1>
          <div className="flex container mx-auto p-4">
            <div className="flex-1 border-r border-[darkgrey]">
              <h2 className="text-center text-xl font-bold underline">Will</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Service Member's will is in good standing</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Spouses's will is in good standing</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Create a living will or trust, if desired</h4>
              </div>
              <h2 className="text-center text-xl font-bold underline">Power of Attorney</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Assign medical power of attorney</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Assign a guardian of your children</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Guardian has access to necessary paperwork and money as needed</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Verify if financial institution requires a General or Special Power of Attorney</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">All POA documentation is in a safe and secure place</h4>
              </div>
              <h2 className="text-center text-xl font-bold underline">Life Insurance</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Life-insurance plans are current</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Life-insurance beneficiaries are current</h4>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-center text-xl font-bold mb-0 underline">Legal Paperwork</h2>
              <h4 className="text-center font-bold">Keep important legal documents in a secure place</h4>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">ID cards for all family members</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Birth certificates of all family members</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Marriage license</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Divorce papers</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Adoption papers</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Death certificates of any family members</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Social Security cards for all immediate family members</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Car or other vehicle titles</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Passports that are valid throughout the deployment</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Visas/citizenship paperwork</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Past 5 years of tax returns</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Court documents, such as custody agreements</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Account passwords and security question answers</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Insurance documentation (health, life, homeowners, car, etc.)</h4>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
