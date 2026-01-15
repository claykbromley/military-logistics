import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/marketplace/dashboard-tabs"
import { MessagesList } from "@/components/marketplace/messages-list"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/community/marketplace")
  }

  // Fetch messages where user is sender or receiver
  const { data: messages } = await supabase
    .from("marketplace_messages")
    .select("*, marketplace_listings(title, images)")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

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
          <MessagesList messages={messages || []} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
