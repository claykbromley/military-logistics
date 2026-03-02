"use client"

import React from "react"

import { Check, ChevronDown, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChecklistProgress } from "@/hooks/use-checklist-progress"
import { Button } from "@/components/ui/button"

interface ChecklistItem {
  id: string
  label: string
  description?: string
}

interface ChecklistSectionProps {
  title: string
  category: string
  icon: React.ReactNode
  items: ChecklistItem[]
  defaultOpen?: boolean
}

export function ChecklistSection({
  title,
  category,
  icon,
  items,
  defaultOpen = false,
}: ChecklistSectionProps) {
  const { isLoaded, toggleItem, isItemCompleted, getCategoryProgress, resetCategory } =
    useChecklistProgress()

  const { completed: completedCount, total: totalCount, percentage: progress } = getCategoryProgress(
    category,
    items.length
  )

  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  if (!isLoaded) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted dark:bg-background " />
            <div className="space-y-2">
              <div className="h-5 w-24 bg-muted dark:bg-background rounded" />
              <div className="h-4 w-32 bg-muted dark:bg-background rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-muted/50 transition-colors text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-2 bg-muted dark:bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-10">{progress}%</span>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border dark:border-slate-500">
          <div className="p-3 bg-muted/30 dark:bg-background border-b border-border dark:border-slate-500 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {progress === 100 ? (
                <span className="text-accent font-medium">All items completed!</span>
              ) : (
                `${totalCount - completedCount} items remaining`
              )}
            </span>
            {completedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  resetCategory(category)
                }}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const isChecked = isItemCompleted(category, item.id)
              return (
                <li key={item.id}>
                  <button
                    onClick={() => toggleItem(category, item.id)}
                    className="w-full flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors border-accent",
                        isChecked && "bg-accent text-accent-foreground"
                      )}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <span
                        className={cn(
                          "block text-foreground transition-colors",
                          isChecked && "line-through text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-sm text-muted-foreground mt-1 block">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
