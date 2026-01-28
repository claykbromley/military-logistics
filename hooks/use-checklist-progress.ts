"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

const STORAGE_KEY = "deployment-checklist-progress"

interface ChecklistProgress {
  [category: string]: {
    [itemId: string]: {
      completed: boolean
      completedAt?: string
      notes?: string
    }
  }
}

function rowsToChecklistProgress(rows: any[]): ChecklistProgress {
  return rows.reduce((acc, row) => {
    acc[row.category] ??= {}
    acc[row.category][row.item_id] = {
      completed: row.completed,
      completedAt: row.completed_at ?? undefined,
      notes: row.notes ?? undefined,
    }
    return acc
  }, {} as ChecklistProgress)
}

export function useChecklistProgress() {
  const [progress, setProgress] = useState<ChecklistProgress>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check auth and load data
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsAuthenticated(!!user)

      if (user) {
        // Load from Supabase
        try {
          const { data, error } = await supabase
            .from("deployment_checklist_progress")
            .select("*")
            .eq("user_id", user.id)

          if (error) throw error

          const progress = rowsToChecklistProgress(data || [])
          setProgress(progress)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
        } catch (error) {
          console.error("Error loading from Supabase:", error)
          // Fall back to localStorage
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            try {
              setProgress(JSON.parse(stored))
            } catch (e) {
              console.error("Failed to parse stored progress:", e)
            }
          }
        }
      } else {
        // Load from localStorage only
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            setProgress(JSON.parse(stored))
          } catch (e) {
            console.error("Failed to parse stored progress:", e)
          }
        }
      }

      setIsLoaded(true)
    }

    loadData()

    // Listen for auth changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
      if (session?.user) {
        // Reload data when user logs in
        loadData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Save to Supabase when progress changes (if authenticated)
  const saveToSupabase = useCallback(
    async (category: string, itemId: string, itemData: any) => {
      if (!isAuthenticated) return

      const supabase = createClient()
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (!user) {
          console.error("No user found")
          return
        }

        const { error } = await supabase
          .from("deployment_checklist_progress")
          .upsert(
            {
              user_id: user.id,
              category,
              item_id: itemId,
              completed: itemData.completed,
              completed_at: itemData.completedAt || null,
              notes: itemData.notes || null,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,category,item_id",
            }
          )

        if (error) {
          console.error("Supabase error:", error)
          throw error
        }
      } catch (error) {
        console.error("Error saving to Supabase:", error)
      }
    },
    [isAuthenticated]
  )

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      } catch (error) {
        console.error("Failed to save to localStorage:", error)
      }
    }
  }, [progress, isLoaded])

  const toggleItem = useCallback(
    async (category: string, itemId: string) => {
      setProgress((prev) => {
        const categoryProgress = prev[category] || {}
        const currentItem = categoryProgress[itemId]
        const isCompleted = !currentItem?.completed

        const newItem = {
          completed: isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : undefined,
          notes: currentItem?.notes,
        }

        // Save to Supabase asynchronously
        saveToSupabase(category, itemId, newItem)

        return {
          ...prev,
          [category]: {
            ...categoryProgress,
            [itemId]: newItem,
          },
        }
      })
    },
    [saveToSupabase]
  )

  const isItemCompleted = useCallback(
    (category: string, itemId: string): boolean => {
      return progress[category]?.[itemId]?.completed ?? false
    },
    [progress]
  )

  const getCategoryProgress = useCallback(
    (category: string, totalItems: number) => {
      const categoryProgress = progress[category] || {}
      const completedCount = Object.values(categoryProgress).filter(
        (item) => item.completed
      ).length
      return {
        completed: completedCount,
        total: totalItems,
        percentage: totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0,
      }
    },
    [progress]
  )

  const getOverallProgress = useCallback(
    (categories: { category: string; totalItems: number }[]) => {
      let totalCompleted = 0
      let totalItems = 0

      for (const { category, totalItems: categoryTotal } of categories) {
        const categoryProgress = progress[category] || {}
        totalCompleted += Object.values(categoryProgress).filter(
          (item) => item.completed
        ).length
        totalItems += categoryTotal
      }

      return {
        completed: totalCompleted,
        total: totalItems,
        percentage: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
      }
    },
    [progress]
  )

  const resetCategory = useCallback(
    async (category: string) => {
      if (isAuthenticated) {
        const supabase = createClient()
        try {
          const { error } = await supabase
            .from("deployment_checklist_progress")
            .delete()
            .eq("category", category)

          if (error) throw error
        } catch (error) {
          console.error("Error deleting category from Supabase:", error)
        }
      }

      setProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[category]
        return newProgress
      })
    },
    [isAuthenticated]
  )

  const resetAll = useCallback(async () => {
    if (isAuthenticated) {
      const supabase = createClient()
      try {
        const { error } = await supabase
          .from("deployment_checklist_progress")
          .delete()
          .neq("category", "") // Delete all rows

        if (error) throw error
      } catch (error) {
        console.error("Error deleting all from Supabase:", error)
      }
    }

    setProgress({})
  }, [isAuthenticated])

  return {
    progress,
    isLoaded,
    isAuthenticated,
    toggleItem,
    isItemCompleted,
    getCategoryProgress,
    getOverallProgress,
    resetCategory,
    resetAll,
  }
}