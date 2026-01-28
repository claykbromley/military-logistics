import { Header } from "@/components/header"
import { createClient } from "@/lib/supabase/server"
import { ListingsGrid } from "@/components/marketplace/listings-grid"

export default async function Marketplace() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch active listings
  const { data: listings } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Fetch saved listing IDs if user is logged in
  let savedListingIds: string[] = []
  if (user) {
    const { data: savedListings } = await supabase.from("marketplace_saved_listings").select("listing_id").eq("user_id", user.id)
    savedListingIds = savedListings?.map((s: any) => s.listing_id) || []
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-center">Milify Marketplace</h1>
          <p className="mt-2 text-muted-foreground text-center">
            Buy and sell gear, uniforms, and household items within the military community
          </p>
        </div>
        <ListingsGrid initialListings={listings || []} savedListingIds={savedListingIds} userId={user?.id} />
      </main>
    </div>
  )
}
