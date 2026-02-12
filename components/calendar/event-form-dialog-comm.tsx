"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar as CalendarIcon,
  Video,
  Phone,
  Users,
  Clock,
  Repeat,
  Link2,
  MapPin,
  Trash2,
  Check,
  Palette,
  FileText,
} from "lucide-react"
import { getDay, parseISO } from "date-fns"
import { EVENT_COLORS } from "@/lib/event-colors"
import {
  type CalendarEvent,
  type EventFormData,
  type UnifiedEventType,
  type RecurrenceConfig,
  type RecurrenceType,
  DEFAULT_RECURRENCE,
  COMM_EVENT_TYPES,
} from "@/lib/calendar-types"
import { describeRecurrence } from "@/lib/recurrence-utils"
import { cn } from "@/lib/utils"

const EVENT_TYPE_OPTIONS: {
  value: UnifiedEventType
  label: string
  icon: typeof CalendarIcon
}[] = [
  //{ value: "event", label: "Event", icon: CalendarIcon },
  { value: "meeting", label: "Meeting", icon: Users },
  { value: "call", label: "Call", icon: Phone },
  { value: "video", label: "Video", icon: Video },
  //{ value: "reminder", label: "Reminder", icon: Clock },
  //{ value: "task", label: "Task", icon: FileText },
]

const RECURRENCE_PRESETS: { value: RecurrenceType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Every weekday (Mon-Fri)" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"]
const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"]

interface EventFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: EventFormData) => void
  onDelete?: () => void
  initialDate?: string
  existingEvent?: CalendarEvent | null
}

