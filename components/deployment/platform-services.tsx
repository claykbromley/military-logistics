"use client"

import React from "react"

import {
  DollarSign,
  FileText,
  Home,
  Users,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Briefcase,
  PawPrint,
  Heart,
  Car,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PlatformService {
  title: string
  description: string
  features: string[]
  icon: React.ReactNode
  href: string
  status: "available" | "coming-soon"
  highlight?: boolean
}

const platformServices: PlatformService[] = [
  {
    title: "Financial Command Center",
    description:
      "Track all your accounts, bills, and recurring payments in one place. Set up autopay monitoring, get bill reminders, and give trusted family members secure access to view your financial status.",
    features: [
      "Bill tracking with autopay status",
      "Account balance dashboard",
      "Payment due alerts",
      "Family member access controls",
      "Deployment savings tracker",
    ],
    icon: <DollarSign className="w-6 h-6" />,
    href: "/services/financial",
    status: "coming-soon",
    highlight: true,
  },
  {
    title: "Document Vault",
    description:
      "Securely store and organize all critical documents - wills, powers of attorney, insurance policies, and more. Share specific documents with family members who need them.",
    features: [
      "Encrypted document storage",
      "Expiration date tracking",
      "Shared access for family",
      "Document categories & tags",
      "Quick-access emergency docs",
    ],
    icon: <FileText className="w-6 h-6" />,
    href: "/services/documents",
    status: "available",
  },
  {
    title: "Property & Vehicle Manager",
    description:
      "Keep track of your home, vehicles, and storage. Monitor maintenance schedules, insurance renewals, registration expirations, and assign caretakers for while you're away.",
    features: [
      "Maintenance schedule tracking",
      "Insurance & registration alerts",
      "Caretaker assignment",
      "Service history log",
      "Property inspection checklists",
    ],
    icon: <Home className="w-6 h-6" />,
    href: "/services/property",
    status: "available",
  },
  {
    title: "Family Communication Hub",
    description:
      "Stay connected with your loved ones. Schedule video calls across time zones, track communication history, and share special moments even when you're far away.",
    features: [
      "Time zone aware scheduling",
      "Communication log",
      "Shared photo albums",
      "Voice message recordings",
      "Special date reminders",
    ],
    icon: <MessageSquare className="w-6 h-6" />,
    href: "/services/communication",
    status: "available",
  },
  {
    title: "Emergency Contact Network",
    description:
      "Maintain a comprehensive contact list for emergencies. Define who has power of attorney, who can access accounts, and who to call for specific situations.",
    features: [
      "Categorized contact roles",
      "POA holder designation",
      "Account access permissions",
      "Emergency protocol docs",
      "Quick-dial integration",
    ],
    icon: <Users className="w-6 h-6" />,
    href: "/services/contacts",
    status: "available",
  },
  {
    title: "Deployment Countdown & Calendar",
    description:
      "Track important dates, milestones, and countdowns. Never miss a birthday, anniversary, or important family event. Plan ahead for care packages and special surprises.",
    features: [
      "Homecoming countdown",
      "Important date reminders",
      "Care package scheduler",
      "Milestone tracking",
      "Shared family calendar",
    ],
    icon: <Calendar className="w-6 h-6" />,
    href: "/services/calendar",
    status: "available",
  },
  {
    title: "Pet Care Coordinator",
    description:
      "Coordinate care for your furry family members. Connect with foster families, track vet appointments, manage pet insurance, and keep care instructions organized.",
    features: [
      "Foster family matching",
      "Vet records & appointments",
      "Pet insurance tracking",
      "Care instructions sharing",
      "Photo updates from caregivers",
    ],
    icon: <PawPrint className="w-6 h-6" />,
    href: "/services/pets",
    status: "available",
  },
  {
    title: "Wellness & Journal",
    description:
      "Take care of your mental health during deployment. Keep a private journal, track your mood, and access resources for maintaining wellness while away from home.",
    features: [
      "Private journal entries",
      "Mood tracking",
      "Wellness resources",
      "Gratitude prompts",
      "Chaplain & counselor finder",
    ],
    icon: <Heart className="w-6 h-6" />,
    href: "/services/wellness",
    status: "available",
  },
  {
    title: "Legal Ready Center",
    description:
      "Ensure all your legal documents are in order. Track document status, get reminders for renewals, and find JAG legal assistance at your installation.",
    features: [
      "Document status dashboard",
      "Renewal reminders",
      "JAG locator",
      "Template library",
      "Notary finder",
    ],
    icon: <ShieldCheck className="w-6 h-6" />,
    href: "/services/legal",
    status: "available",
  },
  {
    title: "Career & Benefits Tracker",
    description:
      "Keep track of your military career milestones, benefits utilization, and upcoming opportunities. Monitor TSP contributions, education benefits, and promotion timelines.",
    features: [
      "TSP contribution tracking",
      "GI Bill usage monitor",
      "Promotion timeline",
      "Leave balance tracking",
      "Benefits utilization",
    ],
    icon: <Briefcase className="w-6 h-6" />,
    href: "/services/career",
    status: "available",
  },
  {
    title: "Vehicle Storage & Care",
    description:
      "Manage vehicles you're storing during deployment. Track storage locations, maintenance needs, and coordinate with friends or services to keep your vehicles in good shape.",
    features: [
      "Storage location tracking",
      "Battery & maintenance alerts",
      "Caretaker coordination",
      "Insurance pause reminders",
      "Return inspection checklist",
    ],
    icon: <Car className="w-6 h-6" />,
    href: "/services/property",
    status: "available",
  },
]

export function PlatformServices() {
  return (
    <section id="platform-services" className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Available Now
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
            Your Personal Deployment Command Center
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-balance">
            Comprehensive services to help you manage every aspect of life while you're deployed. 
            All your critical information in one secure place.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {platformServices.map((service) => (
            <div
              key={service.title}
              className={`bg-card border rounded-lg p-6 transition-all hover:border-accent/50 ${
                service.highlight ? "border-accent/30 ring-1 ring-accent/10" : "border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    service.highlight
                      ? "bg-accent text-accent-foreground"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  {service.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground text-lg">{service.title}</h3>
                    {service.status === "coming-soon" ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
                        Soon
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-4">
                    {service.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-sm text-muted-foreground pl-6">
                        +{service.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                  {service.status === "available" ? (
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent" asChild>
                      <Link href={service.href}>
                        Open Service
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent" disabled>
                      Coming Soon
                      <Clock className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-primary text-primary-foreground rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-3">Want to help shape these features?</h3>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            We're building this platform for service members like you. Share your ideas and help us
            prioritize the features that matter most.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/feedback">Share Your Ideas</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
