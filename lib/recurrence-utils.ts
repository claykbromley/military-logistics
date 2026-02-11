import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  getDay,
  isBefore,
  isAfter,
  parseISO,
  format,
  startOfMonth,
  setDay,
} from "date-fns"
import type { RecurrenceConfig, CalendarEvent } from "./calendar-types"

/**
 * Get the nth occurrence of a specific weekday in a given month.
 * e.g. getNthWeekdayOfMonth(2026, 1, 2, 3) = 3rd Tuesday of Feb 2026
 */
function getNthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  weekOfMonth: number
): Date {
  const first = startOfMonth(new Date(year, month))
  const firstDayOfWeek = getDay(first)
  let offset = dayOfWeek - firstDayOfWeek
  if (offset < 0) offset += 7
  const firstOccurrence = addDays(first, offset)
  return addWeeks(firstOccurrence, weekOfMonth - 1)
}

/**
 * Expand a recurring event into individual occurrences within a date range.
 */
export function expandRecurringEvent(
  event: CalendarEvent,
  rangeStart: string,
  rangeEnd: string
): CalendarEvent[] {
  const recurrence = event.recurrence
  if (!recurrence || recurrence.type === "none") return [event]

  const start = parseISO(rangeStart)
  const end = parseISO(rangeEnd)
  const eventStart = parseISO(event.start_date)
  const occurrences: CalendarEvent[] = []

  const maxOccurrences = recurrence.endCount || 365
  const endDate = recurrence.endDate ? parseISO(recurrence.endDate) : null
  let count = 0

  const generate = (getNext: (date: Date, i: number) => Date) => {
    for (let i = 0; count < maxOccurrences; i++) {
      const occDate = getNext(eventStart, i)
      if (endDate && isAfter(occDate, endDate)) break
      if (isAfter(occDate, end)) break
      if (!isBefore(occDate, start)) {
        const dateStr = format(occDate, "yyyy-MM-dd")
        occurrences.push({
          ...event,
          id: `${event.id}_rec_${dateStr}`,
          start_date: dateStr,
          end_date: dateStr,
          source_id: event.source_id || event.id,
        })
        count++
      }
    }
  }

  switch (recurrence.type) {
    case "daily":
      generate((base, i) => addDays(base, i * (recurrence.interval || 1)))
      break

    case "weekdays":
      generate((base, i) => {
        let d = addDays(base, i)
        while (getDay(d) === 0 || getDay(d) === 6) d = addDays(d, 1)
        return d
      })
      break

    case "weekly":
    case "biweekly": {
      const weekInterval =
        recurrence.type === "biweekly" ? 2 : recurrence.interval || 1
      const targetDays = recurrence.daysOfWeek?.length
        ? recurrence.daysOfWeek
        : [getDay(eventStart)]

      for (let w = 0; count < maxOccurrences; w++) {
        const weekStart = addWeeks(eventStart, w * weekInterval)
        for (const dow of targetDays) {
          const occDate = setDay(weekStart, dow, { weekStartsOn: 0 })
          if (isBefore(occDate, eventStart)) continue
          if (endDate && isAfter(occDate, endDate)) break
          if (isAfter(occDate, end)) break
          if (!isBefore(occDate, start)) {
            const dateStr = format(occDate, "yyyy-MM-dd")
            occurrences.push({
              ...event,
              id: `${event.id}_rec_${dateStr}`,
              start_date: dateStr,
              end_date: dateStr,
              source_id: event.source_id || event.id,
            })
            count++
          }
        }
        if (endDate && isAfter(weekStart, endDate)) break
        if (isAfter(weekStart, end)) break
      }
      break
    }

    case "monthly": {
      const dayOfWeek =
        recurrence.dayOfWeek ?? getDay(eventStart)
      const weekOfMonth =
        recurrence.weekOfMonth ??
        Math.ceil(eventStart.getDate() / 7)
      for (let m = 0; count < maxOccurrences; m++) {
        const baseMonth = addMonths(eventStart, m * (recurrence.interval || 1))
        const occDate = getNthWeekdayOfMonth(
          baseMonth.getFullYear(),
          baseMonth.getMonth(),
          dayOfWeek,
          weekOfMonth
        )
        if (endDate && isAfter(occDate, endDate)) break
        if (isAfter(occDate, end)) break
        if (!isBefore(occDate, start)) {
          const dateStr = format(occDate, "yyyy-MM-dd")
          occurrences.push({
            ...event,
            id: `${event.id}_rec_${dateStr}`,
            start_date: dateStr,
            end_date: dateStr,
            source_id: event.source_id || event.id,
          })
          count++
        }
      }
      break
    }

    case "yearly":
      generate((base, i) => addYears(base, i * (recurrence.interval || 1)))
      break
  }

  return occurrences.length > 0 ? occurrences : [event]
}

/** Human-readable recurrence description */
export function describeRecurrence(r: RecurrenceConfig): string {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const ORDINALS = ["", "1st", "2nd", "3rd", "4th", "5th"]

  switch (r.type) {
    case "none":
      return ""
    case "daily":
      return r.interval === 1 ? "Every day" : `Every ${r.interval} days`
    case "weekdays":
      return "Every weekday (Mon-Fri)"
    case "weekly":
      if (r.daysOfWeek?.length) {
        const dayNames = r.daysOfWeek.map((d) => DAYS[d]).join(", ")
        return r.interval === 1
          ? `Weekly on ${dayNames}`
          : `Every ${r.interval} weeks on ${dayNames}`
      }
      return r.interval === 1 ? "Weekly" : `Every ${r.interval} weeks`
    case "biweekly":
      if (r.daysOfWeek?.length) {
        return `Every 2 weeks on ${r.daysOfWeek.map((d) => DAYS[d]).join(", ")}`
      }
      return "Every 2 weeks"
    case "monthly": {
      const ord = ORDINALS[r.weekOfMonth || 1]
      const day = DAYS[r.dayOfWeek ?? 0]
      return r.interval === 1
        ? `Monthly on the ${ord} ${day}`
        : `Every ${r.interval} months on the ${ord} ${day}`
    }
    case "yearly":
      return r.interval === 1 ? "Yearly" : `Every ${r.interval} years`
    default:
      return ""
  }
}
