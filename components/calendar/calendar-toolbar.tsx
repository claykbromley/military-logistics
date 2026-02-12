"use client"

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ExternalLink,
  Sun,
  LayoutGrid,
  Calendar as CalendarIcon,
  List,
} from "lucide-react"
import type { CalendarView } from "../../app/scheduler/calendar/types"

const VIEW_OPTIONS: { key: CalendarView; icon: typeof Sun; label: string }[] = [
  { key: "day", icon: Sun, label: "Day" },
  { key: "week", icon: LayoutGrid, label: "Week" },
  { key: "month", icon: CalendarIcon, label: "Month" },
  { key: "year", icon: List, label: "Year" },
]

interface CalendarToolbarProps {
  title: string
  view: CalendarView
  hasUser: boolean
  onViewChange: (v: CalendarView) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onCreateClick: () => void
  onIcalClick: () => void
}

export function CalendarToolbar({
  title,
  view,
  hasUser,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onCreateClick,
  onIcalClick,
}: CalendarToolbarProps) {
  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-16 z-40">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToday}
              className="px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors cursor-pointer text-foreground"
            >
              Today
            </button>
            <div className="flex items-center">
              <button
                onClick={onPrev}
                className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={onNext}
                className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">
              {title}
            </h1>
          </div>

          {/* Right: View switcher + actions */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
              {VIEW_OPTIONS.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => onViewChange(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    view === key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {hasUser && (
              <button
                onClick={onIcalClick}
                className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                title="Subscribe to calendar"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {hasUser && (
              <button
                onClick={onCreateClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}