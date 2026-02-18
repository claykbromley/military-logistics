// lib/supabase-calendar.ts
// Utility functions for calendar operations with Supabase

// IMPORTANT: Use your existing Supabase client, not a new one!
import { createClient } from '@/lib/supabase/client';

// Create a client instance that shares auth with the rest of your app
const getSupabase = () => createClient();

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
  start_time?: string; // HH:MM:SS format
  end_time?: string; // HH:MM:SS format
  is_all_day: boolean;
  is_multi_day: boolean;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  is_multi_day: boolean;
  color?: string;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log('🔐 [getCurrentUser] Auth check:', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message
  });
  
  return { user, error };
}

/**
 * Fetch all events for the current user
 */
export async function fetchAllEvents(userId: string) {
  console.log('📥 [fetchAllEvents] Fetching for user:', userId);
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true });

  console.log('📊 [fetchAllEvents] Result:', {
    count: data?.length || 0,
    error: error?.message
  });

  return { data, error };
}

/**
 * Fetch events for a specific month
 */
export async function fetchEventsForMonth(userId: string, year: number, month: number) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase.rpc('get_events_for_month', {
    p_user_id: userId,
    p_year: year,
    p_month: month
  });

  return { data, error };
}

/**
 * Fetch events for a specific date range
 */
export async function fetchEventsForDateRange(userId: string, startDate: string, endDate: string) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)
    .order('start_date', { ascending: true });

  return { data, error };
}

/**
 * Fetch events for a specific date
 */
export async function fetchEventsForDate(userId: string, date: string) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .lte('start_date', date)
    .gte('end_date', date)
    .order('start_time', { ascending: true, nullsFirst: false });

  return { data, error };
}

/**
 * Create a new calendar event
 */
export async function createEvent(userId: string, eventData: CreateEventInput) {
  console.log('➕ [createEvent] Creating event:', { userId, eventData });
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: userId,
      ...eventData
    })
    .select()
    .single();

  console.log('📊 [createEvent] Result:', {
    success: !!data,
    eventId: data?.id,
    error: error?.message,
    errorDetails: error
  });

  return { data, error };
}

/**
 * Update an existing calendar event
 */
export async function updateEvent(eventId: string, updates: Partial<CreateEventInput>) {
  console.log('📝 [updateEvent] Updating event:', { eventId, updates });
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();

  console.log('📊 [updateEvent] Result:', {
    success: !!data,
    error: error?.message
  });

  return { data, error };
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(eventId: string) {
  console.log('🗑️ [deleteEvent] Deleting event:', eventId);
  const supabase = getSupabase();
  
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);

  console.log('📊 [deleteEvent] Result:', {
    success: !error,
    error: error?.message
  });

  return { error };
}

/**
 * Subscribe to real-time changes for calendar events
 */
export function subscribeToEvents(userId: string, callback: (payload: any) => void) {
  console.log('🔔 [subscribeToEvents] Setting up subscription for user:', userId);
  const supabase = getSupabase();
  
  const subscription = supabase
    .channel('calendar_events_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'calendar_events',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return subscription;
}

/**
 * Helper function to format date for display
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper function to format time for display
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Helper function to parse date string
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

/**
 * Helper function to get events that occur on a specific date
 * (including multi-day events)
 */
export function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = formatDate(date);
  
  return events.filter(event => {
    return event.start_date <= dateStr && event.end_date >= dateStr;
  });
}

/**
 * Helper function to check if two date ranges overlap
 */
export function doEventsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 <= end2 && end1 >= start2;
}

/**
 * Helper function to get color for event
 */
export function getEventColor(event: CalendarEvent): string {
  return event.color || '#3b82f6';
}

/**
 * Helper function to format event time range
 */
export function formatEventTimeRange(event: CalendarEvent): string {
  if (event.is_all_day) {
    return 'All day';
  }
  
  if (event.start_time && event.end_time) {
    const start = event.start_time.substring(0, 5); // HH:MM
    const end = event.end_time.substring(0, 5); // HH:MM
    return `${start} - ${end}`;
  }
  
  return '';
}

/**
 * Helper function to format event date range
 */
export function formatEventDateRange(event: CalendarEvent): string {
  if (event.start_date === event.end_date) {
    return new Date(event.start_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  return `${new Date(event.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })} - ${new Date(event.end_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;
}