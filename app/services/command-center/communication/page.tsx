"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Calendar, CalendarPlus, MessageCircle, NotebookText, AlertCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CommunicationLog } from "@/lib/types"
import { useCommunicationHub, CommunicationHubProvider } from "@/hooks/use-communication-hub"
import { ConnectionsProvider } from "@/hooks/use-connections"
import { MessagesTab } from "@/components/command-center/messages-tab"
import { ScheduleTab } from "@/components/command-center/schedule-tab"
import { LogTab, AddCommunicationDialog } from "@/components/command-center/log-tab"
import { createClient } from "@/lib/supabase/client"

import { EntryModalProvider, useEntryModal } from "@/components/calendar/use-entry-modal"
import { ConnectedEntryModal } from "@/components/calendar/entry-modal"
import { ConnectedEntryDetailPopover } from "@/components/calendar/entry-detail-popover"

export default function CommunicationHubPage() {
  return (
    <ConnectionsProvider>
      <CommunicationHubProvider>
        <CommunicationHubPageContent />
      </CommunicationHubProvider>
    </ConnectionsProvider>
  )
}

function CommunicationHubPageContent() {
  const {
    contacts,
    communicationLog,
    messageThreads,
    isLoaded,
    isSyncing,
    syncError,
    addCommunication,
    updateCommunication,
  } = useCommunicationHub()

  const [userId, setUserId] = useState<string | null>(null)
  const [totalMeetings, setTotalMeetings] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const fetchMeetingCount = useCallback(async () => {
    if (!userId) return
    const supabase = createClient()
    const now = new Date()
    const thirtyDaysOut = new Date(now.getTime() + 30 * 86400000)

    const { data, error } = await supabase
      .from("calendar_entries")
      .select("id, start_time, is_completed, is_recurring, recurrence_end, recurrence_count, source")
      .eq("user_id", userId)
      .eq("source", "meeting")
      .eq("is_completed", false)

    if (error || !data) {
      setTotalMeetings(0)
      return
    }

    const count = data.filter((e) => {
      const start = new Date(e.start_time)
      const recEnd = e.recurrence_end && e.recurrence_end.trim() ? e.recurrence_end : null

      if (e.is_recurring) {
        const hasMore = !recEnd || new Date(recEnd) > now
        if (!hasMore) return false
        if (start > now) return start < thirtyDaysOut
        return true
      }

      return start > now && start < thirtyDaysOut
    }).length

    setTotalMeetings(count)
  }, [userId])

  useEffect(() => {
    fetchMeetingCount()
  }, [fetchMeetingCount])

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel("comm-hub-meeting-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_entries",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchMeetingCount()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchMeetingCount])

  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<CommunicationLog | null>(null)
  const [activeTab, setActiveTab] = useState("schedule")

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: c.contactName,
    email: c.email || "",
  }))

  const unreadCount = useMemo(() => {
    return messageThreads
      .filter(t => !t.isArchived)
      .reduce((sum, t) => sum + (t.unreadCount || 0), 0)
  }, [messageThreads])

  const unreadThreadCount = useMemo(() => {
    return messageThreads.filter(t => !t.isArchived && t.unreadCount > 0).length
  }, [messageThreads])

  const totalEvents = totalMeetings
  const totalLogs = communicationLog.length

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
    <EntryModalProvider userId={userId} defaultEntryOverrides={{ source: "meeting" }} forceEntryType="meeting">
      <CommunicationHubPageInner
        contactOptions={contactOptions}
        unreadCount={unreadCount}
        unreadThreadCount={unreadThreadCount}
        totalEvents={totalEvents}
        totalLogs={totalLogs}
        messageThreads={messageThreads}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLogDialogOpen={isLogDialogOpen}
        setIsLogDialogOpen={setIsLogDialogOpen}
        editingLog={editingLog}
        setEditingLog={setEditingLog}
        addCommunication={addCommunication}
        updateCommunication={updateCommunication}
        isSyncing={isSyncing}
        syncError={syncError}
      />
    </EntryModalProvider>
  )
}

