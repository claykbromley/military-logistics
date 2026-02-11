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
  fileName?: string
  fileSize?: number
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
  file_name: string | null
  file_size: number | null
  expiration_date: string | null
  notes: string | null
  is_critical: boolean | null
  is_shared: boolean
  shared_with: string[] | null
  created_at: string
  updated_at: string
}

const STORAGE_KEY = "deployment-documents"
const STORAGE_BUCKET = "document-vault"

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
    fileName: db.file_name || undefined,
    fileSize: db.file_size || undefined,
    expirationDate: db.expiration_date || undefined,
    notes: db.notes || undefined,
    isCritical: db.is_critical || false, // Use is_critical from database
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
    file_name: local.fileName || null,
    file_size: local.fileSize || null,
    expiration_date: local.expirationDate || null,
    notes: local.notes || null,
    is_critical: local.isCritical,
    is_shared: local.sharedWith.length > 0,
    shared_with: local.sharedWith.length > 0 ? local.sharedWith : null,
  }
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Check if storage bucket exists (don't create automatically due to RLS)
  const checkBucketExists = useCallback(async () => {
    const supabase = createClient()

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 1 })

    if (error) {
      console.warn(
        `Storage bucket '${STORAGE_BUCKET}' does not exist or is not accessible`
      )
      return false
    }

    return true
  }, [])

  useEffect(() => {
    const supabase = createClient()

    let mounted = true

    const fetchDocuments = async (user: any) => {
      try {
        await checkBucketExists()

        const { data: ownedDocs } = await supabase
          .from("document_vault")
          .select("*")
          .eq("user_id", user.id)

        const { data: sharedDocs } = await supabase
          .from("document_vault")
          .select("*")
          .contains("shared_with", [user.email])

        const allDocs = [...(ownedDocs || []), ...(sharedDocs || [])]

        const uniqueDocs = Array.from(
          new Map(allDocs.map(doc => [doc.id, doc])).values()
        )

        const localDocs = (uniqueDocs as DbDocument[]).map(dbToLocal)

        if (mounted) setDocuments(localDocs)
      } catch (e) {
        console.error(e)
      }
    }

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        const user = session?.user

        if (mounted) {
          setIsAuthenticated(!!user)
        }

        if (user) {
          await fetchDocuments(user)
        }
      } finally {
        if (mounted) setIsLoaded(true)
      }
    }

    init()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        const user = session?.user

        setIsAuthenticated(!!user)

        if (event === "SIGNED_IN" && user) {
          fetchDocuments(user)
        }

        if (event === "SIGNED_OUT") {
          setDocuments([])
        }
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Save to localStorage when documents change (as cache)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
    }
  }, [documents, isLoaded])

  const uploadFile = useCallback(
    async (file: File, documentId?: string): Promise<string | null> => {
      if (!isAuthenticated) {
        throw new Error("Must be authenticated to upload files")
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error("No user found")

        // Create unique file path
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}/${documentId || generateId()}.${fileExt}`

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (error) throw error

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)

        setUploadProgress(100)
        return publicUrl
      } catch (error) {
        console.error("Error uploading file:", error)
        throw error
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [isAuthenticated]
  )

  const deleteFile = useCallback(
    async (fileUrl: string) => {
      if (!isAuthenticated) return

      try {
        const supabase = createClient()
        const filePath = fileUrl.split(`${STORAGE_BUCKET}/`)[1]

        if (filePath) {
          const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
          if (error) throw error
        }
      } catch (error) {
        console.error("Error deleting file:", error)
      }
    },
    [isAuthenticated]
  )

  const addDocument = useCallback(
    async (
      doc: Omit<Document, "id" | "createdAt" | "updatedAt">,
      file?: File
    ): Promise<Document | null> => {
      const now = new Date().toISOString()
      const docId = generateId()
      
      let fileUrl = doc.fileUrl
      let fileName = doc.fileName
      let fileSize = doc.fileSize

      // Upload file if provided
      if (file && isAuthenticated) {
        try {
          fileUrl = await uploadFile(file, docId) || undefined
          fileName = file.name
          fileSize = file.size
        } catch (error) {
          console.error("Error uploading file:", error)
          throw new Error("Failed to upload file")
        }
      }

      const newDoc: Document = {
        ...doc,
        id: docId,
        fileUrl,
        fileName,
        fileSize,
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
              .from("document_vault")
              .insert({
                ...localToDb(newDoc),
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
    [isAuthenticated, uploadFile]
  )

  const updateDocument = useCallback(
    async (
      id: string,
      updates: Partial<Document>,
      newFile?: File
    ) => {
      const now = new Date().toISOString()
      const existingDoc = documents.find((d) => d.id === id)

      let fileUrl = updates.fileUrl !== undefined ? updates.fileUrl : existingDoc?.fileUrl
      let fileName = updates.fileName !== undefined ? updates.fileName : existingDoc?.fileName
      let fileSize = updates.fileSize !== undefined ? updates.fileSize : existingDoc?.fileSize

      // Upload new file if provided
      if (newFile && isAuthenticated) {
        try {
          // Delete old file if exists
          if (existingDoc?.fileUrl) {
            await deleteFile(existingDoc.fileUrl)
          }
          fileUrl = await uploadFile(newFile, id) || undefined
          fileName = newFile.name
          fileSize = newFile.size
        } catch (error) {
          console.error("Error uploading file:", error)
          throw new Error("Failed to upload file")
        }
      }

      const finalUpdates = {
        ...updates,
        fileUrl,
        fileName,
        fileSize,
        updatedAt: now,
      }

      // Update locally first
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...finalUpdates } : doc))
      )

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()

          // Map updates to database format - only include fields that were actually updated
          const dbUpdates: Record<string, unknown> = {}
          if (updates.documentName !== undefined) dbUpdates.name = updates.documentName
          if (updates.documentType !== undefined) dbUpdates.category = updates.documentType
          if (updates.expirationDate !== undefined)
            dbUpdates.expiration_date = updates.expirationDate || null
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
          if (updates.isCritical !== undefined) dbUpdates.is_critical = updates.isCritical
          if (updates.sharedWith !== undefined) {
            dbUpdates.is_shared = updates.sharedWith.length > 0
            dbUpdates.shared_with = updates.sharedWith.length > 0 ? updates.sharedWith : null
          }
          
          // Only update file fields if they were actually changed
          if (newFile || updates.fileUrl !== undefined) {
            dbUpdates.file_url = fileUrl || null
            dbUpdates.file_name = fileName || null
            dbUpdates.file_size = fileSize || null
          }

          const { error } = await supabase.from("document_vault").update(dbUpdates).eq("id", id)

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
    [isAuthenticated, documents, uploadFile, deleteFile]
  )

  const deleteDocument = useCallback(
    async (id: string) => {
      const doc = documents.find((d) => d.id === id)

      // Delete file if exists
      if (doc?.fileUrl && isAuthenticated) {
        await deleteFile(doc.fileUrl)
      }

      // Delete locally first
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { error } = await supabase.from("document_vault").delete().eq("id", id)

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
    [isAuthenticated, documents, deleteFile]
  )

  const shareDocument = useCallback(
    async (id: string, emails: string[]) => {
      await updateDocument(id, { sharedWith: emails })
    },
    [updateDocument]
  )

  const forceSync = useCallback(async () => {
    if (!isAuthenticated) return

    setIsSyncing(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch documents owned by user
      const { data: ownedDocs, error: ownedError } = await supabase
        .from("document_vault")
        .select("*")
        .eq("user_id", user.id)

      if (ownedError) throw ownedError

      // Fetch documents shared with user's email
      const { data: sharedDocs, error: sharedError } = await supabase
        .from("document_vault")
        .select("*")
        .contains("shared_with", [user.email])

      if (sharedError) throw sharedError

      // Combine and deduplicate documents
      const allDocs = [...(ownedDocs || []), ...(sharedDocs || [])]
      const uniqueDocs = Array.from(
        new Map(allDocs.map(doc => [doc.id, doc])).values()
      )

      // Sort by created_at descending
      uniqueDocs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      const localDocs = (uniqueDocs as DbDocument[]).map(dbToLocal)
      setDocuments(localDocs)
      setSyncError(null)
    } catch (error) {
      console.error("Error syncing documents:", error)
      setSyncError(error instanceof Error ? error.message : "Failed to sync")
    } finally {
      setIsSyncing(false)
    }
  }, [isAuthenticated])

  const isDocumentOwner = useCallback(
    async (documentId: string): Promise<boolean> => {
      const doc = documents.find(d => d.id === documentId)
      if (!doc) return false

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      return doc.user_id === user?.id
    },
    [documents]
  )

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
    isUploading,
    uploadProgress,
    syncError,
    addDocument,
    updateDocument,
    deleteDocument,
    shareDocument,
    uploadFile,
    deleteFile,
    forceSync,
    isDocumentOwner,
    getDocumentsByType,
    getCriticalDocuments,
    getExpiringDocuments,
  }
}