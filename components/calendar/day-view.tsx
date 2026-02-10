"use client"

import { format } from "date-fns"
import type { CalendarEvent } from "@/lib/calendar-types"
import { getEventColor, HOLIDAY_STYLE } from "@/lib/event-colors"
import { cn } from "@/lib/utils"

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  isLoggedIn: boolean
  onEditEvent: (event: CalendarEvent) => void
  onClickHour: (hour: number) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 64

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
          {allDayEvents.map((event) => {
            const isHoliday = !!event.is_holiday
            const style = isHoliday ? HOLIDAY_STYLE : getEventColor(event.color)
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => {
                  if (!isHoliday && isLoggedIn) onEditEvent(event)
                }}
                className={cn(
                  "text-left rounded px-3 py-1.5 text-sm font-medium border",
                  style.bg,
                  style.text,
                  style.border,
                  !isHoliday && isLoggedIn && "cursor-pointer",
                  !isHoliday && isLoggedIn && style.bgHover
                )}
              >
                {event.title}
              </button>
            )
          })}
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
              className="flex border-b border-border cursor-pointer hover:bg-accent/30 transition-colors"
              style={{ height: `${HOUR_HEIGHT}px` }}
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
                  const ec = getEventColor(event.color)
                  const startMin = timeToMinutes(event.start_time!)
                  const endMin = timeToMinutes(event.end_time!)
                  const duration = Math.max(endMin - startMin, 15)
                  const offsetMin = startMin % 60
                  const top = (offsetMin / 60) * HOUR_HEIGHT
                  const height = (duration / 60) * HOUR_HEIGHT

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isLoggedIn) onEditEvent(event)
                      }}
                      className={cn(
                        "absolute left-2 right-2 rounded-md px-2 py-1 text-xs font-medium border overflow-hidden transition-colors z-10",
                        ec.bg,
                        ec.text,
                        ec.border,
                        ec.bgHover
                      )}
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 20)}px`,
                        minHeight: "20px",
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", ec.dot)} />
                        <span className="font-semibold truncate">{event.title}</span>
                      </div>
                      {height >= 32 && (
                        <span className="text-[10px] opacity-70 ml-3.5">
                          {event.start_time} - {event.end_time}
                        </span>
                      )}
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
