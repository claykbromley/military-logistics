"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type LegalDocumentType =
  | "will"
  | "poa_general"
  | "poa_special"
  | "poa_medical"
  | "poa_financial"
  | "living_will"
  | "trust"
  | "dd93"
  | "sgli"
  | "other"

export type DocumentStatus = "not_started" | "in_progress" | "completed" | "needs_update"

export interface LegalDocument {
  id: string
  user_id?: string
  type: LegalDocumentType
  name: string
  status: DocumentStatus
  location: string
  documentDate: string | null
  lastUpdated: string | null
  expirationDate: string | null
  notes: string
  attorney: string | null
  attorneyPhone: string | null
  witnessNames: string[]
  createdAt?: string
  updatedAt?: string
}

export interface JAGAppointment {
  id: string
  date: string
  time: string
  location: string
  purpose: string
  notes: string
  completed: boolean
}

export interface LegalContact {
  id: string
  name: string
  role: string
  organization: string
  phone: string
  email: string
  address: string
}

interface LegalData {
  documents: LegalDocument[]
  appointments: JAGAppointment[]
  contacts: LegalContact[]
}

const STORAGE_KEY = "deployment-legal-data"

const defaultDocuments: LegalDocument[] = [
  {
    id: "1",
    type: "will",
    name: "Last Will and Testament",
    status: "not_started",
    location: "",
    documentDate: null,
    lastUpdated: null,
    expirationDate: null,
    notes: "",
    attorney: null,
    attorneyPhone: null,
    witnessNames: [],
  },
  {
    id: "2",
    type: "poa_general",
    name: "General Power of Attorney",
    status: "not_started",
    location: "",
    documentDate: null,
    lastUpdated: null,
    expirationDate: null,
    notes: "",
    attorney: null,
    attorneyPhone: null,
    witnessNames: [],
  },
  {
    id: "3",
    type: "poa_medical",
    name: "Medical Power of Attorney",
    status: "not_started",
    location: "",
    documentDate: null,
    lastUpdated: null,
    expirationDate: null,
    notes: "",
    attorney: null,
    attorneyPhone: null,
    witnessNames: [],
  },
  {
    id: "4",
    type: "poa_financial",
    name: "Financial Power of Attorney",
    status: "not_started",
    location: "",
    documentDate: null,
    lastUpdated: null,
    expirationDate: null,
    notes: "",
    attorney: null,
    attorneyPhone: null,
    witnessNames: [],
  },
  {
    id: "5",
    type: "living_will",
    name: "Living Will / Advance Directive",
    status: "not_started",
    location: "",
    documentDate: null,
    lastUpdated: null,
    expirationDate: null,
    notes: "",
    attorney: null,
    attorneyPhone: null,
    witnessNames: [],
  },
  {
    id: "6",
    type: "dd93",
    name: "DD Form 93 (Record of Emergency Data)",
    status: "not_started",
    location: "",
    documentDate: null,
    lastUpdated: null,
    expirationDate: null,
    notes: "",
    attorney: null,
    attorneyPhone: null,
    witnessNames: [],
  },
  {
    id: "7",
    type: "sgli",
    name: "SGLI Election & Certificate",
    status: "not_started",
    location: "",
    documentDate: null,
    lastUpdated: null,
    expirationDate: null,
    notes: "",
    attorney: null,
    attorneyPhone: null,
    witnessNames: [],
  },
]

const defaultData: LegalData = {
  documents: defaultDocuments,
  appointments: [],
  contacts: [],
}

