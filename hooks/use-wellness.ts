"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type Mood = "great" | "good" | "neutral" | "struggling" | "difficult"
export type EntryType = "checkin" | "journal" | "workout" | "fitness_test"

export type WorkoutCategory = "cardio" | "strength" | "flexibility" | "combat" | "ruck" | "circuit" | "sports" | "other"

export type MilitaryBranch = "army" | "navy" | "marine_corps" | "air_force" | "space_force" | "coast_guard" | "civilian" | null

export type FitnessTestType = "acft" | "pfa" | "pft" | "cft" | "prt" | "hpa" | "custom"

export interface JournalEntry {
  id: string
  user_id?: string
  entryDate: string
  entryType: EntryType
  title?: string
  content: string
  mood?: Mood
  moodScore?: number
  energyLevel?: number
  stress?: number
  sleepHours?: number
  exerciseMinutes?: number
  gratitude?: string
  goals?: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
  workoutCategory?: WorkoutCategory
  workoutDetails?: WorkoutDetails
  fitnessTestScores?: FitnessTestScores
}

export interface WorkoutDetails {
  category: WorkoutCategory
  durationMinutes: number
  exercises: { name: string; sets?: number; reps?: number; weight?: string; distance?: string; time?: string }[]
  intensityLevel: number
  notes?: string
}

export interface FitnessTestScores {
  testType: FitnessTestType
  totalScore?: number
  maxScore?: number
  pass: boolean
  components: { name: string; raw: string; score?: number; maxScore?: number }[]
  notes?: string
}

/* ─────────────────── branch → fitness test config ─────────────────── */

export interface FitnessTestEvent {
  key: string
  name: string
  unit: string
  maxScore: number
}

export interface BranchTestConfig {
  testType: FitnessTestType
  testName: string
  testAbbrev: string
  events: FitnessTestEvent[]
  maxTotal: number
  passingScore: number
  scoringNote?: string
}

