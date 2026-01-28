import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/marketplace/dashboard-tabs"
import { ConversationsList } from "@/components/marketplace/conversations-list"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/community/marketplace")
  }
  
  // Fetch messages where user is sender or receiver
  const { data: conversations } = await supabase
    .from("marketplace_conversations")
    .select(`
      *,
      listings:marketplace_listings(id, title, images),
      buyer:profiles!marketplace_conversations_buyer_id_fkey(id, display_name),
      seller:profiles!marketplace_conversations_seller_id_fkey(id, display_name)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })
  
  // Get unread counts for each conversation
  const conversationsWithUnread = await Promise.all(
    (conversations || []).map(async (conv) => {
      const { count } = await supabase
        .from("marketplace_messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("read", false)
        .neq("sender_id", user.id)

      // Get last message
      const { data: lastMessage } = await supabase
        .from("marketplace_messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      return {
        ...conv,
        unread_count: count ?? 0,
        last_message: lastMessage,
      }
    }),
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center tracking-tight">My Dashboard</h1>
          <p className="mt-2 text-center text-muted-foreground">Manage your listings, messages, and saved items</p>
        </div>
        <DashboardTabs activeTab="messages" />
        <div className="mt-6">
          <ConversationsList conversations={conversationsWithUnread} userId={user.id} />
        </div>
      </main>
    </div>
  )
}