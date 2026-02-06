"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Clock,
  Calendar as CalendarIcon,
  AlertCircle
} from "lucide-react"
import { Header } from "@/components/header"
import { supabase, createEvent, deleteEvent, fetchAllEvents, getCurrentUser, updateEvent } from "@/lib/supabase-calendar";

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Federal Holidays for 2024-2026
const FEDERAL_HOLIDAYS = [
  // 2024
  { date: '2024-01-01', name: "New Year's Day" },
  { date: '2024-01-15', name: "Martin Luther King Jr. Day" },
  { date: '2024-02-19', name: "Presidents' Day" },
  { date: '2024-05-27', name: "Memorial Day" },
  { date: '2024-06-19', name: "Juneteenth" },
  { date: '2024-07-04', name: "Independence Day" },
  { date: '2024-09-02', name: "Labor Day" },
  { date: '2024-10-14', name: "Columbus Day" },
  { date: '2024-11-11', name: "Veterans Day" },
  { date: '2024-11-28', name: "Thanksgiving Day" },
  { date: '2024-12-25', name: "Christmas Day" },
  
  // 2025
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-01-20', name: "Martin Luther King Jr. Day" },
  { date: '2025-02-17', name: "Presidents' Day" },
  { date: '2025-05-26', name: "Memorial Day" },
  { date: '2025-06-19', name: "Juneteenth" },
  { date: '2025-07-04', name: "Independence Day" },
  { date: '2025-09-01', name: "Labor Day" },
  { date: '2025-10-13', name: "Columbus Day" },
  { date: '2025-11-11', name: "Veterans Day" },
  { date: '2025-11-27', name: "Thanksgiving Day" },
  { date: '2025-12-25', name: "Christmas Day" },
  
  // 2026
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-01-19', name: "Martin Luther King Jr. Day" },
  { date: '2026-02-16', name: "Presidents' Day" },
  { date: '2026-05-25', name: "Memorial Day" },
  { date: '2026-06-19', name: "Juneteenth" },
  { date: '2026-07-04', name: "Independence Day" },  
  { date: '2026-09-07', name: "Labor Day" },
  { date: '2026-10-12', name: "Columbus Day" },
  { date: '2026-11-11', name: "Veterans Day" },
  { date: '2026-11-26', name: "Thanksgiving Day" },
  { date: '2026-12-25', name: "Christmas Day" },
];

interface CalendarEvent {
  id: string;
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState<CalendarEvent | null>(null);
  
  // Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '09:00',
    end_time: '10:00',
    is_all_day: false,
    is_multi_day: false,
    color: '#3b82f6'
  });

  // Simulated auth check - replace with actual Supabase auth
  useEffect(() => {
    // INTEGRATION: Uncomment to enable auth
    const checkAuth = async () => {
      const { user } = await getCurrentUser();
      setIsAuthenticated(!!user);
      if (user) {
        loadEvents(user.id);
      }
    };
    checkAuth();
    
    setIsAuthenticated(false);
  }, []);

  // Load events from Supabase
  const loadEvents = async (userId: string) => {
    // INTEGRATION: Uncomment to load events
    const { data, error } = await fetchAllEvents(userId);
    if (data && !error) {
      setEvents(data);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [year, month, startingDayOfWeek, daysInMonth]);

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = formatDateToString(date);
    return events.filter(event => {
      return event.start_date <= dateStr && event.end_date >= dateStr;
    });
  };

  const getFederalHolidayForDate = (date: Date): string | null => {
    const dateStr = formatDateToString(date);
    const holiday = FEDERAL_HOLIDAYS.find(h => h.date === dateStr);
    return holiday ? holiday.name : null;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateEvents = getEventsForDate(date);
    
    if (dateEvents.length === 1) {
      setShowEventDetails(dateEvents[0]);
    } else if (dateEvents.length > 1) {
      // Show list of events or just open create modal
      openCreateEventModal(date);
    } else {
      openCreateEventModal(date);
    }
  };

  const openCreateEventModal = (date?: Date) => {
    const targetDate = date || new Date();
    setEventForm({
      title: '',
      description: '',
      start_date: formatDateToString(targetDate),
      end_date: formatDateToString(targetDate),
      start_time: '09:00',
      end_time: '10:00',
      is_all_day: false,
      is_multi_day: false,
      color: '#3b82f6'
    });
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const openEditEventModal = (event: CalendarEvent) => {
    setEventForm({
      title: event.title,
      description: event.description || '',
      start_date: event.start_date,
      end_date: event.end_date,
      start_time: event.start_time || '09:00',
      end_time: event.end_time || '10:00',
      is_all_day: event.is_all_day,
      is_multi_day: event.is_multi_day,
      color: event.color || '#3b82f6'
    });
    setEditingEvent(event);
    setShowEventModal(true);
    setShowEventDetails(null);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim()) {
      alert('Please enter an event title');
      return;
    }

    const newEvent: CalendarEvent = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: eventForm.title,
      description: eventForm.description,
      start_date: eventForm.start_date,
      end_date: eventForm.end_date,
      start_time: eventForm.is_all_day ? undefined : eventForm.start_time,
      end_time: eventForm.is_all_day ? undefined : eventForm.end_time,
      is_all_day: eventForm.is_all_day,
      is_multi_day: eventForm.is_multi_day,
      color: eventForm.color
    };

    if (editingEvent) {
      // Update existing event
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? newEvent : e));
      
      // INTEGRATION: Uncomment to update in Supabase
      if (isAuthenticated) {
        await updateEvent(editingEvent.id, {
          title: eventForm.title,
          description: eventForm.description,
          start_date: eventForm.start_date,
          end_date: eventForm.end_date,
          start_time: eventForm.is_all_day ? undefined : eventForm.start_time,
          end_time: eventForm.is_all_day ? undefined : eventForm.end_time,
          is_all_day: eventForm.is_all_day,
          is_multi_day: eventForm.is_multi_day,
          color: eventForm.color
        });
      }
    } else {
      // Create new event
      setEvents(prev => [...prev, newEvent]);
      
      // INTEGRATION: Uncomment to save to Supabase
      if (isAuthenticated && user) {
        await createEvent(user.id, {
          title: eventForm.title,
          description: eventForm.description,
          start_date: eventForm.start_date,
          end_date: eventForm.end_date,
          start_time: eventForm.is_all_day ? undefined : eventForm.start_time,
          end_time: eventForm.is_all_day ? undefined : eventForm.end_time,
          is_all_day: eventForm.is_all_day,
          is_multi_day: eventForm.is_multi_day,
          color: eventForm.color
        });
      }
    }

    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setEvents(prev => prev.filter(e => e.id !== eventId));
    setShowEventDetails(null);
    setShowEventModal(false);
    
    // INTEGRATION: Uncomment to delete from Supabase
    if (isAuthenticated) {
      await deleteEvent(eventId);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setEventForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-adjust end date for multi-day events
      if (field === 'is_multi_day' && !value) {
        updated.end_date = updated.start_date;
      }
      
      // When switching to all-day, clear times
      if (field === 'is_all_day' && value) {
        updated.start_time = '';
        updated.end_time = '';
      }
      
      // When enabling multi-day, default to all-day unless times are already set
      if (field === 'is_multi_day' && value && !updated.start_time) {
        updated.is_all_day = true;
      }
      
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* Header Placeholder - Replace with your actual header */}
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Calendar Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                MISSION CALENDAR
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                Plan your operations and track important dates
              </p>
            </div>

            <button
              onClick={() => openCreateEventModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              <Plus className="w-5 h-5" />
              NEW EVENT
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 shadow-lg">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </button>

            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {MONTH_NAMES[month]} {year}
              </h2>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors text-sm"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
              >
                Today
              </button>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Day Names */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="px-4 py-3 text-center font-bold text-sm text-slate-600 dark:text-slate-400 tracking-wider"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dateEvents = getEventsForDate(day.date);
              const holiday = getFederalHolidayForDate(day.date);
              const isCurrentDay = isToday(day.date);
              
              // Separate all-day and timed events for better display
              const allDayEvents = dateEvents.filter(e => e.is_all_day);
              const timedEvents = dateEvents.filter(e => !e.is_all_day);
              
              return (
                <div
                  key={index}
                  onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                  className={`min-h-[140px] border-r border-b border-slate-200 dark:border-slate-700 p-2 cursor-pointer transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 relative ${
                    !day.isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-40' : ''
                  } ${
                    isCurrentDay ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-sm font-bold ${
                      isCurrentDay 
                        ? 'bg-blue-600 dark:bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center'
                        : day.isCurrentMonth
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                    style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>

                  {/* Federal Holiday */}
                  {holiday && (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1.5 rounded-md truncate shadow-sm"
                           style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        🇺🇸 {holiday}
                      </div>
                    </div>
                  )}

                  {/* Events Container */}
                  <div className="space-y-1">
                    {/* All-Day Events - More Prominent Display */}
                    {allDayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEventDetails(event);
                        }}
                        className="text-[11px] font-bold text-white px-3 py-2 rounded-lg truncate hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm"
                        style={{ 
                          backgroundColor: event.color || '#3b82f6',
                          fontFamily: "'IBM Plex Sans', sans-serif"
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs opacity-90">●</span>
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Timed Events - Compact Display */}
                    {timedEvents.slice(0, allDayEvents.length >= 2 ? 1 : 3 - allDayEvents.length).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEventDetails(event);
                        }}
                        className="text-[10px] font-semibold text-white px-2 py-1 rounded-md truncate hover:opacity-90 transition-opacity border border-white/20"
                        style={{ 
                          backgroundColor: event.color || '#3b82f6',
                          fontFamily: "'IBM Plex Sans', sans-serif"
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] opacity-75">{event.start_time?.substring(0, 5)}</span>
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show "more" indicator if needed */}
                    {dateEvents.length > (allDayEvents.length >= 2 ? 3 : 4) && (
                      <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 px-2 pt-1">
                        +{dateEvents.length - (allDayEvents.length >= 2 ? 3 : 4)} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Not Logged In Notice */}
        {!isAuthenticated && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-6 py-4 backdrop-blur-sm">
            <p className="text-blue-700 dark:text-blue-400 text-sm text-center flex items-center justify-center gap-2"
               style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
              <AlertCircle className="w-4 h-4" />
              <span>
                <strong className="font-bold">Note:</strong> You're not logged in. Your events will reset when you refresh the page. Sign in to save your events.
              </span>
            </p>
          </div>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  {editingEvent ? 'EDIT EVENT' : 'CREATE EVENT'}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                         style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Enter event title"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                         style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Add event details..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                  />
                </div>

                {/* Event Type Toggles */}
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.is_all_day}
                        onChange={(e) => handleFormChange('is_all_day', e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        All-day event
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.is_multi_day}
                        onChange={(e) => handleFormChange('is_multi_day', e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        Multi-day event
                      </span>
                    </label>
                  </div>
                  
                  {eventForm.is_multi_day && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
                      <p className="text-xs text-blue-700 dark:text-blue-400"
                         style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        💡 Multi-day events are all-day by default. Uncheck "All-day event" if you need specific times for the first/last days.
                      </p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                           style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.start_date}
                      onChange={(e) => handleFormChange('start_date', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                    />
                  </div>

                  {eventForm.is_multi_day && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                             style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={eventForm.end_date}
                        onChange={(e) => handleFormChange('end_date', e.target.value)}
                        min={eventForm.start_date}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                      />
                    </div>
                  )}
                </div>

                {/* Times (only if not all-day) */}
                {!eventForm.is_all_day && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                             style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.start_time}
                        onChange={(e) => handleFormChange('start_time', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                             style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.end_time}
                        onChange={(e) => handleFormChange('end_time', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                )}

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                         style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    Event Color
                  </label>
                  <div className="flex gap-2">
                    {EVENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleFormChange('color', color.value)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          eventForm.color === color.value
                            ? 'ring-4 ring-offset-2 ring-blue-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                {editingEvent && (
                  <button
                    onClick={() => handleDeleteEvent(editingEvent.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                    style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors"
                    style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/30"
                    style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showEventDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700"
                   style={{ backgroundColor: showEventDetails.color + '20' }}>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white truncate"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  {showEventDetails.title}
                </h3>
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {showEventDetails.description && (
                  <div>
                    <p className="text-slate-700 dark:text-slate-300"
                       style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      {showEventDetails.description}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <CalendarIcon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      {showEventDetails.start_date === showEventDetails.end_date ? (
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                          {new Date(showEventDetails.start_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      ) : (
                        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                          <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Multi-day Event
                          </div>
                          <div className="text-sm">
                            {new Date(showEventDetails.start_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            {' → '}
                            {new Date(showEventDetails.end_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      {showEventDetails.is_all_day ? (
                        <span className="font-semibold">All day</span>
                      ) : showEventDetails.start_time && showEventDetails.end_time ? (
                        <>
                          {showEventDetails.start_time.substring(0, 5)} - {showEventDetails.end_time.substring(0, 5)}
                        </>
                      ) : (
                        <span className="font-semibold">All day</span>
                      )}
                    </span>
                  </div>
                  
                  {/* Event Type Badge */}
                  <div className="flex gap-2 pt-2">
                    {showEventDetails.is_all_day && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full"
                            style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        <span className="text-sm">●</span>
                        All-day
                      </span>
                    )}
                    {showEventDetails.is_multi_day && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full"
                            style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        <CalendarIcon className="w-3 h-3" />
                        Multi-day
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => openEditEventModal(showEventDetails)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Event
                </button>
                <button
                  onClick={() => handleDeleteEvent(showEventDetails.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Google Fonts Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700;900&family=IBM+Plex+Sans:wght@400;600;700&display=swap');
      `}</style>
    </div>
  )
}