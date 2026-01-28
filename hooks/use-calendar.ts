"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type EventType =
  | "homecoming"
  | "birthday"
  | "anniversary"
  | "holiday"
  | "milestone"
  | "care_package"
  | "appointment"
  | "reminder"
  | "other"

export interface CalendarEvent {
  id: string
  user_id?: string
  eventName: string
  eventDate: string
  eventType: EventType
  description?: string
  notes?: string
  isRecurring: boolean
  recurrencePattern?: string
  reminderDays?: number
  createdAt: string
  updatedAt?: string
}

export interface DeploymentInfo {
  startDate?: string
  expectedReturnDate?: string
  location?: string
}

const EVENTS_KEY = "deployment-calendar-events"
const DEPLOYMENT_KEY = "deployment-info"

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [deploymentInfo, setDeploymentInfoState] = useState<DeploymentInfo>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsAuthenticated(!!user)

      if (user) {
        try {
          const { data, error } = await supabase
            .from("calendar_events")
            .select("*")
            .order("event_date", { ascending: true })

          if (error) throw error

          const localEvents: CalendarEvent[] = (data || []).map((e) => ({
            id: e.id,
            user_id: e.user_id,
            eventName: e.title,
            eventDate: e.event_date,
            eventType: e.event_type as EventType,
            description: e.description || undefined,
            notes: e.notes || undefined,
            isRecurring: e.is_recurring || false,
            recurrencePattern: e.recurrence_pattern || undefined,
            reminderDays: e.reminder_days || undefined,
            createdAt: e.created_at,
            updatedAt: e.updated_at,
          }))

          setEvents(localEvents)
          localStorage.setItem(EVENTS_KEY, JSON.stringify(localEvents))

          // Load deployment info from user profile
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("deployment_start, deployment_end, duty_station")
            .eq("id", user.id)
            .single()

          if (profile) {
            const info: DeploymentInfo = {
              startDate: profile.deployment_start || undefined,
              expectedReturnDate: profile.deployment_end || undefined,
              location: profile.duty_station || undefined,
            }
            setDeploymentInfoState(info)
            localStorage.setItem(DEPLOYMENT_KEY, JSON.stringify(info))
          }
        } catch (error) {
          console.error("Error loading calendar from Supabase:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to load")
          loadFromLocalStorage()
        }
      } else {
        loadFromLocalStorage()
      }

      setIsLoaded(true)
    }

    const loadFromLocalStorage = () => {
      const storedEvents = localStorage.getItem(EVENTS_KEY)
      const storedDeployment = localStorage.getItem(DEPLOYMENT_KEY)
      if (storedEvents) {
        try {
          setEvents(JSON.parse(storedEvents))
        } catch (e) {
          console.error("Failed to parse events:", e)
        }
      }
      if (storedDeployment) {
        try {
          setDeploymentInfoState(JSON.parse(storedDeployment))
        } catch (e) {
          console.error("Failed to parse deployment info:", e)
        }
      }
    }

    loadData()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
      localStorage.setItem(DEPLOYMENT_KEY, JSON.stringify(deploymentInfo))
    }
  }, [events, deploymentInfo, isLoaded])

  const addEvent = useCallback(
    async (event: Omit<CalendarEvent, "id" | "createdAt">) => {
      const newEvent: CalendarEvent = {
        ...event,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { data, error } = await supabase
              .from("calendar_events")
              .insert({
                user_id: user.id,
                title: event.eventName,
                description: event.description || null,
                event_date: event.eventDate,
                event_type: event.eventType,
                is_recurring: event.isRecurring || false,
                recurrence_pattern: event.recurrencePattern || null,
                reminder_days: event.reminderDays || null,
                notes: event.notes || null,
              })
              .select()
              .single()

            if (error) throw error

            const createdEvent: CalendarEvent = {
              id: data.id,
              user_id: data.user_id,
              eventName: data.title,
              eventDate: data.event_date,
              eventType: data.event_type as EventType,
              description: data.description || undefined,
              notes: data.notes || undefined,
              isRecurring: data.is_recurring || false,
              recurrencePattern: data.recurrence_pattern || undefined,
              reminderDays: data.reminder_days || undefined,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            }

            setEvents((prev) => [...prev, createdEvent])
            setSyncError(null)
            return createdEvent
          }
        } catch (error) {
          console.error("Error creating event:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to save")
          setEvents((prev) => [...prev, newEvent])
        } finally {
          setIsSyncing(false)
        }
      } else {
        setEvents((prev) => [...prev, newEvent])
      }

      return newEvent
    },
    [isAuthenticated]
  )

  const updateEvent = useCallback(
    async (id: string, updates: Partial<CalendarEvent>) => {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()

          const dbUpdates: Record<string, unknown> = {}
          if (updates.eventName !== undefined) dbUpdates.title = updates.eventName
          if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate
          if (updates.eventType !== undefined) dbUpdates.event_type = updates.eventType
          if (updates.description !== undefined) dbUpdates.description = updates.description || null
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
          if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring
          if (updates.recurrencePattern !== undefined)
            dbUpdates.recurrence_pattern = updates.recurrencePattern || null
          if (updates.reminderDays !== undefined) dbUpdates.reminder_days = updates.reminderDays || null

          const { error } = await supabase.from("calendar_events").update(dbUpdates).eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error updating event:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to update")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const deleteEvent = useCallback(
    async (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { error } = await supabase.from("calendar_events").delete().eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error deleting event:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to delete")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const setDeploymentInfo = useCallback(
    async (info: DeploymentInfo) => {
      setDeploymentInfoState(info)

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase
              .from("user_profiles")
              .upsert({
                id: user.id,
                deployment_start: info.startDate || null,
                deployment_end: info.expectedReturnDate || null,
                duty_station: info.location || null,
              })

            if (error) throw error
            setSyncError(null)
          }
        } catch (error) {
          console.error("Error updating deployment info:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to save")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const getUpcomingEvents = useCallback(
    (limit?: number) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcoming = events
        .filter((e) => new Date(e.eventDate) >= today)
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      return limit ? upcoming.slice(0, limit) : upcoming
    },
    [events]
  )

  const getEventsByType = useCallback(
    (type: EventType) => events.filter((e) => e.eventType === type),
    [events]
  )

  const getDaysUntilHomecoming = useCallback(() => {
    if (!deploymentInfo.expectedReturnDate) return null
    const returnDate = new Date(deploymentInfo.expectedReturnDate)
    const today = new Date()
    const diff = returnDate.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [deploymentInfo.expectedReturnDate])

  const getDaysSinceDeployment = useCallback(() => {
    if (!deploymentInfo.startDate) return null
    const startDate = new Date(deploymentInfo.startDate)
    const today = new Date()
    const diff = today.getTime() - startDate.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }, [deploymentInfo.startDate])

  return {
    events,
    deploymentInfo,
    isLoaded,
    isAuthenticated,
    isSyncing,
    syncError,
    addEvent,
    updateEvent,
    deleteEvent,
    setDeploymentInfo,
    getUpcomingEvents,
    getEventsByType,
    getDaysUntilHomecoming,
    getDaysSinceDeployment,
  }
}
