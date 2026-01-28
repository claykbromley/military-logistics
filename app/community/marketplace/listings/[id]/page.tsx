import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { ListingDetail } from "@/components/marketplace/listing-detail"
import { notFound } from "next/navigation"

interface ListingPageProps {
  params: Promise<{ id: string }>
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch listing with seller profile
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select("*, profiles(*)")
    .eq("id", id)
    .single()

  if (!listing) {
    notFound()
  }

  // Check if listing is saved
  let isSaved = false
  if (user) {
    const { data: savedListing } = await supabase
      .from("marketplace_saved_listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .single()
    isSaved = !!savedListing
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <ListingDetail listing={listing} user={user} isSaved={isSaved} />
      </main>
    </div>
  )
}
