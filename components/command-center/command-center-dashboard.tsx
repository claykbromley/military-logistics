"use client"

import { useMemo } from "react"
import { 
  DollarSign, FileText, Home, Users, Calendar, MessageSquare, History,
  ShieldCheck, Briefcase, PawPrint, Heart, ArrowRight, 
  AlertCircle, AlertTriangle, Clock, CheckCircle2, TrendingUp, Bell,
  Star, Phone, Sparkles, ExternalLink,
  CreditCard, FileCheck, Wrench, Video, Car
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCommunicationHub } from "@/hooks/use-communication-hub"
import { useProperties } from "@/hooks/use-properties"
import { useDocuments } from "@/hooks/use-documents"

export function CommandCenterDashboard() {
  const { getEmergencyContacts, getPoaHolders, contacts, scheduledEvents, messageThreads, communicationLog } = useCommunicationHub()
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
  const soonestMaintenanceType = vehicles.some(item => item['id'] === soonestMaintenance?.propertyId)?"vehicle":"other"
  const soonestExpItem = getSoonestByDate(expiringItems, "date")
  const soonestExpItemStatus = daysUntil(soonestExpItem?.date)
  const soonestExpDoc = getSoonestByDate(expiringDocuments, "expirationDate")
  const soonestExpDocStatus = daysUntil(soonestExpDoc?.expirationDate?.split('T')[0])

  const upcomingCalls = useMemo(() => {
    const now = Date.now()
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
    const cutoff = now + THIRTY_DAYS

    return scheduledEvents
      .filter((e) => e.status === "scheduled" && new Date(e.startTime) >= new Date())
      .filter((e) => {
        const start = new Date(e.startTime).getTime()
        return start <= cutoff
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [scheduledEvents])

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


  return (
    <section className="py-6 md:py-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        {/* Main Grid Layout - Asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Financial Command - Large, 2x height */}
          <div className="lg:col-span-5 lg:row-span-2">
            <div className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Financial Management</h3>
                    <p className="text-xs text-slate-600">Real-time overview</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  <Bell className="w-3.5 h-3.5" />
                  2
                </div>
              </div>

              {/* Large Savings Display */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-4 border border-emerald-200/30">
                <div className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Deployment Savings
                </div>
                <div className="text-5xl font-bold text-emerald-700 mb-2">$2,450</div>
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <div className="flex-1 bg-emerald-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full w-2/3"></div>
                  </div>
                  <span className="font-semibold">67% of goal</span>
                </div>
              </div>

              {/* Financial Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 font-medium">Bills Due Soon</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">3</div>
                  <div className="text-xs text-amber-600 font-medium mt-1">Next 7 days</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 font-medium">Autopay Active</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">12<span className="text-lg text-slate-500">/15</span></div>
                  <div className="text-xs text-slate-600 mt-1">accounts</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 font-medium">Accounts</span>
                    <CreditCard className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">8</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1">All monitored</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 font-medium">Net Worth</span>
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">$48.2K</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +$2.4K
                  </div>
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30" asChild>
                <Link href="/services/command-center/financial">
                  Manage Finances
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Communication Hub - Wide */}
          <div className="lg:col-span-7">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Communication Hub</h3>
                    <p className="text-xs text-slate-600">Stay connected with your contacts</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <Video className="w-5 h-5 text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{upcomingCalls.length}</div>
                  <div className="text-xs text-slate-600">Scheduled Calls</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <MessageSquare className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{unreadCount > 0 ? unreadCount : messageThreads.length}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    {unreadCount > 0 ? "Unread Messages" : "Total Threads"}
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                  <History className="w-5 h-5 text-amber-500 mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{communicationLog.length}</div>
                  <div className="text-xs text-slate-600">Communication Logs</div>
                </div>
              </div>

              <div className="bg-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  {upcomingCalls.length > 0 ?
                    <div>
                      <div className="text-sm opacity-90 mb-1">Next scheduled call</div>
                      <div className="text-xl font-bold">{formatEventTime(upcomingCalls[0].startTime)}</div>
                      <div className="text-sm opacity-75 mt-1">{upcomingCalls[0].title}</div>
                    </div>
                  : <div className="text-xl font-bold">No Upcoming Calls</div>}
                  <Phone className="w-8 h-8 opacity-50" />
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 border-purple-300 hover:bg-purple-100 hover:text-black-400" asChild>
                <Link href="/services/command-center/communication">
                  View Communications
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Calendar & Events - Medium */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200/50 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Upcoming Events</h3>
                  <p className="text-xs text-slate-600">8 events scheduled</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-cyan-200/30 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-xs text-red-600 font-bold">FEB</div>
                    <div className="text-lg font-bold text-red-700">14</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">Anniversary</div>
                    <div className="text-xs text-slate-600">Send care package</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    16d
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-cyan-200/30 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-xs text-blue-600 font-bold">FEB</div>
                    <div className="text-lg font-bold text-blue-700">22</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">Emma's Birthday</div>
                    <div className="text-xs text-slate-600">Video call scheduled</div>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full border-cyan-300 hover:bg-cyan-100 hover:text-black-400" asChild>
                <Link href="/services/command-center/calendar">
                  View Calendar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Legal Ready - Attention needed */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-300 shadow-lg hover:shadow-xl transition-all h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Legal Ready</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  2
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-200/50 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 font-medium">Documents</span>
                  <FileCheck className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">8<span className="text-xl text-slate-500">/10</span></div>
                <div className="flex-1 bg-orange-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-orange-600 h-full rounded-full w-4/5"></div>
                </div>
              </div>

              <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
                <div className="text-xs text-red-700 font-bold mb-1">ACTION REQUIRED</div>
                <div className="text-sm text-red-900">2 documents need renewal</div>
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg" asChild>
                <Link href="/services/command-center/legal">
                  Review Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Secondary Services Grid - Aesthetic cards with useful info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          
          {/* Document Vault */}
          <Link href="/services/command-center/documents" className="group">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/50 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Document Vault</h3>
                    <span className="text-xs text-slate-600">{documents.length} document{documents.length != 1 && 's'}</span>
                  </div>
                </div>
                {expiringDocuments.length > 0 &&
                <div>
                  {soonestExpDocStatus && soonestExpDocStatus <= 0?
                  <div className="flex items-center gap-1 bg-red-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {expiringDocuments.length}
                  </div>:
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {expiringDocuments.length}
                  </div>}
                </div>}
              </div>
              
              {expiringDocuments.length > 0?
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 border border-blue-200/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 font-medium">{soonestExpDoc?.documentName} ({soonestExpDoc?.documentType})</span>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                </div>
                {soonestExpDocStatus && soonestExpDocStatus <= 0?
                <div>
                  <div className="text-sm font-semibold text-slate-900">Expired {formatDate(soonestExpDoc?.expirationDate?.split('T')[0], true)}</div>
                  <div className="text-xs text-red-600 mt-1">Expired</div>
                </div>:
                <div>
                  <div className="text-sm font-semibold text-slate-900">Expires {formatDate(soonestExpDoc?.expirationDate?.split('T')[0], true)}</div>
                    <div className="text-xs text-amber-600 mt-1">{(() => {
                      if (soonestExpDocStatus === null) return '—'
                      if (soonestExpDocStatus === 1) return '1 day remaining'
                      return `${soonestExpDocStatus} days remaining`
                    })()}
                  </div>
                </div>}
              </div>:
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 border border-blue-200/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 font-medium">DOCUMENTS</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">All documents are up to date</div>
                </div>
              </div>}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Storage: {formatFileSize(totalSize)} / 1 GB</span>
                <span className="text-blue-600 font-semibold">{Math.round(totalSize * 100 / (1024 * 1024 * 1024))}% used</span>
              </div>
            </div>
          </Link>

          {/* Property & Vehicles */}
          <Link href="/services/command-center/property" className="group">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200/50 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Property</h3>
                    <span className="text-xs text-slate-600">{homes} home{homes !== 1 && 's'}, {vehicles.length} vehicle{vehicles.length !== 1 && 's'}</span>
                  </div>
                </div>
                {expiringItems.length > 0 &&
                <div>
                  {soonestExpItemStatus && soonestExpItemStatus <= 0?
                  <div className="flex items-center gap-1 bg-red-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {expiringItems.length}
                  </div>:
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    {expiringItems.length}
                  </div>}
                </div>}
              </div>
              
              {maintenance.length > 0?
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 border border-amber-200/30">
                <div className="flex items-center gap-2 mb-1">
                  {soonestMaintenanceType === 'vehicle'?
                  <Car className="w-3.5 h-3.5 text-amber-600" />:
                  <Home className="w-3.5 h-3.5 text-amber-600" />}
                  <span className="text-xs text-slate-600 font-medium">{soonestMaintenance?.propertyName}</span>
                </div>
                <div className="text-sm font-semibold text-slate-900">{soonestMaintenance?.taskName}</div>
                <div className="text-xs text-amber-600 mt-1">{formatDate(soonestMaintenance?.nextDue)} • {soonestMaintenance?.assignedToName}</div>
              </div>:
              <div>
                {expiringItems.length > 0?
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 border border-blue-200/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 font-medium">{soonestExpItem?.propertyName}: {soonestExpItem?.type}</span>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  {soonestExpItemStatus && soonestExpItemStatus <= 0?
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Expired {formatDate(soonestExpItem?.date, true)}</div>
                    <div className="text-xs text-red-600 mt-1">Expired</div>
                  </div>:
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Expires {formatDate(soonestExpItem?.date, true)}</div>
                    <div className="text-xs text-amber-600 mt-1">{(() => {
                        if (soonestExpItemStatus === null) return '—'
                        if (soonestExpItemStatus === 1) return '1 day remaining'
                        return `${soonestExpItemStatus} days remaining`
                      })()}
                    </div>
                  </div>}
                </div>:
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 border border-blue-200/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 font-medium">MAINTENANCE</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">No upcoming maintenance</div>
                  </div>
                </div>}
              </div>}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{maintenance.length} upcoming maintenance item{maintenance.length !== 1 && 's'}</span>
                <Wrench className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
          </Link>

          {/* Emergency Contacts */}
          <Link href="/services/command-center/contacts" className="group">
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-200/50 shadow-sm hover:shadow-lg hover:border-red-300 transition-all h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Emergency Contacts</h3>
                    <span className="text-xs text-slate-600">{contacts.length} contact{contacts.length !== 1 && 's'}</span>
                  </div>
                </div>
                {(emergencyContactsList.length === 0 || poaHolders.length === 0) && (
                <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  {Number(emergencyContactsList.length === 0) + Number(poaHolders.length === 0)}
                </div>)}
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 border border-red-200/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600 font-medium uppercase tracking-wide">Primary Contact</span>
                  <Star className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                </div>
                {primaryContact?
                <div>
                  <div className="text-sm font-bold text-slate-900 mb-1">{primaryContact?.contactName} ({primaryContact?.relationship})</div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-700 font-mono">{primaryContact?.phonePrimary}</span>
                  </div>
                </div>:
                <div className="text-sm font-bold text-slate-900 mb-1">No Primary Contact</div>
                }
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Emergency Contacts: {emergencyContactsList.length}, POA Holders: {poaHolders.length}</span>
                <span className="text-red-600 font-semibold">View all →</span>
              </div>
            </div>
          </Link>

          {/* Pet Care */}
          <Link href="/services/command-center/pets" className="group">
            <div className="bg-gradient-to-br from-pink-50 to-fuchsia-50 rounded-xl p-5 border border-pink-200/50 shadow-sm hover:shadow-lg hover:border-pink-300 transition-all h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-pink-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Pet Care</h3>
                  <span className="text-xs text-slate-600">2 pets in care</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-pink-200/30 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                    🐕
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">Max (Golden Retriever)</div>
                    <div className="text-xs text-slate-600">With Johnson Family</div>
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-pink-200/30 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs font-bold">
                    🐱
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">Luna (Tabby Cat)</div>
                    <div className="text-xs text-slate-600">With Johnson Family</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  All covered
                </span>
                <span className="text-slate-600">No vet visits</span>
              </div>
            </div>
          </Link>

          {/* Wellness */}
          <Link href="/services/command-center/wellness" className="group">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-200/50 shadow-sm hover:shadow-lg hover:border-rose-300 transition-all h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-rose-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Wellness Journal</h3>
                  <span className="text-xs text-slate-600">34 entries</span>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 border border-rose-200/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600 font-medium">Current Mood</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                    <Star className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900 mb-1">7.2 / 10 average</div>
                <div className="flex gap-1.5">
                  {[8, 7, 9, 6, 8, 7, 7].map((val, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-rose-200 rounded-sm overflow-hidden"
                      style={{ height: '24px' }}
                    >
                      <div 
                        className="bg-rose-500 w-full rounded-sm"
                        style={{ height: `${val * 10}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  7-day streak
                </span>
                <span className="text-slate-600">Last: Today</span>
              </div>
            </div>
          </Link>

          {/* Career & Benefits */}
          <Link href="/services/command-center/career" className="group">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200/50 shadow-sm hover:shadow-lg hover:border-violet-300 transition-all h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Career & Benefits</h3>
                  <span className="text-xs text-slate-600">Active duty</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-violet-200/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 font-medium">TSP Contribution</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-lg font-bold text-violet-700">15%</div>
                  <div className="flex-1 bg-violet-200 rounded-full h-1.5 overflow-hidden mt-1">
                    <div className="bg-violet-600 h-full rounded-full w-3/4"></div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-violet-200/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-600 font-medium mb-0.5">Leave Balance</div>
                      <div className="text-lg font-bold text-slate-900">28.5 <span className="text-sm text-slate-600">days</span></div>
                    </div>
                    <Calendar className="w-8 h-8 text-violet-300" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">GI Bill: 100%</span>
                <span className="text-violet-600 font-semibold">View benefits →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white rounded-2xl p-8 text-center shadow-xl border border-white/10 relative overflow-hidden">
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
              <Button size="lg" className="min-w-[200px] bg-white text-slate-900 hover:bg-slate-100" asChild>
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