'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, ClipboardList, FileText, Gift, GitCompare, ChevronDown, AlertTriangle,
  ChevronRight,  MessageSquare,  ExternalLink, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Overview', href: '/transitions/enlistment', icon: GraduationCap },
  { name: 'Checklist', href: '/transitions/enlistment/checklist', icon: ClipboardList },
  { name: 'Documents', href: '/transitions/enlistment/documents', icon: FileText },
  { name: 'Benefits', href: '/transitions/enlistment/benefits', icon: Gift },
  { name: 'Branch Comparison', href: '/transitions/enlistment/branch-comparison', icon: GitCompare },
]

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

const checklistSections: ChecklistSection[] = [
  {
    id: 'research',
    title: 'Research & Decide',
    description: 'Before committing, make sure you understand your options',
    timeframe: 'Week 1-4',
    items: [
      {
        id: 'research-branches',
        title: 'Research all military branches',
        description: 'Each branch has unique missions, cultures, and opportunities. Take time to understand the differences.',
        link: { url: '/transitions/enlistment/branch-comparison', label: 'Compare Branches' },
        priority: 'high',
        estimatedTime: '2-3 hours',
      },
      {
        id: 'talk-recruiter',
        title: 'Talk to a recruiter',
        description: 'Schedule appointments with recruiters from branches you\'re interested in. Ask questions and take notes.',
        link: { url: 'https://www.military.com/find-info/contact-recruiter', label: 'Find Recruiters' },
        estimatedTime: '1-2 hours each',
      },
      {
        id: 'talk-veterans',
        title: 'Talk to current/former service members',
        description: 'Get honest perspectives from people who have served. Ask about their experiences and advice.',
      },
      {
        id: 'research-jobs',
        title: 'Research military occupational specialties (MOS/AFSC/Rating)',
        description: 'Understand which jobs are available and which align with your interests and goals.',
        link: { url: 'https://www.military.com/join-armed-forces/military-jobs', label: 'Explore Jobs' },
      },
      {
        id: 'family-discussion',
        title: 'Discuss with family and significant others',
        description: 'Military service affects your whole family. Have honest conversations about expectations.',
        priority: 'high',
      },
    ],
  },
  {
    id: 'preparation',
    title: 'Physical & Mental Preparation',
    description: 'Get ready for the physical and mental demands of military life',
    timeframe: 'Ongoing',
    items: [
      {
        id: 'fitness-assessment',
        title: 'Assess your current fitness level',
        description: 'Take practice fitness tests to understand where you stand against branch requirements.',
        priority: 'high',
      },
      {
        id: 'workout-plan',
        title: 'Start a military-focused workout program',
        description: 'Focus on running, push-ups, sit-ups, and pull-ups. Gradually increase intensity.',
        link: { url: 'https://www.military.com/military-fitness', label: 'Fitness Resources' },
        estimatedTime: '30-60 min daily',
      },
      {
        id: 'practice-asvab',
        title: 'Study for the ASVAB',
        description: 'Your ASVAB score determines which jobs you qualify for. Higher scores mean more options.',
        link: { url: 'https://www.asvabpracticetests.com/', label: 'Practice Tests' },
        priority: 'high',
        estimatedTime: '1-2 hours daily',
      },
      {
        id: 'medical-review',
        title: 'Review medical disqualifications',
        description: 'Understand what medical conditions might affect your eligibility.',
        link: { url: 'https://www.military.com/join-armed-forces/disqualifiers-medical-conditions.html', label: 'Medical Standards' },
      },
      {
        id: 'quit-smoking',
        title: 'Quit smoking/vaping if applicable',
        description: 'Tobacco use can affect your performance and some specialized programs.',
      },
    ],
  },
  {
    id: 'documents',
    title: 'Gather Documents',
    description: 'Collect all required paperwork before visiting MEPS',
    timeframe: 'Week 2-4',
    items: [
      {
        id: 'birth-cert',
        title: 'Obtain birth certificate',
        description: 'Must be an original or certified copy with raised seal.',
        link: { url: 'https://www.cdc.gov/nchs/w2w/index.htm', label: 'Order Birth Certificate' },
        priority: 'high',
      },
      {
        id: 'ssn-card',
        title: 'Get Social Security card',
        description: 'Original card required, not a copy.',
        link: { url: 'https://www.ssa.gov/myaccount/replacement-card.html', label: 'Replace Card' },
        priority: 'high',
      },
      {
        id: 'drivers-license',
        title: 'Have valid driver\'s license or state ID',
        description: 'Government-issued photo ID is required.',
        priority: 'high',
      },
      {
        id: 'education-docs',
        title: 'Gather education transcripts/diploma',
        description: 'High school diploma or GED documentation. College transcripts if applicable.',
      },
      {
        id: 'medical-records',
        title: 'Collect medical records',
        description: 'Any hospitalizations, surgeries, or ongoing treatments. Be honest and thorough.',
        priority: 'high',
      },
      {
        id: 'legal-docs',
        title: 'Gather legal documents if applicable',
        description: 'Court records, waivers for any legal issues, citizenship/immigration documents.',
      },
    ],
  },
  {
    id: 'meps',
    title: 'MEPS Preparation',
    description: 'Military Entrance Processing Station - where you officially enlist',
    timeframe: 'Day before MEPS',
    items: [
      {
        id: 'meps-documents',
        title: 'Organize all required documents',
        description: 'Create a folder with all documents. Make copies for your records.',
        priority: 'high',
      },
      {
        id: 'meps-clothes',
        title: 'Prepare appropriate clothing',
        description: 'Wear modest, comfortable clothing. Bring appropriate underwear for medical exam.',
      },
      {
        id: 'meps-rest',
        title: 'Get a good night\'s sleep',
        description: 'You\'ll need to be alert for testing and medical evaluation.',
        priority: 'high',
      },
      {
        id: 'meps-no-alcohol',
        title: 'Avoid alcohol and drugs',
        description: 'You will be drug tested. Avoid alcohol for at least 48 hours before.',
        priority: 'high',
      },
      {
        id: 'meps-hygiene',
        title: 'Practice good hygiene',
        description: 'Shower, trim nails, remove excessive jewelry and piercings.',
      },
      {
        id: 'meps-contacts',
        title: 'Bring glasses instead of contacts',
        description: 'You may need to remove contacts for eye exams.',
      },
    ],
  },
  {
    id: 'dep',
    title: 'Delayed Entry Program (DEP)',
    description: 'While waiting for your ship date',
    timeframe: '1-12 months',
    items: [
      {
        id: 'dep-contact',
        title: 'Stay in contact with your recruiter',
        description: 'Attend required meetings and keep your recruiter updated on any changes.',
        priority: 'high',
      },
      {
        id: 'dep-fitness',
        title: 'Continue improving fitness',
        description: 'The fitter you are at basic training, the easier it will be.',
        priority: 'high',
      },
      {
        id: 'dep-study',
        title: 'Study your branch\'s general orders and ranks',
        description: 'Memorize what you\'ll need to know at basic training.',
        link: { url: 'https://www.military.com/join-military/military-ranks-everything-you-need-know.html', label: 'Military Ranks' },
      },
      {
        id: 'dep-affairs',
        title: 'Get personal affairs in order',
        description: 'Cancel subscriptions, arrange for bills, set up powers of attorney if needed.',
      },
      {
        id: 'dep-bank',
        title: 'Set up direct deposit banking',
        description: 'You\'ll need a bank account for military pay.',
      },
      {
        id: 'dep-goodbyes',
        title: 'Spend quality time with family and friends',
        description: 'You\'ll be away for basic training and potentially longer for job training.',
      },
    ],
  },
]

