"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CalendarEntry } from "../../app/scheduler/calendar/types"
import { DAY_NAMES, MONTH_NAMES_SHORT } from "../../app/scheduler/calendar/constants"
import { isSameDay, isToday, getMonthDays } from "../../app/scheduler/calendar/utils"

interface MiniCalendarProps {
  date: Date
  selectedDate: Date
  onSelect: (d: Date) => void
  getEntriesForDay: (d: Date) => CalendarEntry[]
}

export function MiniCalendar({
  date,
  selectedDate,
  onSelect,
  getEntriesForDay,
}: MiniCalendarProps) {
  const [miniDate, setMiniDate] = useState(date)
  const days = getMonthDays(miniDate.getFullYear(), miniDate.getMonth())

  useEffect(() => {
    setMiniDate(date)
  }, [date])

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES_SHORT[miniDate.getMonth()]} {miniDate.getFullYear()}
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() =>
              setMiniDate(new Date(miniDate.getFullYear(), miniDate.getMonth() - 1, 1))
            }
            className="p-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() =>
              setMiniDate(new Date(miniDate.getFullYear(), miniDate.getMonth() + 1, 1))
            }
            className="p-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {d[0]}
          </div>
        ))}
        {days.map((d, i) => {
          const inMonth = d.getMonth() === miniDate.getMonth()
          const selected = isSameDay(d, selectedDate)
          const today = isToday(d)
          const hasEntries = getEntriesForDay(d).length > 0

          return (
            <button
              key={i}
              onClick={() => onSelect(d)}
              className={`
                w-7 h-7 text-[11px] rounded-full flex items-center justify-center mx-auto relative cursor-pointer transition-colors
                ${!inMonth ? "text-muted-foreground/40" : "text-foreground"}
                ${selected ? "bg-primary text-primary-foreground" : ""}
                ${today && !selected ? "bg-primary/15 text-primary font-bold" : ""}
                ${!selected && inMonth ? "hover:bg-muted" : ""}
              `}
            >
              {d.getDate()}
              {hasEntries && !selected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary/60" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}