"use client"

import { CATEGORIES, CATEGORY_COLORS } from "@/lib/known-chains"
import { Button } from "@/components/ui/button"

interface CategoryFilterProps {
  selected: string
  onChange: (category: string) => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const isSelected = selected === category.value
        const color = category.value === "all" ? "#1e3a5f" : CATEGORY_COLORS[category.value]

        return (
          <Button
            key={category.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(category.value)}
            className="transition-all"
            style={{
              backgroundColor: isSelected ? color : undefined,
              borderColor: isSelected ? color : undefined,
              color: isSelected ? "white" : undefined,
            }}
          >
            {category.value !== "all" && <span className="mr-1">{getCategoryEmoji(category.value)}</span>}
            {category.label}
          </Button>
        )
      })}
    </div>
  )
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    restaurant: "🍽️",
    retail: "🛍️",
    automotive: "🚗",
    hotel: "🏨",
    entertainment: "🎯",
  }
  return emojis[category] || ""
}
