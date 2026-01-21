"use client"

import type { Business } from "@/lib/known-chains"
import { CATEGORY_COLORS } from "@/lib/known-chains"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Percent, Info } from "lucide-react"

interface ResultsListProps {
  businesses: Business[]
  selectedBusiness: Business | null
  onBusinessSelect: (business: Business) => void
  isLoading: boolean
}

export function ResultsList({ businesses, selectedBusiness, onBusinessSelect, isLoading }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg h-32" />
          </div>
        ))}
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No businesses found</h3>
        <p className="text-muted-foreground text-sm">
          Try searching for a different location or adjusting your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {businesses.map((business) => {
        const color = CATEGORY_COLORS[business.category] || "#6b7280"
        const isSelected = selectedBusiness?.id === business.id

        return (
          <Card
            key={business.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? "ring-2 ring-primary shadow-md" : ""
            }`}
            onClick={() => onBusinessSelect(business)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{business.name}</h3>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-xs"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {business.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{business.address}</span>
                  </div>
                  <div
                    className="p-3 rounded-md"
                    style={{ backgroundColor: `${color}10`, borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Percent className="h-4 w-4" style={{ color }} />
                      <span className="font-medium text-sm">{business.discount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Info className="h-3 w-3" />
                      <span>{business.note}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
