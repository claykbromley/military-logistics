import { CalendarDays, Users, CircleCheckBig, Check, Repeat, Star, MapPin } from "lucide-react"
import type { CalendarEntry } from "../../app/scheduler/calendar/types"
import { formatTime } from "../../app/scheduler/calendar/utils"
import { HOLIDAY_COLOR, HOLIDAY_ACCENT } from "../../app/scheduler/calendar/constants"

// ─── Helpers ──────────────────────────────────────────────

const isHoliday = (entry: CalendarEntry) => entry.source === "holiday"
const isMeeting = (entry: CalendarEntry) => entry.source === "meeting"

/** Returns the appropriate icon component for an entry */
function getEntryIcon(entry: CalendarEntry) {
  if (isHoliday(entry)) return Star
  if (entry.type === "task") return CircleCheckBig
  if (isMeeting(entry)) return Users
  return CalendarDays
}

// ─── EntryChip (month cells, mini-calendar, etc.) ─────────

interface EntryChipProps {
  entry: CalendarEntry
  compact?: boolean
  onEdit: (entry: CalendarEntry) => void
  onToggleComplete: (entry: CalendarEntry) => void
}

export function EntryChip({ entry, compact = false, onEdit, onToggleComplete }: EntryChipProps) {
  const start = new Date(entry.start_time)
  const isTask = entry.type === "task"
  const holiday = isHoliday(entry)
  const Icon = getEntryIcon(entry)

  const chipColor = holiday ? HOLIDAY_COLOR : entry.color
  const textColor = holiday ? HOLIDAY_ACCENT : entry.color

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (!holiday) onEdit(entry)
      }}
      className={`group flex items-center gap-1.5 rounded-md px-1.5 py-[3px] text-left transition-all w-full overflow-hidden ${
        holiday ? "cursor-default" : "hover:shadow-md cursor-pointer"
      } ${entry.is_completed ? "opacity-50" : ""}`}
      style={{
        backgroundColor: `${chipColor}14`,
        borderLeft: `3px solid ${chipColor}`,
      }}
      title={entry.title}
    >
      {/* Icon / checkbox */}
      {isTask ? (
        <span
          className={`flex-shrink-0 w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
            entry.is_completed ? "" : "hover:bg-opacity-20"
          }`}
          style={{
            borderColor: chipColor,
            backgroundColor: entry.is_completed ? chipColor : "transparent",
          }}
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete(entry)
          }}
        >
          {entry.is_completed && (
            <Check className="w-2 h-2 text-white" strokeWidth={3} />
          )}
        </span>
      ) : (
        <Icon
          className="flex-shrink-0 w-3 h-3"
          style={{ color: textColor }}
          strokeWidth={2.5}
        />
      )}

      {/* Label */}
      <span
        className={`text-[11px] font-medium truncate leading-tight ${
          entry.is_completed ? "line-through" : ""
        }`}
        style={{ color: textColor }}
      >
        {!compact && !entry.all_day && (
          <span className="opacity-60 mr-1 font-normal">{formatTime(start)}</span>
        )}
        {entry.title}
      </span>

      {/* Recurrence indicator */}
      {entry.is_recurring && (
        <Repeat
          className="flex-shrink-0 w-2.5 h-2.5 opacity-40"
          style={{ color: textColor }}
        />
      )}
    </button>
  )
}

// ─── AllDayChip (all-day bar across day/week views) ───────

interface AllDayChipProps {
  entry: CalendarEntry
  onEdit: (entry: CalendarEntry) => void
  onToggleComplete: (entry: CalendarEntry) => void
}

export function AllDayChip({ entry, onEdit, onToggleComplete }: AllDayChipProps) {
  const isTask = entry.type === "task"
  const holiday = isHoliday(entry)
  const Icon = getEntryIcon(entry)

  const bgColor = holiday ? HOLIDAY_COLOR : entry.color
  const fgColor = holiday ? HOLIDAY_ACCENT : "#ffffff"

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (!holiday) onEdit(entry)
      }}
      className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all w-full truncate overflow-hidden ${
        holiday
          ? "cursor-default"
          : "cursor-pointer hover:shadow-md active:scale-[0.995]"
      }`}
      style={{
        background: holiday
          ? `linear-gradient(135deg, ${HOLIDAY_COLOR}, ${HOLIDAY_COLOR}ee)`
          : `linear-gradient(135deg, ${bgColor}f0, ${bgColor}cc)`,
        color: fgColor,
        boxShadow: holiday
          ? `inset 0 0 0 1px ${HOLIDAY_ACCENT}40, 0 1px 2px ${HOLIDAY_COLOR}30`
          : `0 1px 3px ${bgColor}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}
    >
      {/* Subtle top highlight for glass effect */}
      <div
        className="absolute inset-x-0 top-0 h-[1px] opacity-20"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
      />

      {isTask ? (
        <span
          className="relative flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] border-white/50 flex items-center justify-center hover:border-white/80 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete(entry)
          }}
        >
          {entry.is_completed && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
        </span>
      ) : (
        <Icon className="relative flex-shrink-0 w-3.5 h-3.5 opacity-90" strokeWidth={2} />
      )}
      <span className={`relative truncate ${entry.is_completed ? "line-through opacity-70" : ""}`}>
        {entry.title}
      </span>
      {entry.is_recurring && (
        <Repeat className="relative flex-shrink-0 w-3 h-3 opacity-50 ml-auto" strokeWidth={2} />
      )}
    </button>
  )
}

