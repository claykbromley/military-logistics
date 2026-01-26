"use client"

import React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Calendar,
  Plus,
  ArrowLeft,
  Home,
  Gift,
  Heart,
  Star,
  Package,
  ChevronDown,
  Trash2,
  Edit,
  Clock,
  MapPin,
  Settings,
  PartyPopper,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCalendar, type CalendarEvent, type EventType, type DeploymentInfo } from "@/hooks/use-calendar"

const eventTypes: { value: EventType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "homecoming", label: "Homecoming", icon: <Home className="w-4 h-4" />, color: "text-accent" },
  { value: "birthday", label: "Birthday", icon: <Gift className="w-4 h-4" />, color: "text-pink-500" },
  { value: "anniversary", label: "Anniversary", icon: <Heart className="w-4 h-4" />, color: "text-red-500" },
  { value: "holiday", label: "Holiday", icon: <Star className="w-4 h-4" />, color: "text-amber-500" },
  { value: "milestone", label: "Milestone", icon: <PartyPopper className="w-4 h-4" />, color: "text-blue-500" },
  { value: "care_package", label: "Care Package", icon: <Package className="w-4 h-4" />, color: "text-green-500" },
  { value: "other", label: "Other", icon: <Calendar className="w-4 h-4" />, color: "text-muted-foreground" },
]

function getEventTypeInfo(type: EventType) {
  return eventTypes.find((t) => t.value === type) || eventTypes[6]
}

