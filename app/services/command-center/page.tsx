import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChevronRight } from "lucide-react"
import { CommandCenterDashboard } from "@/components/command-center/command-center-dashboard"
import { CommunicationHubProvider } from "@/hooks/use-communication-hub"

export default function CommandCenterPage() {
  return (
    <CommunicationHubProvider>
      <CommandCenterPageContent />
    </CommunicationHubProvider>
  )
}

function CommandCenterPageContent() {
  return (
    <>
      <Header />

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex-1">
        <CommandCenterDashboard />
      </main>
      <Footer />
    </>
  )
}