export default function EnlistmentChecklistPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [progress, setProgress] = useState<Record<string, { completed: boolean; notes?: string }>>({})
  const supabase = createClient()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  useEffect(() => {
    let mounted = true

    const checkAuth = async (user: any) => {
      if (user) {
        // Load saved progress
        const { data } = await supabase
          .from('checklist_progress')
          .select('item_id, completed, notes')
          .eq('user_id', user.id)
          .eq('transition_type', 'enlistment')

        if (data) {
          const progressMap: Record<string, { completed: boolean; notes?: string }> = {}
          data.forEach((item) => {
            progressMap[item.item_id] = {
              completed: item.completed,
              notes: item.notes || undefined,
            }
          })
          setProgress(progressMap)
        }
      }
    }

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        const user = session?.user

        if (mounted) {
          setIsAuthenticated(!!user)
        }

        if (user) {
          await checkAuth(user)
        }
      } finally {
      }
    }

    init()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        const user = session?.user

        setIsAuthenticated(!!user)

        if (event === "SIGNED_IN" && user) {
          checkAuth(user)
        }

        if (event === "SIGNED_OUT") {
          setProgress({})
        }
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])


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

  const totalProgress = checklistSections.reduce(
    (acc, section) => {
      const { completed, total } = getSectionProgress(section)
      return { completed: acc.completed + completed, total: acc.total + total }
    },
    { completed: 0, total: 0 }
  )

  const handleToggle = async (itemId: string, completed: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setProgress((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], completed },
    }))

    await supabase.from('checklist_progress').upsert({
      user_id: user.id,
      transition_type: 'enlistment',
      checklist_id: 'main',
      item_id: itemId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    }, {
      onConflict: 'user_id,transition_type,checklist_id,item_id',
    })
  }

  const handleNotesChange = async (itemId: string, notes: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setProgress((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes },
    }))

    // Debounce this in production
    await supabase.from('checklist_progress').upsert({
      user_id: user.id,
      transition_type: 'enlistment',
      checklist_id: 'main',
      item_id: itemId,
      completed: progress[itemId]?.completed || false,
      notes,
    }, {
      onConflict: 'user_id,transition_type,checklist_id,item_id',
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4" />
            <a className="hover:text-primary transition-colors">
              Transitions
            </a>
            <ChevronRight className="h-4 w-4" />
            <a href="/transitions/enlistment" className="hover:text-primary transition-colors">
              Enlistment
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Checklist</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-sidebar border-r">
          <div className="top-20 p-6">
            <a href="/transitions/enlistment">
              <h2 className="text-2xl font-bold text-sidebar-foreground mb-6 pb-3 border-b-2 border-muted-foreground text-center">
                Enlistment
              </h2>
            </a>
            <div className="space-y-3">
              {navItems.map((category) => {
                const Icon = category.icon
                return (
                  <a key={category.name} href={category.href} className="block">
                    <Card
                      key={category.name}
                      className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </Card>
                  </a>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
            {/* Hero */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-3">Pre-Enlistment Checklist</h2>
              <p className="text-primary mb-6">
                Complete these tasks to prepare for your military enlistment
              </p>
            </div>

            {/* Content */}
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
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${totalProgress.total > 0 ? (totalProgress.completed / totalProgress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {!isAuthenticated && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                        Sign in to start your checklist
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                        Sign in to sync your checklist across devices and create notes to help you prepare.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Checklist Sections */}
              {checklistSections.map((section) => {
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
                            <Badge variant="outline" className="gap-1 dark:border-slate-500/50">
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
                                  'rounded-lg border border-border/50 dark:border-slate-500/50 p-4 transition-colors',
                                  isChecked && 'bg-green-500/5 border-green-500/20'
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id={item.id}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      if (isAuthenticated) {
                                        handleToggle(item.id, checked as boolean)
                                      }
                                    }}
                                    disabled={!isAuthenticated}
                                    className="mt-1 cursor-pointer dark:border-slate-500/50"
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
                                          <Badge variant="outline" className="gap-1 text-xs dark:border-slate-500/50">
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
                                        <Button size="sm" asChild>
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
                                          className="gap-1 cursor-pointer"
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
                                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                          className="min-h-[80px] dark:border-slate-500/50"
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
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
