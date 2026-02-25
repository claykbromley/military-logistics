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

/**
 * Returns 35 days (5 weeks) for the month view grid.
 * Shows the current month plus leading/trailing days to fill 5 rows.
 */
export function getMonthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const startDay = first.getDay()
  const days: Date[] = []
  for (let i = -startDay; i < 35 - startDay; i++) {
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

// ─── Monthly recurrence helpers ─────────────────────────────

const ORDINALS = ["first", "second", "third", "fourth", "fifth"]
const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/** Returns which week-of-month occurrence a date falls on (0-based) */
export function getWeekOfMonth(d: Date): number {
  return Math.floor((d.getDate() - 1) / 7)
}

/** Returns a human label like "third Monday" for a given date */
export function getMonthlyDayOfWeekLabel(d: Date): string {
  const week = getWeekOfMonth(d)
  const day = DAY_LABELS[d.getDay()]
  return `${ORDINALS[week] || "last"} ${day}`
}

/**
 * Given a target month, find the Nth weekday (e.g. 3rd Monday).
 * weekOfMonth is 0-based, dayOfWeek is 0=Sun..6=Sat.
 */
function getNthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, weekOfMonth: number): Date {
  const first = new Date(year, month, 1)
  const firstDay = first.getDay()
  let day = 1 + ((dayOfWeek - firstDay + 7) % 7) + weekOfMonth * 7
  const result = new Date(year, month, day)
  // If we overflowed the month, the Nth occurrence doesn't exist this month
  if (result.getMonth() !== month) return new Date(NaN)
  return result
}

// ─── Next occurrence for recurring entries ──────────────────

/**
 * Returns the next occurrence date (at or after `asOf`) for a recurring entry.
 * For non-recurring entries, returns start_time as-is.
 * Returns null if the series has ended before `asOf`.
 */
export function getNextOccurrence(entry: CalendarEntry, asOf?: Date): Date | null {
  const now = asOf || new Date()
  const start = new Date(entry.start_time)

  if (!entry.is_recurring || !entry.recurrence_freq) {
    return start
  }

  const interval = entry.recurrence_interval || 1
  const recEnd = entry.recurrence_end ? new Date(entry.recurrence_end) : null
  const maxCount = entry.recurrence_count || Infinity
  const excludedSet = new Set(
    (entry.excluded_dates || []).map((d) => d.substring(0, 10))
  )

  let current = new Date(start)
  let iterations = 0
  let occurrenceCount = 0
  const maxIterations = 500

  while (iterations < maxIterations && occurrenceCount < maxCount) {
    iterations++

    if (recEnd && current > recEnd) break

    // Generate candidate dates for this iteration
    const candidates: Date[] = []

    if (entry.recurrence_freq === "weekly" && entry.recurrence_days?.length) {
      const weekStart = new Date(current)
      weekStart.setDate(current.getDate() - current.getDay())
      for (const dayNum of entry.recurrence_days) {
        const dayDate = new Date(weekStart)
        dayDate.setDate(weekStart.getDate() + dayNum)
        dayDate.setHours(start.getHours(), start.getMinutes(), 0, 0)
        if (dayDate >= start) candidates.push(dayDate)
      }
    } else if (
      entry.recurrence_freq === "monthly" &&
      entry.recurrence_monthly_mode === "day_of_week"
    ) {
      const weekOfMonth = getWeekOfMonth(start)
      const dayOfWeek = start.getDay()
      const target = getNthWeekdayOfMonth(
        current.getFullYear(),
        current.getMonth(),
        dayOfWeek,
        weekOfMonth
      )
      if (!isNaN(target.getTime())) {
        target.setHours(start.getHours(), start.getMinutes(), 0, 0)
        candidates.push(target)
      }
    } else {
      candidates.push(new Date(current))
    }

    for (const cand of candidates) {
      if (recEnd && cand > recEnd) continue
      if (cand < start) continue

      const dateKey = toLocalDateStr(cand)
      if (excludedSet.has(dateKey)) {
        occurrenceCount++
        continue
      }

      occurrenceCount++
      if (occurrenceCount > maxCount) return null

      // This is the next occurrence at or after now
      if (cand >= now) return cand
    }

    // Advance to next period
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

  return null // series ended or exhausted
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
    recurrence_end_mode: "never",
    recurrence_monthly_mode: "day_of_month",
    recurrence_count: 10,
    location: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    meeting_link: "",
    invitees: [],
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
  const maxCount = entry.recurrence_count || Infinity

  // Build excluded dates set for fast lookup
  const excludedSet = new Set(
    (entry.excluded_dates || []).map((d) => d.substring(0, 10))
  )

  let current = new Date(start)
  let iterations = 0
  let occurrenceCount = 0
  const maxIterations = 500

  function addOccurrence(occDate: Date) {
    // Check excluded dates
    const dateKey = toLocalDateStr(occDate)
    if (excludedSet.has(dateKey)) return

    occurrenceCount++
    if (occurrenceCount > maxCount) return

    if (
      occDate >= new Date(rangeStart.getTime() - duration) &&
      occDate <= rangeEnd &&
      occDate <= recEnd &&
      occDate >= start
    ) {
      entries.push({
        ...entry,
        start_time: occDate.toISOString(),
        end_time: entry.end_time
          ? new Date(occDate.getTime() + duration).toISOString()
          : null,
      })
    }
  }

  while (current <= recEnd && current <= rangeEnd && iterations < maxIterations && occurrenceCount < maxCount) {
    iterations++

    if (entry.recurrence_freq === "weekly" && entry.recurrence_days?.length) {
      const weekStart = new Date(current)
      weekStart.setDate(current.getDate() - current.getDay())
      for (const dayNum of entry.recurrence_days) {
        const dayDate = new Date(weekStart)
        dayDate.setDate(weekStart.getDate() + dayNum)
        dayDate.setHours(start.getHours(), start.getMinutes(), 0, 0)
        addOccurrence(dayDate)
      }
    } else if (
      entry.recurrence_freq === "monthly" &&
      entry.recurrence_monthly_mode === "day_of_week"
    ) {
      // E.g. "3rd Monday" — derive from original start date
      const weekOfMonth = getWeekOfMonth(start)
      const dayOfWeek = start.getDay()
      const target = getNthWeekdayOfMonth(
        current.getFullYear(),
        current.getMonth(),
        dayOfWeek,
        weekOfMonth
      )
      if (!isNaN(target.getTime())) {
        target.setHours(start.getHours(), start.getMinutes(), 0, 0)
        addOccurrence(target)
      }
    } else {
      addOccurrence(current)
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