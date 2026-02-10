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
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CalendarEvent } from "@/lib/calendar-types"
import { GOLD_DOT, HOLIDAY_STYLE } from "@/lib/event-colors"
import { cn } from "@/lib/utils"

interface MiniMonthCalendarProps {
  currentMonth: Date
  selectedDate: Date
  events: CalendarEvent[]
  onSelectDate: (date: Date) => void
  onChangeMonth: (date: Date) => void
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

export function MiniMonthCalendar({
  currentMonth,
  selectedDate,
  events,
  onSelectDate,
  onChangeMonth,
}: MiniMonthCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function getDotColor(day: Date): string | null {
    const dateStr = format(day, "yyyy-MM-dd")
    const dayEvents = events.filter(
      (e) => dateStr >= e.start_date && dateStr <= e.end_date
    )
    if (dayEvents.length === 0) return null
    const hasHoliday = dayEvents.some((e) => e.is_holiday)
    if (hasHoliday) return HOLIDAY_STYLE.dot
    return GOLD_DOT
  }

  return (
    <div className="flex flex-col">
      {/* Month header with nav */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onChangeMonth(subMonths(currentMonth, 1))}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeMonth(addMonths(currentMonth, 1))}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={`${day}-${i}`}
            className="h-7 flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)
          const selected = isSameDay(day, selectedDate)
          const dotColor = getDotColor(day)

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative h-8 w-full flex flex-col items-center justify-center rounded-md transition-colors text-xs",
                !inMonth && "text-muted-foreground/40",
                inMonth && !selected && !today && "text-foreground hover:bg-accent/60",
                today && !selected && "text-primary font-bold",
                selected && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              {format(day, "d")}
              {/* Event dot */}
              {dotColor && (
                <span
                  className={cn(
                    "absolute bottom-0.5 h-1 w-1 rounded-full",
                    selected ? "bg-primary-foreground" : dotColor
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
