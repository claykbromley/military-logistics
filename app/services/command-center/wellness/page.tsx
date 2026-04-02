"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  ArrowLeft, Plus, BookOpen, Smile, Meh, Frown, ChevronDown, Trash2, Edit, Flame, PhoneCall,
  Lock, Unlock, Phone, ExternalLink, Moon, Zap, Dumbbell, Heart, Target, TrendingUp, BarChart3, Activity,
  Wind, Loader2, Check, AlertTriangle, Eye, Hand, Ear, Flower2, Cookie, Brain,
  Timer, Trophy, ChevronRight, Shield, Repeat, Clock, Swords, Bike, Mountain, CircleDot, Footprints,
  Info, ClipboardCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useWellness,
  type JournalEntry, type Mood, type WorkoutDetails, type FitnessTestScores, type WorkoutCategory,
  type BranchTestConfig
} from "@/hooks/use-wellness"

/* ─────────────────────────── constants ─────────────────────────── */

const moods: {
  value: Mood
  label: string
  icon: React.ReactNode
  emoji: string
  cssColor: string
  cssBg: string
}[] = [
  { value: "great", label: "Great", icon: <Smile className="w-4 h-4" />, emoji: "💪", cssColor: "var(--success)", cssBg: "color-mix(in oklch, var(--success) 14%, transparent)" },
  { value: "good", label: "Good", icon: <Smile className="w-4 h-4" />, emoji: "😊", cssColor: "var(--chart-4)", cssBg: "color-mix(in oklch, var(--chart-4) 14%, transparent)" },
  { value: "neutral", label: "Okay", icon: <Meh className="w-4 h-4" />, emoji: "😐", cssColor: "var(--chart-3)", cssBg: "color-mix(in oklch, var(--chart-3) 14%, transparent)" },
  { value: "struggling", label: "Struggling", icon: <Frown className="w-4 h-4" />, emoji: "😔", cssColor: "var(--chart-2)", cssBg: "color-mix(in oklch, var(--chart-2) 14%, transparent)" },
  { value: "difficult", label: "Difficult", icon: <Frown className="w-4 h-4" />, emoji: "😞", cssColor: "var(--destructive)", cssBg: "color-mix(in oklch, var(--destructive) 14%, transparent)" },
]

const WORKOUT_CATEGORIES: { value: WorkoutCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "cardio", label: "Cardio", icon: <Footprints className="w-4 h-4" />, color: "var(--destructive)" },
  { value: "strength", label: "Strength", icon: <Dumbbell className="w-4 h-4" />, color: "var(--accent)" },
  { value: "flexibility", label: "Flexibility", icon: <Wind className="w-4 h-4" />, color: "var(--chart-4)" },
  { value: "combat", label: "Combat / Martial Arts", icon: <Swords className="w-4 h-4" />, color: "var(--chart-2)" },
  { value: "ruck", label: "Ruck March", icon: <Mountain className="w-4 h-4" />, color: "var(--success)" },
  { value: "circuit", label: "Circuit / HIIT", icon: <Repeat className="w-4 h-4" />, color: "var(--holiday)" },
  { value: "sports", label: "Sports / Rec", icon: <Bike className="w-4 h-4" />, color: "var(--primary)" },
  { value: "other", label: "Other", icon: <CircleDot className="w-4 h-4" />, color: "var(--chart-3)" },
]

const FITNESS_RESOURCES = [
  { name: "Military.com Fitness", detail: "Workout plans & fitness calculators", icon: ExternalLink, href: "https://www.military.com/military-fitness" },
  { name: "HPRC - Total Force Fitness", detail: "Human Performance Resource Center", icon: ExternalLink, href: "https://www.hprc-online.org/" },
  { name: "Operation Supplement Safety", detail: "DoD dietary supplement resource", icon: ExternalLink, href: "https://www.opss.org/" },
]

const MENTAL_WELLNESS_RESOURCES = [
  { name: "Military OneSource", detail: "Counseling & wellness support · 24/7", icon: ExternalLink, href: "https://www.militaryonesource.mil/" },
  { name: "Real Warriors", detail: "Mental health resources for service members", icon: ExternalLink, href: "https://www.realwarriors.net/" },
  { name: "Talkspace for Military", detail: "Online therapy for military families", icon: ExternalLink, href: "https://www.talkspace.com/military/" },
  { name: "Give an Hour", detail: "Free mental health services for military", icon: ExternalLink, href: "https://giveanhour.org/" },
  { name: "InTransition", detail: "Coaching for psychological health care transitions", icon: ExternalLink, href: "https://www.intransition.militaryonesource.mil/" },
]

const CRISIS_RESOURCES = [
  { name: "Veterans Crisis Line", detail: "Dial 988, Press 1", icon: Phone, href: "tel:988", urgent: true },
  { name: "Military OneSource", detail: "1-800-342-9647 · 24/7", icon: ExternalLink, href: "https://www.militaryonesource.mil/", urgent: false },
]

const TABS = [
  { id: "trends", label: "Trends & Log", icon: BarChart3 },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "fitness-test", label: "Fitness Test", icon: Trophy },
  { id: "resources", label: "Resources", icon: Shield },
] as const

type TabId = (typeof TABS)[number]["id"]

function todayStr() {
  return new Date().toLocaleDateString("en-CA")
}

function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

/* ─────────────────────────── shared components ─────────────────────────── */

