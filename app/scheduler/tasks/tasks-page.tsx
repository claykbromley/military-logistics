"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  Plus, Trash2, Pencil, Check, X, GripVertical, Calendar as CalendarIcon,
  ChevronDown, ChevronRight, Circle, CheckCircle2, ListTodo, MoreHorizontal,
  Flag, Search, SlidersHorizontal, Inbox, Star, Clock, AlertCircle,
  Palette, FolderPlus, ArrowUpDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"

/* ═══════════════════════ Types ═══════════════════════ */

type Priority = "none" | "low" | "medium" | "high"

interface TaskList {
  id: string
  user_id: string
  name: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

interface Task {
  id: string
  user_id: string
  list_id: string | null
  title: string
  description: string | null
  is_completed: boolean
  due_date: string | null
  priority: Priority
  sort_order: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

/* ═══════════════════════ Constants ═══════════════════════ */

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  none: { label: "No priority", color: "text-muted-foreground", icon: "" },
  low:  { label: "Low", color: "text-blue-500", icon: "!" },
  medium: { label: "Medium", color: "text-amber-500", icon: "!!" },
  high: { label: "High", color: "text-red-500", icon: "!!!" },
}

const LIST_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
]

/* ═══════════════════════ Calendar sync ═══════════════════════ */

async function syncTaskCalendarEvent(
  userId: string, taskId: string, title: string,
  dueDate: string | null, isCompleted: boolean, color: string,
) {
  const supabase = createClient()
  const tag = `[task:${taskId}]`

  const { data: existing } = await supabase
    .from("calendar_entries").select("id")
    .eq("user_id", userId).eq("source", "task_page")
    .eq("linked_entity_tag", tag).maybeSingle()

  if (!dueDate) {
    // No due date — remove calendar entry if one exists
    if (existing) {
      await supabase.from("calendar_entries").delete().eq("id", existing.id)
    }
    return
  }

  const startTime = new Date(`${dueDate}T00:00:00`).toISOString()
  const endTime = new Date(`${dueDate}T23:59:59`).toISOString()

  const payload = {
    title, color, description: null,
    start_time: startTime, end_time: endTime,
    all_day: true, is_recurring: false, recurrence_interval: 1,
    is_completed: isCompleted, linked_entity_tag: tag,
  }

  if (existing) {
    await supabase.from("calendar_entries").update(payload).eq("id", existing.id)
  } else {
    await supabase.from("calendar_entries").insert({
      user_id: userId, type: "task" as const, source: "task_page", ...payload,
    })
  }
}

async function deleteTaskCalendarEvent(userId: string, taskId: string) {
  const supabase = createClient()
  const tag = `[task:${taskId}]`
  await supabase.from("calendar_entries").delete()
    .eq("user_id", userId).eq("source", "task_page").eq("linked_entity_tag", tag)
}

/* ═══════════════════════ Helpers ═══════════════════════ */

