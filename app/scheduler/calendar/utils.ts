import type { CalendarEntry, EntryFormData } from "./types"

// ─── Date comparison ────────────────────────────────────────

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(d: Date) {
  return isSameDay(d, new Date())
}

// ─── Formatting ─────────────────────────────────────────────

export function formatTime(date: Date) {
  const h = date.getHours()
  const m = date.getMinutes()
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`
}

export function formatHour(h: number) {
  if (h === 0) return "12 AM"
  if (h < 12) return `${h} AM`
  if (h === 12) return "12 PM"
  return `${h - 12} PM`
}

export function toLocalDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

export function toLocalTimeStr(d: Date) {
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

// ─── Calendar grid helpers ──────────────────────────────────

export function getMonthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const startDay = first.getDay()
  const days: Date[] = []
  for (let i = -startDay; i < 42 - startDay; i++) {
    days.push(new Date(year, month, i + 1))
  }
  return days
}

export function getWeekDays(date: Date): Date[] {
  const d = new Date(date)
  const day = d.getDay()
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start)
    dd.setDate(start.getDate() + i)
    return dd
  })
}

// ─── Default form data ──────────────────────────────────────

export function defaultFormData(date?: Date): EntryFormData {
  const now = date || new Date()
  const endTime = new Date(now.getTime() + 3600000)
  return {
    type: "event",
    title: "",
    description: "",
    color: "#3b82f6",
    start_date: toLocalDateStr(now),
    start_time: toLocalTimeStr(now),
    end_date: toLocalDateStr(endTime),
    end_time: toLocalTimeStr(endTime),
    all_day: false,
    is_recurring: false,
    recurrence_freq: "weekly",
    recurrence_interval: 1,
    recurrence_days: [],
    recurrence_end: "",
    location: "",
  }
}

// ─── Recurrence expansion ───────────────────────────────────

export function expandRecurring(
  entry: CalendarEntry,
  rangeStart: Date,
  rangeEnd: Date
): CalendarEntry[] {
  if (!entry.is_recurring || !entry.recurrence_freq) return [entry]

  const entries: CalendarEntry[] = []
  const start = new Date(entry.start_time)
  const duration = entry.end_time
    ? new Date(entry.end_time).getTime() - start.getTime()
    : 3600000
  const recEnd = entry.recurrence_end ? new Date(entry.recurrence_end) : rangeEnd
  const interval = entry.recurrence_interval || 1

  let current = new Date(start)
  let iterations = 0
  const maxIterations = 500

  while (current <= recEnd && current <= rangeEnd && iterations < maxIterations) {
    iterations++
    if (current >= new Date(rangeStart.getTime() - duration)) {
      if (entry.recurrence_freq === "weekly" && entry.recurrence_days?.length) {
        const weekStart = new Date(current)
        weekStart.setDate(current.getDate() - current.getDay())
        for (const dayNum of entry.recurrence_days) {
          const dayDate = new Date(weekStart)
          dayDate.setDate(weekStart.getDate() + dayNum)
          dayDate.setHours(start.getHours(), start.getMinutes(), 0, 0)
          if (
            dayDate >= rangeStart &&
            dayDate <= rangeEnd &&
            dayDate <= recEnd &&
            dayDate >= start
          ) {
            entries.push({
              ...entry,
              start_time: dayDate.toISOString(),
              end_time: entry.end_time
                ? new Date(dayDate.getTime() + duration).toISOString()
                : null,
            })
          }
        }
      } else {
        entries.push({
          ...entry,
          start_time: current.toISOString(),
          end_time: entry.end_time
            ? new Date(current.getTime() + duration).toISOString()
            : null,
        })
      }
    }

    switch (entry.recurrence_freq) {
      case "daily":
        current.setDate(current.getDate() + interval)
        break
      case "weekly":
        current.setDate(current.getDate() + 7 * interval)
        break
      case "monthly":
        current.setMonth(current.getMonth() + interval)
        break
      case "yearly":
        current.setFullYear(current.getFullYear() + interval)
        break
    }
  }

  return entries.length > 0 ? entries : [entry]
}