function getDaysUntil(date: string): number {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function CountdownDisplay({ days, label }: { days: number; label: string }) {
  const absdays = Math.abs(days)
  const isPast = days < 0

  return (
    <div className="text-center">
      <div className={`text-5xl font-bold ${isPast ? "text-muted-foreground" : "text-accent"}`}>
        {absdays}
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {isPast ? `days since ${label}` : `days until ${label}`}
      </div>
    </div>
  )
}

function EventCard({
  event,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
}) {
  const typeInfo = getEventTypeInfo(event.eventType)
  const daysUntil = getDaysUntil(event.eventDate)
  const isPast = daysUntil < 0
  const isToday = daysUntil === 0
  const isSoon = daysUntil > 0 && daysUntil <= 7

  return (
    <div
      className={`bg-card border rounded-lg p-4 transition-all ${
        isToday ? "border-accent ring-1 ring-accent/20" : isSoon ? "border-accent/50" : "border-border"
      } ${isPast ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${typeInfo.color}`}>
            {typeInfo.icon}
          </div>
          <div>
            <h3 className="font-medium text-foreground">{event.eventName}</h3>
            <p className="text-sm text-muted-foreground">{formatDate(event.eventDate)}</p>
            {event.notes && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.notes}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              isToday
                ? "bg-accent text-accent-foreground"
                : isSoon
                ? "bg-accent/10 text-accent"
                : isPast
                ? "bg-muted text-muted-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {isToday ? "Today!" : isPast ? `${Math.abs(daysUntil)}d ago` : `${daysUntil}d`}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDown className="w-4 h-4" />
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
    </div>
  )
}

function AddEventDialog({
  open,
  onOpenChange,
  onSave,
  editingEvent,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (event: Omit<CalendarEvent, "id" | "createdAt">) => void
  editingEvent?: CalendarEvent | null
}) {
  const [name, setName] = useState(editingEvent?.eventName || "")
  const [type, setType] = useState<EventType>(editingEvent?.eventType || "other")
  const [date, setDate] = useState(editingEvent?.eventDate?.split("T")[0] || "")
  const [notes, setNotes] = useState(editingEvent?.notes || "")

  const handleSave = () => {
    if (!name.trim() || !date) return
    onSave({
      eventName: name.trim(),
      eventType: type,
      eventDate: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
      isRecurring: type === "birthday" || type === "anniversary" || type === "holiday",
    })
    setName("")
    setType("other")
    setDate("")
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingEvent ? "Edit Event" : "Add Event"}</DialogTitle>
          <DialogDescription>
            Add important dates to track during your deployment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mom's Birthday, Wedding Anniversary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as EventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((et) => (
                    <SelectItem key={et.value} value={et.value}>
                      <span className="flex items-center gap-2">
                        {et.icon}
                        {et.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Gift ideas, plans, reminders..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !date}>
            {editingEvent ? "Save Changes" : "Add Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeploymentSettingsDialog({
  open,
  onOpenChange,
  deploymentInfo,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  deploymentInfo: DeploymentInfo
  onSave: (info: DeploymentInfo) => void
}) {
  const [startDate, setStartDate] = useState(deploymentInfo.startDate?.split("T")[0] || "")
  const [returnDate, setReturnDate] = useState(deploymentInfo.expectedReturnDate?.split("T")[0] || "")
  const [location, setLocation] = useState(deploymentInfo.location || "")

  const handleSave = () => {
    onSave({
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      expectedReturnDate: returnDate ? new Date(returnDate).toISOString() : undefined,
      location: location.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deployment Settings</DialogTitle>
          <DialogDescription>
            Set your deployment dates for the countdown tracker.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Deployment Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="return-date">Expected Return Date</Label>
            <Input
              id="return-date"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., CENTCOM AOR"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CalendarPage() {
  const {
    events,
    deploymentInfo,
    isLoaded,
    addEvent,
    updateEvent,
    deleteEvent,
    setDeploymentInfo,
    getUpcomingEvents,
    getDaysUntilHomecoming,
    getDaysSinceDeployment,
  } = useCalendar()

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const upcomingEvents = getUpcomingEvents()
  const daysUntilHomecoming = getDaysUntilHomecoming()
  const daysSinceDeployment = getDaysSinceDeployment()

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}
    upcomingEvents.forEach((event) => {
      const monthKey = new Date(event.eventDate).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(event)
    })
    return grouped
  }, [upcomingEvents])

  const handleSaveEvent = (eventData: Omit<CalendarEvent, "id" | "createdAt">) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData)
      setEditingEvent(null)
    } else {
      addEvent(eventData)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Deployment Countdown & Calendar</h1>
                <p className="text-sm text-muted-foreground">
                  Track important dates and count down to homecoming
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button onClick={() => setIsEventDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Countdown Hero */}
        <div className="bg-card border rounded-lg p-8 mb-8">
          {daysUntilHomecoming !== null ? (
            <div className="grid sm:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                {daysSinceDeployment !== null && (
                  <div>
                    <div className="text-3xl font-bold text-muted-foreground">{daysSinceDeployment}</div>
                    <div className="text-sm text-muted-foreground">days deployed</div>
                  </div>
                )}
              </div>
              <CountdownDisplay days={daysUntilHomecoming} label="homecoming" />
              <div className="text-center">
                {deploymentInfo.location && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{deploymentInfo.location}</span>
                  </div>
                )}
                {deploymentInfo.expectedReturnDate && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Expected: {formatDate(deploymentInfo.expectedReturnDate)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">Set Your Deployment Dates</h3>
              <p className="text-muted-foreground mb-4">
                Configure your deployment dates to see the countdown to homecoming.
              </p>
              <Button onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Configure Dates
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {eventTypes.slice(0, 4).map((type) => {
            const count = events.filter((e) => e.eventType === type.value).length
            return (
              <div key={type.value} className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className={`${type.color}`}>{type.icon}</div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-sm text-muted-foreground">{type.label}s</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>

          {Object.keys(eventsByMonth).length > 0 ? (
            Object.entries(eventsByMonth).map(([month, monthEvents]) => (
              <div key={month}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{month}</h3>
                <div className="space-y-3">
                  {monthEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => {
                        setEditingEvent(event)
                        setIsEventDialogOpen(true)
                      }}
                      onDelete={() => deleteEvent(event.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-card border rounded-lg">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No upcoming events</h3>
              <p className="text-muted-foreground mb-4">
                Add birthdays, anniversaries, and milestones to track during deployment.
              </p>
              <Button onClick={() => setIsEventDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Event
              </Button>
            </div>
          )}
        </div>

        {/* Quick Add Suggestions */}
        {events.length < 5 && (
          <div className="mt-8 bg-muted/50 rounded-lg p-6">
            <h3 className="font-medium text-foreground mb-3">Suggested Events to Add</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Spouse's Birthday", type: "birthday" as EventType },
                { name: "Wedding Anniversary", type: "anniversary" as EventType },
                { name: "Child's Birthday", type: "birthday" as EventType },
                { name: "Homecoming Day", type: "homecoming" as EventType },
                { name: "Care Package Arrival", type: "care_package" as EventType },
              ].map((suggestion) => (
                <button
                  key={suggestion.name}
                  onClick={() => {
                    setEditingEvent(null)
                    setIsEventDialogOpen(true)
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-card border text-sm text-foreground hover:border-accent transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {suggestion.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <AddEventDialog
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open)
          if (!open) setEditingEvent(null)
        }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
      />

      <DeploymentSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        deploymentInfo={deploymentInfo}
        onSave={setDeploymentInfo}
      />
    </div>
  )
}
