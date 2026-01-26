import { Card } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Hero } from "@/components/deployment/hero"
import { ChecklistSection } from "@/components/deployment/checklist-section"
import { ProgressOverview } from "@/components/deployment/progress-overview"
import { Footer } from "@/components/footer"
import { Scale, DollarSign, Home, MessageSquare, ChevronRight } from "lucide-react"
import { legalChecklist, homeChecklist, financialChecklist, familyChecklist } from "@/components/deployment/checklists"

const checklistCategories = [
  { category: "legal", label: "Legal", totalItems: legalChecklist.length },
  { category: "financial", label: "Financial", totalItems: financialChecklist.length },
  { category: "home", label: "Home & Vehicles", totalItems: homeChecklist.length },
  { category: "family", label: "Family & Communication", totalItems: familyChecklist.length },
]

export default function DeploymentPage() {
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
            <span className="text-foreground font-medium">Deployment</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="items-center">
          <Hero />

          {/* Checklists Section */}
          <section id="checklists" className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Pre-Deployment Checklists</h2>
                <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                  Work through each category to ensure nothing is overlooked. Your progress is automatically
                  saved as you check items off.
                </p>
              </div>

              {/* Progress Overview */}
              <div className="mb-8">
                <ProgressOverview categories={checklistCategories} />
              </div>

              <div className="space-y-4">
                <ChecklistSection
                  title="Legal"
                  category="legal"
                  icon={<Scale className="w-5 h-5" />}
                  items={legalChecklist}
                />
                <ChecklistSection
                  title="Financial"
                  category="financial"
                  icon={<DollarSign className="w-5 h-5" />}
                  items={financialChecklist}
                />
                <ChecklistSection
                  title="Home & Vehicles"
                  category="home"
                  icon={<Home className="w-5 h-5" />}
                  items={homeChecklist}
                />
                <ChecklistSection
                  title="Family & Communication"
                  category="family"
                  icon={<MessageSquare className="w-5 h-5" />}
                  items={familyChecklist}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
