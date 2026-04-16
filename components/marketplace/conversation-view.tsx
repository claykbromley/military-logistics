"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, User } from "lucide-react"
import Link from "next/link"
import type { MarketplaceConversation, MarketplaceMessage, Profile, MarketplaceListing } from "@/lib/types"

interface ConversationViewProps {
  conversation: MarketplaceConversation & {
    listings: Pick<MarketplaceListing, "id" | "title" | "images" | "price" | "status"> | null
    buyer: Pick<Profile, "id" | "display_name" | "military_branch" | "avatar_url"> | null
    seller: Pick<Profile, "id" | "display_name" | "military_branch" | "avatar_url"> | null
  }
  messages: (MarketplaceMessage & { sender: Pick<Profile, "id" | "display_name"> | null })[]
  userId: string
}

export function ConversationView({ conversation, messages: initialMessages, userId }: ConversationViewProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isBuyer = conversation.buyer_id === userId
  const otherPerson = isBuyer ? conversation.seller : conversation.buyer
  const otherPersonName = otherPerson?.display_name || "Unknown User"
  const receiverId = isBuyer ? conversation.seller_id : conversation.buyer_id

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
      }
    }, 100)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (messages.length > initialMessages.length && messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
    }
  }, [messages, initialMessages.length])

  // Subscribe to new messages
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`conversation-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "marketplace_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as MarketplaceMessage

          // Check if message already exists
          const messageExists = messages.some(msg => msg.id === newMsg.id)
          if (messageExists) return

          // Fetch sender profile
          const { data: sender } = await supabase
            .from("profiles")
            .select("id, display_name")
            .eq("id", newMsg.sender_id)
            .single()

          // Add message with sender info
          setMessages((prev) => [...prev, { ...newMsg, sender }])

          // Mark as read if we're not the sender
          if (newMsg.sender_id !== userId) {
            await supabase
              .from("marketplace_messages")
              .update({ read: true })
              .eq("id", newMsg.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id, userId, messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const supabase = createClient()
    const messageContent = newMessage.trim()
    
    // Clear input immediately for better UX
    setNewMessage("")

    const { data, error } = await supabase
      .from("marketplace_messages")
      .insert({
        conversation_id: conversation.id,
        listing_id: conversation.listing_id,
        sender_id: userId,
        receiver_id: receiverId,
        content: messageContent,
      })
      .select(`
        *,
        sender:profiles!marketplace_messages_sender_id_fkey(id, display_name)
      `)
      .single()

    if (!error && data) {
      // Optimistically add the message to the UI
      setMessages((prev) => [...prev, data])

      // Update conversation last_message_at
      await supabase
        .from("marketplace_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id)
    } else {
      // Restore message if there was an error
      setNewMessage(messageContent)
    }

    setIsSending(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    }
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof messages }[] = []
  messages.forEach((message) => {
    const dateStr = formatDate(message.created_at)
    const lastGroup = groupedMessages[groupedMessages.length - 1]

    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(message)
    } else {
      groupedMessages.push({ date: dateStr, messages: [message] })
    }
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/community/marketplace/dashboard/messages"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to messages
      </Link>

      {/* Listing Info Header */}
      {conversation.listings && (
        <Card className="mb-4">
          <CardContent className="flex items-center justify-between p-4">
            <Link
              href={`/community/marketplace/listings/${conversation.listings.id}`}
              className="flex font-semibold hover:underline gap-4 items-center line-clamp-1"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {conversation.listings.images?.[0] ? (
                  <img
                    src={conversation.listings.images[0] || "/placeholder.svg"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
                )}
              </div>
              <div>
                {conversation.listings.title}
                <p className="text-lg font-bold text-primary">{formatPrice(conversation.listings.price)}</p>
              </div>
            </Link>
            <div className="text-right">
              <button className="justify-start items-center w-full p-2 border-2 rounded-xl border-card hover:border-primary hover:bg-primary/20 transition-colors group">
                <a className="flex gap-3" href={"/profile/" + otherPerson?.id}>
                  {otherPerson?.avatar_url ? (
                    <img
                      src={otherPerson.avatar_url}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="text-start">
                    <p className="text-sm text-muted-foreground">{isBuyer ? "Seller" : "Buyer"}</p>
                    <p className="font-medium group-hover:text-primary">{otherPersonName || "Anonymous"}</p>
                  </div>
                </a>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card className="flex flex-col" style={{ height: "calc(100vh - 400px)", minHeight: "400px" }}>
        <CardHeader className="border-b dark:border-slate-500 py-3">
          <CardTitle className="text-base">Conversation with {otherPersonName}</CardTitle>
        </CardHeader>
        <CardContent ref={messagesEndRef} className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="mb-4 flex items-center justify-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{group.date}</span>
                </div>
                {group.messages.map((message) => {
                  const isOwn = message.sender_id === userId

                  return (
                    <div key={message.id} className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isOwn ? "bg-primary text-primary-foreground" : "bg-primary/20"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={`mt-1 text-xs ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div />
          </div>
        </CardContent>

        {/* Message Input */}
        <div className="border-t dark:border-slate-500 p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e)
                }
              }}
              rows={1}
              className="min-h-[44px] resize-none dark:border-slate-500"
            />
            <Button type="submit" size="icon" className="cursor-pointer" disabled={isSending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
