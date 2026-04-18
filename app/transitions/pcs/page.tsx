import { SectionLayout } from '@/components/section-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Truck,
  ClipboardList,
  Calculator,
  MapPin,
  DollarSign,
  FileText,
  Home,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react'

const navItems = [
  { name: 'Overview', href: '/pcs', icon: Truck },
  { name: 'Checklist', href: '/pcs/checklist', icon: ClipboardList },
  { name: 'Weight Calculator', href: '/pcs/weight-calculator', icon: Calculator },
  { name: 'Weigh Stations', href: '/pcs/weigh-stations', icon: MapPin },
  { name: 'PPM Estimator', href: '/pcs/ppm-estimator', icon: DollarSign },
  { name: 'Documents', href: '/pcs/documents', icon: FileText },
]

const quickLinks = [
  {
    title: 'PCS Checklist',
    description: 'Timeline-based checklist from 90 days out to move day',
    href: '/pcs/checklist',
    icon: ClipboardList,
    badge: 'Essential',
  },
  {
    title: 'Weight Calculator',
    description: 'Calculate your weight allowance based on rank and dependents',
    href: '/pcs/weight-calculator',
    icon: Scale,
    badge: 'Calculator',
  },
  {
    title: 'Weigh Station Finder',
    description: 'Find CAT scales and weigh stations near you',
    href: '/pcs/weigh-stations',
    icon: MapPin,
    badge: 'Map Tool',
  },
  {
    title: 'PPM Cost Estimator',
    description: 'Estimate your reimbursement for a personally procured move',
    href: '/pcs/ppm-estimator',
    icon: DollarSign,
    badge: 'Calculator',
  },
]

const moveTypes = [
  {
    title: 'Household Goods (HHG)',
    description: 'Government arranges and pays for professional movers',
    pros: ['No out-of-pocket costs', 'Full liability coverage', 'Less stress'],
    cons: ['Less control over timing', 'Possible delays', 'Must be present for inventory'],
    best: 'Best for large moves with lots of furniture',
  },
  {
    title: 'Personally Procured Move (PPM/DITY)',
    description: 'You move yourself and get reimbursed based on weight',
    pros: ['Control your schedule', 'Potential profit', 'Move what you want'],
    cons: ['Physical labor', 'Responsibility for damage', 'Upfront costs'],
    best: 'Best for smaller moves or when you want to profit',
  },
  {
    title: 'Combination Move',
    description: 'Government moves most items, you move some yourself',
    pros: ['Best of both worlds', 'Profit on PPM portion', 'Professional help'],
    cons: ['More coordination', 'Two weight tickets needed'],
    best: 'Best for those who want help but also some profit',
  },
]

const timeline = [
  { days: '90 Days', tasks: ['Get orders', 'Visit TMO', 'Research housing'] },
  { days: '60 Days', tasks: ['Schedule HHG pickup', 'Arrange travel', 'School records'] },
  { days: '30 Days', tasks: ['Confirm dates', 'Cancel utilities', 'Final medical/dental'] },
  { days: '14 Days', tasks: ['Pack essentials', 'Confirm reservations', 'Close accounts'] },
  { days: '7 Days', tasks: ['Final walkthrough', 'Clean housing', 'Last-minute prep'] },
]

export default function PCSPage() {
  return (
    <SectionLayout
      title="PCS"
      description="Permanent Change of Station moves made easier"
      icon={Truck}
      navItems={navItems}
      currentPath="/pcs"
    >
      <div className="space-y-8">
        {/* Welcome Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
          <CardHeader>
            <CardTitle className="text-2xl">PCS Resources & Tools</CardTitle>
            <CardDescription className="text-base">
              Moving to a new duty station is one of the most common and complex military transitions.
              Use our tools and checklists to ensure nothing falls through the cracks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Start planning 90 days out</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>50+ checklist items</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4" />
                <span>4 interactive tools</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Tools & Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group">
                <Card className="h-full transition-all hover:border-primary/50 hover:bg-card/80">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <link.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{link.title}</h3>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {link.badge}
                        </Badge>
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

        {/* Move Types */}
        <Card>
          <CardHeader>
            <CardTitle>Types of PCS Moves</CardTitle>
            <CardDescription>
              Understanding your options for relocating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-3">
              {moveTypes.map((type) => (
                <div key={type.title} className="rounded-lg border border-border/50 p-4">
                  <h3 className="font-semibold text-foreground">{type.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Pros</p>
                      <ul className="mt-1 space-y-1">
                        {type.pros.map((pro) => (
                          <li key={pro} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Cons</p>
                      <ul className="mt-1 space-y-1">
                        {type.cons.map((con) => (
                          <li key={con} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-yellow-500" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 rounded bg-primary/5 p-2">
                    <p className="text-xs text-muted-foreground">{type.best}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>PCS Timeline at a Glance</CardTitle>
            <CardDescription>
              Key milestones before your move
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((phase, index) => (
                <div key={phase.days} className="relative flex gap-4">
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-[15px] top-8 h-full w-0.5 bg-border" />
                  )}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {5 - index}
                  </div>
                  <div className="flex-1 pb-4">
                    <h3 className="font-semibold text-foreground">{phase.days} Out</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {phase.tasks.map((task) => (
                        <Badge key={task} variant="outline">
                          {task}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/pcs/checklist"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View full checklist
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Official PCS Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="https://www.move.mil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors hover:bg-accent/50"
              >
                <Home className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Move.mil</p>
                  <p className="text-sm text-muted-foreground">Official DoD moving portal</p>
                </div>
              </a>
              <a
                href="https://www.defensetravel.dod.mil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors hover:bg-accent/50"
              >
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Defense Travel</p>
                  <p className="text-sm text-muted-foreground">Travel vouchers and per diem</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionLayout>
  )
}
