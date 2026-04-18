"use client"

import { SectionLayout } from "@/components/section-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Heart,
  Baby,
  FileText,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Scale,
  Home,
  GraduationCap,
  Stethoscope
} from "lucide-react"

const familyTransitions = [
  {
    title: "Getting Married",
    description: "Everything you need to know about marriage in the military, from paperwork to benefits updates.",
    icon: Heart,
    href: "/family/marriage",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    items: ["BAH increase", "DEERS enrollment", "ID cards", "TRICARE updates"]
  },
  {
    title: "Having Children",
    description: "Prepare for your new family member with checklists for birth, adoption, and benefits.",
    icon: Baby,
    href: "/family/children",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    items: ["Birth registration", "DEERS enrollment", "Dependent ID", "TRICARE coverage"]
  },
  {
    title: "Divorce Procedures",
    description: "Navigate the legal and administrative requirements of divorce while serving.",
    icon: Scale,
    href: "/family/divorce",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    items: ["Legal assistance", "BAH changes", "DEERS updates", "Support obligations"]
  },
  {
    title: "Required Documents",
    description: "Find all the forms and paperwork needed for family status changes.",
    icon: FileText,
    href: "/family/documents",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    items: ["Marriage certificates", "Birth certificates", "Court orders", "DEERS forms"]
  },
  {
    title: "Dependent Benefits",
    description: "Comprehensive overview of all benefits available to military dependents.",
    icon: Shield,
    href: "/family/benefits",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    items: ["Healthcare", "Education", "Commissary", "MWR programs"]
  }
]

const quickFacts = [
  {
    icon: Home,
    title: "BAH Increases",
    description: "With-dependent rate can increase BAH by 20-50% depending on location"
  },
  {
    icon: Stethoscope,
    title: "TRICARE Coverage",
    description: "Dependents receive full medical and dental coverage at no or low cost"
  },
  {
    icon: GraduationCap,
    title: "Education Benefits",
    description: "Dependents may qualify for tuition assistance and GI Bill transfer"
  },
  {
    icon: Users,
    title: "Family Support",
    description: "Access to family readiness programs, childcare, and counseling services"
  }
]

const importantReminders = [
  {
    type: "critical",
    title: "72-Hour Rule",
    description: "You have 72 hours to report marriage to your command"
  },
  {
    type: "critical",
    title: "30-Day DEERS",
    description: "Enroll dependents in DEERS within 30 days of qualifying event"
  },
  {
    type: "warning",
    title: "Fraudulent Marriage",
    description: "Marrying solely for benefits is a UCMJ violation"
  },
  {
    type: "info",
    title: "ID Card Appointments",
    description: "Schedule RAPIDS appointments early - they fill up quickly"
  }
]

export default function FamilyPage() {
  return (
    <SectionLayout
      title="Family Changes"
      description="Navigate life changes including marriage, children, and dependent status updates"
      backHref="/"
      backLabel="Home"
    >
      <div className="space-y-8">
        {/* Important Reminders */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="h-5 w-5 text-gold" />
              Important Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {importantReminders.map((reminder, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    reminder.type === "critical" 
                      ? "bg-patriot-red/10 border border-patriot-red/20" 
                      : reminder.type === "warning"
                      ? "bg-amber-500/10 border border-amber-500/20"
                      : "bg-blue-500/10 border border-blue-500/20"
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${
                    reminder.type === "critical"
                      ? "bg-patriot-red/20"
                      : reminder.type === "warning"
                      ? "bg-amber-500/20"
                      : "bg-blue-500/20"
                  }`}>
                    <AlertCircle className={`h-4 w-4 ${
                      reminder.type === "critical"
                        ? "text-patriot-red"
                        : reminder.type === "warning"
                        ? "text-amber-400"
                        : "text-blue-400"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">{reminder.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Family Transitions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {familyTransitions.map((transition) => (
            <Card key={transition.title} className="bg-card border-border hover:border-gold/30 transition-colors group">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${transition.bgColor} flex items-center justify-center mb-2`}>
                  <transition.icon className={`h-6 w-6 ${transition.color}`} />
                </div>
                <CardTitle className="text-foreground group-hover:text-gold transition-colors">
                  {transition.title}
                </CardTitle>
                <CardDescription>{transition.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {transition.items.map((item) => (
                      <Badge key={item} variant="secondary" className="bg-secondary text-secondary-foreground">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full group-hover:bg-gold group-hover:text-navy group-hover:border-gold transition-colors">
                    <Link href={transition.href}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Facts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Dependent Benefits Overview</CardTitle>
            <CardDescription>
              Understanding the benefits available to your family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickFacts.map((fact, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg bg-secondary/50">
                  <div className="p-3 rounded-full bg-gold/10 mb-3">
                    <fact.icon className="h-6 w-6 text-gold" />
                  </div>
                  <h4 className="font-medium text-foreground mb-1">{fact.title}</h4>
                  <p className="text-sm text-muted-foreground">{fact.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DEERS Information */}
        <Card className="bg-gradient-to-br from-navy to-navy-dark border-gold/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-full bg-gold/10">
                <Users className="h-10 w-10 text-gold" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  DEERS - Defense Enrollment Eligibility Reporting System
                </h3>
                <p className="text-muted-foreground mb-4">
                  All family status changes require updating DEERS. This is the central database that determines 
                  eligibility for military benefits including healthcare, commissary access, and dependent ID cards.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-foreground">Verify eligibility</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-foreground">Enable TRICARE</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-foreground">Issue ID cards</span>
                  </div>
                </div>
              </div>
              <Button asChild className="bg-gold text-navy hover:bg-gold-light">
                <Link href="/family/documents">
                  DEERS Forms
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground mb-2">Military OneSource</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Free 24/7 support for military families including counseling and resources.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="https://www.militaryonesource.mil" target="_blank" rel="noopener noreferrer">
                  Visit Site
                </a>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground mb-2">ID Card Office Locator</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Find your nearest RAPIDS ID card office and schedule appointments.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="https://idco.dmdc.osd.mil/idco/" target="_blank" rel="noopener noreferrer">
                  Find Office
                </a>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h4 className="font-medium text-foreground mb-2">TRICARE</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Manage healthcare coverage and find providers for your family.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="https://www.tricare.mil" target="_blank" rel="noopener noreferrer">
                  Manage Coverage
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionLayout>
  )
}
