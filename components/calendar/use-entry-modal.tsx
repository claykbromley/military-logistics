"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  CalendarEntry,
  EntryFormData,
  EntryType,
  EventInvitation,
  InviteeInput,
} from "@/app/scheduler/calendar/types"
import { defaultFormData, toLocalDateStr, toLocalTimeStr } from "@/app/scheduler/calendar/utils"

// ─── Recurring modes ──────────────────────────────────────

export type RecurringDeleteMode = "this" | "future" | "all"
export type RecurringEditMode = "this" | "all"

// ─── Context value ────────────────────────────────────────

interface EntryModalContextValue {
  isOpen: boolean
  editingEntry: CalendarEntry | null
  formData: EntryFormData
  saving: boolean
  showDeleteConfirm: boolean
  existingInvitations: EventInvitation[]
  forceEntryType?: EntryType
  previewedEntry: CalendarEntry | null
  previewInvitations: EventInvitation[]
  /** The occurrence date the user clicked on (for expanded recurring entries) */
  occurrenceDate: string | null
  /** Whether we're editing a recurring occurrence (vs a standalone or new entry) */
  isEditingRecurring: boolean

  open: (entry?: CalendarEntry, date?: Date) => void
  close: () => void
  preview: (entry: CalendarEntry) => void
  closePreview: () => void
  setFormData: (data: EntryFormData) => void
  setShowDeleteConfirm: (show: boolean) => void
  save: () => Promise<void>
  /** Save with recurring edit mode: "this" occurrence only, or "all" in series */
  saveRecurring: (mode: RecurringEditMode) => Promise<void>
  deleteEntry: () => Promise<void>
  deleteEntryById: (id: string) => Promise<void>
  deleteRecurring: (id: string, mode: RecurringDeleteMode, occurrenceDate?: string) => Promise<void>
  toggleComplete: (entry: CalendarEntry) => Promise<void>
  removeInvitation: (invitationId: string) => Promise<void>
}

const EntryModalContext = createContext<EntryModalContextValue | null>(null)

export function useEntryModal() {
  const ctx = useContext(EntryModalContext)
  if (!ctx) {
    throw new Error("useEntryModal must be used within an <EntryModalProvider>")
  }
  return ctx
}

// ─── Provider ─────────────────────────────────────────────

interface EntryModalProviderProps {
  userId?: string | null
  onAuthRequired?: () => void
  onMutate?: () => void | Promise<void>
  defaultEntryOverrides?: Partial<Record<string, any>>
  forceEntryType?: EntryType
  children: ReactNode
}

