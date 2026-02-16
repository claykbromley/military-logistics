"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import {
  X,
  Clock,
  MapPin,
  AlignLeft,
  Palette,
  Repeat,
  CalendarDays,
  CheckSquare,
  Trash2,
  UserPlus,
  Mail,
  Plus,
  XCircle,
  Globe,
  Link2,
  ChevronDown,
} from "lucide-react"
import type {
  CalendarEntry,
  EntryFormData,
  RecurrenceFreq,
  EventInvitation,
} from "@/app/scheduler/calendar/types"
import { COLOR_OPTIONS, DAY_NAMES } from "@/app/scheduler/calendar/constants"
import { useEntryModal } from "./use-entry-modal"

// ─── Time generation helpers ──────────────────────────────

function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      )
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

function formatTimeDisplay(time24: string): string {
  if (!time24) return ""
  const [hStr, mStr] = time24.split(":")
  const h = parseInt(hStr)
  const m = mStr || "00"
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${m} ${ampm}`
}

// ─── Common timezones ─────────────────────────────────────

const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
]

// ─── Time Picker Dropdown ─────────────────────────────────

function TimePicker({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (val: string) => void
  label?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Scroll to current value when opening
  useEffect(() => {
    if (isOpen && listRef.current && value) {
      const idx = TIME_SLOTS.indexOf(value)
      if (idx >= 0) {
        const el = listRef.current.children[idx] as HTMLElement
        if (el) el.scrollIntoView({ block: "center" })
      }
    }
  }, [isOpen, value])

  const filtered = search
    ? TIME_SLOTS.filter((t) => {
        const display = formatTimeDisplay(t).toLowerCase()
        const raw = t.replace(":", "")
        const q = search.toLowerCase().replace(/[\s:]/g, "")
        return display.replace(/[\s:]/g, "").includes(q) || raw.includes(q)
      })
    : TIME_SLOTS

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-0.5">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-muted rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-muted/80 transition-colors cursor-pointer min-w-[110px]"
      >
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="flex-1 text-left">
          {value ? formatTimeDisplay(value) : "Select"}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 bg-card border border-border rounded-lg shadow-xl w-48 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search / manual input */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Type time (e.g. 2:30 PM)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length > 0) {
                  onChange(filtered[0])
                  setIsOpen(false)
                  setSearch("")
                }
              }}
              className="w-full bg-muted rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/50"
              autoFocus
            />
          </div>
          {/* Scrollable list */}
          <div
            ref={listRef}
            className="max-h-48 overflow-y-auto overscroll-contain"
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No match. Try "2:30 PM" or "14:30"
              </div>
            ) : (
              filtered.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onChange(t)
                    setIsOpen(false)
                    setSearch("")
                  }}
                  className={`w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                    t === value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {formatTimeDisplay(t)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Status badge colors ──────────────────────────────────

const statusColors: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  accepted:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  declined:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  tentative:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
}

// ─── Raw (dumb) modal ─────────────────────────────────────

interface EntryModalProps {
  open: boolean
  editingEntry: CalendarEntry | null
  formData: EntryFormData
  saving: boolean
  showDeleteConfirm: boolean
  existingInvitations: EventInvitation[]
  onFormChange: (data: EntryFormData) => void
  onSave: () => void
  onDelete: () => void
  onClose: () => void
  onShowDeleteConfirm: (show: boolean) => void
  onRemoveInvitation: (invitationId: string) => void
}

export function EntryModal({
  open,
  editingEntry,
  formData,
  saving,
  showDeleteConfirm,
  existingInvitations,
  onFormChange,
  onSave,
  onDelete,
  onClose,
  onShowDeleteConfirm,
  onRemoveInvitation,
}: EntryModalProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")

  // Recurrence end mode derived from formData
  const recurrenceEndMode: "never" | "on_date" = formData.recurrence_end
    ? "on_date"
    : "never"

  // Timezone label for display
  const currentTzLabel = useMemo(() => {
    const match = COMMON_TIMEZONES.find((tz) => tz.value === formData.timezone)
    if (match) return match.label
    return formData.timezone?.replace(/_/g, " ").split("/").pop() || "UTC"
  }, [formData.timezone])

  if (!open) return null

  const isEvent = formData.type === "event" || formData.type === "meeting"

  const update = (partial: Partial<EntryFormData>) => {
    onFormChange({ ...formData, ...partial })
  }

  const addInvitee = () => {
    const email = inviteEmail.trim()
    if (!email) return
    const alreadyInForm = formData.invitees.some(
      (inv) => inv.email.toLowerCase() === email.toLowerCase(),
    )
    const alreadyExisting = existingInvitations.some(
      (inv) => inv.invitee_email.toLowerCase() === email.toLowerCase(),
    )
    if (alreadyInForm || alreadyExisting) {
      setInviteEmail("")
      setInviteName("")
      return
    }
    update({
      invitees: [
        ...formData.invitees,
        { email, name: inviteName.trim() || undefined },
      ],
    })
    setInviteEmail("")
    setInviteName("")
  }

  const removeNewInvitee = (index: number) => {
    update({
      invitees: formData.invitees.filter((_, i) => i !== index),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addInvitee()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <h2 className="text-lg font-semibold text-foreground">
              {editingEntry
                ? `Edit ${isEvent ? "Event" : "Task"}`
                : `New ${isEvent ? "Event" : "Task"}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => update({ type: "event" })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                formData.type === "event"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Event
            </button>
            <button
              onClick={() => update({ type: "task" })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                formData.type === "task"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Task
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder={isEvent ? "Add title" : "Add task"}
            value={formData.title}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full text-xl font-medium bg-transparent border-b-2 border-muted focus:border-primary outline-none pb-2 text-foreground placeholder:text-muted-foreground/50 transition-colors"
            autoFocus
          />

          {/* All-day toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.all_day}
                onChange={(e) => update({ all_day: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
            </div>
            <span className="text-sm text-foreground">All day</span>
          </label>

          {/* Date/Time */}
          <div className="space-y-3">
            {/* Start row */}
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-2" />
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    update({
                      start_date: e.target.value,
                      end_date:
                        e.target.value > formData.end_date
                          ? e.target.value
                          : formData.end_date,
                    })
                  }
                  className="bg-muted rounded-md px-3 py-1.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
                />
                {!formData.all_day && (
                  <TimePicker
                    value={formData.start_time}
                    onChange={(val) => update({ start_time: val })}
                  />
                )}
                {isEvent && (
                  <>
                    <span className="text-muted-foreground text-sm">to</span>
                    {formData.all_day ? (
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => update({ end_date: e.target.value })}
                        className="bg-muted rounded-md px-3 py-1.5 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    ) : (
                      <TimePicker
                        value={formData.end_time}
                        onChange={(val) => update({ end_time: val })}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Timezone row */}
            <div className="flex items-center gap-2 ml-6">
              <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <select
                value={formData.timezone}
                onChange={(e) => update({ timezone: e.target.value })}
                className="bg-muted rounded-md px-2 py-1 text-xs text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
                {/* Include current if not in common list */}
                {!COMMON_TIMEZONES.some(
                  (tz) => tz.value === formData.timezone,
                ) && (
                  <option value={formData.timezone}>
                    {formData.timezone}
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Location (Event/Meeting only) */}
          {isEvent && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Add location"
                value={formData.location}
                onChange={(e) => update({ location: e.target.value })}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border-b border-transparent focus:border-muted transition-colors py-1"
              />
            </div>
          )}

          {/* Meeting Link (Event/Meeting only) */}
          {isEvent && (
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="url"
                placeholder="Add meeting link (Zoom, Teams, etc.)"
                value={formData.meeting_link}
                onChange={(e) => update({ meeting_link: e.target.value })}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border-b border-transparent focus:border-muted transition-colors py-1"
              />
            </div>
          )}

          {/* Description */}
          <div className="flex items-start gap-2">
            <AlignLeft className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            <textarea
              placeholder="Add description"
              value={formData.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border-b border-transparent focus:border-muted transition-colors py-1 resize-none"
            />
          </div>

          {/* Invitees (Event/Meeting only) */}
          {isEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">
                  Invite People
                </span>
              </div>

              <div className="ml-6 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-muted rounded-md px-3 py-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Name (optional)"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-32 bg-muted rounded-md px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                  />
                  <button
                    onClick={addInvitee}
                    disabled={!inviteEmail.trim()}
                    className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* New invitees */}
                {formData.invitees.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      New invitations
                    </span>
                    {formData.invitees.map((inv, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 py-1 px-2 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground truncate">
                            {inv.name
                              ? `${inv.name} (${inv.email})`
                              : inv.email}
                          </span>
                        </div>
                        <button
                          onClick={() => removeNewInvitee(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer flex-shrink-0"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing invitations */}
                {existingInvitations.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Sent invitations
                    </span>
                    {existingInvitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between gap-2 py-1 px-2 bg-muted/30 rounded-md"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground truncate">
                            {inv.invitee_name
                              ? `${inv.invitee_name} (${inv.invitee_email})`
                              : inv.invitee_email}
                          </span>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                              statusColors[inv.status] || statusColors.pending
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveInvitation(inv.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer flex-shrink-0"
                          title="Remove invitation"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Color */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => update({ color: c.value })}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-all ${
                    formData.color === c.value
                      ? "ring-2 ring-offset-2 ring-offset-card scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: c.value,
                    ...(formData.color === c.value
                      ? { outlineColor: c.value }
                      : {}),
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Repeat className="w-4 h-4 text-muted-foreground" />
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_recurring}
                  onChange={(e) => update({ is_recurring: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm text-foreground">Repeat</span>
            </label>

            {formData.is_recurring && (
              <div className="ml-6 space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
                {/* Frequency */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Every</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formData.recurrence_interval}
                    onChange={(e) =>
                      update({
                        recurrence_interval: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-14 bg-card rounded-md px-2 py-1 text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30 text-center"
                  />
                  <select
                    value={formData.recurrence_freq}
                    onChange={(e) =>
                      update({
                        recurrence_freq: e.target.value as RecurrenceFreq,
                      })
                    }
                    className="bg-card rounded-md px-3 py-1 text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    <option value="daily">day(s)</option>
                    <option value="weekly">week(s)</option>
                    <option value="monthly">month(s)</option>
                    <option value="yearly">year(s)</option>
                  </select>
                </div>

                {/* Weekly day buttons */}
                {formData.recurrence_freq === "weekly" && (
                  <div className="flex gap-1.5">
                    {DAY_NAMES.map((d, i) => (
                      <button
                        key={d}
                        onClick={() => {
                          const days = formData.recurrence_days.includes(i)
                            ? formData.recurrence_days.filter((x) => x !== i)
                            : [...formData.recurrence_days, i]
                          update({ recurrence_days: days })
                        }}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          formData.recurrence_days.includes(i)
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-muted-foreground border border-border hover:border-primary/50"
                        }`}
                      >
                        {d[0]}
                      </button>
                    ))}
                  </div>
                )}

                {/* End condition — clear radio choice */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ends
                  </span>

                  {/* Never option */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurrence_end_mode"
                      checked={recurrenceEndMode === "never"}
                      onChange={() => update({ recurrence_end: "" })}
                      className="w-4 h-4 text-primary border-border accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">
                      Never — repeats indefinitely
                    </span>
                  </label>

                  {/* On date option */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurrence_end_mode"
                      checked={recurrenceEndMode === "on_date"}
                      onChange={() => {
                        // Default to 3 months from start if switching
                        const d = new Date(formData.start_date)
                        d.setMonth(d.getMonth() + 3)
                        const y = d.getFullYear()
                        const m = String(d.getMonth() + 1).padStart(2, "0")
                        const dd = String(d.getDate()).padStart(2, "0")
                        update({ recurrence_end: `${y}-${m}-${dd}` })
                      }}
                      className="w-4 h-4 text-primary border-border accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">On date</span>
                    {recurrenceEndMode === "on_date" && (
                      <input
                        type="date"
                        value={formData.recurrence_end}
                        onChange={(e) =>
                          update({ recurrence_end: e.target.value })
                        }
                        min={formData.start_date}
                        className="ml-1 bg-card rounded-md px-3 py-1 text-sm text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div>
            {editingEntry && (
              <>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => onShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive">
                      Are you sure?
                    </span>
                    <button
                      onClick={onDelete}
                      disabled={saving}
                      className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded-md hover:bg-destructive/90 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onShowDeleteConfirm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || !formData.title.trim()}
              className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {saving ? "Saving..." : editingEntry ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Connected modal — auto-wires to EntryModalProvider ───

export function ConnectedEntryModal() {
  const {
    isOpen,
    editingEntry,
    formData,
    saving,
    showDeleteConfirm,
    existingInvitations,
    setFormData,
    save,
    deleteEntry,
    close,
    setShowDeleteConfirm,
    removeInvitation,
  } = useEntryModal()

  return (
    <EntryModal
      open={isOpen}
      editingEntry={editingEntry}
      formData={formData}
      saving={saving}
      showDeleteConfirm={showDeleteConfirm}
      existingInvitations={existingInvitations}
      onFormChange={setFormData}
      onSave={save}
      onDelete={deleteEntry}
      onClose={close}
      onShowDeleteConfirm={setShowDeleteConfirm}
      onRemoveInvitation={removeInvitation}
    />
  )
}