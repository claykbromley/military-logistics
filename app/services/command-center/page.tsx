import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChevronRight } from "lucide-react"
import { CommandCenterDashboard } from "@/components/command-center-dashboard"

export default function CommandCenterPage() {
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
              Services
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Command Center</span>
          </div>
        </div>
      </div>

      
      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex-1">
        <CommandCenterDashboard />
      </main>
      <Footer />
    </>
  )
}