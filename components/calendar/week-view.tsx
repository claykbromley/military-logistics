"use client"

import type React from "react"
import type { CalendarEntry } from "../../app/scheduler/calendar/types"
import { DAY_NAMES, HOURS } from "../../app/scheduler/calendar/constants"
import { isToday, getWeekDays, formatHour } from "../../app/scheduler/calendar/utils"
import { AllDayChip, TimeGridEntry } from "./entry-chips"
import { NowIndicator } from "./now-indicator"

interface WeekViewProps {
  currentDate: Date
  timeGridRef: React.RefObject<HTMLDivElement | null>
  getAllDayEntries: (d: Date) => CalendarEntry[]
  getTimedEntries: (d: Date) => CalendarEntry[]
  onDayClick: (d: Date) => void
  onCreateClick: (d: Date) => void
  onEdit: (entry: CalendarEntry) => void
  onToggleComplete: (entry: CalendarEntry) => void
}

export function WeekView({
  currentDate,
  timeGridRef,
  getAllDayEntries,
  getTimedEntries,
  onDayClick,
  onCreateClick,
  onEdit,
  onToggleComplete,
}: WeekViewProps) {
  const days = getWeekDays(currentDate)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* All-day row */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
        <div className="text-[10px] text-muted-foreground p-1 border-r border-border" />
        {days.map((d, i) => {
          const allDay = getAllDayEntries(d)
          return (
            <div
              key={i}
              className="border-r border-border last:border-r-0 p-1 min-h-[40px]"
            >
              <div className="flex flex-col items-center mb-1">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {DAY_NAMES[d.getDay()]}
                </span>
                <span
                  className={`text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-muted transition-colors ${
                    isToday(d)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                  onClick={() => onDayClick(d)}
                >
                  {d.getDate()}
                </span>
              </div>
              {allDay.map((e, j) => (
                <AllDayChip
                  key={`${e.id}-${j}`}
                  entry={e}
                  onEdit={onEdit}
                  onToggleComplete={onToggleComplete}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div ref={timeGridRef} className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
          {/* Time labels */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="h-16 border-b border-border flex items-start justify-end pr-2 pt-0"
              >
                <span className="text-[10px] text-muted-foreground -mt-2">
                  {h > 0 ? formatHour(h) : ""}
                </span>
              </div>
            ))}
          </div>
          {/* Day columns */}
          {days.map((d, i) => {
            const timed = getTimedEntries(d)
            return (
              <div
                key={i}
                className="relative border-r border-border last:border-r-0"
                onClick={() => onCreateClick(d)}
              >
                {HOURS.map((h) => (
                  <div key={h} className="h-16 border-b border-border" />
                ))}
                {isToday(d) && <NowIndicator />}
                {timed.map((e, j) => (
                  <TimeGridEntry
                    key={`${e.id}-${j}`}
                    entry={e}
                    onEdit={onEdit}
                    onToggleComplete={onToggleComplete}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}