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
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsAuthenticated(!!user)
      setCurrentUserEmail(user?.email || null)

      if (user) {
        try {
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
            phoneSecondary: undefined,
            email: c.email || undefined,
            address: c.address || undefined,
            role: c.role || "other",
            isEmergencyContact: c.role === "primary" || c.role === "secondary",
            isPoaHolder: c.has_poa || false,
            poaType: c.poa_type || undefined,
            // Store canAccessAccounts in a metadata field or use role "financial"
            canAccessAccounts: c.can_access_accounts !== undefined ? c.can_access_accounts : c.role === "financial",
            priority: c.priority || 0,
            notes: c.notes || undefined,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }))

          setContacts(localContacts)
          localStorage.setItem(CONTACTS_KEY, JSON.stringify(localContacts))

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
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newEmail = session?.user?.email || null
      
      // If user signs out or changes, reload the page for security
      if (event === 'SIGNED_OUT' || 
          (event === 'SIGNED_IN' && newEmail !== currentUserEmail && currentUserEmail !== null)) {
        // Clear localStorage to prevent data leakage
        localStorage.removeItem(CONTACTS_KEY)
        localStorage.removeItem(COMM_LOG_KEY)
        
        // Force page reload
        window.location.reload()
      } else if (event === 'SIGNED_IN' && currentUserEmail === null) {
        // Initial sign in (not a switch), just reload data
        loadData()
      }
      
      setIsAuthenticated(!!session?.user)
      setCurrentUserEmail(newEmail)
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
                can_access_accounts: contact.canAccessAccounts || false,
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
              isEmergencyContact: contact.isEmergencyContact,
              isPoaHolder: data.has_poa || false,
              poaType: data.poa_type || undefined,
              canAccessAccounts: data.can_access_accounts || false,
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
      const now = new Date().toISOString()
      
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: now } : c))
      )

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()

          const dbUpdates: Record<string, unknown> = { updated_at: now }
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
          if (updates.canAccessAccounts !== undefined) dbUpdates.can_access_accounts = updates.canAccessAccounts

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
      // Get the contact being deleted to know its priority
      const deletedContact = contacts.find((c) => c.id === id)
      const deletedPriority = deletedContact?.priority || 0
      
      // Remove the contact
      setContacts((prev) => prev.filter((c) => c.id !== id))
      setCommunicationLog((prev) => prev.filter((log) => log.contactId !== id))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          
          // Delete the contact
          const { error: deleteError } = await supabase.from("emergency_contacts").delete().eq("id", id)
          if (deleteError) throw deleteError

          // Reorder priorities - shift all contacts with higher priority numbers down by 1
          const contactsToUpdate = contacts.filter(
            (c) => c.id !== id && c.priority > deletedPriority
          )

          // Update priorities in the database
          for (const contact of contactsToUpdate) {
            const newPriority = contact.priority - 1
            await supabase
              .from("emergency_contacts")
              .update({ priority: newPriority })
              .eq("id", contact.id)
            
            // Update local state
            setContacts((prev) =>
              prev.map((c) => (c.id === contact.id ? { ...c, priority: newPriority } : c))
            )
          }

          setSyncError(null)
        } catch (error) {
          console.error("Error deleting contact:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to delete")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated, contacts]
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

  const exportToPDF = useCallback(async () => {
    // Use client-side PDF generation (works without server setup)
    const { exportContactsToPDFClientSide } = await import("@/lib/pdf-generation/emergency-contacts")
    await exportContactsToPDFClientSide(contacts, currentUserEmail || "user")
  }, [contacts, currentUserEmail])

  const getEmergencyContacts = useCallback(
    () => contacts.filter((c) => c.isEmergencyContact).sort((a, b) => (a.priority || 0) - (b.priority || 0)),
    [contacts]
  )

  const getPoaHolders = useCallback(
    () => contacts.filter((c) => c.isPoaHolder).sort((a, b) => (a.priority || 0) - (b.priority || 0)),
    [contacts]
  )

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
    currentUserEmail,
    addContact,
    updateContact,
    deleteContact,
    addCommunication,
    deleteCommunication,
    exportToPDF,
    getEmergencyContacts,
    getPoaHolders,
    getRecentCommunications,
    getContactCommunications,
  }
}

// Hook to find contacts where the current user's email appears
export function useSharedWithMe() {
  const [sharedContacts, setSharedContacts] = useState<Array<Contact & { ownerName?: string }>>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)

  const loadSharedContacts = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setCurrentEmail(user?.email || null)

    if (!user?.email) {
      setSharedContacts([])
      setIsLoaded(true)
      return
    }

    try {
      // Find all contacts where the email matches the current user's email
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select(`
          *,
          profiles:user_id (
            email
          )
        `)
        .eq("email", user.email)
        .neq("user_id", user.id) // Exclude contacts created by the current user

      if (error) throw error

      const shared: Array<Contact & { ownerName?: string }> = (data || []).map((c) => ({
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
        canAccessAccounts: c.can_access_accounts !== undefined ? c.can_access_accounts : c.role === "financial",
        priority: c.priority || 0,
        notes: c.notes || undefined,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        ownerName: c.profiles?.email || "Unknown User",
      }))

      setSharedContacts(shared)
    } catch (error) {
      console.error("Error loading shared contacts:", error)
      setSharedContacts([])
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadSharedContacts()

    // Subscribe to auth changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newEmail = session?.user?.email || null
      
      // Reload shared contacts when auth state changes
      if (event === 'SIGNED_IN' && newEmail) {
        loadSharedContacts()
      } else if (event === 'SIGNED_OUT') {
        setSharedContacts([])
      }
    })

    return () => subscription.unsubscribe()
  }, [loadSharedContacts])

  return { sharedContacts, isLoaded, refreshSharedContacts: loadSharedContacts }
}