import { Check, Repeat } from "lucide-react"
import type { CalendarEntry } from "../../app/scheduler/calendar/types"
import { formatTime } from "../../app/scheduler/calendar/utils"

interface EntryChipProps {
  entry: CalendarEntry
  compact?: boolean
  onEdit: (entry: CalendarEntry) => void
  onToggleComplete: (entry: CalendarEntry) => void
}

export function EntryChip({ entry, compact = false, onEdit, onToggleComplete }: EntryChipProps) {
  const start = new Date(entry.start_time)
  const isTask = entry.type === "task"

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onEdit(entry)
      }}
      className={`group flex items-center gap-1 rounded px-1.5 py-0.5 text-left transition-all hover:shadow-md cursor-pointer w-full overflow-hidden ${
        entry.is_completed ? "opacity-50" : ""
      }`}
      style={{
        backgroundColor: `${entry.color}18`,
        borderLeft: `3px solid ${entry.color}`,
      }}
      title={entry.title}
    >
      {isTask && (
        <span
          className="flex-shrink-0 w-3 h-3 rounded-sm border flex items-center justify-center"
          style={{ borderColor: entry.color }}
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete(entry)
          }}
        >
          {entry.is_completed && (
            <Check className="w-2 h-2" style={{ color: entry.color }} />
          )}
        </span>
      )}
      {!isTask && (
        <span
          className="flex-shrink-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
      )}
      <span
        className={`text-xs font-medium truncate ${entry.is_completed ? "line-through" : ""}`}
        style={{ color: entry.color }}
      >
        {!compact && !entry.all_day && (
          <span className="opacity-70 mr-1">{formatTime(start)}</span>
        )}
        {entry.title}
      </span>
      {entry.is_recurring && (
        <Repeat className="flex-shrink-0 w-2.5 h-2.5 opacity-50" style={{ color: entry.color }} />
      )}
    </button>
  )
}

interface AllDayChipProps {
  entry: CalendarEntry
  onEdit: (entry: CalendarEntry) => void
  onToggleComplete: (entry: CalendarEntry) => void
}

export function AllDayChip({ entry, onEdit, onToggleComplete }: AllDayChipProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onEdit(entry)
      }}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white cursor-pointer hover:shadow-md transition-all w-full truncate"
      style={{ backgroundColor: entry.color }}
    >
      {entry.type === "task" && (
        <span
          className="flex-shrink-0 w-3 h-3 rounded-sm border border-white/50 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete(entry)
          }}
        >
          {entry.is_completed && <Check className="w-2 h-2 text-white" />}
        </span>
      )}
      <span className={entry.is_completed ? "line-through opacity-70" : ""}>
        {entry.title}
      </span>
    </button>
  )
}

interface TimeGridEntryProps {
  entry: CalendarEntry
  onEdit: (entry: CalendarEntry) => void
  onToggleComplete: (entry: CalendarEntry) => void
}

export function TimeGridEntry({ entry, onEdit, onToggleComplete }: TimeGridEntryProps) {
  const start = new Date(entry.start_time)
  const end = entry.end_time
    ? new Date(entry.end_time)
    : new Date(start.getTime() + 3600000)
  const topPx = (start.getHours() + start.getMinutes() / 60) * 64
  const durationHours = (end.getTime() - start.getTime()) / 3600000
  const heightPx = Math.max(durationHours * 64, 20)

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onEdit(entry)
      }}
      className={`absolute left-1 right-1 rounded-md px-2 py-1 text-xs font-medium cursor-pointer hover:shadow-lg transition-shadow overflow-hidden ${
        entry.is_completed ? "opacity-50" : ""
      }`}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        backgroundColor: `${entry.color}dd`,
        color: "white",
        zIndex: 10,
      }}
      title={`${entry.title} – ${formatTime(start)}`}
    >
      <div className="flex items-center gap-1">
        {entry.type === "task" && (
          <span
            className="flex-shrink-0 w-3 h-3 rounded-sm border border-white/50 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete(entry)
            }}
          >
            {entry.is_completed && <Check className="w-2 h-2 text-white" />}
          </span>
        )}
        <span className={entry.is_completed ? "line-through" : ""}>
          {entry.title}
        </span>
      </div>
      {heightPx > 32 && (
        <div className="opacity-75 mt-0.5">
          {formatTime(start)} – {formatTime(end)}
        </div>
      )}
    </button>
  )
}