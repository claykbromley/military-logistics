"use client"

import type React from "react"
import type { CalendarEntry } from "../../app/scheduler/calendar/types"
import { HOURS } from "../../app/scheduler/calendar/constants"
import { isToday, formatHour } from "../../app/scheduler/calendar/utils"
import { AllDayChip, TimeGridEntry } from "./entry-chips"
import { NowIndicator } from "./now-indicator"

interface DayViewProps {
  currentDate: Date
  timeGridRef: React.RefObject<HTMLDivElement | null>
  getAllDayEntries: (d: Date) => CalendarEntry[]
  getTimedEntries: (d: Date) => CalendarEntry[]
  onCreateClick: (d: Date) => void
  onEdit: (entry: CalendarEntry) => void
  onToggleComplete: (entry: CalendarEntry) => void
}

export function DayView({
  currentDate,
  timeGridRef,
  getAllDayEntries,
  getTimedEntries,
  onCreateClick,
  onEdit,
  onToggleComplete,
}: DayViewProps) {
  const allDay = getAllDayEntries(currentDate)
  const timed = getTimedEntries(currentDate)
  const today = isToday(currentDate)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* All-day section */}
      {allDay.length > 0 && (
        <div className="border-b border-border/60 px-3 py-2 space-y-1.5 bg-muted/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              All Day
            </span>
            <span className="text-[10px] text-muted-foreground/50 bg-muted rounded-full px-1.5 py-0.5">
              {allDay.length}
            </span>
          </div>
          <div className="grid gap-1">
            {allDay.map((e, j) => (
              <AllDayChip
                key={`${e.id}-${j}`}
                entry={e}
                onEdit={onEdit}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div ref={timeGridRef} className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[64px_1fr] relative min-h-full">
          {/* Time labels */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="h-16 flex items-start justify-end pr-3 relative"
              >
                <span className="text-[11px] font-medium text-muted-foreground/60 -mt-[7px] tabular-nums select-none">
                  {h > 0 ? formatHour(h) : ""}
                </span>
              </div>
            ))}
          </div>

          {/* Content column */}
          <div
            className="relative border-l border-border/40 cursor-pointer"
            onClick={() => onCreateClick(currentDate)}
          >
            {HOURS.map((h) => (
              <div key={h} className="h-16 relative group/slot">
                {/* Hour line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-border/50" />
                {/* Half-hour line */}
                <div className="absolute top-8 left-0 right-0 h-px bg-border/20 border-dashed" />
                {/* Hover highlight */}
                <div className="absolute inset-0 opacity-0 group-hover/slot:opacity-100 bg-primary/[0.03] transition-opacity duration-150" />
              </div>
            ))}
            {/* Bottom border for last hour */}
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
        </div>
      </div>
    </div>
  )
}