// ─── TimeGridEntry (positioned block in day/week grids) ───

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
  const heightPx = Math.max(durationHours * 64, 26)

  const isTask = entry.type === "task"
  const holiday = isHoliday(entry)
  const Icon = getEntryIcon(entry)

  const bgColor = holiday ? HOLIDAY_COLOR : entry.color
  const fgColor = holiday ? HOLIDAY_ACCENT : "#ffffff"

  // Size tiers for progressive detail
  const isCompact = heightPx < 34
  const isMedium = heightPx >= 34 && heightPx < 56
  const isTall = heightPx >= 56

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (!holiday) onEdit(entry)
      }}
      className={`absolute left-1.5 right-1.5 rounded-lg overflow-hidden transition-all group/entry ${
        holiday ? "cursor-default" : "cursor-pointer hover:shadow-xl hover:scale-[1.01] active:scale-[0.995]"
      } ${entry.is_completed ? "opacity-45" : ""}`}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        background: holiday
          ? `linear-gradient(160deg, ${HOLIDAY_COLOR}, ${HOLIDAY_COLOR}dd)`
          : `linear-gradient(160deg, ${bgColor}f2, ${bgColor}d0)`,
        color: fgColor,
        zIndex: 10,
        boxShadow: holiday
          ? `0 2px 8px ${HOLIDAY_COLOR}40, inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 2px 8px ${bgColor}35, inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
      title={`${entry.title} – ${formatTime(start)}`}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{
          background: holiday
            ? `linear-gradient(180deg, ${HOLIDAY_ACCENT}, ${HOLIDAY_ACCENT}80)`
            : `linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))`,
        }}
      />

      {/* Top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-20"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
      />

      {/* Content */}
      <div className={`relative h-full flex flex-col ${isCompact ? "px-2 py-0.5 justify-center" : "px-2.5 py-1.5"}`}>
        {/* Title row — always visible */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isTask ? (
            <span
              className="flex-shrink-0 w-3.5 h-3.5 rounded-full border-[1.5px] border-white/50 flex items-center justify-center hover:border-white/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onToggleComplete(entry)
              }}
            >
              {entry.is_completed && <Check className="w-2 h-2" strokeWidth={3} />}
            </span>
          ) : (
            <Icon className="flex-shrink-0 w-3.5 h-3.5 opacity-80" strokeWidth={2} />
          )}
          <span className={`text-[11px] font-semibold truncate leading-snug ${entry.is_completed ? "line-through" : ""}`}>
            {entry.title}
          </span>
        </div>

        {/* Time range — medium+ blocks */}
        {(isMedium || isTall) && (
          <div className="flex items-center gap-1 mt-0.5 ml-[22px]">
            <span className="text-[10px] opacity-70 font-medium">
              {formatTime(start)} – {formatTime(end)}
            </span>
          </div>
        )}

        {/* Location — tall blocks only */}
        {isTall && entry.location && (
          <div className="flex items-center gap-1 mt-0.5 ml-[22px]">
            <MapPin className="w-2.5 h-2.5 opacity-50 flex-shrink-0" strokeWidth={2} />
            <span className="text-[10px] opacity-60 truncate">{entry.location}</span>
          </div>
        )}

        {/* Recurrence — tall blocks only */}
        {isTall && entry.is_recurring && (
          <div className="flex items-center gap-1 mt-auto ml-[22px] opacity-50">
            <Repeat className="w-2.5 h-2.5" strokeWidth={2} />
            <span className="text-[10px]">Repeats</span>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover/entry:opacity-100 bg-white/[0.06] transition-opacity duration-150 pointer-events-none rounded-lg" />
    </button>
  )
}