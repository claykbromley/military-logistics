"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type Mood = "great" | "good" | "neutral" | "struggling" | "difficult"

export interface JournalEntry {
  id: string
  user_id?: string
  entryDate: string
  title?: string
  content: string
  mood?: Mood
  moodScore?: number
  energyLevel?: number
  sleepHours?: number
  exerciseMinutes?: number
  gratitude?: string
  goals?: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "deployment-journal"

// Map mood to numeric score
const moodToScore: Record<Mood, number> = {
  great: 5,
  good: 4,
  neutral: 3,
  struggling: 2,
  difficult: 1,
}

const scoreToMood = (score: number): Mood => {
  if (score >= 5) return "great"
  if (score >= 4) return "good"
  if (score >= 3) return "neutral"
  if (score >= 2) return "struggling"
  return "difficult"
}

export function useWellness() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
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
            .from("wellness_entries")
            .select("*")
            .order("entry_date", { ascending: false })

          if (error) throw error

          const localEntries: JournalEntry[] = (data || []).map((e) => ({
            id: e.id,
            user_id: e.user_id,
            entryDate: e.entry_date,
            content: e.journal_entry || "",
            mood: e.mood ? scoreToMood(e.mood) : undefined,
            moodScore: e.mood || undefined,
            energyLevel: e.energy_level || undefined,
            sleepHours: e.sleep_hours || undefined,
            exerciseMinutes: e.exercise_minutes || undefined,
            gratitude: e.gratitude || undefined,
            goals: e.goals || undefined,
            isPrivate: e.is_private ?? true,
            createdAt: e.created_at,
            updatedAt: e.updated_at,
          }))

          setEntries(localEntries)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localEntries))
        } catch (error) {
          console.error("Error loading wellness entries from Supabase:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to load")
          loadFromLocalStorage()
        }
      } else {
        loadFromLocalStorage()
      }

      setIsLoaded(true)
    }

    const loadFromLocalStorage = () => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setEntries(JSON.parse(stored))
        } catch (e) {
          console.error("Failed to parse journal entries:", e)
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    }
  }, [entries, isLoaded])

  const addEntry = useCallback(
    async (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const newEntry: JournalEntry = {
        ...entry,
        id: crypto.randomUUID(),
        entryDate: entry.entryDate || now.split("T")[0],
        createdAt: now,
        updatedAt: now,
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
              .from("wellness_entries")
              .insert({
                user_id: user.id,
                entry_date: newEntry.entryDate,
                mood: entry.mood ? moodToScore[entry.mood] : null,
                energy_level: entry.energyLevel || null,
                sleep_hours: entry.sleepHours || null,
                exercise_minutes: entry.exerciseMinutes || null,
                journal_entry: entry.content || null,
                gratitude: entry.gratitude || null,
                goals: entry.goals || null,
                is_private: entry.isPrivate ?? true,
              })
              .select()
              .single()

            if (error) throw error

            const createdEntry: JournalEntry = {
              id: data.id,
              user_id: data.user_id,
              entryDate: data.entry_date,
              content: data.journal_entry || "",
              mood: data.mood ? scoreToMood(data.mood) : undefined,
              moodScore: data.mood || undefined,
              energyLevel: data.energy_level || undefined,
              sleepHours: data.sleep_hours || undefined,
              exerciseMinutes: data.exercise_minutes || undefined,
              gratitude: data.gratitude || undefined,
              goals: data.goals || undefined,
              isPrivate: data.is_private ?? true,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            }

            setEntries((prev) => [createdEntry, ...prev])
            setSyncError(null)
            return createdEntry
          }
        } catch (error) {
          console.error("Error creating wellness entry:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to save")
          setEntries((prev) => [newEntry, ...prev])
        } finally {
          setIsSyncing(false)
        }
      } else {
        setEntries((prev) => [newEntry, ...prev])
      }

      return newEntry
    },
    [isAuthenticated]
  )

  const updateEntry = useCallback(
    async (id: string, updates: Partial<JournalEntry>) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      )

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()

          const dbUpdates: Record<string, unknown> = {}
          if (updates.entryDate !== undefined) dbUpdates.entry_date = updates.entryDate
          if (updates.mood !== undefined) dbUpdates.mood = updates.mood ? moodToScore[updates.mood] : null
          if (updates.energyLevel !== undefined) dbUpdates.energy_level = updates.energyLevel || null
          if (updates.sleepHours !== undefined) dbUpdates.sleep_hours = updates.sleepHours || null
          if (updates.exerciseMinutes !== undefined)
            dbUpdates.exercise_minutes = updates.exerciseMinutes || null
          if (updates.content !== undefined) dbUpdates.journal_entry = updates.content || null
          if (updates.gratitude !== undefined) dbUpdates.gratitude = updates.gratitude || null
          if (updates.goals !== undefined) dbUpdates.goals = updates.goals || null
          if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate

          const { error } = await supabase.from("wellness_entries").update(dbUpdates).eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error updating wellness entry:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to update")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      setEntries((prev) => prev.filter((e) => e.id !== id))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { error } = await supabase.from("wellness_entries").delete().eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error deleting wellness entry:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to delete")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const getEntriesByMood = useCallback(
    (mood: Mood) => entries.filter((e) => e.mood === mood),
    [entries]
  )

  const getRecentEntries = useCallback((limit: number = 10) => entries.slice(0, limit), [entries])

  const getMoodStats = useCallback(() => {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    const recentEntries = entries.filter((e) => new Date(e.createdAt) >= last30Days && e.mood)
    const moodCounts: Record<Mood, number> = {
      great: 0,
      good: 0,
      neutral: 0,
      struggling: 0,
      difficult: 0,
    }
    recentEntries.forEach((e) => {
      if (e.mood) moodCounts[e.mood]++
    })
    return {
      total: recentEntries.length,
      counts: moodCounts,
    }
  }, [entries])

  const getStreak = useCallback(() => {
    if (entries.length === 0) return 0
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const hasEntry = entries.some((e) => {
        const entryDate = new Date(e.entryDate || e.createdAt)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === checkDate.getTime()
      })
      if (hasEntry) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  }, [entries])

  return {
    entries,
    isLoaded,
    isAuthenticated,
    isSyncing,
    syncError,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesByMood,
    getRecentEntries,
    getMoodStats,
    getStreak,
  }
}
