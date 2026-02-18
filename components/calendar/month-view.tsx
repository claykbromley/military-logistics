"use client"

import { Plus } from "lucide-react"
import type { CalendarEntry } from "../../app/scheduler/calendar/types"
import { DAY_NAMES } from "../../app/scheduler/calendar/constants"
import { isSameDay, isToday, getMonthDays } from "../../app/scheduler/calendar/utils"
import { EntryChip } from "./entry-chips"

interface MonthViewProps {
  currentDate: Date
  selectedDate: Date
  hasUser: boolean
  getEntriesForDay: (d: Date) => CalendarEntry[]
  onSelectDate: (d: Date) => void
  onSetCurrentDate: (d: Date) => void
  onSetView: (v: "day") => void
  onCreateClick: (d: Date) => void
  onEdit: (entry: CalendarEntry) => void
  onToggleComplete: (entry: CalendarEntry) => void
}

export function MonthView({
  currentDate,
  selectedDate,
  hasUser,
  getEntriesForDay,
  onSelectDate,
  onSetCurrentDate,
  onSetView,
  onCreateClick,
  onEdit,
  onToggleComplete,
}: MonthViewProps) {
  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth())
  const maxShow = 3

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-muted-foreground py-2 border-r border-border last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-7 grid-rows-6 flex-1"
        style={{ minHeight: "calc(100vh - 260px)" }}
      >
        {days.map((d, i) => {
          const inMonth = d.getMonth() === currentDate.getMonth()
          const today = isToday(d)
          const dayEntries = getEntriesForDay(d)

          return (
            <div
              key={i}
              onClick={() => {
                onSelectDate(d)
                if (!inMonth) onSetCurrentDate(d)
              }}
              className={`
                border-r border-b border-border p-1 min-h-[100px] cursor-pointer transition-colors
                ${!inMonth ? "bg-muted/30" : "bg-card hover:bg-muted/20"}
                ${isSameDay(d, selectedDate) ? "ring-2 ring-primary/30 ring-inset" : ""}
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`
                    text-xs w-6 h-6 flex items-center justify-center rounded-full
                    ${today ? "bg-primary text-primary-foreground font-bold" : ""}
                    ${!inMonth ? "text-muted-foreground/50" : "text-foreground"}
                  `}
                >
                  {d.getDate()}
                </span>
                {isSameDay(d, selectedDate) && hasUser && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateClick(d)
                    }}
                    className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                {dayEntries.slice(0, maxShow).map((entry, j) => (
                  <EntryChip
                    key={`${entry.id}-${j}`}
                    entry={entry}
                    compact
                    onEdit={onEdit}
                    onToggleComplete={onToggleComplete}
                  />
                ))}
                {dayEntries.length > maxShow && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSetCurrentDate(d)
                      onSelectDate(d)
                      onSetView("day")
                    }}
                    className="text-[10px] text-primary font-medium hover:underline cursor-pointer pl-1"
                  >
                    +{dayEntries.length - maxShow} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}