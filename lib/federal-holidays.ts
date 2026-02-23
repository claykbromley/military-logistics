import type { CalendarEntry } from "@/app/scheduler/calendar/types"
import { HOLIDAY_COLOR } from "@/app/scheduler/calendar/constants"

// Calculates the Nth weekday of a month (e.g. 3rd Monday of January)
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1)
  const firstWeekday = first.getDay()
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7
  return new Date(year, month, day)
}

// Last Monday of May
function lastMonday(year: number, month: number): Date {
  const last = new Date(year, month + 1, 0)
  const dayOfWeek = last.getDay()
  const diff = (dayOfWeek + 6) % 7
  return new Date(year, month, last.getDate() - diff)
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Returns federal holidays for the given year as read-only CalendarEntry objects.
 * These have `source: "holiday"` and `type: "event"` so they render
 * in all calendar views but are clearly distinguishable from user entries.
 */
export function getFederalHolidays(year: number): CalendarEntry[] {
  const holidays: { name: string; date: Date }[] = [
    { name: "New Year's Day", date: new Date(year, 0, 1) },
    { name: "Martin Luther King Jr. Day", date: nthWeekday(year, 0, 1, 3) },
    { name: "Presidents' Day", date: nthWeekday(year, 1, 1, 3) },
    { name: "Memorial Day", date: lastMonday(year, 4) },
    { name: "Juneteenth", date: new Date(year, 5, 19) },
    { name: "Independence Day", date: new Date(year, 6, 4) },
    { name: "Labor Day", date: nthWeekday(year, 8, 1, 1) },
    { name: "Columbus Day", date: nthWeekday(year, 9, 1, 2) },
    { name: "Veterans Day", date: new Date(year, 10, 11) },
    { name: "Thanksgiving Day", date: nthWeekday(year, 10, 4, 4) },
    { name: "Christmas Day", date: new Date(year, 11, 25) },
  ]

  return holidays.map((h) => {
    const dateStr = toDateStr(h.date)
    const startTime = new Date(`${dateStr}T00:00:00`).toISOString()
    const endTime = new Date(`${dateStr}T23:59:59`).toISOString()

    return {
      id: `holiday-${dateStr}-${h.name.replace(/\s+/g, "-").toLowerCase()}`,
      user_id: "",
      type: "event" as const,
      title: h.name,
      description: "Federal Holiday",
      color: HOLIDAY_COLOR,
      start_time: startTime,
      end_time: endTime,
      all_day: true,
      is_recurring: false,
      recurrence_freq: null,
      recurrence_interval: 1,
      recurrence_days: null,
      recurrence_end: null,
      recurrence_monthly_mode: null,
      recurrence_count: null,
      excluded_dates: null,
      is_completed: false,
      source: "holiday",
      location: null,
      timezone: null,
      meeting_link: null,
      created_at: startTime,
      updated_at: startTime,
    }
  })
}