import type { CalendarEvent } from "./calendar-types"

// Calculates the Nth weekday of a month (e.g. 3rd Monday of January)
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1)
  const firstWeekday = first.getDay()
  let day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7
  return new Date(year, month, day)
}

// Last Monday of May
function lastMonday(year: number, month: number): Date {
  const last = new Date(year, month + 1, 0) // last day of month
  const dayOfWeek = last.getDay()
  const diff = (dayOfWeek + 6) % 7 // days since last Monday
  return new Date(year, month, last.getDate() - diff)
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function getFederalHolidays(year: number): CalendarEvent[] {
  const holidays: { name: string; date: Date }[] = [
    { name: "New Year's Day", date: new Date(year, 0, 1) },
    {
      name: "Martin Luther King Jr. Day",
      date: nthWeekday(year, 0, 1, 3), // 3rd Monday of Jan
    },
    {
      name: "Presidents' Day",
      date: nthWeekday(year, 1, 1, 3), // 3rd Monday of Feb
    },
    {
      name: "Memorial Day",
      date: lastMonday(year, 4), // Last Monday of May
    },
    { name: "Juneteenth", date: new Date(year, 5, 19) },
    { name: "Independence Day", date: new Date(year, 6, 4) },
    {
      name: "Labor Day",
      date: nthWeekday(year, 8, 1, 1), // 1st Monday of Sep
    },
    {
      name: "Columbus Day",
      date: nthWeekday(year, 9, 1, 2), // 2nd Monday of Oct
    },
    { name: "Veterans Day", date: new Date(year, 10, 11) },
    {
      name: "Thanksgiving Day",
      date: nthWeekday(year, 10, 4, 4), // 4th Thursday of Nov
    },
    { name: "Christmas Day", date: new Date(year, 11, 25) },
  ]

  return holidays.map((h) => {
    const dateStr = formatDate(h.date)
    return {
      id: `holiday-${dateStr}-${h.name.replace(/\s/g, "-")}`,
      title: h.name,
      start_date: dateStr,
      end_date: dateStr,
      is_all_day: true,
      is_holiday: true,
      color: "holiday",
    }
  })
}
