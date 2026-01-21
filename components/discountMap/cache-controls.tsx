"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Database } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CacheControlsProps {
  cacheStats: { entries: number; size: string }
  onClearCache: () => void
}

export function CacheControls({ cacheStats, onClearCache }: CacheControlsProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {cacheStats.entries} cached {cacheStats.entries === 1 ? "location" : "locations"} ({cacheStats.size})
        </span>
      </div>
      {cacheStats.entries > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Cache
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear cached results?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all {cacheStats.entries} cached location{cacheStats.entries !== 1 ? "s" : ""}. New
                searches will require fresh API calls.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onClearCache}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear Cache
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
