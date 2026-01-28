"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart, MapPin, MessageSquare, User, Calendar, Tag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Listing, Profile } from "@/lib/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { CATEGORIES, CONDITIONS } from "@/lib/types"

interface ListingDetailProps {
  listing: Listing & { profiles: Profile | null }
  user: SupabaseUser | null
  isSaved: boolean
}

export function ListingDetail({ listing, user, isSaved: initialSaved }: ListingDetailProps) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageSent, setMessageSent] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const toggleSave = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    if (isSaved) {
      await supabase
        .from("marketplace_saved_listings")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listing.id)
      setIsSaved(false)
    } else {
      await supabase
        .from("marketplace_saved_listings")
        .insert({ user_id: user.id, listing_id: listing.id })
      setIsSaved(true)
    }

    setIsLoading(false)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !message.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from("marketplace_conversations")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("buyer_id", user.id)
      .eq("seller_id", listing.user_id)
      .single()

    let conversationId: string

    if (existingConversation) {
      conversationId = existingConversation.id
    } else {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from("marketplace_conversations")
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.user_id,
        })
        .select("id")
        .single()

      if (convError || !newConversation) {
        setIsLoading(false)
        return
      }

      conversationId = newConversation.id
    }

    // Send the message
    await supabase.from("marketplace_messages").insert({
      conversation_id: conversationId,
      listing_id: listing.id,
      sender_id: user.id,
      receiver_id: listing.user_id,
      content: message,
    })

    // Update conversation last_message_at
    await supabase
      .from("marketplace_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId)

    setMessage("")
    setMessageSent(true)
    setIsLoading(false)

    // Redirect to conversation after a moment
    setTimeout(() => {
      router.push(`/community/marketplace/dashboard/messages/${conversationId}`)
    }, 1500)
  }

  const conditionColors: Record<string, string> = {
    new: "bg-green-100 text-green-800",
    "like-new": "bg-emerald-100 text-emerald-800",
    good: "bg-blue-100 text-blue-800",
    fair: "bg-amber-100 text-amber-800",
    poor: "bg-red-100 text-red-800",
  }

  const categoryLabel = CATEGORIES.find((c) => c.value === listing.category)?.label || listing.category
  const conditionLabel = CONDITIONS.find((c) => c.value === listing.condition)?.label || listing.condition
  const locationDisplay = listing.city && listing.state ? `${listing.city}, ${listing.state}` : listing.location

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/community/marketplace" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to listings
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Images */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg bg-muted">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[selectedImage] || "/placeholder.svg"}
                alt={listing.title}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>
          {listing.images && listing.images.length > 1 && (
            <div className="mt-4 flex gap-2">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
              {listing.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{listing.title}</h1>
                  <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(listing.price)}</p>
                </div>
                <Button variant="outline" size="icon" onClick={toggleSave} disabled={isLoading}>
                  <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="secondary" className={conditionColors[listing.condition]}>
                  {conditionLabel}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {categoryLabel}
                </Badge>
              </div>

              <div className="mt-6 flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{locationDisplay}</span>
                </div>
                {listing.nearby_base && listing.nearby_base !== locationDisplay && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
                    Near {listing.nearby_base}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Listed {formatDate(listing.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{listing.profiles?.display_name || "Anonymous"}</p>
                  {listing.profiles?.military_branch && (
                    <p className="text-sm capitalize text-muted-foreground">
                      {listing.profiles.military_branch.replace("-", " ")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          {user && user.id !== listing.user_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Seller</CardTitle>
              </CardHeader>
              <CardContent>
                {messageSent ? (
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-primary" />
                    <p className="mt-2 font-medium">Message Sent!</p>
                    <p className="text-sm text-muted-foreground">The seller will respond to your message soon.</p>
                  </div>
                ) : (
                  <form onSubmit={sendMessage}>
                    <Textarea
                      placeholder="Hi, I'm interested in this item..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                    <Button type="submit" className="mt-3 w-full" disabled={isLoading || !message.trim()}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/auth/login" className="text-primary underline">
                    Sign in
                  </Link>{" "}
                  to contact the seller
                </p>
              </CardContent>
            </Card>
          )}

          {user && user.id === listing.user_id && (
            <Button variant="outline" asChild>
              <Link href={`/community/marketplace/dashboard/listings/${listing.id}/edit`}>Edit Listing</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
