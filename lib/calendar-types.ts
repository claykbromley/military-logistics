export interface CalendarEvent {
  id: string
  title: string
  start_date: string // ISO date string YYYY-MM-DD
  end_date: string // ISO date string YYYY-MM-DD
  is_all_day: boolean
  start_time?: string // HH:MM format
  end_time?: string // HH:MM format
  is_holiday?: boolean
  user_id?: string
  color?: string
  created_at?: string
}

export type CalendarView = "month" | "week" | "day"

export interface EventFormData {
  title: string
  start_date: string
  end_date: string
  is_all_day: boolean
  start_time: string
  end_time: string
  color: string
}
