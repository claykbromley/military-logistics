"use server"

import { createRouteClient } from "@/lib/supabase/route"

export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  const supabase = await createRouteClient()

  await supabase
    .from("marketplace_messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("read", false)
}
