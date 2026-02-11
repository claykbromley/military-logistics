"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  addDays,
  subDays,
  format,
  startOfMonth,
  endOfMonth,
  getYear,
  parseISO,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MiniMonthCalendar } from "./mini-month-calendar"
import { DayView } from "./day-view"
import { DayEventsPanel } from "./day-events-panel"
import { EventFormDialog } from "./event-form-dialog"
import { getFederalHolidays } from "@/lib/federal-holidays"
import { createClient } from "@/lib/supabase/client"
import { expandRecurringEvent } from "@/lib/recurrence-utils"
import type {
  CalendarEvent,
  EventFormData,
} from "@/lib/calendar-types"

interface CalendarAppProps {
  isLoggedIn: boolean
  onLoginClick?: () => void
}

export function CalendarApp({ isLoggedIn, onLoginClick }: CalendarAppProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [miniMonth, setMiniMonth] = useState(startOfMonth(new Date()))
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [initialFormDate, setInitialFormDate] = useState<string>("")
  const fetchedRef = useRef(false)

  // Fetch events from both calendar_events and scheduled_events tables
  const fetchEvents = useCallback(async () => {
    try {
      const supabase = createClient()
      const year = getYear(selectedDate)
      const start = `${year - 1}-01-01`
      const end = `${year + 1}-12-31`

      // Fetch calendar_events
      const { data: calData } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("end_date", start)
        .lte("start_date", end)
        .order("start_date", { ascending: true })

      const calEvents: CalendarEvent[] = (calData ?? []).map((e: any) => ({
        ...e,
        id: String(e.id),
        event_type: e.event_type || "event",
        recurrence: e.recurrence || null,
        source: "calendar" as const,
        source_id: String(e.id),
      }))

      // Fetch scheduled_events and convert to CalendarEvent format
      const { data: schedData } = await supabase
        .from("scheduled_events")
        .select("*")
        .gte("start_time", `${start}T00:00:00`)
        .lte("start_time", `${end}T23:59:59`)
        .order("start_time", { ascending: true })

      const schedEvents: CalendarEvent[] = (schedData ?? []).map((e: any) => {
        const startDt = e.start_time ? parseISO(e.start_time) : new Date()
        const endDt = e.end_time ? parseISO(e.end_time) : startDt
        const dateStr = format(startDt, "yyyy-MM-dd")
        const endDateStr = format(endDt, "yyyy-MM-dd")
        return {
          id: `sched_${e.id}`,
          title: e.title,
          start_date: dateStr,
          end_date: endDateStr,
          is_all_day: e.is_all_day || false,
          start_time: e.is_all_day ? null : format(startDt, "HH:mm"),
          end_time: e.is_all_day ? null : format(endDt, "HH:mm"),
          color: e.event_type === "call" ? "amber" : e.event_type === "video" ? "teal" : "violet",
          completed: e.status === "completed",
          user_id: e.user_id,
          event_type: e.event_type || "meeting",
          description: e.description || null,
          meeting_link: e.meeting_link || null,
          location: e.location || null,
          is_recurring: e.is_recurring || false,
          recurrence: e.is_recurring && e.recurrence_pattern
            ? {
                type: e.recurrence_pattern,
                interval: e.recurrence_interval || 1,
                endType: e.recurrence_end_date ? "date" : e.recurrence_count ? "count" : "never",
                endDate: e.recurrence_end_date || undefined,
                endCount: e.recurrence_count || undefined,
              }
            : null,
          source: "scheduled" as const,
          source_id: String(e.id),
        } as CalendarEvent
      })

      setUserEvents([...calEvents, ...schedEvents])
    } catch {
      // Fetch failed
    }
  }, [selectedDate])

  useEffect(() => {
    if (isLoggedIn) {
      fetchEvents()
    } else {
      setUserEvents([])
      fetchedRef.current = false
    }
  }, [isLoggedIn, fetchEvents])

  // Get holidays for visible range
  const holidays = useMemo(() => {
    const year = getYear(selectedDate)
    return [
      ...getFederalHolidays(year - 1),
      ...getFederalHolidays(year),
      ...getFederalHolidays(year + 1),
    ]
  }, [selectedDate])

  const allEvents = useMemo(() => {
    if (!isLoggedIn) return holidays
    // Expand any recurring events for a 3-year window around current view
    const year = getYear(selectedDate)
    const rangeStart = `${year - 1}-01-01`
    const rangeEnd = `${year + 1}-12-31`
    const expanded = userEvents.flatMap((event) =>
      event.is_recurring && event.recurrence && event.recurrence.type !== "none"
        ? expandRecurringEvent(event, rangeStart, rangeEnd)
        : [event]
    )
    return [...holidays, ...expanded]
  }, [holidays, userEvents, isLoggedIn, selectedDate])

  // Events for the selected day
  const selectedDateEvents = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return allEvents.filter(
      (e) => dateStr >= e.start_date && dateStr <= e.end_date
    )
  }, [selectedDate, allEvents])

  // Navigation
  const goPrev = useCallback(() => setSelectedDate((d) => subDays(d, 1)), [])
  const goNext = useCallback(() => setSelectedDate((d) => addDays(d, 1)), [])
  const goToday = useCallback(() => {
    const now = new Date()
    setSelectedDate(now)
    setMiniMonth(startOfMonth(now))
  }, [])

  // Event management
  const handleCreateEvent = useCallback(
    (date?: Date) => {
      if (!isLoggedIn) return
      const d = date || selectedDate
      setInitialFormDate(format(d, "yyyy-MM-dd"))
      setEditingEvent(null)
      setShowEventForm(true)
    },
    [isLoggedIn, selectedDate]
  )

  const handleEditEvent = useCallback(
    (event: CalendarEvent) => {
      if (!isLoggedIn || event.is_holiday) return
      setEditingEvent(event)
      setShowEventForm(true)
    },
    [isLoggedIn]
  )

  const handleToggleComplete = useCallback(
    async (event: CalendarEvent) => {
      if (!isLoggedIn || event.is_holiday) return
      const supabase = createClient()
      const newCompleted = !event.completed

      // Optimistic update
      setUserEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, completed: newCompleted } : e
        )
      )

      try {
        if (event.source === "scheduled") {
          const newStatus = newCompleted ? "completed" : "scheduled"
          const { error } = await supabase
            .from("scheduled_events")
            .update({ status: newStatus })
            .eq("id", event.source_id)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from("calendar_events")
            .update({ completed: newCompleted })
            .eq("id", event.source_id || event.id)
          if (error) throw error
        }
      } catch {
        // Revert on error
        setUserEvents((prev) =>
          prev.map((e) =>
            e.id === event.id ? { ...e, completed: !newCompleted } : e
          )
        )
      }
    },
    [isLoggedIn]
  )

  const handleSaveEvent = useCallback(
    async (data: EventFormData) => {
      const supabase = createClient()

      // Build the payload with all unified fields
      const recurrence =
        data.is_recurring && data.recurrence?.type !== "none"
          ? data.recurrence
          : null

      const payload = {
        title: data.title,
        start_date: data.start_date,
        end_date: data.end_date,
        is_all_day: data.is_all_day,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        color: data.color,
        event_type: data.event_type || "event",
        description: data.description || null,
        meeting_link: data.meeting_link || null,
        location: data.location || null,
        is_recurring: data.is_recurring || false,
        recurrence: recurrence,
      }

      try {
        if (editingEvent) {
          // Editing a calendar_events row
          if (editingEvent.source === "scheduled") {
            // For scheduled_events, update via scheduled_events table
            const realId = editingEvent.source_id
            const startDt = data.start_date + "T" + (data.start_time || "00:00") + ":00"
            const endDt = data.end_date + "T" + (data.end_time || "23:59") + ":00"
            const { error } = await supabase
              .from("scheduled_events")
              .update({
                title: data.title,
                description: data.description || null,
                event_type: data.event_type || "meeting",
                start_time: startDt,
                end_time: endDt,
                meeting_link: data.meeting_link || null,
                location: data.location || null,
                is_recurring: data.is_recurring || false,
                recurrence_pattern: recurrence?.type || null,
                recurrence_interval: recurrence?.interval || null,
                recurrence_end_date: recurrence?.endDate || null,
                recurrence_count: recurrence?.endCount || null,
              })
              .eq("id", realId)
            if (error) return
          } else {
            const { data: updated, error } = await supabase
              .from("calendar_events")
              .update(payload)
              .eq("id", editingEvent.source_id || editingEvent.id)
              .select()
              .single()

            if (error) return
            setUserEvents((prev) =>
              prev.map((e) =>
                e.id === String(editingEvent.id) ||
                e.source_id === editingEvent.source_id
                  ? {
                      ...updated,
                      id: String(updated.id),
                      source: "calendar" as const,
                      source_id: String(updated.id),
                    }
                  : e
              )
            )
          }
          // Refresh all events
          await fetchEvents()
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) return

          const { data: created, error } = await supabase
            .from("calendar_events")
            .insert({
              ...payload,
              user_id: user.id,
            })
            .select()
            .single()

          if (error) return
          setUserEvents((prev) => [
            ...prev,
            {
              ...created,
              id: String(created.id),
              source: "calendar" as const,
              source_id: String(created.id),
            },
          ])
        }
      } catch {
        // Save failed
      }
      setShowEventForm(false)
      setEditingEvent(null)
    },
    [editingEvent, fetchEvents]
  )

  const handleDeleteEvent = useCallback(async () => {
    if (!editingEvent) return
    const supabase = createClient()

    try {
      const table =
        editingEvent.source === "scheduled"
          ? "scheduled_events"
          : "calendar_events"
      const realId = editingEvent.source_id || editingEvent.id

      const { error } = await supabase.from(table).delete().eq("id", realId)
      if (error) return

      // Remove all occurrences of this event (including recurrence expansions)
      setUserEvents((prev) =>
        prev.filter(
          (e) =>
            e.id !== editingEvent.id &&
            e.source_id !== realId
        )
      )
    } catch {
      // Delete failed
    }
    setShowEventForm(false)
    setEditingEvent(null)
  }, [editingEvent])

  // When selecting a date from mini calendar, update mini month too
  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setMiniMonth(startOfMonth(date))
  }, [])

  return (
    <div className="flex h-full">
      {/* Left sidebar: mini calendar + event list */}
      <aside className="hidden md:flex w-72 lg:w-80 flex-col border-r border-border bg-card shrink-0">
        {/* Create event button */}
        <div className="p-4 pb-2">
          {isLoggedIn ? (
            <Button
              onClick={() => handleCreateEvent()}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onLoginClick}
              className="w-full gap-2 bg-transparent"
            >
              <LogIn className="h-4 w-4" />
              Sign in to add events
            </Button>
          )}
        </div>

        {/* Mini month calendar */}
        <div className="px-4 pb-3">
          <MiniMonthCalendar
            currentMonth={miniMonth}
            selectedDate={selectedDate}
            events={allEvents}
            onSelectDate={handleSelectDate}
            onChangeMonth={setMiniMonth}
          />
        </div>

        <div className="border-t border-border" />

        {/* Selected day event list */}
        <div className="flex-1 overflow-auto p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {format(selectedDate, "EEEE, MMMM d")}
          </h3>
          <DayEventsPanel
            date={selectedDate}
            events={selectedDateEvents}
            isLoggedIn={isLoggedIn}
            onEditEvent={handleEditEvent}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      </aside>

      {/* Main content: day time grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="text-xs font-semibold bg-transparent"
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={goPrev} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous day</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={goNext} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next day</span>
          </Button>
          <h2 className="text-base font-bold text-foreground text-balance">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h2>

          {/* Mobile create button */}
          <div className="ml-auto md:hidden">
            {isLoggedIn ? (
              <Button size="sm" onClick={() => handleCreateEvent()} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={onLoginClick}
                className="gap-1.5 bg-transparent"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            )}
          </div>
        </div>

        {/* Day time grid */}
        <div className="flex-1 overflow-auto">
          <DayView
            currentDate={selectedDate}
            events={allEvents}
            isLoggedIn={isLoggedIn}
            onEditEvent={handleEditEvent}
            onToggleComplete={handleToggleComplete}
            onClickHour={(hour) => {
              if (isLoggedIn) {
                setInitialFormDate(format(selectedDate, "yyyy-MM-dd"))
                setEditingEvent(null)
                setShowEventForm(true)
              }
            }}
          />
        </div>
      </div>

      {/* Event form dialog */}
      <EventFormDialog
        open={showEventForm}
        onClose={() => {
          setShowEventForm(false)
          setEditingEvent(null)
        }}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
        initialDate={initialFormDate}
        existingEvent={editingEvent}
      />
    </div>
  )
}