const BRANCH_TEST_CONFIGS: Record<string, BranchTestConfig> = {
  army: {
    testType: "acft",
    testName: "Army Combat Fitness Test",
    testAbbrev: "ACFT",
    maxTotal: 600,
    passingScore: 360,
    scoringNote: "Minimum 60 points per event required to pass.",
    events: [
      { key: "mdl", name: "3 Rep Max Deadlift", unit: "lbs", maxScore: 100 },
      { key: "spt", name: "Standing Power Throw", unit: "m", maxScore: 100 },
      { key: "hrp", name: "Hand Release Push-Ups", unit: "reps", maxScore: 100 },
      { key: "sdc", name: "Sprint-Drag-Carry", unit: "mm:ss", maxScore: 100 },
      { key: "plk", name: "Plank", unit: "mm:ss", maxScore: 100 }, // leg tuck removed
      { key: "2mr", name: "2-Mile Run", unit: "mm:ss", maxScore: 100 },
    ],
  },

  navy: {
    testType: "prt",
    testName: "Physical Readiness Test",
    testAbbrev: "PRT",
    maxTotal: 300,
    passingScore: 180,
    scoringNote:
      "Each event scored 0-100. Must meet minimum per event. Cardio alternatives allowed (bike, swim, row).",
    events: [
      { key: "push", name: "Push-Ups", unit: "reps", maxScore: 100 },
      { key: "plank", name: "Plank", unit: "mm:ss", maxScore: 100 },
      { key: "run", name: "1.5-Mile Run / Cardio Alt", unit: "mm:ss", maxScore: 100 },
    ],
  },

  marine_corps_pft: {
    testType: "pft",
    testName: "Physical Fitness Test",
    testAbbrev: "PFT",
    maxTotal: 300,
    passingScore: 150,
    scoringNote:
      "Class I: 235+, Class II: 200-234, Class III: 150-199. Pull-ups preferred, push-ups allowed with lower max score.",
    events: [
      { key: "pullup", name: "Pull-Ups / Push-Ups", unit: "reps", maxScore: 100 },
      { key: "plank", name: "Plank", unit: "mm:ss", maxScore: 100 },
      { key: "run", name: "3-Mile Run", unit: "mm:ss", maxScore: 100 },
    ],
  },

  marine_corps_cft: {
    testType: "cft",
    testName: "Combat Fitness Test",
    testAbbrev: "CFT",
    maxTotal: 300,
    passingScore: 150,
    scoringNote:
      "Class I: 270+, Class II: 225-269, Class III: 150-224.",
    events: [
      { key: "mtc", name: "Movement to Contact (880yd)", unit: "mm:ss", maxScore: 100 },
      { key: "al", name: "Ammo Lift (30lb)", unit: "reps", maxScore: 100 },
      { key: "muf", name: "Maneuver Under Fire", unit: "mm:ss", maxScore: 100 },
    ],
  },

  air_force: {
    testType: "pfa",
    testName: "Physical Fitness Assessment",
    testAbbrev: "PFA",
    maxTotal: 100,
    passingScore: 75,
    scoringNote:
      "Composite score. Components vary: HAMR (shuttle run), 1-min or 2-min push-ups/sit-ups, plank option. Must meet minimums.",
    events: [
      { key: "strength", name: "Push-Ups (1 min) / Hand-Release Push-Ups", unit: "reps", maxScore: 20 },
      { key: "core", name: "Sit-Ups (1 min) / Plank", unit: "reps / mm:ss", maxScore: 20 },
      { key: "cardio", name: "1.5-Mile Run / HAMR", unit: "mm:ss / shuttles", maxScore: 60 },
    ],
  },

  space_force: {
    testType: "hpa",
    testName: "Human Performance Assessment",
    testAbbrev: "HPA",
    maxTotal: 100,
    passingScore: 75,
    scoringNote:
      "Uses Air Force components but shifting toward Holistic Health Assessment (HHA). Cardio + strength options remain.",
    events: [
      { key: "strength", name: "Push-Ups / Hand-Release Push-Ups", unit: "reps", maxScore: 20 },
      { key: "core", name: "Sit-Ups / Plank", unit: "reps / mm:ss", maxScore: 20 },
      { key: "cardio", name: "1.5-Mile Run / HAMR", unit: "mm:ss / shuttles", maxScore: 60 },
    ],
  },

  coast_guard: {
    testType: "pfa",
    testName: "Physical Fitness Assessment",
    testAbbrev: "PFA",
    maxTotal: 300,
    passingScore: 180,
    scoringNote:
      "Pass/fail model with minimums per event. No official composite scoring like Navy.",
    events: [
      { key: "pushup", name: "Push-Ups (1 min)", unit: "reps", maxScore: 100 },
      { key: "situp", name: "Sit-Ups (1 min)", unit: "reps", maxScore: 100 },
      { key: "run", name: "1.5-Mile Run", unit: "mm:ss", maxScore: 100 },
    ],
  },
}

const DEFAULT_TEST_CONFIG: BranchTestConfig = {
  testType: "custom",
  testName: "Fitness Test",
  testAbbrev: "FT",
  maxTotal: 600,
  passingScore: 360,
  scoringNote: "Set your branch in your profile to see branch-specific events. Defaulting to ACFT format.",
  events: BRANCH_TEST_CONFIGS.army.events,
}

export function getTestConfigsForBranch(branch: MilitaryBranch): BranchTestConfig[] {
  if (!branch || branch === "civilian") return [DEFAULT_TEST_CONFIG]
  if (branch === "marine_corps") {
    return [BRANCH_TEST_CONFIGS.marine_corps_pft, BRANCH_TEST_CONFIGS.marine_corps_cft]
  }
  const config = BRANCH_TEST_CONFIGS[branch]
  return config ? [config] : [DEFAULT_TEST_CONFIG]
}

/* ─────────────────── constants ─────────────────── */

const STORAGE_KEY = "deployment-journal"

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

