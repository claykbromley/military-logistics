"use client"

import { useState, useEffect, useCallback } from "react"

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
  insuranceCompany?: string
  insurancePolicyNumber?: string
  insuranceExpiry?: string
  registrationExpiry?: string
  inspectionExpiry?: string
  caretakerName?: string
  caretakerPhone?: string
  notes?: string
  maintenanceTasks: MaintenanceTask[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "deployment-properties"

function generateId(): string {
  return `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setProperties(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse stored properties:", e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties))
    }
  }, [properties, isLoaded])

  const addProperty = useCallback((prop: Omit<Property, "id" | "createdAt" | "updatedAt" | "maintenanceTasks">) => {
    const now = new Date().toISOString()
    const newProp: Property = {
      ...prop,
      id: generateId(),
      maintenanceTasks: [],
      createdAt: now,
      updatedAt: now,
    }
    setProperties((prev) => [...prev, newProp])
    return newProp
  }, [])

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.id === id
          ? { ...prop, ...updates, updatedAt: new Date().toISOString() }
          : prop
      )
    )
  }, [])

  const deleteProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((prop) => prop.id !== id))
  }, [])

  const addMaintenanceTask = useCallback(
    (propertyId: string, task: Omit<MaintenanceTask, "id" | "propertyId" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const newTask: MaintenanceTask = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        propertyId,
        createdAt: now,
        updatedAt: now,
      }
      setProperties((prev) =>
        prev.map((prop) =>
          prop.id === propertyId
            ? {
                ...prop,
                maintenanceTasks: [...prop.maintenanceTasks, newTask],
                updatedAt: now,
              }
            : prop
        )
      )
      return newTask
    },
    []
  )

  const updateMaintenanceTask = useCallback(
    (propertyId: string, taskId: string, updates: Partial<MaintenanceTask>) => {
      const now = new Date().toISOString()
      setProperties((prev) =>
        prev.map((prop) =>
          prop.id === propertyId
            ? {
                ...prop,
                maintenanceTasks: prop.maintenanceTasks.map((task) =>
                  task.id === taskId ? { ...task, ...updates, updatedAt: now } : task
                ),
                updatedAt: now,
              }
            : prop
        )
      )
    },
    []
  )

  const deleteMaintenanceTask = useCallback((propertyId: string, taskId: string) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.id === propertyId
          ? {
              ...prop,
              maintenanceTasks: prop.maintenanceTasks.filter((task) => task.id !== taskId),
              updatedAt: new Date().toISOString(),
            }
          : prop
      )
    )
  }, [])

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
    isLoaded,
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
