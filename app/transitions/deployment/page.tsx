"use client"

import { useState } from "react"
import Link from "next/link"
import { SectionLayout } from "@/components/section-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Shield,
  CheckSquare,
  Users,
  Scale,
  FileText,
  DollarSign,
  Phone,
  Heart,
  ArrowRight,
  Calendar,
  Clock,
  AlertTriangle,
  Target
} from "lucide-react"

const deploymentSections = [
  {
    title: "Pre-Deployment Checklist",
    description: "Timeline-based tasks from 90 days out to departure",
    href: "/deployment/checklist",
    icon: CheckSquare,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    priority: "high"
  },
  {
    title: "Family Care Plan",
    description: "Build your DD Form 1561 with interactive guidance",
    href: "/deployment/family-care-plan",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    priority: "high"
  },
  {
    title: "Legal Preparation",
    description: "Wills, Power of Attorney, and legal documents",
    href: "/deployment/legal",
    icon: Scale,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    priority: "high"
  },
  {
    title: "Financial Preparation",
    description: "Deployment pay calculator and SDP benefits",
    href: "/deployment/finances",
    icon: DollarSign,
    color: "text-gold",
    bgColor: "bg-gold/10",
    priority: "medium"
  },
  {
    title: "Documents Guide",
    description: "Required paperwork and where to find forms",
    href: "/deployment/documents",
    icon: FileText,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    priority: "medium"
  },
  {
    title: "Communication Plan",
    description: "Staying connected with family during deployment",
    href: "/deployment/communication",
    icon: Phone,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    priority: "low"
  },
  {
    title: "Reintegration",
    description: "Post-deployment resources and readjustment support",
    href: "/deployment/reintegration",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    priority: "low"
  }
]

const quickStats = [
  { label: "Average Deployment", value: "9-12 months", icon: Calendar },
  { label: "Prep Time Needed", value: "90+ days", icon: Clock },
  { label: "Required Documents", value: "8-12 forms", icon: FileText },
  { label: "SDP Interest Rate", value: "10% APR", icon: DollarSign }
]

export default function DeploymentPage() {
  const [deploymentDate, setDeploymentDate] = useState<string>("")
  const [daysUntil, setDaysUntil] = useState<number | null>(null)

  const calculateDaysUntil = (dateString: string) => {
    if (!dateString) {
      setDaysUntil(null)
      return
    }
    const deployDate = new Date(dateString)
    const today = new Date()
    const diffTime = deployDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysUntil(diffDays)
  }

  const getPhase = (days: number | null) => {
    if (days === null) return null
    if (days > 90) return { label: "Early Planning", color: "text-green-500", progress: 10 }
    if (days > 60) return { label: "90-Day Mark", color: "text-green-500", progress: 25 }
    if (days > 30) return { label: "60-Day Mark", color: "text-gold", progress: 50 }
    if (days > 14) return { label: "30-Day Mark", color: "text-orange-500", progress: 70 }
    if (days > 7) return { label: "2-Week Mark", color: "text-orange-500", progress: 85 }
    if (days > 0) return { label: "Final Week", color: "text-destructive", progress: 95 }
    return { label: "Deployed", color: "text-muted-foreground", progress: 100 }
  }

  const phase = getPhase(daysUntil)

  return (
    <SectionLayout
      title="Deployment Preparation"
      description="Complete resources to prepare yourself and your family for deployment"
      backLink="/"
      backLabel="Home"
    >
      <div className="space-y-8">
        {/* Countdown Calculator */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gold" />
              Deployment Countdown
            </CardTitle>
            <CardDescription>
              Enter your deployment date to see your preparation timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deployment-date">Expected Deployment Date</Label>
                <Input
                  id="deployment-date"
                  type="date"
                  value={deploymentDate}
                  onChange={(e) => {
                    setDeploymentDate(e.target.value)
                    calculateDaysUntil(e.target.value)
                  }}
                  className="bg-secondary border-border"
                />
              </div>
              
              {daysUntil !== null && (
                <div className="flex flex-col justify-center">
                  <div className="text-center md:text-left">
                    <p className="text-3xl font-bold text-foreground">
                      {daysUntil > 0 ? daysUntil : 0} days
                    </p>
                    <p className="text-sm text-muted-foreground">until deployment</p>
                  </div>
                </div>
              )}
            </div>

            {phase && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${phase.color}`}>
                    Current Phase: {phase.label}
                  </span>
                  <span className="text-sm text-muted-foreground">{phase.progress}% through prep</span>
                </div>
                <Progress value={phase.progress} className="h-2" />
                
                {daysUntil !== null && daysUntil <= 30 && daysUntil > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20 mt-4">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-sm text-foreground">
                      <strong>Critical Phase:</strong> Ensure all legal documents, family care plan, and financial arrangements are finalized.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Priority Actions */}
        <Card className="bg-navy/30 border-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold">
              <AlertTriangle className="h-5 w-5" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-destructive">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Complete Family Care Plan</p>
                  <p className="text-sm text-muted-foreground">Required if you have dependents</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-orange-500">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Update Legal Documents</p>
                  <p className="text-sm text-muted-foreground">Will, POA, and SGLI</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gold">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Setup Financial Allotments</p>
                  <p className="text-sm text-muted-foreground">SDP and bill automation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Cards */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Preparation Resources</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deploymentSections.map((section) => (
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
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gold" />
              Emergency Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-foreground">Military OneSource</p>
                <p className="text-gold font-mono">1-800-342-9647</p>
                <p className="text-xs text-muted-foreground mt-1">24/7 support for all issues</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-foreground">Military Crisis Line</p>
                <p className="text-gold font-mono">988 (Press 1)</p>
                <p className="text-xs text-muted-foreground mt-1">Confidential crisis support</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-foreground">Family Readiness</p>
                <p className="text-gold font-mono">Contact your FRG</p>
                <p className="text-xs text-muted-foreground mt-1">Unit family support</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-foreground">Legal Assistance</p>
                <p className="text-gold font-mono">Base JAG Office</p>
                <p className="text-xs text-muted-foreground mt-1">Free legal services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionLayout>
  )
}
