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
import { sendNotification } from "@/lib/notifications"

interface ConnectionsContextValue {
  privacySettings: ProfilePrivacySettings
  updatePrivacySettings: (updates: Partial<ProfilePrivacySettings>) => Promise<void>
  savingPrivacy: boolean

  getConnectionStatus: (otherUserId: string) => ConnectionStatus
  isConnected: (otherUserId: string) => boolean
  isBlockedByMe: (otherUserId: string) => boolean
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
      const { data: prof } = await supabase
        .from("profiles")
        .select("privacy")
        .eq("id", user.id)
        .single()

      if (prof?.privacy) {
        try {
          const parsed = typeof prof.privacy === "string" ? JSON.parse(prof.privacy) : prof.privacy
          setPrivacySettings({
            privacyLevel: parsed.privacy_level || "public",
            showEmail: parsed.privacy_show_email ?? true,
            showPhone: parsed.privacy_show_phone ?? false,
            showDutyStation: parsed.privacy_show_duty_station ?? true,
            showBio: parsed.privacy_show_bio ?? true,
            showInSearch: parsed.privacy_show_in_search ?? true,
            showMos: parsed.privacy_show_mos ?? true,
          })
        } catch {}
      }

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

      const { data: incData } = await supabase
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

      const { data: outData } = await supabase
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

  // ── Realtime ──────────────────────────────────────────────
  // Two channels:
  // 1. postgres_changes — picks up direct DB changes when RLS allows SELECT
  // 2. broadcast — actors actively poke the other side to force a refresh.
  //    Needed because SECURITY DEFINER RPC writes can bypass the realtime
  //    replication filter, and also guarantees instant UI updates without
  //    waiting for DB replication latency.

