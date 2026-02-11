"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Plus, Repeat, Clock, Phone, Video, Users, Trash2, Edit,
  Calendar, Bell, MoreVertical, Check, ExternalLink, MapPin,
  Link as LinkIcon, AlertCircle, ChevronRight, SkipForward,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScheduledEvent, EventType } from "@/lib/types"
import { useCommunicationHub } from "@/hooks/use-communication-hub"
import { createClient } from "@/lib/supabase/client"
import { format, isToday, isTomorrow, isThisWeek, addHours, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { InvitationsInbox } from "@/components/command-center/event-invitations"

// Shared unified modal
import { EventFormDialogComm } from "@/components/calendar/event-form-dialog-comm"
import type { CalendarEvent, EventFormData, RecurrenceConfig } from "@/lib/calendar-types"
import { formatMilitaryTime } from "@/lib/event-colors"

// ============================================
// HELPER: Convert a calendar_events row into ScheduledEvent shape
// ============================================

function calendarEventToScheduled(row: any): ScheduledEvent {
  const startTime = row.start_time
    ? `${row.start_date}T${row.start_time.slice(0, 5)}:00`
    : `${row.start_date}T00:00:00`
  const endTime = row.end_time
    ? `${row.end_date || row.start_date}T${row.end_time.slice(0, 5)}:00`
    : `${row.end_date || row.start_date}T23:59:00`

  const startDt = new Date(startTime)
  const endDt = new Date(endTime)
  const durationMs = endDt.getTime() - startDt.getTime()
  const durationMinutes = Math.max(Math.round(durationMs / 60000), 1)

  const rec = row.recurrence as any | null

  return {
    id: `cal_${row.id}`,
    user_id: row.user_id,
    title: row.title,
    description: row.description || undefined,
    eventType: (row.event_type || "meeting") as EventType,
    startTime: startDt.toISOString(),
    endTime: endDt.toISOString(),
    durationMinutes,
    location: row.location || undefined,
    meetingLink: row.meeting_link || undefined,
    isRecurring: row.is_recurring || false,
    recurrencePattern: rec?.type || undefined,
    recurrenceInterval: rec?.interval || undefined,
    recurrenceEndDate: rec?.endDate || undefined,
    recurrenceCount: rec?.endCount || undefined,
    status: row.completed ? "completed" : "scheduled",
    notes: undefined,
    invitations: [],
    createdAt: row.created_at,
    updatedAt: row.created_at,
  }
}

// ============================================
// CONSTANTS
// ============================================

const eventTypeIcons: Record<EventType, any> = {
  call: Phone,
  video: Video,
  meeting: Users,
  reminder: Bell,
}

const eventTypeColors: Record<EventType, string> = {
  call: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  video: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  meeting: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  reminder: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return `Today at ${format(date, "HH:mm")}`
  if (isTomorrow(date)) return `Tomorrow at ${format(date, "HH:mm")}`
  if (isThisWeek(date)) return format(date, "EEEE 'at' HH:mm")
  return format(date, "MMM d 'at' HH:mm")
}

function getRecurrenceSummary(event: ScheduledEvent): string | null {
  if (!event.isRecurring) return null

  const interval = event.recurrenceInterval || 1
  const pattern = event.recurrencePattern || "weekly"

  let summary = `Every ${interval > 1 ? interval + " " : ""}${pattern === "daily"
    ? interval > 1 ? "days" : "day"
    : pattern === "weekly"
      ? interval > 1 ? "weeks" : "week"
      : interval > 1 ? "months" : "month"
    }`

  if (event.recurrenceEndDate) {
    summary += ` until ${format(new Date(event.recurrenceEndDate + "T00:00:00"), "MMM d, yyyy")}`
  } else if (event.recurrenceCount) {
    summary += ` \u00B7 ${event.recurrenceCount} occurrences`
  }

  return summary
}

// ============================================
// CONVERSION HELPERS
// ============================================

/** Convert a ScheduledEvent from the hub into a CalendarEvent for the unified modal */
function scheduledToCalendar(event: ScheduledEvent): CalendarEvent {
  const startDt = parseISO(event.startTime)
  const endDt = event.endTime ? parseISO(event.endTime) : startDt
  return {
    id: `sched_${event.id}`,
    title: event.title,
    start_date: format(startDt, "yyyy-MM-dd"),
    end_date: format(endDt, "yyyy-MM-dd"),
    is_all_day: false,
    start_time: format(startDt, "HH:mm"),
    end_time: format(endDt, "HH:mm"),
    color: event.eventType === "call" ? "amber" : event.eventType === "video" ? "teal" : "violet",
    completed: event.status === "completed",
    event_type: event.eventType as any,
    description: event.description || undefined,
    meeting_link: event.meetingLink || undefined,
    location: event.location || undefined,
    is_recurring: event.isRecurring || false,
    recurrence: event.isRecurring && event.recurrencePattern
      ? {
          type: event.recurrencePattern as any,
          interval: event.recurrenceInterval || 1,
          endType: event.recurrenceEndDate ? "date" : event.recurrenceCount ? "count" : "never",
          endDate: event.recurrenceEndDate
            ? format(new Date(event.recurrenceEndDate + "T00:00:00"), "yyyy-MM-dd")
            : undefined,
          endCount: event.recurrenceCount || undefined,
        }
      : undefined,
    source: "scheduled",
    source_id: event.id,
  }
}

/** Convert EventFormData from the unified modal into the shape the hub expects */
function formDataToScheduledPayload(data: EventFormData): any {
  const startTime = new Date(`${data.start_date}T${data.start_time || "00:00"}`).toISOString()
  const endTime = new Date(`${data.end_date}T${data.end_time || "23:59"}`).toISOString()
  const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime()
  const durationMinutes = Math.max(Math.round(durationMs / 60000), 1)

  const recurrence: RecurrenceConfig | null =
    data.is_recurring && data.recurrence?.type !== "none" ? data.recurrence : null

  const payload: any = {
    title: data.title,
    description: data.description?.trim() || undefined,
    eventType: data.event_type || "meeting",
    startTime,
    endTime,
    durationMinutes,
    location: data.location?.trim() || undefined,
    meetingLink: data.meeting_link?.trim() || undefined,
    isRecurring: data.is_recurring || false,
    status: "scheduled" as const,
  }

  if (data.is_recurring && recurrence) {
    payload.recurrencePattern = recurrence.type
    payload.recurrenceInterval = recurrence.interval || 1
    if (recurrence.endType === "date" && recurrence.endDate) {
      payload.recurrenceEndDate = new Date(recurrence.endDate).toISOString()
      payload.recurrenceCount = undefined
    } else if (recurrence.endType === "count") {
      payload.recurrenceCount = recurrence.endCount || 10
      payload.recurrenceEndDate = undefined
    } else {
      payload.recurrenceEndDate = undefined
      payload.recurrenceCount = undefined
    }
  } else {
    payload.recurrencePattern = undefined
    payload.recurrenceInterval = undefined
    payload.recurrenceEndDate = undefined
    payload.recurrenceCount = undefined
  }

  return payload
}

// ============================================
// SCHEDULE EVENT DIALOG WRAPPER
// (Exported for use on the communication page header)
// ============================================

export function ScheduleEventDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  contacts,
  editingEvent,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
    invitees: { email: string; name?: string; contactId?: string }[]
  ) => void
  onUpdate: (
    eventId: string,
    event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
    invitees: { email: string; name?: string; contactId?: string }[]
  ) => void
  contacts: Array<{ id: string; name: string; email?: string }>
  editingEvent?: ScheduledEvent | null
}) {
  // Convert ScheduledEvent -> CalendarEvent for the unified modal
  const calEvent = editingEvent ? scheduledToCalendar(editingEvent) : null

  const handleSave = (data: EventFormData) => {
    const payload = formDataToScheduledPayload(data)
    if (editingEvent) {
      onUpdate(editingEvent.id, payload, [])
    } else {
      onSave(payload, [])
    }
  }

  const handleDelete = editingEvent
    ? () => {
        // Parent will handle deletion via its own mechanism
        onOpenChange(false)
      }
    : undefined

  return (
    <EventFormDialogComm
      open={open}
      onClose={() => onOpenChange(false)}
      onSave={handleSave}
      onDelete={handleDelete}
      existingEvent={calEvent}
      initialDate={format(new Date(), "yyyy-MM-dd")}
    />
  )
}

