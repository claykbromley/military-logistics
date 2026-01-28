import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/marketplace/dashboard-tabs"
import { MyListings } from "@/components/marketplace/my-listings"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/community/marketplace")
  }

  // Fetch user's listings
  const { data: listings } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl text-center font-bold tracking-tight">My Dashboard</h1>
          <p className="mt-2 text-center  text-muted-foreground">Manage your listings, messages, and saved items</p>
        </div>
        <DashboardTabs activeTab="listings" />
        <div className="mt-6">
          <MyListings listings={listings || []} />
        </div>
      </main>
    </div>
  )
}
