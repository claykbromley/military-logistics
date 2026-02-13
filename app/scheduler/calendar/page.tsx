"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUI } from "@/context/ui-context"
import { Header } from "@/components/header"
import { CalendarDays, CheckSquare } from "lucide-react"

import type { CalendarEntry, CalendarView } from "./types"
import { MONTH_NAMES, MONTH_NAMES_SHORT, DAY_NAMES_FULL } from "./constants"
import {
  isSameDay,
  getWeekDays,
  expandRecurring,
  defaultFormData,
} from "./utils"

import { EntryModalProvider, useEntryModal } from "@/components/calendar/use-entry-modal"
import { ConnectedEntryModal } from "@/components/calendar/entry-modal"

import { CalendarToolbar } from "@/components/calendar/calendar-toolbar"
import { MiniCalendar } from "@/components/calendar/mini-calendar"
import { DayDetailPanel } from "@/components/calendar/day-detail-panel"
import { MonthView } from "@/components/calendar/month-view"
import { WeekView } from "@/components/calendar/week-view"
import { DayView } from "@/components/calendar/day-view"
import { YearView } from "@/components/calendar/year-view"
import { IcalModal } from "@/components/calendar/ical-modal"

export default function CalendarPage() {
  const { user, setShowLogin } = useUI()
  const supabase = createClient()
  const userId = (user as any)?.id as string | undefined

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>("month")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(false)

  // iCal state
  const [icalToken, setIcalToken] = useState<string | null>(null)
  const [showIcalModal, setShowIcalModal] = useState(false)

  // Refs
  const timeGridRef = useRef<HTMLDivElement>(null)

  // ── Data fetching ───────────────────────────────────────

  const fetchEntries = useCallback(async () => {
    if (!user) { setEntries([]); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("calendar_entries")
        .select("*")
        .eq("user_id", userId)
        .order("start_time", { ascending: true })
      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      console.error("Failed to fetch entries:", err)
    } finally {
      setLoading(false)
    }
  }, [user, userId, supabase])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  // ── iCal token ──────────────────────────────────────────

  const fetchIcalToken = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.rpc("get_or_create_ical_token", { p_user_id: userId })
      if (!error && data) setIcalToken(data)
    } catch (err) { console.error("Failed to get ical token:", err) }
  }, [user, userId, supabase])

  useEffect(() => { if (user) fetchIcalToken() }, [user, fetchIcalToken])

  const icalUrl = icalToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/calendar/ical?token=${icalToken}`
    : ""

  // ── Scroll to current hour ──────────────────────────────

  useEffect(() => {
    if (timeGridRef.current && (view === "day" || view === "week")) {
      timeGridRef.current.scrollTop = Math.max(0, (new Date().getHours() - 1) * 64)
    }
  }, [view])

  // ── Expanded entries for visible range ──────────────────

  const visibleEntries = useMemo(() => {
    let rangeStart: Date, rangeEnd: Date
    if (view === "month") {
      rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), -6)
      rangeEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 13)
    } else if (view === "week") {
      const wd = getWeekDays(currentDate)
      rangeStart = wd[0]
      rangeEnd = new Date(wd[6].getTime() + 86400000)
    } else if (view === "year") {
      rangeStart = new Date(currentDate.getFullYear(), 0, 1)
      rangeEnd = new Date(currentDate.getFullYear(), 11, 31)
    } else {
      rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
      rangeEnd = new Date(rangeStart.getTime() + 86400000)
    }
    return entries.flatMap((e) => expandRecurring(e, rangeStart, rangeEnd))
  }, [entries, currentDate, view])

  // ── Navigation ──────────────────────────────────────────

  const navigate = (dir: 1 | -1) => {
    const d = new Date(currentDate)
    switch (view) {
      case "day": d.setDate(d.getDate() + dir); break
      case "week": d.setDate(d.getDate() + 7 * dir); break
      case "month": d.setMonth(d.getMonth() + dir); break
      case "year": d.setFullYear(d.getFullYear() + dir); break
    }
    setCurrentDate(d)
  }

  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()) }

  // ── Header title ────────────────────────────────────────

  const headerTitle = useMemo(() => {
    if (view === "day")
      return `${DAY_NAMES_FULL[currentDate.getDay()]}, ${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
    if (view === "week") {
      const days = getWeekDays(currentDate)
      const f = days[0], l = days[6]
      if (f.getMonth() === l.getMonth())
        return `${MONTH_NAMES[f.getMonth()]} ${f.getDate()} – ${l.getDate()}, ${f.getFullYear()}`
      return `${MONTH_NAMES_SHORT[f.getMonth()]} ${f.getDate()} – ${MONTH_NAMES_SHORT[l.getMonth()]} ${l.getDate()}, ${l.getFullYear()}`
    }
    if (view === "year") return `${currentDate.getFullYear()}`
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }, [currentDate, view])

  // ── Entry queries ───────────────────────────────────────

  const getEntriesForDay = useCallback(
    (date: Date) =>
      visibleEntries.filter((e) => {
        const start = new Date(e.start_time)
        if (e.all_day) {
          const end = e.end_time ? new Date(e.end_time) : start
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
          return start < new Date(dayStart.getTime() + 86400000) && end >= dayStart
        }
        return isSameDay(start, date)
      }),
    [visibleEntries]
  )

  const getAllDayEntries = useCallback(
    (date: Date) => getEntriesForDay(date).filter((e) => e.all_day),
    [getEntriesForDay]
  )

  const getTimedEntries = useCallback(
    (date: Date) => getEntriesForDay(date).filter((e) => !e.all_day),
    [getEntriesForDay]
  )

  // ── Render ──────────────────────────────────────────────
  // Wrap everything in EntryModalProvider so all children
  // (toolbar, views, side panel, chips) can call useEntryModal().open()

  return (
    <EntryModalProvider
      userId={userId}
      onAuthRequired={() => setShowLogin(true)}
      onMutate={fetchEntries}
    >
      <CalendarPageInner
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        loading={loading}
        headerTitle={headerTitle}
        hasUser={!!user}
        timeGridRef={timeGridRef}
        icalUrl={icalUrl}
        showIcalModal={showIcalModal}
        setShowIcalModal={setShowIcalModal}
        getEntriesForDay={getEntriesForDay}
        getAllDayEntries={getAllDayEntries}
        getTimedEntries={getTimedEntries}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onToday={goToToday}
      />
    </EntryModalProvider>
  )
}

