"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ListingCard } from "@/components/marketplace/listing-card"
import { CategoryFilter } from "@/components/marketplace/category-filter"
import { LocationSelector } from "@/components/marketplace/location-selector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, Plus } from "lucide-react"
import type { Listing, Category } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useUI } from "@/context/ui-context"
import { useRouter } from "next/navigation"

interface ListingsGridProps {
  initialListings: Listing[]
  savedListingIds: string[]
  userId?: string
}

export function ListingsGrid({ initialListings, savedListingIds, userId }: ListingsGridProps) {
  const [user, setUser] = useState<{email?: string}|null>(null)
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(false)
  const { setShowLogin } = useUI()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchListings()
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [selectedCategory, selectedLocation, sortBy])

  const fetchListings = async () => {
    setIsLoading(true)
    const supabase = createClient()

    let query = supabase.from("listings").select("*").eq("status", "active")

    if (selectedCategory) {
      query = query.eq("category", selectedCategory)
    }

    if (selectedLocation) {
      query = query.ilike("location", `%${selectedLocation.split(",")[0]}%`)
    }

    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false })
    } else if (sortBy === "price-low") {
      query = query.order("price", { ascending: true })
    } else if (sortBy === "price-high") {
      query = query.order("price", { ascending: false })
    }

    const { data } = await query

    setListings(data || [])
    setIsLoading(false)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()

    let query = supabase.from("listings").select("*").eq("status", "active")

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    if (selectedCategory) {
      query = query.eq("category", selectedCategory)
    }

    if (selectedLocation) {
      query = query.ilike("location", `%${selectedLocation.split(",")[0]}%`)
    }

    const { data } = await query.order("created_at", { ascending: false })

    setListings(data || [])
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex items-center justify-between w-full">
          <div className="flex flex-wrap items-center gap-4">
            <LocationSelector selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 cursor-pointer">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {user && 
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild>
              <Link href="/community/marketplace/listings/new">
                <Plus className="mr-2 h-4 w-4" />
                New Listing
              </Link>
            </Button>
            <Button asChild>
              <Link href="/community/marketplace/dashboard">
                My Dashboard
              </Link>
            </Button>
          </div>}
        </div>

        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={savedListingIds.includes(listing.id)}
              userId={userId}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No listings found</h3>
          <p className="mt-1 text-muted-foreground">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}
