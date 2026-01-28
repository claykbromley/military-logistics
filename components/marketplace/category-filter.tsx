"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CATEGORIES, type Category } from "@/lib/types"
import { Shirt, Target, Laptop, Sofa, Car, Home, ShoppingBag, Dumbbell, MoreHorizontal } from "lucide-react"

const categoryIcons: Record<Category, React.ReactNode> = {
  uniforms: <Shirt className="h-4 w-4" />,
  "tactical-gear": <Target className="h-4 w-4" />,
  electronics: <Laptop className="h-4 w-4" />,
  furniture: <Sofa className="h-4 w-4" />,
  vehicles: <Car className="h-4 w-4" />,
  household: <Home className="h-4 w-4" />,
  clothing: <ShoppingBag className="h-4 w-4" />,
  sports: <Dumbbell className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
}

interface CategoryFilterProps {
  selectedCategory: Category | null
  onCategoryChange: (category: Category | null) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-4">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(null)}
        >
          All
        </Button>
        {CATEGORIES.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.value)}
            className="gap-2"
          >
            {categoryIcons[category.value]}
            {category.label}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
