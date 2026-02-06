"use client"

import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  isToday,
} from "date-fns"
import type { CalendarEvent } from "@/lib/calendar-types"
import { cn } from "@/lib/utils"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  isLoggedIn: boolean
  onEditEvent: (event: CalendarEvent) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = format(date, "yyyy-MM-dd")
  return events.filter((event) => dateStr >= event.start_date && dateStr <= event.end_date)
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function WeekView({
  currentDate,
  events,
  selectedDate,
  onSelectDate,
  isLoggedIn,
  onEditEvent,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border sticky top-0 z-10 bg-card">
        <div className="border-r border-border" />
        {days.map((day) => {
          const today = isToday(day)
          const selected = selectedDate && isSameDay(day, selectedDate)
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex flex-col items-center py-2.5 border-r border-border cursor-pointer hover:bg-accent/60 transition-colors",
                selected && "bg-primary/5"
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  today && "bg-primary text-primary-foreground",
                  !today && "text-foreground"
                )}
              >
                {format(day, "d")}
              </span>
            </button>
          )
        })}
      </div>

      {/* All-day events row */}
      {(() => {
        const hasAllDay = days.some((day) =>
          getEventsForDate(events, day).some((e) => e.is_all_day)
        )
        if (!hasAllDay) return null
        return (
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
            <div className="border-r border-border px-1 py-1.5 text-[10px] text-muted-foreground text-right pr-2">
              ALL DAY
            </div>
            {days.map((day) => {
              const allDayEvents = getEventsForDate(events, day).filter(
                (e) => e.is_all_day
              )
              return (
                <div
                  key={day.toISOString()}
                  className="border-r border-border px-0.5 py-1 flex flex-col gap-0.5 min-h-[28px]"
                >
                  {allDayEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => {
                        if (event.is_holiday) {
                          onSelectDate(day)
                        } else if (isLoggedIn) {
                          onEditEvent(event)
                        }
                      }}
                      className={cn(
                        "truncate rounded px-1 py-px text-[10px] font-medium text-left",
                        event.is_holiday
                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                          : "bg-primary/10 text-primary border border-primary/20",
                        !event.is_holiday && isLoggedIn && "cursor-pointer hover:bg-primary/20"
                      )}
                      title={event.title}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] flex-1 relative">
        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="border-r border-b border-border h-12 flex items-start justify-end pr-2 pt-0.5">
              <span className="text-[10px] text-muted-foreground">
                {hour === 0
                  ? "12 AM"
                  : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                      ? "12 PM"
                      : `${hour - 12} PM`}
              </span>
            </div>
            {days.map((day) => {
              const timedEvents = getEventsForDate(events, day).filter(
                (e) => !e.is_all_day && e.start_time
              )
              const eventsThisHour = timedEvents.filter((e) => {
                const startMin = timeToMinutes(e.start_time!)
                const startHour = Math.floor(startMin / 60)
                return startHour === hour
              })

              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="border-r border-b border-border h-12 relative cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => onSelectDate(day)}
                >
                  {eventsThisHour.map((event) => {
                    const startMin = timeToMinutes(event.start_time!)
                    const endMin = timeToMinutes(event.end_time!)
                    const offsetMin = startMin % 60
                    const duration = Math.max(endMin - startMin, 15)
                    const top = (offsetMin / 60) * 48
                    const height = Math.min((duration / 60) * 48, 96)

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isLoggedIn) onEditEvent(event)
                        }}
                        className="absolute left-0.5 right-0.5 rounded px-1 text-[10px] font-medium bg-primary/15 text-primary border border-primary/25 overflow-hidden hover:bg-primary/25 transition-colors z-10"
                        style={{ top: `${top}px`, height: `${height}px`, minHeight: "16px" }}
                        title={`${event.start_time} - ${event.end_time}: ${event.title}`}
                      >
                        {event.title}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
