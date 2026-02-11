"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Calendar, CalendarPlus, MessageCircle, History, AlertCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CommunicationLog, ScheduledEvent } from "@/lib/types"
import { useCommunicationHub,CommunicationHubProvider } from "@/hooks/use-communication-hub"
import { MessagesTab } from "@/components/command-center/messages-tab"
import { ScheduleTab, ScheduleEventDialog } from "@/components/command-center/schedule-tab"
import { LogTab, AddCommunicationDialog } from "@/components/command-center/log-tab"

export default function CommunicationHubPage() {
  return (
    <CommunicationHubProvider>
      <CommunicationHubPageContent />
    </CommunicationHubProvider>
  )
}

function CommunicationHubPageContent() {
  const {
    contacts,
    communicationLog,
    scheduledEvents,
    messageThreads,
    isLoaded,
    isSyncing,
    syncError,
    addCommunication,
    updateCommunication,
    createEvent,
    updateEvent
  } = useCommunicationHub()

  // Dialog states
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<CommunicationLog | null>(null)
  const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null)

  // View states
  const [activeTab, setActiveTab] = useState("schedule")

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: c.contactName,
    email: c.email || "",
  }))

  // Calculate unread count from threads directly for accuracy
  const unreadCount = useMemo(() => {
    return messageThreads
      .filter(t => !t.isArchived)
      .reduce((sum, t) => sum + (t.unreadCount || 0), 0)
  }, [messageThreads])

  // Count of threads with unread messages (for the badge)
  const unreadThreadCount = useMemo(() => {
    return messageThreads.filter(t => !t.isArchived && t.unreadCount > 0).length
  }, [messageThreads])

  const handleCreateEvent = async (
    event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
    invitees: { email: string; name?: string; contactId?: string }[]
  ) => {
    await createEvent(event, invitees)
  }

  const handleUpdateEvent = async (
    eventId: string,
    event: Omit<ScheduledEvent, "id" | "createdAt" | "updatedAt" | "invitations">,
    invitees: { email: string; name?: string; contactId?: string }[]
  ) => {
    await updateEvent(eventId, event, invitees)
  }

  // Stats
  const totalEvents = scheduledEvents.filter((e) => e.status === "scheduled").length
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Header />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b bg-primary">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
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
                <History className="w-4 h-4 mr-2" />
                Log Communication
              </Button>
              <Button
                className="bg-white text-primary hover:bg-white/90 cursor-pointer"
                onClick={() => setIsEventDialogOpen(true)}
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Schedule Event
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
                  <p className="text-sm text-white/70">Upcoming Events</p>
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
                  <History className="w-5 h-5 text-white" />
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
          <History className="w-4 h-4 mr-2" />
          Log
        </Button>
        <Button className="flex-1" onClick={() => setIsEventDialogOpen(true)}>
          <CalendarPlus className="w-4 h-4 mr-2" />
          Schedule
        </Button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/50 p-1">
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
              {unreadThreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-[20px]">
                  {unreadThreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <History className="w-4 h-4" />
              Logs
            </TabsTrigger>
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

      <ScheduleEventDialog
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open)
          if (!open) setEditingEvent(null)
        }}
        onSave={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        contacts={contactOptions}
        editingEvent={editingEvent}
      />

      {/* Sync indicator */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Syncing...</span>
        </div>
      )}

      {/* Error indicator */}
      {syncError && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{syncError}</span>
        </div>
      )}
    </div>
  )
}