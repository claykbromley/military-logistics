import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

/* ═══════════════════════════════════════════════════
   Shared types
   ═══════════════════════════════════════════════════ */

export interface ChecklistRow {
  id: string
  user_id: string
  item_key: string
  completed: boolean
  completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NoteRow {
  id: string
  user_id: string
  title: string
  content: string | null
  category: string | null
  pinned: boolean
  created_at: string
  updated_at: string
}

/* ═══════════════════════════════════════════════════
   Hook: useLegalChecklist
   ═══════════════════════════════════════════════════

   Reads/writes to the `legal_checklist_items` table in
   Supabase. Each row maps an item_key (e.g. "will",
   "poa-general") to its completion state for a user.

   All mutations are optimistic — the UI updates immediately
   and the database write happens in the background.
   ═══════════════════════════════════════════════════ */

export function useLegalChecklist() {
  const [rows, setRows] = useState<ChecklistRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Auth + initial fetch
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data } = await supabase
        .from("legal_checklist_items")
        .select("*")
        .eq("user_id", user.id)
      if (!cancelled && data) setRows(data)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [supabase])

  // Build a lookup map: item_key → { completed, notes }
  const completionMap = useMemo(() => {
    const map: Record<string, { completed: boolean; notes: string | null }> = {}
    rows.forEach((r) => {
      map[r.item_key] = { completed: r.completed, notes: r.notes }
    })
    return map
  }, [rows])

  // Toggle an item's completion state (optimistic)
  const toggle = useCallback(
    async (itemKey: string) => {
      if (!userId) return
      const existing = rows.find((r) => r.item_key === itemKey)

      if (existing) {
        const newVal = !existing.completed
        // Optimistic update
        setRows((prev) =>
          prev.map((r) =>
            r.item_key === itemKey
              ? {
                  ...r,
                  completed: newVal,
                  completed_at: newVal ? new Date().toISOString() : null,
                }
              : r
          )
        )
        await supabase
          .from("legal_checklist_items")
          .update({
            completed: newVal,
            completed_at: newVal ? new Date().toISOString() : null,
          })
          .eq("id", existing.id)
      } else {
        // Insert new row (first time checking this item)
        const newRow: Partial<ChecklistRow> = {
          user_id: userId,
          item_key: itemKey,
          completed: true,
          completed_at: new Date().toISOString(),
        }
        const { data } = await supabase
          .from("legal_checklist_items")
          .insert(newRow)
          .select()
          .single()
        if (data) setRows((prev) => [...prev, data])
      }
    },
    [userId, rows, supabase]
  )

  // Update notes for a checklist item
  const updateNotes = useCallback(
    async (itemKey: string, notes: string) => {
      if (!userId) return
      const existing = rows.find((r) => r.item_key === itemKey)
      if (existing) {
        setRows((prev) =>
          prev.map((r) => (r.item_key === itemKey ? { ...r, notes } : r))
        )
        await supabase
          .from("legal_checklist_items")
          .update({ notes })
          .eq("id", existing.id)
      } else {
        const { data } = await supabase
          .from("legal_checklist_items")
          .insert({
            user_id: userId,
            item_key: itemKey,
            completed: false,
            notes,
          })
          .select()
          .single()
        if (data) setRows((prev) => [...prev, data])
      }
    },
    [userId, rows, supabase]
  )

  // Reset all checklist items for this user
  const resetAll = useCallback(async () => {
    if (!userId) return
    setRows([])
    await supabase
      .from("legal_checklist_items")
      .delete()
      .eq("user_id", userId)
  }, [userId, supabase])

  return {
    completionMap,
    loading,
    toggle,
    updateNotes,
    resetAll,
    isAuthenticated: !!userId,
  }
}

/* ═══════════════════════════════════════════════════
   Hook: useLegalNotes
   ═══════════════════════════════════════════════════

   Reads/writes to the `legal_notes` table in Supabase.
   Notes are personal freeform text entries the user can
   pin, categorize, and edit.
   ═══════════════════════════════════════════════════ */

export function useLegalNotes() {
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data } = await supabase
        .from("legal_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false })
      if (!cancelled && data) setNotes(data)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [supabase])

  const add = useCallback(
    async (note: Partial<NoteRow>) => {
      if (!userId) return null
      const { data } = await supabase
        .from("legal_notes")
        .insert({ ...note, user_id: userId })
        .select()
        .single()
      if (data) setNotes((prev) => [data, ...prev])
      return data
    },
    [userId, supabase]
  )

  const update = useCallback(
    async (id: string, data: Partial<NoteRow>) => {
      const { data: updated } = await supabase
        .from("legal_notes")
        .update(data)
        .eq("id", id)
        .select()
        .single()
      if (updated)
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)))
    },
    [supabase]
  )

  const remove = useCallback(
    async (id: string) => {
      await supabase.from("legal_notes").delete().eq("id", id)
      setNotes((prev) => prev.filter((n) => n.id !== id))
    },
    [supabase]
  )

  return {
    notes,
    loading,
    add,
    update,
    remove,
    isAuthenticated: !!userId,
  }
}