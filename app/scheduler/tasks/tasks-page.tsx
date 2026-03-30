"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  Plus, Trash2, Pencil, Check, X, GripVertical, Calendar as CalendarIcon,
  CheckCircle2, ListTodo, MoreHorizontal,
  Flag, Search,
  FolderPlus, ArrowUpDown
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
}

interface TaskEntry {
  id: string
  user_id: string
  type: string
  title: string
  description: string | null
  color: string
  start_time: string
  end_time: string | null
  all_day: boolean
  is_completed: boolean
  source: string | null
  task_list_id: string | null
  task_priority: string
  task_sort_order: number
  created_at: string
  updated_at: string
}

/* ═══════════════════════ Constants ═══════════════════════ */

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  none:   { label: "No priority", color: "text-muted-foreground" },
  low:    { label: "Low",         color: "text-blue-500" },
  medium: { label: "Medium",      color: "text-amber-500" },
  high:   { label: "High",        color: "text-red-500" },
}

const LIST_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
]

const CALENDAR_LIST_ID = "__calendar__"

/* ═══════════════════════ Helpers ═══════════════════════ */

function extractDueDate(entry: TaskEntry): string | null {
  if (!entry.start_time) return null
  try {
    const d = new Date(entry.start_time)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  } catch { return null }
}

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

