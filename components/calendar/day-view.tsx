"use client"

import { format } from "date-fns"
import type { CalendarEvent } from "@/lib/calendar-types"
import { getEventColor, HOLIDAY_STYLE, COMPLETED_STYLE, formatMilitaryTime } from "@/lib/event-colors"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Star, Users, Phone, Video, Repeat } from "lucide-react"

function EventTypeIcon({ type }: { type?: string }) {
  switch (type) {
    case "meeting": return <Users className="h-3 w-3 shrink-0" />
    case "call": return <Phone className="h-3 w-3 shrink-0" />
    case "video": return <Video className="h-3 w-3 shrink-0" />
    default: return null
  }
}

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  isLoggedIn: boolean
  onEditEvent: (event: CalendarEvent) => void
  onToggleComplete: (event: CalendarEvent) => void
  onClickHour: (hour: number) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 60

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = format(date, "yyyy-MM-dd")
  return events.filter((event) => dateStr >= event.start_date && dateStr <= event.end_date)
}

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`
}

export function DayView({
  currentDate,
  events,
  isLoggedIn,
  onEditEvent,
  onToggleComplete,
  onClickHour,
}: DayViewProps) {
  const dayEvents = getEventsForDate(events, currentDate)
  const allDayEvents = dayEvents.filter((e) => e.is_all_day)
  const timedEvents = dayEvents.filter((e) => !e.is_all_day && e.start_time)

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      {/* All-day / holiday events */}
      {allDayEvents.length > 0 && (
        <div className="flex flex-col gap-1.5 px-4 py-3 border-b border-border bg-muted/20">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            All Day
          </span>
          {allDayEvents.map((event) => {
            const isHoliday = !!event.is_holiday
            const style = isHoliday ? HOLIDAY_STYLE : getEventColor(event.color ?? undefined)
            const isCompleted = !isHoliday && !!event.completed

            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm border transition-colors",
                  style.bg,
                  style.border,
                  isCompleted && COMPLETED_STYLE.overlay
                )}
              >
                {isHoliday ? (
                  <Star className="h-4 w-4 shrink-0 text-primary" />
                ) : isLoggedIn ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleComplete(event)
                    }}
                    className="shrink-0 transition-colors"
                    aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className={cn("h-4 w-4", style.text)} />
                    ) : (
                      <Circle className={cn("h-4 w-4", style.text, "opacity-50")} />
                    )}
                  </button>
                ) : (
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", style.dot)} />
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!isHoliday && isLoggedIn) onEditEvent(event)
                  }}
                  className={cn(
                    "flex-1 text-left font-medium truncate",
                    style.text,
                    isCompleted && COMPLETED_STYLE.title,
                    !isHoliday && isLoggedIn && "cursor-pointer"
                  )}
                >
                  {event.title}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 relative">
        {HOURS.map((hour) => {
          const eventsThisHour = timedEvents.filter((e) => {
            const startMin = timeToMinutes(e.start_time!)
            return Math.floor(startMin / 60) === hour
          })

          return (
            <div
              key={hour}
              className="flex border-b border-border/60 cursor-pointer hover:bg-accent/20 transition-colors"
              style={{ height: `${HOUR_HEIGHT}px` }}
              onClick={() => onClickHour(hour)}
            >
              <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-1 border-r border-border/60">
                <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                  {formatHourLabel(hour)}
                </span>
              </div>
              <div className="flex-1 relative px-2">
                {eventsThisHour.map((event) => {
                  const ec = getEventColor(event.color ?? undefined)
                  const startMin = timeToMinutes(event.start_time!)
                  const endMin = timeToMinutes(event.end_time!)
                  const duration = Math.max(endMin - startMin, 15)
                  const offsetMin = startMin % 60
                  const top = (offsetMin / 60) * HOUR_HEIGHT
                  const height = (duration / 60) * HOUR_HEIGHT
                  const isCompleted = !!event.completed

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "absolute left-2 right-2 rounded-lg border overflow-hidden transition-all z-10 flex items-start",
                        ec.bg,
                        ec.border,
                        isCompleted && COMPLETED_STYLE.overlay
                      )}
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 24)}px`,
                        minHeight: "24px",
                      }}
                    >
                      {/* Complete toggle */}
                      {isLoggedIn && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleComplete(event)
                          }}
                          className="shrink-0 p-1.5"
                          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className={cn("h-3.5 w-3.5", ec.text)} />
                          ) : (
                            <Circle className={cn("h-3.5 w-3.5", ec.text, "opacity-50")} />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isLoggedIn) onEditEvent(event)
                        }}
                        className={cn(
                          "flex flex-col justify-center py-1 pr-2 flex-1 min-w-0 text-left",
                          !isLoggedIn && "pl-2",
                          isLoggedIn && "cursor-pointer"
                        )}
                      >
                        <span className={cn(
                          "text-xs font-semibold truncate flex items-center gap-1",
                          ec.text,
                          isCompleted && COMPLETED_STYLE.title
                        )}>
                          <EventTypeIcon type={event.event_type} />
                          {event.title}
                          {event.is_recurring && <Repeat className="h-2.5 w-2.5 shrink-0 opacity-60" />}
                        </span>
                        {height >= 36 && (
                          <span className={cn("text-[10px] tabular-nums", ec.text, "opacity-70")}>
                            {formatMilitaryTime(event.start_time)} - {formatMilitaryTime(event.end_time)}
                          </span>
                        )}
                      </button>
                    </div>
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
