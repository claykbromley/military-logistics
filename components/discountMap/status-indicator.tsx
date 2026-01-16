"use client"

import { Database, Cloud, AlertCircle, CheckCircle2 } from "lucide-react"

interface StatusIndicatorProps {
  status: "idle" | "searching" | "cached" | "error"
  message?: string
  cacheStats?: { entries: number; size: string }
}

export function StatusIndicator({ status, message, cacheStats }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "searching":
        return {
          icon: Cloud,
          text: message || "Searching via API...",
          bg: "bg-amber-50",
          border: "border-amber-200",
          iconColor: "text-amber-600",
          textColor: "text-amber-800",
        }
      case "cached":
        return {
          icon: Database,
          text: message || "Using cached results",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          iconColor: "text-emerald-600",
          textColor: "text-emerald-800",
        }
      case "error":
        return {
          icon: AlertCircle,
          text: message || "An error occurred",
          bg: "bg-red-50",
          border: "border-red-200",
          iconColor: "text-red-600",
          textColor: "text-red-800",
        }
      default:
        return {
          icon: CheckCircle2,
          text: "Ready to search",
          bg: "bg-muted",
          border: "border-border",
          iconColor: "text-muted-foreground",
          textColor: "text-muted-foreground",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`flex items-center justify-between px-4 py-2 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.iconColor} ${status === "searching" ? "animate-pulse" : ""}`} />
        <span className={`text-sm ${config.textColor}`}>{config.text}</span>
      </div>
      {cacheStats && cacheStats.entries > 0 && (
        <span className="text-xs text-muted-foreground">
          Cache: {cacheStats.entries} locations ({cacheStats.size})
        </span>
      )}
    </div>
  )
}
