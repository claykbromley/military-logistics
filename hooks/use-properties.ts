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
  // Vehicle-specific fields
  make?: string
  model?: string
  year?: number
  vin?: string
  licensePlate?: string
  storageLocation?: string
  // Common fields
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

// Calculate next due date based on frequency
function calculateNextDueDate(lastCompleted: string, frequency: MaintenanceFrequency): string | undefined {
  if (frequency === "one_time") return undefined
  
  const last = new Date(lastCompleted)
  const next = new Date(last)
  
  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7)
      break
    case "monthly":
      next.setMonth(next.getMonth() + 1)
      break
    case "quarterly":
      next.setMonth(next.getMonth() + 3)
      break
    case "annually":
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  
  return next.toISOString().split("T")[0]
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Load emergency contacts
  const loadEmergencyContacts = useCallback(async (supabase: ReturnType<typeof createClient>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {return []}

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
    console.log(myData)

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

  // Load data from Supabase
  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setUserId(null)
      setProperties([])
      setEmergencyContacts([])
      setIsLoaded(true)
      return
    }

    setUserId(user.id)
    setIsSyncing(true)

    try {
      // Load emergency contacts
      const contacts = await loadEmergencyContacts(supabase)
      setEmergencyContacts(contacts)

      // Fetch properties
      const { data: propertiesData, error: propError } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })

      if (propError) throw propError

      // Fetch vehicles
      const { data: vehiclesData, error: vehError } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false })

      if (vehError) throw vehError

      // Fetch maintenance records
      const { data: maintenanceData } = await supabase
        .from("maintenance_records")
        .select("*")
        .order("due_date", { ascending: true })

      // Map properties
      const mappedProperties: Property[] = (propertiesData || []).map((p) => {
        const caretaker = p.caretaker_contact_id 
          ? contacts.find(c => c.id === p.caretaker_contact_id)
          : null

        return {
          id: p.id,
          propertyType: (p.property_type as PropertyType) || "other",
          propertyName: p.name,
          address: p.address || undefined,
          insuranceCompany: p.insurance_company || undefined,
          insurancePolicyNumber: p.insurance_policy_number || undefined,
          insuranceExpiry: p.insurance_expiry || undefined,
          caretakerContactId: p.caretaker_contact_id || undefined,
          caretakerName: caretaker?.name || p.caretaker_name || undefined,
          caretakerPhone: caretaker?.phone || p.caretaker_phone || undefined,
          caretakerEmail: caretaker?.email || undefined,
          notes: p.notes || undefined,
          maintenanceTasks: (maintenanceData || [])
            .filter((m) => m.property_id === p.id)
            .map((m) => {
              const assignedContact = m.assigned_to_contact_id
                ? contacts.find(c => c.id === m.assigned_to_contact_id)
                : null

              return {
                id: m.id,
                propertyId: p.id,
                taskName: m.title,
                description: m.description || undefined,
                frequency: (m.recurrence_interval as MaintenanceFrequency) || "one_time",
                lastCompleted: m.completed_date || undefined,
                nextDue: m.due_date || undefined,
                assignedToContactId: m.assigned_to_contact_id || undefined,
                assignedToName: assignedContact?.name || m.assigned_to || undefined,
                isCompleted: m.status === "completed",
                notes: m.notes || undefined,
                createdAt: m.created_at,
                updatedAt: m.updated_at,
              }
            }),
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          isVehicle: false,
        }
      })

      // Map vehicles
      const mappedVehicles: Property[] = (vehiclesData || []).map((v) => {
        const caretaker = v.caretaker_contact_id 
          ? contacts.find(c => c.id === v.caretaker_contact_id)
          : null

        return {
          id: v.id,
          propertyType: "vehicle" as PropertyType,
          propertyName: `${v.year || ""} ${v.make || ""} ${v.model || ""}`.trim() || v.name,
          make: v.make || undefined,
          model: v.model || undefined,
          year: v.year || undefined,
          vin: v.vin || undefined,
          licensePlate: v.license_plate || undefined,
          storageLocation: v.storage_location || undefined,
          insuranceCompany: v.insurance_company || undefined,
          insurancePolicyNumber: v.insurance_policy_number || undefined,
          insuranceExpiry: v.insurance_expiry || undefined,
          registrationExpiry: v.registration_expiry || undefined,
          inspectionExpiry: v.inspection_expiry || undefined,
          caretakerContactId: v.caretaker_contact_id || undefined,
          caretakerName: caretaker?.name || v.caretaker_name || undefined,
          caretakerPhone: caretaker?.phone || v.caretaker_phone || undefined,
          caretakerEmail: caretaker?.email || undefined,
          notes: v.notes || undefined,
          maintenanceTasks: (maintenanceData || [])
            .filter((m) => m.vehicle_id === v.id)
            .map((m) => {
              const assignedContact = m.assigned_to_contact_id
                ? contacts.find(c => c.id === m.assigned_to_contact_id)
                : null

              return {
                id: m.id,
                propertyId: v.id,
                taskName: m.title,
                description: m.description || undefined,
                frequency: (m.recurrence_interval as MaintenanceFrequency) || "one_time",
                lastCompleted: m.completed_date || undefined,
                nextDue: m.due_date || undefined,
                assignedToContactId: m.assigned_to_contact_id || undefined,
                assignedToName: assignedContact?.name || m.assigned_to || undefined,
                isCompleted: m.status === "completed",
                notes: m.notes || undefined,
                createdAt: m.created_at,
                updatedAt: m.updated_at,
              }
            }),
          createdAt: v.created_at,
          updatedAt: v.updated_at,
          isVehicle: true,
        }
      })

      setProperties([...mappedProperties, ...mappedVehicles])
    } catch (error) {
      console.error("Failed to load properties:", error)
    } finally {
      setIsSyncing(false)
      setIsLoaded(true)
    }
  }, [loadEmergencyContacts])

  // Check auth and load data
  useEffect(() => {
    loadData()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadData()
    })

    return () => subscription.unsubscribe()
  }, [loadData])

  const addProperty = useCallback(async (prop: Omit<Property, "id" | "createdAt" | "updatedAt" | "maintenanceTasks">) => {
    if (!userId) return null

    const supabase = createClient()
    const isVehicle = prop.propertyType === "vehicle"

    if (isVehicle) {
      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          user_id: userId,
          name: prop.propertyName,
          make: prop.make || null,
          model: prop.model || null,
          year: prop.year || null,
          vin: prop.vin || null,
          license_plate: prop.licensePlate || null,
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
        })
        .select()
        .single()

      if (error) {
        console.error("Failed to add vehicle:", error)
        return null
      }

      const caretaker = prop.caretakerContactId 
        ? emergencyContacts.find(c => c.id === prop.caretakerContactId)
        : null

      const newProp: Property = {
        id: data.id,
        propertyType: "vehicle",
        propertyName: prop.propertyName,
        make: data.make || undefined,
        model: data.model || undefined,
        year: data.year || undefined,
        vin: data.vin || undefined,
        licensePlate: data.license_plate || undefined,
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
        notes: data.notes || undefined,
        maintenanceTasks: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isVehicle: true,
      }

      setProperties((prev) => [newProp, ...prev])
      return newProp
    }

    // Non-vehicle property
    const { data, error } = await supabase
      .from("properties")
      .insert({
        user_id: userId,
        name: prop.propertyName,
        property_type: prop.propertyType,
        address: prop.address || null,
        insurance_company: prop.insuranceCompany || null,
        insurance_policy_number: prop.insurancePolicyNumber || null,
        insurance_expiry: prop.insuranceExpiry || null,
        caretaker_contact_id: prop.caretakerContactId || null,
        caretaker_name: prop.caretakerName || null,
        caretaker_phone: prop.caretakerPhone || null,
        notes: prop.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to add property:", error)
      return null
    }

    const caretaker = prop.caretakerContactId 
      ? emergencyContacts.find(c => c.id === prop.caretakerContactId)
      : null

    const newProp: Property = {
      id: data.id,
      propertyType: (data.property_type as PropertyType) || "other",
      propertyName: data.name,
      address: data.address || undefined,
      insuranceCompany: data.insurance_company || undefined,
      insurancePolicyNumber: data.insurance_policy_number || undefined,
      insuranceExpiry: data.insurance_expiry || undefined,
      caretakerContactId: data.caretaker_contact_id || undefined,
      caretakerName: caretaker?.name || data.caretaker_name || undefined,
      caretakerPhone: caretaker?.phone || data.caretaker_phone || undefined,
      caretakerEmail: caretaker?.email || undefined,
      notes: data.notes || undefined,
      maintenanceTasks: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isVehicle: false,
    }

    setProperties((prev) => [newProp, ...prev])
    return newProp
  }, [userId, emergencyContacts])

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

      const { error } = await supabase
        .from("vehicles")
        .update(dbUpdates)
        .eq("id", id)

      if (error) {
        console.error("Failed to update vehicle:", error)
        return
      }
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

      const { error } = await supabase
        .from("properties")
        .update(dbUpdates)
        .eq("id", id)

      if (error) {
        console.error("Failed to update property:", error)
        return
      }
    }

    // Update caretaker info from emergency contact if needed
    const caretaker = updates.caretakerContactId 
      ? emergencyContacts.find(c => c.id === updates.caretakerContactId)
      : null

    if (caretaker) {
      updates.caretakerName = caretaker.name
      updates.caretakerPhone = caretaker.phone
      updates.caretakerEmail = caretaker.email
    }

    setProperties((prev) => prev.map((p) => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ))
  }, [userId, properties, emergencyContacts])

  const deleteProperty = useCallback(async (id: string) => {
    if (!userId) return

    const property = properties.find((p) => p.id === id)
    const isVehicle = property?.isVehicle || property?.propertyType === "vehicle"

    const supabase = createClient()
    const table = isVehicle ? "vehicles" : "properties"
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)

    if (error) {
      console.error(`Failed to delete ${table}:`, error)
      return
    }

    setProperties((prev) => prev.filter((p) => p.id !== id))
  }, [userId, properties])

  const addMaintenanceTask = useCallback(
    async (propertyId: string, task: Omit<MaintenanceTask, "id" | "propertyId" | "createdAt" | "updatedAt">) => {
      if (!userId) return null

      const property = properties.find((p) => p.id === propertyId)
      const isVehicle = property?.isVehicle || property?.propertyType === "vehicle"

      const supabase = createClient()
      const { data, error } = await supabase
        .from("maintenance_records")
        .insert({
          user_id: userId,
          property_id: isVehicle ? null : propertyId,
          vehicle_id: isVehicle ? propertyId : null,
          title: task.taskName,
          description: task.description || null,
          task_type: "routine",
          status: task.isCompleted ? "completed" : "pending",
          due_date: task.nextDue || null,
          completed_date: task.isCompleted ? task.lastCompleted || new Date().toISOString().split("T")[0] : null,
          assigned_to_contact_id: task.assignedToContactId || null,
          assigned_to: task.assignedToName || null,
          recurring: task.frequency !== "one_time",
          recurrence_interval: task.frequency !== "one_time" ? task.frequency : null,
          notes: task.notes || null,
        })
        .select()
        .single()

      if (error) {
        console.error("Failed to add maintenance task:", error)
        return null
      }

      const assignedContact = task.assignedToContactId
        ? emergencyContacts.find(c => c.id === task.assignedToContactId)
        : null

      const newTask: MaintenanceTask = {
        id: data.id,
        propertyId,
        taskName: data.title,
        description: data.description || undefined,
        frequency: (data.recurrence_interval as MaintenanceFrequency) || "one_time",
        lastCompleted: data.completed_date || undefined,
        nextDue: data.due_date || undefined,
        assignedToContactId: data.assigned_to_contact_id || undefined,
        assignedToName: assignedContact?.name || data.assigned_to || undefined,
        isCompleted: data.status === "completed",
        notes: data.notes || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      setProperties((prev) => prev.map((p) => 
        p.id === propertyId 
          ? { ...p, maintenanceTasks: [...p.maintenanceTasks, newTask], updatedAt: new Date().toISOString() }
          : p
      ))

      return newTask
    },
    [userId, properties, emergencyContacts]
  )

  const updateMaintenanceTask = useCallback(
    async (propertyId: string, taskId: string, updates: Partial<MaintenanceTask>) => {
      if (!userId) return

      const supabase = createClient()
      const dbUpdates: Record<string, unknown> = {}

      if (updates.taskName !== undefined) dbUpdates.title = updates.taskName
      if (updates.description !== undefined) dbUpdates.description = updates.description || null
      if (updates.nextDue !== undefined) dbUpdates.due_date = updates.nextDue || null
      if (updates.lastCompleted !== undefined) dbUpdates.completed_date = updates.lastCompleted || null
      if (updates.assignedToContactId !== undefined) dbUpdates.assigned_to_contact_id = updates.assignedToContactId || null
      if (updates.assignedToName !== undefined) dbUpdates.assigned_to = updates.assignedToName || null
      
      if (updates.isCompleted !== undefined) {
        dbUpdates.status = updates.isCompleted ? "completed" : "pending"
        
        // If marking complete and it's a recurring task, calculate next due date
        if (updates.isCompleted) {
          const property = properties.find(p => p.id === propertyId)
          const task = property?.maintenanceTasks.find(t => t.id === taskId)
          
          if (task && task.frequency !== "one_time") {
            const completedDate = updates.lastCompleted || new Date().toISOString().split("T")[0]
            const nextDue = calculateNextDueDate(completedDate, task.frequency)
            
            dbUpdates.completed_date = completedDate
            dbUpdates.due_date = nextDue
            dbUpdates.status = "pending" // Reset to pending for next occurrence
            
            updates.lastCompleted = completedDate
            updates.nextDue = nextDue
            updates.isCompleted = false // Reset completion status for recurring task
          } else if (!updates.lastCompleted) {
            dbUpdates.completed_date = new Date().toISOString().split("T")[0]
          } else if (task && task.frequency === "one_time") {
            deleteMaintenanceTask(propertyId, taskId)
          }
        }
      }
      
      if (updates.frequency !== undefined) {
        dbUpdates.recurring = updates.frequency !== "one_time"
        dbUpdates.recurrence_interval = updates.frequency !== "one_time" ? updates.frequency : null
      }
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null

      const { error } = await supabase
        .from("maintenance_records")
        .update(dbUpdates)
        .eq("id", taskId)

      if (error) {
        console.error("Failed to update maintenance task:", error)
        return
      }

      // Update assigned contact info if needed
      const assignedContact = updates.assignedToContactId 
        ? emergencyContacts.find(c => c.id === updates.assignedToContactId)
        : null

      if (assignedContact) {
        updates.assignedToName = assignedContact.name
      }

      setProperties((prev) => prev.map((p) => 
        p.id === propertyId
          ? {
              ...p,
              maintenanceTasks: p.maintenanceTasks.map((t) => 
                t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ))
    },
    [userId, properties, emergencyContacts]
  )

  const deleteMaintenanceTask = useCallback(async (propertyId: string, taskId: string) => {
    if (!userId) return

    const supabase = createClient()
    const { error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", taskId)

    if (error) {
      console.error("Failed to delete maintenance task:", error)
      return
    }

    setProperties((prev) => prev.map((p) => 
      p.id === propertyId
        ? {
            ...p,
            maintenanceTasks: p.maintenanceTasks.filter((t) => t.id !== taskId),
            updatedAt: new Date().toISOString(),
          }
        : p
    ))
  }, [userId])

  const getPropertiesByType = useCallback(
    (type: PropertyType) => properties.filter((prop) => prop.propertyType === type),
    [properties]
  )

  const getUpcomingMaintenance = useCallback(
    (withinDays: number = 30) => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() + withinDays)
      const tasks: (MaintenanceTask & { propertyName: string })[] = []
      properties.forEach((prop) => {
        prop.maintenanceTasks.forEach((task) => {
          if (task.nextDue && !task.isCompleted) {
            if (new Date(task.nextDue) <= cutoff) {
              tasks.push({ ...task, propertyName: prop.propertyName })
            }
          }
        })
      })
      return tasks.sort((a, b) => new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime())
    },
    [properties]
  )

  const getExpiringItems = useCallback(
    (withinDays: number = 60) => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() + withinDays)
      const items: { propertyId: string; propertyName: string; type: string; date: string }[] = []
      properties.forEach((prop) => {
        if (prop.insuranceExpiry && new Date(prop.insuranceExpiry) <= cutoff) {
          items.push({ propertyId: prop.id, propertyName: prop.propertyName, type: "Insurance", date: prop.insuranceExpiry })
        }
        if (prop.registrationExpiry && new Date(prop.registrationExpiry) <= cutoff) {
          items.push({ propertyId: prop.id, propertyName: prop.propertyName, type: "Registration", date: prop.registrationExpiry })
        }
        if (prop.inspectionExpiry && new Date(prop.inspectionExpiry) <= cutoff) {
          items.push({ propertyId: prop.id, propertyName: prop.propertyName, type: "Inspection", date: prop.inspectionExpiry })
        }
      })
      return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    },
    [properties]
  )

  return {
    properties,
    emergencyContacts,
    isLoaded,
    isSyncing,
    isAuthenticated: !!userId,
    addProperty,
    updateProperty,
    deleteProperty,
    addMaintenanceTask,
    updateMaintenanceTask,
    deleteMaintenanceTask,
    getPropertiesByType,
    getUpcomingMaintenance,
    getExpiringItems,
  }
}