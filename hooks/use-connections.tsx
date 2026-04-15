"use client"

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  ConnectionStatus,
  ConnectionRequest,
  ProfilePrivacySettings,
  PrivacyLevel,
  DEFAULT_PRIVACY_SETTINGS,
} from "@/lib/types"

interface ConnectionsContextValue {
  privacySettings: ProfilePrivacySettings
  updatePrivacySettings: (updates: Partial<ProfilePrivacySettings>) => Promise<void>
  savingPrivacy: boolean

  getConnectionStatus: (otherUserId: string) => ConnectionStatus
  isConnected: (otherUserId: string) => boolean
  getRequestForUser: (otherUserId: string) => { requestId: string; direction: "incoming" | "outgoing" } | null

  sendConnectionRequest: (recipientId: string, message?: string) => Promise<void>
  acceptConnectionRequest: (requestId: string) => Promise<void>
  declineConnectionRequest: (requestId: string) => Promise<void>
  cancelConnectionRequest: (requestId: string) => Promise<void>
  removeConnection: (otherUserId: string) => Promise<void>
  blockUser: (otherUserId: string) => Promise<void>
  unblockUser: (otherUserId: string) => Promise<void>

  canMessageUser: (recipientId: string) => Promise<{ allowed: boolean; reason?: string }>
  resolveProfileIdFromEmail: (email: string) => Promise<string | null>

  incomingRequests: ConnectionRequest[]
  outgoingRequests: ConnectionRequest[]
  connections: string[]
  blockedUsers: string[]
  currentUserId: string | null

  isLoaded: boolean
  isSyncing: boolean

  canViewProfile: (profileOwnerId: string, ownerPrivacyLevel: PrivacyLevel) => boolean
  canSendMessage: (profileOwnerId: string, ownerPrivacyLevel: PrivacyLevel) => boolean
  refreshConnections: () => Promise<void>
}

const ConnectionsContext = createContext<ConnectionsContextValue | null>(null)

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const value = useConnectionsInternal()
  return <ConnectionsContext.Provider value={value}>{children}</ConnectionsContext.Provider>
}

export function useConnections() {
  const ctx = useContext(ConnectionsContext)
  if (!ctx) throw new Error("useConnections must be used within ConnectionsProvider")
  return ctx
}

