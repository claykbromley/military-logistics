"use client"

import { format } from "date-fns"
import type { CalendarEvent } from "@/lib/calendar-types"
import { cn } from "@/lib/utils"

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  isLoggedIn: boolean
  onEditEvent: (event: CalendarEvent) => void
  onClickHour: (hour: number) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = format(date, "yyyy-MM-dd")
  return events.filter((event) => dateStr >= event.start_date && dateStr <= event.end_date)
}

export function DayView({
  currentDate,
  events,
  isLoggedIn,
  onEditEvent,
  onClickHour,
}: DayViewProps) {
  const dayEvents = getEventsForDate(events, currentDate)
  const allDayEvents = dayEvents.filter((e) => e.is_all_day)
  const timedEvents = dayEvents.filter((e) => !e.is_all_day && e.start_time)

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card sticky top-0 z-10">
        <span className="text-2xl font-bold text-foreground">
          {format(currentDate, "d")}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {format(currentDate, "EEEE")}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(currentDate, "MMMM yyyy")}
          </span>
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="flex flex-col gap-1 px-4 py-2 border-b border-border bg-muted/30">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            All Day
          </span>
          {allDayEvents.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => {
                if (!event.is_holiday && isLoggedIn) onEditEvent(event)
              }}
              className={cn(
                "text-left rounded px-3 py-1.5 text-sm font-medium",
                event.is_holiday
                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                  : "bg-primary/10 text-primary border border-primary/20",
                !event.is_holiday && isLoggedIn && "cursor-pointer hover:bg-primary/20"
              )}
            >
              {event.title}
            </button>
          ))}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1">
        {HOURS.map((hour) => {
          const eventsThisHour = timedEvents.filter((e) => {
            const startMin = timeToMinutes(e.start_time!)
            return Math.floor(startMin / 60) === hour
          })

          return (
            <div
              key={hour}
              className="flex border-b border-border h-16 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => onClickHour(hour)}
            >
              <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-1 border-r border-border">
                <span className="text-xs text-muted-foreground">
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                        ? "12 PM"
                        : `${hour - 12} PM`}
                </span>
              </div>
              <div className="flex-1 relative px-2">
                {eventsThisHour.map((event) => {
                  const startMin = timeToMinutes(event.start_time!)
                  const endMin = timeToMinutes(event.end_time!)
                  const duration = Math.max(endMin - startMin, 15)
                  const offsetMin = startMin % 60
                  const top = (offsetMin / 60) * 64
                  const height = Math.min((duration / 60) * 64, 128)

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isLoggedIn) onEditEvent(event)
                      }}
                      className="absolute left-2 right-2 rounded-md px-2 py-1 text-xs font-medium bg-primary/15 text-primary border border-primary/25 overflow-hidden hover:bg-primary/25 transition-colors z-10"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        minHeight: "20px",
                      }}
                    >
                      <span className="font-semibold">{event.title}</span>
                      <span className="ml-1 text-primary/70">
                        {event.start_time} - {event.end_time}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
