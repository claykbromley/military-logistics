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
    redirect("/auth/login")
  }

  // Fetch messages where user is sender or receiver
  const { data: messages } = await supabase
    .from("messages")
    .select("*, listings(title, images)")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your listings, messages, and saved items</p>
        </div>
        <DashboardTabs activeTab="messages" />
        <div className="mt-6">
          <MessagesList messages={messages || []} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
