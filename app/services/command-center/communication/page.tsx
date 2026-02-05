"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Plus, Phone, Video, Mail, Users, MessageSquare, FileText, Trash2, Edit, Calendar,
  Clock, Filter, Send, Star, Archive, Search, CalendarPlus, MessageCircle, History,
  MoreVertical, Check, X, ExternalLink, UserPlus, Bell, MapPin, Link as LinkIcon, Inbox, AlertCircle,
  Pencil
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CommunicationLog, CommunicationType, ScheduledEvent, EventType, MessageThread, Message, InvitationStatus, Contact } from "@/lib/types"
import { useCommunicationHub } from "@/hooks/use-communication-hub"
import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek, addHours } from "date-fns"

// ============================================
// CONSTANTS
// ============================================

const communicationIcons: Record<CommunicationType, any> = {
  call: Phone,
  video: Video,
  email: Mail,
  message: MessageSquare,
  letter: FileText,
}

const communicationColors: Record<CommunicationType, string> = {
  call: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  video: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  email: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  message: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  letter: "text-slate-600 bg-slate-100 dark:bg-slate-900/30",
}

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

const invitationStatusColors: Record<InvitationStatus, string> = {
  pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  declined: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  tentative: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return `Today at ${format(date, "h:mm a")}`
  if (isTomorrow(date)) return `Tomorrow at ${format(date, "h:mm a")}`
  if (isThisWeek(date)) return format(date, "EEEE 'at' h:mm a")
  return format(date, "MMM d 'at' h:mm a")
}

// Helper to get the "other party" info for a thread
function getOtherPartyInfo(
  thread: MessageThread,
  currentUser: { id: string; email: string } | null,
  contacts: Contact[]
): { name: string; email: string } {
  if (!currentUser) {
    return {
      name: thread.contactName || thread.contactEmail.split("@")[0],
      email: thread.contactEmail
    }
  }
  
  const isThreadCreator = thread.user_id === currentUser.id
  
  if (isThreadCreator) {
    return {
      name: thread.contactName || thread.contactEmail.split("@")[0],
      email: thread.contactEmail
    }
  } else {
    const firstMessage = thread.messages[0]
    if (firstMessage && firstMessage.senderType === "user" && firstMessage.senderId !== currentUser.id) {
      const localContact = contacts.find(c => (c.email === firstMessage.senderEmail))
      return {
        name: localContact?.contactName || firstMessage.senderName || firstMessage.senderEmail?.split("@")[0] || "Unknown User",
        email: firstMessage.senderEmail || "unknown"
      }
    }
    if (thread.contactEmail === currentUser.email) {
      const otherMessage = thread.messages.find(
        m => m.senderId !== currentUser.id && m.senderEmail !== currentUser.email
      )
      if (otherMessage) {
        return {
          name: otherMessage.senderName || otherMessage.senderEmail?.split("@")[0] || "Unknown User",
          email: otherMessage.senderEmail || "unknown"
        }
      }
    }
    return {
      name: thread.contactName || thread.contactEmail.split("@")[0],
      email: thread.contactEmail
    }
  }
}

// ============================================
// SCHEDULE EVENT DIALOG
// ============================================

