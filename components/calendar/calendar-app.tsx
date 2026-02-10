"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  addDays,
  subDays,
  format,
  startOfMonth,
  getYear,
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

  // Fetch events from Supabase directly via browser client
  const fetchEvents = useCallback(async () => {
    try {
      const supabase = createClient()
      const year = getYear(selectedDate)
      const start = `${year - 1}-01-01`
      const end = `${year + 1}-12-31`

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("end_date", start)
        .lte("start_date", end)
        .order("start_date", { ascending: true })

      if (error) return
      setUserEvents(
        (data ?? []).map((e: CalendarEvent) => ({
          ...e,
          id: String(e.id),
        }))
      )
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
    if (isLoggedIn) return [...holidays, ...userEvents]
    return holidays
  }, [holidays, userEvents, isLoggedIn])

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
        const { error } = await supabase
          .from("calendar_events")
          .update({ completed: newCompleted })
          .eq("id", event.id)

        if (error) {
          // Revert on error
          setUserEvents((prev) =>
            prev.map((e) =>
              e.id === event.id ? { ...e, completed: !newCompleted } : e
            )
          )
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

      try {
        if (editingEvent) {
          const { data: updated, error } = await supabase
            .from("calendar_events")
            .update({
              title: data.title,
              start_date: data.start_date,
              end_date: data.end_date,
              is_all_day: data.is_all_day,
              start_time: data.start_time || null,
              end_time: data.end_time || null,
              color: data.color,
            })
            .eq("id", editingEvent.id)
            .select()
            .single()

          if (error) return
          setUserEvents((prev) =>
            prev.map((e) =>
              e.id === String(editingEvent.id)
                ? { ...updated, id: String(updated.id) }
                : e
            )
          )
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) return

          const { data: created, error } = await supabase
            .from("calendar_events")
            .insert({
              title: data.title,
              start_date: data.start_date,
              end_date: data.end_date,
              is_all_day: data.is_all_day,
              start_time: data.start_time || null,
              end_time: data.end_time || null,
              color: data.color,
              user_id: user.id,
            })
            .select()
            .single()

          if (error) return
          setUserEvents((prev) => [
            ...prev,
            { ...created, id: String(created.id) },
          ])
        }
      } catch {
        // Save failed
      }
      setShowEventForm(false)
      setEditingEvent(null)
    },
    [editingEvent]
  )

  const handleDeleteEvent = useCallback(async () => {
    if (!editingEvent) return
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", editingEvent.id)

      if (error) return
      setUserEvents((prev) => prev.filter((e) => e.id !== editingEvent.id))
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
