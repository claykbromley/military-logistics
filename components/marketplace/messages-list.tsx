"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import Link from "next/link"
import type { Message, Listing } from "@/lib/types"

interface MessagesListProps {
  messages: (Message & { listings: Pick<Listing, "title" | "images"> | null })[]
  userId: string
}

export function MessagesList({ messages, userId }: MessagesListProps) {
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

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No messages yet</h3>
        <p className="mt-1 text-muted-foreground">Messages from buyers and sellers will appear here</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{messages.length} message(s)</p>
      {messages.map((message) => {
        const isSent = message.sender_id === userId
        return (
          <Link key={message.id} href={message.listing_id ? `/listings/${message.listing_id}` : "#"}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {message.listings?.images?.[0] ? (
                    <img
                      src={message.listings.images[0] || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium line-clamp-1">{message.listings?.title || "Unknown Listing"}</p>
                    <Badge variant="outline" className="shrink-0 gap-1">
                      {isSent ? (
                        <>
                          <ArrowUpRight className="h-3 w-3" />
                          Sent
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="h-3 w-3" />
                          Received
                        </>
                      )}
                    </Badge>
                    {!message.read && !isSent && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(message.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