function ScheduleEventDialog({
  open,
  onOpenChange,
  onSave,
  contacts,
  editingEvent,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
    invitees: { email: string; name?: string; contactId?: string }[]
  ) => void
  contacts: Array<{ id: string; name: string; email?: string }>
  editingEvent?: ScheduledEvent | null
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventType, setEventType] = useState<EventType>("call")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("30")
  const [location, setLocation] = useState("")
  const [meetingLink, setMeetingLink] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [customEmail, setCustomEmail] = useState("")
  const [customEmails, setCustomEmails] = useState<string[]>([])

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title)
      setDescription(editingEvent.description || "")
      setEventType(editingEvent.eventType)
      const eventDate = new Date(editingEvent.startTime)
      setDate(format(eventDate, "yyyy-MM-dd"))
      setTime(format(eventDate, "HH:mm"))
      setDuration(editingEvent.durationMinutes.toString())
      setLocation(editingEvent.location || "")
      setMeetingLink(editingEvent.meetingLink || "")
      setNotes(editingEvent.notes || "")
      setSelectedContacts(editingEvent.invitations.filter((i) => i.contactId).map((i) => i.contactId!))
      setCustomEmails(editingEvent.invitations.filter((i) => !i.contactId).map((i) => i.inviteeEmail))
    } else if (open) {
      const now = new Date()
      const nextHour = addHours(now, 1)
      nextHour.setMinutes(0, 0, 0)
      setTitle("")
      setDescription("")
      setEventType("call")
      setDate(format(nextHour, "yyyy-MM-dd"))
      setTime(format(nextHour, "HH:mm"))
      setDuration("30")
      setLocation("")
      setMeetingLink("")
      setNotes("")
      setSelectedContacts([])
      setCustomEmails([])
      setCustomEmail("")
    }
  }, [editingEvent, open])

  const handleAddCustomEmail = () => {
    const email = customEmail.trim().toLowerCase()
    if (email && !customEmails.includes(email) && email.includes("@")) {
      setCustomEmails([...customEmails, email])
      setCustomEmail("")
    }
  }

  const handleRemoveCustomEmail = (email: string) => {
    setCustomEmails(customEmails.filter((e) => e !== email))
  }

  const toggleContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    )
  }

  const handleSave = () => {
    if (!title || !date || !time) return

    const startTime = new Date(`${date}T${time}`).toISOString()
    const durationMinutes = parseInt(duration) || 30
    const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60000).toISOString()

    const invitees: { email: string; name?: string; contactId?: string }[] = []

    selectedContacts.forEach((contactId) => {
      const contact = contacts.find((c) => c.id === contactId)
      if (contact?.email) {
        invitees.push({
          email: contact.email,
          name: contact.name,
          contactId: contact.id,
        })
      }
    })

    customEmails.forEach((email) => {
      invitees.push({ email })
    })

    onSave(
      {
        title,
        description: description.trim() || undefined,
        eventType,
        startTime,
        endTime,
        durationMinutes,
        location: location.trim() || undefined,
        meetingLink: meetingLink.trim() || undefined,
        isRecurring: false,
        status: "scheduled",
        notes: notes.trim() || undefined,
      },
      invitees
    )

    onOpenChange(false)
  }

  const contactsWithEmail = contacts.filter((c) => c.email)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-indigo-500" />
            {editingEvent ? "Edit Event" : "Schedule New Event"}
          </DialogTitle>
          <DialogDescription>
            Schedule calls, meetings, and reminders with your contacts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly check-in call"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>Event Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {(["call", "video", "meeting", "reminder"] as EventType[]).map((type) => {
                const Icon = eventTypeIcons[type]
                const isSelected = eventType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-border hover:border-indigo-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? "text-indigo-600" : "text-muted-foreground"}`} />
                    <span className={`text-xs capitalize ${isSelected ? "text-indigo-600 font-medium" : "text-muted-foreground"}`}>
                      {type}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(eventType === "meeting" || eventType === "video") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Address or room name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingLink">
                  <LinkIcon className="w-3 h-3 inline mr-1" />
                  Meeting Link
                </Label>
                <Input
                  id="meetingLink"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/..."
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this event about?"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Invite Contacts</Label>
            
            {contactsWithEmail.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contactsWithEmail.map((contact) => {
                  const isSelected = selectedContacts.includes(contact.id)
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => toggleContact(contact.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                        isSelected
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {contact.name}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="Add email address..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCustomEmail()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddCustomEmail}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {customEmails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customEmails.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomEmail(email)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title || !date || !time}>
            {editingEvent ? "Save Changes" : "Schedule Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// NEW MESSAGE DIALOG
// ============================================

function NewMessageDialog({
  open,
  onOpenChange,
  onSend,
  contacts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (
    contactEmail: string,
    contactName: string | undefined,
    contactId: string | undefined,
    subject: string | undefined,
    message: string,
    attachedFiles: File[]
  ) => void
  contacts: Array<{ id: string; name: string; email?: string }>
}) {
  const [selectedContactId, setSelectedContactId] = useState<string>("")
  const [customEmail, setCustomEmail] = useState("")
  const [customName, setCustomName] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [useCustomEmail, setUseCustomEmail] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setSelectedContactId("")
      setCustomEmail("")
      setCustomName("")
      setSubject("")
      setMessage("")
      setUseCustomEmail(false)
    }
  }, [open])

  const handleSend = () => {
    let email: string
    let name: string | undefined
    let contactId: string | undefined

    if (useCustomEmail) {
      email = customEmail.trim()
      name = customName.trim() || undefined
    } else {
      const contact = contacts.find((c) => c.id === selectedContactId)
      if (!contact?.email) return
      email = contact.email
      name = contact.name
      contactId = contact.id
    }

    if (!email || (!message.trim() && attachedFiles.length === 0)) return

    onSend(email, name, contactId, subject.trim() || undefined, message.trim(), attachedFiles)
    onOpenChange(false)
  }

  const contactsWithEmail = contacts.filter((c) => c.email)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-500" />
            New Message
          </DialogTitle>
          <DialogDescription>Start a conversation with your contacts</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button type="button" variant={!useCustomEmail ? "default" : "outline"} size="sm" onClick={() => setUseCustomEmail(false)}>
              Select Contact
            </Button>
            <Button type="button" variant={useCustomEmail ? "default" : "outline"} size="sm" onClick={() => setUseCustomEmail(true)}>
              Enter Email
            </Button>
          </div>

          {!useCustomEmail ? (
            <div className="space-y-2">
              <Label htmlFor="contact">To</Label>
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger id="contact">
                  <SelectValue placeholder="Select a contact..." />
                </SelectTrigger>
                <SelectContent>
                  {contactsWithEmail.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customEmail">Email Address</Label>
                <Input id="customEmail" type="email" value={customEmail} onChange={(e) => setCustomEmail(e.target.value)} placeholder="recipient@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customName">Name (optional)</Label>
                <Input id="customName" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="John Doe" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." rows={5} />
          </div>
        </div>

        <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilesSelected} />

        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachedFiles.map((file, i) => (
              <div key={i} className="relative border rounded-lg p-2 bg-muted text-xs flex items-center gap-2">
                {file.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(file)} className="h-12 w-12 object-cover rounded" />
                ) : (
                  <span className="truncate max-w-[120px]">{file.name}</span>
                )}
                <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-black text-white rounded-full w-4 h-4 text-[10px]">✕</button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between">
          <Button className="mb-2 cursor-pointer" type="button" onClick={handleFileClick}>
            <Plus className="w-4 h-4 mr-1" />
            Upload Attachment
          </Button>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={(!useCustomEmail && !selectedContactId) || (useCustomEmail && !customEmail) || (!message.trim() && attachedFiles.length === 0)}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// ADD COMMUNICATION LOG DIALOG
// ============================================

function AddCommunicationDialog({
  open,
  onOpenChange,
  onSave,
  contacts,
  editingLog,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (log: Omit<CommunicationLog, "id" | "createdAt" | "contactName">) => void
  contacts: Array<{ id: string; name: string }>
  editingLog?: CommunicationLog | null
}) {
  const [contactId, setContactId] = useState("")
  const [type, setType] = useState<CommunicationType>("call")
  const [direction, setDirection] = useState<"incoming" | "outgoing">("outgoing")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (editingLog) {
      setContactId(editingLog.contactId || "")
      setType(editingLog.communicationType)
      setDirection(editingLog.direction)
      const logDate = new Date(editingLog.communicationDate)
      setDate(format(logDate, "yyyy-MM-dd"))
      setTime(format(logDate, "HH:mm"))
      setDuration(editingLog.durationMinutes?.toString() || "")
      setNotes(editingLog.notes || "")
    } else if (open) {
      const now = new Date()
      setContactId("")
      setType("call")
      setDirection("outgoing")
      setDate(format(now, "yyyy-MM-dd"))
      setTime(format(now, "HH:mm"))
      setDuration("")
      setNotes("")
    }
  }, [editingLog, open])

  const handleSave = () => {
    if (!contactId || !date || !time) return

    const communicationDate = new Date(`${date}T${time}`)

    onSave({
      contactId,
      communicationType: type,
      direction,
      communicationDate: communicationDate.toISOString(),
      durationMinutes: duration ? parseInt(duration) : undefined,
      notes: notes.trim() || undefined,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            {editingLog ? "Edit Communication Log" : "Log Communication"}
          </DialogTitle>
          <DialogDescription>Record a past communication for your records</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger id="contact">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CommunicationType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="message">Text/Message</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Select
                value={direction}
                onValueChange={(v) => setDirection(v as "incoming" | "outgoing")}
              >
                <SelectTrigger id="direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was discussed, follow-up needed, etc."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!contactId || !date || !time}>
            {editingLog ? "Save Changes" : "Add Log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// EVENT CARD COMPONENT
// ============================================

function EventCard({
  event,
  onEdit,
  onDelete,
  onComplete,
}: {
  event: ScheduledEvent
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
}) {
  const Icon = eventTypeIcons[event.eventType]
  const colorClass = eventTypeColors[event.eventType]
  const isPast = new Date(event.startTime) < new Date()

  const acceptedCount = event.invitations.filter((i) => i.status === "accepted").length
  const pendingCount = event.invitations.filter((i) => i.status === "pending").length
  const totalInvited = event.invitations.length

  return (
    <div
      className={`bg-card border rounded-xl p-4 hover:shadow-md transition-all ${
        isPast ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{event.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{formatEventDate(event.startTime)}</p>

            {event.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </p>
            )}

            {totalInvited > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-2">
                  {event.invitations.slice(0, 3).map((inv, i) => (
                    <Avatar key={inv.id} className="w-6 h-6 border-2 border-background">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(inv.inviteeName || inv.inviteeEmail.split("@")[0])}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {acceptedCount}/{totalInvited} confirmed
                  {pendingCount > 0 && `, ${pendingCount} pending`}
                </span>
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {event.status === "scheduled" && (
              <DropdownMenuItem onClick={onComplete}>
                <Check className="w-4 h-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
            )}
            {event.meetingLink && (
              <DropdownMenuItem asChild>
                <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Meeting
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ============================================
// THREAD LIST ITEM
// ============================================

function ThreadListItem({
  thread, isSelected, contacts, onClick, onStar, onDelete, currentUser,
}: {
  thread: MessageThread
  isSelected: boolean
  contacts: Contact[]
  onClick: () => void
  onStar: () => void
  onDelete: () => void
  currentUser: { id: string; email: string } | null
}) {
  const lastMessage = thread.messages[thread.messages.length - 1]
  const otherParty = getOtherPartyInfo(thread, currentUser, contacts)
  const isLastMessageFromCurrentUser = lastMessage && currentUser && (lastMessage.senderId === currentUser.id || lastMessage.senderEmail === currentUser.email)

  return (
    <div onClick={onClick} className={`p-3 border-b cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-l-indigo-500" : ""}`}>
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">{getInitials(otherParty.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-medium truncate ${thread.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>{otherParty.name}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}</span>
          </div>
          {thread.subject && <p className={`text-sm truncate ${thread.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{thread.subject}</p>}
          {lastMessage && <p className="text-sm text-muted-foreground truncate mt-0.5">{isLastMessageFromCurrentUser ? "You: " : ""}{lastMessage.content}</p>}
        </div>
        <div className="flex flex-col items-center gap-1">
          {thread.unreadCount > 0 && <Badge variant="default" className="h-5 min-w-[20px] flex items-center justify-center">{thread.unreadCount}</Badge>}
          <button onClick={(e) => { e.stopPropagation(); onStar() }} className="p-1 hover:bg-muted rounded">
            {thread.isStarred ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Star className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1 hover:bg-muted rounded mt-2">
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// THREAD HEADER COMPONENT
// ============================================

function ThreadHeader({ thread, currentUser, contacts, onStar, onDelete }: {
  thread: MessageThread
  currentUser: { id: string; email: string } | null
  contacts: Contact[]
  onStar: () => void
  onDelete: () => void
}) {
  const otherParty = getOtherPartyInfo(thread, currentUser, contacts)

  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">{getInitials(otherParty.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{otherParty.name}</h3>
          <p className="text-sm text-muted-foreground">{otherParty.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onStar}>
          {thread.isStarred ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Star className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4"/>
        </Button>
      </div>
    </div>
  )
}

// ============================================
// MESSAGE BUBBLE WITH EDIT/DELETE
// ============================================

function MessageBubble({
  message,
  isCurrentUser,
  onEdit,
  onDelete,
}: {
  message: Message
  isCurrentUser: boolean
  onEdit: (newContent: string, newAttachments?: File[], attachmentsToRemove?: string[]) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [showActions, setShowActions] = useState(false)
  const [newAttachments, setNewAttachments] = useState<File[]>([])
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<string[]>([])
  const [fileInputKey, setFileInputKey] = useState(0) // Key to force re-render of file input
  
  const existingAttachments = useMemo(() => 
    (message.attachments ?? []).filter((att): att is string => typeof att === "string"),
    [message.attachments]
  )
  
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)

  // Reset edit state when entering edit mode
  const handleStartEdit = () => {
    setEditContent(message.content)
    setNewAttachments([])
    setAttachmentsToRemove([])
    setFileInputKey(prev => prev + 1)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const hasContentChanged = editContent !== message.content
    const hasAttachmentsChanged = newAttachments.length > 0 || attachmentsToRemove.length > 0
    
    if (hasContentChanged || hasAttachmentsChanged) {
      onEdit(
        editContent.trim(),
        newAttachments.length > 0 ? newAttachments : undefined,
        attachmentsToRemove.length > 0 ? attachmentsToRemove : undefined
      )
    }
    setIsEditing(false)
    setNewAttachments([])
    setAttachmentsToRemove([])
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setNewAttachments([])
    setAttachmentsToRemove([])
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this message?")) {
      onDelete()
    }
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const filesArray = Array.from(files)
    setNewAttachments(prev => [...prev, ...filesArray])
    
    // Reset file input by incrementing key
    setFileInputKey(prev => prev + 1)
  }

  const removeNewAttachment = (index: number) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const markExistingAttachmentForRemoval = (url: string) => {
    setAttachmentsToRemove(prev => [...prev, url])
  }

  const unmarkExistingAttachmentForRemoval = (url: string) => {
    setAttachmentsToRemove(prev => prev.filter((u) => u !== url))
  }

  // Get visible existing attachments (not marked for removal)
  const visibleExistingAttachments = existingAttachments.filter(
    (url) => !attachmentsToRemove.includes(url)
  )

  // Create object URLs for new attachments - memoized to prevent recreation
  const newAttachmentPreviews = useMemo(() => {
    return newAttachments.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isImage: file.type.startsWith("image/")
    }))
  }, [newAttachments])

  // Cleanup object URLs on unmount or when attachments change
  useEffect(() => {
    return () => {
      newAttachmentPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url)
      })
    }
  }, [newAttachmentPreviews])

  return (
    <div 
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action buttons for current user's messages */}
      {isCurrentUser && showActions && !isEditing && (
        <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleStartEdit}>
            <Pencil className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}

      <div className={`max-w-[70%] rounded-2xl px-4 py-2 space-y-2 ${isCurrentUser ? "bg-indigo-600 text-white rounded-br-md" : "bg-muted rounded-bl-md"}`}>
        {isEditing ? (
          <div className="space-y-3">
            {/* File input - using key to force re-render */}
            <input
              key={fileInputKey}
              type="file"
              multiple
              className="hidden"
              id={`file-input-${message.id}`}
              onChange={handleFilesSelected}
            />

            {/* Text content */}
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`min-h-[60px] text-sm ${isCurrentUser ? "bg-indigo-700 border-indigo-500 text-white placeholder:text-indigo-200" : ""}`}
              autoFocus
            />

            {/* Existing attachments (with remove option) */}
            {visibleExistingAttachments.length > 0 && (
              <div className="space-y-1">
                <p className={`text-xs ${isCurrentUser ? "text-indigo-200" : "text-muted-foreground"}`}>
                  Current attachments:
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleExistingAttachments.map((url, i) => (
                    <div key={`existing-${i}-${url}`} className="relative">
                      {isImage(url) ? (
                        <img
                          src={url}
                          alt="attachment"
                          className="h-16 w-16 object-cover rounded-lg border border-white/20"
                        />
                      ) : (
                        <div className={`h-16 px-3 flex items-center rounded-lg border ${isCurrentUser ? "border-indigo-400 bg-indigo-700" : "border-gray-300 bg-gray-100"}`}>
                          <span className={`text-xs truncate max-w-[100px] ${isCurrentUser ? "text-indigo-200" : "text-gray-600"}`}>
                            {url.split('/').pop()?.split('-').slice(1).join('-').replace('%20', ' ')}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => markExistingAttachmentForRemoval(url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                        title="Remove attachment"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments marked for removal */}
            {attachmentsToRemove.length > 0 && (
              <div className="space-y-1">
                <p className={`text-xs ${isCurrentUser ? "text-red-300" : "text-red-500"}`}>
                  Will be removed:
                </p>
                <div className="flex flex-wrap gap-2">
                  {attachmentsToRemove.map((url, i) => (
                    <div key={`remove-${i}-${url}`} className="relative opacity-50">
                      {isImage(url) ? (
                        <img
                          src={url}
                          alt="attachment"
                          className="h-12 w-12 object-cover rounded-lg border border-red-400"
                        />
                      ) : (
                        <div className="h-12 px-2 flex items-center rounded-lg border border-red-400 bg-red-100">
                          <span className="text-xs truncate max-w-[80px] text-red-600">
                            {url.split('/').pop()?.split('-').slice(1).join('-').replace('%20', ' ')}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => unmarkExistingAttachmentForRemoval(url)}
                        className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-green-600"
                        title="Keep attachment"
                      >
                        ↩
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New attachments to add */}
            {newAttachmentPreviews.length > 0 && (
              <div className="space-y-1">
                <p className={`text-xs ${isCurrentUser ? "text-green-300" : "text-green-600"}`}>
                  New attachments ({newAttachmentPreviews.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {newAttachmentPreviews.map((preview, i) => (
                    <div key={`new-${i}-${preview.file.name}`} className="relative">
                      {preview.isImage ? (
                        <img
                          src={preview.url}
                          alt="new attachment"
                          className="h-12 w-12 object-cover rounded-lg border-2 border-green-400"
                        />
                      ) : (
                        <div className={`h-12 px-2 flex items-center rounded-lg border-2 border-green-400 ${isCurrentUser ? "bg-indigo-700" : "bg-gray-100"}`}>
                          <span className={`text-xs truncate max-w-[80px] ${isCurrentUser ? "text-indigo-200" : "text-gray-600"}`}>
                            {preview.file.name}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeNewAttachment(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 justify-between items-center">
              <label
                htmlFor={`file-input-${message.id}`}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 cursor-pointer ${
                  isCurrentUser 
                    ? "text-white border border-indigo-400 hover:bg-indigo-700" 
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Plus className="w-3 h-3 mr-1" /> Add File
              </label>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancelEdit} className={isCurrentUser ? "text-white hover:bg-indigo-700" : ""}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} className={isCurrentUser ? "bg-white text-indigo-600 hover:bg-indigo-100" : ""}>
                  <Check className="w-3 h-3 mr-1" /> Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}

            {existingAttachments.length > 0 && (
              <div className="flex flex-col gap-2">
                {existingAttachments.map((url, i) => {
                  return isImage(url) ? (
                    <img key={`display-${i}-${url}`} src={url} alt="attachment" className="rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90" onClick={() => window.open(url, "_blank")} />
                  ) : (
                    <a key={`display-${i}-${url}`} href={url} target="_blank" className={`text-xs underline break-all ${isCurrentUser ? "text-indigo-200" : "text-blue-600"}`}>
                      {url.split('/').pop()?.split('-').slice(1).join('-').replace('%20', ' ')}
                    </a>
                  )
                })}
              </div>
            )}

            <div className="flex items-center gap-2">
              <p className={`text-[10px] ${isCurrentUser ? "text-indigo-200" : "text-muted-foreground"}`}>
                {format(new Date(message.createdAt), "h:mm a")}
              </p>
              {message.editedAt && (
                <span className={`text-[10px] ${isCurrentUser ? "text-indigo-200" : "text-muted-foreground"}`}>(edited)</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action buttons for other user's messages (on the right) */}
      {!isCurrentUser && showActions && !isEditing && (
        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Non-owner can only delete their copy, typically not shown */}
        </div>
      )}
    </div>
  )
}
  
// ============================================
// COMMUNICATION LOG CARD
// ============================================

function CommunicationLogCard({
  log,
  contactName,
  onEdit,
  onDelete,
}: {
  log: CommunicationLog
  contactName: string
  onEdit: () => void
  onDelete: () => void
}) {
  const Icon = communicationIcons[log.communicationType]
  const colorClass = communicationColors[log.communicationType]

  return (
    <div className="bg-card border rounded-lg p-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{contactName}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  log.direction === "outgoing"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {log.direction === "outgoing" ? "Outgoing" : "Incoming"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(log.communicationDate), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(log.communicationDate), "h:mm a")}
              </span>
              {log.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {log.durationMinutes} min
                </span>
              )}
            </div>
            {log.notes && <p className="mt-2 text-sm text-muted-foreground">{log.notes}</p>}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function CommunicationHubPage() {
  const {
    contacts,
    communicationLog,
    scheduledEvents,
    messageThreads,
    isLoaded,
    isSyncing,
    syncError,
    currentUser,
    addCommunication,
    deleteCommunication,
    createEvent,
    updateEvent,
    deleteEvent,
    createThread,
    sendMessage,
    markThreadAsRead,
    toggleThreadStar,
    deleteThread,
    editMessage,
    deleteMessage,
    getUpcomingEvents
  } = useCommunicationHub()

  // Dialog states
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<CommunicationLog | null>(null)

  // View states
  const [activeTab, setActiveTab] = useState("schedule")
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [newMessageContent, setNewMessageContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [messageFilter, setMessageFilter] = useState<"all" | "starred" | "unread">("all")
  const [logFilter, setLogFilter] = useState<string>("all")
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all")
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Auto-scroll to bottom when thread changes or new messages arrive
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null

    if (!viewport) return

    viewport.scrollTop = viewport.scrollHeight
  }

  // Scroll to bottom when selected thread changes
  useEffect(() => {
    if (selectedThread) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100)
    }
  }, [selectedThread?.id])

  // Scroll to bottom when messages change in current thread
  useEffect(() => {
    if (selectedThread) {
      scrollToBottom()
    }
  }, [selectedThread?.messages?.length])

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSelectedThread(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Keep selectedThread in sync with messageThreads updates
  useEffect(() => {
    if (selectedThread) {
      const updatedThread = messageThreads.find(t => t.id === selectedThread.id)
      if (updatedThread) {
        setSelectedThread(updatedThread)
      }
    }
  }, [messageThreads, selectedThread?.id])

  // Derived data
  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: c.contactName,
    email: c.email,
  }))

  const upcomingEvents = useMemo(
    () =>
      scheduledEvents
        .filter((e) => e.status === "scheduled" && new Date(e.startTime) >= new Date())
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [scheduledEvents]
  )

  const pastEvents = useMemo(
    () =>
      scheduledEvents
        .filter((e) => e.status !== "scheduled" || new Date(e.startTime) < new Date())
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 10),
    [scheduledEvents]
  )

  const filteredThreads = useMemo(() => {
    let threads = messageThreads.filter((t) => !t.isArchived)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      threads = threads.filter(
        (t) =>
          t.contactName?.toLowerCase().includes(q) ||
          t.contactEmail.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q)
      )
    }

    if (messageFilter === "starred") {
      threads = threads.filter((t) => t.isStarred)
    } else if (messageFilter === "unread") {
      threads = threads.filter((t) => t.unreadCount > 0)
    }

    return threads
  }, [messageThreads, searchQuery, messageFilter])

  const filteredLogs = useMemo(() => {
    let logs = communicationLog

    if (logFilter !== "all") {
      logs = logs.filter((l) => l.contactId === logFilter)
    }

    if (logTypeFilter !== "all") {
      logs = logs.filter((l) => l.communicationType === logTypeFilter)
    }

    return logs
  }, [communicationLog, logFilter, logTypeFilter])

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, CommunicationLog[]> = {}
    filteredLogs.forEach((log) => {
      const date = format(new Date(log.communicationDate), "yyyy-MM-dd")
      if (!groups[date]) groups[date] = []
      groups[date].push(log)
    })
    return groups
  }, [filteredLogs])

  const sortedLogDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a))

  // Calculate unread count from threads directly for accuracy
  const unreadCount = useMemo(() => {
    return messageThreads
      .filter(t => !t.isArchived)
      .reduce((sum, t) => sum + (t.unreadCount || 0), 0)
  }, [messageThreads])

  // Count of threads with unread messages (for the badge)
  const unreadThreadCount = useMemo(() => {
    return messageThreads.filter(t => !t.isArchived && t.unreadCount > 0).length
  }, [messageThreads])

  // Handlers
  const handleCreateEvent = async (
    event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
    invitees: { email: string; name?: string; contactId?: string }[]
  ) => {
    await createEvent(event, invitees)
  }

  const handleSendNewMessage = async (
    contactEmail: string,
    contactName: string | undefined,
    contactId: string | undefined,
    subject: string | undefined,
    message: string,
    attachedFiles?: File[]
  ) => {
    const thread = await createThread(contactEmail, contactName, contactId, subject)
    if (thread) {
      const newMessage = await sendMessage(thread, message, attachedFiles)
      const updatedThread = { ...thread, messages: [newMessage] }
      setSelectedThread(updatedThread)
      setActiveTab("messages")
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFiles = Array.from(e.dataTransfer.files)
    setAttachedFiles((prev) => [...prev, ...droppedFiles])
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleSendReply = async () => {
    if (!selectedThread || (!newMessageContent.trim() && attachedFiles.length === 0)) return
    const recipient = getOtherPartyInfo(selectedThread, currentUser ? { id: currentUser.id, email: currentUser.email || '' } : null, contacts).email
    const newMessage = await sendMessage(selectedThread, newMessageContent.trim(), attachedFiles, recipient)
    const updatedThread = { ...selectedThread, messages: [...selectedThread.messages, newMessage] }
    setSelectedThread(updatedThread)
    setNewMessageContent("")
    setAttachedFiles([])
  }

  const handleSelectThread = (thread: MessageThread) => {
    setSelectedThread(thread)
    if (thread.unreadCount > 0) {
      markThreadAsRead(thread.id)
    }
  }

  const handleEditMessage = async (threadId: string, messageId: string, newContent: string, newAttachments?: File[], attachmentsToRemove?: string[]) => {
    await editMessage(threadId, messageId, newContent, newAttachments, attachmentsToRemove)
  }

  const handleDeleteMessage = async (threadId: string, messageId: string) => {
    await deleteMessage(threadId, messageId)
  }

  const handleDeleteLog = async (id: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      await deleteCommunication(id)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(id)
    }
  }

  const handleCompleteEvent = async (id: string) => {
    await updateEvent(id, { status: "completed" })
  }

  // Stats
  const totalEvents = scheduledEvents.filter((e) => e.status === "scheduled").length
  const totalLogs = communicationLog.length

  // Create currentUser object for passing to components
  const currentUserInfo = currentUser ? { id: currentUser.id, email: currentUser.email || '' } : null

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading communication hub...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Header />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b bg-primary">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/10">
                <Link href="/services/command-center">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Communication Hub</h1>
                <p className="text-white/80 mt-1">
                  Schedule, message, and track all communications in one place
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
                onClick={() => setIsLogDialogOpen(true)}
              >
                <History className="w-4 h-4 mr-2" />
                Log Communication
              </Button>
              <Button
                className="bg-white text-primary hover:bg-white/90 cursor-pointer"
                onClick={() => setIsEventDialogOpen(true)}
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Schedule Event
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalEvents}</p>
                  <p className="text-sm text-white/70">Upcoming Events</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {unreadCount > 0 ? unreadCount : messageThreads.length}
                  </p>
                  <p className="text-sm text-white/70">
                    {unreadCount > 0 ? "Unread Messages" : "Total Threads"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalLogs}</p>
                  <p className="text-sm text-white/70">Communication Logs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="sm:hidden flex gap-2 p-4 border-b bg-background">
        <Button variant="outline" className="flex-1" onClick={() => setIsLogDialogOpen(true)}>
          <History className="w-4 h-4 mr-2" />
          Log
        </Button>
        <Button className="flex-1" onClick={() => setIsEventDialogOpen(true)}>
          <CalendarPlus className="w-4 h-4 mr-2" />
          Schedule
        </Button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/50 p-1">
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
              {unreadThreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-[20px]">
                  {unreadThreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <History className="w-4 h-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* SCHEDULE TAB */}
          {/* ============================================ */}
          <TabsContent value="schedule" className="space-y-6">
            {upcomingEvents.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
                  <Button variant="outline" size="sm" onClick={() => setIsEventDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => {
                        setEditingEvent(event)
                        setIsEventDialogOpen(true)
                      }}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onComplete={() => handleCompleteEvent(event.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-card border rounded-2xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-6">
                  Schedule calls, meetings, and reminders with your contacts
                </p>
                <Button onClick={() => setIsEventDialogOpen(true)}>
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Schedule Your First Event
                </Button>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Past Events</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
                  {pastEvents.slice(0, 6).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => {
                        setEditingEvent(event)
                        setIsEventDialogOpen(true)
                      }}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onComplete={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ============================================ */}
          {/* MESSAGES TAB */}
          {/* ============================================ */}
          <TabsContent value="messages">
            <div className="bg-card border rounded-2xl overflow-hidden min-h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
                {/* Thread List */}
                <div className="border-r flex flex-col">
                  <div className="p-3 border-b space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search messages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Button size="icon" onClick={() => setIsMessageDialogOpen(true)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      {(["all", "unread", "starred"] as const).map((filter) => (
                        <Button
                          key={filter}
                          variant={messageFilter === filter ? "default" : "ghost"}
                          size="sm"
                          className="capitalize"
                          onClick={() => setMessageFilter(filter)}
                        >
                          {filter}
                          {filter === "unread" && unreadThreadCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-4 min-w-[16px] text-[10px]">
                              {unreadThreadCount}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    {filteredThreads.length > 0 ? (
                      filteredThreads.map((thread) => (
                        <ThreadListItem
                          key={thread.id}
                          thread={thread}
                          isSelected={selectedThread?.id === thread.id}
                          contacts={contacts}
                          onClick={() => handleSelectThread(thread)}
                          onStar={() => toggleThreadStar(thread.id)}
                          onDelete={() => {
                            if (confirm("Are you sure you want to delete this thread? This thread will be deleted for both you and your contact, and it cannot be undone.")) {
                              deleteThread(thread.id)
                              if (selectedThread && selectedThread.id === thread.id) {setSelectedThread(null)}
                            }}
                          }
                          currentUser={currentUserInfo}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          {messageFilter === "unread" 
                            ? "No unread messages" 
                            : messageFilter === "starred"
                            ? "No starred messages"
                            : "No messages yet"}
                        </p>
                        {messageFilter === "all" && (
                          <Button
                            variant="link"
                            className="mt-2"
                            onClick={() => setIsMessageDialogOpen(true)}
                          >
                            Start a conversation
                          </Button>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Message View */}
                <div className="col-span-2 flex flex-col h-full min-h-0">
                  {selectedThread ? (
                    <>
                      {/* Thread Header */}
                      <ThreadHeader
                        thread={selectedThread}
                        currentUser={currentUserInfo}
                        contacts={contacts}
                        onStar={() => toggleThreadStar(selectedThread.id)}
                        onDelete={() => {
                          if (confirm("Are you sure you want to delete this thread? This thread will be deleted for both you and your contact, and it cannot be undone.")) {
                            deleteThread(selectedThread.id)
                            setSelectedThread(null)
                          }
                        }}
                      />

                      {/* Messages */}
                      <ScrollArea className="flex-1 min-h-0 p-4 overflow-y-auto" ref={scrollAreaRef}>
                        <div className="space-y-4">
                          {selectedThread.messages.map((message) => (
                            <MessageBubble
                              key={message.id}
                              message={message}
                              isCurrentUser={message.senderId === currentUser?.id || message.senderEmail === currentUser?.email}
                              onEdit={(newContent, newAttachments, attachmentsToRemove) => handleEditMessage(selectedThread.id, message.id, newContent, newAttachments, attachmentsToRemove)}
                              onDelete={() => handleDeleteMessage(selectedThread.id, message.id)}
                            />
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Compose */}
                      <div
                        className={`p-4 border-t transition-colors ${
                          isDragging ? "bg-indigo-50 border-indigo-400" : ""
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >

                        {/* hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          hidden
                          onChange={handleFilesSelected}
                        />

                        {/* PREVIEW ROW */}
                        {attachedFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {attachedFiles.map((file, i) => (
                              <div
                                key={i}
                                className="relative border rounded-lg p-2 bg-muted text-xs flex items-center gap-2"
                              >
                                {file.type.startsWith("image/") ? (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    className="h-12 w-12 object-cover rounded"
                                  />
                                ) : (
                                  <span className="truncate max-w-[120px]">{file.name}</span>
                                )}

                                <button
                                  onClick={() => removeFile(i)}
                                  className="absolute -top-2 -right-2 bg-black text-white rounded-full w-4 h-4 text-[10px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type your message..."
                            value={newMessageContent}
                            onChange={(e) => setNewMessageContent(e.target.value)}
                            className="min-h-[80px] resize-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendReply()
                              }
                            }}
                          />

                          <div>
                            <Button
                              className="mb-2 cursor-pointer"
                              onClick={handleFileClick}
                              type="button"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>

                            <Button
                              className="self-end cursor-pointer"
                              onClick={handleSendReply}
                              disabled={!newMessageContent.trim() && attachedFiles.length === 0}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                        <p className="text-muted-foreground mb-4">
                          Choose a thread from the list or start a new conversation
                        </p>
                        <Button onClick={() => setIsMessageDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          New Message
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* LOGS TAB */}
          {/* ============================================ */}
          <TabsContent value="logs" className="space-y-6">
            {/* Filters */}
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium">Filters</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Select value={logFilter} onValueChange={setLogFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contacts</SelectItem>
                      {contactOptions.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="message">Text/Message</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Logs List */}
            {filteredLogs.length > 0 ? (
              <div className="space-y-6">
                {sortedLogDates.map((date) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </h3>
                    <div className="space-y-3">
                      {groupedLogs[date]
                        .sort(
                          (a, b) =>
                            new Date(b.communicationDate).getTime() -
                            new Date(a.communicationDate).getTime()
                        )
                        .map((log) => {
                          const contact = contacts.find((c) => c.id === log.contactId)
                          return (
                            <CommunicationLogCard
                              key={log.id}
                              log={log}
                              contactName={contact?.contactName || log.contactName}
                              onEdit={() => {
                                setEditingLog(log)
                                setIsLogDialogOpen(true)
                              }}
                              onDelete={() => handleDeleteLog(log.id)}
                            />
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border rounded-2xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <History className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {communicationLog.length === 0
                    ? "No communication logs yet"
                    : "No logs match your filters"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {communicationLog.length === 0
                    ? "Start tracking your communications for future reference"
                    : "Try adjusting your filters to see more results"}
                </p>
                {communicationLog.length === 0 && (
                  <Button onClick={() => setIsLogDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Log
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Dialogs */}
      {/* Dialogs */}
      <ScheduleEventDialog
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open)
          if (!open) setEditingEvent(null)
        }}
        onSave={handleCreateEvent}
        contacts={contactOptions}
        editingEvent={editingEvent}
      />

      <NewMessageDialog
        open={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        onSend={handleSendNewMessage}
        contacts={contactOptions}
      />

      <NewMessageDialog
        open={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        onSend={handleSendNewMessage}
        contacts={contactOptions}
      />

      <AddCommunicationDialog
        open={isLogDialogOpen}
        onOpenChange={(open) => {
          setIsLogDialogOpen(open)
          if (!open) setEditingLog(null)
        }}
        onSave={addCommunication}
        contacts={contactOptions}
        editingLog={editingLog}
      />

      {/* Sync indicator */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Syncing...</span>
        </div>
      )}

      {/* Error indicator */}
      {syncError && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{syncError}</span>
        </div>
      )}
    </div>
  )
}