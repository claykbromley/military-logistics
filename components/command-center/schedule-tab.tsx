"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Repeat,
  Clock,
  Phone,
  Video,
  Users,
  Trash2,
  Edit,
  Calendar,
  Bell,
  MoreVertical,
  Check,
  ExternalLink,
  MapPin,
  Link as LinkIcon,
  AlertCircle,
  ChevronRight,
  SkipForward,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  addDays,
  parseISO,
  isBefore,
  isAfter,
  subDays,
} from "date-fns";
import { cn } from "@/lib/utils";

// Import the CalendarEntry and EntryFormData types
import type { CalendarEntry, EntryFormData, EntryType, RecurrenceFreq } from "@/app/scheduler/calendar/types";

// Import the EntryModal
import { EntryModal } from "@/components/calendar/entry-modal";

// ============================================
// CONSTANTS
// ============================================

const eventTypeIcons: Record<string, any> = {
  event: Users,
  task: CheckSquare,
};

const eventTypeColors: Record<string, string> = {
  event: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  task: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
};

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return `Today at ${format(date, "HH:mm")}`;
  if (isTomorrow(date)) return `Tomorrow at ${format(date, "HH:mm")}`;
  if (isThisWeek(date)) return format(date, "EEEE 'at' HH:mm");
  return format(date, "MMM d 'at' HH:mm");
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
// CONVERSION HELPERS
// ============================================

function entryToFormData(entry: CalendarEntry): EntryFormData {
  const startDt = new Date(entry.start_time);
  const endDt = entry.end_time ? new Date(entry.end_time) : startDt;
  
  return {
    type: entry.type,
    title: entry.title,
    description: entry.description || "",
    color: entry.color,
    start_date: format(startDt, "yyyy-MM-dd"),
    start_time: entry.all_day ? "" : format(startDt, "HH:mm"),
    end_date: format(endDt, "yyyy-MM-dd"),
    end_time: entry.all_day ? "" : format(endDt, "HH:mm"),
    all_day: entry.all_day,
    is_recurring: entry.is_recurring,
    recurrence_freq: entry.recurrence_freq || "weekly",
    recurrence_interval: entry.recurrence_interval || 1,
    recurrence_days: entry.recurrence_days || [],
    recurrence_end: entry.recurrence_end ? format(new Date(entry.recurrence_end), "yyyy-MM-dd") : "",
    location: entry.location || "",
  };
}

function formDataToEntry(formData: EntryFormData, userId: string, entryId?: string): Partial<CalendarEntry> {
  const startTime = formData.all_day
    ? new Date(`${formData.start_date}T00:00:00`).toISOString()
    : new Date(`${formData.start_date}T${formData.start_time || "00:00"}`).toISOString();
  
  const endTime = formData.all_day
    ? new Date(`${formData.end_date}T23:59:59`).toISOString()
    : formData.type === "event" && formData.end_time
      ? new Date(`${formData.end_date}T${formData.end_time}`).toISOString()
      : new Date(`${formData.start_date}T${formData.start_time || "00:00"}`).toISOString();

  return {
    ...(entryId && { id: entryId }),
    user_id: userId,
    type: formData.type,
    title: formData.title,
    description: formData.description || null,
    color: formData.color,
    start_time: startTime,
    end_time: endTime,
    all_day: formData.all_day,
    location: formData.location || null,
    is_recurring: formData.is_recurring,
    recurrence_freq: formData.is_recurring ? formData.recurrence_freq : null,
    recurrence_interval: formData.is_recurring ? formData.recurrence_interval : 1,
    recurrence_days: formData.is_recurring && formData.recurrence_freq === "weekly" ? formData.recurrence_days : null,
    recurrence_end: formData.is_recurring && formData.recurrence_end 
      ? new Date(formData.recurrence_end).toISOString() 
      : null,
    is_completed: false,
  };
}

function getDefaultFormData(date?: string): EntryFormData {
  const now = new Date();
  const startDate = date || format(now, "yyyy-MM-dd");
  
  return {
    type: "event",
    title: "",
    description: "",
    color: "#3b82f6",
    start_date: startDate,
    start_time: format(now, "HH:mm"),
    end_date: startDate,
    end_time: format(addDays(now, 0), "HH:mm"),
    all_day: false,
    is_recurring: false,
    recurrence_freq: "weekly",
    recurrence_interval: 1,
    recurrence_days: [],
    recurrence_end: "",
    location: "",
  };
}

// ============================================
// EVENT CARD COMPONENT
// ============================================

interface EventCardProps {
  entry: CalendarEntry;
  user: string;
  compact?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
}

