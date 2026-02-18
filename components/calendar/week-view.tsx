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
      {/* Header row — day names + all-day events */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border/60">
        {/* Empty corner cell */}
        <div className="border-r border-border/30" />

        {days.map((d, i) => {
          const allDay = getAllDayEntries(d)
          const today = isToday(d)

          return (
            <div
              key={i}
              className={`border-r border-border/30 last:border-r-0 px-1.5 pt-2 pb-1.5 min-h-[56px] ${
                today ? "bg-primary/[0.03]" : ""
              }`}
            >
              {/* Day header */}
              <div className="flex flex-col items-center mb-1.5">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    today
                      ? "text-primary"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {DAY_NAMES[d.getDay()]}
                </span>
                <button
                  className={`text-lg font-semibold w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                    today
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => onDayClick(d)}
                >
                  {d.getDate()}
                </button>
              </div>

              {/* All-day chips */}
              {allDay.length > 0 && (
                <div className="space-y-0.5">
                  {allDay.map((e, j) => (
                    <AllDayChip
                      key={`${e.id}-${j}`}
                      entry={e}
                      onEdit={onEdit}
                      onToggleComplete={onToggleComplete}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div ref={timeGridRef} className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] relative">
          {/* Time labels column */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="h-16 flex items-start justify-end pr-3"
              >
                <span className="text-[11px] font-medium text-muted-foreground/60 -mt-[7px] tabular-nums select-none">
                  {h > 0 ? formatHour(h) : ""}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, i) => {
            const timed = getTimedEntries(d)
            const today = isToday(d)

            return (
              <div
                key={i}
                className={`relative border-r border-border/30 last:border-r-0 cursor-pointer ${
                  today ? "bg-primary/[0.02]" : ""
                }`}
                onClick={() => onCreateClick(d)}
              >
                {HOURS.map((h) => (
                  <div key={h} className="h-16 relative group/slot">
                    {/* Hour line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-border/50" />
                    {/* Half-hour line */}
                    <div className="absolute top-8 left-0 right-0 h-px bg-border/20" />
                    {/* Hover highlight */}
                    <div className="absolute inset-0 opacity-0 group-hover/slot:opacity-100 bg-primary/[0.03] transition-opacity duration-150" />
                  </div>
                ))}
                {/* Bottom border */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-border/50" />

                {today && <NowIndicator />}

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