export function EntryModalProvider({
  userId,
  onAuthRequired,
  onMutate,
  defaultEntryOverrides,
  forceEntryType,
  children,
}: EntryModalProviderProps) {
  const supabase = createClient()

  const [isOpen, setIsOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null)
  const [formData, setFormData] = useState<EntryFormData>(defaultFormData())
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [existingInvitations, setExistingInvitations] = useState<EventInvitation[]>([])
  const [previewedEntry, setPreviewedEntry] = useState<CalendarEntry | null>(null)
  const [previewInvitations, setPreviewInvitations] = useState<EventInvitation[]>([])

  // Tracks which occurrence date the user clicked (for recurring entries).
  // This is the expanded occurrence's start_time, NOT the series origin.
  const [occurrenceDate, setOccurrenceDate] = useState<string | null>(null)

  // Whether we're editing a recurring series occurrence
  const [isEditingRecurring, setIsEditingRecurring] = useState(false)

  // ── Fetch existing invitations for an entry ─────────────

  const fetchInvitations = useCallback(
    async (entryId: string) => {
      try {
        const { data, error } = await supabase
          .from("event_invitations")
          .select("*")
          .eq("event_id", entryId)
          .order("created_at", { ascending: true })
        if (!error && data) {
          setExistingInvitations(data as EventInvitation[])
        }
      } catch {
        // Silently fail — invitations are non-critical
      }
    },
    [supabase],
  )

  // ── Open ────────────────────────────────────────────────

  const open = useCallback(
    async (entry?: CalendarEntry, date?: Date) => {
      if (!userId) {
        onAuthRequired?.()
        return
      }

      if (entry) {
        // Edit mode
        setEditingEntry(entry)
        const s = new Date(entry.start_time)
        const e = entry.end_time
          ? new Date(entry.end_time)
          : new Date(s.getTime() + 3600000)

        // Track the occurrence date for recurring entries
        setOccurrenceDate(entry.is_recurring ? entry.start_time : null)
        setIsEditingRecurring(entry.is_recurring)

        // Derive recurrence_end_mode from DB fields
        let endMode: "never" | "on_date" | "after_count" = "never"
        if (entry.recurrence_count && entry.recurrence_count > 0) {
          endMode = "after_count"
        } else if (entry.recurrence_end) {
          endMode = "on_date"
        }

        setFormData({
          type: entry.source === "meeting" ? "meeting" : entry.type,
          title: entry.title,
          description: entry.description || "",
          color: entry.color,
          start_date: toLocalDateStr(s),
          start_time: toLocalTimeStr(s),
          end_date: toLocalDateStr(e),
          end_time: toLocalTimeStr(e),
          all_day: entry.all_day,
          is_recurring: entry.is_recurring,
          recurrence_freq: entry.recurrence_freq || "weekly",
          recurrence_interval: entry.recurrence_interval || 1,
          recurrence_days: entry.recurrence_days || [],
          recurrence_end: entry.recurrence_end
            ? toLocalDateStr(new Date(entry.recurrence_end))
            : "",
          recurrence_end_mode: endMode,
          recurrence_monthly_mode: entry.recurrence_monthly_mode || "day_of_month",
          recurrence_count: entry.recurrence_count || 10,
          location: entry.location || "",
          timezone:
            entry.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          meeting_link: entry.meeting_link || "",
          invitees: [],
        })

        await fetchInvitations(entry.id)
      } else {
        // Create mode
        setEditingEntry(null)
        setOccurrenceDate(null)
        setIsEditingRecurring(false)
        const defaults = defaultFormData(date)
        if (forceEntryType) {
          defaults.type = forceEntryType
        }
        setFormData(defaults)
        setExistingInvitations([])
      }

      setShowDeleteConfirm(false)
      setIsOpen(true)
    },
    [userId, onAuthRequired, fetchInvitations],
  )

  // ── Close ───────────────────────────────────────────────

  const close = useCallback(() => {
    setIsOpen(false)
    setEditingEntry(null)
    setOccurrenceDate(null)
    setIsEditingRecurring(false)
    setShowDeleteConfirm(false)
    setExistingInvitations([])
  }, [])

  // ── Build payload from current formData ─────────────────

  const buildPayload = useCallback(() => {
    const isMeeting = formData.type === "meeting"
    const isEvent = formData.type === "event" || isMeeting

    const startDT = formData.all_day
      ? new Date(`${formData.start_date}T00:00:00`)
      : new Date(`${formData.start_date}T${formData.start_time}:00`)

    const endDT = formData.all_day
      ? new Date(`${formData.end_date}T23:59:59`)
      : new Date(`${formData.end_date}T${formData.end_time}:00`)

    let recurrenceEnd: string | null = null
    if (formData.is_recurring && formData.recurrence_end_mode === "on_date" && formData.recurrence_end) {
      recurrenceEnd = new Date(`${formData.recurrence_end}T23:59:59`).toISOString()
    }

    return {
      user_id: userId!,
      type: isMeeting ? "event" : formData.type,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      color: formData.color,
      start_time: startDT.toISOString(),
      end_time:
        formData.type === "task" && !formData.all_day
          ? null
          : endDT.toISOString(),
      all_day: formData.all_day,
      is_recurring: formData.is_recurring,
      recurrence_freq: formData.is_recurring ? formData.recurrence_freq : null,
      recurrence_interval: formData.is_recurring
        ? formData.recurrence_interval
        : 1,
      recurrence_days:
        formData.is_recurring && formData.recurrence_freq === "weekly"
          ? formData.recurrence_days
          : null,
      recurrence_end: recurrenceEnd,
      recurrence_monthly_mode:
        formData.is_recurring && formData.recurrence_freq === "monthly"
          ? formData.recurrence_monthly_mode
          : null,
      recurrence_count:
        formData.is_recurring && formData.recurrence_end_mode === "after_count"
          ? formData.recurrence_count
          : null,
      excluded_dates: editingEntry?.excluded_dates || [],
      location: isEvent ? formData.location.trim() || null : null,
      timezone: formData.all_day ? null : (formData.timezone || null),
      meeting_link: isEvent ? formData.meeting_link.trim() || null : null,
      source: isMeeting ? "meeting" : (defaultEntryOverrides?.source || null),
      ...defaultEntryOverrides,
    } as Record<string, any>
  }, [userId, formData, editingEntry, defaultEntryOverrides])

  // ── Save invitations helper ─────────────────────────────

  const saveInvitations = useCallback(async (entryId: string) => {
    const newInvitees = formData.invitees.filter((inv) => inv.email.trim())
    if (newInvitees.length > 0) {
      const existingEmails = new Set(
        existingInvitations.map((inv) => inv.invitee_email.toLowerCase()),
      )
      const toInsert = newInvitees.filter(
        (inv) => !existingEmails.has(inv.email.trim().toLowerCase()),
      )

      if (toInsert.length > 0) {
        const rows = toInsert.map((inv) => ({
          event_id: entryId,
          user_id: userId,
          invitee_email: inv.email.trim().toLowerCase(),
          invitee_name: inv.name?.trim() || null,
          contact_id: inv.contactId || null,
          status: "pending",
        }))

        const { error: invErr } = await supabase
          .from("event_invitations")
          .insert(rows)
        if (invErr) console.error("Failed to create invitations:", invErr)
      }
    }
  }, [formData.invitees, existingInvitations, userId, supabase])

  // ── Save (non-recurring, or new entry) ──────────────────

  const save = useCallback(async () => {
    if (!userId || !formData.title.trim()) return
    setSaving(true)

    try {
      const payload = buildPayload()
      let entryId: string

      if (editingEntry) {
        const { error } = await supabase
          .from("calendar_entries")
          .update(payload)
          .eq("id", editingEntry.id)
        if (error) throw error
        entryId = editingEntry.id
      } else {
        const { data, error } = await supabase
          .from("calendar_entries")
          .insert(payload)
          .select("id")
          .single()
        if (error) throw error
        entryId = data.id
      }

      await saveInvitations(entryId)

      setIsOpen(false)
      setEditingEntry(null)
      setOccurrenceDate(null)
      setIsEditingRecurring(false)
      setExistingInvitations([])
      await onMutate?.()
    } catch (err) {
      console.error("Entry save failed:", err)
    } finally {
      setSaving(false)
    }
  }, [userId, formData, editingEntry, buildPayload, saveInvitations, supabase, onMutate])

  // ── Save recurring with mode ────────────────────────────
  //
  // "this" → exclude the old occurrence from the series + create a new standalone entry
  // "all"  → update the series in-place, preserving the original start_time
  //          (only update time-of-day, metadata fields — don't shift the series origin)
  //
  const saveRecurring = useCallback(async (mode: RecurringEditMode) => {
    if (!userId || !formData.title.trim() || !editingEntry) return
    setSaving(true)

    try {
      const payload = buildPayload()

      if (mode === "this") {
        // Always update the series title (title changes apply to all events)
        const { error: titleErr } = await supabase
          .from("calendar_entries")
          .update({ title: formData.title.trim() })
          .eq("id", editingEntry.id)
        if (titleErr) throw titleErr

        // 1) Exclude this occurrence date from the original series
        if (occurrenceDate) {
          const { data: seriesRow, error: fetchErr } = await supabase
            .from("calendar_entries")
            .select("excluded_dates")
            .eq("id", editingEntry.id)
            .single()
          if (fetchErr) throw fetchErr

          const excluded: string[] = seriesRow?.excluded_dates || []
          const dateStr = toLocalDateStr(new Date(occurrenceDate))
          if (!excluded.includes(dateStr)) {
            excluded.push(dateStr)
          }

          const { error: exclErr } = await supabase
            .from("calendar_entries")
            .update({ excluded_dates: excluded })
            .eq("id", editingEntry.id)
          if (exclErr) throw exclErr
        }

        // 2) Create a new standalone (non-recurring) entry with the edited data
        const standalonePayload: Record<string, any> = {
          ...payload,
          is_recurring: false,
          recurrence_freq: null,
          recurrence_interval: 1,
          recurrence_days: null,
          recurrence_end: null,
          recurrence_monthly_mode: null,
          recurrence_count: null,
          excluded_dates: [],
        }

        const { data: newEntry, error: insertErr } = await supabase
          .from("calendar_entries")
          .insert(standalonePayload)
          .select("id")
          .single()
        if (insertErr) throw insertErr

        await saveInvitations(newEntry.id)

      } else if (mode === "all") {
        // Update the series in-place.
        // CRITICAL: preserve the original series start_time so earlier occurrences aren't lost.
        // We need to fetch the original start_time from the DB (not the expanded occurrence).
        const { data: seriesRow, error: fetchErr } = await supabase
          .from("calendar_entries")
          .select("start_time, end_time")
          .eq("id", editingEntry.id)
          .single()
        if (fetchErr) throw fetchErr

        const origStart = new Date(seriesRow.start_time)
        const origEnd = seriesRow.end_time ? new Date(seriesRow.end_time) : new Date(origStart.getTime() + 3600000)

        // Apply the new time-of-day to the original date
        const newStartDT = new Date(origStart)
        if (!formData.all_day) {
          const [sh, sm] = formData.start_time.split(":").map(Number)
          newStartDT.setHours(sh, sm, 0, 0)
        }

        const newEndDT = new Date(origStart) // same date as original start
        if (!formData.all_day) {
          const [eh, em] = formData.end_time.split(":").map(Number)
          newEndDT.setHours(eh, em, 0, 0)
          // If end is before start (crossed midnight edge case), push to next day
          if (newEndDT <= newStartDT) {
            newEndDT.setDate(newEndDT.getDate() + 1)
          }
        } else {
          newEndDT.setHours(23, 59, 59, 0)
        }

        // Build update payload preserving original start date
        const seriesPayload = {
          ...payload,
          start_time: newStartDT.toISOString(),
          end_time: formData.type === "task" && !formData.all_day
            ? null
            : newEndDT.toISOString(),
        }

        const { error } = await supabase
          .from("calendar_entries")
          .update(seriesPayload)
          .eq("id", editingEntry.id)
        if (error) throw error

        await saveInvitations(editingEntry.id)
      }

      setIsOpen(false)
      setEditingEntry(null)
      setOccurrenceDate(null)
      setIsEditingRecurring(false)
      setExistingInvitations([])
      await onMutate?.()
    } catch (err) {
      console.error("Recurring save failed:", err)
    } finally {
      setSaving(false)
    }
  }, [userId, formData, editingEntry, occurrenceDate, buildPayload, saveInvitations, supabase, onMutate])

  // ── Delete entry ────────────────────────────────────────

  const deleteEntry = useCallback(async () => {
    if (!editingEntry) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from("calendar_entries")
        .delete()
        .eq("id", editingEntry.id)
      if (error) throw error

      setIsOpen(false)
      setEditingEntry(null)
      setOccurrenceDate(null)
      setIsEditingRecurring(false)
      setExistingInvitations([])
      await onMutate?.()
    } catch (err) {
      console.error("Entry delete failed:", err)
    } finally {
      setSaving(false)
    }
  }, [editingEntry, supabase, onMutate])

  // ── Remove a single invitation ──────────────────────────

  const removeInvitation = useCallback(
    async (invitationId: string) => {
      try {
        const { error } = await supabase
          .from("event_invitations")
          .delete()
          .eq("id", invitationId)
        if (error) throw error

        setExistingInvitations((prev) =>
          prev.filter((inv) => inv.id !== invitationId),
        )
      } catch (err) {
        console.error("Remove invitation failed:", err)
      }
    },
    [supabase],
  )

  // ── Toggle complete ─────────────────────────────────────

  const toggleComplete = useCallback(
    async (entry: CalendarEntry) => {
      if (!userId) return
      try {
        const { error } = await supabase
          .from("calendar_entries")
          .update({ is_completed: !entry.is_completed })
          .eq("id", entry.id)
        if (error) throw error
        await onMutate?.()
      } catch (err) {
        console.error("Toggle complete failed:", err)
      }
    },
    [userId, supabase, onMutate],
  )

  // ── Preview (read-only detail popover) ────────────────────

  const preview = useCallback(
    async (entry: CalendarEntry) => {
      setPreviewedEntry(entry)
      try {
        const { data, error } = await supabase
          .from("event_invitations")
          .select("*")
          .eq("event_id", entry.id)
          .order("created_at", { ascending: true })
        if (!error && data) {
          setPreviewInvitations(data as EventInvitation[])
        } else {
          setPreviewInvitations([])
        }
      } catch {
        setPreviewInvitations([])
      }
    },
    [supabase],
  )

  const closePreview = useCallback(() => {
    setPreviewedEntry(null)
    setPreviewInvitations([])
  }, [])

  // ── Delete entry by ID (simple — from preview popover for non-recurring) ──

  const deleteEntryById = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("calendar_entries")
          .delete()
          .eq("id", id)
        if (error) throw error
        setPreviewedEntry(null)
        setPreviewInvitations([])
        await onMutate?.()
      } catch (err) {
        console.error("Delete entry failed:", err)
      }
    },
    [supabase, onMutate],
  )

  // ── Delete recurring entry with mode ────────────────────

  const deleteRecurring = useCallback(
    async (id: string, mode: RecurringDeleteMode, occDate?: string) => {
      try {
        if (mode === "all") {
          const { error } = await supabase
            .from("calendar_entries")
            .delete()
            .eq("id", id)
          if (error) throw error
        } else if (mode === "this" && occDate) {
          const { data: entry, error: fetchErr } = await supabase
            .from("calendar_entries")
            .select("excluded_dates")
            .eq("id", id)
            .single()
          if (fetchErr) throw fetchErr

          const existing: string[] = entry?.excluded_dates || []
          const dateStr = toLocalDateStr(new Date(occDate))
          if (!existing.includes(dateStr)) {
            existing.push(dateStr)
          }

          const { error } = await supabase
            .from("calendar_entries")
            .update({ excluded_dates: existing })
            .eq("id", id)
          if (error) throw error
        } else if (mode === "future" && occDate) {
          const occ = new Date(occDate)
          occ.setDate(occ.getDate() - 1)
          occ.setHours(23, 59, 59, 0)

          const { error } = await supabase
            .from("calendar_entries")
            .update({
              recurrence_end: occ.toISOString(),
              recurrence_count: null,
            })
            .eq("id", id)
          if (error) throw error
        }

        setPreviewedEntry(null)
        setPreviewInvitations([])
        setIsOpen(false)
        setEditingEntry(null)
        setOccurrenceDate(null)
        setIsEditingRecurring(false)
        setShowDeleteConfirm(false)
        await onMutate?.()
      } catch (err) {
        console.error("Recurring delete failed:", err)
      }
    },
    [supabase, onMutate],
  )

  // ── Context value ───────────────────────────────────────

  const value: EntryModalContextValue = {
    isOpen,
    editingEntry,
    formData,
    saving,
    showDeleteConfirm,
    existingInvitations,
    forceEntryType,
    previewedEntry,
    previewInvitations,
    occurrenceDate,
    isEditingRecurring,
    open,
    close,
    preview,
    closePreview,
    setFormData,
    setShowDeleteConfirm,
    save,
    saveRecurring,
    deleteEntry,
    deleteEntryById,
    deleteRecurring,
    toggleComplete,
    removeInvitation,
  }

  return (
    <EntryModalContext.Provider value={value}>
      {children}
    </EntryModalContext.Provider>
  )
}