"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreVertical, Plus, Eye, Pencil, Trash2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { MarketplaceListing } from "@/lib/types"

interface MyListingsProps {
  listings: MarketplaceListing[]
}

export function MyListings({ listings: initialListings }: MyListingsProps) {
  const router = useRouter()
  const [listings, setListings] = useState(initialListings)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    sold: "bg-blue-100 text-blue-800",
    pending: "bg-amber-100 text-amber-800",
    inactive: "bg-gray-100 text-gray-800",
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    const supabase = createClient()

    await supabase.from("marketplace_listings").delete().eq("id", deleteId)

    setListings((prev) => prev.filter((l) => l.id !== deleteId))
    setDeleteId(null)
    setIsDeleting(false)
    router.refresh()
  }

  const handleMarkSold = async (listingId: string) => {
    const supabase = createClient()
    await supabase.from("marketplace_listings").update({ status: "sold" }).eq("id", listingId)

    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, status: "sold" as const } : l)))
    router.refresh()
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No listings yet</h3>
        <p className="mt-1 text-muted-foreground">Create your first listing to start selling</p>
        <Button asChild className="mt-6">
          <Link href="/community/marketplace/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{listings.length} listing(s)</p>
        <Button asChild>
          <Link href="/community/marketplace/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden">
            <div className="relative aspect-video overflow-hidden bg-muted">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0] || "/placeholder.svg"}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-sm text-muted-foreground">No image</span>
                </div>
              )}
              <Badge className={`absolute right-2 top-2 ${statusColors[listing.status]}`}>{listing.status}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
              <p className="mt-1 text-xl font-bold text-primary">{formatPrice(listing.price)}</p>
            </CardContent>
            <CardFooter className="border-t p-4">
              <div className="flex w-full items-center justify-between">
                <span className="text-sm text-muted-foreground">{listing.location}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/community/marketplace/listings/${listing.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/community/marketplace/dashboard/listings/${listing.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    {listing.status === "active" && (
                      <DropdownMenuItem onClick={() => handleMarkSold(listing.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Sold
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(listing.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
