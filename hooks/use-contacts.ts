"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type CommunicationType = "call" | "video" | "email" | "letter" | "message"
export type ContactRole = "primary" | "secondary" | "medical" | "financial" | "legal" | "other"

export interface Contact {
  id: string
  user_id?: string
  contactName: string
  relationship?: string
  phonePrimary?: string
  phoneSecondary?: string
  email?: string
  address?: string
  timezone?: string
  role: ContactRole
  isEmergencyContact: boolean
  isPoaHolder: boolean
  poaType?: string
  canAccessAccounts: boolean
  priority: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CommunicationLog {
  id: string
  user_id?: string
  contactId?: string
  contactName: string
  communicationType: CommunicationType
  direction: "incoming" | "outgoing"
  communicationDate: string
  durationMinutes?: number
  notes?: string
  createdAt: string
}

const CONTACTS_KEY = "deployment-contacts"
const COMM_LOG_KEY = "deployment-communication-log"

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [communicationLog, setCommunicationLog] = useState<CommunicationLog[]>([])
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
          // Load contacts
          const { data: contactsData, error: contactsError } = await supabase
            .from("emergency_contacts")
            .select("*")
            .order("priority", { ascending: true })

          if (contactsError) throw contactsError

          const localContacts: Contact[] = (contactsData || []).map((c) => ({
            id: c.id,
            user_id: c.user_id,
            contactName: c.name,
            relationship: c.relationship || undefined,
            phonePrimary: c.phone || undefined,
            email: c.email || undefined,
            address: c.address || undefined,
            role: c.role || "other",
            isEmergencyContact: c.role === "primary" || c.role === "secondary",
            isPoaHolder: c.has_poa || false,
            poaType: c.poa_type || undefined,
            canAccessAccounts: c.role === "financial",
            priority: c.priority || 0,
            notes: c.notes || undefined,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }))

          setContacts(localContacts)
          localStorage.setItem(CONTACTS_KEY, JSON.stringify(localContacts))

          // Load communication logs
          const { data: commData, error: commError } = await supabase
            .from("communication_logs")
            .select("*")
            .order("communication_date", { ascending: false })

          if (commError) throw commError

          const localComm: CommunicationLog[] = (commData || []).map((c) => ({
            id: c.id,
            user_id: c.user_id,
            contactId: c.contact_id || undefined,
            contactName: c.contact_name,
            communicationType: c.type as CommunicationType,
            direction: c.direction || "outgoing",
            communicationDate: c.communication_date,
            durationMinutes: c.duration_minutes || undefined,
            notes: c.notes || undefined,
            createdAt: c.created_at,
          }))