// ── Inner component (has access to useEntryModal) ─────────

interface CommunicationHubPageInnerProps {
  contactOptions: { id: string; name: string; email: string }[]
  unreadCount: number
  unreadThreadCount: number
  totalEvents: number
  totalLogs: number
  messageThreads: any[]
  activeTab: string
  setActiveTab: (tab: string) => void
  isLogDialogOpen: boolean
  setIsLogDialogOpen: (open: boolean) => void
  editingLog: CommunicationLog | null
  setEditingLog: (log: CommunicationLog | null) => void
  addCommunication: any
  updateCommunication: any
  isSyncing: boolean
  syncError: string | null
}

function CommunicationHubPageInner({
  contactOptions,
  unreadCount,
  unreadThreadCount,
  totalEvents,
  totalLogs,
  messageThreads,
  activeTab,
  setActiveTab,
  isLogDialogOpen,
  setIsLogDialogOpen,
  editingLog,
  setEditingLog,
  addCommunication,
  updateCommunication,
  isSyncing,
  syncError,
}: CommunicationHubPageInnerProps) {
  const { open: openEntryModal } = useEntryModal()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Header />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b bg-primary dark:bg-secondary">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/10">
                <Link href="/services/command-center">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Communication Hub</h1>
                <p className="text-white/80 mt-1">
                  Schedule, message, and track all communications in one place
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="secondary" asChild
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
              >
                <Link href={'./contacts'}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Contacts
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
                onClick={() => setIsLogDialogOpen(true)}
              >
                <NotebookText className="w-4 h-4 mr-2" />
                Log Communication
              </Button>
              <Button
                className="bg-white text-primary dark:text-secondary hover:bg-white/70 cursor-pointer"
                onClick={() => openEntryModal()}
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalEvents}</p>
                  <p className="text-sm text-white/70">Upcoming Meetings</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {unreadCount > 0 ? unreadCount : messageThreads.length}
                  </p>
                  <p className="text-sm text-white/70">
                    {unreadCount > 0 ? "Unread Messages" : "Total Threads"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <NotebookText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalLogs}</p>
                  <p className="text-sm text-white/70">Communication Logs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="sm:hidden flex gap-2 p-4 border-b bg-background">
        <Button variant="outline" className="flex-1" onClick={() => setIsLogDialogOpen(true)}>
          <NotebookText className="w-4 h-4 mr-2" />Log
        </Button>
        <Button className="flex-1" onClick={() => openEntryModal()}>
          <CalendarPlus className="w-4 h-4 mr-2" />Schedule
        </Button>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-auto flex gap-3 overflow-x-auto rounded-2xl bg-muted/60 p-1.5 backdrop-blur-sm border border-border shadow-sm">
            {[
              { value: "schedule", icon: Calendar, label: "Schedule" },
              { value: "messages", icon: MessageCircle, label: "Messages" },
              { value: "logs", icon: NotebookText, label: "Logs" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/10 data-[state=active]:!bg-primary/30 data-[state=active]:!text-foreground cursor-pointer"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
                {value === "messages" && unreadThreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 min-w-[20px]">
                    {unreadThreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScheduleTab />
          <MessagesTab />
          <LogTab />
        </Tabs>
      </main>
      <Footer />

      <AddCommunicationDialog
        open={isLogDialogOpen}
        onOpenChange={(open) => {
          setIsLogDialogOpen(open)
          if (!open) setEditingLog(null)
        }}
        onSave={addCommunication}
        onUpdate={updateCommunication}
        contacts={contactOptions}
        editingLog={editingLog}
      />

      <ConnectedEntryModal />
      <ConnectedEntryDetailPopover />

      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Syncing...</span>
        </div>
      )}

      {syncError && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{syncError}</span>
        </div>
      )}
    </div>
  )
}