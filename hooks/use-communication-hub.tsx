"use client"

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { CommunicationType, EventType, EventStatus, InvitationStatus,
         Contact, CommunicationLog, ScheduledEvent, EventInvitation, MessageThread, Message, SharedContact } from "@/lib/types"

// ============================================
// STORAGE KEYS
// ============================================

const CONTACTS_KEY = "deployment-contacts"
const COMM_LOG_KEY = "deployment-communication-log"
const EVENTS_KEY = "deployment-scheduled-events"
const THREADS_KEY = "deployment-message-threads"
const SHARED_CONTACTS_KEY = "deployment-shared-contacts"

// ============================================
// HOOK
// ============================================

const CommunicationHubContext = createContext<ReturnType<typeof useCommunicationHubInternal> | null>(null)

type CommunicationHubProviderProps = {
  children: ReactNode
}

export function CommunicationHubProvider({ children }: CommunicationHubProviderProps) {
  const value = useCommunicationHubInternal()

  return (
    <CommunicationHubContext.Provider value={value}>
      {children}
    </CommunicationHubContext.Provider>
  )
}

export function useCommunicationHub() {
  const ctx = useContext(CommunicationHubContext)
  if (!ctx) throw new Error("Must be used within CommunicationHubProvider")
  return ctx
}