          setCommunicationLog(localComm)
          localStorage.setItem(COMM_LOG_KEY, JSON.stringify(localComm))
        } catch (error) {
          console.error("Error loading contacts from Supabase:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to load")
          loadFromLocalStorage()
        }
      } else {
        loadFromLocalStorage()
      }

      setIsLoaded(true)
    }

    const loadFromLocalStorage = () => {
      const storedContacts = localStorage.getItem(CONTACTS_KEY)
      const storedComm = localStorage.getItem(COMM_LOG_KEY)
      if (storedContacts) {
        try {
          setContacts(JSON.parse(storedContacts))
        } catch (e) {
          console.error("Failed to parse contacts:", e)
        }
      }
      if (storedComm) {
        try {
          setCommunicationLog(JSON.parse(storedComm))
        } catch (e) {
          console.error("Failed to parse communication log:", e)
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
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts))
      localStorage.setItem(COMM_LOG_KEY, JSON.stringify(communicationLog))
    }
  }, [contacts, communicationLog, isLoaded])

  const addContact = useCallback(
    async (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const newContact: Contact = {
        ...contact,
        id: crypto.randomUUID(),
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
              .from("emergency_contacts")
              .insert({
                user_id: user.id,
                name: contact.contactName,
                relationship: contact.relationship || null,
                phone: contact.phonePrimary || null,
                email: contact.email || null,
                address: contact.address || null,
                role: contact.role || "other",
                has_poa: contact.isPoaHolder || false,
                poa_type: contact.poaType || null,
                notes: contact.notes || null,
                priority: contact.priority || 0,
              })
              .select()
              .single()

            if (error) throw error

            const createdContact: Contact = {
              id: data.id,
              user_id: data.user_id,
              contactName: data.name,
              relationship: data.relationship || undefined,
              phonePrimary: data.phone || undefined,
              email: data.email || undefined,
              address: data.address || undefined,
              role: data.role || "other",
              isEmergencyContact: data.role === "primary" || data.role === "secondary",
              isPoaHolder: data.has_poa || false,
              poaType: data.poa_type || undefined,
              canAccessAccounts: data.role === "financial",
              priority: data.priority || 0,
              notes: data.notes || undefined,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            }

            setContacts((prev) => [...prev, createdContact])
            setSyncError(null)
            return createdContact
          }
        } catch (error) {
          console.error("Error creating contact:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to save")
          setContacts((prev) => [...prev, newContact])
        } finally {
          setIsSyncing(false)
        }
      } else {
        setContacts((prev) => [...prev, newContact])
      }

      return newContact
    },
    [isAuthenticated]
  )

  const updateContact = useCallback(
    async (id: string, updates: Partial<Contact>) => {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
      )

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()

          const dbUpdates: Record<string, unknown> = {}
          if (updates.contactName !== undefined) dbUpdates.name = updates.contactName
          if (updates.relationship !== undefined) dbUpdates.relationship = updates.relationship || null
          if (updates.phonePrimary !== undefined) dbUpdates.phone = updates.phonePrimary || null
          if (updates.email !== undefined) dbUpdates.email = updates.email || null
          if (updates.address !== undefined) dbUpdates.address = updates.address || null
          if (updates.role !== undefined) dbUpdates.role = updates.role
          if (updates.isPoaHolder !== undefined) dbUpdates.has_poa = updates.isPoaHolder
          if (updates.poaType !== undefined) dbUpdates.poa_type = updates.poaType || null
          if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
          if (updates.priority !== undefined) dbUpdates.priority = updates.priority

          const { error } = await supabase.from("emergency_contacts").update(dbUpdates).eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error updating contact:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to update")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const deleteContact = useCallback(
    async (id: string) => {
      setContacts((prev) => prev.filter((c) => c.id !== id))
      setCommunicationLog((prev) => prev.filter((log) => log.contactId !== id))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { error } = await supabase.from("emergency_contacts").delete().eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error deleting contact:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to delete")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const addCommunication = useCallback(
    async (log: Omit<CommunicationLog, "id" | "createdAt" | "contactName">) => {
      const contact = contacts.find((c) => c.id === log.contactId)
      const newLog: CommunicationLog = {
        ...log,
        id: crypto.randomUUID(),
        contactName: contact?.contactName || "Unknown",
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
              .from("communication_logs")
              .insert({
                user_id: user.id,
                contact_id: log.contactId || null,
                contact_name: contact?.contactName || "Unknown",
                type: log.communicationType,
                direction: log.direction || "outgoing",
                duration_minutes: log.durationMinutes || null,
                notes: log.notes || null,
                communication_date: log.communicationDate,
              })
              .select()
              .single()

            if (error) throw error

            const createdLog: CommunicationLog = {
              id: data.id,
              user_id: data.user_id,
              contactId: data.contact_id || undefined,
              contactName: data.contact_name,
              communicationType: data.type as CommunicationType,
              direction: data.direction || "outgoing",
              communicationDate: data.communication_date,
              durationMinutes: data.duration_minutes || undefined,
              notes: data.notes || undefined,
              createdAt: data.created_at,
            }

            setCommunicationLog((prev) => [createdLog, ...prev])
            setSyncError(null)
            return createdLog
          }
        } catch (error) {
          console.error("Error creating communication log:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to save")
          setCommunicationLog((prev) => [newLog, ...prev])
        } finally {
          setIsSyncing(false)
        }
      } else {
        setCommunicationLog((prev) => [newLog, ...prev])
      }

      return newLog
    },
    [contacts, isAuthenticated]
  )

  const deleteCommunication = useCallback(
    async (id: string) => {
      setCommunicationLog((prev) => prev.filter((log) => log.id !== id))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { error } = await supabase.from("communication_logs").delete().eq("id", id)

          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error deleting communication log:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to delete")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated]
  )

  const getEmergencyContacts = useCallback(
    () => contacts.filter((c) => c.isEmergencyContact),
    [contacts]
  )

  const getPoaHolders = useCallback(() => contacts.filter((c) => c.isPoaHolder), [contacts])

  const getRecentCommunications = useCallback(
    (limit: number = 10) => communicationLog.slice(0, limit),
    [communicationLog]
  )

  const getContactCommunications = useCallback(
    (contactId: string) => communicationLog.filter((log) => log.contactId === contactId),
    [communicationLog]
  )

  return {
    contacts,
    communicationLog,
    isLoaded,
    isAuthenticated,
    isSyncing,
    syncError,
    addContact,
    updateContact,
    deleteContact,
    addCommunication,
    deleteCommunication,
    getEmergencyContacts,
    getPoaHolders,
    getRecentCommunications,
    getContactCommunications,
  }
}
