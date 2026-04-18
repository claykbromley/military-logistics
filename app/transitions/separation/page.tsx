"use client"

import Link from "next/link"
import { SectionLayout } from "@/components/section-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  CheckSquare,
  Briefcase,
  GraduationCap,
  Heart,
  DollarSign,
  Home,
  Scale,
  ArrowRight,
  Clock,
  AlertTriangle,
  Shield,
  Users
} from "lucide-react"

const separationSections = [
  {
    title: "Transition Checklist",
    description: "Timeline from 18 months out to separation day",
    href: "/separation/checklist",
    icon: CheckSquare,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    priority: "high"
  },
  {
    title: "Resume Builder",
    description: "Translate military experience to civilian terms",
    href: "/separation/resume-builder",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    priority: "high"
  },
  {
    title: "Career Resources",
    description: "Job search, networking, and interview preparation",
    href: "/separation/career",
    icon: Briefcase,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    priority: "high"
  },
  {
    title: "Education & Training",
    description: "GI Bill, certifications, and skill programs",
    href: "/separation/education",
    icon: GraduationCap,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    priority: "medium"
  },
  {
    title: "VA Benefits",
    description: "Disability claims, healthcare, and veteran services",
    href: "/separation/va-benefits",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    priority: "high"
  },
  {
    title: "Retirement Calculator",
    description: "Pension estimates and financial planning",
    href: "/separation/retirement-calculator",
    icon: DollarSign,
    color: "text-gold",
    bgColor: "bg-gold/10",
    priority: "medium"
  },
  {
    title: "Housing Transition",
    description: "VA loans, relocation, and housing options",
    href: "/separation/housing",
    icon: Home,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    priority: "low"
  },
  {
    title: "Legal Considerations",
    description: "Document review, benefits protection, and rights",
    href: "/separation/legal",
    icon: Scale,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    priority: "low"
  }
]

const quickStats = [
  { label: "TAP Required", value: "Mandatory", icon: CheckSquare },
  { label: "Start Planning", value: "18+ months", icon: Clock },
  { label: "VA Claim Timeline", value: "180 days prior", icon: FileText },
  { label: "Final Out", value: "1-2 weeks", icon: AlertTriangle }
]

const tapRequirements = [
  "Pre-Separation Counseling",
  "VA Benefits Briefings (2 days)",
  "Department of Labor Employment Workshop (1 day)",
  "Financial Planning Seminar",
  "Individual Transition Plan (ITP)",
  "Capstone - verification of career readiness"
]

export default function SeparationPage() {
  return (
    <SectionLayout
      title="Retirement & Separation"
      description="Comprehensive resources for transitioning from military to civilian life"
      backLink="/"
      backLabel="Home"
    >
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-8 w-8 text-gold mx-auto mb-2" />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* TAP Overview */}
        <Card className="bg-navy/30 border-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold">
              <Shield className="h-5 w-5" />
              Transition Assistance Program (TAP)
            </CardTitle>
            <CardDescription>
              All service members must complete TAP before separation - start early
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {tapRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckSquare className="h-4 w-4 text-gold shrink-0" />
                  <span className="text-muted-foreground">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Actions */}
        <Card className="bg-destructive/10 border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Timeline Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-destructive">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Start TAP Early</p>
                  <p className="text-sm text-muted-foreground">At least 12 months before separation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-orange-500">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">File VA Claims</p>
                  <p className="text-sm text-muted-foreground">180 days before - use BDD program</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gold">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Build Your Resume</p>
                  <p className="text-sm text-muted-foreground">Translate military experience now</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Cards */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Transition Resources</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {separationSections.map((section) => (
              <Link key={section.href} href={section.href}>
                <Card className="bg-card border-border h-full hover:border-gold/50 transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`h-12 w-12 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                        <section.icon className={`h-6 w-6 ${section.color}`} />
                      </div>
                      {section.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">Priority</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-gold transition-colors">
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0 h-auto text-gold hover:text-gold/80">
                      Explore <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Support Resources */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gold" />
              Transition Support Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-foreground">Military OneSource</p>
                <p className="text-gold font-mono">1-800-342-9647</p>
                <p className="text-xs text-muted-foreground mt-1">Free transition coaching</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-foreground">VA Benefits Hotline</p>
                <p className="text-gold font-mono">1-800-827-1000</p>
                <p className="text-xs text-muted-foreground mt-1">Benefits and claims help</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-foreground">American Job Centers</p>
                <p className="text-gold font-mono">CareerOneStop.org</p>
                <p className="text-xs text-muted-foreground mt-1">Employment assistance</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-foreground">Vet Centers</p>
                <p className="text-gold font-mono">1-877-927-8387</p>
                <p className="text-xs text-muted-foreground mt-1">Counseling and support</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionLayout>
  )
}
