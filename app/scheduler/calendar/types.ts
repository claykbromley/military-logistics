export type EntryType = "event" | "task"
export type RecurrenceFreq = "daily" | "weekly" | "monthly" | "yearly"
export type CalendarView = "day" | "week" | "month" | "year"

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
  is_completed: boolean
  source: string | null
  location: string | null
  created_at: string
  updated_at: string
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
  location: string
  //source: "meeting"
}