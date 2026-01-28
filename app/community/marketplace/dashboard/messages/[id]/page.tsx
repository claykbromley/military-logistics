import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { redirect, notFound } from "next/navigation"
import { ConversationView } from "@/components/marketplace/conversation-view"
import { markConversationRead } from "./actions"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/community/marketplace")
  }

  // Fetch conversation with listing and profiles
	const { data } = await supabase
	.from("marketplace_conversations")
	.select(`
		*,
		marketplace_listings(id, title, images, price, status),
		buyer:profiles!marketplace_conversations_buyer_id_fkey(id, display_name, military_branch),
		seller:profiles!marketplace_conversations_seller_id_fkey(id, display_name, military_branch)
	`)
	.eq("id", id)
	.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
	.limit(1)

	const conversation = data?.[0]

	if (!conversation) {
	notFound()
	}

  // Fetch all messages in the conversation
  const { data: messages } = await supabase
    .from("marketplace_messages")
    .select(`
      *,
      sender:profiles!marketplace_messages_sender_id_fkey(id, display_name)
    `)
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
  console.log(messages)

  // Mark unread messages as read
  await markConversationRead(id, user.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <ConversationView conversation={conversation} messages={messages || []} userId={user.id} />
      </main>
    </div>
  )
}
