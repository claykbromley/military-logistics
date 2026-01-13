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
            <span className="text-foreground font-medium">Home and Auto</span>
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
          <h1 className="text-4xl font-bold text-foreground text-center p-4">Preparing Your Home and Vehicles for Deployment</h1>
          <div className="flex container mx-auto p-4">
            <div className="flex-1 border-r border-[darkgrey]">
              <h2 className="text-center text-xl font-bold underline">Home Inspections</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Renter's/homeowner's insurance is current</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Household routine maintenance is current</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Arrangements to renew lease, if applicable</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Have a lawn care plan in place</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Firearms are properly locked and stored</h4>
              </div>
              <h2 className="text-center text-xl font-bold underline">Vehicle Inspections</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Car and other vehicle insurance are current</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Vehicle titles and registration are accessible and in good standing</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Base and inspection stickers are current</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Routine maintenance is up to date</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Extra sets of car keys are on hand</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Roadside assistance is available for vehicles that remain in use</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Emergency kit is in each car</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Arrangements are made for someone to maintain vehicles that won't be used</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">If storing during deployment, remove all personal items and contact the insurance company</h4>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-center text-xl font-bold underline">Leasing your Home</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Find responsible renters and sign a lease agreement</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Share contact information of family and handyman with renter</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Set up forwarding of your mail to another address</h4>
              </div>
              <h2 className="text-center text-xl font-bold underline">Vacating your Home</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Turn off the water</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Lower thermostat temperature</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Clean out the refrigerator and remove all trash</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Arrange for someone to check on the home periodically</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Set up mail forwarding or arrange for someone to collect mail</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Prepare the house for seasonal changes as needed</h4>
              </div>
              <h2 className="text-center text-xl font-bold underline">Cancelling a Lease</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Contact the property manager about cancelling the lease or subletting</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Confirm landlord has an emergency name and contact number</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Move out personal items you opt not to leave in your home</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Set up mail forwarding to another address</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Rent a storage space or make other arrangements for your personal belongings</h4>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
