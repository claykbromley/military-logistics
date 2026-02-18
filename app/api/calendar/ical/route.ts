// app/api/calendar/ical/route.ts
// --------------------------------------------------
// Public iCal feed – subscribe via URL in Google Calendar
// URL format: /api/calendar/ical?token=<UUID>
// --------------------------------------------------

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use service role to bypass RLS – we validate via the ical token
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

function formatICalDate(date: Date, allDay: boolean): string {
  if (allDay) {
    const y = date.getUTCFullYear()
    const m = String(date.getUTCMonth() + 1).padStart(2, "0")
    const d = String(date.getUTCDate()).padStart(2, "0")
    return `${y}${m}${d}`
  }
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function buildRRule(entry: any): string | null {
  if (!entry.is_recurring || !entry.recurrence_freq) return null

  const freqMap: Record<string, string> = {
    daily: "DAILY",
    weekly: "WEEKLY",
    monthly: "MONTHLY",
    yearly: "YEARLY",
  }

  let rule = `RRULE:FREQ=${freqMap[entry.recurrence_freq]}`

  if (entry.recurrence_interval && entry.recurrence_interval > 1) {
    rule += `;INTERVAL=${entry.recurrence_interval}`
  }

  if (entry.recurrence_freq === "weekly" && entry.recurrence_days?.length) {
    const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]
    const days = entry.recurrence_days.map((d: number) => dayMap[d]).join(",")
    rule += `;BYDAY=${days}`
  }

  if (entry.recurrence_end) {
    const endDate = new Date(entry.recurrence_end)
    rule += `;UNTIL=${formatICalDate(endDate, false)}`
  }

  return rule
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  // Validate token and get user_id
  const { data: tokenRow, error: tokenError } = await supabase
    .from("calendar_ical_tokens")
    .select("user_id")
    .eq("token", token)
    .single()

  if (tokenError || !tokenRow) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 })
  }

  // Fetch all entries for this user
  const { data: entries, error: entriesError } = await supabase
    .from("calendar_entries")
    .select("*")
    .eq("user_id", tokenRow.user_id)
    .order("start_time", { ascending: true })

  if (entriesError) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }

  // Build iCal
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Milify//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Milify Calendar",
    "X-WR-TIMEZONE:UTC",
  ]

  for (const entry of entries || []) {
    const start = new Date(entry.start_time)
    const end = entry.end_time
      ? new Date(entry.end_time)
      : entry.all_day
        ? new Date(start.getTime() + 86400000)
        : new Date(start.getTime() + 3600000)

    const isTask = entry.type === "task"
    const component = isTask ? "VTODO" : "VEVENT"

    lines.push(`BEGIN:${component}`)
    lines.push(`UID:${entry.id}@milify.app`)
    lines.push(`DTSTAMP:${formatICalDate(new Date(entry.created_at), false)}`)

    if (entry.all_day) {
      lines.push(`DTSTART;VALUE=DATE:${formatICalDate(start, true)}`)
      if (!isTask) {
        lines.push(`DTEND;VALUE=DATE:${formatICalDate(end, true)}`)
      }
    } else {
      lines.push(`DTSTART:${formatICalDate(start, false)}`)
      if (!isTask) {
        lines.push(`DTEND:${formatICalDate(end, false)}`)
      }
    }

    lines.push(`SUMMARY:${escapeICalText(entry.title)}`)

    if (entry.description) {
      lines.push(`DESCRIPTION:${escapeICalText(entry.description)}`)
    }

    if (entry.location) {
      lines.push(`LOCATION:${escapeICalText(entry.location)}`)
    }

    if (isTask && entry.is_completed) {
      lines.push("STATUS:COMPLETED")
    }

    const rrule = buildRRule(entry)
    if (rrule) {
      lines.push(rrule)
    }

    lines.push(`LAST-MODIFIED:${formatICalDate(new Date(entry.updated_at), false)}`)
    lines.push(`END:${component}`)
  }

  lines.push("END:VCALENDAR")

  const icalContent = lines.join("\r\n")

  return new NextResponse(icalContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="milify-calendar.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}