export function EventFormDialogComm({
  open,
  onClose,
  onSave,
  onDelete,
  initialDate,
  existingEvent,
}: EventFormDialogProps) {
  const [title, setTitle] = useState("")
  const [eventType, setEventType] = useState<UnifiedEventType>("meeting")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isAllDay, setIsAllDay] = useState(false)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [color, setColor] = useState("sky")
  const [description, setDescription] = useState("")
  const [meetingLink, setMeetingLink] = useState("")
  const [location, setLocation] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Recurrence
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("weekly")
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([])
  const [recurrenceWeekOfMonth, setRecurrenceWeekOfMonth] = useState(1)
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState(1)
  const [recurrenceEndType, setRecurrenceEndType] = useState<
    "never" | "date" | "count"
  >("never")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
  const [recurrenceEndCount, setRecurrenceEndCount] = useState(10)

  const showMeetingLink = COMM_EVENT_TYPES.includes(eventType as any)

  // Smart monthly defaults from start date
  const monthlyDefaults = useMemo(() => {
    if (!startDate) return { dayOfWeek: 1, weekOfMonth: 1 }
    const d = parseISO(startDate)
    return { dayOfWeek: getDay(d), weekOfMonth: Math.ceil(d.getDate() / 7) }
  }, [startDate])

  useEffect(() => {
    if (open) {
      if (existingEvent) {
        setTitle(existingEvent.title)
        setEventType(existingEvent.event_type || "meeting")
        setStartDate(existingEvent.start_date)
        setEndDate(existingEvent.end_date)
        setIsAllDay(existingEvent.is_all_day)
        setStartTime(
          existingEvent.start_time?.slice(0, 5) || "09:00"
        )
        setEndTime(existingEvent.end_time?.slice(0, 5) || "10:00")
        setColor(existingEvent.color || "sky")
        setDescription(existingEvent.description || "")
        setMeetingLink(existingEvent.meeting_link || "")
        setLocation(existingEvent.location || "")
        setIsRecurring(existingEvent.is_recurring || false)
        if (existingEvent.recurrence) {
          const r = existingEvent.recurrence
          setRecurrenceType(r.type === "none" ? "weekly" : r.type)
          setRecurrenceDays(r.daysOfWeek || [])
          setRecurrenceWeekOfMonth(r.weekOfMonth || 1)
          setRecurrenceDayOfWeek(r.dayOfWeek ?? 1)
          setRecurrenceEndType(r.endType || "never")
          setRecurrenceEndDate(r.endDate || "")
          setRecurrenceEndCount(r.endCount || 10)
        } else {
          resetRecurrence()
        }
      } else {
        setTitle("")
        setEventType("meeting")
        setStartDate(initialDate || "")
        setEndDate(initialDate || "")
        setIsAllDay(false)
        setStartTime("09:00")
        setEndTime("10:00")
        setColor("sky")
        setDescription("")
        setMeetingLink("")
        setLocation("")
        setIsRecurring(false)
        resetRecurrence()
      }
      setError(null)
    }
  }, [existingEvent, initialDate, open])

  useEffect(() => {
    if (recurrenceType === "monthly") {
      setRecurrenceDayOfWeek(monthlyDefaults.dayOfWeek)
      setRecurrenceWeekOfMonth(monthlyDefaults.weekOfMonth)
    }
  }, [startDate, recurrenceType, monthlyDefaults])

  function resetRecurrence() {
    setRecurrenceType("weekly")
    setRecurrenceDays([])
    setRecurrenceWeekOfMonth(1)
    setRecurrenceDayOfWeek(1)
    setRecurrenceEndType("never")
    setRecurrenceEndDate("")
    setRecurrenceEndCount(10)
  }

  function toggleDay(day: number) {
    setRecurrenceDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort()
    )
  }

  function buildRecurrence(): RecurrenceConfig {
    if (!isRecurring) return DEFAULT_RECURRENCE
    return {
      type: recurrenceType,
      interval: recurrenceType === "biweekly" ? 2 : 1,
      ...(["weekly", "biweekly"].includes(recurrenceType) &&
      recurrenceDays.length > 0
        ? { daysOfWeek: recurrenceDays }
        : {}),
      ...(recurrenceType === "monthly"
        ? {
            weekOfMonth: recurrenceWeekOfMonth,
            dayOfWeek: recurrenceDayOfWeek,
          }
        : {}),
      endType: recurrenceEndType,
      ...(recurrenceEndType === "date"
        ? { endDate: recurrenceEndDate }
        : {}),
      ...(recurrenceEndType === "count"
        ? { endCount: recurrenceEndCount }
        : {}),
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim()) {
      setError("Title is required")
      return
    }
    if (!startDate) {
      setError("Start date is required")
      return
    }
    if (!endDate) {
      setError("End date is required")
      return
    }
    if (endDate < startDate) {
      setError("End date must be on or after start date")
      return
    }
    if (!isAllDay && startDate === endDate && endTime <= startTime) {
      setError("End time must be after start time")
      return
    }

    onSave({
      title: title.trim(),
      start_date: startDate,
      end_date: endDate,
      is_all_day: isAllDay,
      start_time: isAllDay ? "" : startTime,
      end_time: isAllDay ? "" : endTime,
      color,
      event_type: eventType,
      description: description.trim(),
      meeting_link: showMeetingLink ? meetingLink.trim() : "",
      location: location.trim(),
      is_recurring: isRecurring,
      recurrence: buildRecurrence(),
    })
  }

  const recurrencePreview = isRecurring
    ? describeRecurrence(buildRecurrence())
    : ""
  const isEditing = !!existingEvent

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Event" : "Create Event"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify the details of your event below."
              : "Fill out the details for your new event."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-base font-medium"
              autoFocus
            />
          </div>

          {/* Event type chips */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Type
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const selected = eventType === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEventType(opt.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Palette className="h-3 w-3" />
              Color
            </Label>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "relative h-7 w-7 rounded-full transition-all",
                    c.dot,
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-foreground/40 ring-offset-card scale-110"
                      : "hover:scale-110 opacity-70 hover:opacity-100"
                  )}
                  title={c.name}
                  aria-label={`Select ${c.name} color`}
                >
                  {color === c.value && (
                    <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* All-day toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="all-day-toggle"
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
            />
            <Label htmlFor="all-day-toggle">All-day / Multi-day event</Label>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (e.target.value > endDate) setEndDate(e.target.value)
                }}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Times */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Start Time
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  End Time
                </Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          )}

          {/* Meeting link (meeting/call/video only) */}
          {showMeetingLink && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Link2 className="h-3 w-3" />
                Meeting link (optional)
              </Label>
              <Input
                type="url"
                placeholder="https://zoom.us/j/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          )}

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Location (optional)
            </Label>
            <Input
              placeholder="Building 42, Room 301"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Description (optional)
            </Label>
            <Textarea
              placeholder="Notes or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm resize-none"
              rows={2}
            />
          </div>

          {/* Recurrence */}
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                Repeat
              </Label>
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>

            {isRecurring && (
              <div className="flex flex-col gap-3">
                <Select
                  value={recurrenceType}
                  onValueChange={(v) =>
                    setRecurrenceType(v as RecurrenceType)
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_PRESETS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Weekly / biweekly day picker */}
                {(recurrenceType === "weekly" ||
                  recurrenceType === "biweekly") && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Repeat on
                    </Label>
                    <div className="flex gap-1">
                      {DAYS_SHORT.map((d, i) => (
                        <button
                          key={`${d}-${i}`}
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={cn(
                            "w-8 h-8 rounded-md text-xs font-medium border transition-colors",
                            recurrenceDays.includes(i)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-muted-foreground border-border hover:border-primary/40"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monthly: nth weekday */}
                {recurrenceType === "monthly" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      On the
                    </span>
                    <Select
                      value={String(recurrenceWeekOfMonth)}
                      onValueChange={(v) =>
                        setRecurrenceWeekOfMonth(Number(v))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDINALS.map((ord, i) => (
                          <SelectItem key={ord} value={String(i + 1)}>
                            {ord}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={String(recurrenceDayOfWeek)}
                      onValueChange={(v) =>
                        setRecurrenceDayOfWeek(Number(v))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_FULL.map((day, i) => (
                          <SelectItem key={day} value={String(i)}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* End condition */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">Ends</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Select
                      value={recurrenceEndType}
                      onValueChange={(v) =>
                        setRecurrenceEndType(
                          v as "never" | "date" | "count"
                        )
                      }
                    >
                      <SelectTrigger className="h-8 text-xs w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="date">On date</SelectItem>
                        <SelectItem value="count">After</SelectItem>
                      </SelectContent>
                    </Select>

                    {recurrenceEndType === "date" && (
                      <Input
                        type="date"
                        value={recurrenceEndDate}
                        min={startDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        className="h-8 text-xs flex-1"
                      />
                    )}
                    {recurrenceEndType === "count" && (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min={1}
                          max={999}
                          value={recurrenceEndCount}
                          onChange={(e) =>
                            setRecurrenceEndCount(Number(e.target.value))
                          }
                          className="h-8 text-xs w-16"
                        />
                        <span className="text-xs text-muted-foreground">
                          times
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {recurrencePreview && (
                  <p className="text-xs text-muted-foreground italic">
                    {recurrencePreview}
                  </p>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {isEditing && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!title.trim()}>
                {isEditing ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