  useEffect(() => {
    if (!currentUserId) return
    const supabase = createClient()

    const pgChannel = supabase
      .channel(`connections-pg-${currentUserId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "connections",
        filter: `connected_user_id=eq.${currentUserId}`,
      }, () => loadAll())
      .on("postgres_changes", {
        event: "*", schema: "public", table: "connections",
        filter: `user_id=eq.${currentUserId}`,
      }, () => loadAll())
      .subscribe()

    const broadcastChannel = supabase
      .channel(`connections-broadcast-${currentUserId}`, {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "connection-changed" }, () => {
        loadAll()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(pgChannel)
      supabase.removeChannel(broadcastChannel)
    }
  }, [currentUserId, loadAll])

  // Broadcast a connection-changed event to another user's channel.
  const notifyConnectionChange = useCallback(async (otherUserId: string) => {
    try {
      const supabase = createClient()
      const channel = supabase.channel(`connections-broadcast-${otherUserId}`)
      await new Promise<void>((resolve) => {
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") resolve()
        })
        setTimeout(resolve, 1000) // fallback so we don't hang forever
      })
      await channel.send({
        type: "broadcast",
        event: "connection-changed",
        payload: { from: currentUserId },
      })
      setTimeout(() => supabase.removeChannel(channel), 500)
    } catch (err) {
      console.error("Failed to broadcast connection change:", err)
    }
  }, [currentUserId])

  // ── Privacy ────────────────────────────────────────────────

  const updatePrivacySettings = useCallback(async (updates: Partial<ProfilePrivacySettings>) => {
    if (!currentUserId) return
    const prev = privacySettings
    const merged = { ...prev, ...updates }
    setPrivacySettings(merged)
    setSavingPrivacy(true)
    try {
      const supabase = createClient()
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

  // ── Status ─────────────────────────────────────────────────

  const getConnectionStatus = useCallback((otherUserId: string): ConnectionStatus => {
    if (!currentUserId) return "none"
    if (!otherUserId) return "none"
    if (currentUserId === otherUserId) return "connected"
    if (blockedUsers.includes(otherUserId)) return "blocked"
    if (connections.includes(otherUserId)) return "connected"
    if (outgoingRequests.some((r) => r.recipientId === otherUserId)) return "pending_sent"
    if (incomingRequests.some((r) => r.senderId === otherUserId)) return "pending_received"
    return "none"
  }, [currentUserId, connections, blockedUsers, outgoingRequests, incomingRequests])

  const isConnected = useCallback((id: string) => connections.includes(id), [connections])
  const isBlockedByMe = useCallback((id: string) => blockedUsers.includes(id), [blockedUsers])

  const getRequestForUser = useCallback((id: string) => {
    const o = outgoingRequests.find((r) => r.recipientId === id)
    if (o) return { requestId: o.id, direction: "outgoing" as const }
    const i = incomingRequests.find((r) => r.senderId === id)
    if (i) return { requestId: i.id, direction: "incoming" as const }
    return null
  }, [outgoingRequests, incomingRequests])

  const checkEitherSideBlocked = useCallback(async (otherUserId: string): Promise<boolean> => {
    if (!currentUserId) return false
    const supabase = createClient()
    const { data } = await supabase
      .from("connections")
      .select("id")
      .or(
        `and(user_id.eq.${currentUserId},connected_user_id.eq.${otherUserId}),` +
        `and(user_id.eq.${otherUserId},connected_user_id.eq.${currentUserId})`
      )
      .eq("status", "blocked")
      .limit(1)
    return !!(data && data.length > 0)
  }, [currentUserId])

  // ── Send connection request ────────────────────────────────

  const sendConnectionRequest = useCallback(async (recipientId: string, message?: string) => {
    if (!currentUserId) return
    if (currentUserId === recipientId) return
    if (getConnectionStatus(recipientId) !== "none") return

    setIsSyncing(true)
    try {
      const supabase = createClient()

      const isBlocked = await checkEitherSideBlocked(recipientId)
      if (isBlocked) return

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

      const { data: myProfile } = await supabase.from("profiles").select("display_name").eq("id", currentUserId).single()

      sendNotification({
        userId: recipientId,
        type: "connections",
        priority: "high",
        title: `Connection Request From ${myProfile?.display_name || "A user"}`,
        message: message ?? `You have a new connection request from ${myProfile?.display_name || "a user"}.`,
        actionUrl: "/services/command-center/contacts",
        actionLabel: "View Request",
      }).catch((err) => console.error("Request notification failed:", err))

      notifyConnectionChange(recipientId)
    } catch (err) {
      console.error("Error sending connection request:", err)
      throw err
    } finally {
      setIsSyncing(false)
    }
  }, [currentUserId, getConnectionStatus, checkEitherSideBlocked, notifyConnectionChange])

  // ── Accept ─────────────────────────────────────────────────

  const acceptConnectionRequest = useCallback(async (requestId: string) => {
    if (!currentUserId) return
    const request = incomingRequests.find((r) => r.id === requestId)
    if (!request) return

    setIsSyncing(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.rpc("accept_connection_request", {
        p_request_id: requestId,
      })
      if (error) throw error

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", currentUserId)
        .single()

      sendNotification({
        userId: request.senderId,
        type: "connections",
        priority: "medium",
        title: `New Connection With ${myProfile?.display_name || "a user"}`,
        message: `${myProfile?.display_name || "A user"} accepted your connection request. You are now mutual contacts.`,
        actionUrl: `/profile/${currentUserId}`,
        actionLabel: "View Profile",
      }).catch((err) => console.error("Accepted request notification failed:", err))

      // Optimistic local update
      setConnections((prev) =>
        prev.includes(request.senderId) ? prev : [...prev, request.senderId]
      )
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId))

      // Poke the other user to refresh — this is what makes the sender see
      // "Connected" without reloading the page.
      notifyConnectionChange(request.senderId)
    } catch (err) {
      console.error("Error accepting request:", err)
    } finally {
      setIsSyncing(false)
    }
  }, [currentUserId, incomingRequests, notifyConnectionChange])

  // ── Decline ────────────────────────────────────────────────

  const declineConnectionRequest = useCallback(async (requestId: string) => {
    if (!currentUserId) return
    const request = incomingRequests.find((r) => r.id === requestId)

    setIsSyncing(true)
    try {
      const supabase = createClient()
      await supabase.from("connections").delete().eq("id", requestId).eq("connected_user_id", currentUserId)
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId))

      if (request) notifyConnectionChange(request.senderId)
    } catch (err) { console.error(err) }
    finally { setIsSyncing(false) }
  }, [currentUserId, incomingRequests, notifyConnectionChange])

  // ── Cancel outgoing ────────────────────────────────────────

  const cancelConnectionRequest = useCallback(async (requestId: string) => {
    if (!currentUserId) return
    const request = outgoingRequests.find((r) => r.id === requestId)

    setIsSyncing(true)
    try {
      const supabase = createClient()
      await supabase.from("connections").delete().eq("id", requestId).eq("user_id", currentUserId)
      setOutgoingRequests((prev) => prev.filter((r) => r.id !== requestId))

      if (request) notifyConnectionChange(request.recipientId)
    } catch (err) { console.error(err) }
    finally { setIsSyncing(false) }
  }, [currentUserId, outgoingRequests, notifyConnectionChange])

  // ── Remove connection ──────────────────────────────────────

  const removeConnection = useCallback(async (otherUserId: string) => {
    if (!currentUserId) return
    setIsSyncing(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc("remove_connection", {
        p_other_user_id: otherUserId,
      })
      if (error) throw error

      setConnections((prev) => prev.filter((id) => id !== otherUserId))
      notifyConnectionChange(otherUserId)
    } catch (err) {
      console.error("Error removing connection:", err)
    } finally {
      setIsSyncing(false)
    }
  }, [currentUserId, notifyConnectionChange])

  // ── Block / Unblock ────────────────────────────────────────

  const blockUser = useCallback(async (otherUserId: string) => {
    if (!currentUserId) return
    if (currentUserId === otherUserId) return
    setIsSyncing(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc("block_user", {
        p_other_user_id: otherUserId,
      })
      if (error) throw error

      setConnections((prev) => prev.filter((id) => id !== otherUserId))
      setIncomingRequests((prev) => prev.filter((r) => r.senderId !== otherUserId))
      setOutgoingRequests((prev) => prev.filter((r) => r.recipientId !== otherUserId))
      setBlockedUsers((prev) => (prev.includes(otherUserId) ? prev : [...prev, otherUserId]))

      notifyConnectionChange(otherUserId)
    } catch (err) {
      console.error("Error blocking user:", err)
    } finally {
      setIsSyncing(false)
    }
  }, [currentUserId, notifyConnectionChange])

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
    if (blockedUsers.includes(recipientId)) return { allowed: false, reason: "You have blocked this user. Unblock them to send a message." }

    const eitherBlocked = await checkEitherSideBlocked(recipientId)
    if (eitherBlocked) return { allowed: false, reason: "You cannot send a message to this user." }

    if (connections.includes(recipientId)) return { allowed: true }

    const supabase = createClient()
    const { data } = await supabase.from("profiles").select("privacy").eq("id", recipientId).single()

    let privacy: PrivacyLevel = "public"
    if (data?.privacy) {
      try {
        const parsed = typeof data.privacy === "string" ? JSON.parse(data.privacy) : data.privacy
        privacy = parsed.privacy_level || "public"
      } catch {}
    }

    if (privacy === "public") return { allowed: true }
    return {
      allowed: false,
      reason: "This user's profile is limited to connections. Connect with them first to send a message.",
    }
  }, [currentUserId, connections, blockedUsers, checkEitherSideBlocked])

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

  const canViewProfile = useCallback((ownerId: string, privacy: PrivacyLevel): boolean => {
    if (!currentUserId) return privacy === "public"
    if (currentUserId === ownerId) return true
    if (blockedUsers.includes(ownerId)) return false
    if (privacy === "public") return true
    return connections.includes(ownerId)
  }, [currentUserId, connections, blockedUsers])

  const canSendMessage = useCallback((ownerId: string, privacy: PrivacyLevel): boolean => {
    if (!currentUserId || currentUserId === ownerId) return false
    if (blockedUsers.includes(ownerId)) return false
    if (privacy === "public") return true
    return connections.includes(ownerId)
  }, [currentUserId, connections, blockedUsers])

  return {
    privacySettings, updatePrivacySettings, savingPrivacy,
    getConnectionStatus, isConnected, isBlockedByMe, getRequestForUser,
    sendConnectionRequest, acceptConnectionRequest, declineConnectionRequest,
    cancelConnectionRequest, removeConnection, blockUser, unblockUser,
    canMessageUser, resolveProfileIdFromEmail,
    incomingRequests, outgoingRequests, connections, blockedUsers, currentUserId,
    isLoaded, isSyncing, canViewProfile, canSendMessage, refreshConnections: loadAll,
  }
}