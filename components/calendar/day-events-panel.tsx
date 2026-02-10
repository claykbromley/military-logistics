"use client"

import type { CalendarEvent } from "@/lib/calendar-types"
import { format, parseISO } from "date-fns"
import { Clock, Star, Pencil, CheckCircle2, Circle } from "lucide-react"
import { getEventColor, HOLIDAY_STYLE, COMPLETED_STYLE, formatMilitaryTime } from "@/lib/event-colors"
import { cn } from "@/lib/utils"

interface DayEventsPanelProps {
  date: Date
  events: CalendarEvent[]
  isLoggedIn: boolean
  onEditEvent: (event: CalendarEvent) => void
  onToggleComplete: (event: CalendarEvent) => void
}

export function DayEventsPanel({
  date,
  events,
  isLoggedIn,
  onEditEvent,
  onToggleComplete,
}: DayEventsPanelProps) {
  const holidays = events.filter((e) => e.is_holiday)
  const userEvents = events.filter((e) => !e.is_holiday)

  return (
    <div className="flex flex-col gap-3">
      {events.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No events scheduled.
          {isLoggedIn && " Click + to add one."}
        </p>
      )}

      {holidays.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Holidays
          </span>
          {holidays.map((event) => (
            <div
              key={event.id}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm border",
                HOLIDAY_STYLE.bg,
                HOLIDAY_STYLE.border
              )}
            >
              <Star className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className={cn("font-medium", HOLIDAY_STYLE.text)}>
                {event.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {userEvents.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Events
          </span>
          {userEvents.map((event) => {
            const ec = getEventColor(event.color)
            const isCompleted = !!event.completed

            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-2 rounded-lg px-3 py-2 text-sm text-left border transition-colors",
                  ec.bg,
                  ec.border,
                  isCompleted && COMPLETED_STYLE.overlay
                )}
              >
                {/* Complete toggle */}
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => onToggleComplete(event)}
                    className="shrink-0 mt-0.5 transition-colors"
                    aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className={cn("h-4 w-4", ec.text)} />
                    ) : (
                      <Circle className={cn("h-4 w-4", ec.text, "opacity-50")} />
                    )}
                  </button>
                )}

                {!isLoggedIn && (
                  <span className={cn("mt-1.5 h-2.5 w-2.5 rounded-full shrink-0", ec.dot)} />
                )}

                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className={cn(
                    "font-medium truncate",
                    ec.text,
                    isCompleted && COMPLETED_STYLE.title
                  )}>
                    {event.title}
                  </span>
                  {event.is_all_day ? (
                    <span className="text-xs text-muted-foreground">All day</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                      <Clock className="h-3 w-3" />
                      {formatMilitaryTime(event.start_time)} - {formatMilitaryTime(event.end_time)}
                    </span>
                  )}
                  {event.start_date !== event.end_date && (
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(event.start_date), "MMM d")} -{" "}
                      {format(parseISO(event.end_date), "MMM d")}
                    </span>
                  )}
                </div>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => onEditEvent(event)}
                    className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Edit event"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
