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

// ─── Context value ────────────────────────────────────────

interface EntryModalContextValue {
  isOpen: boolean
  editingEntry: CalendarEntry | null
  formData: EntryFormData
  saving: boolean
  showDeleteConfirm: boolean
  /** Existing invitations loaded when editing (read-only display) */
  existingInvitations: EventInvitation[]
  /** When set, the modal is locked to this type — no toggle shown */
  forceEntryType?: EntryType

  open: (entry?: CalendarEntry, date?: Date) => void
  close: () => void
  setFormData: (data: EntryFormData) => void
  setShowDeleteConfirm: (show: boolean) => void
  save: () => Promise<void>
  deleteEntry: () => Promise<void>
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
  /**
   * Lock the modal to a specific entry type. Hides the Event/Task toggle
   * and uses this type for all new entries.
   * Example: "meeting" → header shows "New Meeting", no toggle.
   */
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

        setFormData({
          type: entry.type,
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
          location: entry.location || "",
          timezone:
            entry.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          meeting_link: entry.meeting_link || "",
          invitees: [], // New invitees to add (existing ones shown separately)
        })

        // Load existing invitations
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

      const payload: Record<string, any> = {
        user_id: userId,
        type: formData.type,
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
        recurrence_end:
          formData.is_recurring && formData.recurrence_end
            ? new Date(`${formData.recurrence_end}T23:59:59`).toISOString()
            : null,
        location:
          formData.type === "event" || formData.type === "meeting"
            ? formData.location.trim() || null
            : null,
        // Page-level overrides (source, etc.)
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
        // Deduplicate against existing invitations
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

  // ── Delete entry ────────────────────────────────────────

  const deleteEntry = useCallback(async () => {
    if (!editingEntry) return
    setSaving(true)

    try {
      // Invitations are CASCADE deleted via FK
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

        // Update local state immediately
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

  // ── Context value ───────────────────────────────────────

  const value: EntryModalContextValue = {
    isOpen,
    editingEntry,
    formData,
    saving,
    showDeleteConfirm,
    existingInvitations,
    forceEntryType,
    open,
    close,
    setFormData,
    setShowDeleteConfirm,
    save,
    deleteEntry,
    toggleComplete,
    removeInvitation,
  }

  return (
    <EntryModalContext.Provider value={value}>
      {children}
    </EntryModalContext.Provider>
  )
}