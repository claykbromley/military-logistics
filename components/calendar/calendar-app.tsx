"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  format,
  startOfMonth,
  endOfMonth,
  getYear,
} from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MonthView } from "./month-view"
import { WeekView } from "./week-view"
import { DayView } from "./day-view"
import { DayEventsPanel } from "./day-events-panel"
import { EventFormDialog } from "./event-form-dialog"
import { getFederalHolidays } from "@/lib/federal-holidays"
import { createClient } from "@/lib/supabase/client"
import type {
  CalendarEvent,
  CalendarView,
  EventFormData,
} from "@/lib/calendar-types"
import { cn } from "@/lib/utils"

interface CalendarAppProps {
  isLoggedIn: boolean
  onLoginClick?: () => void
}

export function CalendarApp({ isLoggedIn, onLoginClick }: CalendarAppProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [view, setView] = useState<CalendarView>("month")
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [initialFormDate, setInitialFormDate] = useState<string>("")
  const fetchedRef = useRef(false)

  // Fetch events from Supabase directly via browser client
  const fetchEvents = useCallback(async () => {
    try {
      const supabase = createClient()
      const year = getYear(currentDate)
      const start = `${year - 1}-01-01`
      const end = `${year + 1}-12-31`

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("end_date", start)
        .lte("start_date", end)
        .order("start_date", { ascending: true })

      if (error) {
        console.log("[v0] fetchEvents error:", error.message)
        return
      }

      console.log("[v0] fetchEvents received events:", data?.length ?? 0)
      setUserEvents(
        (data ?? []).map((e: CalendarEvent) => ({
          ...e,
          id: String(e.id),
        }))
      )
    } catch (err) {
      console.error("[v0] Failed to fetch events", err)
    }
  }, [currentDate])

  // Fetch on login and when the visible year range changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchEvents()
    } else {
      setUserEvents([])
      fetchedRef.current = false
    }
  }, [isLoggedIn, fetchEvents])

  // Get holidays for the visible range (current year + possibly adjacent years)
  const holidays = useMemo(() => {
    const year = getYear(currentDate)
    return [
      ...getFederalHolidays(year - 1),
      ...getFederalHolidays(year),
      ...getFederalHolidays(year + 1),
    ]
  }, [currentDate])

  const allEvents = useMemo(() => {
    if (isLoggedIn) {
      return [...holidays, ...userEvents]
    }
    return holidays
  }, [holidays, userEvents, isLoggedIn])

  // Navigation
  const goBack = useCallback(() => {
    if (view === "month") setCurrentDate((d) => subMonths(d, 1))
    else if (view === "week") setCurrentDate((d) => subWeeks(d, 1))
    else setCurrentDate((d) => subDays(d, 1))
  }, [view])

  const goForward = useCallback(() => {
    if (view === "month") setCurrentDate((d) => addMonths(d, 1))
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1))
    else setCurrentDate((d) => addDays(d, 1))
  }, [view])

  const goToday = useCallback(() => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }, [])

  // Event management
  const handleSelectDate = useCallback(
    (date: Date) => {
      setSelectedDate(date)
      if (view === "month") {
        // If clicking a date in month view, just select it
      }
    },
    [view]
  )

  const handleCreateEvent = useCallback(
    (date?: Date) => {
      if (!isLoggedIn) return
      const d = date || selectedDate || new Date()
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

  const handleSaveEvent = useCallback(
    async (data: EventFormData) => {
      console.log("[v0] handleSaveEvent called with:", data, "editing:", !!editingEvent)
      const supabase = createClient()

      try {
        if (editingEvent) {
          // Update existing event directly in Supabase
          const { data: updated, error } = await supabase
            .from("calendar_events")
            .update({
              title: data.title,
              start_date: data.start_date,
              end_date: data.end_date,
              is_all_day: data.is_all_day,
              start_time: data.start_time || null,
              end_time: data.end_time || null,
            })
            .eq("id", editingEvent.id)
            .select()
            .single()

          if (error) {
            console.error("[v0] Failed to update event:", error.message)
            return
          }

          console.log("[v0] Updated event:", updated.id)
          setUserEvents((prev) =>
            prev.map((e) =>
              e.id === String(editingEvent.id)
                ? { ...updated, id: String(updated.id) }
                : e
            )
          )
        } else {
          // Get the current user for user_id
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            console.error("[v0] No authenticated user")
            return
          }

          // Create new event directly in Supabase
          const { data: created, error } = await supabase
            .from("calendar_events")
            .insert({
              title: data.title,
              start_date: data.start_date,
              end_date: data.end_date,
              is_all_day: data.is_all_day,
              start_time: data.start_time || null,
              end_time: data.end_time || null,
              user_id: user.id,
            })
            .select()
            .single()

          if (error) {
            console.error("[v0] Failed to create event:", error.message)
            return
          }

          console.log("[v0] Created event:", created.id)
          setUserEvents((prev) => [...prev, { ...created, id: String(created.id) }])
        }
      } catch (err) {
        console.error("[v0] Error saving event:", err)
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

      if (error) {
        console.error("[v0] Failed to delete event:", error.message)
        return
      }

      console.log("[v0] Deleted event:", editingEvent.id)
      setUserEvents((prev) => prev.filter((e) => e.id !== editingEvent.id))
    } catch (err) {
      console.error("[v0] Error deleting event:", err)
    }
    setShowEventForm(false)
    setEditingEvent(null)
  }, [editingEvent])

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return allEvents.filter(
      (e) => dateStr >= e.start_date && dateStr <= e.end_date
    )
  }, [selectedDate, allEvents])

  // Title for current view
  const viewTitle = useMemo(() => {
    if (view === "month") return format(currentDate, "MMMM yyyy")
    if (view === "week") {
      const start = format(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - currentDate.getDay()
        ),
        "MMM d"
      )
      const end = format(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + (6 - currentDate.getDay())
        ),
        "MMM d, yyyy"
      )
      return `${start} - ${end}`
    }
    return format(currentDate, "EEEE, MMMM d, yyyy")
  }, [currentDate, view])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="text-xs font-semibold bg-transparent"
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={goForward} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        <h2 className="text-lg font-bold text-foreground min-w-[180px] text-balance">
          {viewTitle}
        </h2>

        <div className="flex items-center gap-1 ml-auto">
          {/* View switcher */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["month", "week", "day"] as CalendarView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-accent"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {isLoggedIn ? (
            <Button
              size="sm"
              onClick={() => handleCreateEvent()}
              className="ml-2 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Event</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onLoginClick}
              className="ml-2 gap-1.5 bg-transparent"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign in to add events</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar view */}
        <div className="flex-1 flex flex-col overflow-auto">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={allEvents}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                handleSelectDate(date)
                if (isLoggedIn) {
                  // Double-click could create an event, single click selects
                }
              }}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={allEvents}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              isLoggedIn={isLoggedIn}
              onEditEvent={handleEditEvent}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={selectedDate || currentDate}
              events={allEvents}
              isLoggedIn={isLoggedIn}
              onEditEvent={handleEditEvent}
              onClickHour={(hour) => {
                if (isLoggedIn) {
                  setInitialFormDate(
                    format(selectedDate || currentDate, "yyyy-MM-dd")
                  )
                  setEditingEvent(null)
                  setShowEventForm(true)
                }
              }}
            />
          )}
        </div>

        {/* Side panel - shows on month view for selected day */}
        {view === "month" && selectedDate && (
          <aside className="hidden lg:flex w-72 flex-col border-l border-border bg-card p-4 overflow-auto">
            <DayEventsPanel
              date={selectedDate}
              events={selectedDateEvents}
              isLoggedIn={isLoggedIn}
              onEditEvent={handleEditEvent}
            />
            {isLoggedIn && (
              <Button
                size="sm"
                variant="outline"
                className="mt-4 gap-1.5 bg-transparent"
                onClick={() => handleCreateEvent(selectedDate)}
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            )}
          </aside>
        )}
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
