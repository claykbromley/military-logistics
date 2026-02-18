import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

/* ═══════════════════════════════════════════════════
   Shared types
   ═══════════════════════════════════════════════════ */

export type AppointmentType =
  | "jag"
  | "legal_aid"
  | "notary"
  | "tax"
  | "will_prep"
  | "poa_signing"
  | "scra_filing"
  | "general"

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"

export type OfficeType =
  | "jag_office"
  | "legal_aid"
  | "notary"
  | "tax_center"
  | "veterans_clinic"
  | "private_attorney"
  | "military_onesource"
  | "family_advocacy"
  | "other"

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

export interface AppointmentRow {
  id: string
  user_id: string
  title: string
  description: string | null
  appointment_type: AppointmentType
  status: AppointmentStatus
  scheduled_date: string
  scheduled_time: string
  duration_min: number
  timezone: string
  provider_name: string | null
  provider_phone: string | null
  provider_email: string | null
  location_name: string | null
  location_address: string | null
  location_lat: number | null
  location_lng: number | null
  is_virtual: boolean
  virtual_link: string | null
  office_id: string | null
  reminder_sent: boolean
  reminder_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OfficeRow {
  id: string
  user_id: string | null
  name: string
  office_type: OfficeType
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  hours_json: Record<string, string> | null
  walk_in: boolean
  appointment_req: boolean
  accepts_virtual: boolean
  booking_url: string | null
  booking_phone: string | null
  installation: string | null
  branch: string | null
  is_verified: boolean
  is_bookmarked: boolean
  rating: number | null
  notes: string | null
  created_at: string
  updated_at: string
  distance_miles?: number
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
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from("legal_checklist_items")
        .select("*")
        .eq("user_id", user.id)
      if (!cancelled && data) setRows(data)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [supabase])

  const completionMap = useMemo(() => {
    const map: Record<string, { completed: boolean; notes: string | null }> = {}
    rows.forEach((r) => { map[r.item_key] = { completed: r.completed, notes: r.notes } })
    return map
  }, [rows])

  const toggle = useCallback(async (itemKey: string) => {
    if (!userId) return
    const existing = rows.find((r) => r.item_key === itemKey)

    if (existing) {
      const newVal = !existing.completed
      // Optimistic
      setRows((prev) =>
        prev.map((r) =>
          r.item_key === itemKey
            ? { ...r, completed: newVal, completed_at: newVal ? new Date().toISOString() : null }
            : r
        )
      )
      await supabase
        .from("legal_checklist_items")
        .update({ completed: newVal, completed_at: newVal ? new Date().toISOString() : null })
        .eq("id", existing.id)
    } else {
      // Insert
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
  }, [userId, rows, supabase])

  const updateNotes = useCallback(async (itemKey: string, notes: string) => {
    if (!userId) return
    const existing = rows.find((r) => r.item_key === itemKey)
    if (existing) {
      setRows((prev) => prev.map((r) => r.item_key === itemKey ? { ...r, notes } : r))
      await supabase.from("legal_checklist_items").update({ notes }).eq("id", existing.id)
    } else {
      const { data } = await supabase
        .from("legal_checklist_items")
        .insert({ user_id: userId, item_key: itemKey, completed: false, notes })
        .select()
        .single()
      if (data) setRows((prev) => [...prev, data])
    }
  }, [userId, rows, supabase])

  const resetAll = useCallback(async () => {
    if (!userId) return
    setRows([])
    await supabase.from("legal_checklist_items").delete().eq("user_id", userId)
  }, [userId, supabase])

  return { completionMap, loading, toggle, updateNotes, resetAll, isAuthenticated: !!userId }
}

/* ═══════════════════════════════════════════════════
   Hook: useLegalAppointments
   ═══════════════════════════════════════════════════ */

export function useLegalAppointments() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from("legal_appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
      if (!cancelled && data) setAppointments(data)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [supabase])

