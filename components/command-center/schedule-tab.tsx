"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Plus, Repeat, Clock, Phone, Video, Users, Trash2, Edit,
  Calendar, Mail, ChevronsUpDown, CalendarPlus, MoreVertical,
  Check, X, ExternalLink, Bell, MapPin, Link as LinkIcon,
  AlertCircle, ChevronRight, SkipForward,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScheduledEvent, EventType } from "@/lib/types"
import { useCommunicationHub } from "@/hooks/use-communication-hub"
import { format, isToday, isTomorrow, isThisWeek, addHours } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { InvitationsInbox } from "@/components/command-center/event-invitations"
import { Switch } from "@/components/ui/switch"

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

function getRecurrenceSummary(event: ScheduledEvent): string | null {
  if (!event.isRecurring) return null

  const interval = event.recurrenceInterval || 1
  const pattern = event.recurrencePattern || "weekly"

  let summary = `Every ${interval > 1 ? interval + " " : ""}${
    pattern === "daily"
      ? interval > 1 ? "days" : "day"
      : pattern === "weekly"
        ? interval > 1 ? "weeks" : "week"
        : interval > 1 ? "months" : "month"
  }`

  if (event.recurrenceEndDate) {
    summary += ` until ${format(new Date(event.recurrenceEndDate + "T00:00:00"), "MMM d, yyyy")}`
  } else if (event.recurrenceCount) {
    summary += ` · ${event.recurrenceCount} occurrences`
  }

  return summary
}

// ============================================
// SCHEDULE EVENT DIALOG
// ============================================

