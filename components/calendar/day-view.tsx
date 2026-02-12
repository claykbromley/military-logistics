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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* All-day */}
      {allDay.length > 0 && (
        <div className="border-b border-border p-2 space-y-1 bg-muted/20">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            All Day
          </span>
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

      {/* Time grid */}
      <div ref={timeGridRef} className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_1fr] relative min-h-full">
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="h-16 border-b border-border flex items-start justify-end pr-2"
              >
                <span className="text-[10px] text-muted-foreground -mt-2">
                  {h > 0 ? formatHour(h) : ""}
                </span>
              </div>
            ))}
          </div>
          <div
            className="relative border-l border-border"
            onClick={() => onCreateClick(currentDate)}
          >
            {HOURS.map((h) => (
              <div key={h} className="h-16 border-b border-border" />
            ))}
            {isToday(currentDate) && <NowIndicator />}
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