  const add = useCallback(async (appt: Partial<AppointmentRow>) => {
    if (!userId) return null
    const { data, error } = await supabase
      .from("legal_appointments")
      .insert({ ...appt, user_id: userId })
      .select()
      .single()
    if (data) setAppointments((prev) => [...prev, data].sort((a, b) =>
      `${a.scheduled_date}${a.scheduled_time}`.localeCompare(`${b.scheduled_date}${b.scheduled_time}`)
    ))
    return data
  }, [userId, supabase])

  const update = useCallback(async (id: string, data: Partial<AppointmentRow>) => {
    const { data: updated } = await supabase
      .from("legal_appointments")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    if (updated) setAppointments((prev) => prev.map((a) => a.id === id ? updated : a))
  }, [supabase])

  const remove = useCallback(async (id: string) => {
    await supabase.from("legal_appointments").delete().eq("id", id)
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }, [supabase])

  const upcoming = useMemo(() =>
    appointments.filter((a) => a.status === "scheduled" || a.status === "confirmed"),
    [appointments]
  )

  const past = useMemo(() =>
    appointments.filter((a) => a.status === "completed" || a.status === "cancelled" || a.status === "no_show"),
    [appointments]
  )

  return { appointments, upcoming, past, loading, add, update, remove, isAuthenticated: !!userId }
}

/* ═══════════════════════════════════════════════════
   Hook: useLegalOffices
   ═══════════════════════════════════════════════════ */

export function useLegalOffices() {
  const [offices, setOffices] = useState<OfficeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch all visible offices (global + user's own)
  const fetchOffices = useCallback(async () => {
    const { data } = await supabase
      .from("legal_offices")
      .select("*")
      .order("is_verified", { ascending: false })
      .order("name", { ascending: true })
    if (data) setOffices(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!cancelled) {
        setUserId(user?.id || null)
        await fetchOffices()
      }
    })()
    return () => { cancelled = true }
  }, [supabase, fetchOffices])

  // Nearby search via RPC
  const searchNearby = useCallback(async (lat: number, lng: number, radiusMiles = 50) => {
    const { data } = await supabase.rpc("find_nearby_legal_offices", {
      user_lat: lat,
      user_lng: lng,
      radius_miles: radiusMiles,
      result_limit: 20,
    })
    return (data as OfficeRow[]) || []
  }, [supabase])

  // Search by installation name
  const searchByInstallation = useCallback(async (query: string) => {
    const { data } = await supabase
      .from("legal_offices")
      .select("*")
      .ilike("installation", `%${query}%`)
      .order("name")
    return (data as OfficeRow[]) || []
  }, [supabase])

  const bookmarkOffice = useCallback(async (officeId: string, bookmarked: boolean) => {
    // For global offices, we'd create a user-specific record.
    // For simplicity, if the user owns it, just toggle.
    await supabase
      .from("legal_offices")
      .update({ is_bookmarked: bookmarked })
      .eq("id", officeId)
    setOffices((prev) =>
      prev.map((o) => o.id === officeId ? { ...o, is_bookmarked: bookmarked } : o)
    )
  }, [supabase])

  return { offices, loading, searchNearby, searchByInstallation, bookmarkOffice, isAuthenticated: !!userId }
}

/* ═══════════════════════════════════════════════════
   Hook: useLegalNotes
   ═══════════════════════════════════════════════════ */

export function useLegalNotes() {
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) { setLoading(false); return }
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
    return () => { cancelled = true }
  }, [supabase])

  const add = useCallback(async (note: Partial<NoteRow>) => {
    if (!userId) return null
    const { data } = await supabase
      .from("legal_notes")
      .insert({ ...note, user_id: userId })
      .select()
      .single()
    if (data) setNotes((prev) => [data, ...prev])
    return data
  }, [userId, supabase])

  const update = useCallback(async (id: string, data: Partial<NoteRow>) => {
    const { data: updated } = await supabase
      .from("legal_notes")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    if (updated) setNotes((prev) => prev.map((n) => n.id === id ? updated : n))
  }, [supabase])

  const remove = useCallback(async (id: string) => {
    await supabase.from("legal_notes").delete().eq("id", id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [supabase])

  return { notes, loading, add, update, remove, isAuthenticated: !!userId }
}