function formatDueDate(d: string): string {
  const date = new Date(d + "T12:00:00")
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)

  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  if (diff === -1) return "Yesterday"
  if (diff > 1 && diff <= 6) return date.toLocaleDateString("en-US", { weekday: "long" })
  if (diff < -1 && diff >= -6) return `${Math.abs(diff)} days ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined })
}

function isDueOverdue(d: string): boolean {
  const date = new Date(d + "T23:59:59")
  return date < new Date()
}

function isDueToday(d: string): boolean {
  const date = new Date(d + "T12:00:00")
  const now = new Date()
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

/* ═══════════════════════ Main Component ═══════════════════════ */

export function MilitaryTasksPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [lists, setLists] = useState<TaskList[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // UI state
  const [selectedListId, setSelectedListId] = useState<string | null>(null) // null = "All Tasks"
  const [showCompleted, setShowCompleted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"manual" | "due_date" | "priority" | "name">("manual")

  // Quick-add
  const [quickAddValue, setQuickAddValue] = useState("")
  const quickAddRef = useRef<HTMLInputElement>(null)

  // Task dialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "", priority: "none" as Priority, list_id: "" })

  // List dialog
  const [listDialogOpen, setListDialogOpen] = useState(false)
  const [editingList, setEditingList] = useState<TaskList | null>(null)
  const [listForm, setListForm] = useState({ name: "", color: LIST_COLORS[0] })

  // Drag state
  const [dragTaskId, setDragTaskId] = useState<string | null>(null)

  // Collapsed lists
  const [collapsedLists, setCollapsedLists] = useState<Set<string>>(new Set())

  /* ── Data loading ── */
  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }
    setUserId(user.id)

    const [{ data: listsData }, { data: tasksData }] = await Promise.all([
      supabase.from("task_lists").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("tasks").select("*").eq("user_id", user.id).order("sort_order"),
    ])

    setLists(listsData || [])
    setTasks((tasksData || []).map((t: any) => ({ ...t, priority: t.priority || "none" })))
    setIsLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Realtime
  useEffect(() => {
    const supabase = createClient()
    const ch = supabase.channel("tasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "task_lists" }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [loadData])

  /* ── List CRUD ── */
  const openNewList = () => {
    setEditingList(null)
    setListForm({ name: "", color: LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)] })
    setListDialogOpen(true)
  }

  const openEditList = (list: TaskList) => {
    setEditingList(list)
    setListForm({ name: list.name, color: list.color })
    setListDialogOpen(true)
  }

  const saveList = async () => {
    if (!userId || !listForm.name.trim()) return
    const supabase = createClient()

    if (editingList) {
      await supabase.from("task_lists").update({
        name: listForm.name.trim(), color: listForm.color,
      }).eq("id", editingList.id)
    } else {
      await supabase.from("task_lists").insert({
        user_id: userId, name: listForm.name.trim(),
        color: listForm.color, sort_order: lists.length,
      })
    }
    setListDialogOpen(false)
    loadData()
  }

  const deleteList = async (id: string) => {
    if (!userId) return
    if (!confirm("Delete this list and all its tasks?")) return
    const supabase = createClient()

    // Delete calendar entries for tasks in this list
    const listTasks = tasks.filter((t) => t.list_id === id)
    for (const t of listTasks) {
      await deleteTaskCalendarEvent(userId, t.id)
    }

    await supabase.from("tasks").delete().eq("list_id", id)
    await supabase.from("task_lists").delete().eq("id", id)
    if (selectedListId === id) setSelectedListId(null)
    loadData()
  }

  /* ── Task CRUD ── */
  const openNewTask = (listId?: string) => {
    setEditingTask(null)
    setTaskForm({ title: "", description: "", due_date: "", priority: "none", list_id: listId || selectedListId || "" })
    setTaskDialogOpen(true)
  }

  const openEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || "",
      due_date: task.due_date || "",
      priority: task.priority,
      list_id: task.list_id || "",
    })
    setTaskDialogOpen(true)
  }

  const saveTask = async () => {
    if (!userId || !taskForm.title.trim()) return
    const supabase = createClient()

    const listColor = lists.find((l) => l.id === taskForm.list_id)?.color || "#3b82f6"

    if (editingTask) {
      await supabase.from("tasks").update({
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || null,
        due_date: taskForm.due_date || null,
        priority: taskForm.priority,
        list_id: taskForm.list_id || null,
      }).eq("id", editingTask.id)

      await syncTaskCalendarEvent(userId, editingTask.id, taskForm.title.trim(), taskForm.due_date || null, editingTask.is_completed, listColor)
    } else {
      const maxOrder = tasks.filter((t) => t.list_id === (taskForm.list_id || null)).reduce((m, t) => Math.max(m, t.sort_order), -1)
      const { data } = await supabase.from("tasks").insert({
        user_id: userId, title: taskForm.title.trim(),
        description: taskForm.description.trim() || null,
        due_date: taskForm.due_date || null, priority: taskForm.priority,
        list_id: taskForm.list_id || null, sort_order: maxOrder + 1,
      }).select("id").single()

      if (data && taskForm.due_date) {
        await syncTaskCalendarEvent(userId, data.id, taskForm.title.trim(), taskForm.due_date, false, listColor)
      }
    }
    setTaskDialogOpen(false)
    loadData()
  }

  const toggleComplete = async (task: Task) => {
    if (!userId) return
    const supabase = createClient()
    const nowCompleted = !task.is_completed

    await supabase.from("tasks").update({
      is_completed: nowCompleted,
      completed_at: nowCompleted ? new Date().toISOString() : null,
    }).eq("id", task.id)

    const listColor = lists.find((l) => l.id === task.list_id)?.color || "#3b82f6"
    await syncTaskCalendarEvent(userId, task.id, task.title, task.due_date, nowCompleted, listColor)
    loadData()
  }

  const deleteTask = async (id: string) => {
    if (!userId) return
    const supabase = createClient()
    await supabase.from("tasks").delete().eq("id", id)
    await deleteTaskCalendarEvent(userId, id)
    loadData()
  }

  const quickAdd = async () => {
    if (!userId || !quickAddValue.trim()) return
    const supabase = createClient()
    const maxOrder = tasks.filter((t) => t.list_id === selectedListId).reduce((m, t) => Math.max(m, t.sort_order), -1)
    await supabase.from("tasks").insert({
      user_id: userId, title: quickAddValue.trim(),
      list_id: selectedListId || null, sort_order: maxOrder + 1, priority: "none",
    })
    setQuickAddValue("")
    quickAddRef.current?.focus()
    loadData()
  }

  /* ── Drag reorder ── */
  const handleDragStart = (taskId: string) => setDragTaskId(taskId)
  const handleDragEnd = () => setDragTaskId(null)

  const handleDrop = async (targetId: string) => {
    if (!dragTaskId || dragTaskId === targetId || !userId) return
    const supabase = createClient()
    const listTasks = filteredTasks.filter((t) => !t.is_completed)
    const fromIdx = listTasks.findIndex((t) => t.id === dragTaskId)
    const toIdx = listTasks.findIndex((t) => t.id === targetId)
    if (fromIdx < 0 || toIdx < 0) return

    const reordered = [...listTasks]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)

    // Optimistic update
    const updatedTasks = tasks.map((t) => {
      const newIdx = reordered.findIndex((r) => r.id === t.id)
      return newIdx >= 0 ? { ...t, sort_order: newIdx } : t
    })
    setTasks(updatedTasks)

    // Persist
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sort_order !== i) {
        await supabase.from("tasks").update({ sort_order: i }).eq("id", reordered[i].id)
      }
    }
    setDragTaskId(null)
  }

  /* ── Filtering & sorting ── */
  const filteredTasks = useMemo(() => {
    let result = tasks

    // Filter by list
    if (selectedListId) {
      result = result.filter((t) => t.list_id === selectedListId)
    }

    // Filter completed
    if (!showCompleted) {
      result = result.filter((t) => !t.is_completed)
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
    }

    // Sort
    const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2, none: 3 }

    result = [...result].sort((a, b) => {
      // Completed always at bottom
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1

      switch (sortBy) {
        case "due_date": {
          if (!a.due_date && !b.due_date) return a.sort_order - b.sort_order
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return a.due_date.localeCompare(b.due_date)
        }
        case "priority":
          return (priorityOrder[a.priority] - priorityOrder[b.priority]) || a.sort_order - b.sort_order
        case "name":
          return a.title.localeCompare(b.title)
        default:
          return a.sort_order - b.sort_order
      }
    })

    return result
  }, [tasks, selectedListId, showCompleted, searchQuery, sortBy])

  const completedCount = tasks.filter((t) => selectedListId ? t.list_id === selectedListId : true).filter((t) => t.is_completed).length
  const totalCount = tasks.filter((t) => selectedListId ? t.list_id === selectedListId : true).length

  const toggleListCollapse = (id: string) => {
    setCollapsedLists((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  /* ── Task counts per list ── */
  const taskCountByList = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = { inbox: { total: 0, completed: 0 } }
    lists.forEach((l) => { counts[l.id] = { total: 0, completed: 0 } })
    tasks.forEach((t) => {
      const key = t.list_id || "inbox"
      if (!counts[key]) counts[key] = { total: 0, completed: 0 }
      counts[key].total++
      if (t.is_completed) counts[key].completed++
    })
    return counts
  }, [tasks, lists])

  /* ═══════════════════════ Render ═══════════════════════ */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading tasks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
    <div className="flex h-[calc(100vh-140px)] gap-0 bg-background rounded-2xl border border-border overflow-hidden shadow-sm">

      {/* ─── Sidebar ─── */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-muted/20 flex flex-col">
        {/* Sidebar header */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground text-lg">Tasks</h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-background"
            />
          </div>
        </div>

        {/* Smart filters */}
        <div className="px-3 space-y-0.5">
          <button
            onClick={() => setSelectedListId(null)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              !selectedListId ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
            )}
          >
            <Inbox className="w-4 h-4" />
            <span className="flex-1 text-left">All Tasks</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {tasks.filter((t) => !t.is_completed).length}
            </span>
          </button>
        </div>

        {/* Lists */}
        <div className="px-3 mt-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lists</span>
            <button onClick={openNewList} className="p-0.5 hover:bg-muted rounded transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-0.5">
            {/* Inbox (unassigned tasks) */}
            <button
              onClick={() => setSelectedListId("inbox")}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedListId === "inbox" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              )}
            >
              <div className="w-3 h-3 rounded-full bg-slate-400 flex-shrink-0" />
              <span className="flex-1 text-left truncate">Inbox</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {taskCountByList["inbox"]?.total - (taskCountByList["inbox"]?.completed || 0)}
              </span>
            </button>

            {lists.map((list) => {
              const counts = taskCountByList[list.id] || { total: 0, completed: 0 }
              return (
                <div key={list.id} className="group/list">
                  <button
                    onClick={() => setSelectedListId(list.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      selectedListId === list.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />
                    <span className="flex-1 text-left truncate">{list.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {counts.total - counts.completed}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <span className="p-0.5 opacity-0 group-hover/list:opacity-100 hover:bg-background rounded transition-all cursor-pointer">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => openEditList(list)} className="cursor-pointer">
                          <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteList(list.id)} className="text-destructive cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-border">
          <button
            onClick={openNewList}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            New List
          </button>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {selectedListId && selectedListId !== "inbox" && (
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: lists.find((l) => l.id === selectedListId)?.color }}
              />
            )}
            <h1 className="text-xl font-bold text-foreground">
              {!selectedListId ? "All Tasks" : selectedListId === "inbox" ? "Inbox" : lists.find((l) => l.id === selectedListId)?.name || "Tasks"}
            </h1>
            <Badge variant="secondary" className="text-xs tabular-nums">
              {filteredTasks.filter((t) => !t.is_completed).length} active
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs cursor-pointer">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[
                  { value: "manual", label: "Manual" },
                  { value: "due_date", label: "Due date" },
                  { value: "priority", label: "Priority" },
                  { value: "name", label: "Name" },
                ].map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() => setSortBy(s.value as typeof sortBy)}
                    className={cn("cursor-pointer", sortBy === s.value && "font-semibold")}
                  >
                    {sortBy === s.value && <Check className="w-3 h-3 mr-2" />}
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Show completed toggle */}
            <Button
              variant={showCompleted ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5 text-xs cursor-pointer"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedCount} done
            </Button>

            {/* Add task */}
            <Button size="sm" onClick={() => openNewTask()} className="gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Quick add */}
        <div className="px-6 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              ref={quickAddRef}
              type="text"
              placeholder="Add a task..."
              value={quickAddValue}
              onChange={(e) => setQuickAddValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") quickAdd() }}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {quickAddValue && (
              <Button size="sm" variant="ghost" onClick={quickAdd} className="h-7 text-xs cursor-pointer">
                Add
              </Button>
            )}
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery ? "No matching tasks" : showCompleted ? "No tasks yet" : "All caught up!"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {searchQuery ? "Try a different search" : "Add a task to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 py-1">
              {filteredTasks.map((task) => {
                const listColor = lists.find((l) => l.id === task.list_id)?.color || "#94a3b8"
                const listName = lists.find((l) => l.id === task.list_id)?.name
                const overdue = task.due_date && !task.is_completed && isDueOverdue(task.due_date)
                const dueToday = task.due_date && !task.is_completed && isDueToday(task.due_date)

                return (
                  <div
                    key={task.id}
                    draggable={sortBy === "manual" && !task.is_completed}
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(task.id)}
                    className={cn(
                      "group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all",
                      "hover:bg-muted/50",
                      dragTaskId === task.id && "opacity-40",
                      task.is_completed && "opacity-50"
                    )}
                  >
                    {/* Drag handle */}
                    {sortBy === "manual" && !task.is_completed && (
                      <div className="mt-0.5 opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing transition-opacity">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}

                    {/* Checkbox */}
                    <button
                      onClick={() => toggleComplete(task)}
                      className={cn(
                        "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer",
                        task.is_completed
                          ? "border-muted-foreground/40 bg-muted-foreground/20"
                          : task.priority === "high"
                            ? "border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                            : task.priority === "medium"
                              ? "border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                              : task.priority === "low"
                                ? "border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                : "border-border hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      {task.is_completed && <Check className="w-3 h-3 text-muted-foreground" strokeWidth={3} />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditTask(task)}>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium truncate",
                          task.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                        )}>
                          {task.title}
                        </span>
                        {task.priority !== "none" && !task.is_completed && (
                          <Flag className={cn("w-3 h-3 flex-shrink-0", PRIORITY_CONFIG[task.priority].color)} />
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {task.due_date && !task.is_completed && (
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs font-medium",
                            overdue ? "text-red-500" : dueToday ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                          )}>
                            <CalendarIcon className="w-3 h-3" />
                            {formatDueDate(task.due_date)}
                          </span>
                        )}
                        {!selectedListId && listName && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: listColor }} />
                            {listName}
                          </span>
                        )}
                        {task.description && (
                          <span className="text-xs text-muted-foreground/60 truncate max-w-[200px]">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditTask(task)} className="p-1 hover:bg-muted rounded transition-colors cursor-pointer">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-destructive/10 rounded transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="px-6 py-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>{totalCount} total &middot; {completedCount} completed</span>
          {completedCount > 0 && (
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          )}
        </div>
      </main>

      {/* ─── Task Dialog ─── */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Title</Label>
              <Input
                placeholder="What needs to be done?"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter" && taskForm.title.trim()) saveTask() }}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                placeholder="Add details..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Due Date</Label>
                <Input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as Priority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="low"><span className="flex items-center gap-2"><Flag className="w-3 h-3 text-blue-500" /> Low</span></SelectItem>
                    <SelectItem value="medium"><span className="flex items-center gap-2"><Flag className="w-3 h-3 text-amber-500" /> Medium</span></SelectItem>
                    <SelectItem value="high"><span className="flex items-center gap-2"><Flag className="w-3 h-3 text-red-500" /> High</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">List</Label>
              <Select value={taskForm.list_id || "none"} onValueChange={(v) => setTaskForm({ ...taskForm, list_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Inbox</SelectItem>
                  {lists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      <span className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                        {l.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={saveTask} disabled={!taskForm.title.trim()} className="cursor-pointer">
              {editingTask ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── List Dialog ─── */}
      <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingList ? "Edit List" : "New List"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Name</Label>
              <Input
                placeholder="List name"
                value={listForm.name}
                onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter" && listForm.name.trim()) saveList() }}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {LIST_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setListForm({ ...listForm, color: c })}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all cursor-pointer",
                      listForm.color === c ? "ring-2 ring-offset-2 ring-offset-background" : "hover:scale-110"
                    )}
                    style={{ backgroundColor: c, ["--tw-ring-color" as any]: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setListDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={saveList} disabled={!listForm.name.trim()} className="cursor-pointer">
              {editingList ? "Save" : "Create List"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  )
}