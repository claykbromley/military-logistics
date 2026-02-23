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

// ─── Recurring delete mode ────────────────────────────────

export type RecurringDeleteMode = "this" | "future" | "all"

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

  open: (entry?: CalendarEntry, date?: Date) => void
  close: () => void
  preview: (entry: CalendarEntry) => void
  closePreview: () => void
  setFormData: (data: EntryFormData) => void
  setShowDeleteConfirm: (show: boolean) => void
  save: () => Promise<void>
  deleteEntry: () => Promise<void>
  deleteEntryById: (id: string) => Promise<void>
  /** Delete a recurring entry with mode: this occurrence, future, or all */
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
    setShowDeleteConfirm(false)
    setExistingInvitations([])
  }, [])

  // ── Save (create or update) ─────────────────────────────

  const save = useCallback(async () => {
    if (!userId || !formData.title.trim()) return
    setSaving(true)

    try {
      const startDT = formData.all_day
        ? new Date(`${formData.start_date}T00:00:00`)
        : new Date(`${formData.start_date}T${formData.start_time}:00`)

      const endDT = formData.all_day
        ? new Date(`${formData.end_date}T23:59:59`)
        : new Date(`${formData.end_date}T${formData.end_time}:00`)

      const isMeeting = formData.type === "meeting"
      const isEvent = formData.type === "event" || isMeeting

      // Determine recurrence_end based on end mode
      let recurrenceEnd: string | null = null
      if (formData.is_recurring && formData.recurrence_end_mode === "on_date" && formData.recurrence_end) {
        recurrenceEnd = new Date(`${formData.recurrence_end}T23:59:59`).toISOString()
      }

      const payload: Record<string, any> = {
        user_id: userId,
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
        location: isEvent ? formData.location.trim() || null : null,
        timezone: formData.all_day ? null : (formData.timezone || null),
        meeting_link: isEvent ? formData.meeting_link.trim() || null : null,
        source: isMeeting ? "meeting" : (defaultEntryOverrides?.source || null),
        ...defaultEntryOverrides,
      }

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

      // ── Save new invitations ────────────────────────────
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

      setIsOpen(false)
      setEditingEntry(null)
      setExistingInvitations([])
      await onMutate?.()
    } catch (err) {
      console.error("Entry save failed:", err)
    } finally {
      setSaving(false)
    }
  }, [userId, formData, editingEntry, existingInvitations, supabase, onMutate, defaultEntryOverrides])

  // ── Delete entry (entire entry — used from modal footer) ─

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
  //
  // "this"   → Add the occurrence date to excluded_dates
  // "future" → Set recurrence_end to the day before occurrenceDate
  // "all"    → Delete the entire entry
  //
  const deleteRecurring = useCallback(
    async (id: string, mode: RecurringDeleteMode, occurrenceDate?: string) => {
      try {
        if (mode === "all") {
          const { error } = await supabase
            .from("calendar_entries")
            .delete()
            .eq("id", id)
          if (error) throw error
        } else if (mode === "this" && occurrenceDate) {
          // Get current excluded_dates, then append
          const { data: entry, error: fetchErr } = await supabase
            .from("calendar_entries")
            .select("excluded_dates")
            .eq("id", id)
            .single()
          if (fetchErr) throw fetchErr

          const existing: string[] = entry?.excluded_dates || []
          // Use toLocalDateStr to match how expandRecurring checks excluded dates
          const dateStr = toLocalDateStr(new Date(occurrenceDate))
          if (!existing.includes(dateStr)) {
            existing.push(dateStr)
          }

          const { error } = await supabase
            .from("calendar_entries")
            .update({ excluded_dates: existing })
            .eq("id", id)
          if (error) throw error
        } else if (mode === "future" && occurrenceDate) {
          // Set recurrence_end to the day before this occurrence
          const occ = new Date(occurrenceDate)
          occ.setDate(occ.getDate() - 1)
          occ.setHours(23, 59, 59, 0)

          const { error } = await supabase
            .from("calendar_entries")
            .update({
              recurrence_end: occ.toISOString(),
              recurrence_count: null, // Clear count if setting end date
            })
            .eq("id", id)
          if (error) throw error
        }

        setPreviewedEntry(null)
        setPreviewInvitations([])
        setIsOpen(false)
        setEditingEntry(null)
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
    open,
    close,
    preview,
    closePreview,
    setFormData,
    setShowDeleteConfirm,
    save,
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