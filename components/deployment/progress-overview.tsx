"use client"

import { useChecklistProgress } from "@/hooks/use-checklist-progress"
import { Button } from "@/components/ui/button"
import { RotateCcw, CheckCircle2, Circle, Clock } from "lucide-react"

interface ProgressOverviewProps {
  categories: { category: string; label: string; totalItems: number }[]
}

export function ProgressOverview({ categories }: ProgressOverviewProps) {
  const { isLoaded, getOverallProgress, getCategoryProgress, resetAll } = useChecklistProgress()

  if (!isLoaded) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-4 w-full bg-muted rounded mb-6" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }

  const overall = getOverallProgress(categories)
  const allComplete = overall.percentage === 100

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {allComplete ? (
            <CheckCircle2 className="w-6 h-6 text-accent" />
          ) : (
            <Clock className="w-6 h-6 text-muted-foreground" />
          )}
          <div>
            <h3 className="font-semibold text-foreground">Overall Progress</h3>
            <p className="text-sm text-muted-foreground">
              {overall.completed} of {overall.total} items completed
            </p>
          </div>
        </div>
        {overall.completed > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset All
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-medium text-foreground">{overall.percentage}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${overall.percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map(({ category, label, totalItems }) => {
          const progress = getCategoryProgress(category, totalItems)
          const isComplete = progress.percentage === 100
          return (
            <div
              key={category}
              className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
            >
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {progress.completed}/{progress.total}
                </p>
              </div>
              <span className="text-sm font-medium text-foreground">{progress.percentage}%</span>
            </div>
          )
        })}
      </div>

      {allComplete && (
        <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">You're deployment ready!</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            All checklist items are complete. Review periodically to ensure everything stays current.
          </p>
        </div>
      )}
    </div>
  )
}
