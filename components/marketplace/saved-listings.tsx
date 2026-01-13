"use client"

import { ListingCard } from "@/components/listing-card"
import { Heart } from "lucide-react"
import type { Listing } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface SavedListingsProps {
  listings: Listing[]
  userId: string
}

export function SavedListings({ listings, userId }: SavedListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No saved items</h3>
        <p className="mt-1 text-muted-foreground">Items you save will appear here</p>
        <Button asChild className="mt-6">
          <Link href="/">Browse Listings</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">{listings.length} saved item(s)</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} isSaved={true} userId={userId} />
        ))}
      </div>
    </>
  )
}
