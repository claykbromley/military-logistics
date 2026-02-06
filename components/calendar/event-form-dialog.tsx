"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { CalendarEvent, EventFormData } from "@/lib/calendar-types"
import { Trash2 } from "lucide-react"

interface EventFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: EventFormData) => void
  onDelete?: () => void
  initialDate?: string
  existingEvent?: CalendarEvent | null
}

export function EventFormDialog({
  open,
  onClose,
  onSave,
  onDelete,
  initialDate,
  existingEvent,
}: EventFormDialogProps) {
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isAllDay, setIsAllDay] = useState(false)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title)
      setStartDate(existingEvent.start_date)
      setEndDate(existingEvent.end_date)
      setIsAllDay(existingEvent.is_all_day)
      setStartTime(existingEvent.start_time || "09:00")
      setEndTime(existingEvent.end_time || "10:00")
    } else {
      setTitle("")
      setStartDate(initialDate || "")
      setEndDate(initialDate || "")
      setIsAllDay(false)
      setStartTime("09:00")
      setEndTime("10:00")
    }
    setError(null)
  }, [existingEvent, initialDate, open])

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
    })
  }

  const isEditing = !!existingEvent

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="all-day-toggle"
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
            />
            <Label htmlFor="all-day-toggle">All-day / Multi-day event</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (e.target.value > endDate) {
                    setEndDate(e.target.value)
                  }
                }}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>
          </div>

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter className="flex-row gap-2 pt-2">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="mr-auto"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
