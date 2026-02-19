"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Repeat,
  Clock,
  Users,
  Trash2,
  Edit,
  Calendar,
  MoreVertical,
  Check,
  MapPin,
  AlertCircle,
  ChevronRight,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  isBefore,
  isAfter,
  subDays,
  addDays,
} from "date-fns";
import { cn } from "@/lib/utils";

import type { CalendarEntry } from "@/app/scheduler/calendar/types";
import {
  EntryModalProvider,
  useEntryModal,
} from "@/components/calendar/use-entry-modal";
import { ConnectedEntryModal } from "@/components/calendar/entry-modal";
import { ConnectedEntryDetailPopover } from "@/components/calendar/entry-detail-popover";

// ============================================
// CONSTANTS & HELPERS
// ============================================

const eventTypeIcons: Record<string, any> = {
  event: Users,
  task: CheckSquare,
};

const eventTypeColors: Record<string, string> = {
  event: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  task: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
};

function formatEventDate(dateStr: string, allDay = false, timezone?: string | null): string {
  const date = new Date(dateStr);

  // Short timezone label, e.g. "ET", "PT", "CST" — always show for timed events
  let tzLabel = "";
  if (!allDay) {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      tzLabel = " " + (new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "short",
      })
        .formatToParts(date)
        .find((p) => p.type === "timeZoneName")?.value || "");
    } catch {
      // Invalid timezone — skip
    }
  }

  if (allDay) {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM d");
  }
  if (isToday(date)) return `Today at ${format(date, "HH:mm")}${tzLabel}`;
  if (isTomorrow(date)) return `Tomorrow at ${format(date, "HH:mm")}${tzLabel}`;
  if (isThisWeek(date)) return format(date, "EEEE 'at' HH:mm") + tzLabel;
  return format(date, "MMM d 'at' HH:mm") + tzLabel;
}

function getRecurrenceSummary(entry: CalendarEntry): string | null {
  if (!entry.is_recurring) return null;

  const interval = entry.recurrence_interval || 1;
  const pattern = entry.recurrence_freq || "weekly";

  let summary = `Every ${interval > 1 ? interval + " " : ""}${
    pattern === "daily"
      ? interval > 1
        ? "days"
        : "day"
      : pattern === "weekly"
        ? interval > 1
          ? "weeks"
          : "week"
        : pattern === "monthly"
          ? interval > 1
            ? "months"
            : "month"
          : pattern === "yearly"
            ? interval > 1
              ? "years"
              : "year"
            : "occurrence"
  }`;

  if (entry.recurrence_end) {
    summary += ` until ${format(new Date(entry.recurrence_end), "MMM d, yyyy")}`;
  }

  return summary;
}

// ============================================
// EVENT CARD COMPONENT
// ============================================

interface EventCardProps {
  entry: CalendarEntry;
  user: string;
  compact?: boolean;
  onCardClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
}

function EventCard({
  entry,
  user,
  compact = false,
  onCardClick,
  onEdit,
  onDelete,
  onComplete,
}: EventCardProps) {
  const Icon = eventTypeIcons[entry.type];
  const startPassed = isBefore(new Date(entry.start_time), new Date());
  // Recurring entries with future occurrences should not appear "past"
  // recurrence_end can be null, undefined, or empty string — all mean "indefinite"
  const recEnd = entry.recurrence_end && entry.recurrence_end.trim() ? entry.recurrence_end : null;
  const hasMore = entry.is_recurring && (!recEnd || isAfter(new Date(recEnd), new Date()));
  const isPast = startPassed && !hasMore;
  const isCompleted = entry.is_completed;

  return (
    <div
      onClick={onCardClick}
      className={cn(
        "group relative bg-card border rounded-xl overflow-hidden transition-all hover:shadow-md",
        onCardClick && "cursor-pointer",
        (isPast || isCompleted) && "opacity-60",
        compact && "py-3",
      )}
    >
      {/* Color strip */}
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: entry.color }}
      />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn("p-1.5 rounded-lg", eventTypeColors[entry.type])}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-semibold text-foreground truncate",
                    compact ? "text-sm" : "text-base",
                    isCompleted && "line-through",
                  )}
                >
                  {entry.title}
                </h3>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatEventDate(entry.start_time, entry.all_day, entry.timezone)}</span>
              {entry.all_day && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  All day
                </span>
              )}
            </div>

            {/* Description */}
            {!compact && entry.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {entry.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {entry.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">
                    {entry.location}
                  </span>
                </div>
              )}

              {entry.is_recurring && (
                <div className="flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{getRecurrenceSummary(entry)}</span>
                </div>
              )}

              {isCompleted && (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isCompleted && !isPast && entry.type === "task" && (
                <>
                  <DropdownMenuItem onClick={onComplete}>
                    <Check className="w-4 h-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ScheduleTab() {
  const supabase = createClient();
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showAllPast, setShowAllPast] = useState(false);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({ id: user.id, email: user.email || "" });
      }
    };
    fetchUser();
  }, [supabase]);

  // Fetch calendar entries
  const fetchEntries = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsSyncing(true);
      setSyncError(null);

      const { data, error } = await supabase
        .from("calendar_entries")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("start_time", { ascending: true });

      if (error) throw error;

      setEntries(data || []);
      setIsLoaded(true);
    } catch (err: any) {
      console.error("Error fetching calendar entries:", err);
      setSyncError(err.message || "Failed to load entries");
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, supabase]);

  useEffect(() => {
    if (currentUser) fetchEntries();
  }, [currentUser, fetchEntries]);

  // Set up realtime subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel("calendar_entries_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_entries",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          fetchEntries();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchEntries, supabase]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading schedule...</span>
        </div>
      </div>
    );
  }

  return (
    <EntryModalProvider
      userId={currentUser?.id}
      defaultEntryOverrides={{ source: "meeting" }}
      onMutate={fetchEntries}
      forceEntryType="meeting"
    >
      <ScheduleTabInner
        entries={entries}
        currentUser={currentUser}
        isSyncing={isSyncing}
        syncError={syncError}
        showAllPast={showAllPast}
        setShowAllPast={setShowAllPast}
        fetchEntries={fetchEntries}
      />
    </EntryModalProvider>
  );
}

