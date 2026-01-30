"use client"

import React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Heart,
  Plus,
  ArrowLeft,
  BookOpen,
  Smile,
  Meh,
  Frown,
  ChevronDown,
  Trash2,
  Edit,
  Calendar,
  Flame,
  Lock,
  Unlock,
  Phone,
  ExternalLink,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useWellness, type JournalEntry, type Mood } from "@/hooks/use-wellness"

const moods: { value: Mood; label: string; icon: React.ReactNode; color: string; bgColor: string }[] = [
  { value: "great", label: "Great", icon: <Smile className="w-5 h-5" />, color: "text-green-600", bgColor: "bg-green-100" },
  { value: "good", label: "Good", icon: <Smile className="w-5 h-5" />, color: "text-teal-600", bgColor: "bg-teal-100" },
  { value: "neutral", label: "Neutral", icon: <Meh className="w-5 h-5" />, color: "text-amber-600", bgColor: "bg-amber-100" },
  { value: "struggling", label: "Struggling", icon: <Frown className="w-5 h-5" />, color: "text-orange-600", bgColor: "bg-orange-100" },
  { value: "difficult", label: "Difficult", icon: <Frown className="w-5 h-5" />, color: "text-red-600", bgColor: "bg-red-100" },
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
]

function getMoodInfo(mood: Mood) {
  return moods.find((m) => m.value === mood) || moods[2]
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function JournalEntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const moodInfo = entry.mood ? getMoodInfo(entry.mood) : null

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">
              {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
            </span>
            {entry.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
            {moodInfo && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${moodInfo.bgColor} ${moodInfo.color}`}
              >
                {moodInfo.icon}
                {moodInfo.label}
              </span>
            )}
          </div>
          {entry.title && <h3 className="font-medium text-foreground mb-1">{entry.title}</h3>}
          <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
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

  const handleSave = () => {
    if (!content.trim()) return
    onSave({
      title: title.trim() || undefined,
      content: content.trim(),
      mood,
      isPrivate,
    })
    setTitle("")
    setContent("")
    setMood(undefined)
    setIsPrivate(true)
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
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Reflecting on today..."
            />
          </div>

          <div className="space-y-2">
            <Label>How are you feeling?</Label>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(mood === m.value ? undefined : m.value)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    mood === m.value
                      ? `${m.bgColor} ${m.color} font-medium`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your thoughts</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your day, your feelings, things you're grateful for..."
              rows={6}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isPrivate ? "Private entry" : "Public entry"}
            </button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim()}>
            {editingEntry ? "Save Changes" : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MoodChart({ stats }: { stats: { total: number; counts: Record<Mood, number> } }) {
  const maxCount = Math.max(...Object.values(stats.counts), 1)

  return (
    <div className="space-y-2">
      {moods.map((m) => {
        const count = stats.counts[m.value]
        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
        return (
          <div key={m.value} className="flex items-center gap-3">
            <div className={`w-6 ${m.color}`}>{m.icon}</div>
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.bgColor} transition-all`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-8 text-sm text-muted-foreground text-right">{count}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function WellnessPage() {
  const {
    entries,
    isLoaded,
    addEntry,
    updateEntry,
    deleteEntry,
    getMoodStats,
    getStreak,
  } = useWellness()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [promptForEntry, setPromptForEntry] = useState<string | undefined>()

  const moodStats = getMoodStats()
  const streak = getStreak()

  const randomPrompt = useMemo(() => {
    return gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)]
  }, [])

  const handleSaveEntry = (entryData: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">) => {
    if (editingEntry) {
      updateEntry(editingEntry.id, entryData)
      setEditingEntry(null)
    } else {
      addEntry(entryData)
    }
    setPromptForEntry(undefined)
  }

  const openWithPrompt = (prompt: string) => {
    setPromptForEntry(prompt)
    setIsDialogOpen(true)
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
                <h1 className="text-xl font-bold text-foreground">Wellness & Journal</h1>
                <p className="text-sm text-muted-foreground">
                  Track your mood and reflect on your deployment journey
                </p>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gratitude Prompt */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Today's Reflection Prompt</h3>
              <p className="text-muted-foreground mb-3">{randomPrompt}</p>
              <Button variant="outline" size="sm" onClick={() => openWithPrompt(randomPrompt)} className="bg-transparent">
                <BookOpen className="w-4 h-4 mr-2" />
                Write about this
              </Button>
            </div>

            {/* Journal Entries */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Journal Entries</h2>
              {entries.length > 0 ? (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <JournalEntryCard
                      key={entry.id}
                      entry={entry}
                      onEdit={() => {
                        setEditingEntry(entry)
                        setIsDialogOpen(true)
                      }}
                      onDelete={() => deleteEntry(entry.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card border rounded-lg">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No entries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start journaling to track your thoughts and feelings during deployment.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Write Your First Entry
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{entries.length}</div>
                  <div className="text-xs text-muted-foreground">Total Entries</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                    <span className="text-2xl font-bold text-foreground">{streak}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>

              {moodStats.total > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Mood (Last 30 Days)
                  </h4>
                  <MoodChart stats={moodStats} />
                </div>
              )}
            </div>

            {/* Resources */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-4">Support Resources</h3>
              <div className="space-y-3">
                <a
                  href="tel:988"
                  className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 hover:bg-destructive/15 transition-colors"
                >
                  <Phone className="w-5 h-5 text-destructive" />
                  <div>
                    <div className="font-medium text-foreground">Veterans Crisis Line</div>
                    <div className="text-sm text-muted-foreground">Dial 988, Press 1</div>
                  </div>
                </a>

                <a
                  href="https://www.militaryonesource.mil/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Military OneSource</div>
                    <div className="text-sm text-muted-foreground">24/7 Support</div>
                  </div>
                </a>

                <a
                  href="https://www.realwarriors.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Real Warriors</div>
                    <div className="text-sm text-muted-foreground">Mental Health Resources</div>
                  </div>
                </a>

                <a
                  href="https://www.talkspace.com/military/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Talkspace for Military</div>
                    <div className="text-sm text-muted-foreground">Online Therapy</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-3">Quick Prompts</h3>
              <div className="space-y-2">
                {gratitudePrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => openWithPrompt(prompt)}
                    className="w-full text-left text-sm p-2 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog */}
      <AddEntryDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingEntry(null)
            setPromptForEntry(undefined)
          }
        }}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
        initialPrompt={promptForEntry}
      />
    </div>
  )
}
