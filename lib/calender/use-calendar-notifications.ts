"use client"

import { useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { sendNotification } from "@/lib/notifications"

// Default reminder times (in minutes before event) by source type
const DEFAULT_REMINDERS: Record<string, number[]> = {
  // Timed events: 30 min before
  timed: [30],
  // All-day events: 12 hours (720 min) before
  all_day: [720],
  // Property/document/bill deadlines: 1 week + 12 hours before
  property: [10080, 720],
  document: [10080, 720],
  bill: [10080, 720],
  vet_record: [10080, 720],
  maintenance: [10080, 720],
  // Meetings: 30 min before
  meeting: [30],
}

function getDefaultReminders(entry: {
  all_day: boolean
  source: string | null
  type: string
}): number[] {
  if (entry.source && DEFAULT_REMINDERS[entry.source]) {
    return DEFAULT_REMINDERS[entry.source]
  }
  if (entry.type === "meeting" || entry.source === "meeting") return DEFAULT_REMINDERS.meeting
  if (entry.all_day) return DEFAULT_REMINDERS.all_day
  return DEFAULT_REMINDERS.timed
}

function formatReminderLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} before`
  if (minutes < 1440) {
    const h = Math.round(minutes / 60)
    return `${h} hour${h !== 1 ? "s" : ""} before`
  }
  const d = Math.round(minutes / 1440)
  return `${d} day${d !== 1 ? "s" : ""} before`
}

/**
 * Syncs scheduled_notifications rows for a calendar entry.
 * Called after creating/updating an entry.
 */
export async function syncEntryReminders(
  entryId: string,
  userId: string,
  startTime: string,
  title: string,
  reminderMinutes: number[] | null,
  entryMeta: { all_day: boolean; source: string | null; type: string }
) {
  const supabase = createClient()
  const reminders = reminderMinutes ?? getDefaultReminders(entryMeta)

  // Delete existing unsent reminders for this entry (keep sent ones for history)
  await supabase
    .from("scheduled_notifications")
    .delete()
    .eq("calendar_entry_id", entryId)
    .eq("sent", false)

  if (reminders.length === 0) return

  const eventTime = new Date(startTime)
  const now = new Date()
  const rows: any[] = []

  for (const mins of reminders) {
    const remindAt = new Date(eventTime.getTime() - mins * 60000)
    // Only schedule future reminders
    if (remindAt > now) {
      rows.push({
        user_id: userId,
        calendar_entry_id: entryId,
        remind_at: remindAt.toISOString(),
        reminder_label: formatReminderLabel(mins),
        sent: false,
      })
    }
  }

  if (rows.length > 0) {
    // Insert, ignoring conflicts (duplicate remind_at for same entry)
    for (const row of rows) {
      await supabase.from("scheduled_notifications").upsert(row, {
        onConflict: "calendar_entry_id,remind_at",
      })
    }
  }
}

/**
 * Deletes all scheduled notifications for an entry.
 */
export async function deleteEntryReminders(entryId: string) {
  const supabase = createClient()
  await supabase
    .from("scheduled_notifications")
    .delete()
    .eq("calendar_entry_id", entryId)
}

/**
 * Hook that runs on the calendar page (or layout).
 * Checks every 60 seconds for pending reminders and fires notifications.
 */
export function useNotificationScheduler(userId: string | undefined) {
  const lastCheckRef = useRef(0)

  const checkAndSend = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    const now = new Date().toISOString()

    // Find pending reminders that are due
    const { data: pending } = await supabase
      .from("scheduled_notifications")
      .select("*, calendar_entries(title, type, source, start_time, all_day, location)")
      .eq("user_id", userId)
      .eq("sent", false)
      .lte("remind_at", now)
      .order("remind_at", { ascending: true })
      .limit(20)

    if (!pending || pending.length === 0) return

    for (const reminder of pending) {
      const entry = (reminder as any).calendar_entries
      if (!entry) continue

      const isDeadline = ["property", "document", "bill", "vet_record", "maintenance"].includes(entry.source || "")
      const entryType = entry.type === "task" ? "task" : isDeadline ? "deadline" : "event"

      let actionUrl = "/scheduler/calendar"
      if (entry.source === "task_page" || entry.source === "maintenance") {
        actionUrl = "/scheduler/tasks"
      }

      const notifType = entry.type === "meeting" || entry.source === "meeting"
        ? "appointment" as const
        : "reminder" as const

      await sendNotification({
        userId,
        type: notifType,
        priority: isDeadline ? "high" : "medium",
        title: `${entry.title}`,
        message: `${reminder.reminder_label}: ${entry.title}${entry.location ? ` at ${entry.location}` : ""}`,
        actionUrl,
        actionLabel: `View ${entryType}`,
        metadata: {
          calendar_entry_id: reminder.calendar_entry_id,
          entry_type: entry.type,
          entry_source: entry.source,
        },
      })

      // Mark as sent
      await supabase
        .from("scheduled_notifications")
        .update({ sent: true, sent_at: now })
        .eq("id", reminder.id)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Check immediately on mount
    checkAndSend()

    // Then check every 60 seconds
    const interval = setInterval(checkAndSend, 60000)
    return () => clearInterval(interval)
  }, [userId, checkAndSend])
}

// ─── Reminder option presets for UI ─────────────────────────

export const REMINDER_PRESETS = [
  { value: 0, label: "At time of event" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 720, label: "12 hours before" },
  { value: 1440, label: "1 day before" },
  { value: 2880, label: "2 days before" },
  { value: 10080, label: "1 week before" },
]