function useConnectionsInternal(): ConnectionsContextValue {
  const [privacySettings, setPrivacySettings] = useState<ProfilePrivacySettings>(DEFAULT_PRIVACY_SETTINGS)
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([])
  const [connections, setConnections] = useState<string[]>([])
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // ── Load ───────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setCurrentUserId(null)
      setConnections([])
      setIncomingRequests([])
      setOutgoingRequests([])
      setBlockedUsers([])
      setIsLoaded(true)
      return
    }

    setCurrentUserId(user.id)

    try {
      // Privacy settings
      const { data: prof } = await supabase
        .from("profiles")
        .select("privacy")
        .eq("id", user.id)
        .single()

      if (prof) {
        const parsed = JSON.parse(prof.privacy)
        setPrivacySettings({
          privacyLevel: parsed.privacy_level || "public",
          showEmail: parsed.privacy_show_email ?? true,
          showPhone: parsed.privacy_show_phone ?? false,
          showDutyStation: parsed.privacy_show_duty_station ?? true,
          showBio: parsed.privacy_show_bio ?? true,
          showInSearch: parsed.privacy_show_in_search ?? true,
          showMos: parsed.privacy_show_mos ?? true,
        })
      }

      // Accepted connections
      const { data: connData } = await supabase
        .from("connections")
        .select("user_id, connected_user_id")
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq("status", "accepted")

      setConnections(
        (connData || []).map((c) =>
          c.user_id === user.id ? c.connected_user_id : c.user_id
        )
      )

      // Incoming pending — join sender profile via FK name
      const { data: incData, error: incError } = await supabase
        .from("connections")
        .select(`
          id, user_id, message, status, created_at,
          sender:profiles!connections_user_id_fkey(
            id, display_name, email, avatar_url, military_branch, paygrade
          )
        `)
        .eq("connected_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (incError) {
        console.error("Error loading incoming requests:", incError)
      }

      setIncomingRequests(
        (incData || []).map((r: any) => ({
          id: r.id,
          senderId: r.user_id,
          senderName: r.sender?.display_name || "Unknown",
          senderEmail: r.sender?.email || "",
          senderAvatar: r.sender?.avatar_url || undefined,
          senderBranch: r.sender?.military_branch || undefined,
          senderPaygrade: r.sender?.paygrade || undefined,
          recipientId: user.id,
          message: r.message || undefined,
          status: r.status,
          createdAt: r.created_at,
        }))
      )

      // Outgoing pending — join recipient profile via FK name
      const { data: outData, error: outError } = await supabase
        .from("connections")
        .select(`
          id, connected_user_id, message, status, created_at,
          recipient:profiles!connections_connected_user_id_fkey(
            id, display_name, email
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (outError) {
        console.error("Error loading outgoing requests:", outError)
      }

      setOutgoingRequests(
        (outData || []).map((r: any) => ({
          id: r.id,
          senderId: user.id,
          senderName: "",
          senderEmail: user.email || "",
          recipientId: r.connected_user_id,
          recipientName: r.recipient?.display_name || undefined,
          recipientEmail: r.recipient?.email || undefined,
          message: r.message || undefined,
          status: r.status,
          createdAt: r.created_at,
        }))
      )

      // Blocked
      const { data: blkData } = await supabase
        .from("connections")
        .select("connected_user_id")
        .eq("user_id", user.id)
        .eq("status", "blocked")

      setBlockedUsers((blkData || []).map((b) => b.connected_user_id))
    } catch (err) {
      console.error("Error loading connections:", err)
    }

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    loadAll()
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") loadAll()
    })
    return () => subscription.unsubscribe()
  }, [loadAll])

  // Realtime
  useEffect(() => {
    if (!currentUserId) return
    const supabase = createClient()
    const ch = supabase
      .channel("connections-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "connections", filter: `connected_user_id=eq.${currentUserId}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "connections", filter: `user_id=eq.${currentUserId}` }, () => loadAll())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [currentUserId, loadAll])

  // ── Privacy ────────────────────────────────────────────────

  const updatePrivacySettings = useCallback(async (updates: Partial<ProfilePrivacySettings>) => {
    if (!currentUserId) return
    const prev = privacySettings
    const merged = { ...prev, ...updates }
    setPrivacySettings(merged)
    setSavingPrivacy(true)
    try {
      const supabase = createClient()

      // Write the full merged state so unchanged fields are preserved
      const privacy = JSON.stringify({
        privacy_level: merged.privacyLevel,
        privacy_show_email: merged.showEmail,
        privacy_show_phone: merged.showPhone,
        privacy_show_duty_station: merged.showDutyStation,
        privacy_show_bio: merged.showBio,
        privacy_show_in_search: merged.showInSearch,
        privacy_show_mos: merged.showMos,
      })

      const { error } = await supabase.from("profiles").update({ privacy }).eq("id", currentUserId)
      if (error) throw error
    } catch {
      setPrivacySettings(prev)
    } finally {
      setSavingPrivacy(false)
    }
  }, [currentUserId, privacySettings])

  // ── Status (synchronous) ───────────────────────────────────

  const getConnectionStatus = useCallback((otherUserId: string): ConnectionStatus => {
    if (!currentUserId) return "none"
    if (!otherUserId) return "none"
    if (currentUserId === otherUserId) return "connected"
    if (connections.includes(otherUserId)) return "connected"
    if (blockedUsers.includes(otherUserId)) return "blocked"
    if (outgoingRequests.some((r) => r.recipientId === otherUserId)) return "pending_sent"
    if (incomingRequests.some((r) => r.senderId === otherUserId)) return "pending_received"
    return "none"
  }, [currentUserId, connections, blockedUsers, outgoingRequests, incomingRequests])

  const isConnected = useCallback((id: string) => connections.includes(id), [connections])

  const getRequestForUser = useCallback((id: string) => {
    const o = outgoingRequests.find((r) => r.recipientId === id)
    if (o) return { requestId: o.id, direction: "outgoing" as const }
    const i = incomingRequests.find((r) => r.senderId === id)
    if (i) return { requestId: i.id, direction: "incoming" as const }
    return null
  }, [outgoingRequests, incomingRequests])

  // ── Send connection request ────────────────────────────────

  const sendConnectionRequest = useCallback(async (recipientId: string, message?: string) => {
    if (!currentUserId) return
    if (getConnectionStatus(recipientId) !== "none") return

    setIsSyncing(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("connections")
        .insert({ user_id: currentUserId, connected_user_id: recipientId, status: "pending", message: message || null })
        .select("id, created_at")
        .single()
      if (error) throw error

      const { data: rp } = await supabase.from("profiles").select("display_name, email").eq("id", recipientId).single()

      setOutgoingRequests((prev) => [{
        id: data.id, senderId: currentUserId, senderName: "", senderEmail: "",
        recipientId, recipientName: rp?.display_name, recipientEmail: rp?.email,
        message, status: "pending" as const, createdAt: data.created_at,
      }, ...prev])
    } catch (err) {
      console.error("Error sending connection request:", err)
      throw err
    } finally {
      setIsSyncing(false)
    }
  }, [currentUserId, getConnectionStatus])

  // ── Accept ─────────────────────────────────────────────────
  // 1. Marks connection accepted
  // 2. Auto-creates emergency_contacts row linked to sender

  const acceptConnectionRequest = useCallback(async (requestId: string) => {
    if (!currentUserId) return
    const request = incomingRequests.find((r) => r.id === requestId)
    if (!request) return

    setIsSyncing(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", requestId)
      if (error) throw error

      // Auto-add to emergency_contacts if not already linked
      const { data: existing } = await supabase
        .from("emergency_contacts")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("linked_profile_id", request.senderId)
        .maybeSingle()

      if (!existing) {
        await supabase.from("emergency_contacts").insert({
          user_id: currentUserId,
          name: request.senderName,
          email: request.senderEmail || null,
          linked_profile_id: request.senderId,
          role: "other",
          has_poa: false,
          can_access_accounts: false,
          priority: 0,
          relationship: "Connection",
        })
      }

      setConnections((prev) => [...prev, request.senderId])
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch (err) {
      console.error("Error accepting request:", err)
    } finally {
      setIsSyncing(false)
    }
  }, [currentUserId, incomingRequests])

  // ── Decline ────────────────────────────────────────────────

  const declineConnectionRequest = useCallback(async (requestId: string) => {
    if (!currentUserId) return
    setIsSyncing(true)
    try {
      const supabase = createClient()
      await supabase.from("connections")
        .update({ status: "declined", responded_at: new Date().toISOString() })
        .eq("id", requestId)
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch (err) { console.error(err) }
    finally { setIsSyncing(false) }
  }, [currentUserId])

  // ── Cancel outgoing ────────────────────────────────────────

  const cancelConnectionRequest = useCallback(async (requestId: string) => {
    if (!currentUserId) return
    setIsSyncing(true)
    try {
      const supabase = createClient()
      await supabase.from("connections").delete().eq("id", requestId).eq("user_id", currentUserId)
      setOutgoingRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch (err) { console.error(err) }
    finally { setIsSyncing(false) }
  }, [currentUserId])

  // ── Remove connection ──────────────────────────────────────

  const removeConnection = useCallback(async (otherUserId: string) => {
    if (!currentUserId) return
    setIsSyncing(true)
    try {
      const supabase = createClient()
      await supabase.from("connections").delete()
        .or(`and(user_id.eq.${currentUserId},connected_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},connected_user_id.eq.${currentUserId})`)
        .eq("status", "accepted")
      setConnections((prev) => prev.filter((id) => id !== otherUserId))
    } catch (err) { console.error(err) }
    finally { setIsSyncing(false) }
  }, [currentUserId])

  // ── Block / Unblock ────────────────────────────────────────

  const blockUser = useCallback(async (otherUserId: string) => {
    if (!currentUserId) return
    setIsSyncing(true)
    try {
      const supabase = createClient()
      await supabase.from("connections").delete()
        .or(`and(user_id.eq.${currentUserId},connected_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},connected_user_id.eq.${currentUserId})`)
      await supabase.from("connections").insert({ user_id: currentUserId, connected_user_id: otherUserId, status: "blocked" })
      setConnections((prev) => prev.filter((id) => id !== otherUserId))
      setIncomingRequests((prev) => prev.filter((r) => r.senderId !== otherUserId))
      setOutgoingRequests((prev) => prev.filter((r) => r.recipientId !== otherUserId))
      setBlockedUsers((prev) => [...prev, otherUserId])
    } catch (err) { console.error(err) }
    finally { setIsSyncing(false) }
  }, [currentUserId])

  const unblockUser = useCallback(async (otherUserId: string) => {
    if (!currentUserId) return
    setIsSyncing(true)
    try {
      const supabase = createClient()
      await supabase.from("connections").delete()
        .eq("user_id", currentUserId).eq("connected_user_id", otherUserId).eq("status", "blocked")
      setBlockedUsers((prev) => prev.filter((id) => id !== otherUserId))
    } catch (err) { console.error(err) }
    finally { setIsSyncing(false) }
  }, [currentUserId])

  // ── Privacy-aware message check ────────────────────────────

  const canMessageUser = useCallback(async (recipientId: string): Promise<{ allowed: boolean; reason?: string }> => {
    if (!currentUserId) return { allowed: false, reason: "Not logged in" }
    if (currentUserId === recipientId) return { allowed: false, reason: "Cannot message yourself" }
    if (blockedUsers.includes(recipientId)) return { allowed: false, reason: "User is blocked" }
    if (connections.includes(recipientId)) return { allowed: true }

    const supabase = createClient()
    const { data } = await supabase.from("profiles").select("privacy_level").eq("id", recipientId).single()
    const privacy = data?.privacy_level || "public"
    if (privacy === "public") return { allowed: true }
    return {
      allowed: false,
      reason: `This user's profile is ${privacy === "private" ? "private" : "connections-only"}. Connect with them first to send a message.`,
    }
  }, [currentUserId, connections, blockedUsers])

  // ── Resolve profile from email ─────────────────────────────
  // Returns null silently for non-platform emails — this is NOT an error.

  const resolveProfileIdFromEmail = useCallback(async (email: string): Promise<string | null> => {
    if (!email) return null
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle()
      return data?.id || null
    } catch {
      return null
    }
  }, [])

  // ── Synchronous permission helpers ─────────────────────────

  const canViewProfile = useCallback((ownerId: string, privacy: PrivacyLevel): boolean => {
    if (!currentUserId) return privacy === "public"
    if (currentUserId === ownerId) return true
    if (privacy === "public") return true
    if (privacy === "connections_only") return connections.includes(ownerId)
    return false
  }, [currentUserId, connections])

  const canSendMessage = useCallback((ownerId: string, privacy: PrivacyLevel): boolean => {
    if (!currentUserId || currentUserId === ownerId) return false
    if (blockedUsers.includes(ownerId)) return false
    if (privacy === "public") return true
    return connections.includes(ownerId)
  }, [currentUserId, connections, blockedUsers])

  return {
    privacySettings, updatePrivacySettings, savingPrivacy,
    getConnectionStatus, isConnected, getRequestForUser,
    sendConnectionRequest, acceptConnectionRequest, declineConnectionRequest,
    cancelConnectionRequest, removeConnection, blockUser, unblockUser,
    canMessageUser, resolveProfileIdFromEmail,
    incomingRequests, outgoingRequests, connections, blockedUsers, currentUserId,
    isLoaded, isSyncing, canViewProfile, canSendMessage, refreshConnections: loadAll,
  }
}