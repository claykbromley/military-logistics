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
            <span className="text-foreground font-medium">Family</span>
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
          <h1 className="text-4xl font-bold text-foreground text-center p-4">Preparing Your Family for Deployment</h1>
          <div className="flex container mx-auto p-4">
            <div className="flex-1 border-r border-[darkgrey]">
              <h2 className="text-center text-xl font-bold underline">Family Care</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Complete a Family Care Plan and submit to Commanding Officer</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Inform extended family members and friends of the upcoming deployment</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Explore how family members and friends can provide support to your family</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Connect with similarly situated families and schedule regular check-ins</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Maintain copies of TDY orders at home</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Maintain a copy of immunization and health records at home for children</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Provide a spare house key to a trusted neighbor</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Register children with the local Child Development Center if remaining near base, in case child care is needed</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Ensure military IDs and driver's licenses are still active and won't expire during the deployment</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Arrange other transportation options if family members don't drive</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Arrange transportation for your pets, if your pets will be staying with family or friends</h4>
              </div>
              <h2 className="text-center text-xl font-bold underline">If your Children are Staying with a Guardian</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Through Power of Attorney, assign guardianship of your children to a trusted person</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Confirm childcare and education plans for children</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Provide copies of TDY orders to children's guardian</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Provide copies of children's health and immunization records</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Outline your children's typical routines</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Provide a list of nearby and emergency contacts</h4>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-center text-xl font-bold underline">Emergency Plan</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Verify family has access to TRICARE Health Plan and TRICARE Dental</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Create a list of emergency contacts (names, phone numbers, e-mail addresses)</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Verify family knows how to contact the Red Cross and Legal Assistance Services</h4>
              </div>
              <h2 className="text-center text-xl font-bold underline">Communication Plan</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Clarify how and when you will keep in touch with family during the deployment</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Confirm Internet and phone-service capabilities while deployed</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Explore security measures in place preventing communication</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Clarify if you will be able to send or receive packages</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Inform parents or other family members of how to contact command</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Clarify the plan for emergency communication, including what qualifies as an emergency</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Confirm that command has the correct contact information for loved one</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Clarify with command if there will be deployment updates to family members, and how they will be determined</h4>
              </div>
              <h2 className="text-center text-xl font-bold underline">Adjustment Plan</h2>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Discuss what will need to change about your family's routines once the deployment occurs</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Discuss what will remain the same for your partner, family, or children</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Explore what important dates/events will be missed</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Become familiar with resources available to family members such as FOCUS Project and United Through Reading</h4>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="w-5 h-5 cursor-pointer m-3 flex-shrink-0"/>
                <h4 className="m-2 font-bold">Discuss plans and expectations for coming home and reintegrating into the family after the deployment</h4>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