function mapDbToLocal(e: Record<string, any>): JournalEntry {
  let workoutDetails: WorkoutDetails | undefined
  let fitnessTestScores: FitnessTestScores | undefined
  let workoutCategory: WorkoutCategory | undefined

  if ((e.entry_type === "workout" || e.entry_type === "fitness_test") && e.journal_entry) {
    try {
      const parsed = JSON.parse(e.journal_entry)
      if (e.entry_type === "workout") {
        workoutDetails = parsed
        workoutCategory = parsed.category
      } else {
        fitnessTestScores = parsed
      }
    } catch {}
  }

  return {
    id: e.id,
    user_id: e.user_id,
    entryDate: e.entry_date,
    entryType: e.entry_type || "checkin",
    title: e.entry_title || "",
    content: e.journal_entry || "",
    mood: e.mood_score ? scoreToMood(e.mood_score) : undefined,
    moodScore: e.mood_score || undefined,
    energyLevel: e.energy_level || undefined,
    stress: e.stress_level || undefined,
    sleepHours: e.sleep_hours || undefined,
    exerciseMinutes: e.exercise_minutes || undefined,
    gratitude: e.gratitude || undefined,
    goals: e.goals || undefined,
    isPrivate: e.is_private ?? true,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    workoutDetails,
    fitnessTestScores,
    workoutCategory,
  }
}

/* ─────────────────── hook ─────────────────── */

