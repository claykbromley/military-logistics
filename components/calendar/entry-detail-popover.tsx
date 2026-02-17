"use client"

import { useState } from "react"
import {
  X,
  Clock,
  MapPin,
  AlignLeft,
  Repeat,
  Link2,
  Globe,
  Pencil,
  Trash2,
  CalendarDays,
  CheckSquare,
  Users,
  Mail,
  Check,
} from "lucide-react"
import type { CalendarEntry, EventInvitation } from "@/app/scheduler/calendar/types"
import { useEntryModal } from "./use-entry-modal"

// ─── Helpers ──────────────────────────────────────────────

function getEntryTypeLabel(entry: CalendarEntry): string {
  if (entry.source === "meeting") return "Meeting"
  if (entry.type === "task") return "Task"
  return "Event"
}

function getEntryTypeIcon(entry: CalendarEntry) {
  if (entry.source === "meeting") return Users
  if (entry.type === "task") return CheckSquare
  return CalendarDays
}

function formatDateTime(dateStr: string, allDay: boolean, timezone?: string | null): string {
  const d = new Date(dateStr)
  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }
  const datePart = d.toLocaleDateString("en-US", dateOpts)
  if (allDay) return datePart

  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
  const timePart = d.toLocaleTimeString("en-US", timeOpts)

  let tzLabel = ""
  if (timezone) {
    try {
      tzLabel = " " + (new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
      })
        .formatToParts(d)
        .find((p) => p.type === "timeZoneName")?.value || "")
    } catch { /* skip */ }
  }

  return `${datePart} at ${timePart}${tzLabel}`
}

function formatTimeRange(
  start: string,
  end: string | null,
  allDay: boolean,
  timezone?: string | null,
): string {
  if (allDay) return "All day"
  const s = new Date(start)
  const timeOpts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", hour12: true }
  const startTime = s.toLocaleTimeString("en-US", timeOpts)

  if (!end) return startTime

  const e = new Date(end)
  const endTime = e.toLocaleTimeString("en-US", timeOpts)

  let tzLabel = ""
  if (timezone) {
    try {
      tzLabel = " " + (new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
      })
        .formatToParts(s)
        .find((p) => p.type === "timeZoneName")?.value || "")
    } catch { /* skip */ }
  }

  return `${startTime} – ${endTime}${tzLabel}`
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  declined: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  tentative: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
}

const FREQ_LABELS: Record<string, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// ─── Detail Popover ───────────────────────────────────────

interface EntryDetailPopoverProps {
  entry: CalendarEntry
  invitations: EventInvitation[]
  onEdit: (entry: CalendarEntry) => void
  onDelete: (id: string) => void
  onClose: () => void
  onToggleComplete?: (entry: CalendarEntry) => void
}

export function EntryDetailPopover({
  entry,
  invitations,
  onEdit,
  onDelete,
  onClose,
  onToggleComplete,
}: EntryDetailPopoverProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const typeLabel = getEntryTypeLabel(entry)
  const TypeIcon = getEntryTypeIcon(entry)
  const isEvent = entry.type === "event" || entry.source === "meeting"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-3 border-b border-border">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${entry.color}20` }}
            >
              <TypeIcon className="w-5 h-5" style={{ color: entry.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${entry.color}18`,
                    color: entry.color,
                  }}
                >
                  {typeLabel}
                </span>
                {entry.is_completed && (
                  <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Completed
                  </span>
                )}
              </div>
              <h2 className={`text-lg font-semibold text-foreground leading-snug ${entry.is_completed ? "line-through opacity-60" : ""}`}>
                {entry.title}
              </h2>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {entry.type === "task" && onToggleComplete && !entry.is_completed && (
              <button
                onClick={() => onToggleComplete(entry)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer text-muted-foreground hover:text-green-600"
                title="Mark complete"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                onClose()
                onEdit(entry)
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              title={`Edit ${typeLabel}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer text-muted-foreground hover:text-destructive"
              title={`Delete ${typeLabel}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="px-4 py-3 bg-destructive/5 border-b border-border flex items-center justify-between">
            <span className="text-sm text-destructive font-medium">
              Delete this {typeLabel.toLowerCase()}?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete(entry.id)}
                className="text-xs bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md hover:bg-destructive/90 transition-colors cursor-pointer font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-1.5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <div>{formatDateTime(entry.start_time, entry.all_day, entry.timezone)}</div>
              {!entry.all_day && (
                <div className="text-muted-foreground mt-0.5">
                  {formatTimeRange(entry.start_time, entry.end_time, entry.all_day, entry.timezone)}
                </div>
              )}
              {entry.all_day && (
                <span className="inline-block mt-1 text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  All day
                </span>
              )}
            </div>
          </div>

          {/* Timezone */}
          {!entry.all_day && entry.timezone && (
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {entry.timezone.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {/* Location */}
          {entry.location && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{entry.location}</span>
            </div>
          )}

          {/* Meeting Link */}
          {entry.meeting_link && (
            <div className="flex items-start gap-3">
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <a
                href={entry.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate"
              >
                {entry.meeting_link}
              </a>
            </div>
          )}

          {/* Description */}
          {entry.description && (
            <div className="flex items-start gap-3">
              <AlignLeft className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground whitespace-pre-wrap">{entry.description}</p>
            </div>
          )}

          {/* Recurrence */}
          {entry.is_recurring && entry.recurrence_freq && (
            <div className="flex items-start gap-3">
              <Repeat className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <span>
                  Every {(entry.recurrence_interval || 1) > 1 ? `${entry.recurrence_interval} ` : ""}
                  {FREQ_LABELS[entry.recurrence_freq] || entry.recurrence_freq}
                  {(entry.recurrence_interval || 1) > 1 ? "s" : ""}
                </span>
                {entry.recurrence_freq === "weekly" && entry.recurrence_days?.length ? (
                  <span className="ml-1">
                    on {entry.recurrence_days.map((d) => DAY_NAMES[d]).join(", ")}
                  </span>
                ) : null}
                {entry.recurrence_end && (
                  <span className="ml-1">
                    · until {new Date(entry.recurrence_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Invitations */}
          {invitations.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {invitations.length} {invitations.length === 1 ? "Invitee" : "Invitees"}
                </span>
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-2 py-1 px-2 bg-muted/40 rounded-md"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {inv.invitee_name
                          ? `${inv.invitee_name} (${inv.invitee_email})`
                          : inv.invitee_email}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        statusColors[inv.status] || statusColors.pending
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Connected version — auto-wires to context ───────────

export function ConnectedEntryDetailPopover() {
  const {
    previewedEntry,
    previewInvitations,
    open,
    closePreview,
    deleteEntryById,
    toggleComplete,
  } = useEntryModal()

  if (!previewedEntry) return null

  return (
    <EntryDetailPopover
      entry={previewedEntry}
      invitations={previewInvitations}
      onEdit={(entry) => {
        closePreview()
        open(entry)
      }}
      onDelete={(id) => {
        deleteEntryById(id)
      }}
      onClose={closePreview}
      onToggleComplete={toggleComplete}
    />
  )
}