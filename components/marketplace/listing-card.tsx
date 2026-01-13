"use client"

import type React from "react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MapPin } from "lucide-react"
import type { Listing } from "@/lib/types"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface ListingCardProps {
  listing: Listing
  isSaved?: boolean
  userId?: string
}

export function ListingCard({ listing, isSaved: initialSaved = false, userId }: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsLoading(true)
    const supabase = createClient()

    if (isSaved) {
      await supabase.from("saved_listings").delete().eq("user_id", userId).eq("listing_id", listing.id)
      setIsSaved(false)
    } else {
      await supabase.from("saved_listings").insert({ user_id: userId, listing_id: listing.id })
      setIsSaved(true)
    }

    setIsLoading(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const conditionColors: Record<string, string> = {
    new: "bg-green-100 text-green-800",
    "like-new": "bg-emerald-100 text-emerald-800",
    good: "bg-blue-100 text-blue-800",
    fair: "bg-amber-100 text-amber-800",
    poor: "bg-red-100 text-red-800",
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0] || "/placeholder.svg"}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          {userId && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={toggleSave}
              disabled={isLoading}
            >
              <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
              <span className="sr-only">{isSaved ? "Remove from saved" : "Save listing"}</span>
            </Button>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
            <Badge variant="secondary" className={conditionColors[listing.condition]}>
              {listing.condition}
            </Badge>
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">{formatPrice(listing.price)}</p>
        </CardContent>
        <CardFooter className="border-t px-4 py-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
