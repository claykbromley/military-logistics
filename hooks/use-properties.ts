"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type PropertyType = "home" | "rental" | "vehicle" | "storage" | "other"
export type MaintenanceFrequency = "weekly" | "monthly" | "quarterly" | "annually" | "one_time"

export interface MaintenanceTask {
  id: string
  propertyId: string
  taskName: string
  description?: string
  frequency: MaintenanceFrequency
  lastCompleted?: string
  nextDue?: string
  assignedToContactId?: string
  assignedToName?: string
  isCompleted: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Property {
  id: string
  propertyType: PropertyType
  propertyName: string
  address?: string
  make?: string
  model?: string
  year?: number
  vin?: string
  licensePlate?: string
  storageLocation?: string
  insuranceCompany?: string
  insurancePolicyNumber?: string
  insuranceExpiry?: string
  registrationExpiry?: string
  inspectionExpiry?: string
  caretakerContactId?: string
  caretakerName?: string
  caretakerPhone?: string
  caretakerEmail?: string
  notes?: string
  maintenanceTasks: MaintenanceTask[]
  createdAt: string
  updatedAt: string
  isVehicle?: boolean
}

export interface EmergencyContact {
  id: string
  name: string
  relationship?: string
  role?: string
  phone?: string
  phoneSecondary?: string
  email?: string
  address?: string
  isPrimary: boolean
  hasPoa: boolean
  poaType?: string
  canAccessAccounts: boolean
  priority: number
  notes?: string
  createdAt: string
  updatedAt: string
}

function calculateNextDueDate(lastCompleted: string, frequency: MaintenanceFrequency): string | undefined {
  if (frequency === "one_time") return undefined
  const last = new Date(lastCompleted)
  const next = new Date(last)
  switch (frequency) {
    case "weekly": next.setDate(next.getDate() + 7); break
    case "monthly": next.setMonth(next.getMonth() + 1); break
    case "quarterly": next.setMonth(next.getMonth() + 3); break
    case "annually": next.setFullYear(next.getFullYear() + 1); break
  }
  return next.toISOString().split("T")[0]
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const loadEmergencyContacts = useCallback(async (supabase: ReturnType<typeof createClient>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("priority", { ascending: false })
    const { data: myData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Failed to load emergency contacts:", error)
      return []
    }

    data.unshift({
      id: 0,
      name: "Myself",
      phone: myData.phone,
      email: myData.email
    })

    return (data || []).map((c: Record<string, any>) => ({
      id: c.id,
      name: c.name,
      relationship: c.relationship || undefined,
      role: c.role || undefined,
      phone: c.phone || undefined,
      phoneSecondary: c.phone_secondary || undefined,
      email: c.email || undefined,
      address: c.address || undefined,
      isPrimary: c.is_primary || false,
      hasPoa: c.has_poa || false,
      poaType: c.poa_type || undefined,
      canAccessAccounts: c.can_access_accounts || false,
      priority: c.priority || 0,
      notes: c.notes || undefined,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }))
  }, [])

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoaded(true); return }
    setUserId(user.id)
    setIsSyncing(true)
    try {
      const contacts = await loadEmergencyContacts(supabase)
      setEmergencyContacts(contacts)

      const { data: propData, error: propErr } = await supabase
        .from("properties").select("*, maintenance_records(*)").eq("user_id", user.id).order("created_at", { ascending: false })
      const { data: vehData, error: vehErr } = await supabase
        .from("vehicles").select("*, maintenance_records(*)").eq("user_id", user.id).order("created_at", { ascending: false })

      if (propErr) console.error("Failed to load properties:", propErr)
      if (vehErr) console.error("Failed to load vehicles:", vehErr)

      const mapTask = (m: any, pid: string) => ({
        id: m.id, propertyId: pid, taskName: m.title,
        description: m.description || undefined, frequency: m.frequency || "one_time",
        lastCompleted: m.completed_date || undefined, nextDue: m.due_date || undefined,
        assignedToContactId: m.assigned_to_contact_id || undefined,
        assignedToName: m.assigned_to_name || undefined,
        isCompleted: m.status === "completed", notes: m.notes || undefined,
        createdAt: m.created_at, updatedAt: m.updated_at,
      })

      const mappedProperties: Property[] = (propData || []).map((p: any) => ({
        id: p.id, propertyType: (p.property_type as PropertyType) || "other",
        propertyName: p.name, address: p.address || undefined,
        insuranceCompany: p.insurance_company || undefined,
        insurancePolicyNumber: p.insurance_policy_number || undefined,
        insuranceExpiry: p.insurance_expiry || undefined,
        caretakerContactId: p.caretaker_contact_id || undefined,
        caretakerName: contacts.find((c: any) => c.id === p.caretaker_contact_id)?.name || p.caretaker_name || undefined,
        caretakerPhone: contacts.find((c: any) => c.id === p.caretaker_contact_id)?.phone || p.caretaker_phone || undefined,
        caretakerEmail: contacts.find((c: any) => c.id === p.caretaker_contact_id)?.email || undefined,
        notes: p.notes || undefined,
        maintenanceTasks: (p.maintenance_records || []).map((m: any) => mapTask(m, p.id)),
        createdAt: p.created_at, updatedAt: p.updated_at, isVehicle: false,
      }))

      const mappedVehicles: Property[] = (vehData || []).map((v: any) => ({
        id: v.id, propertyType: "vehicle" as PropertyType,
        propertyName: v.name || [v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle",
        make: v.make || undefined, model: v.model || undefined, year: v.year || undefined,
        vin: v.vin || undefined, licensePlate: v.license_plate || undefined,
        storageLocation: v.storage_location || undefined,
        insuranceCompany: v.insurance_company || undefined,
        insurancePolicyNumber: v.insurance_policy_number || undefined,
        insuranceExpiry: v.insurance_expiry || undefined,
        registrationExpiry: v.registration_expiry || undefined,
        inspectionExpiry: v.inspection_expiry || undefined,
        caretakerContactId: v.caretaker_contact_id || undefined,
        caretakerName: contacts.find((c: any) => c.id === v.caretaker_contact_id)?.name || v.caretaker_name || undefined,
        caretakerPhone: contacts.find((c: any) => c.id === v.caretaker_contact_id)?.phone || v.caretaker_phone || undefined,
        caretakerEmail: contacts.find((c: any) => c.id === v.caretaker_contact_id)?.email || undefined,
        notes: v.notes || undefined,
        maintenanceTasks: (v.maintenance_records || []).map((m: any) => mapTask(m, v.id)),
        createdAt: v.created_at, updatedAt: v.updated_at, isVehicle: true,
      }))

      setProperties([...mappedProperties, ...mappedVehicles])
    } catch (err) {
      console.error("Failed to load data:", err)
      setProperties([])
    } finally {
      setIsLoaded(true)
      setIsSyncing(false)
    }
  }, [loadEmergencyContacts])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const supabase = createClient()
    const subscription = supabase.auth.onAuthStateChange(() => { loadData() })
    return () => subscription.data.subscription.unsubscribe()
  }, [loadData])

  // ── Calendar sync for property expiry dates ─────────────────

  const syncPropertyCalendarEvents = useCallback(async (
    propertyId: string,
    propertyName: string,
    propertyType: PropertyType,
    address: string | undefined,
    dates: { insuranceExpiry?: string | null; registrationExpiry?: string | null; inspectionExpiry?: string | null }
  ) => {
    if (!userId) return
    const supabase = createClient()
    const eventColor = "#f59e0b"

    const dateEntries: { key: string; date?: string | null; label: string }[] = [
      { key: "insurance", date: dates.insuranceExpiry, label: "Insurance Expiry" },
    ]
    if (propertyType === "vehicle") {
      dateEntries.push(
        { key: "registration", date: dates.registrationExpiry, label: "Registration Expiry" },
        { key: "inspection", date: dates.inspectionExpiry, label: "Inspection Expiry" },
      )
    }

    for (const { key, date, label } of dateEntries) {
      const tag = `[prop:${propertyId}:${key}]`
      const { data: existing } = await supabase
        .from("calendar_entries").select("id")
        .eq("user_id", userId).eq("source", "property")
        .eq("linked_entity_tag", tag).maybeSingle()

      if (date) {
        const startTime = new Date(`${date}T00:00:00`).toISOString()
        const endTime = new Date(`${date}T23:59:59`).toISOString()
        const title = `${propertyName} \u2014 ${label}`
        const description = address ? `${label} for ${propertyName}\n${address}` : `${label} for ${propertyName}`

        if (existing) {
          await supabase.from("calendar_entries")
            .update({ title, description, start_time: startTime, end_time: endTime, color: eventColor, location: address || null, linked_entity_tag: tag })
            .eq("id", existing.id)
        } else {
          await supabase.from("calendar_entries").insert({
            user_id: userId, type: "event", title, description, color: eventColor,
            start_time: startTime, end_time: endTime, all_day: true,
            is_recurring: false, recurrence_interval: 1, source: "property",
            location: address || null, linked_entity_tag: tag,
          })
        }
      } else if (existing) {
        await supabase.from("calendar_entries").delete().eq("id", existing.id)
      }
    }
  }, [userId])

  const deletePropertyCalendarEvents = useCallback(async (propertyId: string) => {
    if (!userId) return
    const supabase = createClient()
    const { data: entries } = await supabase
      .from("calendar_entries").select("id")
      .eq("user_id", userId).eq("source", "property")
      .like("linked_entity_tag", `[prop:${propertyId}:%`)
    if (entries && entries.length > 0) {
      await supabase.from("calendar_entries").delete()
        .in("id", entries.map((e: any) => e.id))
    }
  }, [userId])

  // ── Add property ────────────────────────────────────────────

  const addProperty = useCallback(async (prop: Omit<Property, "id" | "createdAt" | "updatedAt" | "maintenanceTasks">) => {
    if (!userId) return null
    const supabase = createClient()
    const isVehicle = prop.propertyType === "vehicle"

    if (isVehicle) {
      const { data, error } = await supabase.from("vehicles").insert({
        user_id: userId, name: prop.propertyName,
        make: prop.make || null, model: prop.model || null, year: prop.year || null,
        vin: prop.vin || null, license_plate: prop.licensePlate || null,
        storage_location: prop.storageLocation || null,
        insurance_company: prop.insuranceCompany || null,
        insurance_policy_number: prop.insurancePolicyNumber || null,
        insurance_expiry: prop.insuranceExpiry || null,
        registration_expiry: prop.registrationExpiry || null,
        inspection_expiry: prop.inspectionExpiry || null,
        caretaker_contact_id: prop.caretakerContactId || null,
        caretaker_name: prop.caretakerName || null,
        caretaker_phone: prop.caretakerPhone || null,
        notes: prop.notes || null,
      }).select().single()
      if (error) { console.error("Failed to add vehicle:", error); return null }

      const caretaker = prop.caretakerContactId ? emergencyContacts.find(c => c.id === prop.caretakerContactId) : null
      const newProp: Property = {
        id: data.id, propertyType: "vehicle", propertyName: prop.propertyName,
        make: data.make || undefined, model: data.model || undefined, year: data.year || undefined,
        vin: data.vin || undefined, licensePlate: data.license_plate || undefined,
        storageLocation: data.storage_location || undefined,
        insuranceCompany: data.insurance_company || undefined,
        insurancePolicyNumber: data.insurance_policy_number || undefined,
        insuranceExpiry: data.insurance_expiry || undefined,
        registrationExpiry: data.registration_expiry || undefined,
        inspectionExpiry: data.inspection_expiry || undefined,
        caretakerContactId: data.caretaker_contact_id || undefined,
        caretakerName: caretaker?.name || data.caretaker_name || undefined,
        caretakerPhone: caretaker?.phone || data.caretaker_phone || undefined,
        caretakerEmail: caretaker?.email || undefined,
        notes: data.notes || undefined, maintenanceTasks: [],
        createdAt: data.created_at, updatedAt: data.updated_at, isVehicle: true,
      }
      setProperties((prev) => [newProp, ...prev])

      // Sync calendar events for vehicle expiry dates
      await syncPropertyCalendarEvents(newProp.id, newProp.propertyName, "vehicle", newProp.storageLocation, {
        insuranceExpiry: newProp.insuranceExpiry,
        registrationExpiry: newProp.registrationExpiry,
        inspectionExpiry: newProp.inspectionExpiry,
      })

      return newProp
    }

    // Non-vehicle property
    const { data, error } = await supabase.from("properties").insert({
      user_id: userId, name: prop.propertyName, property_type: prop.propertyType,
      address: prop.address || null,
      insurance_company: prop.insuranceCompany || null,
      insurance_policy_number: prop.insurancePolicyNumber || null,
      insurance_expiry: prop.insuranceExpiry || null,
      caretaker_contact_id: prop.caretakerContactId || null,
      caretaker_name: prop.caretakerName || null,
      caretaker_phone: prop.caretakerPhone || null,
      notes: prop.notes || null,
    }).select().single()
    if (error) { console.error("Failed to add property:", error); return null }

    const caretaker = prop.caretakerContactId ? emergencyContacts.find(c => c.id === prop.caretakerContactId) : null
    const newProp: Property = {
      id: data.id, propertyType: (data.property_type as PropertyType) || "other",
      propertyName: data.name, address: data.address || undefined,
      insuranceCompany: data.insurance_company || undefined,
      insurancePolicyNumber: data.insurance_policy_number || undefined,
      insuranceExpiry: data.insurance_expiry || undefined,
      caretakerContactId: data.caretaker_contact_id || undefined,
      caretakerName: caretaker?.name || data.caretaker_name || undefined,
      caretakerPhone: caretaker?.phone || data.caretaker_phone || undefined,
      caretakerEmail: caretaker?.email || undefined,
      notes: data.notes || undefined, maintenanceTasks: [],
      createdAt: data.created_at, updatedAt: data.updated_at, isVehicle: false,
    }
    setProperties((prev) => [newProp, ...prev])

    // Sync calendar events for property expiry dates
    await syncPropertyCalendarEvents(newProp.id, newProp.propertyName, newProp.propertyType, newProp.address, {
      insuranceExpiry: newProp.insuranceExpiry,
    })

    return newProp
  }, [userId, emergencyContacts, syncPropertyCalendarEvents])

  // ── Update property ─────────────────────────────────────────

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    if (!userId) return
    const property = properties.find((p) => p.id === id)
    const isVehicle = property?.isVehicle || property?.propertyType === "vehicle"
    const supabase = createClient()

    if (isVehicle) {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.propertyName !== undefined) dbUpdates.name = updates.propertyName
      if (updates.make !== undefined) dbUpdates.make = updates.make || null
      if (updates.model !== undefined) dbUpdates.model = updates.model || null
      if (updates.year !== undefined) dbUpdates.year = updates.year || null
      if (updates.vin !== undefined) dbUpdates.vin = updates.vin || null
      if (updates.licensePlate !== undefined) dbUpdates.license_plate = updates.licensePlate || null
      if (updates.storageLocation !== undefined) dbUpdates.storage_location = updates.storageLocation || null
      if (updates.insuranceCompany !== undefined) dbUpdates.insurance_company = updates.insuranceCompany || null
      if (updates.insurancePolicyNumber !== undefined) dbUpdates.insurance_policy_number = updates.insurancePolicyNumber || null
      if (updates.insuranceExpiry !== undefined) dbUpdates.insurance_expiry = updates.insuranceExpiry || null
      if (updates.registrationExpiry !== undefined) dbUpdates.registration_expiry = updates.registrationExpiry || null
      if (updates.inspectionExpiry !== undefined) dbUpdates.inspection_expiry = updates.inspectionExpiry || null
      if (updates.caretakerContactId !== undefined) dbUpdates.caretaker_contact_id = updates.caretakerContactId || null
      if (updates.caretakerName !== undefined) dbUpdates.caretaker_name = updates.caretakerName || null
      if (updates.caretakerPhone !== undefined) dbUpdates.caretaker_phone = updates.caretakerPhone || null
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
      const { error } = await supabase.from("vehicles").update(dbUpdates).eq("id", id)
      if (error) { console.error("Failed to update vehicle:", error); return }
    } else {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.propertyName !== undefined) dbUpdates.name = updates.propertyName
      if (updates.propertyType !== undefined) dbUpdates.property_type = updates.propertyType
      if (updates.address !== undefined) dbUpdates.address = updates.address || null
      if (updates.insuranceCompany !== undefined) dbUpdates.insurance_company = updates.insuranceCompany || null
      if (updates.insurancePolicyNumber !== undefined) dbUpdates.insurance_policy_number = updates.insurancePolicyNumber || null
      if (updates.insuranceExpiry !== undefined) dbUpdates.insurance_expiry = updates.insuranceExpiry || null
      if (updates.caretakerContactId !== undefined) dbUpdates.caretaker_contact_id = updates.caretakerContactId || null
      if (updates.caretakerName !== undefined) dbUpdates.caretaker_name = updates.caretakerName || null
      if (updates.caretakerPhone !== undefined) dbUpdates.caretaker_phone = updates.caretakerPhone || null
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
      const { error } = await supabase.from("properties").update(dbUpdates).eq("id", id)
      if (error) { console.error("Failed to update property:", error); return }
    }

    const caretaker = updates.caretakerContactId
      ? emergencyContacts.find(c => c.id === updates.caretakerContactId) : null
    if (caretaker) {
      updates.caretakerName = caretaker.name
      updates.caretakerPhone = caretaker.phone
      updates.caretakerEmail = caretaker.email
    }

    setProperties((prev) => prev.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ))

    // Sync calendar events for updated expiry dates
    if (property) {
      const merged = { ...property, ...updates }
      await syncPropertyCalendarEvents(id, merged.propertyName, merged.propertyType, merged.address || merged.storageLocation, {
        insuranceExpiry: merged.insuranceExpiry,
        registrationExpiry: merged.registrationExpiry,
        inspectionExpiry: merged.inspectionExpiry,
      })
    }
  }, [userId, properties, emergencyContacts, syncPropertyCalendarEvents])

  // ── Delete property ─────────────────────────────────────────

  const deleteProperty = useCallback(async (id: string) => {
    if (!userId) return
    const property = properties.find((p) => p.id === id)
    const isVehicle = property?.isVehicle || property?.propertyType === "vehicle"
    const supabase = createClient()
    const table = isVehicle ? "vehicles" : "properties"
    const { error } = await supabase.from(table).delete().eq("id", id)
    if (error) { console.error(`Failed to delete ${table}:`, error); return }

    // Delete all calendar events linked to this property
    await deletePropertyCalendarEvents(id)

    setProperties((prev) => prev.filter((p) => p.id !== id))
  }, [userId, properties, deletePropertyCalendarEvents])

  // ── Maintenance tasks ───────────────────────────────────────

  const addMaintenanceTask = useCallback(
    async (propertyId: string, task: Omit<MaintenanceTask, "id" | "propertyId" | "createdAt" | "updatedAt">) => {
      if (!userId) return null
      const property = properties.find((p) => p.id === propertyId)
      const isVehicle = property?.isVehicle || property?.propertyType === "vehicle"
      const supabase = createClient()
      const { data, error } = await supabase.from("maintenance_records").insert({
        user_id: userId,
        property_id: isVehicle ? null : propertyId,
        vehicle_id: isVehicle ? propertyId : null,
        title: task.taskName, description: task.description || null,
        task_type: "routine",
        status: task.isCompleted ? "completed" : "pending",
        due_date: task.nextDue || null,
        completed_date: task.isCompleted ? task.lastCompleted || new Date().toISOString().split("T")[0] : null,
        frequency: task.frequency, notes: task.notes || null,
      }).select().single()
      if (error) { console.error("Failed to add maintenance task:", error); return null }

      const newTask: MaintenanceTask = {
        id: data.id, propertyId, taskName: data.title,
        description: data.description || undefined, frequency: data.frequency || "one_time",
        lastCompleted: data.completed_date || undefined, nextDue: data.due_date || undefined,
        isCompleted: data.status === "completed", notes: data.notes || undefined,
        createdAt: data.created_at, updatedAt: data.updated_at,
      }
      setProperties((prev) => prev.map((p) =>
        p.id === propertyId ? { ...p, maintenanceTasks: [...p.maintenanceTasks, newTask] } : p
      ))
      return newTask
    }, [userId, properties]
  )

  const updateMaintenanceTask = useCallback(
    async (propertyId: string, taskId: string, updates: Partial<MaintenanceTask>) => {
      if (!userId) return
      const supabase = createClient()
      const dbUpdates: Record<string, unknown> = {}
      if (updates.taskName !== undefined) dbUpdates.title = updates.taskName
      if (updates.description !== undefined) dbUpdates.description = updates.description || null
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency
      if (updates.nextDue !== undefined) dbUpdates.due_date = updates.nextDue || null
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
      if (updates.isCompleted !== undefined) {
        dbUpdates.status = updates.isCompleted ? "completed" : "pending"
        if (updates.isCompleted) {
          dbUpdates.completed_date = updates.lastCompleted || new Date().toISOString().split("T")[0]
          const completedDate = dbUpdates.completed_date as string
          const property = properties.find((p) => p.id === propertyId)
          const task = property?.maintenanceTasks.find((t) => t.id === taskId)
          if (task) {
            const nextDue = calculateNextDueDate(completedDate, task.frequency)
            if (nextDue) { dbUpdates.due_date = nextDue; updates.nextDue = nextDue }
          }
        }
      }
      if (updates.lastCompleted !== undefined) dbUpdates.completed_date = updates.lastCompleted
      const { error } = await supabase.from("maintenance_records").update(dbUpdates).eq("id", taskId)
      if (error) { console.error("Failed to update maintenance task:", error); return }
      setProperties((prev) => prev.map((p) =>
        p.id === propertyId
          ? { ...p, maintenanceTasks: p.maintenanceTasks.map((t) => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t) }
          : p
      ))
    }, [userId, properties]
  )

  const deleteMaintenanceTask = useCallback(
    async (propertyId: string, taskId: string) => {
      if (!userId) return
      const supabase = createClient()
      const { error } = await supabase.from("maintenance_records").delete().eq("id", taskId)
      if (error) { console.error("Failed to delete maintenance task:", error); return }
      setProperties((prev) => prev.map((p) =>
        p.id === propertyId ? { ...p, maintenanceTasks: p.maintenanceTasks.filter((t) => t.id !== taskId) } : p
      ))
    }, [userId]
  )

  // ── Queries ─────────────────────────────────────────────────

  const getPropertiesByType = useCallback(
    (type: PropertyType) => properties.filter((p) => p.propertyType === type), [properties]
  )

  const getUpcomingMaintenance = useCallback(
    (withinDays = 30) => {
      const now = new Date()
      const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)
      return properties
        .flatMap((p) => p.maintenanceTasks
          .filter((t) => { if (t.isCompleted) return false; if (!t.nextDue) return true; return new Date(t.nextDue) <= cutoff })
          .map((t) => ({ ...t, propertyName: p.propertyName, propertyId: p.id }))
        )
        .sort((a, b) => { if (!a.nextDue) return 1; if (!b.nextDue) return -1; return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime() })
    }, [properties]
  )

  const getExpiringItems = useCallback(
    (withinDays = 60) => {
      const now = new Date()
      const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)
      const items: { propertyId: string; propertyName: string; itemType: string; date: string; daysUntil: number }[] = []
      properties.forEach((p) => {
        const checkDate = (dateStr: string | undefined, itemType: string) => {
          if (!dateStr) return
          const date = new Date(dateStr)
          if (date <= cutoff) {
            const diffMs = date.getTime() - now.getTime()
            items.push({ propertyId: p.id, propertyName: p.propertyName, itemType, date: dateStr, daysUntil: Math.ceil(diffMs / (1000 * 60 * 60 * 24)) })
          }
        }
        checkDate(p.insuranceExpiry, "Insurance")
        if (p.propertyType === "vehicle") {
          checkDate(p.registrationExpiry, "Registration")
          checkDate(p.inspectionExpiry, "Inspection")
        }
      })
      return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [properties]
  )

  return {
    properties, emergencyContacts, isLoaded, isSyncing,
    isAuthenticated: !!userId,
    addProperty, updateProperty, deleteProperty,
    addMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask,
    getPropertiesByType, getUpcomingMaintenance, getExpiringItems,
  }
}