// ─── Inner component (has access to useEntryModal) ────────

interface CalendarPageInnerProps {
  currentDate: Date
  setCurrentDate: (d: Date) => void
  view: CalendarView
  setView: (v: CalendarView) => void
  selectedDate: Date
  setSelectedDate: (d: Date) => void
  loading: boolean
  headerTitle: string
  hasUser: boolean
  timeGridRef: React.RefObject<HTMLDivElement | null>
  icalUrl: string
  showIcalModal: boolean
  setShowIcalModal: (v: boolean) => void
  getEntriesForDay: (d: Date) => CalendarEntry[]
  getAllDayEntries: (d: Date) => CalendarEntry[]
  getTimedEntries: (d: Date) => CalendarEntry[]
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

function CalendarPageInner({
  currentDate, setCurrentDate,
  view, setView,
  selectedDate, setSelectedDate,
  loading, headerTitle, hasUser,
  timeGridRef, icalUrl, showIcalModal, setShowIcalModal,
  getEntriesForDay, getAllDayEntries, getTimedEntries,
  onPrev, onNext, onToday,
}: CalendarPageInnerProps) {
  const { open: openModal, toggleComplete } = useEntryModal()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <CalendarToolbar
        title={headerTitle}
        view={view}
        hasUser={hasUser}
        onViewChange={setView}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
        onCreateClick={() => openModal(undefined, selectedDate)}
        onIcalClick={() => setShowIcalModal(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Side panel */}
        {view !== "year" && (
          <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card p-4 space-y-5 overflow-y-auto flex-shrink-0">
            <MiniCalendar
              date={currentDate}
              selectedDate={selectedDate}
              onSelect={(d) => { setSelectedDate(d); setCurrentDate(d) }}
              getEntriesForDay={getEntriesForDay}
            />
            <div className="border-t border-border pt-4">
              <DayDetailPanel
                selectedDate={selectedDate}
                hasUser={hasUser}
                getEntriesForDay={getEntriesForDay}
                onCreateClick={() => openModal(undefined, selectedDate)}
                onEdit={(entry) => openModal(entry)}
                onToggleComplete={toggleComplete}
              />
            </div>
            {hasUser && (
              <div className="border-t border-border pt-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">Quick Add</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openModal(undefined, selectedDate)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors cursor-pointer text-foreground"
                  >
                    <CalendarDays className="w-3 h-3" />
                    Event
                  </button>
                  <button
                    onClick={() => openModal(undefined, selectedDate)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors cursor-pointer text-foreground"
                  >
                    <CheckSquare className="w-3 h-3" />
                    Task
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Main calendar area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-card">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          {view === "month" && (
            <MonthView currentDate={currentDate} selectedDate={selectedDate} hasUser={hasUser}
              getEntriesForDay={getEntriesForDay} onSelectDate={setSelectedDate}
              onSetCurrentDate={setCurrentDate} onSetView={setView}
              onCreateClick={(d) => openModal(undefined, d)} onEdit={(entry) => openModal(entry)} onToggleComplete={toggleComplete} />
          )}
          {view === "week" && (
            <WeekView currentDate={currentDate} timeGridRef={timeGridRef}
              getAllDayEntries={getAllDayEntries} getTimedEntries={getTimedEntries}
              onDayClick={(d) => { setCurrentDate(d); setSelectedDate(d); setView("day") }}
              onCreateClick={(d) => openModal(undefined, d)} onEdit={(entry) => openModal(entry)} onToggleComplete={toggleComplete} />
          )}
          {view === "day" && (
            <DayView currentDate={currentDate} timeGridRef={timeGridRef}
              getAllDayEntries={getAllDayEntries} getTimedEntries={getTimedEntries}
              onCreateClick={(d) => openModal(undefined, d)} onEdit={(entry) => openModal(entry)} onToggleComplete={toggleComplete} />
          )}
          {view === "year" && (
            <YearView currentDate={currentDate} getEntriesForDay={getEntriesForDay}
              onMonthClick={(y, m) => { setCurrentDate(new Date(y, m, 1)); setView("month") }}
              onDayClick={(d) => { setCurrentDate(d); setSelectedDate(d); setView("day") }} />
          )}
        </main>
      </div>

      {/* Footer placeholder */}
      {/* <Footer /> */}

      {/* Modals */}
      <ConnectedEntryModal />
      <IcalModal
        open={showIcalModal}
        icalUrl={icalUrl}
        onClose={() => setShowIcalModal(false)}
      />
    </div>
  )
}