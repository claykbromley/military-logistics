"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  UserPlus, UserCheck, Clock,
  Loader2, CheckCircle2, XCircle, Shield, ChevronDown,
  Ban, Link2Off, Send, Lock, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useConnections } from "@/hooks/use-connections"
import { PrivacyLevel } from "@/lib/types"
import { MILITARY_BRANCHES } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

// ─── Connection Action Button ────────────────────────────────────────────────
// Reads connection status live from the hook so it reactively updates
// whenever the underlying connections/requests/blocks change — no prop
// drilling or manual onStatusChange callbacks required.

interface ConnectionActionButtonProps {
  profileId: string
  profileName: string
  profilePrivacyLevel: PrivacyLevel
  className?: string
}

export function ConnectionActionButton({
  profileId,
  profileName,
  profilePrivacyLevel,
  className = "",
}: ConnectionActionButtonProps) {
  const {
    getConnectionStatus,
    getRequestForUser,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    cancelConnectionRequest,
    removeConnection,
    blockUser,
    unblockUser,
    isSyncing,
  } = useConnections()

  // Read status and request id straight from the hook so this component
  // re-renders automatically on any state change.
  const connectionStatus = getConnectionStatus(profileId)
  const requestInfo = getRequestForUser(profileId)
  const requestId = requestInfo?.requestId

  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestMessage, setRequestMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)
  const [showConfirmBlock, setShowConfirmBlock] = useState(false)

  const handleSendRequest = async () => {
    setSending(true)
    try {
      await sendConnectionRequest(profileId, requestMessage || undefined)
      setShowRequestDialog(false)
      setRequestMessage("")
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleAccept = async () => {
    if (!requestId) return
    await acceptConnectionRequest(requestId)
  }

  const handleDecline = async () => {
    if (!requestId) return
    await declineConnectionRequest(requestId)
  }

  const handleCancel = async () => {
    if (!requestId) return
    await cancelConnectionRequest(requestId)
  }

  const handleRemove = async () => {
    await removeConnection(profileId)
    setShowConfirmRemove(false)
  }

  const handleBlock = async () => {
    await blockUser(profileId)
    setShowConfirmBlock(false)
  }

  const handleUnblock = async () => {
    await unblockUser(profileId)
  }

  // ── Render based on status ─────────────────────────────────

  if (connectionStatus === "blocked") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`cursor-pointer ${className}`}
        onClick={handleUnblock}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Ban className="h-4 w-4 mr-1 text-destructive" />
        )}
        Blocked — Unblock
      </Button>
    )
  }

  if (connectionStatus === "connected") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={`cursor-pointer ${className}`}>
              <UserCheck className="h-4 w-4 mr-1 text-green-600" />
              Connected
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setShowConfirmRemove(true)}
              className="text-destructive cursor-pointer"
            >
              <Link2Off className="h-4 w-4 mr-2 hover:text-white" />
              Remove Connection
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowConfirmBlock(true)}
              className="text-destructive cursor-pointer"
            >
              <Ban className="h-4 w-4 mr-2 hover:text-white" />
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={showConfirmRemove} onOpenChange={setShowConfirmRemove}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Remove Connection</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {profileName} from your connections?
                They&apos;ll be removed from your contacts, and you&apos;ll be removed from theirs.
                {profilePrivacyLevel !== "public" &&
                  " You'll need to send a new request to reconnect."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" className="cursor-pointer" onClick={() => setShowConfirmRemove(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="cursor-pointer" onClick={handleRemove} disabled={isSyncing}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showConfirmBlock} onOpenChange={setShowConfirmBlock}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Block {profileName}?
              </DialogTitle>
              <DialogDescription>
                They will be removed as a connection and from your contacts. Neither of you
                will be able to message the other or send connection requests until you unblock them.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" className="cursor-pointer" onClick={() => setShowConfirmBlock(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="cursor-pointer" onClick={handleBlock} disabled={isSyncing}>
                Block
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  if (connectionStatus === "pending_sent") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`cursor-pointer ${className}`}
        onClick={handleCancel}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Clock className="h-4 w-4 mr-1 text-amber-500" />
        )}
        Request Sent
      </Button>
    )
  }

  if (connectionStatus === "pending_received") {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={handleAccept}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-1" />
          )}
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={handleDecline}
          disabled={isSyncing}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Decline
        </Button>
      </div>
    )
  }

  // connectionStatus === "none"
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`cursor-pointer ${className}`}
        onClick={() => {
          if (profilePrivacyLevel === "public") {
            sendConnectionRequest(profileId).catch((err) => console.error(err))
          } else {
            setShowRequestDialog(true)
          }
        }}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4 mr-1" />
        )}
        {profilePrivacyLevel !== "public" ? "Request Connection" : "Connect"}
      </Button>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Request Connection
            </DialogTitle>
            <DialogDescription>
              {profileName}&apos;s profile is{" "}
              limited to connections. Send a connection request to view their full profile and send messages.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="request-message">
                Message <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="request-message"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={`Hi ${profileName}, I'd like to connect...`}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {requestMessage.length}/500
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRequest} disabled={sending} className="cursor-pointer">
              {sending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Connection Requests Inbox ───────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ConnectionRequestsInbox() {
  const router = useRouter()
  const {
    incomingRequests,
    outgoingRequests,
    acceptConnectionRequest,
    declineConnectionRequest,
    cancelConnectionRequest,
    isSyncing,
  } = useConnections()

  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming")

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return null
  }

  return (
    <div className="bg-card border border-border mb-6 rounded-xl overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          Connection Requests
          {incomingRequests.length > 0 && (
            <Badge variant="default" className="h-5 min-w-[20px]">
              {incomingRequests.length}
            </Badge>
          )}
        </h3>
      </div>

      {outgoingRequests.length > 0 && (
        <div className="flex gap-1 px-5 pb-2">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === "incoming"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Received ({incomingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === "outgoing"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sent ({outgoingRequests.length})
          </button>
        </div>
      )}

      <div className="divide-y">
        {activeTab === "incoming" &&
          incomingRequests.map((request) => {
            const branchLabel = MILITARY_BRANCHES.find(
              (b) => b.value === request.senderBranch
            )?.label

            return (
              <div key={request.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => router.push(`/profile/${request.senderId}`)}
                    className="cursor-pointer"
                  >
                    {request.senderAvatar ? (
                      <img
                        src={request.senderAvatar}
                        alt={request.senderName}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm">
                          {getInitials(request.senderName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => router.push(`/profile/${request.senderId}`)}
                      className="text-sm font-medium text-foreground hover:underline cursor-pointer"
                    >
                      {request.senderName}
                    </button>
                    {branchLabel && (
                      <p className="text-xs text-muted-foreground">{branchLabel}</p>
                    )}
                    {request.message && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                        &ldquo;{request.message}&rdquo;
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs cursor-pointer"
                        onClick={() => acceptConnectionRequest(request.id)}
                        disabled={isSyncing}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs cursor-pointer"
                        onClick={() => declineConnectionRequest(request.id)}
                        disabled={isSyncing}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

        {activeTab === "outgoing" &&
          outgoingRequests.map((request) => (
            <div key={request.id} className="px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  <button
                    onClick={() => router.push(`/profile/${request.recipientId}`)}
                    className="text-sm text-foreground hover:underline truncate cursor-pointer"
                  >
                    Pending request
                    {request.recipientName ? ` to ${request.recipientName}` : ""}
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground cursor-pointer"
                  onClick={() => cancelConnectionRequest(request.id)}
                  disabled={isSyncing}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 pl-6">
                Sent {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}

        {activeTab === "incoming" && incomingRequests.length === 0 && (
          <div className="px-5 py-4 text-center text-sm text-muted-foreground">
            No pending requests
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Private Profile Gate ────────────────────────────────────────────────────

interface PrivateProfileGateProps {
  profileId: string
  profileName: string
  profileAvatar?: string
  profileBranch?: string
  privacyLevel: PrivacyLevel
}

export function PrivateProfileGate({
  profileId,
  profileName,
  profileAvatar,
  profileBranch,
  privacyLevel,
}: PrivateProfileGateProps) {
  const initials = (profileName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const branchLabel = MILITARY_BRANCHES.find(
    (b) => b.value === profileBranch
  )?.label

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="bg-background border border-border rounded-xl p-8">
        <div className="mx-auto mb-4">
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt={profileName}
              className="h-20 w-20 rounded-2xl object-cover mx-auto shadow-lg"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold mx-auto shadow-lg">
              {initials}
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-1">
          {profileName}
        </h2>
        {branchLabel && (
          <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1">
            <Shield className="h-3.5 w-3.5" />
            {branchLabel}
          </p>
        )}

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            "This profile is only visible to connections. Send a connection request to view their full profile and send messages."
          </p>
        </div>

        <ConnectionActionButton
          profileId={profileId}
          profileName={profileName}
          profilePrivacyLevel={privacyLevel}
        />
      </div>
    </div>
  )
}