"use client"

import { CATEGORIES, CATEGORY_COLORS } from "@/lib/known-chains"
import { Button } from "@/components/ui/button"

interface CategoryFilterProps {
  selected: string[]
  onChange: (categories: string[]) => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const handleCategoryClick = (categoryValue: string) => {
    if (categoryValue === "all") {
      // If "all" is clicked, clear all selections (show all)
      onChange([])
    } else {
      // Toggle the category
      if (selected.includes(categoryValue)) {
        // Remove it
        onChange(selected.filter((c) => c !== categoryValue))
      } else {
        // Add it
        onChange([...selected, categoryValue])
      }
    }
  }

  const isAllSelected = selected.length === 0

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const isSelected = category.value === "all" ? isAllSelected : selected.includes(category.value)
        const color = category.value === "all" ? "#1e3a5f" : CATEGORY_COLORS[category.value]

        return (
          <Button
            key={category.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category.value)}
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