// ============================================
// INNER COMPONENT (has access to useEntryModal)
// ============================================

interface ScheduleTabInnerProps {
  entries: CalendarEntry[];
  currentUser: { id: string; email: string } | null;
  isSyncing: boolean;
  syncError: string | null;
  showAllPast: boolean;
  setShowAllPast: (fn: (v: boolean) => boolean) => void;
  fetchEntries: () => Promise<void>;
}

function ScheduleTabInner({
  entries,
  currentUser,
  isSyncing,
  syncError,
  showAllPast,
  setShowAllPast,
  fetchEntries,
}: ScheduleTabInnerProps) {
  const { open: openModal, preview: previewEntry, toggleComplete } = useEntryModal();
  const supabase = createClient();

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const thirtyDaysFromNow = addDays(now, 30);

  /**
   * Returns true if a recurring entry still has at least one future occurrence.
   * - Non-recurring: just checks start_time > now
   * - Recurring with no end date: always has future occurrences
   * - Recurring with end date: future if recurrence_end > now
   */
  const hasFutureOccurrences = (e: CalendarEntry): boolean => {
    if (!e.is_recurring) return isAfter(new Date(e.start_time), now);
    const recEnd = e.recurrence_end && e.recurrence_end.trim() ? e.recurrence_end : null;
    if (!recEnd) return true; // repeats indefinitely
    return isAfter(new Date(recEnd), now);
  };

  const upcomingEntries = useMemo(() => {
    return entries
      .filter(
        (e) =>
          !e.is_completed &&
          hasFutureOccurrences(e) &&
          e.source == "meeting"
      )
      .sort(
        (a, b) => {
          // For recurring entries whose start_time is in the past,
          // sort by next occurrence (approximated by now) so they
          // don't float to the top above truly-soon entries.
          const aTime = Math.max(new Date(a.start_time).getTime(), now.getTime());
          const bTime = Math.max(new Date(b.start_time).getTime(), now.getTime());
          return aTime - bTime;
        },
      );
  }, [entries, now]);

  const pastEntries = useMemo(() => {
    return entries
      .filter((e) => {
        if (e.source !== "meeting") return false;
        const startTime = new Date(e.start_time);

        // Completed entries are always "past"
        if (e.is_completed) {
          return isAfter(startTime, thirtyDaysAgo);
        }

        // Recurring entries with future occurrences stay in upcoming
        if (hasFutureOccurrences(e)) return false;

        // Non-recurring or fully-elapsed recurring: past if start < now
        return isBefore(startTime, now) && isAfter(startTime, thirtyDaysAgo);
      })
      .sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
      );
  }, [entries, now, thirtyDaysAgo]);

  // Badge count: only meetings with a next occurrence within 30 days
  const upcomingCount = upcomingEntries.filter((e) => {
    if (!e.is_recurring || isAfter(new Date(e.start_time), now)) {
      // Non-recurring or hasn't started yet: check start_time
      return isBefore(new Date(e.start_time), thirtyDaysFromNow);
    }
    // Recurring that already started: it recurs, so next occurrence is ~now
    return true;
  }).length;

  const visiblePastEntries = showAllPast
    ? pastEntries
    : pastEntries.slice(0, 3);

  // Simple delete handler (doesn't need modal state)
  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("calendar_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchEntries();
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  // Simple complete handler
  const handleCompleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("calendar_entries")
        .update({ is_completed: true })
        .eq("id", id);
      if (error) throw error;
      await fetchEntries();
    } catch (err) {
      console.error("Error completing entry:", err);
    }
  };

  return (
    <>
      <TabsContent value="schedule" className="space-y-6">
        {/* Upcoming Events */}
        {upcomingEntries.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Upcoming Meetings
                </h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {upcomingCount}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Meeting
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEntries.slice(0, 3).map((entry) => (
                <EventCard
                  key={entry.id}
                  entry={entry}
                  user={currentUser?.id || ""}
                  onCardClick={() => previewEntry(entry)}
                  onEdit={() => openModal(entry)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                  onComplete={() => handleCompleteEntry(entry.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-card border rounded-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No upcoming meetings
            </h3>
            <p className="text-muted-foreground mb-6">
              Schedule meetings and tasks to stay organized
            </p>
            <Button onClick={() => openModal()}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Your First Meeting
            </Button>
          </div>
        )}

        {/* Past / Completed Events */}
        {pastEntries.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Past Meetings (Last 30 Days)
                </h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {pastEntries.length}
                </span>
              </div>
              {pastEntries.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllPast((v: boolean) => !v)}
                  className="text-muted-foreground"
                >
                  {showAllPast ? "Show less" : `Show all ${pastEntries.length}`}
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 ml-1 transition-transform",
                      showAllPast && "rotate-90",
                    )}
                  />
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePastEntries.map((entry) => (
                <EventCard
                  key={entry.id}
                  entry={entry}
                  user={currentUser?.id || ""}
                  compact
                  onCardClick={() => previewEntry(entry)}
                  onEdit={() => openModal(entry)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                  onComplete={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      {/* The self-wired modal — no props needed */}
      <ConnectedEntryModal />
      <ConnectedEntryDetailPopover />

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
    </>
  );
}