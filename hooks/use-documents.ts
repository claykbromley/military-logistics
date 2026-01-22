"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type DocumentType =
  | "will"
  | "poa"
  | "insurance"
  | "identification"
  | "financial"
  | "medical"
  | "military"
  | "property"
  | "other"

export interface Document {
  id: string
  user_id?: string
  documentName: string
  documentType: DocumentType
  fileUrl?: string
  expirationDate?: string
  notes?: string
  isCritical: boolean
  sharedWith: string[]
  createdAt: string
  updatedAt: string
}

// Database schema mapping
interface DbDocument {
  id: string
  user_id: string
  name: string
  category: string
  file_url: string | null
  file_type: string | null
  expiration_date: string | null
  notes: string | null
  is_shared: boolean
  shared_with: string[] | null
  created_at: string
  updated_at: string
}

const STORAGE_KEY = "deployment-documents"

function generateId(): string {
  return crypto.randomUUID()
}

// Convert database record to local format
function dbToLocal(db: DbDocument): Document {
  return {
    id: db.id,
    user_id: db.user_id,
    documentName: db.name,
    documentType: db.category as DocumentType,
    fileUrl: db.file_url || undefined,
    expirationDate: db.expiration_date || undefined,
    notes: db.notes || undefined,
    isCritical: db.category === "will" || db.category === "poa", // Mark critical by type
    sharedWith: db.shared_with || [],
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

// Convert local format to database record
function localToDb(
  local: Omit<Document, "id" | "createdAt" | "updatedAt">
): Omit<DbDocument, "id" | "user_id" | "created_at" | "updated_at"> {
  return {
    name: local.documentName,
    category: local.documentType,
    file_url: local.fileUrl || null,
    file_type: null,
    expiration_date: local.expirationDate || null,
    notes: local.notes || null,
    is_shared: local.sharedWith.length > 0,
    shared_with: local.sharedWith.length > 0 ? local.sharedWith : null,
  }
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

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
            .from("documents")
            .select("*")
            .order("created_at", { ascending: false })

          if (error) throw error

          const localDocs = (data as DbDocument[]).map(dbToLocal)
          setDocuments(localDocs)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localDocs))
        } catch (error) {
          console.error("Error loading documents from Supabase:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to load")
          // Fall back to localStorage
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            try {
              setDocuments(JSON.parse(stored))
            } catch (e) {
              console.error("Failed to parse stored documents:", e)
            }
          }
        }
      } else {
        // Load from localStorage only
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            setDocuments(JSON.parse(stored))
          } catch (e) {
            console.error("Failed to parse stored documents:", e)
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
    })

    return () => subscription.unsubscribe()
  }, [])

  // Save to localStorage when documents change (as cache)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
    }
  }, [documents, isLoaded])

  const addDocument = useCallback(
    async (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const newDoc: Document = {
        ...doc,
        id: generateId(),
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
              .from("documents")
              .insert({
                ...localToDb(doc),
                user_id: user.id,
              })
              .select()
              .single()

            if (error) throw error

            const createdDoc = dbToLocal(data as DbDocument)
            setDocuments((prev) => [createdDoc, ...prev])
            setSyncError(null)
            return createdDoc
          }
        } catch (error) {
          console.error("Error creating document:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to save")
          // Still add locally
          setDocuments((prev) => [newDoc, ...prev])
        } finally {
          setIsSyncing(false)
        }
      } else {
        setDocuments((prev) => [newDoc, ...prev])
      }

      return newDoc
    },
    [isAuthenticated]
  )

  const updateDocument = useCallback(
    async (id: string, updates: Partial<Document>) => {
      const now = new Date().toISOString()

      // Update locally first
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...updates, updatedAt: now } : doc))
      )

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()

          // Map updates to database format
          const dbUpdates: Record<string, unknown> = {}
          if (updates.documentName !== undefined) dbUpdates.name = updates.documentName
          if (updates.documentType !== undefined) dbUpdates.category = updates.documentType
          if (updates.fileUrl !== undefined) dbUpdates.file_url = updates.fileUrl || null
          if (updates.expirationDate !== undefined)
            dbUpdates.expiration_date = updates.expirationDate || null
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
          if (updates.sharedWith !== undefined) {
            dbUpdates.is_shared = updates.sharedWith.length > 0
            dbUpdates.shared_with = updates.sharedWith.length > 0 ? updates.sharedWith : null
          }

          const { error } = await supabase.from("documents").update(dbUpdates).eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error updating document:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to update")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const deleteDocument = useCallback(
    async (id: string) => {
      // Delete locally first
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { error } = await supabase.from("documents").delete().eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error deleting document:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to delete")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const forceSync = useCallback(async () => {
    if (!isAuthenticated) return

    setIsSyncing(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const localDocs = (data as DbDocument[]).map(dbToLocal)
      setDocuments(localDocs)
      setSyncError(null)
    } catch (error) {
      console.error("Error syncing documents:", error)
      setSyncError(error instanceof Error ? error.message : "Failed to sync")
    } finally {
      setIsSyncing(false)
    }
  }, [isAuthenticated])

  const getDocumentsByType = useCallback(
    (type: DocumentType) => documents.filter((doc) => doc.documentType === type),
    [documents]
  )

  const getCriticalDocuments = useCallback(
    () => documents.filter((doc) => doc.isCritical),
    [documents]
  )

  const getExpiringDocuments = useCallback(
    (withinDays: number = 90) => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() + withinDays)
      return documents.filter((doc) => {
        if (!doc.expirationDate) return false
        return new Date(doc.expirationDate) <= cutoff
      })
    },
    [documents]
  )

  return {
    documents,
    isLoaded,
    isAuthenticated,
    isSyncing,
    syncError,
    addDocument,
    updateDocument,
    deleteDocument,
    forceSync,
    getDocumentsByType,
    getCriticalDocuments,
    getExpiringDocuments,
  }
}
