"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  NOTIFICATION_TYPE_LABELS,
  type Notification,
  type NotificationType,
} from "@/lib/notifications"
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Loader2,
  Filter, ChevronRight, ExternalLink, Settings, Inbox,
  AlertTriangle, Info, AlertCircle, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

// ─── Priority & Type Styling ─────────────────────────────────────────────────

const PRIORITY_STYLES = {
  low: { icon: Info, borderColor: "border-l-gray-300", bgColor: "" },
  medium: { icon: Info, borderColor: "border-l-blue-400", bgColor: "" },
  high: {
    icon: AlertTriangle,
    borderColor: "border-l-amber-400",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/10",
  },
  urgent: {
    icon: AlertCircle,
    borderColor: "border-l-red-500",
    bgColor: "bg-red-50/50 dark:bg-red-950/10",
  },
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

// ─── Notifications Page ──────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all")
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => {
    if (!authLoading && !user) router.push("/")
  }, [authLoading, user, router])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)

    try {
      const { data, count } = await getNotifications({
        unreadOnly: filter === "unread",
        type: typeFilter === "all" ? undefined : typeFilter,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })
      setNotifications(data)
      setTotalCount(count)

      const unread = await getUnreadCount()
      setUnreadCount(unread)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [user, filter, typeFilter, page])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)
      setTotalCount((prev) => prev + 1)
    })

    return unsubscribe
  }, [user])

  // Actions
  const handleMarkAsRead = async (notif: Notification) => {
    if (notif.read) return
    await markAsRead(notif.id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
    )
    setUnreadCount((prev) => Math.max(prev - 1, 0))
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleDelete = async (id: string) => {
    const notif = notifications.find((n) => n.id === id)
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setTotalCount((prev) => prev - 1)
    if (notif && !notif.read) setUnreadCount((prev) => Math.max(prev - 1, 0))
  }

  const handleNotifClick = (notif: Notification) => {
    handleMarkAsRead(notif)
    if (notif.action_url) {
      router.push(notif.action_url)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  const hasMore = totalCount > (page + 1) * PAGE_SIZE

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stay updated on your services, benefits, and community
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/settings")}
              className="text-xs"
            >
              <Settings className="h-3.5 w-3.5 mr-1" />
              Preferences
            </Button>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          <div className="flex bg-background border border-border rounded-lg p-0.5">
            <button
              onClick={() => {
                setFilter("all")
                setPage(0)
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setFilter("unread")
                setPage(0)
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filter === "unread"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <Filter className="h-3.5 w-3.5" />
                {typeFilter === "all"
                  ? "All types"
                  : NOTIFICATION_TYPE_LABELS[typeFilter].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-xs">
                Filter by type
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setTypeFilter("all")
                  setPage(0)
                }}
                className="cursor-pointer"
              >
                All types
              </DropdownMenuItem>
              {(
                Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]
              ).map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => {
                    setTypeFilter(type)
                    setPage(0)
                  }}
                  className="cursor-pointer"
                >
                  <span className={NOTIFICATION_TYPE_LABELS[type].color}>
                    {NOTIFICATION_TYPE_LABELS[type].label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Notification List ────────────────────────────────── */}
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-background border border-border rounded-xl p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              {filter === "unread" ? (
                <CheckCheck className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Inbox className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {filter === "unread"
                ? "All caught up!"
                : "No notifications yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === "unread"
                ? "You've read all your notifications."
                : "When you receive notifications, they'll appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const pStyle = PRIORITY_STYLES[notif.priority]
              const PriorityIcon = pStyle.icon
              const typeInfo = NOTIFICATION_TYPE_LABELS[notif.type]

              return (
                <div
                  key={notif.id}
                  className={`group relative bg-background border border-border rounded-xl overflow-hidden transition-all hover:shadow-md ${
                    pStyle.bgColor
                  } ${!notif.read ? "border-l-4 " + pStyle.borderColor : ""}`}
                >
                  <div
                    className="flex gap-3 p-4 cursor-pointer"
                    onClick={() => handleNotifClick(notif)}
                  >
                    {/* Unread indicator */}
                    <div className="shrink-0 pt-0.5">
                      {!notif.read ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      ) : (
                        <div className="h-2.5 w-2.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Type label + time */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wider ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-sm mb-0.5 ${
                          notif.read
                            ? "text-muted-foreground"
                            : "text-foreground font-semibold"
                        }`}
                      >
                        {notif.title}
                      </h4>

                      {/* Message */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notif.message}
                      </p>

                      {/* Action button */}
                      {notif.action_url && notif.action_label && (
                        <button className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer">
                          {notif.action_label}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Quick actions */}
                    <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notif)
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notif.id)
                        }}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────── */}
        {totalCount > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}