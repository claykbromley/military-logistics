"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, Plus, BookOpen, Smile, Meh, Frown, ChevronDown, Trash2, Edit, Flame, PhoneCall,
  Lock, Unlock, Phone, ExternalLink, Moon, Zap, Dumbbell, Heart, Target, TrendingUp, BarChart3, Activity,
  Wind, Eye, Hand, Ear, Flower2, Cookie, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useWellness, type JournalEntry, type Mood } from "@/hooks/use-wellness"

/* ─────────────────────────── constants ─────────────────────────── */

const moods: {
  value: Mood
  label: string
  icon: React.ReactNode
  emoji: string
  cssColor: string
  cssBg: string
}[] = [
  {
    value: "great",
    label: "Great",
    icon: <Smile className="w-4 h-4" />,
    emoji: "💪",
    cssColor: "var(--success)",
    cssBg: "color-mix(in oklch, var(--success) 14%, transparent)",
  },
  {
    value: "good",
    label: "Good",
    icon: <Smile className="w-4 h-4" />,
    emoji: "😊",
    cssColor: "var(--chart-4)",
    cssBg: "color-mix(in oklch, var(--chart-4) 14%, transparent)",
  },
  {
    value: "neutral",
    label: "Okay",
    icon: <Meh className="w-4 h-4" />,
    emoji: "😐",
    cssColor: "var(--holiday)",
    cssBg: "color-mix(in oklch, var(--holiday) 14%, transparent)",
  },
  {
    value: "struggling",
    label: "Struggling",
    icon: <Frown className="w-4 h-4" />,
    emoji: "😔",
    cssColor: "var(--chart-2)",
    cssBg: "color-mix(in oklch, var(--chart-2) 14%, transparent)",
  },
  {
    value: "difficult",
    label: "Difficult",
    icon: <Frown className="w-4 h-4" />,
    emoji: "😞",
    cssColor: "var(--destructive)",
    cssBg: "color-mix(in oklch, var(--destructive) 14%, transparent)",
  },
]

const gratitudePrompts = [
  "What are 3 things you're grateful for today?",
  "Who made a positive impact on your life recently?",
  "What's a small win you had this week?",
  "What's something beautiful you noticed today?",
  "What skill or ability are you thankful for?",
  "What's a memory that always makes you smile?",
  "Who do you miss most right now, and what do you appreciate about them?",
  "What's something you're looking forward to when you get home?",
  "What challenge did you overcome recently?",
  "What made you laugh today?",
]

const RESOURCES = [
  {
    name: "Veterans Crisis Line",
    detail: "Dial 988, Press 1",
    icon: Phone,
    href: "tel:988",
    urgent: true,
  },
  {
    name: "Military OneSource",
    detail: "1-800-342-9647 · 24/7",
    icon: ExternalLink,
    href: "https://www.militaryonesource.mil/",
    urgent: false,
  },
  {
    name: "Real Warriors",
    detail: "Mental Health Resources",
    icon: ExternalLink,
    href: "https://www.realwarriors.net/",
    urgent: false,
  },
  {
    name: "Talkspace for Military",
    detail: "Online Therapy",
    icon: ExternalLink,
    href: "https://www.talkspace.com/military/",
    urgent: false,
  },
]

const TABS = [
  { id: "checkin", label: "Check-In", icon: Heart },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "trends", label: "Trends", icon: BarChart3 },
  { id: "resources", label: "Resources", icon: Wind },
] as const

type TabId = (typeof TABS)[number]["id"]

function todayStr() {
  return new Date().toLocaleDateString("en-CA")
}

function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

/* ─────────────────────────── mood selector ─────────────────────────── */

