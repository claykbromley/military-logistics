"use client"

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import type { CalendarEvent } from "@/lib/calendar-types"
import { getEventColor, HOLIDAY_STYLE } from "@/lib/event-colors"
import { cn } from "@/lib/utils"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = format(date, "yyyy-MM-dd")
  return events.filter((event) => {
    return dateStr >= event.start_date && dateStr <= event.end_date
  })
}

export function MonthView({
  currentDate,
  events,
  selectedDate,
  onSelectDate,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  return (
    <div className="flex flex-col flex-1">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = getEventsForDate(events, day)
          const inMonth = isSameMonth(day, currentDate)
          const today = isToday(day)
          const selected = selectedDate && isSameDay(day, selectedDate)
          const holidays = dayEvents.filter((e) => e.is_holiday)
          const userEvents = dayEvents.filter((e) => !e.is_holiday)

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex flex-col items-start p-1.5 md:p-2 border-b border-r border-border text-left transition-colors min-h-[80px] md:min-h-[100px] cursor-pointer",
                !inMonth && "bg-muted/40",
                inMonth && "bg-card",
                selected && "bg-primary/5 ring-2 ring-inset ring-primary/30",
                "hover:bg-accent/60"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full text-xs md:text-sm",
                  !inMonth && "text-muted-foreground/50",
                  inMonth && "text-foreground",
                  today && "bg-primary text-primary-foreground font-bold",
                  selected && !today && "font-semibold"
                )}
              >
                {format(day, "d")}
              </span>

              <div className="flex flex-col gap-0.5 mt-1 w-full overflow-hidden">
                {holidays.slice(0, 1).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "truncate rounded px-1 py-px text-[10px] md:text-xs font-medium border",
                      HOLIDAY_STYLE.bg,
                      HOLIDAY_STYLE.text,
                      HOLIDAY_STYLE.border
                    )}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {userEvents.slice(0, 2).map((event) => {
                  const ec = getEventColor(event.color)
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-center gap-1 truncate rounded px-1 py-px text-[10px] md:text-xs font-medium border",
                        ec.bg,
                        ec.text,
                        ec.border
                      )}
                      title={event.title}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", ec.dot)} />
                      {event.is_all_day
                        ? event.title
                        : `${event.start_time} ${event.title}`}
                    </div>
                  )
                })}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
