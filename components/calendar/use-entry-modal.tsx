"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import type { CalendarEntry, EntryFormData } from "@/app/scheduler/calendar/types"
import { defaultFormData, toLocalDateStr, toLocalTimeStr } from "@/app/scheduler/calendar/utils"

// ─── Context value ────────────────────────────────────────

interface EntryModalContextValue {
  // State (exposed so the dumb modal can render)
  isOpen: boolean
  editingEntry: CalendarEntry | null
  formData: EntryFormData
  saving: boolean
  showDeleteConfirm: boolean

  // Actions for consumers (pages that want to open the modal)
  open: (entry?: CalendarEntry, date?: Date) => void
  close: () => void

  // Internal actions (used by the modal UI itself)
  setFormData: (data: EntryFormData) => void
  setShowDeleteConfirm: (show: boolean) => void
  save: () => Promise<void>
  deleteEntry: () => Promise<void>
  toggleComplete: (entry: CalendarEntry) => Promise<void>
}

const EntryModalContext = createContext<EntryModalContextValue | null>(null)

// ─── Hook ─────────────────────────────────────────────────

export function useEntryModal() {
  const ctx = useContext(EntryModalContext)
  if (!ctx) {
    throw new Error("useEntryModal must be used within an <EntryModalProvider>")
  }
  return ctx
}

// ─── Provider ─────────────────────────────────────────────

interface EntryModalProviderProps {
  /** The authenticated user's ID. If null/undefined, open() will call onAuthRequired instead. */
  userId?: string | null
  /** Called when a user tries to open the modal but isn't authenticated */
  onAuthRequired?: () => void
  /** Called after any successful create / update / delete so the consumer can refetch its data */
  onMutate?: () => void | Promise<void>
  /**
   * Partial CalendarEntry fields that are automatically merged into every
   * save payload (create & update). Use this to tag entries by source page.
   *
   * Examples:
   *   { source: "meeting" }                          — communication hub
   *   { source: "expirationDates", all_day: true }   — expiration tracker
   *   { source: "calendar" }                         — main calendar (or omit)
   */
  defaultEntryOverrides?: Partial<Record<string, any>>
  children: ReactNode
}

export function EntryModalProvider({
  userId,
  onAuthRequired,
  onMutate,
  defaultEntryOverrides,
  children,
}: EntryModalProviderProps) {
  const supabase = createClient()

  const [isOpen, setIsOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null)
  const [formData, setFormData] = useState<EntryFormData>(defaultFormData())
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // ── Open ────────────────────────────────────────────────

  const open = useCallback(
    (entry?: CalendarEntry, date?: Date) => {
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
        })
      } else {
        // Create mode
        setEditingEntry(null)
        setFormData(defaultFormData(date))
      }

      setShowDeleteConfirm(false)
      setIsOpen(true)
    },
    [userId, onAuthRequired],
  )

  // ── Close ───────────────────────────────────────────────

  const close = useCallback(() => {
    setIsOpen(false)
    setEditingEntry(null)
    setShowDeleteConfirm(false)
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
          formData.type === "event"
            ? formData.location.trim() || null
            : null,
        // Merge page-level overrides (source, all_day, etc.) — always wins
        ...defaultEntryOverrides,
      }

      if (editingEntry) {
        const { error } = await supabase
          .from("calendar_entries")
          .update(payload)
          .eq("id", editingEntry.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("calendar_entries")
          .insert(payload)
        if (error) throw error
      }

      setIsOpen(false)
      setEditingEntry(null)
      await onMutate?.()
    } catch (err) {
      console.error("Entry save failed:", err)
    } finally {
      setSaving(false)
    }
  }, [userId, formData, editingEntry, supabase, onMutate])

  // ── Delete ──────────────────────────────────────────────

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
      await onMutate?.()
    } catch (err) {
      console.error("Entry delete failed:", err)
    } finally {
      setSaving(false)
    }
  }, [editingEntry, supabase, onMutate])

  // ── Toggle complete (convenience — used by chips/cards) ─

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
    open,
    close,
    setFormData,
    setShowDeleteConfirm,
    save,
    deleteEntry,
    toggleComplete,
  }

  return (
    <EntryModalContext.Provider value={value}>
      {children}
    </EntryModalContext.Provider>
  )
}