function MoodSelector({
  value,
  onChange,
  size = "md",
}: {
  value?: Mood
  onChange: (m: Mood | undefined) => void
  size?: "sm" | "md"
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((m) => {
        const active = value === m.value
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(active ? undefined : m.value)}
            className={`
              inline-flex items-center gap-1.5 rounded-full border transition-all cursor-pointer
              ${size === "sm" ? "px-3 py-1 text-xs" : "flex-col px-3.5 py-2.5 text-[11px] min-w-[68px]"}
              ${active ? "font-semibold" : "border-border dark:border-slate-700 text-muted-foreground hover:border-muted-foreground/40"}
            `}
            style={
              active
                ? {
                    borderColor: m.cssColor,
                    background: m.cssBg,
                    color: m.cssColor,
                  }
                : undefined
            }
          >
            {size === "md" && <span className="text-lg">{m.emoji}</span>}
            {size === "sm" && m.icon}
            {m.label}
          </button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────── slider ─────────────────────────── */

function MetricSlider({
  label,
  icon,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.5,
  unit = "",
}: {
  label: string
  icon: React.ReactNode
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="text-xs font-bold text-accent">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--accent)] cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/60">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────── tab: check-in ─────────────────────────── */

function CheckInTab({
  checkinEntries,
  allEntries,
  addEntry,
  updateEntry,
  streak,
}: {
  checkinEntries: JournalEntry[]
  allEntries: JournalEntry[]
  addEntry: (e: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  updateEntry: (id: string, e: Partial<JournalEntry>) => void
  streak: number
}) {
  const td = todayStr()
  const todayEntry = checkinEntries.find((e) => e.entryDate === td)
  console.log(checkinEntries, td)

  const [mood, setMood] = useState<Mood | undefined>(todayEntry?.mood)
  const [sleep, setSleep] = useState(todayEntry?.sleepHours ?? 7)
  const [energy, setEnergy] = useState(todayEntry?.energyLevel ?? 5)
  const [exercise, setExercise] = useState(todayEntry?.exerciseMinutes ?? 0)
  const [stress, setStress] = useState(todayEntry?.stress ?? 0)
  const [gratitude, setGratitude] = useState(todayEntry?.gratitude || "")
  const [goals, setGoals] = useState(todayEntry?.goals || "")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const data = {
      entryDate: td,
      entryType: "checkin" as const,
      mood,
      sleepHours: sleep,
      energyLevel: energy,
      stress: stress,
      exerciseMinutes: exercise,
      gratitude: gratitude.trim() || undefined,
      goals: goals.trim() || undefined,
      content: "",
      isPrivate: true,
    }
    if (todayEntry) {
      updateEntry(todayEntry.id, data)
    } else {
      addEntry(data as any)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // Use all entries (both types) for the 7-day streak dots
  const last7 = useMemo(() => {
    const days: { date: string; day: string; entry?: JournalEntry }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toLocaleDateString("en-CA")
      // Prefer the check-in entry for mood display, fall back to any entry
      const checkin = checkinEntries.find((e) => e.entryDate === ds)
      const any = allEntries.find((e) => e.entryDate === ds)
      days.push({
        date: ds,
        day: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        entry: checkin || any,
      })
    }
    return days
  }, [checkinEntries, allEntries])

  return (
    <div className="space-y-5">
      {/* Streak card */}
      <div className="bg-card border rounded-xl p-5 relative overflow-hidden">
        {streak >= 3 && (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, var(--accent), transparent 70%)",
            }}
          />
        )}
        <div className="relative flex justify-between items-center mb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">
              Streak
            </div>
            <div className="text-3xl font-extrabold" style={{ color: streak > 0 ? "var(--holiday)" : undefined }}>
              {streak > 0 && (
                <Flame
                  className="w-7 h-7 inline-block mr-1 -mt-1"
                  style={{ color: "var(--holiday)" }}
                />
              )}
              {streak} day{streak !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="flex gap-1.5">
          {last7.map((d) => {
            const isToday = d.date === td
            const mi = d.entry?.moodScore ? moods[5 - d.entry.moodScore] : null
            return (
              <div
                key={d.date}
                className={`flex-1 text-center py-2 rounded-lg border transition-all ${
                  isToday ? "border-accent border-2" : "border-border dark:border-slate-700"
                }`}
                style={d.entry ? { background: mi?.cssBg || "var(--accent)/0.1" } : undefined}
              >
                <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                  {d.day}
                </div>
                <div className="text-sm">{d.entry ? mi?.emoji || "✓" : "·"}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Check-in form */}
      <div className="bg-card border rounded-xl p-5 space-y-5">
        <h2 className="text-lg font-bold text-foreground">
          {todayEntry ? "Update Today's Check-In" : "Today's Check-In"}
        </h2>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">
            How are you feeling?
          </Label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <MetricSlider
            label="Sleep"
            icon={<Moon className="w-3.5 h-3.5" />}
            value={sleep}
            onChange={setSleep}
            min={0}
            max={12}
            unit="h"
          />
          <MetricSlider
            label="Energy"
            icon={<Zap className="w-3.5 h-3.5" />}
            value={energy}
            onChange={setEnergy}
            min={1}
            max={10}
          />
          <MetricSlider
            label="Exercise"
            icon={<Dumbbell className="w-3.5 h-3.5" />}
            value={exercise}
            onChange={setExercise}
            min={0}
            max={120}
            step={5}
            unit="m"
          />
          <MetricSlider
            label="Stress"
            icon={<Activity className="w-3.5 h-3.5" />}
            value={stress}
            onChange={setStress}
            min={0}
            max={10}
            step={1}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Grateful for…
            </Label>
            <Textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="What went well today?"
              rows={2}
              className="text-sm resize-none dark:border-slate-700"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Tomorrow's goals
            </Label>
            <Textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="One thing to focus on…"
              rows={2}
              className="text-sm resize-none dark:border-slate-700"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full cursor-pointer">
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-1.5" />
              Saved!
            </>
          ) : todayEntry ? (
            "Update Check-In"
          ) : (
            "Save Check-In"
          )}
        </Button>
      </div>
    </div>
  )
}

/* ─────────────────────────── tab: journal ─────────────────────────── */

function JournalEntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const moodInfo = entry.moodScore ? moods[5 - entry.moodScore] : null
  const long = entry.content.length > 180

  return (
    <div className="bg-card border rounded-xl p-4 transition-colors hover:border-muted-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="text-[11px] text-muted-foreground/70">
              {formatShortDate(entry.createdAt)}
            </span>
            {entry.isPrivate && <Lock className="w-3 h-3 text-muted-foreground/40" />}
            {moodInfo && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ color: moodInfo.cssColor, background: moodInfo.cssBg }}
              >
                {moodInfo.emoji} {moodInfo.label}
              </span>
            )}
            {entry.gratitude && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{
                  color: "var(--holiday)",
                  background: "color-mix(in oklch, var(--holiday) 14%, transparent)",
                }}
              >
                🙏 Gratitude
              </span>
            )}
          </div>
          {entry.title && (
            <h3 className="font-semibold text-foreground mb-1 text-[15px]">{entry.title}</h3>
          )}
          <p
            className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${
              long ? "cursor-pointer" : ""
            }`}
            onClick={() => long && setExpanded(!expanded)}
          >
            {long && !expanded ? entry.content.slice(0, 180) + "…" : entry.content}
          </p>
          {long && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-accent hover:underline mt-1"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 cursor-pointer">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer hover:!text-white">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive cursor-pointer hover:!bg-destructive hover:!text-white">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function AddEntryDialog({
  open,
  onOpenChange,
  onSave,
  editingEntry,
  initialPrompt,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  editingEntry?: JournalEntry | null
  initialPrompt?: string
}) {
  const [title, setTitle] = useState(editingEntry?.title || "")
  const [content, setContent] = useState(editingEntry?.content || initialPrompt || "")
  const [mood, setMood] = useState<Mood | undefined>(editingEntry?.mood)
  const [isPrivate, setIsPrivate] = useState(editingEntry?.isPrivate ?? true)

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      setTitle(editingEntry?.title || "")
      setContent(editingEntry?.content || initialPrompt || "")
      setMood(editingEntry?.mood)
      setIsPrivate(editingEntry?.isPrivate ?? true)
    }
  }, [open, editingEntry, initialPrompt])

  const handleSave = () => {
    if (!content.trim()) return
    onSave({
      title: title.trim() || undefined,
      content: content.trim(),
      mood,
      isPrivate,
      entryType: "journal",
      entryDate: todayStr(),
    } as any)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "Edit Entry" : "New Journal Entry"}</DialogTitle>
          <DialogDescription>
            Take a moment to reflect on your thoughts and feelings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="journal-title" className="text-xs font-semibold">
              Title (optional)
            </Label>
            <Input
              id="journal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Reflecting on today…"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">How are you feeling?</Label>
            <MoodSelector value={mood} onChange={setMood} size="sm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="journal-content" className="text-xs font-semibold">
              Your thoughts
            </Label>
            <Textarea
              id="journal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely — this is your space…"
              rows={6}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {isPrivate ? "Private entry" : "Public entry"}
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="cursor-pointer" disabled={!content.trim()}>
            {editingEntry ? "Save Changes" : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function JournalTab({
  journalEntries,
  addEntry,
  updateEntry,
  deleteEntry,
}: {
  journalEntries: JournalEntry[]
  addEntry: (e: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  updateEntry: (id: string, e: Partial<JournalEntry>) => void
  deleteEntry: (id: string) => void
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [promptForEntry, setPromptForEntry] = useState<string | undefined>()

  const prompt = useMemo(() => {
    return gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)]
  }, [])

  const handleSave = (entryData: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => {
    if (editingEntry) {
      updateEntry(editingEntry.id, entryData)
      setEditingEntry(null)
    } else {
      addEntry(entryData)
    }
    setPromptForEntry(undefined)
  }

  return (
    <div className="space-y-5">
      {/* Prompt card */}
      <div
        className="bg-card border rounded-xl p-5"
        style={{ borderLeftWidth: 3, borderLeftColor: "var(--accent)" }}
      >
        <div
          className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2"
          style={{ color: "var(--accent)" }}
        >
          Today's Reflection
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed italic mb-3">{prompt}</p>
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => {
            setPromptForEntry(prompt + "\n\n")
            setIsDialogOpen(true)
          }}
        >
          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
          Write about this
        </Button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground">Journal Entries</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditingEntry(null)
            setPromptForEntry(undefined)
            setIsDialogOpen(true)
          }}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Entry
        </Button>
      </div>

      {/* Entries */}
      {journalEntries.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-xl">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No entries yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start journaling to track your journey.
          </p>
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={() => {
              setEditingEntry(null)
              setPromptForEntry(undefined)
              setIsDialogOpen(true)
            }}
          >
            Write Your First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {journalEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => {
                setEditingEntry(entry)
                setPromptForEntry(undefined)
                setIsDialogOpen(true)
              }}
              onDelete={() => deleteEntry(entry.id)}
            />
          ))}
        </div>
      )}

      <AddEntryDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingEntry(null)
            setPromptForEntry(undefined)
          }
        }}
        onSave={handleSave}
        editingEntry={editingEntry}
        initialPrompt={promptForEntry}
      />
    </div>
  )
}

/* ─────────────────────────── tab: trends ─────────────────────────── */

function TrendsTab({
  checkinEntries,
  moodStats,
}: {
  checkinEntries: JournalEntry[]
  moodStats: { total: number; counts: Record<Mood, number> }
}) {
  const moodScores: Record<Mood, number> = {
    great: 5,
    good: 4,
    neutral: 3,
    struggling: 2,
    difficult: 1,
  }

  const last30 = useMemo(() => {
    const days: { date: string; label: string; entry?: JournalEntry }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split("T")[0]
      const entry = checkinEntries.find((e) => e.entryDate === ds)
      days.push({
        date: ds,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        entry,
      })
    }
    return days
  }, [checkinEntries])

  const avgSleep = useMemo(() => {
    const ws = checkinEntries.filter((e) => (e.sleepHours || 0) > 0)
    return ws.length
      ? (ws.reduce((a, e) => a + (e.sleepHours || 0), 0) / ws.length).toFixed(1)
      : null
  }, [checkinEntries])

  const avgEnergy = useMemo(() => {
    const we = checkinEntries.filter((e) => (e.energyLevel || 0) > 0)
    return we.length
      ? (we.reduce((a, e) => a + (e.energyLevel || 0), 0) / we.length).toFixed(1)
      : null
  }, [checkinEntries])

  const totalExercise = useMemo(
    () => checkinEntries.reduce((a, e) => a + (e.exerciseMinutes || 0), 0),
    [checkinEntries]
  )

  const totalMoods = moodStats.total

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Check-Ins", value: String(checkinEntries.length), icon: BookOpen, color: "var(--accent)" },
          { label: "Avg Sleep", value: avgSleep ? `${avgSleep}h` : "—", icon: Moon, color: "var(--primary)" },
          { label: "Avg Energy", value: avgEnergy ?? "—", icon: Zap, color: "var(--holiday)" },
          { label: "Exercise", value: `${totalExercise}m`, icon: Dumbbell, color: "var(--success)" },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
            <s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
            <div className="text-xl font-extrabold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Mood timeline */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">
          30-Day Mood Timeline
        </h3>
        <div className="flex items-end gap-[2px] h-[90px]">
          {last30.map((d) => {
            const score = d.entry?.mood ? moodScores[d.entry.mood] : 0
            const mi = score > 0 ? moods[5 - d.entry!.moodScore!] : null
            const h = score > 0 ? (score / 5) * 72 + 10 : 4
            return (
              <div
                key={d.date}
                title={`${d.label}: ${mi?.label || "No data"}`}
                className="flex-1 min-w-0 rounded-sm transition-all"
                style={{
                  height: h,
                  background: mi ? mi.cssColor : "var(--secondary)",
                  opacity: score > 0 ? 0.8 : 0.25,
                }}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground/50">
          <span>{last30[0]?.label}</span>
          <span>Today</span>
        </div>
      </div>

      {/* Sleep & Energy lines */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">
          Sleep & Energy (30 Days)
        </h3>
        <div className="relative h-[80px]">
          <svg
            viewBox={`0 0 ${last30.length * 10} 80`}
            className="w-full h-[80px]"
            preserveAspectRatio="none"
          >
            <polyline
              points={last30
                .map((d, i) => {
                  const s = d.entry?.sleepHours || 0
                  const y = s > 0 ? 80 - (s / 12) * 70 : 80
                  return `${i * 10 + 5},${y}`
                })
                .join(" ")}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinejoin="round"
              opacity="0.7"
            />
            <polyline
              points={last30
                .map((d, i) => {
                  const e = d.entry?.energyLevel || 0
                  const y = e > 0 ? 80 - (e / 10) * 70 : 80
                  return `${i * 10 + 5},${y}`
                })
                .join(" ")}
              fill="none"
              stroke="var(--holiday)"
              strokeWidth="2"
              strokeLinejoin="round"
              opacity="0.7"
            />
          </svg>
        </div>
        <div className="flex gap-4 mt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-[3px] rounded-full inline-block"
              style={{ background: "var(--primary)" }}
            />
            Sleep
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-[3px] rounded-full inline-block"
              style={{ background: "var(--holiday)" }}
            />
            Energy
          </span>
        </div>
      </div>

      {/* Mood distribution */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">
          Mood Distribution
        </h3>
        {totalMoods === 0 ? (
          <p className="text-center text-sm text-muted-foreground/50 py-5">
            Start logging to see your mood trends.
          </p>
        ) : (
          <div className="space-y-2.5">
            {moods.map((m) => {
              const count = moodStats.counts[m.value]
              const pct = totalMoods > 0 ? ((count / totalMoods) * 100).toFixed(0) : "0"
              return (
                <div key={m.value} className="flex items-center gap-2.5">
                  <span className="text-sm w-5 text-center">{m.emoji}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-muted dark:bg-secondary">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: m.cssColor }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground w-14 text-right tabular-nums">
                    {count} ({pct}%)
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────── tab: resources ─────────────────────────── */

function ResourcesTab() {
  const [breathActive, setBreathActive] = useState(false)
  const [breathStep, setBreathStep] = useState(0)
  const [breathCycle, setBreathCycle] = useState(0)
  const durations = [4000, 7000, 8000]
  const labels = ["Breathe in…", "Hold…", "Breathe out…"]
  const scales = [1.25, 1.25, 0.85]

  useEffect(() => {
    if (!breathActive) return
    const t = setTimeout(() => {
      const next = (breathStep + 1) % 3
      setBreathStep(next)
      if (next === 0) setBreathCycle((c) => c + 1)
    }, durations[breathStep])
    return () => clearTimeout(t)
  }, [breathActive, breathStep])

  const groundingSenses = [
    { n: 5, sense: "SEE", icon: Eye, color: "var(--accent)" },
    { n: 4, sense: "TOUCH", icon: Hand, color: "var(--primary)" },
    { n: 3, sense: "HEAR", icon: Ear, color: "var(--holiday)" },
    { n: 2, sense: "SMELL", icon: Flower2, color: "var(--success)" },
    { n: 1, sense: "TASTE", icon: Cookie, color: "var(--destructive)" },
  ]

  return (
    <div className="space-y-5">
      {/* Crisis */}
      <div
        className="bg-card border rounded-xl p-5"
        style={{ borderLeftWidth: 3, borderLeftColor: "var(--destructive)" }}
      >
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-destructive mb-4">
          🆘 Crisis Support — 24/7
        </h3>
        <div className="space-y-2">
          {RESOURCES.map((r) => (
            <a
              key={r.name}
              href={r.href}
              target={r.href.startsWith("tel") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                r.urgent
                  ? "bg-destructive/10 hover:bg-destructive/20"
                  : "bg-primary/20 hover:bg-primary/30"
              }`}
            >
              <r.icon
                className="w-5 h-5 shrink-0"
                style={{ color: r.urgent ? "var(--destructive)" : undefined }}
              />
              <div>
                <div className="font-semibold text-foreground text-sm">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.detail}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Breathing */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">
          🫁 4-7-8 Breathing
        </h3>
        {breathActive ? (
          <div className="text-center py-4">
            <div
              className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center border-[3px]"
              style={{
                borderColor: "var(--accent)",
                background: "color-mix(in oklch, var(--accent) 12%, transparent)",
                transform: `scale(${scales[breathStep]})`,
                transition: `transform ${durations[breathStep]}ms ease-in-out`,
              }}
            >
              <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                {labels[breathStep]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Cycle {breathCycle + 1}</p>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setBreathActive(false)
                setBreathStep(0)
                setBreathCycle(0)
              }}
            >
              Stop
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              A proven technique for calming anxiety. Inhale 4s, hold 7s, exhale 8s.
            </p>
            <Button variant="ghost" className="cursor-pointer" size="sm" onClick={() => setBreathActive(true)}>
              Start Breathing Exercise
            </Button>
          </div>
        )}
      </div>

      {/* Grounding */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          🌍 5-4-3-2-1 Grounding
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Use your senses to anchor yourself when feeling overwhelmed.
        </p>
        <div className="space-y-1.5">
          {groundingSenses.map((g) => (
            <div
              key={g.n}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/10 border border-border"
            >
              <span className="text-xl font-extrabold w-6 text-center" style={{ color: g.color }}>
                {g.n}
              </span>
              <g.icon className="w-4 h-4" style={{ color: g.color }} />
              <span className="text-sm text-foreground">
                things you can{" "}
                <strong style={{ color: g.color }}>{g.sense}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">
          💡 Wellness Tips
        </h3>
        <div className="space-y-3">
          {[
            "Keep a consistent sleep schedule, even on rest days.",
            "Stay connected — even a short message to someone you love helps.",
            "Move your body daily. A 10-minute walk counts.",
            "Limit caffeine and energy drinks. Stay hydrated.",
            "Talking about it is strength, not weakness.",
            "Write down 3 things you're grateful for before lights out.",
          ].map((tip, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
              <span className="text-sm text-muted-foreground leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── main page ─────────────────────────── */

export default function WellnessPage() {
  const {
    entries,
    checkinEntries,
    journalEntries,
    isLoaded,
    addEntry,
    updateEntry,
    deleteEntry,
    getMoodStats,
    getStreak,
  } = useWellness()
  const [tab, setTab] = useState<TabId>("checkin")
  const moodStats = getMoodStats()
  const streak = getStreak()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-accent mb-3" />
          <p className="text-sm text-muted-foreground">Loading Wellness Hub…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header */}
      <div className="relative overflow-hidden border-b bg-primary dark:bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
          {/* Top row */}
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                <Link href="./" aria-label="Go back">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Wellness Hub</h1>
                <p className="text-white/70 mt-1.5 text-sm sm:text-base max-w-lg leading-relaxed">
                  Track your mental & physical health
                </p>
              </div>
            </div>
              {/* Emergency line - desktop */}
              <a
                href="tel:988"
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors text-sm font-semibold"
                aria-label="Call Veterans Crisis Line: 988, Press 1"
              >
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-sm">Veterans Crisis Line</div>
                  <div className="text-xs">988, Press 1</div>
                </div>
                <span className="text-white/50 text-xs font-normal ml-1">24/7</span>
              </a>
          </div>

          {/* Tabs*/}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
            {TABS.map((t) => {
              const isActive = t.id === tab

              return (
                <button
                  key={t.label}
                  onClick={() => setTab(t.id)}
                  aria-label={`${t.label}. Click to view.`}
                  className={`
                    group relative rounded-xl p-3.5 text-left transition-all duration-200
                    border backdrop-blur
                    ${isActive
                      ? "bg-white/40 shadow-sm"
                      : "bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/20 cursor-pointer"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-white/10 ${!isActive && "group-hover:bg-white/20"}`}>
                      <t.icon
                        className={`w-4 h-4 transition-colors text-white/70 ${!isActive && "group-hover:text-white"}`}
                        aria-hidden="true"
                      />
                    </div>

                    <p
                      className={`
                        text-xl font-bold transition-colors
                        ${isActive ? "text-white" : "text-white/60 group-hover:text-white"}
                      `}
                    >
                      {t.label}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {tab === "checkin" && (
          <CheckInTab
            checkinEntries={checkinEntries}
            allEntries={entries}
            addEntry={addEntry}
            updateEntry={updateEntry}
            streak={streak}
          />
        )}
        {tab === "journal" && (
          <JournalTab
            journalEntries={journalEntries}
            addEntry={addEntry}
            updateEntry={updateEntry}
            deleteEntry={deleteEntry}
          />
        )}
        {tab === "trends" && <TrendsTab checkinEntries={checkinEntries} moodStats={moodStats} />}
        {tab === "resources" && <ResourcesTab />}
      </main>

      <Footer />
    </div>
  )
}