"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { 
  DollarSign, FileText, Home, Users, Calendar, MessageSquare, History,
  ShieldCheck, Briefcase, PawPrint, Heart, ArrowRight, 
  AlertCircle, AlertTriangle, Clock, CheckCircle2, TrendingUp, Bell,
  Star, Phone, Sparkles, ExternalLink,
  CreditCard, Wrench, Video, Car, Circle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCommunicationHub } from "@/hooks/use-communication-hub"
import { useProperties } from "@/hooks/use-properties"
import { useDocuments } from "@/hooks/use-documents"
import { useLegalChecklist } from "@/hooks/use-legal"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { CalendarEntry } from "@/app/scheduler/calendar/types"
import { getNextOccurrence } from "@/app/scheduler/calendar/utils"

export function CommandCenterDashboard() {
  const { getEmergencyContacts, getPoaHolders, contacts, messageThreads, communicationLog } = useCommunicationHub()
  const emergencyContactsList = getEmergencyContacts()
  const poaHolders = getPoaHolders()
  const primaryContact = contacts.find(contact => contact.priority === 1)

  const { getPropertiesByType, getUpcomingMaintenance, getExpiringItems } = useProperties()
  const homes = getPropertiesByType('home').length + getPropertiesByType('rental').length
  const vehicles = getPropertiesByType('vehicle')
  const maintenance = getUpcomingMaintenance()
  const expiringItems = getExpiringItems()

  const { documents, getExpiringDocuments } = useDocuments()
  const expiringDocuments = getExpiringDocuments()
  const totalSize = documents.reduce((accumulator, currentItem) => {
    return accumulator + (currentItem.fileSize || 0);
  }, 0)

  const formatDate = (dateStr?: string, year?: boolean) => {
    if (!dateStr) return '—'
    if (year) {
      return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      })
    }
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    })
  }

  const daysUntil = (dateStr?: string) => {
    if (!dateStr) return null
    const today = new Date()
    const target = new Date(`${dateStr}T00:00:00`)
    today.setHours(0, 0, 0, 0)
    const diffMs = target.getTime() - today.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  function getSoonestByDate<T extends Record<string, any>, K extends keyof T>(
    items: T[],
    dateKey: K
  ): T | null {
    return items.reduce<T | null>((earliest, item) => {
      const currentDate = item[dateKey]
      const earliestDate = earliest?.[dateKey]
      if (!currentDate) return earliest
      if (!earliestDate) return item
      return new Date(currentDate as string) < new Date(earliestDate as string)
        ? item
        : earliest
    }, null)
  }

  function formatFileSize(bytes?: number): string {
    if (!bytes) return `0 KB`
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const soonestMaintenance = getSoonestByDate(maintenance, "nextDue")
  const soonestMaintenanceType = vehicles.some(item => item['id'] === soonestMaintenance?.propertyId) ? "vehicle" : "other"
  const soonestExpItem = getSoonestByDate(expiringItems, "date")
  const soonestExpItemStatus = daysUntil(soonestExpItem?.date)
  const soonestExpDoc = getSoonestByDate(expiringDocuments, "expirationDate")
  const soonestExpDocStatus = daysUntil(soonestExpDoc?.expirationDate?.split('T')[0])

  // ── Fetch upcoming meetings directly from calendar_entries ──
  // Matches the same source used by the comm hub page & schedule tab
  const [upcomingMeetings, setUpcomingMeetings] = useState<(CalendarEntry & { _nextOccurrence: Date })[]>([])
  const [meetingCount, setMeetingCount] = useState(0)

  const fetchUpcomingMeetings = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("calendar_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("source", "meeting")
      .eq("is_completed", false)
      .order("start_time", { ascending: true })

    if (error || !data) {
      setUpcomingMeetings([])
      setMeetingCount(0)
      return
    }

    const now = new Date()
    const thirtyDaysOut = new Date(now.getTime() + 30 * 86400000)

    // Resolve next occurrence for each entry and filter to those with future occurrences
    const withNextOcc = (data as CalendarEntry[])
      .map((e) => {
        const next = getNextOccurrence(e, now)
        return next ? { ...e, _nextOccurrence: next } : null
      })
      .filter((e): e is CalendarEntry & { _nextOccurrence: Date } =>
        e !== null && e._nextOccurrence >= now
      )

    // Count within 30 days
    const inWindow = withNextOcc.filter((e) => e._nextOccurrence < thirtyDaysOut)
    setMeetingCount(inWindow.length)

    // Sort by next occurrence date
    const sorted = inWindow.sort(
      (a, b) => a._nextOccurrence.getTime() - b._nextOccurrence.getTime()
    )

    setUpcomingMeetings(sorted)
  }, [])

  useEffect(() => {
    fetchUpcomingMeetings()
  }, [fetchUpcomingMeetings])

  // Realtime subscription for meeting count changes
  useEffect(() => {
    const supabase = createClient()
    let userId: string | null = null

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      userId = user.id
      const channel = supabase
        .channel("dashboard-meeting-count")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "calendar_entries",
            filter: `user_id=eq.${userId}`,
          },
          () => fetchUpcomingMeetings()
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    })
  }, [fetchUpcomingMeetings])

  const unreadCount = useMemo(() => {
    return messageThreads
      .filter(t => !t.isArchived)
      .reduce((sum, t) => sum + (t.unreadCount || 0), 0)
  }, [messageThreads])

  function formatEventTime(iso: string) {
    const date = new Date(iso)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date)
    if (isToday) return `Today, ${time}`
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date)
  }

  interface ChecklistDef {
    id: string
    label: string
    priority: "critical" | "recommended" | "optional"
  }

  const LEGALCHECKLIST: ChecklistDef[] = [
    { id: "will", label: "Will & Testament", priority: "critical" },
    { id: "poa-general", label: "General Power of Attorney", priority: "critical" },
    { id: "poa-special", label: "Special Power of Attorney", priority: "recommended" },
    { id: "advance-directive", label: "Advance Medical Directive", priority: "critical" },
    { id: "beneficiaries", label: "Review Beneficiaries", priority: "critical" },
    { id: "sgli-review", label: "SGLI Coverage Review", priority: "critical" },
    { id: "life-insurance-private", label: "Private Life Insurance", priority: "recommended" },
    { id: "dd93", label: "DD Form 93", priority: "critical" },
    { id: "allotments", label: "Pay Allotments", priority: "recommended" },
    { id: "tax-documents", label: "Tax Documents", priority: "recommended" },
    { id: "debt-inventory", label: "Debt & Account Inventory", priority: "optional" },
    { id: "scra-interest", label: "SCRA Interest Rate Cap", priority: "recommended" },
    { id: "family-care-plan", label: "Family Care Plan", priority: "critical" },
    { id: "emergency-contacts", label: "Emergency Contacts", priority: "critical" },
    { id: "childcare-poa", label: "Childcare POA", priority: "recommended" },
    { id: "id-cards", label: "Dependent ID Cards", priority: "recommended" },
    { id: "vehicle-storage", label: "Vehicle Storage & Insurance", priority: "recommended" },
    { id: "lease-review", label: "Lease / Housing Review", priority: "recommended" },
    { id: "scra-protections", label: "SCRA Protections Filed", priority: "recommended" },
    { id: "mail-forwarding", label: "Mail Forwarding", priority: "optional" },
  ]

  const { completionMap } = useLegalChecklist()

  const total = LEGALCHECKLIST.length
  const done = LEGALCHECKLIST.filter((i) => completionMap[i.id]?.completed).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const criticalItems = LEGALCHECKLIST.filter((i) => i.priority === "critical")
  const criticalDone = criticalItems.filter((i) => completionMap[i.id]?.completed).length
  const criticalRemaining = criticalItems.length - criticalDone
  const incompleteCritical = criticalItems.filter((i) => !completionMap[i.id]?.completed).slice(0, 3)

  return (
    <section className="py-6 md:py-10 bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        {/* Main Grid Layout - Asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Financial Command - Large, 2x height */}
          <div className="lg:col-span-5 lg:row-span-2">
            <div className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Financial Management</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Real-time overview</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  <Bell className="w-3.5 h-3.5" />
                  2
                </div>
              </div>

              {/* Large Savings Display */}
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-4 border border-emerald-200/30 dark:border-emerald-700/30">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Deployment Savings
                </div>
                <div className="text-5xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">$2,450</div>
                <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <div className="flex-1 bg-emerald-200 dark:bg-emerald-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full w-2/3"></div>
                  </div>
                  <span className="font-semibold">67% of goal</span>
                </div>
              </div>

              {/* Financial Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Bills Due Soon</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">3</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">Next 7 days</div>
                </div>

                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Autopay Active</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">12<span className="text-lg text-slate-500 dark:text-slate-400">/15</span></div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">accounts</div>
                </div>

                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Accounts</span>
                    <CreditCard className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">8</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">All monitored</div>
                </div>

                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Net Worth</span>
                    <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">$48.2K</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +$2.4K
                  </div>
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 dark:shadow-emerald-900/50" asChild>
                <Link href="/services/command-center/financial">
                  Manage Finances
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Communication Hub - Wide */}
          <div className="lg:col-span-7">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/30 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-600 dark:bg-purple-500 flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Communication Hub</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Stay connected with your contacts</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                  <Video className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{meetingCount}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Scheduled Meetings</div>
                </div>

                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{unreadCount > 0 ? unreadCount : messageThreads.length}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    {unreadCount > 0 ? "Unread Messages" : "Total Threads"}
                    <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                  <History className="w-5 h-5 text-amber-500 dark:text-amber-400 mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{communicationLog.length}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Communication Logs</div>
                </div>
              </div>

              <div className="bg-purple-600 dark:bg-purple-700 rounded-xl p-4 text-white">
                {upcomingMeetings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingMeetings.slice(0, 2).map((meeting, i) => (
                      <div key={meeting.id} className={`flex items-center justify-between ${i > 0 ? "pt-3 border-t border-white/15" : ""}`}>
                        <div>
                          {i === 0 && <div className="text-sm opacity-90 mb-1">Next scheduled meetings</div>}
                          <div className={i === 0 ? "text-xl font-bold" : "text-base font-semibold opacity-90"}>{formatEventTime(meeting._nextOccurrence.toISOString())}</div>
                          <div className="text-sm opacity-75 mt-0.5">{meeting.title}</div>
                        </div>
                        {i === 0 && <Phone className="w-8 h-8 opacity-50 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold">No Upcoming Meetings</div>
                    <Phone className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full mt-4 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-900 dark:hover:text-purple-200" asChild>
                <Link href="/services/command-center/communication">
                  View Communications
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Calendar & Events - Medium */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/30 rounded-2xl p-6 border border-cyan-200/50 dark:border-cyan-800/50 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-cyan-600 dark:bg-cyan-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Upcoming Events</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">8 events scheduled in next 30 days</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-cyan-200/30 dark:border-cyan-700/30 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/40 flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-xs text-red-600 dark:text-red-400 font-bold">FEB</div>
                    <div className="text-lg font-bold text-red-700 dark:text-red-300">14</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Anniversary</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Send care package</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    16d
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-cyan-200/30 dark:border-cyan-700/30 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/40 flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-xs text-red-600 dark:text-red-400 font-bold">FEB</div>
                    <div className="text-lg font-bold text-red-700 dark:text-red-300">14</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Anniversary</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Send care package</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    16d
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-cyan-200/30 dark:border-cyan-700/30 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">FEB</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">22</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Emma&apos;s Birthday</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Meeting scheduled</div>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full border-cyan-300 dark:border-cyan-700 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:text-cyan-900 dark:hover:text-cyan-200" asChild>
                <Link href="/scheduler/calendar">
                  View Calendar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Legal Ready - Attention needed */}
          <div className="lg:col-span-3">
            <div className={"bg-gradient-to-br rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all h-full from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/30 border-orange-300 dark:border-orange-700"}>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={"w-11 h-11 rounded-xl flex items-center justify-center shadow-lg bg-orange-200 dark:bg-orange-900"}>
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Legal Ready</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Stay prepared
                    </p>
                  </div>
                </div>
                {criticalRemaining > 0 && (
                  <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {criticalRemaining}
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/30 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Readiness</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                    {pct}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {done}<span className="text-xl text-slate-500 dark:text-slate-400">/{total}</span>
                </div>
                <div className={"flex-1 rounded-full h-2 overflow-hidden bg-orange-200 dark:bg-orange-900"}>
                  <div
                    className={"h-full rounded-full transition-all duration-700 ease-out, bg-orange-600 dark:bg-orange-500"}
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Legal readiness: ${pct}% complete`}
                  />
                </div>
              </div>

              {/* Critical items or success state */}
              {criticalRemaining > 0 ? (
                <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-3 mb-3">
                  <div className="text-[10px] text-red-700 dark:text-red-300 font-bold uppercase tracking-wider mb-1.5">
                    Critical — Action Required
                  </div>
                  <div className="space-y-1.5">
                    {incompleteCritical.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Circle className="w-3 h-3 text-red-400 dark:text-red-500 flex-shrink-0" />
                        <span className="text-xs text-red-900 dark:text-red-200 font-medium truncate">{item.label}</span>
                      </div>
                    ))}
                    {criticalRemaining > 3 && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 font-medium pl-5">
                        +{criticalRemaining - 3} more critical item{criticalRemaining - 3 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              ) : done === 0 ? (
                <div className="bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-3">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Get Started
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 rounded-lg p-3 mb-3">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider mb-1">
                    {pct >= 100 ? "Fully Prepared" : "Critical Items Complete"}
                  </div>
                </div>
              )}

              {/* CTA */}
              <Button
                className={"w-full text-white shadow-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500"}
                asChild
              >
                <Link href="/services/command-center/legal">
                  {done === 0 ? "Get Started" : criticalRemaining > 0 ? "Review Now" : "View Checklist"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Secondary Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          
          {/* Document Vault */}
          <Link href="/services/command-center/documents" className="group">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 rounded-xl p-5 border border-blue-200/50 dark:border-blue-800/50 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Document Vault</h3>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{documents.length} document{documents.length != 1 && 's'}</span>
                  </div>
                </div>
                {expiringDocuments.length > 0 &&
                <div>
                  {soonestExpDocStatus && soonestExpDocStatus <= 0 ?
                  <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {expiringDocuments.length}
                  </div> :
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {expiringDocuments.length}
                  </div>}
                </div>}
              </div>
              
              {expiringDocuments.length > 0 ?
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-3 border border-blue-200/30 dark:border-blue-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{soonestExpDoc?.documentName} ({soonestExpDoc?.documentType})</span>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                </div>
                {soonestExpDocStatus && soonestExpDocStatus <= 0 ?
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expired {formatDate(soonestExpDoc?.expirationDate?.split('T')[0], true)}</div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">Expired</div>
                </div> :
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expires {formatDate(soonestExpDoc?.expirationDate?.split('T')[0], true)}</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">{(() => {
                    if (soonestExpDocStatus === null) return '—'
                    if (soonestExpDocStatus === 1) return '1 day remaining'
                    return `${soonestExpDocStatus} days remaining`
                  })()}
                  </div>
                </div>}
              </div> :
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-3 border border-blue-200/30 dark:border-blue-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">DOCUMENTS</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">All documents are up to date</div>
                </div>
              </div>}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Storage: {formatFileSize(totalSize)} / 1 GB</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{Math.round(totalSize * 100 / (1024 * 1024 * 1024))}% used</span>
              </div>
            </div>
          </Link>

          {/* Property & Vehicles */}
          <Link href="/services/command-center/property" className="group">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 rounded-xl p-5 border border-amber-200/50 dark:border-amber-800/50 shadow-sm hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-600 transition-all h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-600 dark:bg-amber-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Property</h3>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{homes} home{homes !== 1 && 's'}, {vehicles.length} vehicle{vehicles.length !== 1 && 's'}</span>
                  </div>
                </div>
                {expiringItems.length > 0 &&
                <div>
                  {soonestExpItemStatus && soonestExpItemStatus <= 0 ?
                  <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {expiringItems.length}
                  </div> :
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {expiringItems.length}
                  </div>}
                </div>}
              </div>
              
              {maintenance.length > 0 ?
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-3 border border-amber-200/30 dark:border-amber-700/30">
                <div className="flex items-center gap-2 mb-1">
                  {soonestMaintenanceType === 'vehicle' ?
                  <Car className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> :
                  <Home className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{soonestMaintenance?.propertyName}</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{soonestMaintenance?.taskName}</div>
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">{formatDate(soonestMaintenance?.nextDue)} • {soonestMaintenance?.assignedToName}</div>
              </div> :
              <div>
                {expiringItems.length > 0 ?
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-3 border border-amber-200/30 dark:border-amber-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{soonestExpItem?.propertyName}: {soonestExpItem?.type}</span>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  {soonestExpItemStatus && soonestExpItemStatus <= 0 ?
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expired {formatDate(soonestExpItem?.date, true)}</div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">Expired</div>
                  </div> :
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expires {formatDate(soonestExpItem?.date, true)}</div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">{(() => {
                      if (soonestExpItemStatus === null) return '—'
                      if (soonestExpItemStatus === 1) return '1 day remaining'
                      return `${soonestExpItemStatus} days remaining`
                    })()}
                    </div>
                  </div>}
                </div> :
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-3 border border-amber-200/30 dark:border-amber-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">MAINTENANCE</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">No upcoming maintenance</div>
                  </div>
                </div>}
              </div>}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">{maintenance.length} upcoming maintenance item{maintenance.length !== 1 && 's'}</span>
                <Wrench className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
          </Link>

          {/* Emergency Contacts */}
          <Link href="/services/command-center/contacts" className="group">
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30 rounded-xl p-5 border border-red-200/50 dark:border-red-800/50 shadow-sm hover:shadow-lg hover:border-red-300 dark:hover:border-red-600 transition-all h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-red-600 dark:bg-red-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Emergency Contacts</h3>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{contacts.length} contact{contacts.length !== 1 && 's'}</span>
                  </div>
                </div>
                {(emergencyContactsList.length === 0 || poaHolders.length === 0) && (
                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  {Number(emergencyContactsList.length === 0) + Number(poaHolders.length === 0)}
                </div>)}
              </div>
              
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-3 border border-red-200/30 dark:border-red-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">Primary Contact</span>
                  <Star className="w-3.5 h-3.5 text-red-500 fill-red-500 dark:text-red-400 dark:fill-red-400" />
                </div>
                {primaryContact ?
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{primaryContact?.contactName} ({primaryContact?.relationship})</div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-mono">{primaryContact?.phonePrimary}</span>
                  </div>
                </div> :
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">No Primary Contact</div>
                }
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Emergency Contacts: {emergencyContactsList.length}, POA Holders: {poaHolders.length}</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">View all →</span>
              </div>
            </div>
          </Link>

          {/* Pet Care */}
          <Link href="/services/command-center/pets" className="group">
            <div className="bg-gradient-to-br from-pink-50 to-fuchsia-50 dark:from-pink-950/40 dark:to-fuchsia-950/30 rounded-xl p-5 border border-pink-200/50 dark:border-pink-800/50 shadow-sm hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-600 transition-all h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-pink-600 dark:bg-pink-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Pet Care</h3>
                  <span className="text-xs text-slate-600 dark:text-slate-400">2 pets in care</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-pink-200/30 dark:border-pink-700/30 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                    🐕
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Max (Golden Retriever)</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">With Johnson Family</div>
                  </div>
                </div>
                
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-pink-200/30 dark:border-pink-700/30 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs font-bold">
                    🐱
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Luna (Tabby Cat)</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">With Johnson Family</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  All covered
                </span>
                <span className="text-slate-600 dark:text-slate-400">No vet visits</span>
              </div>
            </div>
          </Link>

          {/* Wellness */}
          <Link href="/services/command-center/wellness" className="group">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/30 rounded-xl p-5 border border-rose-200/50 dark:border-rose-800/50 shadow-sm hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-600 transition-all h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-rose-600 dark:bg-rose-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Wellness Journal</h3>
                  <span className="text-xs text-slate-600 dark:text-slate-400">34 entries</span>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-3 border border-rose-200/30 dark:border-rose-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Current Mood</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                    <Star className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">7.2 / 10 average</div>
                <div className="flex gap-1.5">
                  {[8, 7, 9, 6, 8, 7, 7].map((val, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-rose-200 dark:bg-rose-900 rounded-sm overflow-hidden"
                      style={{ height: '24px' }}
                    >
                      <div 
                        className="bg-rose-500 dark:bg-rose-400 w-full rounded-sm"
                        style={{ height: `${val * 10}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  7-day streak
                </span>
                <span className="text-slate-600 dark:text-slate-400">Last: Today</span>
              </div>
            </div>
          </Link>

          {/* Career & Benefits */}
          <Link href="/services/command-center/career" className="group">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 rounded-xl p-5 border border-violet-200/50 dark:border-violet-800/50 shadow-sm hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-600 transition-all h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-violet-600 dark:bg-violet-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Career & Benefits</h3>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Active duty</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-violet-200/30 dark:border-violet-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">TSP Contribution</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-lg font-bold text-violet-700 dark:text-violet-400">15%</div>
                  <div className="flex-1 bg-violet-200 dark:bg-violet-900 rounded-full h-1.5 overflow-hidden mt-1">
                    <div className="bg-violet-600 dark:bg-violet-500 h-full rounded-full w-3/4"></div>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-violet-200/30 dark:border-violet-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-0.5">Leave Balance</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">28.5 <span className="text-sm text-slate-600 dark:text-slate-400">days</span></div>
                    </div>
                    <Calendar className="w-8 h-8 text-violet-300 dark:text-violet-700" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">GI Bill: 100%</span>
                <span className="text-violet-600 dark:text-violet-400 font-semibold">View benefits →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-800 dark:via-blue-800 dark:to-slate-800 text-white rounded-2xl p-8 text-center shadow-xl border border-white/10 dark:border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-2xl font-bold">Help Build Your Perfect Command Center</h3>
            </div>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Your feedback shapes the tools that support you. Tell us what matters most.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="min-w-[200px] bg-white text-slate-900 hover:bg-slate-100 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200" asChild>
                <Link href="/contact-us/feedback">
                  Share Your Ideas
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}