// ============================================
// EVENT CARD
// ============================================

function EventCard({
  event,
  user,
  onEdit,
  onDelete,
  onComplete,
  compact = false,
}: {
  event: ScheduledEvent
  user: string
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
  compact?: boolean
}) {
  const Icon = eventTypeIcons[event.eventType] || Calendar
  const colorClass = eventTypeColors[event.eventType] || ""
  const isPast = new Date(event.startTime) < new Date()
  const isCompleted = event.status === "completed"

  const acceptedCount = event.invitations.filter((i) => i.status === "accepted").length
  const pendingCount = event.invitations.filter((i) => i.status === "pending").length
  const totalInvited = event.invitations.length
  const isOwner = event.user_id === user

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-4 hover:shadow-md transition-all",
        isCompleted && "opacity-50",
        isPast && !isCompleted && "opacity-70",
        compact && "p-3"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn(
            "rounded-xl flex items-center justify-center",
            colorClass,
            compact ? "w-8 h-8" : "w-10 h-10"
          )}>
            <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn(
                "font-semibold text-foreground",
                isCompleted && "line-through",
                compact && "text-sm"
              )}>
                {event.title}
              </h3>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                  <Check className="w-3 h-3" />
                  Done
                </span>
              )}
              {event.isRecurring && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                  <Repeat className="w-3 h-3" />
                  Series
                </span>
              )}
            </div>

            <p className={cn(
              "text-muted-foreground flex items-center gap-1.5 mt-1",
              compact ? "text-xs" : "text-sm"
            )}>
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              {formatEventDate(event.startTime)}
              {event.durationMinutes && (
                <span className="text-muted-foreground/60">
                  {" \u00B7 "}{event.durationMinutes}m
                </span>
              )}
            </p>

            {event.isRecurring && !compact && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                {getRecurrenceSummary(event)}
              </p>
            )}

            {event.location && !compact && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </p>
            )}

            {event.meetingLink && !compact && (
              <a
                href={event.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
              >
                <LinkIcon className="w-3 h-3" />
                Join meeting
              </a>
            )}

            {totalInvited > 0 && !compact && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-2">
                  {event.invitations.slice(0, 3).map((inv) => (
                    <Avatar key={inv.id} className="w-6 h-6 border-2 border-background">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(inv.inviteeName || inv.inviteeEmail.split("@")[0])}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {acceptedCount}/{totalInvited} confirmed
                  {pendingCount > 0 && `, ${pendingCount} pending`}
                </span>
              </div>
            )}
          </div>
        </div>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {event.status === "scheduled" && !isPast && (
                <DropdownMenuItem onClick={onComplete}>
                  {event.isRecurring ? (
                    <>
                      <SkipForward className="w-4 h-4 mr-2" />
                      {"Complete & Create Next"}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {event.meetingLink && (
                <DropdownMenuItem asChild>
                  <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Meeting
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

function advanceByInterval(
  date: Date,
  pattern: "daily" | "weekly" | "monthly",
  interval: number
): Date {
  const next = new Date(date)
  switch (pattern) {
    case "daily":
      next.setDate(next.getDate() + interval)
      break
    case "weekly":
      next.setDate(next.getDate() + 7 * interval)
      break
    case "monthly":
      next.setMonth(next.getMonth() + interval)
      break
  }
  return next
}

function getNextFutureOccurrence(
  event: ScheduledEvent,
  allEvents: ScheduledEvent[],
  now: Date = new Date()
): Date | null {
  if (!event.isRecurring || !event.recurrencePattern) return null

  const pattern = event.recurrencePattern
  const interval = event.recurrenceInterval || 1
  const endDate = event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : null

  let candidate = new Date(event.startTime)
  let iterations = 0
  while (candidate <= now && iterations < 1000) {
    candidate = advanceByInterval(candidate, pattern, interval)
    iterations++
  }

  if (endDate && candidate > endDate) return null

  if (event.recurrenceCount) {
    const seriesCount = allEvents.filter(
      (e) =>
        e.title === event.title &&
        e.isRecurring &&
        e.recurrencePattern === event.recurrencePattern
    ).length
    if (seriesCount >= event.recurrenceCount) return null
  }

  return candidate
}

// ============================================
// SCHEDULE TAB
// ============================================

export function ScheduleTab() {
  const {
    contacts,
    scheduledEvents,
    isLoaded,
    isSyncing,
    syncError,
    currentUser,
    createEvent,
    updateEvent,
    deleteEvent,
    respondToInvitation,
  } = useCommunicationHub()

  const hub = useCommunicationHub()
  const completeRecurringEvent = hub.completeRecurringEvent

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingHubEvent, setEditingHubEvent] = useState<ScheduledEvent | null>(null)
  const [showAllPast, setShowAllPast] = useState(false)
  const [advancedIds, setAdvancedIds] = useState<Set<string>>(new Set())
  const [calendarMeetings, setCalendarMeetings] = useState<ScheduledEvent[]>([])

  // Fetch meetings/calls/videos from calendar_events table
  const fetchCalendarMeetings = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        //.in("event_type", ["meeting", "call", "video"])
        .order("start_date", { ascending: true })

      if (data) {
        setCalendarMeetings(data.map(calendarEventToScheduled))
      }
    } catch {
      // Fetch failed silently
    }
  }, [])

  // Fetch on mount and re-fetch when hub events change (in case save triggers both tables)
  useEffect(() => {
    if (isLoaded) {
      fetchCalendarMeetings()
    }
  }, [isLoaded, fetchCalendarMeetings, scheduledEvents])

  // Merge hub events + calendar meetings, deduplicating by title+startTime
  const allEvents = useMemo(() => {
    const hubIds = new Set(scheduledEvents.map((e) => e.id))
    // Only add calendar events that don't already exist in scheduled_events
    // We detect duplicates by matching title + approximate start time
    const extras = calendarMeetings.filter((ce) => {
      const ceStart = new Date(ce.startTime).getTime()
      return !scheduledEvents.some((se) => {
        const seStart = new Date(se.startTime).getTime()
        return se.title === ce.title && Math.abs(seStart - ceStart) < 60000
      })
    })
    return [...scheduledEvents, ...extras]
  }, [scheduledEvents, calendarMeetings])

  // Convert the editing hub event into a CalendarEvent for the unified modal
  const editingCalEvent = editingHubEvent ? scheduledToCalendar(editingHubEvent) : null

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: c.contactName,
    email: c.email,
  }))

  useEffect(() => {
    if (!isLoaded || isSyncing) return

    const now = new Date()

    const pastRecurring = scheduledEvents.filter(
      (e) =>
        e.isRecurring &&
        e.recurrencePattern &&
        e.status === "scheduled" &&
        new Date(e.startTime) < now &&
        !advancedIds.has(e.id)
    )

    if (pastRecurring.length === 0) return

    const advance = async () => {
      const newAdvancedIds = new Set(advancedIds)

      for (const event of pastRecurring) {
        const hasFutureSibling = scheduledEvents.some(
          (e) =>
            e.id !== event.id &&
            e.title === event.title &&
            e.isRecurring &&
            e.recurrencePattern === event.recurrencePattern &&
            e.status === "scheduled" &&
            new Date(e.startTime) >= now
        )

        if (hasFutureSibling) {
          newAdvancedIds.add(event.id)
          await updateEvent(event.id, { status: "completed" })
          continue
        }

        const nextDate = getNextFutureOccurrence(event, scheduledEvents, now)

        if (!nextDate) {
          newAdvancedIds.add(event.id)
          await updateEvent(event.id, { status: "completed" })
          continue
        }

        await updateEvent(event.id, { status: "completed" })

        const durationMs = (event.durationMinutes || 30) * 60000
        const nextEnd = new Date(nextDate.getTime() + durationMs)

        const invitees = event.invitations.map((inv) => ({
          email: inv.inviteeEmail,
          name: inv.inviteeName,
          contactId: inv.contactId,
        }))

        await createEvent(
          {
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            startTime: nextDate.toISOString(),
            endTime: nextEnd.toISOString(),
            durationMinutes: event.durationMinutes,
            location: event.location,
            meetingLink: event.meetingLink,
            isRecurring: true,
            recurrencePattern: event.recurrencePattern,
            recurrenceInterval: event.recurrenceInterval,
            recurrenceEndDate: event.recurrenceEndDate,
            recurrenceCount: event.recurrenceCount,
            status: "scheduled",
            notes: event.notes,
          },
          invitees
        )

        newAdvancedIds.add(event.id)
      }

      setAdvancedIds(newAdvancedIds)
    }

    advance()
  }, [isLoaded, scheduledEvents, isSyncing])

  const upcomingEvents = useMemo(() => {
    const now = Date.now()
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
    const cutoff = now + THIRTY_DAYS

    return allEvents
      .filter((e) => e.status === "scheduled" && new Date(e.startTime) >= new Date())
      .filter((e) => {
        const start = new Date(e.startTime).getTime()
        return start <= cutoff
      }).filter((e) => e.eventType === "call" || e.eventType === "meeting" || e.eventType === "video")
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [allEvents])

  const pastEvents = useMemo(() => {
    const now = Date.now()
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
    const cutoff = now - THIRTY_DAYS

    return allEvents
      .filter((e) => e.status === "completed" || (e.status === "cancelled") || (e.status !== "scheduled") || new Date(e.startTime) < new Date())
      .filter((e) => !(e.status === "scheduled" && new Date(e.startTime) >= new Date()))
      .filter((e) => {
        const start = new Date(e.startTime).getTime()
        return start >= cutoff
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [allEvents])

  const visiblePastEvents = showAllPast ? pastEvents : pastEvents.slice(0, 6)

  // Unified modal save handler -- writes to both scheduled_events (via hub) and calendar_events
  const handleUnifiedSave = async (data: EventFormData) => {
    const payload = formDataToScheduledPayload(data)

    // Build invitees from the editing event (preserve existing ones)
    const invitees = editingHubEvent
      ? editingHubEvent.invitations.map((inv) => ({
          email: inv.inviteeEmail,
          name: inv.inviteeName,
          contactId: inv.contactId,
        }))
      : []

    if (editingHubEvent) {
      await updateEvent(editingHubEvent.id, payload, invitees)
    } else {
      await createEvent(payload, invitees)
    }

    setIsEventDialogOpen(false)
    setEditingHubEvent(null)
    // Re-fetch calendar meetings so newly created events appear
    fetchCalendarMeetings()
  }

  const handleDeleteFromModal = async () => {
    if (!editingHubEvent) return
    await deleteEvent(editingHubEvent.id)
    setIsEventDialogOpen(false)
    setEditingHubEvent(null)
  }

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(id)
    }
  }

  const handleCompleteEvent = async (id: string) => {
    const event = scheduledEvents.find((e) => e.id === id)
    if (!event) return

    await updateEvent(id, { status: "completed" })

    if (event.isRecurring && event.recurrencePattern) {
      const now = new Date()
      const nextDate = getNextFutureOccurrence(event, scheduledEvents, now)

      if (!nextDate) return

      const hasFutureSibling = scheduledEvents.some(
        (e) =>
          e.id !== event.id &&
          e.title === event.title &&
          e.isRecurring &&
          e.recurrencePattern === event.recurrencePattern &&
          e.status === "scheduled" &&
          new Date(e.startTime) >= now
      )
      if (hasFutureSibling) return

      const durationMs = (event.durationMinutes || 30) * 60000
      const nextEnd = new Date(nextDate.getTime() + durationMs)

      const invitees = event.invitations.map((inv) => ({
        email: inv.inviteeEmail,
        name: inv.inviteeName,
        contactId: inv.contactId,
      }))

      await createEvent(
        {
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          startTime: nextDate.toISOString(),
          endTime: nextEnd.toISOString(),
          durationMinutes: event.durationMinutes,
          location: event.location,
          meetingLink: event.meetingLink,
          isRecurring: true,
          recurrencePattern: event.recurrencePattern,
          recurrenceInterval: event.recurrenceInterval,
          recurrenceEndDate: event.recurrenceEndDate,
          recurrenceCount: event.recurrenceCount,
          status: "scheduled",
          notes: event.notes,
        },
        invitees
      )
    }
  }

  const myInvitations = useMemo(() => {
    if (!currentUser?.email) return []
    return allEvents.flatMap((event) =>
      event.invitations
        .filter((inv) => inv.inviteeEmail === currentUser.email)
        .map((inv) => inv)
    )
  }, [allEvents, currentUser])

  const pendingCount = myInvitations.filter((i) => i.status === "pending").length

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading communication hub...</span>
        </div>
      </div>
    )
  }

  //console.log("Events #: "+upcomingEvents.length)
  console.log(upcomingEvents) 
  return (
    <>
      <TabsContent value="schedule" className="space-y-6">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {upcomingEvents.length}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setEditingHubEvent(null); setIsEventDialogOpen(true) }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    user={currentUser?.id || ""}
                    onEdit={() => {
                      setEditingHubEvent(event)
                      setIsEventDialogOpen(true)
                    }}
                    onDelete={() => handleDeleteEvent(event.id)}
                    onComplete={() => handleCompleteEvent(event.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-card border rounded-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming events</h3>
              <p className="text-muted-foreground mb-6">
                Schedule calls, meetings, and reminders with your contacts
              </p>
              <Button onClick={() => { setEditingHubEvent(null); setIsEventDialogOpen(true) }}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Your First Event
              </Button>
            </div>
          )}

          {/* Past / Completed Events */}
          {pastEvents.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">Past Events (Last 30 Days)</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {pastEvents.length}
                  </span>
                </div>
                {pastEvents.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllPast((v) => !v)}
                    className="text-muted-foreground"
                  >
                    {showAllPast ? "Show less" : `Show all ${pastEvents.length}`}
                    <ChevronRight className={cn("w-4 h-4 ml-1 transition-transform", showAllPast && "rotate-90")} />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    user={currentUser?.id || ""}
                    compact
                    onEdit={() => {
                      setEditingHubEvent(event)
                      setIsEventDialogOpen(true)
                    }}
                    onDelete={() => handleDeleteEvent(event.id)}
                    onComplete={() => { }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Invitations */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-foreground">My Invitations</h2>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-xs font-bold">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <InvitationsInbox
              invitations={myInvitations}
              events={allEvents}
              onRespond={respondToInvitation}
            />
          </div>
      </TabsContent>

      {/* Unified Event Modal -- shared with the calendar */}
      <EventFormDialogComm
        open={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false)
          setEditingHubEvent(null)
        }}
        onSave={handleUnifiedSave}
        onDelete={editingHubEvent ? handleDeleteFromModal : undefined}
        existingEvent={editingCalEvent}
        initialDate={format(new Date(), "yyyy-MM-dd")}
      />

      {/* Sync indicator */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Syncing...</span>
        </div>
      )}

      {/* Error indicator */}
      {syncError && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{syncError}</span>
        </div>
      )}
    </>
  )
}