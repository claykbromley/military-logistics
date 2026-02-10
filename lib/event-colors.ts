export interface EventColor {
  name: string
  value: string
  bg: string
  bgHover: string
  text: string
  border: string
  dot: string
}

export const EVENT_COLORS: EventColor[] = [
  {
    name: "Sky",
    value: "sky",
    bg: "bg-sky-100 dark:bg-sky-900/40",
    bgHover: "hover:bg-sky-200 dark:hover:bg-sky-900/60",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-300 dark:border-sky-700",
    dot: "bg-sky-500",
  },
  {
    name: "Rose",
    value: "rose",
    bg: "bg-rose-100 dark:bg-rose-900/40",
    bgHover: "hover:bg-rose-200 dark:hover:bg-rose-900/60",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-300 dark:border-rose-700",
    dot: "bg-rose-500",
  },
  {
    name: "Amber",
    value: "amber",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    bgHover: "hover:bg-amber-200 dark:hover:bg-amber-900/60",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700",
    dot: "bg-amber-500",
  },
  {
    name: "Emerald",
    value: "emerald",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    bgHover: "hover:bg-emerald-200 dark:hover:bg-emerald-900/60",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    name: "Violet",
    value: "violet",
    bg: "bg-violet-100 dark:bg-violet-900/40",
    bgHover: "hover:bg-violet-200 dark:hover:bg-violet-900/60",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-300 dark:border-violet-700",
    dot: "bg-violet-500",
  },
  {
    name: "Teal",
    value: "teal",
    bg: "bg-teal-100 dark:bg-teal-900/40",
    bgHover: "hover:bg-teal-200 dark:hover:bg-teal-900/60",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-300 dark:border-teal-700",
    dot: "bg-teal-500",
  },
  {
    name: "Orange",
    value: "orange",
    bg: "bg-orange-100 dark:bg-orange-900/40",
    bgHover: "hover:bg-orange-200 dark:hover:bg-orange-900/60",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-300 dark:border-orange-700",
    dot: "bg-orange-500",
  },
  {
    name: "Pink",
    value: "pink",
    bg: "bg-pink-100 dark:bg-pink-900/40",
    bgHover: "hover:bg-pink-200 dark:hover:bg-pink-900/60",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-300 dark:border-pink-700",
    dot: "bg-pink-500",
  },
]

// Navy is reserved for federal holidays only
export const HOLIDAY_STYLE = {
  bg: "bg-primary/10 dark:bg-primary/20",
  bgHover: "",
  text: "text-primary dark:text-primary-foreground/80",
  border: "border-primary/25 dark:border-primary/40",
  dot: "bg-primary",
}

// Gold dot for user events on mini calendar
export const GOLD_DOT = "bg-amber-500 dark:bg-amber-400"

// Completed event overlay styling
export const COMPLETED_STYLE = {
  overlay: "opacity-50",
  title: "line-through",
}

export function getEventColor(colorValue?: string): EventColor {
  return (
    EVENT_COLORS.find((c) => c.value === colorValue) || EVENT_COLORS[0]
  )
}

/** Format time to military format HH:MM (strip seconds if present) */
export function formatMilitaryTime(time?: string | null): string {
  if (!time) return ""
  // Handle HH:MM:SS or HH:MM
  return time.slice(0, 5)
}
