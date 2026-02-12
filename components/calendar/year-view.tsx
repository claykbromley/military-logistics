"use client"

import type { CalendarEntry } from "../../app/scheduler/calendar/types"
import { DAY_NAMES, MONTH_NAMES } from "../../app/scheduler/calendar/constants"
import { isToday, getMonthDays } from "../../app/scheduler/calendar/utils"

interface YearViewProps {
  currentDate: Date
  getEntriesForDay: (d: Date) => CalendarEntry[]
  onMonthClick: (year: number, month: number) => void
  onDayClick: (d: Date) => void
}

export function YearView({
  currentDate,
  getEntriesForDay,
  onMonthClick,
  onDayClick,
}: YearViewProps) {
  const year = currentDate.getFullYear()

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
        {Array.from({ length: 12 }, (_, m) => {
          const days = getMonthDays(year, m)
          return (
            <div key={m} className="select-none">
              <button
                onClick={() => onMonthClick(year, m)}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors mb-2 cursor-pointer"
              >
                {MONTH_NAMES[m]}
              </button>
              <div className="grid grid-cols-7 gap-0">
                {DAY_NAMES.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[9px] text-muted-foreground py-0.5"
                  >
                    {d[0]}
                  </div>
                ))}
                {days.map((d, i) => {
                  const inMonth = d.getMonth() === m
                  const today = isToday(d)
                  const hasEntries = getEntriesForDay(d).length > 0

                  return (
                    <button
                      key={i}
                      onClick={() => onDayClick(d)}
                      className={`
                        w-6 h-6 text-[10px] rounded-full flex items-center justify-center mx-auto relative cursor-pointer
                        ${!inMonth ? "text-transparent" : "text-foreground hover:bg-muted"}
                        ${today && inMonth ? "bg-primary text-primary-foreground font-bold" : ""}
                      `}
                    >
                      {inMonth ? d.getDate() : ""}
                      {hasEntries && inMonth && !today && (
                        <span className="absolute bottom-0 w-1 h-1 rounded-full bg-primary/60" />
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