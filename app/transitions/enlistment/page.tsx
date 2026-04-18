import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { GraduationCap, ClipboardList, FileText, Gift, GitCompare, ArrowRight, Clock, CheckCircle2, Users, DollarSign, Heart, Home, ChevronRight} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Overview', href: '/transitions/enlistment', icon: GraduationCap },
  { name: 'Checklist', href: '/transitions/enlistment/checklist', icon: ClipboardList },
  { name: 'Documents', href: '/transitions/enlistment/documents', icon: FileText },
  { name: 'Benefits', href: '/transitions/enlistment/benefits', icon: Gift },
  { name: 'Branch Comparison', href: '/transitions/enlistment/branch-comparison', icon: GitCompare },
]

const quickLinks = [
  {
    title: 'Pre-Enlistment Checklist',
    description: 'Everything you need to do before visiting MEPS',
    href: '/transitions/enlistment/checklist',
    icon: ClipboardList,
    badge: 'Start Here',
  },
  {
    title: 'Required Documents',
    description: 'Birth certificate, SSN, education records, and more',
    href: '/transitions/enlistment/documents',
    icon: FileText,
  },
  {
    title: 'Benefits Overview',
    description: 'Pay, healthcare, education, and housing benefits',
    href: '/transitions/enlistment/benefits',
    icon: Gift,
  },
  {
    title: 'Compare Branches',
    description: 'Side-by-side comparison of all military branches',
    href: '/transitions/enlistment/branch-comparison',
    icon: GitCompare,
  },
]

const benefits = [
  {
    title: 'Education Benefits',
    description: 'GI Bill covers tuition, housing, and books for college',
    icon: GraduationCap,
  },
  {
    title: 'Healthcare',
    description: 'TRICARE provides comprehensive medical coverage',
    icon: Heart,
  },
  {
    title: 'Housing Allowance',
    description: 'BAH helps cover housing costs based on location',
    icon: Home,
  },
  {
    title: 'Competitive Pay',
    description: 'Base pay plus allowances and special pays',
    icon: DollarSign,
  },
]

const timeline = [
  {
    phase: 'Research & Decide',
    duration: '1-3 months',
    description: 'Research branches, talk to recruiters, and choose your path',
  },
  {
    phase: 'Application & MEPS',
    duration: '1-2 weeks',
    description: 'Complete application, medical exam, and ASVAB testing',
  },
  {
    phase: 'Delayed Entry Program',
    duration: '1-12 months',
    description: 'Prepare physically and mentally while waiting for ship date',
  },
  {
    phase: 'Basic Training',
    duration: '8-13 weeks',
    description: 'Duration varies by branch: Army 10 weeks, Navy 8 weeks, etc.',
  },
]

export default function EnlistmentPage() {
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
            <span className="text-foreground font-medium">Enlistment</span>
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
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight text-foreground">
                Enlisting in the Military
              </h1>
              <p className="text-base lg:text-lg max-w-lg mx-auto text-muted-foreground">
                Beginning your military career with confidence and preparation
              </p>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="space-y-8">
                {/* Welcome Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Starting Your Military Journey</CardTitle>
                    <CardDescription className="text-base">
                      Enlisting in the military is a significant decision that will shape your future. 
                      This section provides everything you need to prepare, from understanding the 
                      enlistment process to comparing benefits across all branches.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Process takes 1-12 months</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>6 branches to choose from</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>20+ checklist items</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Access</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {quickLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="group">
                        <Card className="h-full transition-all hover:border-primary/50 hover:bg-card/80">
                          <CardContent className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                              <link.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{link.title}</h3>
                                {link.badge && (
                                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    {link.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Enlistment Timeline</CardTitle>
                    <CardDescription>
                      Typical phases of the enlistment process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {timeline.map((phase, index) => (
                        <div key={phase.phase} className="relative flex gap-4">
                          {index !== timeline.length - 1 && (
                            <div className="absolute left-[15px] top-8 h-[90%] w-0.5 bg-primary/20" />
                          )}
                          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{phase.phase}</h3>
                              <Badge variant="outline" className='dark:border-slate-500/50'>{phase.duration}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{phase.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Benefits Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Why Enlist?</CardTitle>
                    <CardDescription>
                      Key benefits of military service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {benefits.map((benefit) => (
                        <div key={benefit.title} className="flex items-start gap-3 rounded-lg bg-primary/10 p-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                            <benefit.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{benefit.title}</h4>
                            <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <Link
                        href="/transitions/enlistment/benefits"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        View all benefits
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
