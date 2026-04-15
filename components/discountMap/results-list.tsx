"use client"

import type { Business } from "@/lib/known-chains"
import { CATEGORY_COLORS } from "@/lib/known-chains"
import { Badge } from "@/components/ui/badge"
import { MapPin, Info, Tag } from "lucide-react"

interface ResultsListProps {
  businesses: Business[]
  selectedBusiness: Business | null
  onBusinessSelect: (business: Business) => void
  isLoading: boolean
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    restaurant: "🍽️", retail: "🛍️", automotive: "🚗",
    hotel: "🏨", entertainment: "🎯", fitness: "💪",
  }
  return emojis[category] || "📍"
}

export function ResultsList({ businesses, selectedBusiness, onBusinessSelect, isLoading }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-xl h-24" />
          </div>
        ))}
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <h3 className="font-semibold text-base mb-1">No businesses found</h3>
        <p className="text-muted-foreground text-sm">
          Try a different location or adjust your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
      {businesses.map((business) => {
        const color = CATEGORY_COLORS[business.category] || "#6b7280"
        const isSelected = selectedBusiness?.id === business.id
        const hasNote = business.note && business.note.trim().length > 0

        return (
          <div
            key={business.id}
            onClick={() => onBusinessSelect(business)}
            className={`group relative rounded-xl border bg-card p-3.5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] ${
              isSelected
                ? "ring-2 ring-primary shadow-md border-primary/30"
                : "border-border hover:border-border/80"
            }`}
          >
            {/* Color accent */}
            <div
              className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
              style={{ backgroundColor: color }}
            />

            <div className="pl-3">
              {/* Header: name + category */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
                  {business.name}
                </h3>
                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] font-medium px-1.5 py-0 h-5 border-0"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {getCategoryEmoji(business.category)} {business.category}
                </Badge>
              </div>

              {/* Address */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <MapPin className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{business.address}</span>
              </div>

              {/* Discount info */}
              <div
                className="rounded-lg px-3 py-2"
                style={{ backgroundColor: `${color}12` }}
              >
                <p className="text-sm font-medium text-foreground leading-snug">
                  {business.discount}
                </p>
                {hasNote && (
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <Info className="h-3 w-3 text-muted-foreground/50 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{business.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}