import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Briefcase, BookOpen, CircleAlert, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PlatformServices } from "@/components/deployment/platform-services"

const serviceCategories = [
  { name: "Services", icon: Briefcase, description: "Manage your life during deployment" },
  { name: "Resources", icon: BookOpen, description: "Access external resources available to you" },
  { name: "Emergency Contacts", icon: CircleAlert, description: "Have emergency contacts readily available" },
]

export default function DeploymentServicesPage() {
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
            <span className="text-foreground font-medium">Services</span>
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
          <PlatformServices />
        </main>
      </div>
      <Footer />
    </>
  )
}