export function ScheduleEventDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  contacts,
  editingEvent,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
    invitees: { email: string; name?: string; contactId?: string }[]
  ) => void
  onUpdate: (
    eventId: string,
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
  const [emails, setEmails] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Recurring event states
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [recurrenceInterval, setRecurrenceInterval] = useState("1")
  const [recurrenceEndType, setRecurrenceEndType] = useState<"never" | "date" | "count">("never")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
  const [recurrenceCount, setRecurrenceCount] = useState("10")

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
      setEmails(editingEvent.invitations.map((i) => i.inviteeEmail))

      // Load recurrence data
      setIsRecurring(editingEvent.isRecurring || false)
      setRecurrencePattern(editingEvent.recurrencePattern || "weekly")
      setRecurrenceInterval((editingEvent.recurrenceInterval || 1).toString())

      // FIX: Correctly determine end type from data
      if (editingEvent.recurrenceEndDate) {
        setRecurrenceEndType("date")
        setRecurrenceEndDate(format(new Date(editingEvent.recurrenceEndDate + "T00:00:00"), "yyyy-MM-dd"))
        setRecurrenceCount("10") // reset the other
      } else if (editingEvent.recurrenceCount) {
        setRecurrenceEndType("count")
        setRecurrenceCount(editingEvent.recurrenceCount.toString())
        setRecurrenceEndDate("") // reset the other
      } else {
        setRecurrenceEndType("never")
        setRecurrenceEndDate("")
        setRecurrenceCount("10")
      }
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
      setEmails([])
      setIsRecurring(false)
      setRecurrencePattern("weekly")
      setRecurrenceInterval("1")
      setRecurrenceEndType("never")
      setRecurrenceEndDate("")
      setRecurrenceCount("10")
    }
  }, [editingEvent, open])

  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase()
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    )
  }, [contacts, search])

  const addEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase()
    if (trimmed && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed])
    }
  }

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email))
  }

  const handleSave = () => {
    if (!title || !date || !time) return

    const startTime = new Date(`${date}T${time}`).toISOString()
    const durationMinutes = parseInt(duration) || 30
    const endTime = new Date(
      new Date(startTime).getTime() + durationMinutes * 60000
    ).toISOString()

    const invitees: { email: string; name?: string; contactId?: string }[] = []
    emails.forEach((email) => {
      const contact = contacts.find((c) => c.email === email || c.id === email)
      if (contact?.email) {
        invitees.push({
          email: contact.email,
          name: contact.name,
          contactId: contact.id,
        })
      } else if (email.includes("@")) {
        invitees.push({ email })
      }
    })

    const eventData: any = {
      title,
      description: description.trim() || undefined,
      eventType,
      startTime,
      endTime,
      durationMinutes,
      location: location.trim() || undefined,
      meetingLink: meetingLink.trim() || undefined,
      isRecurring,
      status: "scheduled" as const,
      notes: notes.trim() || undefined,
    }

    // FIX: Build recurrence fields with mutual exclusivity
    if (isRecurring) {
      eventData.recurrencePattern = recurrencePattern
      eventData.recurrenceInterval = parseInt(recurrenceInterval) || 1

      // Only set the active end type; explicitly null the other
      if (recurrenceEndType === "date" && recurrenceEndDate) {
        eventData.recurrenceEndDate = new Date(recurrenceEndDate).toISOString()
        eventData.recurrenceCount = undefined
      } else if (recurrenceEndType === "count") {
        eventData.recurrenceCount = parseInt(recurrenceCount) || 10
        eventData.recurrenceEndDate = undefined
      } else {
        // "never" — clear both
        eventData.recurrenceEndDate = undefined
        eventData.recurrenceCount = undefined
      }
    } else {
      // Not recurring — clear all recurrence fields
      eventData.recurrencePattern = undefined
      eventData.recurrenceInterval = undefined
      eventData.recurrenceEndDate = undefined
      eventData.recurrenceCount = undefined
    }

    if (editingEvent) {
      onUpdate(editingEvent.id, eventData, invitees)
    } else {
      onSave(eventData, invitees)
    }

    onOpenChange(false)
  }

  const recurrenceSummaryText = useMemo(() => {
    if (!isRecurring) return null

    const interval = parseInt(recurrenceInterval) || 1
    let summary = `Repeats every ${interval > 1 ? interval + " " : ""}${
      recurrencePattern === "daily"
        ? interval > 1 ? "days" : "day"
        : recurrencePattern === "weekly"
          ? interval > 1 ? "weeks" : "week"
          : interval > 1 ? "months" : "month"
    }`
    if (recurrenceEndType === "date" && recurrenceEndDate) {
      summary += ` until ${format(new Date(recurrenceEndDate + "T00:00:00"), "MMM d, yyyy")}`
    } else if (recurrenceEndType === "count") {
      summary += ` for ${recurrenceCount} occurrences`
    }
    return summary
  }, [isRecurring, recurrenceInterval, recurrencePattern, recurrenceEndType, recurrenceEndDate, recurrenceCount])

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
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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

          {/* Recurring Event Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-500" />
                <Label htmlFor="recurring" className="cursor-pointer font-medium">
                  Recurring Event
                </Label>
              </div>
              <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>

            {isRecurring && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pattern">Repeat Pattern</Label>
                    <Select value={recurrencePattern} onValueChange={(v: any) => setRecurrencePattern(v)}>
                      <SelectTrigger id="pattern">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">Repeat Every</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="interval"
                        type="number"
                        min="1"
                        max="30"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {recurrencePattern === "daily"
                          ? parseInt(recurrenceInterval) > 1 ? "days" : "day"
                          : recurrencePattern === "weekly"
                          ? parseInt(recurrenceInterval) > 1 ? "weeks" : "week"
                          : parseInt(recurrenceInterval) > 1 ? "months" : "month"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Ends</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="never"
                        name="endType"
                        checked={recurrenceEndType === "never"}
                        onChange={() => setRecurrenceEndType("never")}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="never" className="cursor-pointer font-normal">Never</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="onDate"
                        name="endType"
                        checked={recurrenceEndType === "date"}
                        onChange={() => setRecurrenceEndType("date")}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="onDate" className="cursor-pointer font-normal">On</Label>
                      <Input
                        type="date"
                        value={recurrenceEndDate}
                        onChange={(e) => {
                          setRecurrenceEndDate(e.target.value)
                          setRecurrenceEndType("date")
                        }}
                        disabled={recurrenceEndType !== "date"}
                        className="flex-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="afterCount"
                        name="endType"
                        checked={recurrenceEndType === "count"}
                        onChange={() => setRecurrenceEndType("count")}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="afterCount" className="cursor-pointer font-normal">After</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={recurrenceCount}
                        onChange={(e) => {
                          setRecurrenceCount(e.target.value)
                          setRecurrenceEndType("count")
                        }}
                        disabled={recurrenceEndType !== "count"}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">occurrences</span>
                    </div>
                  </div>
                </div>

                {recurrenceSummaryText && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                    <p className="text-sm text-indigo-900 dark:text-indigo-100">
                      <Calendar className="w-4 h-4 inline mr-1.5" />
                      {recurrenceSummaryText}
                    </p>
                  </div>
                )}
              </div>
            )}
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

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Invitations
            </Label>

            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-10">
                  <span className="text-muted-foreground font-normal">Search name or type email…</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Type name or email and press Enter…"
                    value={search}
                    onValueChange={setSearch}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && search.trim()) {
                        addEmail(search)
                        setSearch("")
                        setPickerOpen(false)
                      }
                    }}
                  />
                  <CommandEmpty>
                    Press Enter to add &ldquo;{search}&rdquo;
                  </CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {filteredContacts.map((contact) => (
                      <CommandItem
                        key={contact.id}
                        onSelect={() => {
                          addEmail(contact.email || "")
                          setSearch("")
                          setPickerOpen(false)
                        }}
                      >
                        {contact.name}
                        <span className="ml-2 text-muted-foreground text-xs">{contact.email}</span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            emails.includes(contact.email || "") ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {emails.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Shared with
                </Label>
                <div className="space-y-1.5">
                  {emails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-2.5 border rounded-xl bg-muted/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <span className="text-sm">{email}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeEmail(email)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title || !date || !time}>
            {editingEvent ? "Save Changes" : "Schedule Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// EVENT CARD
// ============================================

function EventCard({
  event,
  user,
  onEdit,
  onDelete,
  onComplete,
  compact = false,
}: {
  event: ScheduledEvent
  user: string
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
  compact?: boolean
}) {
  const Icon = eventTypeIcons[event.eventType]
  const colorClass = eventTypeColors[event.eventType]
  const isPast = new Date(event.startTime) < new Date()
  const isCompleted = event.status === "completed"

  const acceptedCount = event.invitations.filter((i) => i.status === "accepted").length
  const pendingCount = event.invitations.filter((i) => i.status === "pending").length
  const totalInvited = event.invitations.length
  const isOwner = event.user_id === user

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-4 hover:shadow-md transition-all",
        isCompleted && "opacity-50",
        isPast && !isCompleted && "opacity-70",
        compact && "p-3"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn(
            "rounded-xl flex items-center justify-center",
            colorClass,
            compact ? "w-8 h-8" : "w-10 h-10"
          )}>
            <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn(
                "font-semibold text-foreground",
                isCompleted && "line-through",
                compact && "text-sm"
              )}>
                {event.title}
              </h3>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                  <Check className="w-3 h-3" />
                  Done
                </span>
              )}
              {event.isRecurring && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                  <Repeat className="w-3 h-3" />
                  Series
                </span>
              )}
            </div>

            <p className={cn(
              "text-muted-foreground flex items-center gap-1.5 mt-1",
              compact ? "text-xs" : "text-sm"
            )}>
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              {formatEventDate(event.startTime)}
              {event.durationMinutes && (
                <span className="text-muted-foreground/60">
                  · {event.durationMinutes}m
                </span>
              )}
            </p>

            {event.isRecurring && !compact && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                {getRecurrenceSummary(event)}
              </p>
            )}

            {event.location && !compact && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </p>
            )}

            {totalInvited > 0 && !compact && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex -space-x-2">
                  {event.invitations.slice(0, 3).map((inv) => (
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

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {event.status === "scheduled" && !isPast && (
                <DropdownMenuItem onClick={onComplete}>
                  {event.isRecurring ? (
                    <>
                      <SkipForward className="w-4 h-4 mr-2" />
                      Complete &amp; Create Next
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mark Complete
                    </>
                  )}
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
        )}
      </div>
    </div>
  )
}

function advanceByInterval(
  date: Date,
  pattern: "daily" | "weekly" | "monthly",
  interval: number
): Date {
  const next = new Date(date)
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

function getNextFutureOccurrence(
  event: ScheduledEvent,
  allEvents: ScheduledEvent[],
  now: Date = new Date()
): Date | null {
  if (!event.isRecurring || !event.recurrencePattern) return null

  const pattern = event.recurrencePattern
  const interval = event.recurrenceInterval || 1
  const endDate = event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : null

  let candidate = new Date(event.startTime)

  // Step forward until we pass `now`
  // Safety cap to prevent infinite loops (max 1000 iterations ≈ ~3 years of daily)
  let iterations = 0
  while (candidate <= now && iterations < 1000) {
    candidate = advanceByInterval(candidate, pattern, interval)
    iterations++
  }

  // Check end-date limit
  if (endDate && candidate > endDate) return null

  // Check occurrence-count limit
  if (event.recurrenceCount) {
    // Count how many events in this series already exist (completed or scheduled)
    const seriesCount = allEvents.filter(
      (e) =>
        e.title === event.title &&
        e.isRecurring &&
        e.recurrencePattern === event.recurrencePattern
    ).length
    if (seriesCount >= event.recurrenceCount) return null
  }

  return candidate
}

// ============================================
// SCHEDULE TAB
// ============================================

export function ScheduleTab() {
  const {
    contacts,
    scheduledEvents,
    isLoaded,
    isSyncing,
    syncError,
    currentUser,
    createEvent,
    updateEvent,
    deleteEvent,
    respondToInvitation,
  } = useCommunicationHub()

  // Check if completeRecurringEvent exists on the hook
  const hub = useCommunicationHub()
  const completeRecurringEvent = hub.completeRecurringEvent

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null)
  const [showAllPast, setShowAllPast] = useState(false)
  const [advancedIds, setAdvancedIds] = useState<Set<string>>(new Set())

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: c.contactName,
    email: c.email,
  }))

  useEffect(() => {
    if (!isLoaded || isSyncing) return

    const now = new Date()

    // Find recurring events that are past and still "scheduled"
    // (i.e., the user never completed them — time just passed)
    const pastRecurring = scheduledEvents.filter(
      (e) =>
        e.isRecurring &&
        e.recurrencePattern &&
        e.status === "scheduled" &&
        new Date(e.startTime) < now &&
        !advancedIds.has(e.id)
    )

    if (pastRecurring.length === 0) return

    // For each, check if a future scheduled sibling already exists
    const advance = async () => {
      const newAdvancedIds = new Set(advancedIds)

      for (const event of pastRecurring) {
        // Check if there's already a future scheduled event in the same series
        const hasFutureSibling = scheduledEvents.some(
          (e) =>
            e.id !== event.id &&
            e.title === event.title &&
            e.isRecurring &&
            e.recurrencePattern === event.recurrencePattern &&
            e.status === "scheduled" &&
            new Date(e.startTime) >= now
        )

        if (hasFutureSibling) {
          // Mark current as completed since it's past and a future one exists
          newAdvancedIds.add(event.id)
          await updateEvent(event.id, { status: "completed" })
          continue
        }

        const nextDate = getNextFutureOccurrence(event, scheduledEvents, now)

        if (!nextDate) {
          // Series has ended — just mark as completed
          newAdvancedIds.add(event.id)
          await updateEvent(event.id, { status: "completed" })
          continue
        }

        // Mark the past occurrence as completed
        await updateEvent(event.id, { status: "completed" })

        // Create the next future occurrence
        const durationMs = (event.durationMinutes || 30) * 60000
        const nextEnd = new Date(nextDate.getTime() + durationMs)

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
            startTime: nextDate.toISOString(),
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

        newAdvancedIds.add(event.id)
      }

      setAdvancedIds(newAdvancedIds)
    }

    advance()
  }, [isLoaded, scheduledEvents, isSyncing])

  // Upcoming: scheduled + in the future
  const upcomingEvents = useMemo(() => {
    const now = Date.now()
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
    const cutoff = now + THIRTY_DAYS

    return scheduledEvents
      .filter((e) => e.status === "scheduled" && new Date(e.startTime) >= new Date())
      .filter((e) => {
        const start = new Date(e.startTime).getTime()
        return start <= cutoff
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [scheduledEvents])

  // Past / completed events, grouped by recurring series
  const pastEvents = useMemo(() => {
    const now = Date.now()
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
    const cutoff = now - THIRTY_DAYS

    return scheduledEvents
      .filter((e) => e.status === "completed" || (e.status === "cancelled") || (e.status !== "scheduled") || new Date(e.startTime) < new Date())
      .filter((e) => !(e.status === "scheduled" && new Date(e.startTime) >= new Date()))
      .filter((e) => {
        const start = new Date(e.startTime).getTime()
        return start >= cutoff
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [scheduledEvents])

  const visiblePastEvents = showAllPast ? pastEvents : pastEvents.slice(0, 6)

  // Handlers
  const handleCreateEvent = async (
    event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
    invitees: { email: string; name?: string; contactId?: string }[]
  ) => {
    await createEvent(event, invitees)
  }

  const handleUpdateEvent = async (
    eventId: string,
    event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
    invitees: { email: string; name?: string; contactId?: string }[]
  ) => {
    await updateEvent(eventId, event, invitees)
  }

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(id)
    }
  }

  const handleCompleteEvent = async (id: string) => {
    const event = scheduledEvents.find((e) => e.id === id)
    if (!event) return

    // Mark current as completed
    await updateEvent(id, { status: "completed" })

    // For recurring events, create the next occurrence
    if (event.isRecurring && event.recurrencePattern) {
      const now = new Date()
      const nextDate = getNextFutureOccurrence(event, scheduledEvents, now)

      if (!nextDate) return // Series ended

      // Check if a future sibling already exists (maybe auto-advance already created one)
      const hasFutureSibling = scheduledEvents.some(
        (e) =>
          e.id !== event.id &&
          e.title === event.title &&
          e.isRecurring &&
          e.recurrencePattern === event.recurrencePattern &&
          e.status === "scheduled" &&
          new Date(e.startTime) >= now
      )
      if (hasFutureSibling) return

      const durationMs = (event.durationMinutes || 30) * 60000
      const nextEnd = new Date(nextDate.getTime() + durationMs)

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
          startTime: nextDate.toISOString(),
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
  }

  const myInvitations = useMemo(() => {
    if (!currentUser?.email) return []
    return scheduledEvents.flatMap((event) =>
      event.invitations
        .filter((inv) => inv.inviteeEmail === currentUser.email)
        .map((inv) => inv)
    )
  }, [scheduledEvents, currentUser])

  const pendingCount = myInvitations.filter((i) => i.status === "pending").length

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
    <>
      <TabsContent value="schedule" className="space-y-6">
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {upcomingEvents.length}
                </span>
              </div>
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
                  user={currentUser?.id || ""}
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

        {/* Past / Completed Events */}
        {pastEvents.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Past Events (Last 30 Days)</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {pastEvents.length}
                </span>
              </div>
              {pastEvents.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllPast((v) => !v)}
                  className="text-muted-foreground"
                >
                  {showAllPast ? "Show less" : `Show all ${pastEvents.length}`}
                  <ChevronRight className={cn("w-4 h-4 ml-1 transition-transform", showAllPast && "rotate-90")} />
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePastEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  user={currentUser?.id || ""}
                  compact
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

        {/* Invitations */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-foreground">My Invitations</h2>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-xs font-bold">
                {pendingCount} pending
              </span>
            )}
          </div>
          <InvitationsInbox
            invitations={myInvitations}
            events={scheduledEvents}
            onRespond={respondToInvitation}
          />
        </div>
      </TabsContent>

      <ScheduleEventDialog
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open)
          if (!open) setEditingEvent(null)
        }}
        onSave={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        contacts={contactOptions}
        editingEvent={editingEvent}
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
    </>
  )
}