function MoodSelector({ value, onChange, size = "md" }: { value?: Mood; onChange: (m: Mood | undefined) => void; size?: "sm" | "md" }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {moods.map((m) => {
        const active = value === m.value
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(active ? undefined : m.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border transition-all cursor-pointer
              ${size === "sm" ? "px-3 py-1 text-xs" : "flex-col px-3.5 py-2.5 text-[11px] min-w-[68px]"}
              ${active ? "font-semibold" : "border-border dark:border-slate-700 text-muted-foreground hover:border-muted-foreground/40"}`}
            style={active ? { borderColor: m.cssColor, background: m.cssBg, color: m.cssColor } : undefined}
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

function MetricSlider({ label, icon, value, onChange, min = 0, max = 10, step = 0.5, unit = "" }: {
  label: string; icon: React.ReactNode; value: number; onChange: (n: number) => void
  min?: number; max?: number; step?: number; unit?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">{icon}{label}</span>
        <span className="text-xs font-bold text-accent">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--accent)] cursor-pointer" />
      <div className="flex justify-between text-[10px] text-muted-foreground/60">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

/* ─────────────────────────── journal entry dialog ─────────────────────────── */

function AddEntryDialog({ open, onOpenChange, onSave, editingEntry }: {
  open: boolean; onOpenChange: (open: boolean) => void
  onSave: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  editingEntry?: JournalEntry | null
}) {
  const [title, setTitle] = useState(editingEntry?.title || "")
  const [content, setContent] = useState(editingEntry?.content || "")
  const [mood, setMood] = useState<Mood | undefined>(editingEntry?.mood)
  const [isPrivate, setIsPrivate] = useState(editingEntry?.isPrivate ?? true)

  useEffect(() => {
    if (open) {
      setTitle(editingEntry?.title || "")
      setContent(editingEntry?.content || "")
      setMood(editingEntry?.mood)
      setIsPrivate(editingEntry?.isPrivate ?? true)
    }
  }, [open, editingEntry])

  const handleSave = () => {
    if (!content.trim()) return
    onSave({ title: title.trim() || undefined, content: content.trim(), mood, isPrivate, entryType: "journal", entryDate: todayStr() } as any)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "Edit Entry" : "New Journal Entry"}</DialogTitle>
          <DialogDescription>Take a moment to reflect on your thoughts and training.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="journal-title" className="text-xs font-semibold">Title (optional)</Label>
            <Input id="journal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Post-ruck reflections…" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">How are you feeling?</Label>
            <MoodSelector value={mood} onChange={setMood} size="sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="journal-content" className="text-xs font-semibold">Your thoughts</Label>
            <Textarea id="journal-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write freely, this is your space…" rows={6} />
          </div>
          <button type="button" onClick={() => setIsPrivate(!isPrivate)} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {isPrivate ? "Private entry" : "Public entry"}
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer" disabled={!content.trim()}>{editingEntry ? "Save Changes" : "Save Entry"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function JournalEntryCard({ entry, onEdit, onDelete }: { entry: JournalEntry; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const moodInfo = entry.moodScore ? moods[5 - entry.moodScore] : null
  const long = entry.content.length > 180

  return (
    <div className="bg-card border rounded-xl p-4 transition-colors hover:border-muted-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="text-[11px] text-muted-foreground/70">{formatShortDate(entry.createdAt)}</span>
            {entry.isPrivate && <Lock className="w-3 h-3 text-muted-foreground/40" />}
            {moodInfo && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: moodInfo.cssColor, background: moodInfo.cssBg }}>
                {moodInfo.emoji} {moodInfo.label}
              </span>
            )}
          </div>
          {entry.title && <h3 className="font-semibold text-foreground mb-1 text-[15px]">{entry.title}</h3>}
          <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap ${long ? "cursor-pointer" : ""}`} onClick={() => long && setExpanded(!expanded)}>
            {long && !expanded ? entry.content.slice(0, 180) + "…" : entry.content}
          </p>
          {long && <button onClick={() => setExpanded(!expanded)} className="text-xs text-accent hover:underline mt-1">{expanded ? "Show less" : "Read more"}</button>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="shrink-0 cursor-pointer"><ChevronDown className="w-4 h-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer hover:!text-white"><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive cursor-pointer hover:!bg-destructive hover:!text-white"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/* ─────────────────────────── check-in dialog ─────────────────────────── */

function DailyCheckinDialog({ open, onOpenChange, todayCheckin, addEntry, updateEntry }: {
  open: boolean; onOpenChange: (open: boolean) => void
  todayCheckin?: JournalEntry | null
  addEntry: (e: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  updateEntry: (id: string, e: Partial<JournalEntry>) => void
}) {
  const td = todayStr()
  const [mood, setMood] = useState<Mood | undefined>(todayCheckin?.mood)
  const [sleep, setSleep] = useState(todayCheckin?.sleepHours ?? 7)
  const [energy, setEnergy] = useState(todayCheckin?.energyLevel ?? 5)
  const [exercise, setExercise] = useState(todayCheckin?.exerciseMinutes ?? 0)
  const [stress, setStress] = useState(todayCheckin?.stress ?? 0)
  const [goals, setGoals] = useState(todayCheckin?.goals || "")

  useEffect(() => {
    if (open) {
      setMood(todayCheckin?.mood)
      setSleep(todayCheckin?.sleepHours ?? 7)
      setEnergy(todayCheckin?.energyLevel ?? 5)
      setExercise(todayCheckin?.exerciseMinutes ?? 0)
      setStress(todayCheckin?.stress ?? 0)
      setGoals(todayCheckin?.goals || "")
    }
  }, [open, todayCheckin])

  const handleSave = () => {
    const data = {
      entryDate: td, entryType: "checkin" as const, mood, sleepHours: sleep, energyLevel: energy,
      stress, exerciseMinutes: exercise, goals: goals.trim() || undefined, content: "", isPrivate: true,
    }
    if (todayCheckin) { updateEntry(todayCheckin.id, data) } else { addEntry(data as any) }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{todayCheckin ? "Update Today's Check-In" : "Daily Readiness Check-In"}</DialogTitle>
          <DialogDescription>Track how you're feeling to monitor your readiness over time.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground">How are you feeling today?</Label>
            <MoodSelector value={mood} onChange={setMood} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <MetricSlider label="Sleep" icon={<Moon className="w-3.5 h-3.5" />} value={sleep} onChange={setSleep} min={0} max={12} unit="h" />
            <MetricSlider label="Energy" icon={<Zap className="w-3.5 h-3.5" />} value={energy} onChange={setEnergy} min={1} max={10} />
            <MetricSlider label="Exercise" icon={<Dumbbell className="w-3.5 h-3.5" />} value={exercise} onChange={setExercise} min={0} max={120} step={5} unit="m" />
            <MetricSlider label="Soreness / Fatigue" icon={<Activity className="w-3.5 h-3.5" />} value={stress} onChange={setStress} min={0} max={10} step={1} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />Today's Training Focus</Label>
            <Textarea value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="What are you working on today?" rows={2} className="text-sm resize-none dark:border-slate-700" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer">{todayCheckin ? "Update Check-In" : "Save Check-In"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────────────────────── tab: trends & log (merged) ─────────────────────────── */

function TrendsAndLogTab({
  checkinEntries,
  workoutEntries,
  journalEntries,
  allEntries,
  moodStats,
  streak,
  addEntry,
  updateEntry,
  deleteEntry,
}: {
  checkinEntries: JournalEntry[]
  workoutEntries: JournalEntry[]
  journalEntries: JournalEntry[]
  allEntries: JournalEntry[]
  moodStats: { total: number; counts: Record<Mood, number> }
  streak: number
  addEntry: (e: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  updateEntry: (id: string, e: Partial<JournalEntry>) => void
  deleteEntry: (id: string) => void
}) {
  const td = todayStr()
  const todayCheckin = checkinEntries.find((e) => e.entryDate === td)

  // ── Dialog state ──
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  const handleSaveJournal = (entryData: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => {
    if (editingEntry) { updateEntry(editingEntry.id, entryData); setEditingEntry(null) }
    else { addEntry(entryData) }
  }

  // ── 7-day streak dots ──
  const last7 = useMemo(() => {
    const days: { date: string; day: string; entry?: JournalEntry }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toLocaleDateString("en-CA")
      const checkin = checkinEntries.find((e) => e.entryDate === ds)
      const any = allEntries.find((e) => e.entryDate === ds)
      days.push({ date: ds, day: d.toLocaleDateString("en-US", { weekday: "narrow" }), entry: checkin || any })
    }
    return days
  }, [checkinEntries, allEntries])

  // ── 30-day data ──
  const checkinMap = new Map(checkinEntries.map(e => [e.entryDate, e]))
  const workoutMap = new Map<string, JournalEntry[]>()

  workoutEntries.forEach(e => {
    if (!workoutMap.has(e.entryDate)) workoutMap.set(e.entryDate, [])
    workoutMap.get(e.entryDate)!.push(e)
  })

  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const last30 = useMemo(() => {
    const days: {
      date: string
      label: string
      checkin?: JournalEntry
      workouts: JournalEntry[]
    }[] = []

    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const ds = formatLocalDate(d)

      days.push({
        date: ds,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        checkin: checkinMap.get(ds),
        workouts: workoutMap.get(ds) || []
      })
    }

    return days
  }, [checkinEntries, workoutEntries])

  const avgSleep = useMemo(() => { const ws = checkinEntries.filter((e) => (e.sleepHours || 0) > 0); return ws.length ? (ws.reduce((a, e) => a + (e.sleepHours || 0), 0) / ws.length).toFixed(1) : null }, [checkinEntries])
  const avgEnergy = useMemo(() => { const we = checkinEntries.filter((e) => (e.energyLevel || 0) > 0); return we.length ? (we.reduce((a, e) => a + (e.energyLevel || 0), 0) / we.length).toFixed(1) : null }, [checkinEntries])
  const totalWorkouts30d = useMemo(() => { const c = new Date(); c.setDate(c.getDate() - 30); return workoutEntries.filter((e) => e.entryDate >= c.toLocaleDateString("en-CA")).length }, [workoutEntries])
  const totalExerciseMin = useMemo(() => { const c = new Date(); c.setDate(c.getDate() - 30); const cs = c.toLocaleDateString("en-CA"); return [...checkinEntries, ...workoutEntries].filter((e) => e.entryDate >= cs).reduce((a, e) => a + (e.exerciseMinutes || e.workoutDetails?.durationMinutes || 0), 0) }, [checkinEntries, workoutEntries])
  const totalMoods = moodStats.total

  const todayMoodInfo = todayCheckin?.mood ? moods.find((m) => m.value === todayCheckin.mood) : null

  return (
    <div className="space-y-5">
      {/* ── Streak + 7-day dots + check-in button ── */}
      <div className="bg-card border rounded-xl p-5 relative overflow-hidden">
        {streak >= 3 && <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ background: "radial-gradient(ellipse at 30% 50%, var(--accent), transparent 70%)" }} />}
        <div className="relative flex justify-between items-start mb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">Training Streak</div>
            <div className="text-3xl font-extrabold" style={{ color: streak > 0 ? "var(--holiday)" : undefined }}>
              {streak > 0 && <Flame className="w-7 h-7 inline-block mr-1 -mt-1" style={{ color: "var(--holiday)" }} />}
              {streak} day{streak !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-muted-foreground text-right">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
            <Button
              size="sm"
              onClick={() => setCheckinDialogOpen(true)}
              className="cursor-pointer"
              variant={todayCheckin ? "outline" : "default"}
            >
              {todayCheckin ? (
                <>
                  {todayMoodInfo && <span className="mr-1">{todayMoodInfo.emoji}</span>}
                  <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
                  Update Check-In
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                  Daily Check-In
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex gap-1.5">
          {last7.map((d) => {
            const isToday = d.date === td
            const mi = d.entry?.moodScore ? moods[5 - d.entry.moodScore] : null
            return (
              <div key={d.date} className={`flex-1 text-center py-2 rounded-lg border transition-all ${isToday ? "border-accent border-2" : "border-border dark:border-slate-700"}`} style={d.entry ? { background: mi?.cssBg || "var(--accent)/0.1" } : undefined}>
                <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">{d.day}</div>
                <div className="text-sm">{d.entry ? mi?.emoji || "✓" : "·"}</div>
              </div>
            )
          })}
        </div>
      </div>

      <DailyCheckinDialog open={checkinDialogOpen} onOpenChange={setCheckinDialogOpen} todayCheckin={todayCheckin} addEntry={addEntry} updateEntry={updateEntry} />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Workouts (30d)", value: String(totalWorkouts30d), icon: Dumbbell, color: "var(--accent)" },
          { label: "Avg Sleep", value: avgSleep ? `${avgSleep}h` : "—", icon: Moon, color: "var(--primary)" },
          { label: "Avg Energy", value: avgEnergy ?? "—", icon: Zap, color: "var(--holiday)" },
          { label: "Total Exercise", value: totalExerciseMin ? `${totalExerciseMin}m` : "-", icon: Timer, color: "var(--success)" },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
            <s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
            <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Activity heatmap ── */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">30-Day Activity</h3>
        <div className="flex items-end gap-[2px] h-[90px]">
          {last30.map((d) => {
            const hasCheckin = !!d.checkin; const workoutCount = d.workouts.length
            const mi = d.checkin?.mood ? moods[5 - (d.checkin?.moodScore || 3)] : null
            const h = workoutCount > 0 ? Math.min(workoutCount * 25 + 20, 82) : hasCheckin ? 15 : 4
            return (
              <div key={d.date} title={`${d.label}: ${workoutCount} workout${workoutCount !== 1 ? "s" : ""}${hasCheckin ? ", checked in" : ""}`}
                className="flex-1 min-w-0 rounded-sm transition-all"
                style={{ height: h, background: workoutCount > 0 ? "var(--accent)" : hasCheckin ? (mi?.cssColor || "var(--chart-3)") : "var(--secondary)", opacity: workoutCount > 0 ? 0.8 : hasCheckin ? 0.5 : 0.25 }} />
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground/50"><span>{last30[0]?.label}</span><span>Today</span></div>
        <div className="flex gap-4 mt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-[3px] rounded-full inline-block" style={{ background: "var(--accent)" }} />Workout</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-[3px] rounded-full inline-block" style={{ background: "var(--chart-3)" }} />Check-in only</span>
        </div>
      </div>

      {/* ── Sleep & Energy lines ── */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">Sleep & Energy (30 Days)</h3>
        <div className="relative h-[80px]">
          <svg viewBox={`0 0 ${last30.length * 10} 80`} className="w-full h-[80px]" preserveAspectRatio="none">
            <polyline points={last30.map((d, i) => { const s = d.checkin?.sleepHours || 0; return `${i * 10 + 5},${s > 0 ? 80 - (s / 12) * 70 : 80}` }).join(" ")} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" opacity="0.7" />
            <polyline points={last30.map((d, i) => { const e = d.checkin?.energyLevel || 0; return `${i * 10 + 5},${e > 0 ? 80 - (e / 10) * 70 : 80}` }).join(" ")} fill="none" stroke="var(--holiday)" strokeWidth="2" strokeLinejoin="round" opacity="0.7" />
          </svg>
        </div>
        <div className="flex gap-4 mt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-[3px] rounded-full inline-block" style={{ background: "var(--primary)" }} />Sleep</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-[3px] rounded-full inline-block" style={{ background: "var(--holiday)" }} />Energy</span>
        </div>
      </div>

      {/* ── Readiness distribution ── */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">Readiness Distribution</h3>
        {totalMoods === 0 ? (
          <p className="text-center text-sm text-muted-foreground/50 py-5">Start logging daily check-ins to see your readiness trends.</p>
        ) : (
          <div className="space-y-2.5">
            {moods.map((m) => {
              const count = moodStats.counts[m.value]; const pct = totalMoods > 0 ? ((count / totalMoods) * 100).toFixed(0) : "0"
              return (
                <div key={m.value} className="flex items-center gap-2.5">
                  <span className="text-sm w-5 text-center">{m.emoji}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-muted dark:bg-secondary"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: m.cssColor }} /></div>
                  <span className="text-[11px] text-muted-foreground w-14 text-right tabular-nums">{count} ({pct}%)</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Journal entries ── */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground">Journal Entries</h2>
        <Button size="sm" onClick={() => { setEditingEntry(null); setIsDialogOpen(true) }} className="cursor-pointer"><Plus className="w-4 h-4 mr-1.5" />New Entry</Button>
      </div>

      {journalEntries.length === 0 ? (
        <div className="text-center py-10 bg-card border rounded-xl">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No journal entries yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Capture thoughts, reflections, and training notes.</p>
          <Button size="sm" className="cursor-pointer" onClick={() => { setEditingEntry(null); setIsDialogOpen(true) }}>Write Your First Entry</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {journalEntries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} onEdit={() => { setEditingEntry(entry); setIsDialogOpen(true) }} onDelete={() => deleteEntry(entry.id)} />
          ))}
        </div>
      )}

      <AddEntryDialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingEntry(null) }} onSave={handleSaveJournal} editingEntry={editingEntry} />
    </div>
  )
}

/* ─────────────────────────── tab: workouts ─────────────────────────── */

function LogWorkoutDialog({ open, onOpenChange, onSave, editingEntry }: {
  open: boolean; onOpenChange: (open: boolean) => void
  onSave: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  editingEntry?: JournalEntry | null
}) {
  const existing = editingEntry?.workoutDetails
  const [category, setCategory] = useState<WorkoutCategory>(existing?.category || "strength")
  const [duration, setDuration] = useState(existing?.durationMinutes || 45)
  const [intensity, setIntensity] = useState(existing?.intensityLevel || 6)
  const [notes, setNotes] = useState(existing?.notes || "")
  const [exerciseLines, setExerciseLines] = useState(
    existing?.exercises?.map((e) => `${e.name}${e.sets ? ` — ${e.sets}x${e.reps || ""}` : ""}${e.weight ? ` @ ${e.weight}` : ""}${e.distance ? ` ${e.distance}` : ""}${e.time ? ` (${e.time})` : ""}`).join("\n") || ""
  )

  useEffect(() => {
    if (open) {
      const ex = editingEntry?.workoutDetails
      setCategory(ex?.category || "strength"); setDuration(ex?.durationMinutes || 45)
      setIntensity(ex?.intensityLevel || 6); setNotes(ex?.notes || "")
      setExerciseLines(ex?.exercises?.map((e) => `${e.name}${e.sets ? `  ${e.sets}x${e.reps || ""}` : ""}${e.weight ? ` @ ${e.weight}` : ""}${e.distance ? ` ${e.distance}` : ""}${e.time ? ` (${e.time})` : ""}`).join("\n") || "")
    }
  }, [open, editingEntry])

  const handleSave = () => {
    const exercises = exerciseLines.split("\n").filter((l) => l.trim()).map((line) => ({ name: line.split("—")[0]?.split("@")[0]?.trim() || line.trim() }))
    const workoutDetails: WorkoutDetails = { category, durationMinutes: duration, intensityLevel: intensity, exercises, notes: notes.trim() || undefined }
    const catInfo = WORKOUT_CATEGORIES.find((c) => c.value === category)
    onSave({ entryDate: todayStr(), entryType: "workout", title: catInfo?.label || "Workout", content: JSON.stringify(workoutDetails), exerciseMinutes: duration, workoutCategory: category, workoutDetails, isPrivate: true } as any)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "Edit Workout" : "Log a Workout"}</DialogTitle>
          <DialogDescription>Record your training session details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Workout Type</Label>
            <div className="flex flex-wrap gap-2">
              {WORKOUT_CATEGORIES.map((cat) => {
                const active = category === cat.value
                return (
                  <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer ${active ? "font-semibold" : "border-border dark:border-slate-700 text-muted-foreground hover:border-muted-foreground/40"}`}
                    style={active ? { borderColor: cat.color, background: `color-mix(in oklch, ${cat.color} 14%, transparent)`, color: cat.color } : undefined}>
                    {cat.icon}{cat.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MetricSlider label="Duration" icon={<Clock className="w-3.5 h-3.5" />} value={duration} onChange={setDuration} min={5} max={180} step={5} unit="m" />
            <MetricSlider label="Intensity" icon={<Zap className="w-3.5 h-3.5" />} value={intensity} onChange={setIntensity} min={1} max={10} step={1} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Exercises (one per line)</Label>
            <Textarea value={exerciseLines} onChange={(e) => setExerciseLines(e.target.value)} placeholder={"Deadlift — 3x5 @ 315lbs\n2-Mile Run — 14:30\nPull-Ups — 4x10\nPlank — 2:00"} rows={5} className="text-sm font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" rows={2} className="text-sm resize-none" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer">{editingEntry ? "Save Changes" : "Log Workout"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WorkoutCard({ entry, onEdit, onDelete }: { entry: JournalEntry; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const details = entry.workoutDetails
  const catInfo = WORKOUT_CATEGORIES.find((c) => c.value === (details?.category || entry.workoutCategory))

  return (
    <div className="bg-card border rounded-xl p-4 transition-colors hover:border-muted-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="text-[11px] text-muted-foreground/70">{formatShortDate(entry.entryDate || entry.createdAt)}</span>
            {catInfo && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: catInfo.color, background: `color-mix(in oklch, ${catInfo.color} 14%, transparent)` }}>{catInfo.icon} {catInfo.label}</span>}
            {details && <span className="text-[11px] text-muted-foreground">{details.durationMinutes}min · Intensity {details.intensityLevel}/10</span>}
          </div>
          {details?.exercises && details.exercises.length > 0 && (
            <div className={`text-sm text-muted-foreground leading-relaxed ${details.exercises.length > 3 ? "cursor-pointer" : ""}`} onClick={() => details.exercises.length > 3 && setExpanded(!expanded)}>
              {(expanded ? details.exercises : details.exercises.slice(0, 3)).map((ex, i) => (
                <div key={i} className="flex items-center gap-1.5 py-0.5"><ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" /><span>{ex.name}</span></div>
              ))}
              {!expanded && details.exercises.length > 3 && <button className="text-xs text-accent hover:underline mt-1">+{details.exercises.length - 3} more</button>}
            </div>
          )}
          {details?.notes && <p className="text-xs text-muted-foreground/60 mt-2 italic">{details.notes}</p>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="shrink-0 cursor-pointer"><ChevronDown className="w-4 h-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer hover:!text-white"><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive cursor-pointer hover:!bg-destructive hover:!text-white"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function WorkoutsTab({ workoutEntries, addEntry, updateEntry, deleteEntry, weeklyStats }: {
  workoutEntries: JournalEntry[]; addEntry: (e: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  updateEntry: (id: string, e: Partial<JournalEntry>) => void; deleteEntry: (id: string) => void
  weeklyStats: { workoutCount: number; totalMinutes: number; categories: Record<string, number> }
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  const handleSave = (entryData: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => {
    if (editingEntry) { updateEntry(editingEntry.id, entryData); setEditingEntry(null) } else { addEntry(entryData) }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border rounded-xl p-4 text-center"><Dumbbell className="w-5 h-5 mx-auto mb-1" style={{ color: "var(--accent)" }} /><div className="text-xl font-extrabold" style={{ color: "var(--accent)" }}>{weeklyStats.workoutCount}</div><div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 mt-0.5">This Week</div></div>
        <div className="bg-card border rounded-xl p-4 text-center"><Timer className="w-5 h-5 mx-auto mb-1" style={{ color: "var(--primary)" }} /><div className="text-xl font-extrabold" style={{ color: "var(--primary)" }}>{weeklyStats.totalMinutes}m</div><div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 mt-0.5">Total Time</div></div>
        <div className="bg-card border rounded-xl p-4 text-center"><Target className="w-5 h-5 mx-auto mb-1" style={{ color: "var(--holiday)" }} /><div className="text-xl font-extrabold" style={{ color: "var(--holiday)" }}>{Object.keys(weeklyStats.categories).length}</div><div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 mt-0.5">Categories</div></div>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground">Workout Log</h2>
        <Button size="sm" onClick={() => { setEditingEntry(null); setDialogOpen(true) }} className="cursor-pointer"><Plus className="w-4 h-4 mr-1.5" />Log Workout</Button>
      </div>
      {workoutEntries.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-xl"><Dumbbell className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" /><h3 className="font-semibold text-foreground mb-1">No workouts logged</h3><p className="text-sm text-muted-foreground mb-4">Start tracking your training to see your progress.</p><Button size="sm" className="cursor-pointer" onClick={() => { setEditingEntry(null); setDialogOpen(true) }}>Log Your First Workout</Button></div>
      ) : (
        <div className="space-y-3">{workoutEntries.map((entry) => (<WorkoutCard key={entry.id} entry={entry} onEdit={() => { setEditingEntry(entry); setDialogOpen(true) }} onDelete={() => deleteEntry(entry.id)} />))}</div>
      )}
      <LogWorkoutDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingEntry(null) }} onSave={handleSave} editingEntry={editingEntry} />
    </div>
  )
}

/* ─────────────────────────── tab: fitness test (branch-aware) ─────────────────────────── */

function LogFitnessTestDialog({ open, onOpenChange, onSave, testConfig }: {
  open: boolean; onOpenChange: (open: boolean) => void
  onSave: (entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  testConfig: BranchTestConfig
}) {
  const [scores, setScores] = useState<Record<string, string>>(Object.fromEntries(testConfig.events.map((e) => [e.key, ""])))
  const [componentScores, setComponentScores] = useState<Record<string, string>>(Object.fromEntries(testConfig.events.map((e) => [e.key, ""])))
  const [notes, setNotes] = useState("")
  const [testDate, setTestDate] = useState(todayStr())

  useEffect(() => {
    if (open) {
      setScores(Object.fromEntries(testConfig.events.map((e) => [e.key, ""])))
      setComponentScores(Object.fromEntries(testConfig.events.map((e) => [e.key, ""])))
      setNotes(""); setTestDate(todayStr())
    }
  }, [open, testConfig])

  const totalScore = useMemo(() => Object.values(componentScores).reduce((sum, s) => sum + (parseFloat(s) || 0), 0), [componentScores])
  const allFilled = Object.values(scores).some((v) => v.trim() !== "")

  const handleSave = () => {
    const components = testConfig.events.map((evt) => ({
      name: evt.name, raw: scores[evt.key] || "",
      score: parseFloat(componentScores[evt.key]) || undefined, maxScore: evt.maxScore,
    })).filter((c) => c.raw)

    const fitnessTestScores: FitnessTestScores = {
      testType: testConfig.testType,
      totalScore: totalScore || undefined,
      maxScore: testConfig.maxTotal,
      pass: totalScore >= testConfig.passingScore,
      components,
      notes: notes.trim() || undefined,
    }

    onSave({
      entryDate: testDate, entryType: "fitness_test",
      title: `${testConfig.testAbbrev} — ${Math.round(totalScore)}/${testConfig.maxTotal}`,
      content: JSON.stringify(fitnessTestScores), fitnessTestScores, isPrivate: true,
    } as any)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log {testConfig.testAbbrev} Results</DialogTitle>
          <DialogDescription>Record your {testConfig.testName} scores.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {testConfig.scoringNote && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-border text-xs text-muted-foreground">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
              <span>{testConfig.scoringNote}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Test Date</Label>
            <Input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
          </div>
          <div className="space-y-3">
            {testConfig.events.map((evt) => (
              <div key={evt.key} className="grid grid-cols-[1fr_100px_80px] gap-2 items-end">
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">{evt.name}</Label>
                  <Input placeholder={evt.unit} value={scores[evt.key]} onChange={(e) => setScores((p) => ({ ...p, [evt.key]: e.target.value }))} className="text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-muted-foreground">Score</Label>
                  <Input type="number" placeholder={`0-${evt.maxScore}`} min={0} max={evt.maxScore} value={componentScores[evt.key]} onChange={(e) => setComponentScores((p) => ({ ...p, [evt.key]: e.target.value }))} className="text-sm mt-1" />
                </div>
                <div className="text-[11px] text-muted-foreground/60 pb-2.5">/ {evt.maxScore}</div>
              </div>
            ))}
          </div>
          <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Total Score</span>
            <span className="text-xl font-extrabold" style={{ color: totalScore >= testConfig.passingScore ? "var(--success)" : totalScore > 0 ? "var(--destructive)" : "var(--muted-foreground)" }}>
              {Math.round(totalScore)}/{testConfig.maxTotal}
            </span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Conditions, areas to improve, etc." rows={2} className="text-sm resize-none" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="cursor-pointer" disabled={!allFilled}>Save Results</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FitnessTestTab({ fitnessTestEntries, addEntry, deleteEntry, testConfigs }: {
  fitnessTestEntries: JournalEntry[]; addEntry: (e: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => void
  deleteEntry: (id: string) => void; testConfigs: BranchTestConfig[]
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedConfigIdx, setSelectedConfigIdx] = useState(0)
  const testConfig = testConfigs[selectedConfigIdx] || testConfigs[0]
  const hasMultipleTests = testConfigs.length > 1

  const latestTest = fitnessTestEntries[0]
  const latestScores = latestTest?.fitnessTestScores

  return (
    <div className="space-y-5">
      {/* Branch indicator + test selector */}
      {hasMultipleTests ? (
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Shield className="w-4 h-4" />
            <span>Select which test to view or log:</span>
          </div>
          <div className="flex gap-2">
            {testConfigs.map((cfg, idx) => (
              <button
                key={cfg.testAbbrev}
                onClick={() => setSelectedConfigIdx(idx)}
                className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer text-center ${
                  idx === selectedConfigIdx
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border dark:border-slate-700 text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                {cfg.testAbbrev}
                <span className="block text-[10px] font-normal mt-0.5 opacity-70">{cfg.testName}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>{testConfig.testName} ({testConfig.testAbbrev})</span>
          {testConfig.testType === "custom" && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium ml-1">— Set your branch in profile settings for branch-specific events</span>
          )}
        </div>
      )}

      {/* Latest score card */}
      {latestScores && (
        <div className="bg-card border rounded-xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ background: `radial-gradient(ellipse at 30% 50%, ${latestScores.pass ? "var(--success)" : "var(--destructive)"}, transparent 70%)` }} />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">Latest {testConfig.testAbbrev}</div>
                <div className="text-4xl font-extrabold" style={{ color: latestScores.pass ? "var(--success)" : "var(--destructive)" }}>
                  {latestScores.totalScore != null ? Math.round(latestScores.totalScore) : "—"}
                  <span className="text-lg font-normal text-muted-foreground">/{latestScores.maxScore || testConfig.maxTotal}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${latestScores.pass ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                  {latestScores.pass ? <><Check className="w-3 h-3" /> PASS</> : <><AlertTriangle className="w-3 h-3" /> NEEDS WORK</>}
                </span>
                <div className="text-[11px] text-muted-foreground mt-1">{formatShortDate(latestTest.entryDate || latestTest.createdAt)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {latestScores.components.map((comp) => {
                const eventConfig = testConfig.events.find((e) => e.name === comp.name)
                const compMax = comp.maxScore || eventConfig?.maxScore || 100
                const passPct = testConfig.maxTotal <= 100 ? 0.6 : 0.6 // 60% as a rough pass threshold per event
                return (
                  <div key={comp.name} className="bg-background/50 rounded-lg p-2.5 border border-border/50">
                    <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide mb-0.5 truncate">{comp.name}</div>
                    <div className="text-sm font-bold text-foreground">{comp.raw}</div>
                    {comp.score !== undefined && (
                      <div className="text-[11px] font-semibold" style={{ color: (comp.score || 0) >= compMax * passPct ? "var(--success)" : "var(--destructive)" }}>
                        {comp.score}/{compMax}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Score history chart */}
      {fitnessTestEntries.length >= 2 && (
        <div className="bg-card border rounded-xl p-5">
          <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">Score History</h3>
          <div className="flex items-end gap-2 h-[100px]">
            {[...fitnessTestEntries].reverse().map((entry) => {
              const sc = entry.fitnessTestScores; const total = sc?.totalScore || 0; const max = sc?.maxScore || testConfig.maxTotal
              const h = Math.max((total / max) * 90, 8)
              return (
                <div key={entry.id} className="flex-1 min-w-0 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold" style={{ color: sc?.pass ? "var(--success)" : "var(--destructive)" }}>{Math.round(total)}</span>
                  <div className="w-full rounded-sm transition-all" style={{ height: h, background: sc?.pass ? "var(--success)" : "var(--destructive)", opacity: 0.7 }} />
                  <span className="text-[9px] text-muted-foreground/50 truncate max-w-full">{formatShortDate(entry.entryDate || entry.createdAt).split(",")[0]}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground">Test History</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="cursor-pointer"><Plus className="w-4 h-4 mr-1.5" />Log {testConfig.testAbbrev}</Button>
      </div>

      {fitnessTestEntries.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-xl">
          <Trophy className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No fitness tests recorded</h3>
          <p className="text-sm text-muted-foreground mb-4">Log your {testConfig.testAbbrev} results to track your progress over time.</p>
          <Button size="sm" className="cursor-pointer" onClick={() => setDialogOpen(true)}>Record Your First Test</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {fitnessTestEntries.map((entry) => {
            const sc = entry.fitnessTestScores
            return (
              <div key={entry.id} className="bg-card border rounded-xl p-4 transition-colors hover:border-muted-foreground/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-[11px] text-muted-foreground/70">{formatShortDate(entry.entryDate || entry.createdAt)}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${sc?.pass ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                        {sc?.pass ? "PASS" : "NEEDS WORK"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground text-[15px]">{entry.title}</h3>
                    {sc?.notes && <p className="text-xs text-muted-foreground/60 mt-1 italic">{sc.notes}</p>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="shrink-0 cursor-pointer"><ChevronDown className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteEntry(entry.id)} className="text-destructive cursor-pointer hover:!bg-destructive hover:!text-white"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <LogFitnessTestDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={addEntry} testConfig={testConfig} />
    </div>
  )
}

/* ─────────────────────────── tab: resources ─────────────────────────── */

function ResourcesTab({ testConfigs }: { testConfigs: BranchTestConfig[] }) {
  const primaryConfig = testConfigs[0]

  // Breathing exercise state
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
      {/* Fitness resources */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">📚 Fitness Resources</h3>
        <div className="space-y-2">
          {FITNESS_RESOURCES.map((r) => (
            <a key={r.name} href={r.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg transition-colors bg-primary/10 hover:bg-primary/20">
              <r.icon className="w-5 h-5 shrink-0" />
              <div><div className="font-semibold text-foreground text-sm">{r.name}</div><div className="text-xs text-muted-foreground">{r.detail}</div></div>
            </a>
          ))}
        </div>
      </div>

      {/* Nutrition tips */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">🍎 Nutrition & Recovery</h3>
        <div className="space-y-3">
          {[
            "Aim for 0.7–1g of protein per pound of bodyweight daily to support training.",
            "Hydrate before, during, and after workouts — urine should be light yellow.",
            "Sleep 7–9 hours. Growth hormone peaks during deep sleep cycles.",
            "Post-workout: combine protein + carbs within 60 minutes of training.",
            "Don't skip rest days. Recovery is when adaptation happens.",
            "Limit alcohol — it impairs recovery, sleep quality, and muscle repair.",
          ].map((tip, i) => (
            <div key={i} className="flex gap-2.5 items-start"><TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-accent" /><span className="text-sm text-muted-foreground leading-relaxed">{tip}</span></div>
          ))}
        </div>
      </div>

      {/* ── Mental Wellness Section ── */}

      {/* Mental health resources */}
      <div className="bg-card border rounded-xl p-5" style={{ borderLeftWidth: 3, borderLeftColor: "var(--primary)" }}>
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] mb-4" style={{ color: "var(--primary)" }}>
          🧠 Mental Wellness Resources
        </h3>
        <div className="space-y-2">
          {MENTAL_WELLNESS_RESOURCES.map((r) => (
            <a key={r.name} href={r.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg transition-colors bg-primary/10 hover:bg-primary/20">
              <r.icon className="w-5 h-5 shrink-0" />
              <div><div className="font-semibold text-foreground text-sm">{r.name}</div><div className="text-xs text-muted-foreground">{r.detail}</div></div>
            </a>
          ))}
        </div>
      </div>

      {/* 4-7-8 Breathing */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">🫁 4-7-8 Breathing</h3>
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
              <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{labels[breathStep]}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Cycle {breathCycle + 1}</p>
            <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => { setBreathActive(false); setBreathStep(0); setBreathCycle(0) }}>Stop</Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">A proven technique for calming anxiety and improving focus. Inhale 4s, hold 7s, exhale 8s.</p>
            <Button variant="ghost" className="cursor-pointer" size="sm" onClick={() => setBreathActive(true)}>Start Breathing Exercise</Button>
          </div>
        )}
      </div>

      {/* 5-4-3-2-1 Grounding */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-3">🌍 5-4-3-2-1 Grounding</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">Use your senses to anchor yourself when feeling overwhelmed or stressed.</p>
        <div className="space-y-1.5">
          {groundingSenses.map((g) => (
            <div key={g.n} className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/10 border border-border">
              <span className="text-xl font-extrabold w-6 text-center" style={{ color: g.color }}>{g.n}</span>
              <g.icon className="w-4 h-4" style={{ color: g.color }} />
              <span className="text-sm text-foreground">things you can <strong style={{ color: g.color }}>{g.sense}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Wellness tips */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-4">💡 Wellness Tips</h3>
        <div className="space-y-3">
          {[
            "Keep a consistent sleep schedule, even on rest days.",
            "Stay connected — even a short message to someone you trust helps.",
            "Move your body daily. A 10-minute walk counts.",
            "Limit caffeine and energy drinks. Stay hydrated.",
            "Talking about it is strength, not weakness.",
            "Write down 3 things you're grateful for before lights out.",
          ].map((tip, i) => (
            <div key={i} className="flex gap-2.5 items-start"><Heart className="w-4 h-4 shrink-0 mt-0.5 text-accent" /><span className="text-sm text-muted-foreground leading-relaxed">{tip}</span></div>
          ))}
        </div>
      </div>

      {/* Crisis */}
      <div className="bg-card border rounded-xl p-5" style={{ borderLeftWidth: 3, borderLeftColor: "var(--destructive)" }}>
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-destructive mb-4">🆘 Crisis Support — 24/7</h3>
        <div className="space-y-2">
          {CRISIS_RESOURCES.map((r) => (
            <a key={r.name} href={r.href} target={r.href.startsWith("tel") ? undefined : "_blank"} rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${r.urgent ? "bg-destructive/10 hover:bg-destructive/20" : "bg-primary/20 hover:bg-primary/30"}`}>
              <r.icon className="w-5 h-5 shrink-0" style={{ color: r.urgent ? "var(--destructive)" : undefined }} />
              <div><div className="font-semibold text-foreground text-sm">{r.name}</div><div className="text-xs text-muted-foreground">{r.detail}</div></div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── main page ─────────────────────────── */

export default function WellnessPage() {
  const {
    entries, checkinEntries, journalEntries, workoutEntries, fitnessTestEntries,
    isLoaded, isAuthenticated, addEntry, updateEntry, deleteEntry,
    getMoodStats, getStreak, getWeeklyWorkoutStats, testConfigs,
  } = useWellness()
  const [tab, setTab] = useState<TabId>("trends")
  const moodStats = getMoodStats()
  const streak = getStreak()
  const weeklyStats = getWeeklyWorkoutStats()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin text-accent mb-3" /><p className="text-sm text-muted-foreground">Loading Fitness and Wellness Hub…</p></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header */}
      <div className="relative overflow-hidden border-b bg-primary dark:bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                <Link href="./" aria-label="Go back"><ArrowLeft className="w-5 h-5" /></Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Fitness & Wellness</h1>
                <p className="text-white/70 mt-1.5 text-sm sm:text-base max-w-lg leading-relaxed">Train smarter, test ready, stay mission-fit</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <Button asChild className="bg-white text-primary dark:bg-primary dark:text-primary-foreground hover:bg-white/80 dark:hover:bg-primary/80 cursor-pointer">
                <Link href="/services/medical" className="flex items-center gap-2"><ExternalLink className="w-4 h-4 mr-2" />Milify Medical Services</Link>
              </Button>
              <a href="tel:988" className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors text-sm font-semibold" aria-label="Call Veterans Crisis Line: 988, Press 1">
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
                <div><div className="font-semibold text-sm">Veterans Crisis Line</div><div className="text-xs">988, Press 1</div></div>
                <span className="text-white/50 text-xs font-normal ml-1">24/7</span>
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
            {TABS.map((t) => {
              const isActive = t.id === tab
              return (
                <button key={t.label} onClick={() => setTab(t.id)} aria-label={`${t.label}. Click to view.`}
                  className={`group relative rounded-xl p-3.5 text-left transition-all duration-200 border backdrop-blur ${isActive ? "bg-white/40 shadow-sm" : "bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/20 cursor-pointer"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-white/10 ${!isActive && "group-hover:bg-white/20"}`}>
                      <t.icon className={`w-4 h-4 transition-colors text-white/70 ${!isActive && "group-hover:text-white"}`} aria-hidden="true" />
                    </div>
                    <p className={`text-sm sm:text-base font-bold transition-colors ${isActive ? "text-white" : "text-white/60 group-hover:text-white"}`}>{t.label}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {!isAuthenticated && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Sign in to sync your fitness data</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">Your workouts, test scores, and check-ins are stored locally. Sign in to sync across devices.</p>
              </div>
            </div>
          </div>
        )}

        {tab === "trends" && (
          <TrendsAndLogTab
            checkinEntries={checkinEntries} workoutEntries={workoutEntries} journalEntries={journalEntries}
            allEntries={entries} moodStats={moodStats} streak={streak}
            addEntry={addEntry} updateEntry={updateEntry} deleteEntry={deleteEntry}
          />
        )}
        {tab === "workouts" && (
          <WorkoutsTab workoutEntries={workoutEntries} addEntry={addEntry} updateEntry={updateEntry} deleteEntry={deleteEntry} weeklyStats={weeklyStats} />
        )}
        {tab === "fitness-test" && (
          <FitnessTestTab fitnessTestEntries={fitnessTestEntries} addEntry={addEntry} deleteEntry={deleteEntry} testConfigs={testConfigs} />
        )}
        {tab === "resources" && <ResourcesTab testConfigs={testConfigs} />}
      </main>

      <Footer />
    </div>
  )
}