export function useWellness() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [militaryBranch, setMilitaryBranch] = useState<MilitaryBranch>(null)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const loadAll = async (userId?: string) => {
      try {
        if (userId) {
          setIsAuthenticated(true)
          await Promise.all([
            loadEntries(userId),
            loadBranch(userId),
          ])
        } else {
          loadFromLocalStorage()
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setIsLoaded(true)
      }
    }

    const loadEntries = async (userId: string) => {
      const { data, error } = await supabase
        .from("wellness_entries")
        .select("*")
        .order("entry_date", { ascending: false })

      if (error) throw error

      const localEntries = (data || []).map(mapDbToLocal)
      setEntries(localEntries)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localEntries))
    }

    const loadBranch = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("military_branch")
        .eq("id", userId)
        .single()

      if (!error && data?.military_branch) {
        const branch = data.military_branch.toLowerCase().replace(/\s+/g, "_")
        setMilitaryBranch(branch as MilitaryBranch)
        localStorage.setItem("military_branch", branch)
      }
    }

    const loadFromLocalStorage = () => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setEntries(JSON.parse(stored))

      const cachedBranch = localStorage.getItem("military_branch")
      if (cachedBranch) setMilitaryBranch(cachedBranch as MilitaryBranch)
    }

    const clearUserData = () => {
      setEntries([])
      setIsAuthenticated(false)
      setMilitaryBranch(null)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem("military_branch")
    }

    // ✅ Single source of truth
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadAll(session?.user?.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          loadAll(session?.user?.id)
        }
        if (event === "SIGNED_OUT") {
          clearUserData()
          setIsLoaded(true)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
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
        entryType: entry.entryType || "checkin",
        entryDate: entry.entryDate || now.split("T")[0],
        createdAt: now,
        updatedAt: now,
      }

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            let journalContent = entry.content || null
            if (entry.entryType === "workout" && entry.workoutDetails) {
              journalContent = JSON.stringify(entry.workoutDetails)
            } else if (entry.entryType === "fitness_test" && entry.fitnessTestScores) {
              journalContent = JSON.stringify(entry.fitnessTestScores)
            }

            const { data, error } = await supabase
              .from("wellness_entries")
              .insert({
                user_id: user.id,
                entry_date: newEntry.entryDate,
                entry_type: newEntry.entryType,
                mood_score: entry.mood ? moodToScore[entry.mood] : null,
                energy_level: entry.energyLevel || null,
                stress_level: entry.stress || null,
                sleep_hours: entry.sleepHours || null,
                exercise_minutes: entry.exerciseMinutes || entry.workoutDetails?.durationMinutes || null,
                entry_title: entry.title || null,
                journal_entry: journalContent,
                gratitude: entry.gratitude || null,
                goals: entry.goals || null,
                is_private: entry.isPrivate ?? true,
              })
              .select()
              .single()

            if (error) throw error

            const createdEntry = mapDbToLocal(data)
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
        prev.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
        )
      )

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const dbUpdates: Record<string, unknown> = {}
          if (updates.entryDate !== undefined) dbUpdates.entry_date = updates.entryDate
          if (updates.entryType !== undefined) dbUpdates.entry_type = updates.entryType
          if (updates.mood !== undefined)
            dbUpdates.mood_score = updates.mood ? moodToScore[updates.mood] : null
          if (updates.energyLevel !== undefined) dbUpdates.energy_level = updates.energyLevel || null
          if (updates.stress !== undefined) dbUpdates.stress_level = updates.stress || null
          if (updates.sleepHours !== undefined) dbUpdates.sleep_hours = updates.sleepHours || null
          if (updates.exerciseMinutes !== undefined)
            dbUpdates.exercise_minutes = updates.exerciseMinutes || null
          if (updates.content !== undefined) dbUpdates.journal_entry = updates.content || null
          if (updates.title !== undefined) dbUpdates.entry_title = updates.title || null
          if (updates.gratitude !== undefined) dbUpdates.gratitude = updates.gratitude || null
          if (updates.goals !== undefined) dbUpdates.goals = updates.goals || null
          if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate
          if (updates.workoutDetails !== undefined) dbUpdates.journal_entry = JSON.stringify(updates.workoutDetails)
          if (updates.fitnessTestScores !== undefined) dbUpdates.journal_entry = JSON.stringify(updates.fitnessTestScores)

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

  // ── Filtered accessors ──

  const checkinEntries = entries.filter((e) => e.entryType === "checkin")
  const journalEntries = entries.filter(
    (e) => e.entryType === "journal" && e.content && e.content.trim().length > 0
  )
  const workoutEntries = entries.filter((e) => e.entryType === "workout")
  const fitnessTestEntries = entries.filter((e) => e.entryType === "fitness_test")

  const getEntriesByMood = useCallback(
    (mood: Mood) => entries.filter((e) => e.mood === mood),
    [entries]
  )
  const getRecentEntries = useCallback((limit: number = 10) => entries.slice(0, limit), [entries])

  const getMoodStats = useCallback(() => {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    const recentEntries = checkinEntries.filter(
      (e) => new Date(e.createdAt) >= last30Days && e.mood
    )
    const moodCounts: Record<Mood, number> = { great: 0, good: 0, neutral: 0, struggling: 0, difficult: 0 }
    recentEntries.forEach((e) => { if (e.mood) moodCounts[e.mood]++ })
    return { total: recentEntries.length, counts: moodCounts }
  }, [checkinEntries])

  const getStreak = useCallback(() => {
    if (entries.length === 0) return 0
    const entryDays = new Set(
      entries.map((e) => {
        const raw = e.entryDate || e.createdAt
        const parts = raw.split("T")[0].split("-")
        const d = new Date(+parts[0], +parts[1] - 1, +parts[2])
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
    )
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let streak = 0
    let checkDate = new Date(today)
    if (!entryDays.has(checkDate.getTime())) {
      checkDate.setDate(checkDate.getDate() - 1)
    }
    while (entryDays.has(checkDate.getTime())) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
    return streak
  }, [entries])

  const getWeeklyWorkoutStats = useCallback(() => {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekStr = weekAgo.toLocaleDateString("en-CA")
    const thisWeek = workoutEntries.filter((e) => e.entryDate >= weekStr)
    const totalMinutes = thisWeek.reduce((a, e) => a + (e.workoutDetails?.durationMinutes || e.exerciseMinutes || 0), 0)
    const categories: Record<string, number> = {}
    thisWeek.forEach((e) => {
      const cat = e.workoutDetails?.category || e.workoutCategory || "other"
      categories[cat] = (categories[cat] || 0) + 1
    })
    return { workoutCount: thisWeek.length, totalMinutes, categories }
  }, [workoutEntries])

  const testConfigs = getTestConfigsForBranch(militaryBranch)

  return {
    entries,
    checkinEntries,
    journalEntries,
    workoutEntries,
    fitnessTestEntries,
    isLoaded,
    isAuthenticated,
    isSyncing,
    syncError,
    militaryBranch,
    testConfigs,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesByMood,
    getRecentEntries,
    getMoodStats,
    getStreak,
    getWeeklyWorkoutStats,
  }
}