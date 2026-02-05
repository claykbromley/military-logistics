"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, User } from "lucide-react"
import Link from "next/link"
import type { MarketplaceConversation } from "@/lib/types"

interface ConversationsListProps {
  conversations: MarketplaceConversation[]
  userId: string
}

export function ConversationsList({ conversations, userId }: ConversationsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No conversations yet</h3>
        <p className="mt-1 text-muted-foreground">Messages from buyers and sellers will appear here</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{conversations.length} conversation(s)</p>
      {conversations.map((conversation) => {
        const isBuyer = conversation.buyer_id === userId
        const otherPerson = isBuyer ? conversation.seller : conversation.buyer
        const otherPersonName = (otherPerson as { display_name?: string })?.display_name || "Unknown User"

        return (
          <Link key={conversation.id} href={`/community/marketplace/dashboard/messages/${conversation.id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {conversation.listings?.images?.[0] ? (
                    <img
                      src={conversation.listings.images[0] || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium line-clamp-1">{conversation.listings?.title || "Unknown Listing"}</p>
                    {conversation.unread_count > 0 && (
                      <Badge variant="default" className="shrink-0">
                        {conversation.unread_count} new
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>
                      {isBuyer ? "Seller" : "Buyer"}: {otherPersonName}
                    </span>
                  </div>
                  {conversation.last_message && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {conversation.last_message.sender_id === userId ? "You: " : ""}
                      {conversation.last_message.content}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(conversation.last_message_at)}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
