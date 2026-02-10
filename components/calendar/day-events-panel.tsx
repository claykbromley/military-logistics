"use client"

import type { CalendarEvent } from "@/lib/calendar-types"
import { format, parseISO } from "date-fns"
import { Clock, Star, Pencil } from "lucide-react"
import { getEventColor, HOLIDAY_STYLE } from "@/lib/event-colors"
import { cn } from "@/lib/utils"

interface DayEventsPanelProps {
  date: Date
  events: CalendarEvent[]
  isLoggedIn: boolean
  onEditEvent: (event: CalendarEvent) => void
}

export function DayEventsPanel({
  date,
  events,
  isLoggedIn,
  onEditEvent,
}: DayEventsPanelProps) {
  const holidays = events.filter((e) => e.is_holiday)
  const userEvents = events.filter((e) => !e.is_holiday)

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">
        {format(date, "EEEE, MMMM d, yyyy")}
      </h3>

      {events.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No events for this day.
          {isLoggedIn && " Click + to add one."}
        </p>
      )}

      {holidays.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {holidays.map((event) => (
            <div
              key={event.id}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm border",
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
          {userEvents.map((event) => {
            const ec = getEventColor(event.color)
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => isLoggedIn && onEditEvent(event)}
                className={cn(
                  "flex items-start gap-2 rounded-md px-3 py-2 text-sm text-left border transition-colors",
                  ec.bg,
                  ec.border,
                  isLoggedIn && ec.bgHover,
                  isLoggedIn && "cursor-pointer"
                )}
              >
                <span className={cn("mt-1.5 h-2.5 w-2.5 rounded-full shrink-0", ec.dot)} />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className={cn("font-medium truncate", ec.text)}>
                    {event.title}
                  </span>
                  {event.is_all_day ? (
                    <span className="text-xs text-muted-foreground">All day</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {event.start_time} - {event.end_time}
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
                  <Pencil className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
