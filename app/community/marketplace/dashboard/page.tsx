import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { MyListings } from "@/components/my-listings"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's listings
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your listings, messages, and saved items</p>
        </div>
        <DashboardTabs activeTab="listings" />
        <div className="mt-6">
          <MyListings listings={listings || []} />
        </div>
      </main>
    </div>
  )
}