function EventCard({
  entry,
  user,
  compact = false,
  onEdit,
  onDelete,
  onComplete,
}: EventCardProps) {
  const Icon = eventTypeIcons[entry.type];
  const isPast = isBefore(new Date(entry.start_time), new Date());
  const isCompleted = entry.is_completed;

  return (
    <div
      className={cn(
        "group relative bg-card border rounded-xl overflow-hidden transition-all hover:shadow-md",
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
              <div className={cn("p-1.5 rounded-lg", eventTypeColors[entry.type])}>
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
              <span>{formatEventDate(entry.start_time)}</span>
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
                  <span className="truncate max-w-[150px]">{entry.location}</span>
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
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ScheduleTab() {
  const supabase = createClient();
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showAllPast, setShowAllPast] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [formData, setFormData] = useState<EntryFormData>(getDefaultFormData());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
    if (currentUser) {
      fetchEntries();
    }
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

  // Filter upcoming and past entries
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const upcomingEntries = useMemo(() => {
    return entries
      .filter((e) => !e.is_completed && isAfter(new Date(e.start_time), now))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [entries, now]);

  const pastEntries = useMemo(() => {
    return entries
      .filter((e) => {
        const startTime = new Date(e.start_time);
        return (
          (e.is_completed || isBefore(startTime, now)) &&
          isAfter(startTime, thirtyDaysAgo)
        );
      })
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [entries, now, thirtyDaysAgo]);

  const visiblePastEntries = showAllPast ? pastEntries : pastEntries.slice(0, 6);

  // Handle opening modal for new or editing entry
  const openModal = (entry?: CalendarEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData(entryToFormData(entry));
    } else {
      setEditingEntry(null);
      setFormData(getDefaultFormData());
    }
    setShowDeleteConfirm(false);
    setIsEventDialogOpen(true);
  };

  const closeModal = () => {
    setIsEventDialogOpen(false);
    setEditingEntry(null);
    setShowDeleteConfirm(false);
    setFormData(getDefaultFormData());
  };

  // Handle save
  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setIsSyncing(true);
      setSyncError(null);

      const payload = formDataToEntry(formData, currentUser.id, editingEntry?.id);

      if (editingEntry) {
        // Update existing
        const { error } = await supabase
          .from("calendar_entries")
          .update(payload)
          .eq("id", editingEntry.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("calendar_entries")
          .insert([payload]);

        if (error) throw error;
      }

      await fetchEntries();
      closeModal();
    } catch (err: any) {
      console.error("Error saving entry:", err);
      setSyncError(err.message || "Failed to save entry");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle delete
  const handleDeleteEntry = async (id: string) => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      const { error } = await supabase
        .from("calendar_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchEntries();
    } catch (err: any) {
      console.error("Error deleting entry:", err);
      setSyncError(err.message || "Failed to delete entry");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingEntry) return;
    await handleDeleteEntry(editingEntry.id);
    closeModal();
  };

  // Handle complete
  const handleCompleteEntry = async (id: string) => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      const { error } = await supabase
        .from("calendar_entries")
        .update({ is_completed: true })
        .eq("id", id);

      if (error) throw error;

      await fetchEntries();
    } catch (err: any) {
      console.error("Error completing entry:", err);
      setSyncError(err.message || "Failed to complete entry");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">
            Loading schedule...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <TabsContent value="schedule" className="space-y-6">
        {/* Upcoming Events */}
        {upcomingEntries.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Upcoming Events
                </h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {upcomingEntries.length}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEntries.map((entry) => (
                <EventCard
                  key={entry.id}
                  entry={entry}
                  user={currentUser?.id || ""}
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
              No upcoming events
            </h3>
            <p className="text-muted-foreground mb-6">
              Schedule events and tasks to stay organized
            </p>
            <Button
              onClick={() => openModal()}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Your First Event
            </Button>
          </div>
        )}

        {/* Past / Completed Events */}
        {pastEntries.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Past Events (Last 30 Days)
                </h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {pastEntries.length}
                </span>
              </div>
              {pastEntries.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllPast((v) => !v)}
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
                  onEdit={() => openModal(entry)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                  onComplete={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      {/* Entry Modal */}
      <EntryModal
        open={isEventDialogOpen}
        editingEntry={editingEntry}
        formData={formData}
        saving={isSyncing}
        showDeleteConfirm={showDeleteConfirm}
        onFormChange={setFormData}
        onSave={handleSave}
        onDelete={handleDeleteFromModal}
        onClose={closeModal}
        onShowDeleteConfirm={setShowDeleteConfirm}
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
    </>
  );
}