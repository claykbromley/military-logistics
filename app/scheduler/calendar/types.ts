export type EntryType = "event" | "task" | "meeting"
export type RecurrenceFreq = "daily" | "weekly" | "monthly" | "yearly"
export type RecurrenceMonthlyMode = "day_of_month" | "day_of_week"
export type RecurrenceEndMode = "never" | "on_date" | "after_count"
export type CalendarView = "day" | "week" | "month" | "year"
export type InvitationStatus = "pending" | "accepted" | "declined" | "tentative"

export interface CalendarEntry {
  id: string
  user_id: string
  type: EntryType
  title: string
  description: string | null
  color: string
  start_time: string
  end_time: string | null
  all_day: boolean
  is_recurring: boolean
  recurrence_freq: RecurrenceFreq | null
  recurrence_interval: number
  recurrence_days: number[] | null
  recurrence_end: string | null
  recurrence_monthly_mode: RecurrenceMonthlyMode | null
  recurrence_count: number | null
  excluded_dates: string[] | null
  is_completed: boolean
  source: string | null
  location: string | null
  timezone: string | null
  meeting_link: string | null
  linked_entity_tag: string | null
  task_list_id: string | null
  task_priority: string
  task_sort_order: number
  created_at: string
  updated_at: string
}

export interface EventInvitation {
  id: string
  event_id: string
  contact_id: string | null
  invitee_email: string
  invitee_name: string | null
  status: InvitationStatus
  response_message: string | null
  access_token: string | null
  notified_at: string | null
  responded_at: string | null
  created_at: string
  user_id: string | null
}

export interface InviteeInput {
  email: string
  name?: string
  contactId?: string
}

export interface EntryFormData {
  type: EntryType
  title: string
  description: string
  color: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  all_day: boolean
  is_recurring: boolean
  recurrence_freq: RecurrenceFreq
  recurrence_interval: number
  recurrence_days: number[]
  recurrence_end: string
  recurrence_end_mode: RecurrenceEndMode
  recurrence_monthly_mode: RecurrenceMonthlyMode
  recurrence_count: number
  location: string
  timezone: string
  meeting_link: string
  invitees: InviteeInput[]
}