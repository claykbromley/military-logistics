import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookOpen, CircleAlert, CircleCheck, ChevronRight, Building, Heart, DollarSign, Scale, Landmark, FileText, Baby, Plane } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ResourceCard } from "@/components/deployment/resource-card"

const serviceCategories = [
  { name: "Checklist", icon: CircleCheck, link: "/transitions/deployment", description: "Make sure you are ready for deployment" },
  { name: "Resources", icon: BookOpen, link: "/transitions/deployment/resources", description: "Access external resources available to you" },
  { name: "Emergency Contacts", icon: CircleAlert, link: "/transitions/deployment/emergency-contacts", description: "Have emergency contacts readily available" },
]

const resources = [
  {
    title: "Military OneSource",
    description: "Free resources on financial, legal, and family matters. 24/7 support available.",
    href: "https://www.militaryonesource.mil",
    icon: <Building className="w-5 h-5" />,
    category: "Support",
  },
  {
    title: "TRICARE",
    description: "Healthcare program for military personnel and families. Find providers and coverage info.",
    href: "https://www.tricare.mil",
    icon: <Heart className="w-5 h-5" />,
    category: "Healthcare",
  },
  {
    title: "myPay",
    description: "Access and manage your military pay, LES, and tax documents online.",
    href: "https://mypay.dfas.mil",
    icon: <DollarSign className="w-5 h-5" />,
    category: "Finance",
  },
  {
    title: "JAG Legal Assistance",
    description: "Free legal services including wills, powers of attorney, and estate planning.",
    href: "https://legalassistance.law.af.mil",
    icon: <Scale className="w-5 h-5" />,
    category: "Legal",
  },
  {
    title: "Thrift Savings Plan",
    description: "Retirement savings and investment plan for federal employees and military.",
    href: "https://www.tsp.gov",
    icon: <Landmark className="w-5 h-5" />,
    category: "Finance",
  },
  {
    title: "SGLI / VGLI Insurance",
    description: "Service Members' Group Life Insurance information and management.",
    href: "https://www.va.gov/life-insurance",
    icon: <FileText className="w-5 h-5" />,
    category: "Insurance",
  },
  {
    title: "Military Child Care",
    description: "Find and request child care at military installations worldwide.",
    href: "https://www.militarychildcare.com",
    icon: <Baby className="w-5 h-5" />,
    category: "Family",
  },
  {
    title: "Space-A Travel",
    description: "Information on space-available travel for military members and families.",
    href: "https://www.amc.af.mil/AMC-Travel-Site",
    icon: <Plane className="w-5 h-5" />,
    category: "Travel",
  },
]

export default function DeploymentResourcesPage() {
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
            <span className="text-foreground font-medium">Resources</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-100 border-r">
          <div className="top-20 p-6">
            <a href="/transitions/deployment">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-300 text-center">
                Deployment
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
                    <a key={category.name} href={category.link}>
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
          <section id="resources" className="py-16 bg-muted/30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Official Resources</h2>
                <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                  Trusted links to official military and government resources for deployment preparation.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {resources.map((resource) => (
                  <ResourceCard key={resource.title} {...resource} />
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  )
}
