"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface SyncState {
  isAuthenticated: boolean
  user: User | null
  isSyncing: boolean
  lastSyncedAt: Date | null
  error: string | null
}

// Generic sync hook that handles local storage + Supabase sync
export function useSync<T extends { id: string }>(
  storageKey: string,
  tableName: string,
  defaultValue: T[] = []
) {
  const [data, setData] = useState<T[]>(defaultValue)
  const [syncState, setSyncState] = useState<SyncState>({
    isAuthenticated: false,
    user: null,
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Check auth state
  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setSyncState((prev) => ({
        ...prev,
        isAuthenticated: !!user,
        user,
      }))
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSyncState((prev) => ({
        ...prev,
        isAuthenticated: !!session?.user,
        user: session?.user ?? null,
      }))
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load data - from Supabase if authenticated, otherwise from localStorage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      if (syncState.isAuthenticated && syncState.user) {
        // Load from Supabase
        try {
          const supabase = createClient()
          const { data: remoteData, error } = await supabase
            .from(tableName)
            .select("*")
            .order("created_at", { ascending: false })

          if (error) throw error

          setData(remoteData as T[])

          // Also update localStorage as a cache
          localStorage.setItem(storageKey, JSON.stringify(remoteData))

          setSyncState((prev) => ({
            ...prev,
            lastSyncedAt: new Date(),
            error: null,
          }))
        } catch (error) {
          console.error(`Error loading ${tableName}:`, error)
          setSyncState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : "Failed to load data",
          }))

          // Fall back to localStorage
          const stored = localStorage.getItem(storageKey)
          if (stored) {
            setData(JSON.parse(stored))
          }
        }
      } else {
        // Load from localStorage
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          setData(JSON.parse(stored))
        }
      }

      setIsLoading(false)
    }

    loadData()
  }, [syncState.isAuthenticated, syncState.user, storageKey, tableName])

  // Save to localStorage and optionally sync to Supabase
  const saveToLocal = useCallback(
    (newData: T[]) => {
      localStorage.setItem(storageKey, JSON.stringify(newData))
      setData(newData)
    },
    [storageKey]
  )

  // Add item
  const addItem = useCallback(
    async (item: Omit<T, "id" | "user_id" | "created_at" | "updated_at">) => {
      const newItem = {
        ...item,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as T

      if (syncState.isAuthenticated && syncState.user) {
        setSyncState((prev) => ({ ...prev, isSyncing: true }))
        try {
          const supabase = createClient()
          const { data: createdItem, error } = await supabase
            .from(tableName)
            .insert({ ...item, user_id: syncState.user!.id })
            .select()
            .single()

          if (error) throw error

          const newData = [createdItem as T, ...data]
          saveToLocal(newData)
          setSyncState((prev) => ({
            ...prev,
            isSyncing: false,
            lastSyncedAt: new Date(),
            error: null,
          }))
          return createdItem as T
        } catch (error) {
          console.error(`Error creating ${tableName}:`, error)
          setSyncState((prev) => ({
            ...prev,
            isSyncing: false,
            error: error instanceof Error ? error.message : "Failed to save",
          }))

          // Still save locally
          const newData = [newItem, ...data]
          saveToLocal(newData)
          return newItem
        }
      } else {
        // Save to localStorage only
        const newData = [newItem, ...data]
        saveToLocal(newData)
        return newItem
      }
    },
    [data, syncState.isAuthenticated, syncState.user, tableName, saveToLocal]
  )

  // Update item
  const updateItem = useCallback(
    async (id: string, updates: Partial<T>) => {
      const updatedData = data.map((item) =>
        item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      )

      if (syncState.isAuthenticated && syncState.user) {
        setSyncState((prev) => ({ ...prev, isSyncing: true }))
        try {
          const supabase = createClient()
          const { error } = await supabase.from(tableName).update(updates).eq("id", id)

          if (error) throw error

          saveToLocal(updatedData)
          setSyncState((prev) => ({
            ...prev,
            isSyncing: false,
            lastSyncedAt: new Date(),
            error: null,
          }))
        } catch (error) {
          console.error(`Error updating ${tableName}:`, error)
          setSyncState((prev) => ({
            ...prev,
            isSyncing: false,
            error: error instanceof Error ? error.message : "Failed to update",
          }))

          // Still save locally
          saveToLocal(updatedData)
        }
      } else {
        saveToLocal(updatedData)
      }
    },
    [data, syncState.isAuthenticated, syncState.user, tableName, saveToLocal]
  )

  // Delete item
  const deleteItem = useCallback(
    async (id: string) => {
      const filteredData = data.filter((item) => item.id !== id)

      if (syncState.isAuthenticated && syncState.user) {
        setSyncState((prev) => ({ ...prev, isSyncing: true }))
        try {
          const supabase = createClient()
          const { error } = await supabase.from(tableName).delete().eq("id", id)

          if (error) throw error

          saveToLocal(filteredData)
          setSyncState((prev) => ({
            ...prev,
            isSyncing: false,
            lastSyncedAt: new Date(),
            error: null,
          }))
        } catch (error) {
          console.error(`Error deleting from ${tableName}:`, error)
          setSyncState((prev) => ({
            ...prev,
            isSyncing: false,
            error: error instanceof Error ? error.message : "Failed to delete",
          }))

          // Still delete locally
          saveToLocal(filteredData)
        }
      } else {
        saveToLocal(filteredData)
      }
    },
    [data, syncState.isAuthenticated, syncState.user, tableName, saveToLocal]
  )

  // Force sync from Supabase
  const forceSync = useCallback(async () => {
    if (!syncState.isAuthenticated || !syncState.user) return

    setSyncState((prev) => ({ ...prev, isSyncing: true }))
    try {
      const supabase = createClient()
      const { data: remoteData, error } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      saveToLocal(remoteData as T[])
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
      }))
    } catch (error) {
      console.error(`Error syncing ${tableName}:`, error)
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : "Failed to sync",
      }))
    }
  }, [syncState.isAuthenticated, syncState.user, tableName, saveToLocal])

  return {
    data,
    isLoading,
    syncState,
    addItem,
    updateItem,
    deleteItem,
    forceSync,
    setData: saveToLocal,
  }
}

// Hook for getting current user
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, isLoading, signOut }
}
