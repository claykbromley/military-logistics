"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { MILITARY_BRANCHES, MILITARY_STATUS, PAYGRADES, PrivacyLevel, ConnectionStatus } from "@/lib/types"
import {
  Mail, Phone, MapPin, Shield, ChevronLeft,
  Loader2, Award, Briefcase, Calendar,
  MessageSquare, CheckCircle2, AlertCircle,
  Share2, Flag, Copy, Lock, EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ConnectionsProvider, useConnections } from "@/hooks/use-connections"
import { ConnectionActionButton, PrivateProfileGate } from "@/components/command-center/connection-components"

interface PublicProfile {
  id: string
  display_name: string
  email: string
  phone: string
  military_branch: string
  service_status: string
  paygrade: string
  zip_code: string
  bio?: string
  duty_station?: string
  mos?: string
  years_of_service?: number
  avatar_url?: string
  banner_url?: string
  created_at?: string
  privacy_level?: PrivacyLevel
  privacy_show_email?: boolean
  privacy_show_phone?: boolean
  privacy_show_duty_station?: boolean
  privacy_show_bio?: boolean
  privacy_show_mos?: boolean
}

export default function PublicProfilePage() {
  return (
    <ConnectionsProvider>
      <PublicProfilePageContent />
    </ConnectionsProvider>
  )
}

function PublicProfilePageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const profileId = params?.id as string

  const {
    canViewProfile,
    canSendMessage: canSendMessageCheck,
    isConnected,
    getConnectionStatus,
    incomingRequests,
    outgoingRequests,
    isLoaded: connectionsLoaded,
  } = useConnections()

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("none")
  const [requestId, setRequestId] = useState<string | undefined>()

  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [messageError, setMessageError] = useState<string | null>(null)

  const [copied, setCopied] = useState(false)

  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const isOwnProfile = user?.id === profileId

  // ── Fetch profile ──────────────────────────────────────────
  useEffect(() => {
    if (!profileId) return
    async function fetchPublicProfile() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single()
      if (error || !data) { setNotFound(true) } else { setProfile(data as PublicProfile) }
      setLoading(false)
    }
    fetchPublicProfile()
  }, [profileId])

  // ── Resolve connection status ──────────────────────────────
  useEffect(() => {
    if (!connectionsLoaded || !profileId || isOwnProfile) return
    const status = getConnectionStatus(profileId)
    setConnectionStatus(status)
    if (status === "pending_sent") {
      const req = outgoingRequests.find((r) => r.recipientId === profileId)
      setRequestId(req?.id)
    } else if (status === "pending_received") {
      const req = incomingRequests.find((r) => r.senderId === profileId)
      setRequestId(req?.id)
    } else {
      setRequestId(undefined)
    }
  }, [connectionsLoaded, profileId, isOwnProfile, getConnectionStatus, incomingRequests, outgoingRequests])

  const handleRefreshStatus = () => {
    const status = getConnectionStatus(profileId)
    setConnectionStatus(status)
    if (status === "pending_sent") {
      setRequestId(outgoingRequests.find((r) => r.recipientId === profileId)?.id)
    } else if (status === "pending_received") {
      setRequestId(incomingRequests.find((r) => r.senderId === profileId)?.id)
    } else {
      setRequestId(undefined)
    }
  }

  // ── Send Message (uses message_threads + messages tables) ──
  const handleSendMessage = async () => {
    if (!user || !profile) return
    if (!messageText.trim()) {
      setMessageError("Please enter a message")
      return
    }

    setSendingMessage(true)
    setMessageError(null)

    try {
      const supabase = createClient()
      const now = new Date().toISOString()

      // 1. Check for existing thread between these two users
      const { data: existingThreads } = await supabase
        .from("message_threads")
        .select("id")
        .or(
          `and(user_id.eq.${user.id},contact_email.eq.${profile.email}),and(contact_email.eq.${user.email},user_id.eq.${profileId})`
        )
        .limit(1)

      let threadId: string

      if (existingThreads && existingThreads.length > 0) {
        threadId = existingThreads[0].id
      } else {
        // 2. Create new thread
        const { data: newThread, error: threadError } = await supabase
          .from("message_threads")
          .insert({
            user_id: user.id,
            contact_email: profile.email,
            contact_name: profile.display_name,
            subject: null,
          })
          .select("id")
          .single()

        if (threadError) throw threadError
        threadId = newThread.id

        // Initialize read status for the sender
        await supabase
          .from("thread_read_status")
          .insert({
            thread_id: threadId,
            user_email: user.email,
            unread_count: 0,
            last_read_at: now,
          })
      }

      // 3. Insert the message
      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          thread_id: threadId,
          sender_type: "user",
          sender_id: user.id,
          sender_email: user.email,
          sender_name: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0],
          recipient_email: profile.email,
          content: messageText.trim(),
          content_type: "text",
          is_read: false,
        })

      if (msgError) throw msgError

      // 4. Update thread timestamp
      await supabase
        .from("message_threads")
        .update({ last_message_at: now })
        .eq("id", threadId)

      // 5. Keep sender's unread at 0
      await supabase
        .from("thread_read_status")
        .upsert({
          thread_id: threadId,
          user_email: user.email,
          unread_count: 0,
          last_read_at: now,
        }, {
          onConflict: "thread_id,user_email",
        })

      setMessageSent(true)
      setMessageText("")
    } catch (err) {
      setMessageError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  // ── Share ──────────────────────────────────────────────────
  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${profileId}`
    if (navigator.share) {
      try { await navigator.share({ title: `${profile?.display_name}'s Profile`, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // ── Report ─────────────────────────────────────────────────
  const handleReport = async () => {
    if (!reportReason.trim() || !user) return
    setReportSubmitting(true)
    try {
      const supabase = createClient()
      await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_id: profileId,
        reason: reportReason.trim(),
        created_at: new Date().toISOString(),
      })
      setReportSubmitted(true)
    } catch (err) { console.error(err) }
    finally { setReportSubmitting(false) }
  }

  // ── Loading / error states ─────────────────────────────────

  if (loading || !connectionsLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Profile...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div className="bg-card border border-border rounded-xl p-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Profile Not Found</h2>
            <p className="text-sm text-muted-foreground mb-6">This profile doesn&apos;t exist or may have been removed.</p>
            <Button variant="outline" className="cursor-pointer" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-1" />Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!profile) return null

  // ── Privacy gate ───────────────────────────────────────────
  const ownerPrivacy = profile.privacy_level || "public"
  const hasAccess = isOwnProfile || canViewProfile(profileId, ownerPrivacy)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <PrivateProfileGate
          profileId={profileId}
          profileName={profile.display_name}
          profileAvatar={profile.avatar_url}
          profileBranch={profile.military_branch}
          privacyLevel={ownerPrivacy}
          connectionStatus={connectionStatus}
          requestId={requestId}
          onStatusChange={handleRefreshStatus}
        />
        <Footer />
      </div>
    )
  }

  // ── Field visibility ───────────────────────────────────────
  const isFullAccess = isOwnProfile || isConnected(profileId) || ownerPrivacy === "public"
  const showEmail = isFullAccess || (profile.privacy_show_email ?? true)
  const showPhone = isFullAccess || (profile.privacy_show_phone ?? false)
  const showBio = isFullAccess || (profile.privacy_show_bio ?? true)
  const showDutyStation = isFullAccess || (profile.privacy_show_duty_station ?? true)
  const showMos = isFullAccess || (profile.privacy_show_mos ?? true)
  const allowMessage = isOwnProfile ? false : canSendMessageCheck(profileId, ownerPrivacy)

  // ── Derived labels ─────────────────────────────────────────
  const initials = (profile.display_name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const branchLabel = MILITARY_BRANCHES.find((b) => b.value === profile.military_branch)?.label
  const statusLabel = MILITARY_STATUS.find((s) => s.value === profile.service_status)?.label
  const paygradeLabel = PAYGRADES.find((p) => p.value === profile.paygrade)?.label

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header Card */}
        <div className="bg-background border border-border rounded-xl overflow-hidden mb-6">
          <div className="h-36 sm:h-44 relative">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="Profile banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
            )}
          </div>

          <div className="px-6 pb-6 -mt-9 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} className="h-24 w-24 rounded-2xl border-4 border-background object-cover shadow-lg" />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-primary border-4 border-background flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">{initials}</div>
                )}
              </div>

              <div className="flex-1 sm:pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{profile.display_name || "Service Member"}</h1>
                  {ownerPrivacy !== "public" && !isOwnProfile && (
                    <span className="text-muted-foreground" title={ownerPrivacy === "private" ? "Private profile" : "Connections only"}>
                      {ownerPrivacy === "private" ? <Lock className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  {branchLabel && <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" />{branchLabel}</span>}
                  {paygradeLabel && <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{paygradeLabel}</span>}
                  {statusLabel && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{statusLabel}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-2 flex-wrap">
                  <ConnectionActionButton
                    profileId={profileId}
                    profileName={profile.display_name}
                    profilePrivacyLevel={ownerPrivacy}
                    connectionStatus={connectionStatus}
                    requestId={requestId}
                    onStatusChange={handleRefreshStatus}
                  />
                  {allowMessage ? (
                    <Button size="sm" className="cursor-pointer" onClick={() => {
                      if (!user) { router.push("/login"); return }
                      setMessageText(""); setMessageSent(false); setMessageError(null)
                      setShowMessageDialog(true)
                    }}>
                      <MessageSquare className="h-4 w-4 mr-1" />Send Message
                    </Button>
                  ) : ownerPrivacy !== "public" && connectionStatus !== "connected" ? (
                    <Button size="sm" variant="outline" disabled className="opacity-50">
                      <Lock className="h-4 w-4 mr-1" />Message
                    </Button>
                  ) : null}
                </div>
              )}

              {isOwnProfile && (
                <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => router.push("/profile")}>Edit Profile</Button>
              )}
            </div>
          </div>
        </div>

        {/* Limited access notice */}
        {!isFullAccess && !isOwnProfile && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <EyeOff className="h-4 w-4 shrink-0" />
            You&apos;re viewing a limited profile. Connect with {profile.display_name} to see their full details.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-background border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                {showEmail ? (
                  <div className="flex items-center gap-3 text-muted-foreground"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{profile.email}</span></div>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground/50"><Mail className="h-4 w-4 shrink-0" /><span className="italic">Hidden</span></div>
                )}
                {showPhone && profile.phone ? (
                  <div className="flex items-center gap-3 text-muted-foreground"><Phone className="h-4 w-4 shrink-0" /><span>{profile.phone}</span></div>
                ) : !showPhone ? (
                  <div className="flex items-center gap-3 text-muted-foreground/50"><Phone className="h-4 w-4 shrink-0" /><span className="italic">Hidden</span></div>
                ) : null}
                {profile.zip_code && (
                  <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" /><span>{profile.zip_code}</span></div>
                )}
              </div>
            </div>

            <div className="bg-background border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Service Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Branch</span><span className="font-medium text-foreground">{branchLabel || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-foreground">{statusLabel || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Paygrade</span><span className="font-medium text-foreground">{paygradeLabel || "—"}</span></div>
                {showMos && profile.mos && <div className="flex justify-between"><span className="text-muted-foreground">MOS/Rate</span><span className="font-medium text-foreground">{profile.mos}</span></div>}
                {showDutyStation && profile.duty_station && <div className="flex justify-between"><span className="text-muted-foreground">Duty Station</span><span className="font-medium text-foreground">{profile.duty_station}</span></div>}
                {isFullAccess && profile.years_of_service != null && <div className="flex justify-between"><span className="text-muted-foreground">Years of Service</span><span className="font-medium text-foreground">{profile.years_of_service}</span></div>}
              </div>
            </div>

            <div className="bg-background border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
              <div className="space-y-1">
                <button onClick={handleShare} className="flex items-center justify-between w-full px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer">
                  <span className="flex items-center gap-2">
                    {copied ? <Copy className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                    {copied ? "Link Copied!" : "Share Profile"}
                  </span>
                </button>
                {!isOwnProfile && user && (
                  <button onClick={() => { setReportReason(""); setReportSubmitted(false); setShowReportDialog(true) }}
                    className="flex items-center gap-2 w-full px-2 py-2 text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer">
                    <Flag className="h-3.5 w-3.5" />Report Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">About</h3>
              {showBio ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio || "This member hasn't added a bio yet."}</p>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">Bio is only visible to connections.</p>
              )}
            </div>

            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">Membership</h3>
              <div className="space-y-3 text-sm">
                {profile.created_at && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to {profile.display_name}</DialogTitle>
          </DialogHeader>
          {messageSent ? (
            <div className="py-4">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Message sent</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">Your message has been delivered to {profile.display_name}.</p>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" className="cursor-pointer" onClick={() => setShowMessageDialog(false)}>Close</Button>
                <Button className="cursor-pointer" onClick={() => { setMessageSent(false); setMessageText("") }}>Send Another</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.display_name} className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{initials}</div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{profile.display_name}</p>
                    {branchLabel && <p className="text-xs text-muted-foreground">{branchLabel}{paygradeLabel ? ` · ${paygradeLabel}` : ""}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message-text">Your Message</Label>
                  <Textarea id="message-text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Write your message..." rows={5} maxLength={2000} />
                  <p className="text-xs text-muted-foreground text-right">{messageText.length}/2000</p>
                </div>
                {messageError && (
                  <div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{messageError}</div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" className="cursor-pointer" onClick={() => setShowMessageDialog(false)}>Cancel</Button>
                <Button onClick={handleSendMessage} disabled={sendingMessage || !messageText.trim()} className="cursor-pointer">
                  {sendingMessage ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-1" />}
                  Send Message
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Report Profile</DialogTitle></DialogHeader>
          {reportSubmitted ? (
            <div className="py-4">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Report submitted</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">Our team will review this report.</p>
                </div>
              </div>
              <DialogFooter className="mt-4"><Button onClick={() => setShowReportDialog(false)}>Close</Button></DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">Please describe why you&apos;re reporting this profile.</p>
                <div className="space-y-2">
                  <Label htmlFor="report-reason">Reason</Label>
                  <Textarea id="report-reason" value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe the issue..." rows={4} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="cursor-pointer" onClick={() => setShowReportDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleReport} disabled={reportSubmitting || !reportReason.trim()} className="cursor-pointer">
                  {reportSubmitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Flag className="h-4 w-4 mr-1" />}
                  Submit Report
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}