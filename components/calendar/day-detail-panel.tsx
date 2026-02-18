"use client"

import { Plus } from "lucide-react"
import type { CalendarEntry } from "../../app/scheduler/calendar/types"
import { DAY_NAMES_FULL } from "../../app/scheduler/calendar/constants"
import { EntryChip } from "./entry-chips"

interface DayDetailPanelProps {
  selectedDate: Date
  hasUser: boolean
  getEntriesForDay: (d: Date) => CalendarEntry[]
  onCreateClick: () => void
  onEdit: (entry: CalendarEntry) => void
  onToggleComplete: (entry: CalendarEntry) => void
}

export function DayDetailPanel({
  selectedDate,
  hasUser,
  getEntriesForDay,
  onCreateClick,
  onEdit,
  onToggleComplete,
}: DayDetailPanelProps) {
  const dayEntries = getEntriesForDay(selectedDate)
  const events = dayEntries.filter((e) => e.type === "event")
  const tasks = dayEntries.filter((e) => e.type === "task")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-foreground">
            {selectedDate.getDate()}
          </div>
          <div className="text-xs text-muted-foreground">
            {DAY_NAMES_FULL[selectedDate.getDay()]}
          </div>
        </div>
        {hasUser && (
          <button
            onClick={onCreateClick}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {dayEntries.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No events or tasks
        </p>
      )}

      {events.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Events
          </div>
          <div className="space-y-1">
            {events.map((e, i) => (
              <EntryChip
                key={`${e.id}-${i}`}
                entry={e}
                onEdit={onEdit}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Tasks
          </div>
          <div className="space-y-1">
            {tasks.map((e, i) => (
              <EntryChip
                key={`${e.id}-${i}`}
                entry={e}
                onEdit={onEdit}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}