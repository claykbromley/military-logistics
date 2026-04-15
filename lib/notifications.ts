import { createClient } from "@/lib/supabase/client"
import { SupabaseClient } from "@supabase/supabase-js"

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationType =
  | "system"
  | "appointment"
  | "communication"
  | "community"
  | "transition"
  | "discount"
  | "reminder"

export type NotificationPriority = "low" | "medium" | "high" | "urgent"

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  action_url?: string
  action_label?: string
  read: boolean
  email_sent: boolean
  created_at: string
  read_at?: string
  metadata?: Record<string, unknown>
}

export interface NotificationPreferences {
  email_enabled: boolean
  email_frequency: "instant" | "daily" | "weekly"
  push_enabled: boolean
  types: Record<NotificationType, { enabled: boolean; email: boolean }>
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email_enabled: true,
  email_frequency: "instant",
  push_enabled: true,
  types: {
    system: { enabled: true, email: true },
    appointment: { enabled: true, email: true },
    communication: { enabled: true, email: true },
    community: { enabled: true, email: false },
    transition: { enabled: true, email: true },
    discount: { enabled: true, email: false },
    reminder: { enabled: true, email: true },
  },
}

// ─── Notification Labels & Icons ─────────────────────────────────────────────

export const NOTIFICATION_TYPE_LABELS: Record<
  NotificationType,
  { label: string; description: string; color: string }
> = {
  system: {
    label: "System Updates",
    description: "Platform updates, maintenance, and announcements",
    color: "text-blue-600",
  },
  appointment: {
    label: "Appointments",
    description: "Upcoming appointments and schedule changes",
    color: "text-green-600",
  },
  communication: {
    label: "Communications",
    description: "New messages and meeting invitations",
    color: "text-purple-600",
  },
  community: {
    label: "Community",
    description: "Forum replies, marketplace updates, and messages",
    color: "text-orange-600",
  },
  transition: {
    label: "Transition Updates",
    description: "PCS, deployment, retirement, and separation milestones",
    color: "text-indigo-600",
  },
  discount: {
    label: "Discounts & Deals",
    description: "New military discounts and limited-time offers",
    color: "text-pink-600",
  },
  reminder: {
    label: "Reminders",
    description: "Task reminders, deadlines, and follow-ups",
    color: "text-amber-600",
  },
}

// ─── Client-side Notification Functions ──────────────────────────────────────

/**
 * Fetch notifications for the current user.
 * Supports pagination and filtering by read status.
 */
export async function getNotifications(options?: {
  unreadOnly?: boolean
  limit?: number
  offset?: number
  type?: NotificationType
}): Promise<{ data: Notification[]; count: number }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: [], count: 0 }

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (options?.unreadOnly) query = query.eq("read", false)
  if (options?.type) query = query.eq("type", options.type)
  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

  const { data, count, error } = await query
  if (error) throw error

  return { data: (data as Notification[]) || [], count: count || 0 }
}

/**
 * Get unread notification count for the current user.
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  if (error) return 0
  return count || 0
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
}

export async function markAsUnread(notificationId: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("notifications")
    .update({ read: false })
    .eq("id", notificationId)
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllAsRead(): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("read", false)
}

/**
 * Delete a notification.
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("notifications").delete().eq("id", notificationId)
}

/**
 * Subscribe to real-time notification updates.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Get notification preferences for the current user.
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return DEFAULT_NOTIFICATION_PREFERENCES

  const { data, error } = await supabase
    .from("profiles")
    .select("notifications")
    .eq("id", user.id)
    .single()

  if (error || !data?.notifications) return DEFAULT_NOTIFICATION_PREFERENCES
  return data.notifications as NotificationPreferences
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("profiles")
    .update({
      notifications: preferences,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
}

// ─── Server-side / Edge Function Helper ──────────────────────────────────────

/**
 * Send a notification to a user. Call this from any page or API route.
 * This inserts a notification row AND triggers the email edge function
 * via a Supabase database trigger (see SQL migration below).
 *
 * Usage from any page/component:
 *   import { sendNotification } from "@/lib/notifications"
 *   await sendNotification({
 *     userId: "uuid-here",
 *     type: "appointment",
 *     priority: "high",
 *     title: "Appointment Reminder",
 *     message: "You have an appointment tomorrow at 0900.",
 *     actionUrl: "/scheduler/appointments",
 *     actionLabel: "View Appointment",
 *   })
 */
export async function sendNotification(params: {
  userId: string
  type: NotificationType
  priority?: NotificationPriority
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, unknown>
}): Promise<Notification | null> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("create_notification", {
    p_user_id: params.userId,
    p_type: params.type,
    p_priority: params.priority || "medium",
    p_title: params.title,
    p_message: params.message,
    p_action_url: params.actionUrl || null,
    p_action_label: params.actionLabel || null,
    p_metadata: params.metadata || {},
  })

  if (error) {
    console.error("Failed to send notification:", error)
    return null
  }

  if (!data) return null

  const notificationId = data

  // Send email from the client side --------------- domain must be added to resend before emails can be sent
  // const { data: profile } = await supabase
  //   .from("profiles")
  //   .select("email, notifications")
  //   .eq("id", params.userId)
  //   .single()

  // if (profile?.email && profile?.notifications) {
  //   const prefs = profile.notifications as NotificationPreferences
  //   const typePrefs = prefs.types[params.type]

  //   if (
  //     prefs.email_enabled &&
  //     typePrefs?.email &&
  //     prefs.email_frequency === "instant"
  //   ) {
  //     fetch("/api/send-notification-email", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         notification_id: notificationId,
  //         user_id: params.userId,
  //         email: profile.email,
  //         type: params.type,
  //         priority: params.priority || "medium",
  //         title: params.title,
  //         message: params.message,
  //         action_url: params.actionUrl,
  //         action_label: params.actionLabel,
  //       }),
  //     }).catch((err) => console.error("Email send failed:", err))
  //   }
  //}

  return {
    id: notificationId,
    user_id: params.userId,
    type: params.type,
    priority: params.priority || "medium",
    title: params.title,
    message: params.message,
    action_url: params.actionUrl,
    action_label: params.actionLabel,
    read: false,
    email_sent: false,
    created_at: new Date().toISOString(),
    metadata: params.metadata,
  } as Notification
}

/**
 * Send a notification to multiple users.
 */
export async function sendBulkNotifications(params: {
  userIds: string[]
  type: NotificationType
  priority?: NotificationPriority
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
}): Promise<void> {
  // Send individually so each user's preferences are respected
  await Promise.allSettled(
    params.userIds.map((userId) =>
      sendNotification({
        userId,
        type: params.type,
        priority: params.priority,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        actionLabel: params.actionLabel,
      })
    )
  )
}