'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, 
  ChevronRight, 
  MessageSquare, 
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  link?: {
    url: string
    label: string
  }
  priority?: 'high' | 'medium' | 'low'
  estimatedTime?: string
}

export interface ChecklistSection {
  id: string
  title: string
  description?: string
  items: ChecklistItem[]
  timeframe?: string
}

interface ChecklistProps {
  sections: ChecklistSection[]
  progress?: Record<string, { completed: boolean; notes?: string }>
  onToggle?: (itemId: string, completed: boolean) => void
  onNotesChange?: (itemId: string, notes: string) => void
  isAuthenticated?: boolean
}

export function Checklist({
  sections,
  progress = {},
  onToggle,
  onNotesChange,
  isAuthenticated = false,
}: ChecklistProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  )
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const toggleNotes = (itemId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const getSectionProgress = (section: ChecklistSection) => {
    const completed = section.items.filter((item) => progress[item.id]?.completed).length
    return { completed, total: section.items.length }
  }

  const totalProgress = sections.reduce(
    (acc, section) => {
      const { completed, total } = getSectionProgress(section)
      return { completed: acc.completed + completed, total: acc.total + total }
    },
    { completed: 0, total: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold text-foreground">
                {totalProgress.completed} of {totalProgress.total} tasks
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl font-bold text-primary">
                {totalProgress.total > 0
                  ? Math.round((totalProgress.completed / totalProgress.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${totalProgress.total > 0 ? (totalProgress.completed / totalProgress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id)
        const { completed, total } = getSectionProgress(section)
        const isComplete = completed === total && total > 0

        return (
          <Card key={section.id} className={cn(isComplete && 'border-green-500/30')}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {section.title}
                      {isComplete && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    {section.description && (
                      <CardDescription>{section.description}</CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {section.timeframe && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {section.timeframe}
                    </Badge>
                  )}
                  <Badge variant={isComplete ? 'default' : 'secondary'}>
                    {completed}/{total}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent>
                <div className="space-y-4">
                  {section.items.map((item) => {
                    const isChecked = progress[item.id]?.completed || false
                    const notes = progress[item.id]?.notes || ''
                    const showNotes = expandedNotes.has(item.id)

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'rounded-lg border border-border/50 p-4 transition-colors',
                          isChecked && 'bg-green-500/5 border-green-500/20'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={item.id}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (isAuthenticated && onToggle) {
                                onToggle(item.id, checked as boolean)
                              }
                            }}
                            disabled={!isAuthenticated}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <label
                                htmlFor={item.id}
                                className={cn(
                                  'font-medium cursor-pointer',
                                  isChecked && 'line-through text-muted-foreground'
                                )}
                              >
                                {item.title}
                              </label>
                              <div className="flex items-center gap-2">
                                {item.priority === 'high' && (
                                  <Badge variant="destructive" className="gap-1 text-xs">
                                    <AlertCircle className="h-3 w-3" />
                                    Important
                                  </Badge>
                                )}
                                {item.estimatedTime && (
                                  <Badge variant="outline" className="gap-1 text-xs">
                                    <Clock className="h-3 w-3" />
                                    {item.estimatedTime}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {item.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {item.link && (
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={item.link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    {item.link.label}
                                  </a>
                                </Button>
                              )}
                              {isAuthenticated && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleNotes(item.id)}
                                  className="gap-1"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  {notes ? 'Edit Notes' : 'Add Notes'}
                                </Button>
                              )}
                            </div>
                            {showNotes && isAuthenticated && (
                              <div className="mt-3">
                                <Textarea
                                  placeholder="Add your notes here..."
                                  value={notes}
                                  onChange={(e) => onNotesChange?.(item.id, e.target.value)}
                                  className="min-h-[80px]"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {!isAuthenticated && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-muted-foreground">
              Sign in to save your progress and add notes to items.
            </p>
            <Button size="sm" asChild>
              <a href="/auth/sign-up">Create Account</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
