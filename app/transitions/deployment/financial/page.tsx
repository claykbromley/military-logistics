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
            <span className="text-foreground font-medium">Financial</span>
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
          <h1 className="text-4xl font-bold text-foreground text-center p-4">Financially Preparing for Deployment</h1>
          <div className="flex container mx-auto p-4">
            <div className="flex-1 border-r border-[darkgrey]">
              <h2 className="text-center text-xl font-bold underline">Income</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Arrange direct deposit of income to checking or savings account</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Confirm dependent access to needed accounts during the deployment</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Familiarize spouse/family members with myPay</h4>
              </div>

              <h2 className="text-center text-xl font-bold underline m-0">Bills</h2>
              <h4 className="m-2 font-bold m-0">Arrange bill payments. Establish automatic payments whenever possible</h4>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Mortgage/Rent</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Water, Electric, Cable, Internet, Trash collection</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Cell phone</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">House/rental/property insurance</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Credit card</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Loan repayments (consolidate if possible)</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Child care</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Storage unit</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Car payments</h4>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-center text-xl font-bold underline">Financial Planning</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Verify most recent LES are accessible</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Discuss with family members what credit cards won't be used during the deployment</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Notify credit card companies that specific cards will be used overseas</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Evaluate if savings plan should be adjusted during deployment</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Share access to safe deposit boxes with family members</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Make arrangements to either submit tax returns early or apply for an extension</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Arrange to pay in advance for once-a-year or periodic expenses</h4>
              </div>
              <h2 className="text-center text-xl font-bold underline">Share Information with Family</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Account log-in information (usernames, passwords, security questions, etc.)</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Bank account numbers and bank contact information</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Stock/bond portfolio information</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Contact information for military financial aid</h4>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
