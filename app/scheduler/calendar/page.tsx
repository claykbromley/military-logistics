"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUI } from "@/context/ui-context"
import { Header } from "@/components/header"
import { CalendarDays, CheckSquare } from "lucide-react"

import type { CalendarEntry, CalendarView, EntryFormData } from "./types"
import { MONTH_NAMES, MONTH_NAMES_SHORT, DAY_NAMES_FULL } from "./constants"
import {
  isSameDay,
  getWeekDays,
  expandRecurring,
  defaultFormData,
  toLocalDateStr,
  toLocalTimeStr,
} from "./utils"

import { CalendarToolbar } from "../../../components/calendar/calendar-toolbar"
import { MiniCalendar } from "../../../components/calendar/mini-calendar"
import { DayDetailPanel } from "../../../components/calendar/day-detail-panel"
import { MonthView } from "../../../components/calendar/month-view"
import { WeekView } from "../../../components/calendar/week-view"
import { DayView } from "../../../components/calendar/day-view"
import { YearView } from "../../../components/calendar/year-view"
import { EntryModal } from "../../../components/calendar/entry-modal"
import { IcalModal } from "../../../components/calendar/ical-modal"

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

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null)
  const [formData, setFormData] = useState<EntryFormData>(defaultFormData())
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  // ── CRUD ────────────────────────────────────────────────

  const openCreateModal = (date?: Date) => {
    if (!user) { setShowLogin(true); return }
    setEditingEntry(null)
    setFormData(defaultFormData(date))
    setShowModal(true)
    setShowDeleteConfirm(false)
  }

  const openEditModal = (entry: CalendarEntry) => {
    if (!user) { setShowLogin(true); return }
    setEditingEntry(entry)
    const s = new Date(entry.start_time)
    const e = entry.end_time ? new Date(entry.end_time) : new Date(s.getTime() + 3600000)
    setFormData({
      type: entry.type, title: entry.title,
      description: entry.description || "", color: entry.color,
      start_date: toLocalDateStr(s), start_time: toLocalTimeStr(s),
      end_date: toLocalDateStr(e), end_time: toLocalTimeStr(e),
      all_day: entry.all_day, is_recurring: entry.is_recurring,
      recurrence_freq: entry.recurrence_freq || "weekly",
      recurrence_interval: entry.recurrence_interval || 1,
      recurrence_days: entry.recurrence_days || [],
      recurrence_end: entry.recurrence_end ? toLocalDateStr(new Date(entry.recurrence_end)) : "",
      location: entry.location || "",
    })
    setShowModal(true)
    setShowDeleteConfirm(false)
  }

  const handleSave = async () => {
    if (!user || !formData.title.trim()) return
    setSaving(true)
    try {
      const startDT = formData.all_day
        ? new Date(`${formData.start_date}T00:00:00`)
        : new Date(`${formData.start_date}T${formData.start_time}:00`)
      const endDT = formData.all_day
        ? new Date(`${formData.end_date}T23:59:59`)
        : new Date(`${formData.end_date}T${formData.end_time}:00`)

      const payload: any = {
        user_id: userId, type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        color: formData.color,
        start_time: startDT.toISOString(),
        end_time: formData.type === "task" && !formData.all_day ? null : endDT.toISOString(),
        all_day: formData.all_day,
        is_recurring: formData.is_recurring,
        recurrence_freq: formData.is_recurring ? formData.recurrence_freq : null,
        recurrence_interval: formData.is_recurring ? formData.recurrence_interval : 1,
        recurrence_days: formData.is_recurring && formData.recurrence_freq === "weekly" ? formData.recurrence_days : null,
        recurrence_end: formData.is_recurring && formData.recurrence_end ? new Date(`${formData.recurrence_end}T23:59:59`).toISOString() : null,
        location: formData.type === "event" ? (formData.location.trim() || null) : null,
      }

      if (editingEntry) {
        const { error } = await supabase.from("calendar_entries").update(payload).eq("id", editingEntry.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("calendar_entries").insert(payload)
        if (error) throw error
      }
      setShowModal(false)
      await fetchEntries()
    } catch (err) { console.error("Save failed:", err) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!editingEntry) return
    setSaving(true)
    try {
      const { error } = await supabase.from("calendar_entries").delete().eq("id", editingEntry.id)
      if (error) throw error
      setShowModal(false)
      await fetchEntries()
    } catch (err) { console.error("Delete failed:", err) }
    finally { setSaving(false) }
  }

  const toggleComplete = async (entry: CalendarEntry) => {
    if (!user) return
    try {
      const { error } = await supabase.from("calendar_entries").update({ is_completed: !entry.is_completed }).eq("id", entry.id)
      if (error) throw error
      await fetchEntries()
    } catch (err) { console.error("Toggle failed:", err) }
  }

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <CalendarToolbar
        title={headerTitle}
        view={view}
        hasUser={!!user}
        onViewChange={setView}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onToday={goToToday}
        onCreateClick={() => openCreateModal(selectedDate)}
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
                hasUser={!!user}
                getEntriesForDay={getEntriesForDay}
                onCreateClick={() => openCreateModal(selectedDate)}
                onEdit={openEditModal}
                onToggleComplete={toggleComplete}
              />
            </div>
            {user && (
              <div className="border-t border-border pt-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">Quick Add</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setFormData({ ...defaultFormData(selectedDate), type: "event" }); setEditingEntry(null); setShowModal(true) }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors cursor-pointer text-foreground"
                  >
                    <CalendarDays className="w-3 h-3" />
                    Event
                  </button>
                  <button
                    onClick={() => { setFormData({ ...defaultFormData(selectedDate), type: "task" }); setEditingEntry(null); setShowModal(true) }}
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
            <MonthView currentDate={currentDate} selectedDate={selectedDate} hasUser={!!user}
              getEntriesForDay={getEntriesForDay} onSelectDate={setSelectedDate}
              onSetCurrentDate={setCurrentDate} onSetView={setView}
              onCreateClick={openCreateModal} onEdit={openEditModal} onToggleComplete={toggleComplete} />
          )}
          {view === "week" && (
            <WeekView currentDate={currentDate} timeGridRef={timeGridRef}
              getAllDayEntries={getAllDayEntries} getTimedEntries={getTimedEntries}
              onDayClick={(d) => { setCurrentDate(d); setSelectedDate(d); setView("day") }}
              onCreateClick={openCreateModal} onEdit={openEditModal} onToggleComplete={toggleComplete} />
          )}
          {view === "day" && (
            <DayView currentDate={currentDate} timeGridRef={timeGridRef}
              getAllDayEntries={getAllDayEntries} getTimedEntries={getTimedEntries}
              onCreateClick={openCreateModal} onEdit={openEditModal} onToggleComplete={toggleComplete} />
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

      {/* Modals – stable tree position, no remounting */}
      <EntryModal
        open={showModal}
        editingEntry={editingEntry}
        formData={formData}
        saving={saving}
        showDeleteConfirm={showDeleteConfirm}
        onFormChange={setFormData}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setShowModal(false)}
        onShowDeleteConfirm={setShowDeleteConfirm}
      />
      <IcalModal
        open={showIcalModal}
        icalUrl={icalUrl}
        onClose={() => setShowIcalModal(false)}
      />
    </div>
  )
}