export function useLegal() {
  const [data, setData] = useState<LegalData>(defaultData)
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
          const { data: legalDocs, error } = await supabase
            .from("legal_documents")
            .select("*")
            .order("created_at", { ascending: false })

          if (error) throw error

          if (legalDocs && legalDocs.length > 0) {
            const localDocs: LegalDocument[] = legalDocs.map((d) => ({
              id: d.id,
              user_id: d.user_id,
              type: d.document_type as LegalDocumentType,
              name: getDocumentName(d.document_type as LegalDocumentType),
              status: d.status as DocumentStatus,
              location: d.location || "",
              documentDate: d.document_date,
              lastUpdated: d.updated_at,
              expirationDate: d.expiration_date,
              notes: d.notes || "",
              attorney: d.attorney_name,
              attorneyPhone: d.attorney_phone,
              witnessNames: [],
              createdAt: d.created_at,
              updatedAt: d.updated_at,
            }))

            setData((prev) => ({ ...prev, documents: localDocs }))
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, documents: localDocs }))
          } else {
            // Initialize with default documents in database
            const docsToInsert = defaultDocuments.map((d) => ({
              user_id: user.id,
              document_type: d.type,
              status: d.status,
              location: d.location || null,
              document_date: d.documentDate,
              expiration_date: d.expirationDate,
              notes: d.notes || null,
              attorney_name: d.attorney,
              attorney_phone: d.attorneyPhone,
            }))

            const { data: inserted, error: insertError } = await supabase
              .from("legal_documents")
              .insert(docsToInsert)
              .select()

            if (insertError) throw insertError

            if (inserted) {
              const localDocs: LegalDocument[] = inserted.map((d) => ({
                id: d.id,
                user_id: d.user_id,
                type: d.document_type as LegalDocumentType,
                name: getDocumentName(d.document_type as LegalDocumentType),
                status: d.status as DocumentStatus,
                location: d.location || "",
                documentDate: d.document_date,
                lastUpdated: d.updated_at,
                expirationDate: d.expiration_date,
                notes: d.notes || "",
                attorney: d.attorney_name,
                attorneyPhone: d.attorney_phone,
                witnessNames: [],
                createdAt: d.created_at,
                updatedAt: d.updated_at,
              }))

              setData((prev) => ({ ...prev, documents: localDocs }))
            }
          }
        } catch (error) {
          console.error("Error loading legal documents from Supabase:", error)
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
          setData(JSON.parse(stored))
        } catch {
          setData(defaultData)
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data, isLoaded])

  const updateDocument = useCallback(
    async (id: string, updates: Partial<LegalDocument>) => {
      setData((prev) => ({
        ...prev,
        documents: prev.documents.map((doc) =>
          doc.id === id ? { ...doc, ...updates, lastUpdated: new Date().toISOString() } : doc
        ),
      }))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()

          const dbUpdates: Record<string, unknown> = {}
          if (updates.type !== undefined) dbUpdates.document_type = updates.type
          if (updates.status !== undefined) dbUpdates.status = updates.status
          if (updates.location !== undefined) dbUpdates.location = updates.location || null
          if (updates.documentDate !== undefined) dbUpdates.document_date = updates.documentDate
          if (updates.expirationDate !== undefined) dbUpdates.expiration_date = updates.expirationDate
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
          if (updates.attorney !== undefined) dbUpdates.attorney_name = updates.attorney
          if (updates.attorneyPhone !== undefined) dbUpdates.attorney_phone = updates.attorneyPhone

          const { error } = await supabase.from("legal_documents").update(dbUpdates).eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error updating legal document:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to update")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const addDocument = useCallback(
    async (document: Omit<LegalDocument, "id">) => {
      const newDoc: LegalDocument = {
        ...document,
        id: crypto.randomUUID(),
      }

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { data: created, error } = await supabase
              .from("legal_documents")
              .insert({
                user_id: user.id,
                document_type: document.type,
                status: document.status,
                location: document.location || null,
                document_date: document.documentDate,
                expiration_date: document.expirationDate,
                notes: document.notes || null,
                attorney_name: document.attorney,
                attorney_phone: document.attorneyPhone,
              })
              .select()
              .single()

            if (error) throw error

            const createdDoc: LegalDocument = {
              id: created.id,
              user_id: created.user_id,
              type: created.document_type as LegalDocumentType,
              name: document.name,
              status: created.status as DocumentStatus,
              location: created.location || "",
              documentDate: created.document_date,
              lastUpdated: created.updated_at,
              expirationDate: created.expiration_date,
              notes: created.notes || "",
              attorney: created.attorney_name,
              attorneyPhone: created.attorney_phone,
              witnessNames: [],
              createdAt: created.created_at,
              updatedAt: created.updated_at,
            }

            setData((prev) => ({
              ...prev,
              documents: [...prev.documents, createdDoc],
            }))
            setSyncError(null)
            return createdDoc
          }
        } catch (error) {
          console.error("Error creating legal document:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to save")
          setData((prev) => ({
            ...prev,
            documents: [...prev.documents, newDoc],
          }))
        } finally {
          setIsSyncing(false)
        }
      } else {
        setData((prev) => ({
          ...prev,
          documents: [...prev.documents, newDoc],
        }))
      }

      return newDoc
    },
    [isAuthenticated]
  )

  const deleteDocument = useCallback(
    async (id: string) => {
      setData((prev) => ({
        ...prev,
        documents: prev.documents.filter((doc) => doc.id !== id),
      }))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { error } = await supabase.from("legal_documents").delete().eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error deleting legal document:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to delete")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const addAppointment = useCallback((appointment: Omit<JAGAppointment, "id">) => {
    const newAppt: JAGAppointment = {
      ...appointment,
      id: crypto.randomUUID(),
    }
    setData((prev) => ({
      ...prev,
      appointments: [...prev.appointments, newAppt],
    }))
  }, [])

  const updateAppointment = useCallback((id: string, updates: Partial<JAGAppointment>) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((appt) => (appt.id === id ? { ...appt, ...updates } : appt)),
    }))
  }, [])

  const deleteAppointment = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.filter((appt) => appt.id !== id),
    }))
  }, [])

  const addContact = useCallback((contact: Omit<LegalContact, "id">) => {
    const newContact: LegalContact = {
      ...contact,
      id: crypto.randomUUID(),
    }
    setData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, newContact],
    }))
  }, [])

  const updateContact = useCallback((id: string, updates: Partial<LegalContact>) => {
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact) => (contact.id === id ? { ...contact, ...updates } : contact)),
    }))
  }, [])

  const deleteContact = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((contact) => contact.id !== id),
    }))
  }, [])

  const getCompletionStats = useCallback(() => {
    const total = data.documents.length
    const completed = data.documents.filter((d) => d.status === "completed").length
    const inProgress = data.documents.filter((d) => d.status === "in_progress").length
    const needsUpdate = data.documents.filter((d) => d.status === "needs_update").length
    return {
      total,
      completed,
      inProgress,
      needsUpdate,
      percentage: Math.round((completed / total) * 100),
    }
  }, [data.documents])

  return {
    documents: data.documents,
    appointments: data.appointments,
    contacts: data.contacts,
    isLoaded,
    isAuthenticated,
    isSyncing,
    syncError,
    updateDocument,
    addDocument,
    deleteDocument,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addContact,
    updateContact,
    deleteContact,
    getCompletionStats,
  }
}

function getDocumentName(type: LegalDocumentType): string {
  const names: Record<LegalDocumentType, string> = {
    will: "Last Will and Testament",
    poa_general: "General Power of Attorney",
    poa_special: "Special Power of Attorney",
    poa_medical: "Medical Power of Attorney",
    poa_financial: "Financial Power of Attorney",
    living_will: "Living Will / Advance Directive",
    trust: "Trust Document",
    dd93: "DD Form 93 (Record of Emergency Data)",
    sgli: "SGLI Election & Certificate",
    other: "Other Legal Document",
  }
  return names[type] || "Unknown Document"
}