function isDueOverdue(d: string): boolean { return new Date(d + "T23:59:59") < new Date() }
function isDueToday(d: string): boolean {
  const date = new Date(d + "T12:00:00"); const now = new Date()
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

/* ═══════════════════════ Main Component ═══════════════════════ */

export function MilitaryTasksPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [lists, setLists] = useState<TaskList[]>([])
  const [tasks, setTasks] = useState<TaskEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"manual" | "due_date" | "priority" | "name">("manual")
  const [quickAddValue, setQuickAddValue] = useState("")
  const quickAddRef = useRef<HTMLInputElement>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskEntry | null>(null)
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "", priority: "none" as Priority, list_id: "", color: "#3b82f6" })
  const [listDialogOpen, setListDialogOpen] = useState(false)
  const [editingList, setEditingList] = useState<TaskList | null>(null)
  const [listForm, setListForm] = useState({ name: "", color: LIST_COLORS[0] })
  const [dragTaskId, setDragTaskId] = useState<string | null>(null)

  /* ── Data ── */
  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }
    setUserId(user.id)
    const [{ data: l }, { data: t }] = await Promise.all([
      supabase.from("task_lists").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("calendar_entries").select("*").eq("user_id", user.id).eq("type", "task").order("task_sort_order"),
    ])
    setLists(l || [])
    setTasks((t || []) as TaskEntry[])
    setIsLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const supabase = createClient()
    const ch = supabase.channel("tasks-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "calendar_entries" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "task_lists" }, () => loadData())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [loadData])

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((ev) => {
      if (ev === "SIGNED_IN" || ev === "SIGNED_OUT") loadData()
    })
    return () => subscription.unsubscribe()
  }, [loadData])

  /* ── List CRUD ── */
  const openNewList = () => { setEditingList(null); setListForm({ name: "", color: LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)] }); setListDialogOpen(true) }
  const openEditList = (list: TaskList) => { setEditingList(list); setListForm({ name: list.name, color: list.color }); setListDialogOpen(true) }

  const saveList = async () => {
    if (!userId || !listForm.name.trim()) return
    const supabase = createClient()
    if (editingList) {
      await supabase.from("task_lists").update({ name: listForm.name.trim(), color: listForm.color }).eq("id", editingList.id)
    } else {
      await supabase.from("task_lists").insert({ user_id: userId, name: listForm.name.trim(), color: listForm.color, sort_order: lists.length })
    }
    setListDialogOpen(false); loadData()
  }

  const deleteList = async (id: string) => {
    if (!userId || !confirm("Delete this list? Tasks will be moved to Default.")) return
    const supabase = createClient()
    await supabase.from("calendar_entries").update({ task_list_id: null }).eq("task_list_id", id)
    await supabase.from("task_lists").delete().eq("id", id)
    if (selectedListId === id) setSelectedListId(null)
    loadData()
  }

  /* ── Task CRUD (all writes go to calendar_entries) ── */
  const openNewTask = (listId?: string) => {
    setEditingTask(null)
    const resolved = listId || (selectedListId && selectedListId !== CALENDAR_LIST_ID && selectedListId !== "default" ? selectedListId : "")
    setTaskForm({ title: "", description: "", due_date: "", priority: "none", list_id: resolved, color: lists.find((l) => l.id === resolved)?.color || "#3b82f6" })
    setTaskDialogOpen(true)
  }

  const openEditTask = (task: TaskEntry) => {
    setEditingTask(task)
    setTaskForm({ title: task.title, description: task.description || "", due_date: extractDueDate(task) || "", priority: (task.task_priority || "none") as Priority, list_id: task.task_list_id || "", color: task.color })
    setTaskDialogOpen(true)
  }

  const saveTask = async () => {
    if (!userId || !taskForm.title.trim()) return
    const supabase = createClient()
    const listColor = lists.find((l) => l.id === taskForm.list_id)?.color || taskForm.color || "#3b82f6"
    const startTime = taskForm.due_date ? new Date(`${taskForm.due_date}T00:00:00`).toISOString() : new Date().toISOString()
    const endTime = taskForm.due_date ? new Date(`${taskForm.due_date}T23:59:59`).toISOString() : null

    if (editingTask) {
      await supabase.from("calendar_entries").update({
        title: taskForm.title.trim(), description: taskForm.description.trim() || null,
        color: listColor, start_time: startTime, end_time: endTime,
        all_day: !!taskForm.due_date, task_list_id: taskForm.list_id || null, task_priority: taskForm.priority,
      }).eq("id", editingTask.id)
    } else {
      const maxOrder = tasks.filter((t) => t.task_list_id === (taskForm.list_id || null)).reduce((m, t) => Math.max(m, t.task_sort_order), -1)
      await supabase.from("calendar_entries").insert({
        user_id: userId, type: "task", title: taskForm.title.trim(),
        description: taskForm.description.trim() || null, color: listColor,
        start_time: startTime, end_time: endTime, all_day: !!taskForm.due_date,
        is_recurring: false, recurrence_interval: 1, is_completed: false,
        source: "task_page", task_list_id: taskForm.list_id || null,
        task_priority: taskForm.priority, task_sort_order: maxOrder + 1,
      })
    }
    setTaskDialogOpen(false); loadData()
  }

  const toggleComplete = async (task: TaskEntry) => {
    const supabase = createClient()
    await supabase.from("calendar_entries").update({ is_completed: !task.is_completed }).eq("id", task.id)
    loadData()
  }

  const deleteTask = async (id: string) => {
    const supabase = createClient()
    await supabase.from("calendar_entries").delete().eq("id", id)
    loadData()
  }

  const quickAdd = async () => {
    if (!userId || !quickAddValue.trim()) return
    const supabase = createClient()
    const resolved = selectedListId && selectedListId !== CALENDAR_LIST_ID && selectedListId !== "default" ? selectedListId : null
    const listColor = lists.find((l) => l.id === resolved)?.color || "#3b82f6"
    const maxOrder = tasks.filter((t) => t.task_list_id === resolved).reduce((m, t) => Math.max(m, t.task_sort_order), -1)
    await supabase.from("calendar_entries").insert({
      user_id: userId, type: "task", title: quickAddValue.trim(), color: listColor,
      start_time: new Date().toISOString(), all_day: false,
      is_recurring: false, recurrence_interval: 1, is_completed: false,
      source: "task_page", task_list_id: resolved, task_priority: "none", task_sort_order: maxOrder + 1,
    })
    setQuickAddValue(""); quickAddRef.current?.focus(); loadData()
  }

  /* ── Drag reorder ── */
  const handleDrop = async (targetId: string) => {
    if (!dragTaskId || dragTaskId === targetId || !userId) return
    const supabase = createClient()
    const active = filteredTasks.filter((t) => !t.is_completed)
    const fromIdx = active.findIndex((t) => t.id === dragTaskId)
    const toIdx = active.findIndex((t) => t.id === targetId)
    if (fromIdx < 0 || toIdx < 0) return
    const reordered = [...active]; const [moved] = reordered.splice(fromIdx, 1); reordered.splice(toIdx, 0, moved)
    setTasks((prev) => prev.map((t) => { const i = reordered.findIndex((r) => r.id === t.id); return i >= 0 ? { ...t, task_sort_order: i } : t }))
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].task_sort_order !== i) await supabase.from("calendar_entries").update({ task_sort_order: i }).eq("id", reordered[i].id)
    }
    setDragTaskId(null)
  }

  /* ── Filtering ── */
  const filteredTasks = useMemo(() => {
    let r = [...tasks]
    if (selectedListId === CALENDAR_LIST_ID) r = r.filter((t) => !t.task_list_id && t.source !== "task_page")
    else if (selectedListId === "default") r = r.filter((t) => !t.task_list_id && t.source === "task_page")
    else if (selectedListId) r = r.filter((t) => t.task_list_id === selectedListId)
    if (!showCompleted) r = r.filter((t) => !t.is_completed)
    if (searchQuery) { const q = searchQuery.toLowerCase(); r = r.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) }
    const po: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }
    r.sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1
      switch (sortBy) {
        case "due_date": { const ad = extractDueDate(a), bd = extractDueDate(b); if (!ad && !bd) return a.task_sort_order - b.task_sort_order; if (!ad) return 1; if (!bd) return -1; return ad.localeCompare(bd) }
        case "priority": return ((po[a.task_priority] ?? 3) - (po[b.task_priority] ?? 3)) || a.task_sort_order - b.task_sort_order
        case "name": return a.title.localeCompare(b.title)
        default: return a.task_sort_order - b.task_sort_order
      }
    })
    return r
  }, [tasks, selectedListId, showCompleted, searchQuery, sortBy])

  const scopedTasks = useMemo(() => {
    if (!selectedListId) return tasks
    if (selectedListId === CALENDAR_LIST_ID) return tasks.filter((t) => !t.task_list_id && t.source !== "task_page")
    if (selectedListId === "default") return tasks.filter((t) => !t.task_list_id && t.source === "task_page")
    return tasks.filter((t) => t.task_list_id === selectedListId)
  }, [tasks, selectedListId])
  const completedCount = scopedTasks.filter((t) => t.is_completed).length
  const totalCount = scopedTasks.length

  const taskCountByList = useMemo(() => {
    const c: Record<string, { total: number; active: number }> = { default: { total: 0, active: 0 }, [CALENDAR_LIST_ID]: { total: 0, active: 0 } }
    lists.forEach((l) => { c[l.id] = { total: 0, active: 0 } })
    tasks.forEach((t) => {
      const key = t.task_list_id ? t.task_list_id : t.source !== "task_page" ? CALENDAR_LIST_ID : "default"
      if (!c[key]) c[key] = { total: 0, active: 0 }
      c[key].total++; if (!t.is_completed) c[key].active++
    })
    return c
  }, [tasks, lists])

  const selectedListName = !selectedListId ? "All Tasks" : selectedListId === CALENDAR_LIST_ID ? "Calendar Tasks" : selectedListId === "default" ? "Default" : lists.find((l) => l.id === selectedListId)?.name || "Tasks"
  const selectedListColor = selectedListId && selectedListId !== CALENDAR_LIST_ID && selectedListId !== "default" ? lists.find((l) => l.id === selectedListId)?.color : undefined

  /* ═══════════════════════ Render ═══════════════════════ */

  if (isLoading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading tasks...</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
    <div className="flex h-[calc(100vh-140px)] gap-0 bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* ─── Sidebar ─── */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-muted/20 flex flex-col">
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground text-lg">Tasks</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm bg-background" />
          </div>
        </div>

        <div className="px-3 space-y-0.5">
          <SidebarItem label="All Tasks" icon={<ListTodo className="w-4 h-4" />} count={tasks.filter((t) => !t.is_completed).length} active={!selectedListId} onClick={() => setSelectedListId(null)} />
        </div>

        <div className="px-3 mt-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lists</span>
            <button onClick={openNewList} className="p-0.5 hover:bg-muted rounded transition-colors cursor-pointer"><Plus className="w-3.5 h-3.5 text-muted-foreground" /></button>
          </div>
          <div className="space-y-0.5">
            <SidebarItem label="Default" dotColor="#94a3b8" count={taskCountByList["default"]?.active ?? 0} active={selectedListId === "default"} onClick={() => setSelectedListId("default")} />
            {(taskCountByList[CALENDAR_LIST_ID]?.total ?? 0) > 0 && (
              <SidebarItem label="Calendar Tasks" icon={<CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />} count={taskCountByList[CALENDAR_LIST_ID]?.active ?? 0} active={selectedListId === CALENDAR_LIST_ID} onClick={() => setSelectedListId(CALENDAR_LIST_ID)} />
            )}
            {lists.map((list) => {
              const counts = taskCountByList[list.id] || { total: 0, active: 0 }
              return (
                <div key={list.id} className="group/list">
                  <button onClick={() => setSelectedListId(list.id)} className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors", selectedListId === list.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />
                    <span className="flex-1 text-left truncate">{list.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{counts.active}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <span className="p-0.5 opacity-0 group-hover/list:opacity-100 hover:bg-background rounded transition-all cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => openEditList(list)} className="cursor-pointer"><Pencil className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteList(list.id)} className="text-destructive cursor-pointer"><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        <div className="p-3 border-t border-border">
          <button onClick={openNewList} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"><FolderPlus className="w-4 h-4" /> New List</button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {selectedListColor && <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: selectedListColor }} />}
            <h1 className="text-xl font-bold text-foreground">{selectedListName}</h1>
            <Badge variant="secondary" className="text-xs tabular-nums">{filteredTasks.filter((t) => !t.is_completed).length} active</Badge>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="gap-1.5 text-xs cursor-pointer"><ArrowUpDown className="w-3.5 h-3.5" /> Sort</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["manual", "due_date", "priority", "name"] as const).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setSortBy(s)} className={cn("cursor-pointer", sortBy === s && "font-semibold")}>
                    {sortBy === s && <Check className="w-3 h-3 mr-2" />}
                    {{ manual: "Manual", due_date: "Due date", priority: "Priority", name: "Name" }[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant={showCompleted ? "secondary" : "ghost"} size="sm" className="gap-1.5 text-xs cursor-pointer" onClick={() => setShowCompleted(!showCompleted)}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {completedCount} done
            </Button>
            {selectedListId !== CALENDAR_LIST_ID && (
              <Button size="sm" onClick={() => openNewTask()} className="gap-1.5 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Task</Button>
            )}
          </div>
        </div>

        {selectedListId !== CALENDAR_LIST_ID && (
          <div className="px-6 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-muted-foreground" />
              <input ref={quickAddRef} type="text" placeholder="Add a task..." value={quickAddValue} onChange={(e) => setQuickAddValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") quickAdd() }} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
              {quickAddValue && <Button size="sm" variant="ghost" onClick={quickAdd} className="h-7 text-xs cursor-pointer">Add</Button>}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8 text-muted-foreground/40" /></div>
              <p className="text-sm font-medium text-muted-foreground">{searchQuery ? "No matching tasks" : showCompleted ? "No tasks yet" : "All caught up!"}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{searchQuery ? "Try a different search" : "Add a task to get started"}</p>
            </div>
          ) : (
            <div className="space-y-0.5 py-1">
              {filteredTasks.map((task) => {
                const listColor = lists.find((l) => l.id === task.task_list_id)?.color || task.color || "#94a3b8"
                const listName = lists.find((l) => l.id === task.task_list_id)?.name
                const dueDate = extractDueDate(task)
                const hasDue = dueDate && task.all_day
                const overdue = hasDue && !task.is_completed && isDueOverdue(dueDate!)
                const dueToday = hasDue && !task.is_completed && isDueToday(dueDate!)
                const priority = (task.task_priority || "none") as Priority

                return (
                  <div key={task.id} draggable={sortBy === "manual" && !task.is_completed} onDragStart={() => setDragTaskId(task.id)} onDragEnd={() => setDragTaskId(null)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(task.id)}
                    className={cn("group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-muted/50", dragTaskId === task.id && "opacity-40", task.is_completed && "opacity-50")}>
                    {sortBy === "manual" && !task.is_completed && (
                      <div className="mt-0.5 opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing transition-opacity"><GripVertical className="w-4 h-4 text-muted-foreground" /></div>
                    )}
                    <button onClick={() => toggleComplete(task)}
                      className={cn("mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer",
                        task.is_completed ? "border-muted-foreground/40 bg-muted-foreground/20"
                        : priority === "high" ? "border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        : priority === "medium" ? "border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        : priority === "low" ? "border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        : "border-border hover:border-primary/50 hover:bg-primary/5")}>
                      {task.is_completed && <Check className="w-3 h-3 text-muted-foreground" strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditTask(task)}>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium truncate", task.is_completed ? "line-through text-muted-foreground" : "text-foreground")}>{task.title}</span>
                        {priority !== "none" && !task.is_completed && <Flag className={cn("w-3 h-3 flex-shrink-0", PRIORITY_CONFIG[priority].color)} />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {hasDue && !task.is_completed && (
                          <span className={cn("inline-flex items-center gap-1 text-xs font-medium", overdue ? "text-red-500" : dueToday ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                            <CalendarIcon className="w-3 h-3" /> {formatDueDate(dueDate!)}
                          </span>
                        )}
                        {!selectedListId && listName && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: listColor }} /> {listName}</span>}
                        {!selectedListId && !task.task_list_id && task.source !== "task_page" && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarIcon className="w-2.5 h-2.5" /> Calendar</span>}
                        {task.description && <span className="text-xs text-muted-foreground/60 truncate max-w-[200px]">{task.description}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditTask(task)} className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-destructive/10 rounded transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-destructive/70" /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>{totalCount} total &middot; {completedCount} completed</span>
          {completedCount > 0 && <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary/60 rounded-full transition-all duration-500" style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }} /></div>}
        </div>
      </main>

      {/* ─── Task Dialog ─── */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Title</Label>
              <Input placeholder="What needs to be done?" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter" && taskForm.title.trim()) saveTask() }} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <Textarea placeholder="Add details..." value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Due Date</Label>
                <Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
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
                  <SelectItem value="none">Default</SelectItem>
                  {lists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} /> {l.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={saveTask} disabled={!taskForm.title.trim()} className="cursor-pointer">{editingTask ? "Save Changes" : "Add Task"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── List Dialog ─── */}
      <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editingList ? "Edit List" : "New List"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Name</Label>
              <Input placeholder="List name" value={listForm.name} onChange={(e) => setListForm({ ...listForm, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter" && listForm.name.trim()) saveList() }} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {LIST_COLORS.map((c) => (
                  <button key={c} onClick={() => setListForm({ ...listForm, color: c })} className={cn("w-8 h-8 rounded-full transition-all cursor-pointer", listForm.color === c ? "ring-2 ring-offset-2 ring-offset-background" : "hover:scale-110")} style={{ backgroundColor: c, ["--tw-ring-color" as any]: c }} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setListDialogOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={saveList} disabled={!listForm.name.trim()} className="cursor-pointer">{editingList ? "Save" : "Create List"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  )
}

/* ═══════════════════════ Sidebar Item ═══════════════════════ */

function SidebarItem({ label, icon, dotColor, count, active, onClick }: {
  label: string; icon?: React.ReactNode; dotColor?: string; count: number; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors", active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}>
      {dotColor ? <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} /> : icon}
      <span className="flex-1 text-left truncate">{label}</span>
      <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
    </button>
  )
}