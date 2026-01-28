import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/marketplace/dashboard-tabs"
import { SavedListings } from "@/components/marketplace/saved-listings"

export default async function SavedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/community/marketplace")
  }

  // Fetch saved listings with listing details
  const { data: savedListings } = await supabase
    .from("marketplace_saved_listings")
    .select("*, marketplace_listings(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  
  const listings = savedListings?.map((s) => s.marketplace_listings).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center tracking-tight">My Dashboard</h1>
          <p className="mt-2 text-center text-muted-foreground">Manage your listings, messages, and saved items</p>
        </div>
        <DashboardTabs activeTab="saved" />
        <div className="mt-6">
          <SavedListings listings={listings as any[]} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