function useCommunicationHubInternal() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [sharedContacts, setSharedContacts] = useState<SharedContact[]>([])
  const [communicationLog, setCommunicationLog] = useState<CommunicationLog[]>([])
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([])
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name?: string } | null>(null)

  // ============================================
  // LOAD DATA
  // ============================================

  const loadAllData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    setIsAuthenticated(!!user)

    if (user) {
      setCurrentUser({
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.email?.split("@")[0]
      })

      try {
        // Load contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from("emergency_contacts")
          .select("*")
          .eq("user_id", user.id)
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
          canAccessAccounts: c.can_access_accounts,
          priority: c.priority || 0,
          notes: c.notes || undefined,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }))

        setContacts(localContacts)
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(localContacts))

        // Load shared contacts
        const { data: sharedData, error: sharedError } = await supabase
          .from("emergency_contacts")
          .select(`*, profile:profiles(display_name, email, id, phone)`)
          .eq("email", user.email)
          .order("updated_at", { ascending: true })

        if (!sharedError && sharedData) {
          const localEdits = JSON.parse(
            localStorage.getItem(SHARED_CONTACTS_KEY) || "{}"
          )

          const localByEmail = new Map(
            localContacts.map((c) => [c.email, c])
          )

          const localShared: SharedContact[] = sharedData.map((s: any) => {
            const localMatch = localByEmail.get(s.profile.email)
            const edits = localEdits[s.id] || {}

            return {
              id: s.id,
              ownerId: s.profile.id,
              ownerDisplayName: s.profile.display_name || undefined,
              ownerEmail: s.profile.email,
              ownerPhone: s.profile.phone,
              contactName: s.name,
              relationship: s.relationship || undefined,
              phone: s.phone || undefined,
              contactEmail: s.email || undefined,
              address: s.address || undefined,
              role: s.role || undefined,
              hasPoa: s.has_poa || false,
              poaType: s.poa_type || undefined,
              notes: s.notes || undefined,
              priority: s.priority || 0,
              createdAt: s.created_at,
              updatedAt: s.updated_at,
              localDisplayName: localMatch?.contactName ?? edits.localDisplayName,
              localRelationship: localMatch?.relationship ?? edits.localRelationship,
              addedToContacts: (localMatch && true) || false,
            }
          })

          setSharedContacts(localShared)
        }

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
          direction: c.direction || "twoway",
          communicationDate: c.communication_date,
          durationMinutes: c.duration_minutes || undefined,
          notes: c.notes || undefined,
          createdAt: c.created_at,
        }))

        setCommunicationLog(localComm)
        localStorage.setItem(COMM_LOG_KEY, JSON.stringify(localComm))

        // Load scheduled events with invitations
        const { data: eventsData, error: eventsError } = await supabase
          .from("scheduled_events")
          .select(`
            *,
            event_invitations(*)
          `)
          .order("start_time", { ascending: true })

        if (eventsError) throw eventsError

        const localEvents: ScheduledEvent[] = (eventsData || []).map((e) => ({
          id: e.id,
          user_id: e.user_id,
          title: e.title,
          description: e.description || undefined,
          eventType: e.event_type as EventType,
          startTime: e.start_time,
          endTime: e.end_time || undefined,
          durationMinutes: e.duration_minutes || 30,
          location: e.location || undefined,
          meetingLink: e.meeting_link || undefined,
          isRecurring: e.is_recurring || false,
          recurrencePattern: e.recurrence_pattern || undefined,
          recurrenceInterval: e.recurrence_interval || undefined,
          recurrenceEndDate: e.recurrence_end_date || undefined,
          recurrenceCount: e.recurrence_count || undefined,
          status: e.status as EventStatus,
          notes: e.notes || undefined,
          invitations: (e.event_invitations || []).map((inv: any) => ({
            id: inv.id,
            eventId: inv.event_id,
            contactId: inv.contact_id || undefined,
            inviteeEmail: inv.invitee_email,
            inviteeName: inv.invitee_name || undefined,
            status: inv.status as InvitationStatus,
            responseMessage: inv.response_message || undefined,
            notifiedAt: inv.notified_at || undefined,
            respondedAt: inv.responded_at || undefined,
            createdAt: inv.created_at,
          })),
          createdAt: e.created_at,
          updatedAt: e.updated_at,
        }))

        setScheduledEvents(localEvents)
        localStorage.setItem(EVENTS_KEY, JSON.stringify(localEvents))

        // Load message threads with messages AND per-user unread counts
        const { data: threadsData, error: threadsError } = await supabase
          .from("message_threads")
          .select(`
            *,
            messages(*),
            thread_read_status!inner(unread_count, last_read_at)
          `)
          .eq("thread_read_status.user_email", user.email)
          .order("last_message_at", { ascending: false })

        // Also load threads where user might not have a read status yet
        const { data: threadsWithoutStatus, error: threadsWithoutStatusError } = await supabase
          .from("message_threads")
          .select(`
            *,
            messages(*)
          `)
          .or(`user_id.eq.${user.id},contact_email.eq.${user.email}`)
          .order("last_message_at", { ascending: false })

        if (threadsError && threadsWithoutStatusError) throw threadsError || threadsWithoutStatusError

        // Merge the results, preferring threads with read status
        const threadsWithStatusIds = new Set((threadsData || []).map((t: any) => t.id))
        const allThreadsData = [
          ...(threadsData || []),
          ...(threadsWithoutStatus || []).filter((t: any) => !threadsWithStatusIds.has(t.id))
        ]

        const localThreads: MessageThread[] = allThreadsData.map((t: any) => {
          // Get unread count from thread_read_status if available
          const readStatus = t.thread_read_status?.[0]
          let unreadCount = readStatus?.unread_count || 0

          // If no read status exists, calculate unread from messages
          if (!readStatus && t.messages) {
            unreadCount = t.messages.filter((m: any) => 
              !m.is_read && 
              m.sender_email !== user.email &&
              m.recipient_email === user.email
            ).length
          }

          return {
            id: t.id,
            user_id: t.user_id,
            contactId: t.contact_id || undefined,
            contactEmail: t.contact_email,
            contactName: t.contact_name || undefined,
            subject: t.subject || undefined,
            isArchived: t.is_archived || false,
            isStarred: t.is_starred || false,
            lastMessageAt: t.last_message_at,
            unreadCount: unreadCount,
            messages: (t.messages || []).map((m: any) => ({
              id: m.id,
              threadId: m.thread_id,
              senderType: m.sender_type,
              senderId: m.sender_id || undefined,
              senderEmail: m.sender_email,
              senderName: m.sender_name || undefined,
              recipientEmail: m.recipient_email || undefined,
              content: m.content,
              contentType: m.content_type || "text",
              isRead: m.is_read || false,
              readAt: m.read_at || undefined,
              attachments: m.attachments || [],
              editedAt: m.edited_at || undefined,
              createdAt: m.created_at,
            })).sort((a: Message, b: Message) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            ),
            createdAt: t.created_at,
          }
        })

        setMessageThreads(localThreads)
        localStorage.setItem(THREADS_KEY, JSON.stringify(localThreads))

      } catch (error) {
        console.error("Error loading data from Supabase:", error)
        setSyncError(error instanceof Error ? error.message : "Failed to load")
        loadFromLocalStorage()
      }
    } else {
      // Clear data on logout
      setContacts([])
      setSharedContacts([])
      setCommunicationLog([])
      setScheduledEvents([])
      setMessageThreads([])
      setCurrentUser(null)
      localStorage.removeItem(CONTACTS_KEY)
      localStorage.removeItem(COMM_LOG_KEY)
      localStorage.removeItem(EVENTS_KEY)
      localStorage.removeItem(THREADS_KEY)
    }

    setIsLoaded(true)
  }, [])

  const loadFromLocalStorage = () => {
    const storedContacts = localStorage.getItem(CONTACTS_KEY)
    const storedComm = localStorage.getItem(COMM_LOG_KEY)
    const storedEvents = localStorage.getItem(EVENTS_KEY)
    const storedThreads = localStorage.getItem(THREADS_KEY)
    
    if (storedContacts) {
      try { setContacts(JSON.parse(storedContacts)) } catch (e) { console.error(e) }
    }
    if (storedComm) {
      try { setCommunicationLog(JSON.parse(storedComm)) } catch (e) { console.error(e) }
    }
    if (storedEvents) {
      try { setScheduledEvents(JSON.parse(storedEvents)) } catch (e) { console.error(e) }
    }
    if (storedThreads) {
      try { setMessageThreads(JSON.parse(storedThreads)) } catch (e) { console.error(e) }
    }
  }

  useEffect(() => {
    loadAllData()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
      // Reload all data on login/logout for security
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadAllData()
      }
    })

    return () => subscription.unsubscribe()
  }, [loadAllData])

  // Persist to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts))
      localStorage.setItem(COMM_LOG_KEY, JSON.stringify(communicationLog))
      localStorage.setItem(EVENTS_KEY, JSON.stringify(scheduledEvents))
      localStorage.setItem(THREADS_KEY, JSON.stringify(messageThreads))
    }
  }, [contacts, communicationLog, scheduledEvents, messageThreads, isLoaded])

  // ============================================
  // CONTACT OPERATIONS
  // ============================================

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
          const { data: { user } } = await supabase.auth.getUser()

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
                can_access_accounts: contact.canAccessAccounts || false,
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
          if (updates.canAccessAccounts !== undefined) dbUpdates.can_access_accounts = updates.canAccessAccounts
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
    async (id: string, email?: string): Promise<Contact[]> => {
      let nextContacts: Contact[] = []

      setContacts((prev) => {
        nextContacts = prev.filter((c) => c.id !== id)
        return nextContacts
      })

      setCommunicationLog((prev) =>
        prev.filter((log) => log.contactId !== id)
      )

      setSharedContacts((prev) =>
        prev.map((c) =>
          c.ownerEmail === email
            ? { ...c, addedToContacts: false }
            : c
        )
      )

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()

          const { error } = await supabase
            .from("emergency_contacts")
            .delete()
            .eq("id", id)

          if (error) throw error

          setSyncError(null)
        } catch (error) {
          console.error("Error deleting contact:", error)
          setSyncError(
            error instanceof Error ? error.message : "Failed to delete"
          )
        } finally {
          setIsSyncing(false)
        }
      }
    
      return nextContacts
    },
    [isAuthenticated]
  )

  // ============================================
  // COMMUNICATION LOG OPERATIONS
  // ============================================

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
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            const { data, error } = await supabase
              .from("communication_logs")
              .insert({
                user_id: user.id,
                contact_id: log.contactId || null,
                contact_name: contact?.contactName || "Unknown",
                type: log.communicationType,
                direction: log.direction || "twoway",
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
              direction: data.direction || "twoway",
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

  const updateCommunication = useCallback(
    async (
      logId: string,
      updates: Partial<Omit<CommunicationLog, "id" | "createdAt" | "contactName" | "user_id">>
    ) => {
      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            // Build update data object
            const updateData: any = {}

            if (updates.contactId !== undefined) {
              updateData.contact_id = updates.contactId || null
              // If contact is changing, update contact name too
              const contact = contacts.find((c) => c.id === updates.contactId)
              updateData.contact_name = contact?.contactName || "Unknown"
            }
            if (updates.communicationType !== undefined) updateData.type = updates.communicationType
            if (updates.direction !== undefined) updateData.direction = updates.direction
            if (updates.durationMinutes !== undefined) updateData.duration_minutes = updates.durationMinutes || null
            if (updates.notes !== undefined) updateData.notes = updates.notes || null
            if (updates.communicationDate !== undefined) updateData.communication_date = updates.communicationDate

            const { data, error } = await supabase
              .from("communication_logs")
              .update(updateData)
              .eq("id", logId)
              .eq("user_id", user.id)
              .select()
              .single()
            console.log(data)

            if (error) throw error

            const updatedLog: CommunicationLog = {
              id: data.id,
              user_id: data.user_id,
              contactId: data.contact_id || undefined,
              contactName: data.contact_name,
              communicationType: data.type as CommunicationType,
              direction: data.direction || "twoway",
              communicationDate: data.communication_date,
              durationMinutes: data.duration_minutes || undefined,
              notes: data.notes || undefined,
              createdAt: data.created_at,
            }

            setCommunicationLog((prev) =>
              prev.map((log) => (log.id === logId ? updatedLog : log))
            )
            setSyncError(null)
            return updatedLog
          }
        } catch (error) {
          console.error("Error updating communication log:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to update")
          
          // Optimistic local update on error
          setCommunicationLog((prev) =>
            prev.map((log) => {
              if (log.id === logId) {
                const contact = updates.contactId ? contacts.find((c) => c.id === updates.contactId) : null
                return {
                  ...log,
                  ...updates,
                  contactName: contact ? contact.contactName : log.contactName,
                }
              }
              return log
            })
          )
        } finally {
          setIsSyncing(false)
        }
      } else {
        // Local-only update
        setCommunicationLog((prev) =>
          prev.map((log) => {
            if (log.id === logId) {
              const contact = updates.contactId ? contacts.find((c) => c.id === updates.contactId) : null
              return {
                ...log,
                ...updates,
                contactName: contact ? contact.contactName : log.contactName,
              }
            }
            return log
          })
        )
      }
    },
    [isAuthenticated, contacts]
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

  // ============================================
  // SCHEDULED EVENTS OPERATIONS
  // ============================================
  function mapEventFromSupabase(
    eventData: any,
    invitationsData: any[]
  ): ScheduledEvent {
    return {
      id: eventData.id,
      user_id: eventData.user_id,
      title: eventData.title,
      description: eventData.description || undefined,
      eventType: eventData.event_type as EventType,
      startTime: eventData.start_time,
      endTime: eventData.end_time || undefined,
      durationMinutes: eventData.duration_minutes || 30,
      location: eventData.location || undefined,
      meetingLink: eventData.meeting_link || undefined,
      isRecurring: eventData.is_recurring || false,
      recurrencePattern: eventData.recurrence_pattern || undefined,
      recurrenceInterval: eventData.recurrence_interval || undefined,
      recurrenceEndDate: eventData.recurrence_end_date || undefined,
      recurrenceCount: eventData.recurrence_count || undefined,
      status: eventData.status as EventStatus,
      notes: eventData.notes || undefined,
      invitations: invitationsData.map((inv) => ({
        id: inv.id,
        eventId: inv.event_id,
        contactId: inv.contact_id || undefined,
        inviteeEmail: inv.invitee_email,
        inviteeName: inv.invitee_name || undefined,
        status: inv.status as InvitationStatus,
        responseMessage: inv.response_message || undefined,
        notifiedAt: inv.notified_at || undefined,
        respondedAt: inv.responded_at || undefined,
        createdAt: inv.created_at,
      })),
      createdAt: eventData.created_at,
      updatedAt: eventData.updated_at,
    }
  }

  function getNextOccurrenceDate(
    currentDate: Date,
    pattern: "daily" | "weekly" | "monthly",
    interval: number
  ): Date {
    const next = new Date(currentDate)
    switch (pattern) {
      case "daily":
        next.setDate(next.getDate() + interval)
        break
      case "weekly":
        next.setDate(next.getDate() + 7 * interval)
        break
      case "monthly":
        next.setMonth(next.getMonth() + interval)
        break
    }
    return next
  }

  const createEvent = useCallback(
    async (
      event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
      invitees: { email: string; name?: string; contactId?: string }[]
    ) => {
      const now = new Date().toISOString()
      const newEvent: ScheduledEvent = {
        ...event,
        id: crypto.randomUUID(),
        invitations: [],
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
            // Build insert payload — ensure mutual exclusivity of end conditions
            const insertData: any = {
              user_id: user.id,
              title: event.title,
              description: event.description || null,
              event_type: event.eventType,
              start_time: event.startTime,
              end_time: event.endTime || null,
              duration_minutes: event.durationMinutes || 30,
              location: event.location || null,
              meeting_link: event.meetingLink || null,
              is_recurring: event.isRecurring || false,
              recurrence_pattern: null,
              recurrence_interval: null,
              recurrence_end_date: null,
              recurrence_count: null,
              status: event.status || "scheduled",
              notes: event.notes || null,
            }

            if (event.isRecurring) {
              insertData.recurrence_pattern = event.recurrencePattern || "weekly"
              insertData.recurrence_interval = event.recurrenceInterval || 1

              // Mutually exclusive: only one end condition
              if (event.recurrenceEndDate) {
                insertData.recurrence_end_date = event.recurrenceEndDate
                insertData.recurrence_count = null
              } else if (event.recurrenceCount) {
                insertData.recurrence_count = event.recurrenceCount
                insertData.recurrence_end_date = null
              }
            }

            const { data: eventData, error: eventError } = await supabase
              .from("scheduled_events")
              .insert(insertData)
              .select()
              .single()

            if (eventError) throw eventError

            // Create invitations
            let invitationsData: any[] = []
            if (invitees.length > 0) {
              const invitationInserts = invitees.map((inv) => ({
                user_id: user.id,
                event_id: eventData.id,
                contact_id: inv.contactId || null,
                invitee_email: inv.email,
                invitee_name: inv.name || null,
                status: "pending",
              }))

              const { data: invData, error: invError } = await supabase
                .from("event_invitations")
                .insert(invitationInserts)
                .select()

              if (invError) throw invError
              invitationsData = invData || []
            }

            const createdEvent = mapEventFromSupabase(eventData, invitationsData)

            setScheduledEvents((prev) => [...prev, createdEvent])
            setSyncError(null)
            return createdEvent
          }
        } catch (error) {
          console.error("Error creating event:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to save")
          setScheduledEvents((prev) => [...prev, newEvent])
        } finally {
          setIsSyncing(false)
        }
      } else {
        setScheduledEvents((prev) => [...prev, newEvent])
      }

      return newEvent
    },
    [isAuthenticated, currentUser]
  )

  const updateEvent = useCallback(
    async (
      eventId: string,
      updates: Partial<Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">>,
      invitees?: { email: string; name?: string; contactId?: string }[]
    ) => {
      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const updateData: any = {
              updated_at: new Date().toISOString(),
            }

            if (updates.title !== undefined) updateData.title = updates.title
            if (updates.description !== undefined) updateData.description = updates.description || null
            if (updates.eventType !== undefined) updateData.event_type = updates.eventType
            if (updates.startTime !== undefined) updateData.start_time = updates.startTime
            if (updates.endTime !== undefined) updateData.end_time = updates.endTime || null
            if (updates.durationMinutes !== undefined) updateData.duration_minutes = updates.durationMinutes
            if (updates.location !== undefined) updateData.location = updates.location || null
            if (updates.meetingLink !== undefined) updateData.meeting_link = updates.meetingLink || null
            if (updates.status !== undefined) updateData.status = updates.status
            if (updates.notes !== undefined) updateData.notes = updates.notes || null

            // Handle recurrence — ensure mutual exclusivity of end conditions
            if (updates.isRecurring !== undefined) {
              updateData.is_recurring = updates.isRecurring

              if (updates.isRecurring) {
                if (updates.recurrencePattern !== undefined)
                  updateData.recurrence_pattern = updates.recurrencePattern || "weekly"
                if (updates.recurrenceInterval !== undefined)
                  updateData.recurrence_interval = updates.recurrenceInterval || 1

                // FIX: Enforce mutual exclusivity of end conditions
                // If recurrenceEndDate is set, clear recurrenceCount and vice versa
                if (updates.recurrenceEndDate !== undefined) {
                  updateData.recurrence_end_date = updates.recurrenceEndDate || null
                  updateData.recurrence_count = null
                } else if (updates.recurrenceCount !== undefined) {
                  updateData.recurrence_count = updates.recurrenceCount || null
                  updateData.recurrence_end_date = null
                }

                // Handle "never" end type: both null
                if (!updates.recurrenceEndDate && !updates.recurrenceCount) {
                  updateData.recurrence_end_date = null
                  updateData.recurrence_count = null
                }
              } else {
                // Toggled off — clear everything
                updateData.recurrence_pattern = null
                updateData.recurrence_interval = null
                updateData.recurrence_end_date = null
                updateData.recurrence_count = null
              }
            } else {
              // isRecurring not in updates, but individual recurrence fields may be
              if (updates.recurrencePattern !== undefined)
                updateData.recurrence_pattern = updates.recurrencePattern || null
              if (updates.recurrenceInterval !== undefined)
                updateData.recurrence_interval = updates.recurrenceInterval || null

              // Enforce mutual exclusivity even for partial updates
              if (updates.recurrenceEndDate !== undefined) {
                updateData.recurrence_end_date = updates.recurrenceEndDate || null
                updateData.recurrence_count = null
              } else if (updates.recurrenceCount !== undefined) {
                updateData.recurrence_count = updates.recurrenceCount || null
                updateData.recurrence_end_date = null
              }
            }

            const { data: eventData, error: eventError } = await supabase
              .from("scheduled_events")
              .update(updateData)
              .eq("id", eventId)
              .eq("user_id", user.id)
              .select()
              .single()

            if (eventError) throw eventError

            // Handle invitations — preserve existing statuses
            let invitationsData: any[] = []
            if (invitees !== undefined) {
              const { data: existingInvitations } = await supabase
                .from("event_invitations")
                .select("*")
                .eq("event_id", eventId)

              const existingByEmail = new Map(
                (existingInvitations || []).map((inv) => [inv.invitee_email, inv])
              )

              const newInviteeEmails = new Set(invitees.map((i) => i.email))

              // Delete only removed invitees
              const removedEmails = [...existingByEmail.keys()].filter(
                (email) => !newInviteeEmails.has(email)
              )
              if (removedEmails.length > 0) {
                await supabase
                  .from("event_invitations")
                  .delete()
                  .eq("event_id", eventId)
                  .in("invitee_email", removedEmails)
              }

              // Insert only genuinely new invitees
              const toInsert = invitees.filter((inv) => !existingByEmail.has(inv.email))
              if (toInsert.length > 0) {
                const { error: invError } = await supabase
                  .from("event_invitations")
                  .insert(
                    toInsert.map((inv) => ({
                      user_id: user.id,
                      event_id: eventId,
                      contact_id: inv.contactId || null,
                      invitee_email: inv.email,
                      invitee_name: inv.name || null,
                      status: "pending",
                    }))
                  )
                  .select()
                if (invError) throw invError
              }

              // Re-fetch all current invitations
              const { data: finalInvData } = await supabase
                .from("event_invitations")
                .select("*")
                .eq("event_id", eventId)
              invitationsData = finalInvData || []
            } else {
              const { data: invData } = await supabase
                .from("event_invitations")
                .select("*")
                .eq("event_id", eventId)
              invitationsData = invData || []
            }

            const updatedEvent = mapEventFromSupabase(eventData, invitationsData)

            setScheduledEvents((prev) =>
              prev.map((e) => (e.id === eventId ? updatedEvent : e))
            )
            setSyncError(null)
            return updatedEvent
          }
        } catch (error) {
          console.error("Error updating event:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to update")
          setScheduledEvents((prev) =>
            prev.map((e) =>
              e.id === eventId
                ? { ...e, ...updates, updatedAt: new Date().toISOString() }
                : e
            )
          )
        } finally {
          setIsSyncing(false)
        }
      } else {
        setScheduledEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, ...updates, updatedAt: new Date().toISOString() }
              : e
          )
        )
      }
    },
    [isAuthenticated]
  )

  const deleteEvent = useCallback(
    async (id: string) => {
      setScheduledEvents((prev) => prev.filter((e) => e.id !== id))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { error } = await supabase.from("scheduled_events").delete().eq("id", id)
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

  const completeRecurringEvent = useCallback(
    async (eventId: string) => {
      const event = scheduledEvents.find((e) => e.id === eventId)
      if (!event) return

      // Mark the current event as completed
      await updateEvent(eventId, { status: "completed" })

      // If it's recurring, create the next occurrence
      if (event.isRecurring && event.recurrencePattern) {
        const nextStart = getNextOccurrenceDate(
          new Date(event.startTime),
          event.recurrencePattern,
          event.recurrenceInterval || 1
        )

        // Check if we've exceeded the end conditions
        if (event.recurrenceEndDate && nextStart > new Date(event.recurrenceEndDate)) {
          return // Past end date, don't create another
        }

        if (event.recurrenceCount) {
          // Count how many completed events in this series exist
          const seriesTitle = event.title
          const completedInSeries = scheduledEvents.filter(
            (e) =>
              e.title === seriesTitle &&
              e.isRecurring &&
              e.status === "completed" &&
              e.recurrencePattern === event.recurrencePattern
          ).length + 1 // +1 for the one we just completed

          if (completedInSeries >= event.recurrenceCount) {
            return // Reached max occurrences
          }
        }

        const durationMs = (event.durationMinutes || 30) * 60000
        const nextEnd = new Date(nextStart.getTime() + durationMs)

        // Gather existing invitee info
        const invitees = event.invitations.map((inv) => ({
          email: inv.inviteeEmail,
          name: inv.inviteeName,
          contactId: inv.contactId,
        }))

        await createEvent(
          {
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            startTime: nextStart.toISOString(),
            endTime: nextEnd.toISOString(),
            durationMinutes: event.durationMinutes,
            location: event.location,
            meetingLink: event.meetingLink,
            isRecurring: true,
            recurrencePattern: event.recurrencePattern,
            recurrenceInterval: event.recurrenceInterval,
            recurrenceEndDate: event.recurrenceEndDate,
            recurrenceCount: event.recurrenceCount,
            status: "scheduled",
            notes: event.notes,
          },
          invitees
        )
      }
    },
    [scheduledEvents, updateEvent, createEvent]
  )

  const addEventInvitee = useCallback(
    async (eventId: string, invitee: { email: string; name?: string; contactId?: string }) => {
      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            const { data, error } = await supabase
              .from("event_invitations")
              .insert({
                event_id: eventId,
                contact_id: invitee.contactId || null,
                invitee_email: invitee.email,
                invitee_name: invitee.name || null,
                status: "pending",
              })
              .select()
              .single()

            if (error) throw error

            const newInvitation: EventInvitation = {
              id: data.id,
              eventId: data.event_id,
              contactId: data.contact_id || undefined,
              inviteeEmail: data.invitee_email,
              inviteeName: data.invitee_name || undefined,
              status: data.status as InvitationStatus,
              createdAt: data.created_at,
            }

            setScheduledEvents((prev) =>
              prev.map((e) =>
                e.id === eventId
                  ? { ...e, invitations: [...e.invitations, newInvitation] }
                  : e
              )
            )
            setSyncError(null)
            return newInvitation
          }
        } catch (error) {
          console.error("Error adding invitee:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to add invitee")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated, scheduledEvents, currentUser]
  )

  // ============================================
  // MESSAGE THREAD OPERATIONS
  // ============================================

  const createThread = useCallback(
    async (contactEmail: string, contactName?: string, contactId?: string, subject?: string) => {
      const now = new Date().toISOString()
      const newThread: MessageThread = {
        id: crypto.randomUUID(),
        contactEmail,
        contactName,
        contactId,
        subject,
        isArchived: false,
        isStarred: false,
        lastMessageAt: now,
        unreadCount: 0,
        messages: [],
        createdAt: now,
      }

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            const { data, error } = await supabase
              .from("message_threads")
              .insert({
                user_id: user.id,
                contact_id: contactId || null,
                contact_email: contactEmail,
                contact_name: contactName || null,
                subject: subject || null,
              })
              .select()
              .single()

            if (error) throw error

            // Initialize read status for the thread creator (0 unread)
            await supabase
              .from("thread_read_status")
              .insert({
                thread_id: data.id,
                user_email: user.email,
                unread_count: 0,
                last_read_at: now,
              })

            const createdThread: MessageThread = {
              id: data.id,
              user_id: data.user_id,
              contactId: data.contact_id || undefined,
              contactEmail: data.contact_email,
              contactName: data.contact_name || undefined,
              subject: data.subject || undefined,
              isArchived: data.is_archived || false,
              isStarred: data.is_starred || false,
              lastMessageAt: data.last_message_at,
              unreadCount: 0,
              messages: [],
              createdAt: data.created_at,
            }

            setMessageThreads((prev) => [createdThread, ...prev])
            setSyncError(null)
            return createdThread
          }
        } catch (error) {
          console.error("Error creating thread:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to save")
          setMessageThreads((prev) => [newThread, ...prev])
        } finally {
          setIsSyncing(false)
        }
      } else {
        setMessageThreads((prev) => [newThread, ...prev])
      }

      return newThread
    },
    [isAuthenticated]
  )

  const sendMessage = useCallback(
    async (thread: MessageThread, content: string, attachedFiles?: File[], recipientEmail?: string, contentType: "text" | "html" | "markdown" = "text") => {
      const now = new Date().toISOString()
      const recipient = recipientEmail || thread.contactEmail

      const newMessage: Message = {
        id: crypto.randomUUID(),
        threadId: thread.id,
        senderType: "user",
        senderId: currentUser?.id,
        senderEmail: currentUser?.email || "",
        senderName: currentUser?.name,
        recipientEmail: recipient,
        content,
        contentType,
        isRead: false,
        attachments: attachedFiles || [],
        editedAt: now,
        createdAt: now,
      }

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            const uploadedUrls: string[] = []
            if (attachedFiles) {
              for (const file of attachedFiles) {
                const path = `${user.id}/${Date.now()}-${file.name}`

                const { error } = await supabase.storage
                  .from("message_attachments")
                  .upload(path, file)

                if (error) {
                  console.error(error)
                  continue
                }

                const { data } = supabase.storage
                  .from("message_attachments")
                  .getPublicUrl(path)

                uploadedUrls.push(data.publicUrl)
              }
            }

            // Insert the message with recipient_email
            const { data, error } = await supabase
              .from("messages")
              .insert({
                thread_id: thread.id,
                sender_type: "user",
                sender_id: user.id,
                sender_email: user.email,
                sender_name: user.user_metadata?.full_name || user.email?.split("@")[0],
                recipient_email: recipient,
                content,
                content_type: contentType,
                attachments: uploadedUrls,
                is_read: false,
              })
              .select()
              .single()
            if (error) throw error

            // Update thread last_message_at
            await supabase
              .from("message_threads")
              .update({ last_message_at: now })
              .eq("id", thread.id)

            // The trigger will automatically update thread_read_status for the recipient
            // But we need to ensure sender's unread count stays at 0
            await supabase
              .from("thread_read_status")
              .upsert({
                thread_id: thread.id,
                user_email: user.email,
                unread_count: 0,
                last_read_at: now,
              }, {
                onConflict: "thread_id,user_email"
              })

            const createdMessage: Message = {
              id: data.id,
              threadId: data.thread_id,
              senderType: data.sender_type,
              senderId: data.sender_id || undefined,
              senderEmail: data.sender_email,
              senderName: data.sender_name || undefined,
              recipientEmail: data.recipient_email || undefined,
              content: data.content,
              contentType: data.content_type || "text",
              isRead: data.is_read || false,
              readAt: data.read_at || undefined,
              attachments: data.attachments || [],
              editedAt: data.edited_at || undefined,
              createdAt: data.created_at,
            }

            setMessageThreads((prev) =>
              prev.map((t) =>
                t.id === thread.id
                  ? { ...t, messages: [...t.messages, createdMessage], lastMessageAt: now }
                  : t
              )
            )
            setSyncError(null)
            return createdMessage
          }
        } catch (error) {
          console.error("Error sending message:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to send")
          setMessageThreads((prev) =>
            prev.map((t) =>
              t.id === thread.id
                ? { ...t, messages: [...t.messages, newMessage], lastMessageAt: now }
                : t
            )
          )
        } finally {
          setIsSyncing(false)
        }
      } else {
        setMessageThreads((prev) =>
          prev.map((t) =>
            t.id === thread.id
              ? { ...t, messages: [...t.messages, newMessage], lastMessageAt: now }
              : t
          )
        )
      }

      return newMessage
    },
    [isAuthenticated, currentUser]
  )

  const markThreadAsRead = useCallback(
    async (threadId: string) => {
      // Optimistically update local state
      setMessageThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                unreadCount: 0,
                messages: t.messages.map((m) => ({
                  ...m,
                  isRead: m.recipientEmail === currentUser?.email ? true : m.isRead,
                  readAt: m.recipientEmail === currentUser?.email && !m.readAt ? new Date().toISOString() : m.readAt
                })),
              }
            : t
        )
      )

      if (isAuthenticated && currentUser?.email) {
        try {
          const supabase = createClient()
          
          // Use the database function to mark thread as read
          await supabase.rpc("mark_thread_as_read", {
            p_thread_id: threadId,
            p_user_email: currentUser.email
          })
        } catch (error) {
          console.error("Error marking thread as read:", error)
        }
      }
    },
    [isAuthenticated, currentUser]
  )

  const toggleThreadStar = useCallback(
    async (threadId: string) => {
      const thread = messageThreads.find((t) => t.id === threadId)
      if (!thread) return

      setMessageThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, isStarred: !t.isStarred } : t))
      )

      if (isAuthenticated) {
        try {
          const supabase = createClient()
          await supabase
            .from("message_threads")
            .update({ is_starred: !thread.isStarred })
            .eq("id", threadId)
        } catch (error) {
          console.error("Error toggling star:", error)
        }
      }
    },
    [isAuthenticated, messageThreads]
  )

  // Helper function to extract storage paths from attachment URLs
  const extractStoragePaths = (attachments: (string | File)[]): string[] => {
    return attachments
      .filter((att): att is string => typeof att === "string")
      .map((url) => {
        // Extract path from URL: .../message_attachments/user_id/filename
        const match = url.match(/message_attachments\/(.+)$/)
        return match ? decodeURIComponent(match[1]) : null
      })
      .filter(Boolean) as string[]
  }

  const deleteThread = useCallback(
    async (threadId: string) => {
      // Get the thread to find all attachments
      const thread = messageThreads.find((t) => t.id === threadId)
      const allAttachments = thread?.messages.flatMap((m) => m.attachments || []) || []
      
      setMessageThreads((prev) => prev.filter((t) => t.id !== threadId))

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          
          // Delete attachments from storage
          const filePaths = extractStoragePaths(allAttachments)
          if (filePaths.length > 0) {
            const { error: storageError } = await supabase.storage
              .from("message_attachments")
              .remove(filePaths)
            if (storageError) {
              console.error("Error deleting attachments:", storageError)
            }
          }
          
          const { error } = await supabase.from("message_threads").delete().eq("id", threadId)
          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error deleting thread:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to delete")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated, messageThreads]
  )

  const editMessage = useCallback(
    async (
      threadId: string,
      messageId: string,
      newContent: string,
      newAttachments?: File[],
      attachmentsToRemove?: string[]
    ) => {
      const now = new Date().toISOString()
      
      // Get current message to work with existing attachments
      const thread = messageThreads.find((t) => t.id === threadId)
      const message = thread?.messages.find((m) => m.id === messageId)
      const currentAttachments = (message?.attachments || []).filter(
        (att): att is string => typeof att === "string"
      )

      // Calculate final attachments (remove the ones to delete)
      let finalAttachments = currentAttachments.filter(
        (url) => !attachmentsToRemove?.includes(url)
      )

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            // Delete removed attachments from storage
            if (attachmentsToRemove && attachmentsToRemove.length > 0) {
              const pathsToRemove = extractStoragePaths(attachmentsToRemove)
              if (pathsToRemove.length > 0) {
                const { error: storageError } = await supabase.storage
                  .from("message_attachments")
                  .remove(pathsToRemove)
                if (storageError) {
                  console.error("Error deleting attachments:", storageError)
                }
              }
            }

            // Upload new attachments
            const uploadedUrls: string[] = []
            if (newAttachments && newAttachments.length > 0) {
              for (const file of newAttachments) {
                const path = `${user.id}/${Date.now()}-${file.name}`

                const { error } = await supabase.storage
                  .from("message_attachments")
                  .upload(path, file)

                if (error) {
                  console.error("Upload error:", error)
                  continue
                }

                const { data } = supabase.storage
                  .from("message_attachments")
                  .getPublicUrl(path)

                uploadedUrls.push(data.publicUrl)
              }
            }

            // Add uploaded URLs to final attachments
            finalAttachments = [...finalAttachments, ...uploadedUrls]

            // Update message in database
            const { error } = await supabase
              .from("messages")
              .update({
                content: newContent,
                attachments: finalAttachments,
                edited_at: now
              })
              .eq("id", messageId)
            
            if (error) throw error

            // Update local state AFTER successful database update
            setMessageThreads((prev) =>
              prev.map((t) =>
                t.id === threadId
                  ? {
                      ...t,
                      messages: t.messages.map((m) =>
                        m.id === messageId
                          ? { ...m, content: newContent, attachments: finalAttachments, editedAt: now }
                          : m
                      ),
                    }
                  : t
              )
            )

            setSyncError(null)
          }
        } catch (error) {
          console.error("Error editing message:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to edit")
        } finally {
          setIsSyncing(false)
        }
      } else {
        // For non-authenticated users, just update local state
        // (new attachments won't be uploaded in this case)
        setMessageThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, content: newContent, attachments: finalAttachments, editedAt: now }
                      : m
                  ),
                }
              : t
          )
        )
      }
    },
    [isAuthenticated, messageThreads]
  )

  const deleteMessage = useCallback(
    async (threadId: string, messageId: string) => {
      // Get the message to find attachments
      const thread = messageThreads.find((t) => t.id === threadId)
      const message = thread?.messages.find((m) => m.id === messageId)
      const attachments = message?.attachments || []

      // Optimistically update local state
      setMessageThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages: t.messages.filter((m) => m.id !== messageId),
              }
            : t
        )
      )

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          
          // Delete attachments from storage
          const filePaths = extractStoragePaths(attachments)
          if (filePaths.length > 0) {
            const { error: storageError } = await supabase.storage
              .from("message_attachments")
              .remove(filePaths)
            if (storageError) {
              console.error("Error deleting attachments:", storageError)
            }
          }
          
          const { error } = await supabase.from("messages").delete().eq("id", messageId)
          if (error) throw error
          setSyncError(null)
        } catch (error) {
          console.error("Error deleting message:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to delete")
        } finally {
          setIsSyncing(false)
        }
      }
    },
    [isAuthenticated, messageThreads]
  )

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

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

  const getUpcomingEvents = useCallback(
    (limit: number = 10) => {
      const now = new Date()
      return scheduledEvents
        .filter((e) => new Date(e.startTime) >= now && e.status === "scheduled")
        .slice(0, limit)
    },
    [scheduledEvents]
  )

  const getContactThreads = useCallback(
    (contactId: string) => messageThreads.filter((t) => t.contactId === contactId),
    [messageThreads]
  )

  const getUnreadCount = useCallback(
    () => messageThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0),
    [messageThreads]
  )

  // ============================================
  // SHARED CONTACTS OPERATIONS
  // ============================================

  const updateSharedContactLocal = useCallback(
    (sharedContactId: string, updates: { localDisplayName?: string; localRelationship?: string }) => {
      setSharedContacts((prev) =>
        prev.map((sc) =>
          sc.id === sharedContactId ? { ...sc, ...updates } : sc
        )
      )

      // Persist to localStorage
      const localEdits = JSON.parse(localStorage.getItem(SHARED_CONTACTS_KEY) || "{}")
      localEdits[sharedContactId] = {
        ...localEdits[sharedContactId],
        ...updates,
      }
      localStorage.setItem(SHARED_CONTACTS_KEY, JSON.stringify(localEdits))
    },
    []
  )

  const addSharedContactToMyContacts = useCallback(
    async (sharedContact: SharedContact) => {
      // Create a new contact from the shared contact info
      const newContact = await addContact({
        contactName: sharedContact.localDisplayName || sharedContact.ownerDisplayName || sharedContact.ownerEmail.split("@")[0],
        relationship: sharedContact.localRelationship || "Listed me as contact",
        email: sharedContact.ownerEmail,
        phonePrimary: sharedContact.ownerPhone || undefined,
        address: sharedContact.address || undefined,
        role: "other",
        isEmergencyContact: false,
        isPoaHolder: false,
        canAccessAccounts: false,
        priority: 0,
      })

      if (newContact) {
        // Mark as added in shared contacts
        setSharedContacts((prev) =>
          prev.map((sc) =>
            sc.id === sharedContact.id ? { ...sc, addedToContacts: true } : sc
          )
        )

        // Persist to localStorage
        const localEdits = JSON.parse(localStorage.getItem(SHARED_CONTACTS_KEY) || "{}")
        localEdits[sharedContact.id] = {
          ...localEdits[sharedContact.id],
          addedToContacts: true,
        }
        localStorage.setItem(SHARED_CONTACTS_KEY, JSON.stringify(localEdits))
      }

      return newContact
    },
    [addContact]
  )

  const addNonContactToMyContacts = useCallback(
    async (name: string, email: string) => {
      const newContact = await addContact({
        contactName: name,
        relationship: "In a message thread with me",
        email: email,
        role: "other",
        isEmergencyContact: false,
        isPoaHolder: false,
        canAccessAccounts: false,
        priority: 0,
      })
      return newContact
    },
    [addContact]
  )

  const refreshSharedContacts = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const supabase = createClient()

      if (currentUser) {
        const { data: sharedData, error: sharedError } = await supabase
          .from("emergency_contacts")
          .select(`*, profile:profiles(display_name, email, id, phone)`)
          .eq("email", currentUser.email)
          .order("updated_at", { ascending: true })

        if (!sharedError && sharedData) {
          // Load local edits from localStorage
          const localEdits = JSON.parse(localStorage.getItem(SHARED_CONTACTS_KEY) || "{}")
          const localShared: SharedContact[] = sharedData.map((s: any) => ({
            id: s.id,
            ownerId: s.profile.id,
            ownerDisplayName: s.profile.display_name || undefined,
            ownerEmail: s.profile.email,
            ownerPhone: s.profile.phone,
            contactName: s.name,
            relationship: s.relationship || undefined,
            phone: s.phone || undefined,
            contactEmail: s.email || undefined,
            address: s.address || undefined,
            role: s.role || undefined,
            hasPoa: s.has_poa || false,
            poaType: s.poa_type || undefined,
            notes: s.notes || undefined,
            priority: s.priority || 0,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            // Apply local edits if any
            localDisplayName: localEdits[s.id]?.localDisplayName,
            localRelationship: localEdits[s.id]?.localRelationship,
            addedToContacts: localEdits[s.id]?.addedToContacts || false,
          }))

          setSharedContacts(localShared)
        }
      }
    } catch (error) {
      console.error("Error refreshing shared contacts:", error)
    }
  }, [isAuthenticated, currentUser])

  // ============================================
  // PRIORITY MANAGEMENT FOR EMERGENCY CONTACTS
  // ============================================

  const reorderEmergencyPriorities = useCallback(async (contactList: Contact[]) => {
    const emergencyContacts = contactList
      .filter(c => c.isEmergencyContact)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))

    const updates = emergencyContacts.map((contact, index) => {
      const newPriority = index + 1
      if (contact.priority !== newPriority) {
        return updateContact(contact.id, { priority: newPriority })
      }
    })

    await Promise.all(updates)
  }, [updateContact])

  const deleteContactWithPriorityShift = useCallback(
    async (id: string, email?: string) => {
      const contactToDelete = contacts.find(c => c.id === id)
      const wasEmergency = contactToDelete?.isEmergencyContact

      const updatedContacts = await deleteContact(id, email)

      if (wasEmergency) {
        reorderEmergencyPriorities(updatedContacts)
      }
    },
    [contacts, deleteContact, reorderEmergencyPriorities]
  )

  const respondToInvitation = useCallback(
    async (invitationId: string, status: InvitationStatus, responseMessage?: string) => {
      const now = new Date().toISOString()

      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            const { error } = await supabase
              .from("event_invitations")
              .update({
                status,
                response_message: responseMessage || null,
                responded_at: now,
              })
              .eq("id", invitationId)

            if (error) throw error
          }

          setSyncError(null)
        } catch (error) {
          console.error("Error responding to invitation:", error)
          setSyncError(error instanceof Error ? error.message : "Failed to respond")
        } finally {
          setIsSyncing(false)
        }
      }

      // Update local state regardless of auth
      setScheduledEvents((prev) =>
        prev.map((event) => ({
          ...event,
          invitations: event.invitations.map((inv) =>
            inv.id === invitationId
              ? {
                  ...inv,
                  status,
                  responseMessage,
                  respondedAt: now,
                }
              : inv
          ),
        }))
      )
    },
    [isAuthenticated]
  )

  // ============================================
  // PDF EXPORT
  // ============================================

  const exportToPDF = useCallback(async () => {
    if (contacts.length === 0) return

    const emergencyContacts = contacts.filter((c) => c.isEmergencyContact)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    const poaHolders = contacts.filter((c) => c.isPoaHolder)
    const otherContacts = contacts.filter((c) => !c.isEmergencyContact && !c.isPoaHolder)

    // Generate PDF content as HTML for printing
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Emergency Contacts</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
    h2 { color: #4f46e5; margin-top: 30px; }
    .contact { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .contact-name { font-size: 18px; font-weight: bold; color: #1a1a1a; }
    .contact-relationship { color: #64748b; font-size: 14px; }
    .contact-info { margin-top: 12px; }
    .contact-info div { margin-bottom: 6px; font-size: 14px; }
    .contact-info strong { color: #475569; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 8px; }
    .badge-emergency { background: #fee2e2; color: #dc2626; }
    .badge-poa { background: #e0e7ff; color: #4f46e5; }
    .badge-accounts { background: #f1f5f9; color: #475569; }
    .priority { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
    .notes { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; }
    .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Emergency Contact Network</h1>
  <p style="color: #64748b;">Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
  
  ${emergencyContacts.length > 0 ? `
  <h2>🚨 Emergency Contacts</h2>
  ${emergencyContacts.map((c, i) => `
    <div class="contact">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <div class="contact-name">${c.contactName}</div>
          ${c.relationship ? `<div class="contact-relationship">${c.relationship}</div>` : ""}
        </div>
        <span class="priority">Priority #${i + 1}</span>
      </div>
      <div style="margin-top: 8px;">
        <span class="badge badge-emergency">Emergency Contact</span>
        ${c.isPoaHolder ? '<span class="badge badge-poa">POA Holder</span>' : ""}
        ${c.canAccessAccounts ? '<span class="badge badge-accounts">Account Access</span>' : ""}
      </div>
      <div class="contact-info">
        ${c.phonePrimary ? `<div><strong>Phone:</strong> ${c.phonePrimary}${c.phoneSecondary ? ` / ${c.phoneSecondary}` : ""}</div>` : ""}
        ${c.email ? `<div><strong>Email:</strong> ${c.email}</div>` : ""}
        ${c.address ? `<div><strong>Address:</strong> ${c.address}</div>` : ""}
      </div>
      ${c.notes ? `<div class="notes"><strong>Notes:</strong> ${c.notes}</div>` : ""}
    </div>
  `).join("")}
  ` : ""}
  
  ${poaHolders.filter(c => !c.isEmergencyContact).length > 0 ? `
  <h2>🛡️ Power of Attorney Holders</h2>
  ${poaHolders.filter(c => !c.isEmergencyContact).map(c => `
    <div class="contact">
      <div class="contact-name">${c.contactName}</div>
      ${c.relationship ? `<div class="contact-relationship">${c.relationship}</div>` : ""}
      <div style="margin-top: 8px;">
        <span class="badge badge-poa">POA Holder</span>
        ${c.canAccessAccounts ? '<span class="badge badge-accounts">Account Access</span>' : ""}
      </div>
      <div class="contact-info">
        ${c.phonePrimary ? `<div><strong>Phone:</strong> ${c.phonePrimary}${c.phoneSecondary ? ` / ${c.phoneSecondary}` : ""}</div>` : ""}
        ${c.email ? `<div><strong>Email:</strong> ${c.email}</div>` : ""}
        ${c.address ? `<div><strong>Address:</strong> ${c.address}</div>` : ""}
      </div>
      ${c.notes ? `<div class="notes"><strong>Notes:</strong> ${c.notes}</div>` : ""}
    </div>
  `).join("")}
  ` : ""}
  
  ${otherContacts.length > 0 ? `
  <h2>👥 Other Contacts</h2>
  ${otherContacts.map(c => `
    <div class="contact">
      <div class="contact-name">${c.contactName}</div>
      ${c.relationship ? `<div class="contact-relationship">${c.relationship}</div>` : ""}
      ${c.canAccessAccounts ? '<div style="margin-top: 8px;"><span class="badge badge-accounts">Account Access</span></div>' : ""}
      <div class="contact-info">
        ${c.phonePrimary ? `<div><strong>Phone:</strong> ${c.phonePrimary}${c.phoneSecondary ? ` / ${c.phoneSecondary}` : ""}</div>` : ""}
        ${c.email ? `<div><strong>Email:</strong> ${c.email}</div>` : ""}
        ${c.address ? `<div><strong>Address:</strong> ${c.address}</div>` : ""}
      </div>
      ${c.notes ? `<div class="notes"><strong>Notes:</strong> ${c.notes}</div>` : ""}
    </div>
  `).join("")}
  ` : ""}
  
  <div class="footer">
    <p>This document contains sensitive personal information. Keep it secure.</p>
  </div>
</body>
</html>
`

    // Open print dialog
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }, [contacts])

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    contacts,
    sharedContacts,
    communicationLog,
    scheduledEvents,
    messageThreads,
    currentUser,
    
    // State
    isLoaded,
    isAuthenticated,
    isSyncing,
    syncError,
    
    // Contact operations
    addContact,
    updateContact,
    deleteContact: deleteContactWithPriorityShift,
    
    // Shared contacts operations
    updateSharedContactLocal,
    addSharedContactToMyContacts,
    addNonContactToMyContacts,
    refreshSharedContacts,
    
    // Communication log operations
    addCommunication,
    updateCommunication,
    deleteCommunication,
    
    // Event operations
    createEvent,
    updateEvent,
    deleteEvent,
    addEventInvitee,
    completeRecurringEvent,
    
    // Message operations
    createThread,
    sendMessage,
    markThreadAsRead,
    toggleThreadStar,
    deleteThread,
    editMessage,
    deleteMessage,
    
    // Helpers
    getEmergencyContacts,
    getPoaHolders,
    getRecentCommunications,
    getContactCommunications,
    getUpcomingEvents,
    getContactThreads,
    getUnreadCount,
    reorderEmergencyPriorities,
    respondToInvitation,
    exportToPDF,
    refreshData: loadAllData,
  }
}