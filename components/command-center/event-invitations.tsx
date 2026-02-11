"use client"

import { useState } from "react"
import { Check, X, HelpCircle, Clock, Calendar, MapPin, ExternalLink, Video, Phone, Users, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScheduledEvent, EventType, InvitationStatus } from "@/lib/types"
import { format } from "date-fns"
import { EventInvitation } from "@/lib/types"

// ============================================
// CONSTANTS
// ============================================

const eventTypeIcons: Record<EventType, any> = {
  call: Phone,
  video: Video,
  meeting: Users,
  reminder: Bell,
}

const eventTypeColors: Record<EventType, string> = {
  call: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  video: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  meeting: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  reminder: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
}

const statusConfig: Record<InvitationStatus, { label: string; icon: any; color: string; bgColor: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  accepted: {
    label: "Accepted",
    icon: Check,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  declined: {
    label: "Declined",
    icon: X,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  tentative: {
    label: "Maybe",
    icon: HelpCircle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ============================================
// INVITATION RESPONSE DIALOG
// ============================================
// Shows event details and lets the invitee accept, decline, or mark tentative.

export function InvitationResponseDialog({
  open,
  onOpenChange,
  invitation,
  event,
  onRespond,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitation: EventInvitation
  event: ScheduledEvent
  onRespond: (invitationId: string, status: InvitationStatus, message?: string) => Promise<void>
}) {
  const [responseMessage, setResponseMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const Icon = eventTypeIcons[event.eventType]
  const colorClass = eventTypeColors[event.eventType]

  const handleRespond = async (status: InvitationStatus) => {
    setIsSubmitting(true)
    try {
      await onRespond(invitation.id, status, responseMessage.trim() || undefined)
      onOpenChange(false)
      setResponseMessage("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Event Invitation
          </DialogTitle>
          <DialogDescription>You&rsquo;ve been invited to an event</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event summary */}
          <div className="flex items-start gap-3 p-4 border rounded-xl bg-muted/20">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base">{event.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(event.startTime), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {format(new Date(event.startTime), "h:mm a")}
                {event.endTime && ` – ${format(new Date(event.endTime), "h:mm a")}`}
                {event.durationMinutes && ` (${event.durationMinutes} min)`}
              </p>

              {event.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.location}
                </p>
              )}

              {event.meetingLink && (
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mt-1 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Join Meeting
                </a>
              )}

              {event.description && (
                <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{event.description}</p>
              )}
            </div>
          </div>

          {/* Other invitees */}
          {event.invitations.length > 1 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Other Invitees
              </Label>
              <div className="flex flex-wrap gap-2">
                {event.invitations
                  .filter((inv) => inv.id !== invitation.id)
                  .map((inv) => {
                    const cfg = statusConfig[inv.status]
                    const StatusIcon = cfg.icon
                    return (
                      <div
                        key={inv.id}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/30 border text-sm"
                      >
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[9px]">
                            {getInitials(inv.inviteeName || inv.inviteeEmail.split("@")[0])}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-[140px] truncate">
                          {inv.inviteeName || inv.inviteeEmail}
                        </span>
                        <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Current status badge */}
          {invitation.status !== "pending" && (
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Response
              </Label>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[invitation.status].bgColor} ${statusConfig[invitation.status].color}`}
              >
                {statusConfig[invitation.status].label}
              </span>
            </div>
          )}

          {/* Optional message */}
          <div className="space-y-2">
            <Label htmlFor="responseMessage">Message (optional)</Label>
            <Textarea
              id="responseMessage"
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Add a note with your response..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => handleRespond("declined")}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-1.5" />
            Decline
          </Button>
          <Button
            variant="outline"
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            onClick={() => handleRespond("tentative")}
            disabled={isSubmitting}
          >
            <HelpCircle className="w-4 h-4 mr-1.5" />
            Maybe
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleRespond("accepted")}
            disabled={isSubmitting}
          >
            <Check className="w-4 h-4 mr-1.5" />
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// INVITATION CARD (for use in a list/inbox)
// ============================================
// Displays a compact invitation card with quick-action buttons.

export function InvitationCard({
  invitation,
  event,
  onRespond,
  onViewDetails,
}: {
  invitation: EventInvitation
  event: ScheduledEvent
  onRespond: (invitationId: string, status: InvitationStatus, message?: string) => Promise<void>
  onViewDetails: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const Icon = eventTypeIcons[event.eventType]
  const colorClass = eventTypeColors[event.eventType]
  const isPending = invitation.status === "pending"
  const cfg = statusConfig[invitation.status]

  const handleQuickRespond = async (status: InvitationStatus) => {
    setIsSubmitting(true)
    try {
      await onRespond(invitation.id, status)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className="font-semibold text-foreground cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={onViewDetails}
              >
                {event.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(new Date(event.startTime), "EEE, MMM d 'at' h:mm a")}
              </p>
              {event.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </p>
              )}
            </div>

            {!isPending && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${cfg.bgColor} ${cfg.color}`}
              >
                {(() => { const StatusIcon = cfg.icon; return <StatusIcon className="w-3 h-3" /> })()}
                {cfg.label}
              </span>
            )}
          </div>

          {/* Quick-action buttons for pending invitations */}
          {isPending && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                onClick={() => handleQuickRespond("accepted")}
                disabled={isSubmitting}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 h-8 text-xs"
                onClick={() => handleQuickRespond("tentative")}
                disabled={isSubmitting}
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                Maybe
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 text-xs"
                onClick={() => handleQuickRespond("declined")}
                disabled={isSubmitting}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Decline
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs ml-auto" onClick={onViewDetails}>
                Details
              </Button>
            </div>
          )}

          {/* Change response link for already-responded invitations */}
          {!isPending && (
            <button
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
              onClick={onViewDetails}
            >
              Change response
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// INVITATIONS LIST / INBOX
// ============================================

export function InvitationsInbox({
  invitations,
  events,
  onRespond,
}: {
  invitations: EventInvitation[]
  events: ScheduledEvent[]
  onRespond: (invitationId: string, status: InvitationStatus, message?: string) => Promise<void>
}) {
  const [selectedInvitation, setSelectedInvitation] = useState<{
    invitation: EventInvitation
    event: ScheduledEvent
  } | null>(null)

  const eventMap = new Map(events.map((e) => [e.id, e]))

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending")
  const respondedInvitations = invitations.filter((inv) => inv.status !== "pending")

  return (
    <>
      <div className="space-y-6">
        {pendingInvitations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Invitations
              </h3>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-xs font-bold">
                {pendingInvitations.length}
              </span>
            </div>
            <div className="grid gap-3">
              {pendingInvitations.map((inv) => {
                const event = eventMap.get(inv.eventId)
                if (!event) return null
                return (
                  <InvitationCard
                    key={inv.id}
                    invitation={inv}
                    event={event}
                    onRespond={onRespond}
                    onViewDetails={() => setSelectedInvitation({ invitation: inv, event })}
                  />
                )
              })}
            </div>
          </div>
        )}

        {respondedInvitations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Responded
            </h3>
            <div className="grid gap-3">
              {respondedInvitations.map((inv) => {
                const event = eventMap.get(inv.eventId)
                if (!event) return null
                return (
                  <InvitationCard
                    key={inv.id}
                    invitation={inv}
                    event={event}
                    onRespond={onRespond}
                    onViewDetails={() => setSelectedInvitation({ invitation: inv, event })}
                  />
                )
              })}
            </div>
          </div>
        )}

        {invitations.length === 0 && (
          <div className="text-center py-12 bg-card border rounded-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Calendar className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No invitations</h3>
            <p className="text-sm text-muted-foreground">
              When someone invites you to an event, it will appear here.
            </p>
          </div>
        )}
      </div>

      {selectedInvitation && (
        <InvitationResponseDialog
          open={!!selectedInvitation}
          onOpenChange={(open) => {
            if (!open) setSelectedInvitation(null)
          }}
          invitation={selectedInvitation.invitation}
          event={selectedInvitation.event}
          onRespond={onRespond}
        />
      )}
    </>
  )
}