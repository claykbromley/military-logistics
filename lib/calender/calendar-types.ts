// =============================================
// UNIFIED CALENDAR EVENT TYPES
// =============================================

/** Event types that appear in the communication hub */
export const COMM_EVENT_TYPES = ["meeting", "call", "video"] as const
export type CommEventType = (typeof COMM_EVENT_TYPES)[number]

/** All event types including calendar-only ones */
export const ALL_EVENT_TYPES = [
  "event",
  "meeting",
  "call",
  "video",
  "reminder",
  "task",
] as const
export type UnifiedEventType = (typeof ALL_EVENT_TYPES)[number]

/** Recurrence pattern types */
export type RecurrenceType =
  | "none"
  | "daily"
  | "weekdays"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly"

export interface RecurrenceConfig {
  type: RecurrenceType
  interval: number
  daysOfWeek?: number[] // 0=Sun..6=Sat for weekly/biweekly
  weekOfMonth?: number // 1-5 for monthly (e.g. 2nd)
  dayOfWeek?: number // 0-6 for monthly (e.g. Tuesday)
  endType: "never" | "date" | "count"
  endDate?: string
  endCount?: number
}

export const DEFAULT_RECURRENCE: RecurrenceConfig = {
  type: "none",
  interval: 1,
  endType: "never",
}

/** Unified event that works across calendar + command center */
export interface CalendarEvent {
  id: string
  title: string
  start_date: string
  end_date: string
  is_all_day: boolean
  start_time?: string | null
  end_time?: string | null
  color?: string | null
  completed?: boolean
  is_holiday?: boolean
  user_id?: string
  created_at?: string

  // Integration fields
  event_type?: UnifiedEventType
  description?: string | null
  meeting_link?: string | null
  location?: string | null
  is_recurring?: boolean
  recurrence?: RecurrenceConfig | null

  // Source tracking
  source?: "calendar" | "scheduled" | "holiday"
  source_id?: string
}

export interface EventFormData {
  title: string
  start_date: string
  end_date: string
  is_all_day: boolean
  start_time: string
  end_time: string
  color: string
  event_type: UnifiedEventType
  description: string
  meeting_link: string
  location: string
  is_recurring: boolean
  recurrence: RecurrenceConfig
}
