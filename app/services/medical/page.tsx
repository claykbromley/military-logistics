"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Stethoscope, Heart, Brain, Pill, Activity, Phone, Shield, Users,
  AlertTriangle, CheckCircle, ExternalLink, ChevronDown, Building2,
  FileText, Lightbulb, DollarSign, Clipboard, Globe, Eye,
  HeartPulse, Smile, GraduationCap, BadgeCheck, CalendarCheck,
  Menu, X, ChevronRight, BicepsFlexed, ListCheck, Dumbbell, ClipboardCheck
} from "lucide-react"

// ─── Data ────────────────────────────────────────────────────────────────────

const categories = [
  { name: "TRICARE Overview", icon: Shield, id: "tricare", color: "text-blue-500 dark:text-blue-400" },
  { name: "TRICARE Plans", icon: FileText, id: "plans", color: "text-violet-500 dark:text-violet-400" },
  { name: "Pre-Deployment", icon: Clipboard, id: "predeployment", color: "text-teal-500 dark:text-teal-400" },
  { name: "Physical Fitness", icon: Dumbbell, id: "fitness", color: "text-orange-500 dark:text-orange-400" },
  { name: "PHA Requirements", icon: ClipboardCheck, id: "pha", color: "text-cyan-500 dark:text-cyan-400" },
  { name: "VA Healthcare", icon: Heart, id: "va", color: "text-red-500 dark:text-red-400" },
  { name: "Mental Health", icon: Brain, id: "mental", color: "text-pink-500 dark:text-pink-400" },
  { name: "Pharmacy Benefits", icon: Pill, id: "pharmacy", color: "text-indigo-500 dark:text-indigo-400" },
  { name: "Dental & Vision", icon: Smile, id: "dental", color: "text-emerald-500 dark:text-emerald-400" },
  { name: "Crisis Support", icon: Phone, id: "crisis", color: "text-rose-500 dark:text-rose-400" },
]

const quickLinks = [
  { name: "TRICARE.mil", url: "https://www.tricare.mil", icon: Shield },
  { name: "VA Health Care", url: "https://www.va.gov/health-care", icon: Heart },
  { name: "Military.com TRICARE", url: "https://www.military.com/benefits/tricare", icon: Building2 },
  { name: "Express Scripts", url: "https://www.express-scripts.com/TRICARE", icon: Pill },
  { name: "TRICARE Plan Finder", url: "https://www.tricare.mil/Plans", icon: Clipboard },
  { name: "Veterans Crisis Line", url: "https://www.veteranscrisisline.net", icon: Phone },
]

const allResources = [
  { name: "Official TRICARE", url: "https://www.tricare.mil", icon: Shield },
  { name: "VA Health Care", url: "https://www.va.gov/health-care", icon: Heart },
  { name: "Military.com TRICARE", url: "https://www.military.com/benefits/tricare", icon: Building2 },
  { name: "Express Scripts TRICARE", url: "https://www.express-scripts.com/TRICARE", icon: Pill },
  { name: "TRICARE Plan Finder", url: "https://www.tricare.mil/Plans", icon: Clipboard },
  { name: "TRICARE Cost Compare", url: "https://www.tricare.mil/Costs/Compare", icon: DollarSign },
  { name: "VA Mental Health", url: "https://www.va.gov/health-care/health-needs-conditions/mental-health", icon: Brain },
  { name: "Veterans Crisis Line", url: "https://www.veteranscrisisline.net", icon: Phone },
  { name: "Military OneSource", url: "https://www.militaryonesource.mil", icon: Globe },
  { name: "TRICARE Dental", url: "https://www.tricare.mil/CoveredServices/Dental", icon: Smile },
  { name: "BENEFEDS Enrollment", url: "https://www.benefeds.com", icon: FileText },
  { name: "Health Readiness", url: "https://www.health.mil/Military-Health-Topics/Health-Readiness", icon: Activity },
]

// ─── Reusable Components ─────────────────────────────────────────────────────

function Accordion({
  icon: Icon,
  iconBg,
  title,
  desc,
  children,
}: {
  icon: React.ElementType
  iconBg: string
  title: string
  desc: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="border border-border p-0 overflow-hidden transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 hover:bg-primary/5 transition-colors text-left"
      >
        <div className={`p-2.5 rounded-xl ${iconBg} flex-shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-border bg-primary/5 dark:bg-primary/10 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </Card>
  )
}

function Callout({
  variant,
  icon: Icon,
  children,
}: {
  variant: "info" | "warn" | "danger" | "success"
  icon: React.ElementType
  children: React.ReactNode
}) {
  const styles = {
    info: "bg-blue-50 dark:bg-blue-950/40 border-l-blue-500 text-blue-900 dark:text-blue-100",
    warn: "bg-amber-50 dark:bg-amber-950/40 border-l-amber-500 text-amber-900 dark:text-amber-100",
    danger: "bg-red-50 dark:bg-red-950/40 border-l-red-500 text-red-900 dark:text-red-100",
    success: "bg-emerald-50 dark:bg-emerald-950/40 border-l-emerald-500 text-emerald-900 dark:text-emerald-100",
  }
  const iconStyles = {
    info: "text-blue-500 dark:text-blue-400",
    warn: "text-amber-500 dark:text-amber-400",
    danger: "text-red-500 dark:text-red-400",
    success: "text-emerald-500 dark:text-emerald-400",
  }

  return (
    <div className={`flex gap-3 p-4 rounded-lg border-l-[3px] ${styles[variant]} mb-6`}>
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconStyles[variant]}`} />
      <div className="text-sm leading-relaxed [&_strong]:font-semibold">{children}</div>
    </div>
  )
}

function HighlightBox({
  variant,
  title,
  children,
}: {
  variant: "amber" | "red" | "blue" | "green" | "purple" | "teal"
  title?: string
  children: React.ReactNode
}) {
  const styles: Record<string, string> = {
    amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50",
    red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50",
    green: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50",
    purple: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50",
    teal: "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/50",
  }

  return (
    <div className={`rounded-lg border p-4 ${styles[variant]}`}>
      {title && <h4 className="text-sm font-bold text-foreground mb-2">{title}</h4>}
      <div className="text-sm text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold [&_li]:py-1">{children}</div>
    </div>
  )
}

function StepItem({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3.5 bg-card p-4 rounded-lg border border-border">
      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
        {num}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">{desc}</p>
      </div>
    </div>
  )
}

function LinkButton({
  href,
  icon: Icon,
  children,
  variant = "primary",
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  variant?: "primary" | "secondary"
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:-translate-y-px ${
        variant === "primary"
          ? "bg-[#0a1628] dark:bg-primary text-white dark:text-primary-foreground hover:bg-[#162544] dark:hover:bg-primary/90"
          : "bg-muted text-foreground border border-border hover:border-primary hover:text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  )
}

function ResourceCard({ name, url, icon: Icon }: { name: string; url: string; icon: React.ElementType }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-card hover:text-primary hover:border-primary hover:shadow-md transition-all hover:-translate-y-px group"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-semibold group-hover:text-primary text-foreground truncate">{name}</span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto flex-shrink-0" />
    </a>
  )
}

function CostTable({ headers, rows, footnote }: { headers: string[]; rows: string[][]; footnote?: string }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border dark:border-slate-500">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60">
              {headers.map((h) => (
                <th key={h} className="border-b border-border dark:border-slate-500 px-3 py-2.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border dark:border-slate-500 last:border-b-0 hover:bg-muted/20 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className={`px-3 py-2.5 ${j === 0 ? "font-medium text-foreground" : ""} ${cell === "$0" ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote && <p className="text-xs text-muted-foreground mt-2">{footnote}</p>}
    </div>
  )
}

function BulletList({ items, color = "bg-muted-foreground/40" }: { items: string[]; color?: string }) {
  return (
    <ul className="text-sm text-muted-foreground space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${color} mt-1.5 flex-shrink-0`} />
          {item}
        </li>
      ))}
    </ul>
  )
}

function CrisisBox() {
  return (
    <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 rounded-lg p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-red-100 dark:bg-red-900/50 rounded-full flex-shrink-0">
          <Phone className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="font-bold text-foreground text-lg">If you{"'"}re in crisis — Get help now</p>
          <p className="text-sm text-muted-foreground mt-1">Call or text <strong className="text-foreground text-xl">988</strong> (Press 1 for Veterans). Available 24/7, free, confidential.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href="tel:988" className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">Call 988</a>
            <a href="sms:838255" className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors">Text 838255</a>
            <a href="https://www.veteranscrisisline.net/get-help/chat" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors">Chat Online <ExternalLink className="h-3 w-3" /></a>
          </div>
        </div>
      </div>
    </div>
  )
}

function HotlineItem({ name, desc, number }: { name: string; desc: string; number: string }) {
  return (
    <div className="flex items-start justify-between gap-4 bg-card p-4 rounded-lg border border-border">
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <p className="text-lg font-bold text-primary flex-shrink-0">{number}</p>
    </div>
  )
}

// ─── Content Sections ────────────────────────────────────────────────────────

function HomeContent() {
  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-7 text-center">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-5 bg-primary text-primary-foreground">
          <Stethoscope className="w-3 h-3" />
          Medical Services
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight text-foreground">
          Military Medical Services
        </h1>
        <p className="text-base lg:text-lg max-w-lg mx-auto text-muted-foreground">
          Comprehensive healthcare resources for military service members, veterans, and their families.
          From TRICARE coverage to VA healthcare, mental health support, and crisis resources.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        <Button asChild>
          <a
            href="https://www.tricare.mil"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Shield className="h-4 w-4" />
            Official TRICARE
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
        <Button asChild>
          <a
            href="https://www.va.gov/health-care"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Heart className="h-4 w-4" />
            VA Healthcare
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-lg text-center font-bold text-foreground mb-4">All Medical Resources</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allResources.map((r) => (
            <ResourceCard key={r.name} name={r.name} url={r.url} icon={r.icon} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TricareContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">TRICARE Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">TRICARE</strong> is the U.S. military{"'"}s health care program, functioning as government-managed health insurance. Managed by the Pentagon{"'"}s Defense Health Agency, TRICARE provides coverage for millions of current and former service members and their families across all seven branches of the Uniformed Services.
        </p>
      </div>

      <Callout variant="warn" icon={Lightbulb}>
        <strong>Important:</strong> Active-duty service members are automatically enrolled in TRICARE Prime. Family members and retirees can choose between TRICARE Prime (HMO-style) or TRICARE Select (PPO-style) based on their preferences for provider choice and out-of-pocket costs.
      </Callout>

      <Accordion icon={Shield} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="What is TRICARE?" desc="Understanding the military health care system">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE provides benefits for Active Duty personnel, Retirees, National Guard and Reserve members called to Active Duty, and eligible family members. Health benefits are available for all seven branches of the Uniformed Services.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {["Army", "Navy", "Air Force", "Marine Corps", "Coast Guard", "Space Force", "Public Health Service", "NOAA Corps"].map((branch) => (
            <a key={branch} href="https://www.tricare.mil/Plans/Eligibility" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-card p-3 rounded-lg border border-border text-sm text-foreground hover:border-primary hover:bg-muted/50 transition-colors group">
              {branch}
              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
            </a>
          ))}
        </div>
      </Accordion>

      <Accordion icon={Users} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="Who is Eligible?" desc="Categories of TRICARE beneficiaries">
        <div className="space-y-3">
          {[
            { title: "Active Duty Service Members", desc: "Automatically enrolled in TRICARE Prime with no enrollment fees or out-of-pocket costs for covered services.", color: "blue" },
            { title: "Family Members of Active Duty", desc: "Eligible for TRICARE Prime or TRICARE Select with minimal to no out-of-pocket costs.", color: "green" },
            { title: "Retirees and Their Families", desc: "Can enroll in TRICARE Prime (with enrollment fee) or TRICARE Select. Retirees 65+ use TRICARE for Life with Medicare.", color: "purple" },
            { title: "National Guard & Reserve", desc: "TRICARE Reserve Select available for purchase with monthly premiums. Full TRICARE when activated.", color: "amber" },
          ].map((item) => (
            <HighlightBox key={item.title} variant={item.color as "blue" | "green" | "purple" | "amber"} title={item.title}>
              <p>{item.desc}</p>
            </HighlightBox>
          ))}
        </div>
      </Accordion>

      <Accordion icon={CalendarCheck} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="TRICARE Groups A vs B" desc="Understanding your beneficiary group based on entry date">
        <div className="grid gap-4 md:grid-cols-2">
          <HighlightBox variant="blue" title="Group A">
            <p className="mb-2">Service member entered active duty <strong>before January 1, 2018</strong></p>
            <ul className="space-y-1">
              <li>Lower enrollment fees</li>
              <li>Lower catastrophic cap</li>
              <li>Grandfathered benefits</li>
            </ul>
          </HighlightBox>
          <HighlightBox variant="green" title="Group B">
            <p className="mb-2">Service member entered active duty <strong>on or after January 1, 2018</strong></p>
            <ul className="space-y-1">
              <li>Higher enrollment fees</li>
              <li>Higher catastrophic cap</li>
              <li>Still excellent coverage</li>
            </ul>
          </HighlightBox>
        </div>
        <div className="mt-4">
          <HighlightBox variant="amber" title="Why Does This Matter?">
            <p>Your group determines your enrollment fees and out-of-pocket maximums. Group A beneficiaries generally pay less than Group B for the same services.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.tricare.mil" icon={Shield}>Official TRICARE Website</LinkButton>
        <LinkButton href="https://www.military.com/benefits/tricare" icon={Building2} variant="secondary">Military.com TRICARE Guide</LinkButton>
      </div>
    </div>
  )
}

function PlansContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">TRICARE Health Plans</h2>
        <p className="text-muted-foreground leading-relaxed">
          TRICARE offers 11 different health plan options depending on your status and location. All costs shown are for <strong className="text-foreground">Calendar Year 2026</strong> from the official TRICARE website. Your costs depend on your plan, beneficiary category, and Group A vs B status.
        </p>
      </div>

      <Callout variant="info" icon={Lightbulb}>
        <strong>Pro tip:</strong> Active-duty service members pay nothing out of pocket. Active-duty family members pay nothing unless using the point-of-service option. All other beneficiaries pay annual enrollment fees and copayments.
      </Callout>

      <Accordion icon={BadgeCheck} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="TRICARE Prime" desc="HMO-style managed care with lowest out-of-pocket costs">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE Prime is a managed care option available in Prime Service Areas. You{"'"}re assigned a Primary Care Manager (PCM) who provides most of your care and refers you to specialists. Enrollment is required.
        </p>

        <HighlightBox variant="blue" title="Who Can Participate">
          <BulletList items={[
            "Active duty service members and their families",
            "Retired service members and their families (under age 65)",
            "Activated National Guard and Reserve members and families",
            "Survivors and Medal of Honor recipients",
          ]} color="bg-blue-400" />
        </HighlightBox>

        <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Active Duty Family Members — 2026 Costs</h4>
        <CostTable
          headers={["Cost Type", "Group A", "Group B"]}
          rows={[
            ["Enrollment Fee (Annual)", "$0", "$0"],
            ["Annual Deductible", "$0", "$0"],
            ["Primary Care Visit", "$0", "$0"],
            ["Specialty Care Visit", "$0", "$0"],
            ["Emergency Room", "$0", "$0"],
            ["Hospitalization", "$0", "$0"],
            ["Catastrophic Cap", "$1,000/family", "$1,324/family"],
          ]}
        />

        <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Retirees & Families — 2026 Costs</h4>
        <CostTable
          headers={["Cost Type", "Group A", "Group B"]}
          rows={[
            ["Enrollment Fee (Individual)", "$381.96/year", "$509.28/year"],
            ["Enrollment Fee (Family)", "$765/year", "$1,020/year"],
            ["Annual Deductible", "$0", "$0"],
            ["Primary Care Visit", "$26 copay", "$34 copay"],
            ["Specialty Care Visit", "$39 copay", "$52 copay"],
            ["Emergency Room", "$79 copay", "$105 copay"],
            ["Hospitalization", "$198/day (min $25)", "$264/day (min $25)"],
            ["Catastrophic Cap", "$3,000/family", "$4,635/family"],
          ]}
          footnote="Source: tricare.mil/Costs/Compare (Updated Jan 2026)"
        />
      </Accordion>

      <Accordion icon={Globe} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="TRICARE Prime Remote" desc="For those living/working 50+ miles from military treatment facilities">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE Prime Remote (TPR) is for active duty service members and their command-sponsored family members who live and work more than 50 miles from a military hospital or clinic.
        </p>

        <CostTable
          headers={["Cost Type", "Active Duty Family"]}
          rows={[
            ["Enrollment Fee", "$0"],
            ["Annual Deductible", "$0"],
            ["Primary Care Visit", "$0"],
            ["Specialty Care Visit", "$0"],
            ["Emergency Room", "$0"],
            ["Pharmacy (Feb 28, 2026+)", "$0 copay all options"],
            ["Catastrophic Cap", "$1,000 (A) / $1,324 (B)"],
          ]}
        />

        <div className="mt-4">
          <HighlightBox variant="green" title="Key Benefits">
            <ul className="space-y-1">
              <li><strong>No enrollment fees</strong> for active duty families</li>
              <li><strong>Prime Travel Benefit:</strong> May be reimbursed for travel expenses when traveling for care</li>
              <li><strong>Starting Feb 28, 2026:</strong> $0 copays for covered drugs at home delivery and retail pharmacies</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Building2} iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" title="US Family Health Plan" desc="TRICARE Prime through community-based healthcare systems">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The US Family Health Plan (USFHP) is a TRICARE Prime option through networks of community-based, not-for-profit health care systems in six designated areas of the U.S.
        </p>

        <HighlightBox variant="blue" title="Available Locations & Providers">
          <div className="grid gap-2 md:grid-cols-2 mt-2">
            {[
              ["Martin's Point:", "ME, VT, NH, upstate NY, northern PA"],
              ["CHRISTUS Health:", "Southeast Texas"],
              ["Johns Hopkins:", "Southern MD, DC area"],
              ["Geisinger:", "Southwest NY, northwest PA"],
              ["Brighton Marine:", "Southern New England"],
              ["Pacific Medical Centers:", "Washington State"],
            ].map(([name, area]) => (
              <p key={name} className="text-sm"><strong>{name}</strong> {area}</p>
            ))}
          </div>
        </HighlightBox>

        <div className="mt-4">
          <HighlightBox variant="amber" title="Important Limitations">
            <ul className="space-y-1">
              <li><strong>No MTF access:</strong> Cannot use military treatment facilities while enrolled</li>
              <li><strong>No TRICARE retail pharmacies:</strong> Must use USFHP pharmacy network only</li>
              <li><strong>Location-restricted:</strong> Must live in a USFHP service area</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Globe} iconBg="bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" title="TRICARE Prime Overseas" desc="For those stationed outside the United States">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE Prime Overseas (TPO) and TRICARE Prime Remote Overseas (TPRO) provide managed care coverage for beneficiaries living and working overseas.
        </p>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <HighlightBox variant="teal" title="Prime Overseas (TPO)">
            <p className="mb-2">Near an overseas military hospital or clinic</p>
            <ul className="space-y-1">
              <li>PCM at military facility</li>
              <li>Referrals for specialty care</li>
              <li>Same benefits as stateside Prime</li>
            </ul>
          </HighlightBox>
          <HighlightBox variant="blue" title="Prime Remote Overseas (TPRO)">
            <p className="mb-2">In remote overseas locations away from MTFs</p>
            <ul className="space-y-1">
              <li>Network or non-network PCM</li>
              <li>Care through host nation providers</li>
              <li>Same enrollment as TPO</li>
            </ul>
          </HighlightBox>
        </div>

        <CostTable
          headers={["Cost Type", "AD Family", "Retirees (Group A)"]}
          rows={[
            ["Enrollment Fee (Individual)", "$0", "$381.96/year"],
            ["Enrollment Fee (Family)", "$0", "$765/year"],
            ["Primary Care Visit", "$0", "$26 copay"],
            ["Specialty Care", "$0", "$39 copay"],
            ["Emergency Room", "$0", "$79 copay"],
          ]}
        />
      </Accordion>

      <Accordion icon={CheckCircle} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="TRICARE Select" desc="PPO-style coverage with more provider flexibility">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE Select is a self-managed, PPO-style plan available worldwide. You can see any TRICARE-authorized provider without a referral. Higher out-of-pocket costs than Prime but more freedom to choose providers.
        </p>

        <h4 className="text-sm font-bold text-foreground mb-2">Active Duty Family Members — 2026 Costs</h4>
        <CostTable
          headers={["Cost Type", "Group A", "Group B"]}
          rows={[
            ["Enrollment Fee", "$0", "$0"],
            ["Deductible (E-1 to E-4)", "$50 / $100 family", "$50 / $100 family"],
            ["Deductible (E-5+)", "$150 / $300 family", "$150 / $300 family"],
            ["Primary Care (Network)", "$28 copay", "$28 copay"],
            ["Specialty Care (Network)", "$39 copay", "$39 copay"],
            ["Emergency Room", "$103 copay", "$103 copay"],
            ["Catastrophic Cap", "$1,000/family", "$1,324/family"],
          ]}
        />

        <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Retirees & Families — 2026 Costs</h4>
        <CostTable
          headers={["Cost Type", "Group A", "Group B"]}
          rows={[
            ["Deductible (Individual)", "$150", "$150"],
            ["Deductible (Family)", "$300", "$300"],
            ["Primary Care (Network)", "$32 copay", "$41 copay"],
            ["Specialty Care (Network)", "$48 copay", "$62 copay"],
            ["Emergency Room", "$126 copay", "$165 copay"],
            ["Hospitalization (Network)", "$198/day (min $25)", "$264/day (min $25)"],
            ["Catastrophic Cap", "$3,500/family", "$5,403/family"],
          ]}
          footnote="Source: tricare.mil/Costs/Compare (Updated Jan 2026)"
        />
      </Accordion>

      <Accordion icon={Heart} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="TRICARE For Life" desc="Medicare wraparound coverage for those 65+">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE For Life (TFL) is Medicare-wraparound coverage for those who are TRICARE-eligible and have Medicare Part A and Part B. Coverage is automatic — no enrollment required.
        </p>

        <HighlightBox variant="purple" title="How TFL Works">
          <ol className="list-decimal list-inside space-y-1">
            <li>Medicare pays its portion first</li>
            <li>Medicare sends the claim to the TFL claims processor</li>
            <li>TRICARE pays the provider directly for remaining covered services</li>
            <li>Generally, you{"'"}ll have no out-of-pocket costs for services both cover</li>
          </ol>
        </HighlightBox>

        <div className="mt-4">
          <CostTable
            headers={["Service Type", "Medicare Pays", "TRICARE Pays", "You Pay"]}
            rows={[
              ["Covered by both", "Medicare amount", "Remaining", "$0"],
              ["Medicare only", "Medicare amount", "$0", "Deductible + cost-share"],
              ["TRICARE only", "$0", "TRICARE amount", "Deductible + cost-share"],
              ["Not covered by either", "$0", "$0", "Full billed charges"],
            ]}
          />
        </div>

        <div className="mt-4">
          <HighlightBox variant="amber" title="Requirements">
            <ul className="space-y-1">
              <li><strong>Enrollment Fee:</strong> $0 (but you must pay Medicare Part B premiums)</li>
              <li><strong>Medicare Part A:</strong> Required (usually free from payroll taxes)</li>
              <li><strong>Medicare Part B:</strong> Required (premium varies by income)</li>
              <li><strong>Overseas:</strong> TFL is primary payer since Medicare doesn{"'"}t cover overseas</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Shield} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="TRICARE Reserve Select" desc="Premium-based coverage for Guard and Reserve members">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE Reserve Select (TRS) is a premium-based health plan available to qualified members of the Selected Reserve and their families.
        </p>

        <CostTable
          headers={["Coverage Type", "Monthly Premium", "Annual Cost"]}
          rows={[
            ["Member Only", "$54.43", "$653.16"],
            ["Member + Family", "$255.76", "$3,069.12"],
          ]}
        />

        <div className="mt-4">
          <HighlightBox variant="amber" title="Eligibility Requirements">
            <ul className="space-y-1">
              <li>Be a member of the Selected Reserve</li>
              <li>Not on active duty orders for more than 30 days</li>
              <li>Not eligible for or enrolled in FEHBP</li>
              <li>Not covered under TAMP</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Shield} iconBg="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400" title="TRICARE Retired Reserve" desc='For "gray area" retirees not yet receiving retirement pay'>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE Retired Reserve (TRR) is a premium-based plan for members of the Retired Reserve under age 60 and not yet receiving retired pay.
        </p>
        <CostTable
          headers={["Coverage Type", "Monthly Premium", "Annual Cost"]}
          rows={[
            ["Member Only", "$531.83", "$6,381.96"],
            ["Member + Family", "$1,271.14", "$15,253.68"],
          ]}
        />
      </Accordion>

      <Accordion icon={GraduationCap} iconBg="bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400" title="TRICARE Young Adult" desc="Coverage for dependents ages 21-26">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE Young Adult (TYA) extends coverage to qualified adult children who have aged out of regular TRICARE coverage.
        </p>
        <CostTable
          headers={["Plan Option", "Monthly Premium", "Annual Cost"]}
          rows={[
            ["TYA Prime", "$311", "$3,732"],
            ["TYA Select", "$197", "$2,364"],
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <HighlightBox variant="purple" title="Eligibility">
            <ul className="space-y-1">
              <li>Unmarried adult child under age 26</li>
              <li>Not eligible for employer-sponsored coverage</li>
              <li>Sponsor must be eligible for military health benefits</li>
            </ul>
          </HighlightBox>
          <HighlightBox variant="blue" title="Coverage Notes">
            <ul className="space-y-1">
              <li>TYA Prime: Same benefits as TRICARE Prime</li>
              <li>TYA Select: Same benefits as TRICARE Select</li>
              <li>Copays match sponsor{"'"}s beneficiary category</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      {/* All Plans quick links */}
      <Card className="p-4 border border-border">
        <h4 className="text-sm font-bold text-foreground mb-3">All Plans at a Glance</h4>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["TRICARE Prime", "https://www.tricare.mil/Plans/HealthPlans/Prime"],
            ["TRICARE Prime Remote", "https://www.tricare.mil/Plans/HealthPlans/TPR"],
            ["US Family Health Plan", "https://www.tricare.mil/Plans/HealthPlans/USFHP"],
            ["Prime Overseas", "https://www.tricare.mil/Plans/HealthPlans/TPO"],
            ["Prime Remote Overseas", "https://www.tricare.mil/Plans/HealthPlans/TPRO"],
            ["TRICARE Select", "https://www.tricare.mil/Plans/HealthPlans/TS"],
            ["Select Overseas", "https://www.tricare.mil/Plans/HealthPlans/TSO"],
            ["TRICARE For Life", "https://www.tricare.mil/Plans/HealthPlans/TFL"],
            ["Reserve Select", "https://www.tricare.mil/Plans/HealthPlans/TRS"],
            ["Retired Reserve", "https://www.tricare.mil/Plans/HealthPlans/TRR"],
            ["Young Adult", "https://www.tricare.mil/Plans/HealthPlans/TYA"],
          ].map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
              {name} <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.tricare.mil/Plans" icon={Clipboard}>TRICARE Plan Finder</LinkButton>
        <LinkButton href="https://www.tricare.mil/Costs/Compare" icon={DollarSign} variant="secondary">Compare All Costs</LinkButton>
      </div>
    </div>
  )
}

function PreDeploymentContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Pre-Deployment Medical Requirements</h2>
        <p className="text-muted-foreground leading-relaxed">
          Before deployment, service members must complete a comprehensive set of medical requirements to ensure they are <strong className="text-foreground">Fully Medically Ready (FMR)</strong>. These are tracked through MEDPROS/MHS GENESIS and must be current before deploying.
        </p>
      </div>

      <Callout variant="warn" icon={Lightbulb}>
        <strong>Start early:</strong> Begin addressing pre-deployment medical requirements at least 90 days before your deployment date. Some requirements like immunization series take time to complete, and scheduling at MTFs can have wait times.
      </Callout>

      <Accordion icon={Activity} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="Immunizations" desc="Required vaccinations based on deployment destination">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Vaccine requirements vary by deployment destination. Your unit medical personnel will provide specific requirements based on your Area of Responsibility (AOR).
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <HighlightBox variant="blue" title="Commonly Required">
            <BulletList items={["Anthrax", "Smallpox", "Typhoid", "Hepatitis A & B", "Yellow Fever", "Meningococcal"]} color="bg-blue-400" />
          </HighlightBox>
          <HighlightBox variant="green" title="Routine Boosters">
            <BulletList items={["Influenza (annual)", "Tetanus/Tdap", "MMR", "Polio (if required by AOR)", "Rabies (for some specialties)"]} color="bg-emerald-400" />
          </HighlightBox>
        </div>
        <div className="mt-4">
          <HighlightBox variant="amber" title="Important Note">
            <p>Shot records must be current and uploaded into MEDPROS/MHS GENESIS. Bring your immunization record card to all appointments and verify entries are recorded correctly.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={BadgeCheck} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="Medical Readiness Assessment" desc="PHA, IMR, and FMR status requirements">
        <div className="space-y-3">
          {[
            { title: "Periodic Health Assessment (PHA)", desc: "Annual health screening required for all service members. Must be current (within 12 months) before deployment. Includes health history review, physical exam, and screening questionnaires." },
            { title: "Individual Medical Record (IMR)", desc: "Complete review and update of your medical record. All items must show green/current status in MEDPROS. Address any red flags immediately with your medical provider." },
            { title: "Fully Medically Ready (FMR) Status", desc: "Overall readiness status combining all medical requirements. You cannot deploy without achieving FMR status. Check your status regularly in MEDPROS or MHS GENESIS." },
          ].map((item) => (
            <div key={item.title} className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm font-bold text-foreground mb-1">{item.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion icon={Smile} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="Dental Readiness" desc="Dental classification requirements for deployment">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Dental Class 1 or 2</strong> is required for deployment. Class 3 or 4 will flag a member as non-deployable until treated.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <HighlightBox variant="green" title="Class 1 (Deployable)">
            <p>No dental treatment needed. Exam within 12 months with no identified conditions.</p>
          </HighlightBox>
          <HighlightBox variant="blue" title="Class 2 (Deployable)">
            <p>Minor treatment needed but unlikely to cause emergency within 12 months.</p>
          </HighlightBox>
          <HighlightBox variant="amber" title="Class 3 (Non-Deployable)">
            <p>Conditions likely to cause a dental emergency within 12 months if untreated.</p>
          </HighlightBox>
          <HighlightBox variant="red" title="Class 4 (Non-Deployable)">
            <p>No dental exam on record within the past 12 months. Schedule exam immediately.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Eye} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="Vision Requirements" desc="Eye exams and corrective lens requirements">
        <HighlightBox variant="amber" title="Vision Requirements">
          <ul className="space-y-1">
            <li>Current eye exam confirming adequate vision</li>
            <li>Two pairs of military-issue eyeglasses (if corrective lenses needed)</li>
            <li>Inserts for protective masks (if applicable)</li>
            <li>Contact lens wearers should have glasses as backup</li>
          </ul>
        </HighlightBox>
        <p className="text-sm text-muted-foreground mt-3">Schedule your eye exam early as military optical labs may have wait times for fabricating glasses.</p>
      </Accordion>

      <Accordion icon={Activity} iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" title="Lab Work & Screenings" desc="Required blood tests and medical screenings">
        <div className="space-y-2">
          {[
            ["Blood Type Verification", "Confirmed blood type on file and dog tags"],
            ["HIV Test", "Required within a specified window before deployment (typically within 12 months)"],
            ["DNA Blood Sample", "DNA specimen on file for identification purposes"],
            ["Tuberculosis (TB) Screening", "Current TB test (skin test or blood test)"],
            ["G6PD Screening", "Required for some theater medications (affects malaria prophylaxis options)"],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-2.5 bg-card p-3.5 rounded-lg border border-border">
              <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion icon={Pill} iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" title="Prescribed Medications" desc="Medication requirements for deployment">
        <HighlightBox variant="blue" title="Deployment Medication Requirements">
          <ul className="space-y-1.5">
            <li><strong>Malaria Prophylaxis:</strong> Depending on destination — doxycycline, mefloquine, or Malarone</li>
            <li><strong>Chronic Medications:</strong> 90-day supply of any maintenance medications</li>
            <li><strong>Combat Casualty Meds:</strong> Certain theaters require NAAK and other combat-specific medical equipment</li>
          </ul>
        </HighlightBox>
        <div className="mt-3">
          <HighlightBox variant="amber">
            <p><strong>Important:</strong> Coordinate with your prescribing provider to ensure adequate supply. Some medications may require special authorization for deployment.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Brain} iconBg="bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400" title="Mental Health Screening" desc="Pre-deployment psychological health requirements">
        <HighlightBox variant="purple" title="Pre-Deployment Psychological Health Screening">
          <ul className="space-y-1">
            <li>Completion of pre-deployment psychological health screening questionnaire</li>
            <li>Review of any ongoing mental health treatment or medications</li>
            <li>Assessment of deployment readiness from behavioral health perspective</li>
            <li>Post-traumatic stress screenings may also be reviewed</li>
          </ul>
        </HighlightBox>
        <p className="text-sm text-muted-foreground mt-3">Being on mental health medication does not automatically disqualify you from deployment. Discuss concerns with your provider.</p>
      </Accordion>

      <Accordion icon={Activity} iconBg="bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" title="Hearing (Audiogram)" desc="Baseline hearing test requirements">
        <HighlightBox variant="teal" title="Baseline Audiogram">
          <p>A baseline hearing test is required to document pre-deployment hearing levels. This allows for comparison post-deployment to identify any service-connected hearing loss.</p>
        </HighlightBox>
        <p className="text-sm text-muted-foreground mt-3">If you experience any hearing changes during or after deployment, report them immediately. Hearing loss is one of the most common service-connected disabilities.</p>
      </Accordion>

      <Accordion icon={Globe} iconBg="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400" title="Theater-Specific Requirements" desc="Additional requirements based on deployment location">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Depending on your Area of Responsibility (AOR), additional medical requirements may apply:
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["CBRN Medical Readiness", "Chemical, Biological, Radiological, Nuclear medical preparedness"],
            ["Tropical Disease Prophylaxis", "Additional preventive medications for tropical locations"],
            ["Snake Bite & Allergic Reaction", "Preparedness training and antivenom awareness"],
            ["Country Clearance", "Specific country medical clearance requirements"],
          ].map(([title, desc]) => (
            <Card key={title} className="p-4">
              <p className="text-sm font-bold text-foreground mb-1">{title}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </Card>
          ))}
        </div>
      </Accordion>

      <Accordion icon={FileText} iconBg="bg-muted text-muted-foreground" title="Documentation Requirements" desc="Administrative documents that must be current">
        <div className="space-y-2">
          {[
            ["Dog Tags", "Verified and updated with correct information (name, SSN, blood type, religious preference)"],
            ["SGLV (Life Insurance)", "Servicemembers Group Life Insurance election and beneficiaries updated"],
            ["DD Form 93 (Emergency Data)", "Record of Emergency Data — designates next of kin and notification preferences"],
            ["Shot Records", "Current and uploaded into MEDPROS/MHS GENESIS"],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-2.5 bg-card p-3.5 rounded-lg border border-border">
              <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      <HighlightBox variant="blue" title="Sources">
        <p>Pre-deployment medical requirements are governed by DoDI 6490.07 and service-specific regulations. Requirements may vary by branch and deployment location. Always verify with your unit medical personnel.</p>
      </HighlightBox>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="./transitions/deployment" icon={ListCheck}>Milify Deployment Checklist</LinkButton>
        <LinkButton href="https://www.health.mil/Military-Health-Topics/Health-Readiness" icon={Activity}>Military Health Readiness</LinkButton>
        <LinkButton href="https://www.military.com/benefits/tricare" icon={Building2} variant="secondary">Military.com Benefits</LinkButton>
      </div>
    </div>
  )
}

function FitnessContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Physical Fitness Standards & Resources</h2>
        <p className="text-muted-foreground leading-relaxed">
          Physical readiness is a core requirement for all service members. Each branch has its own fitness test, body composition standards, and testing frequency. Staying current on your fitness obligations is essential for career progression, deployment eligibility, and retention.
        </p>
      </div>

      <Callout variant="info" icon={Lightbulb}>
        <strong>2025–2026 Changes:</strong> The Army replaced the ACFT with the new Army Fitness Test (AFT) on June 1, 2025. The Navy returned to twice-yearly fitness testing in 2026. The Space Force introduced a 2-mile run requirement. Stay informed — standards continue to evolve across all branches.
      </Callout>

      <Accordion icon={Shield} iconBg="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" title="Army Fitness Test (AFT)" desc="Replaced the ACFT on June 1, 2025">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The Army Fitness Test (AFT) replaced the Army Combat Fitness Test (ACFT) as the official fitness test of record. It removed the standing power throw event and introduces separate standards for combat and combat-enabling specialties.
        </p>

        <HighlightBox variant="green" title="AFT Events (5 Events)">
          <ul className="space-y-1.5">
            <li><strong>3 Repetition Maximum Deadlift (MDL):</strong> Measures lower body and grip strength</li>
            <li><strong>Sprint-Drag-Carry (SDC):</strong> Tests agility, anaerobic endurance, and muscular strength — sprint, drag a 90-lb sled, lateral shuffle, carry two 40-lb kettlebells, and final sprint</li>
            <li><strong>Hand Release Push-Up (HRP):</strong> Measures upper body muscular endurance</li>
            <li><strong>Plank (PLK):</strong> Assesses core strength and endurance (replaced sit-ups)</li>
            <li><strong>2-Mile Run (2MR):</strong> Tests aerobic fitness and cardiovascular endurance</li>
          </ul>
        </HighlightBox>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <HighlightBox variant="blue" title="General Standard (Most MOSs)">
            <ul className="space-y-1">
              <li><strong>Minimum Score:</strong> 300 total (60 per event)</li>
              <li>Sex- and age-normed scoring</li>
              <li>Applies to all non-combat specialties</li>
            </ul>
          </HighlightBox>
          <HighlightBox variant="amber" title="Combat Standard (21 MOSs)">
            <ul className="space-y-1">
              <li><strong>Minimum Score:</strong> 350 total (60 per event)</li>
              <li>Sex-neutral, age-normed scoring</li>
              <li>Applies to 21 designated combat MOSs</li>
            </ul>
          </HighlightBox>
        </div>

        <div className="mt-4">
          <HighlightBox variant="purple" title="Key Dates & Consequences">
            <ul className="space-y-1">
              <li><strong>June 1, 2025:</strong> AFT became the official test of record</li>
              <li><strong>Jan 1, 2026:</strong> Administrative action begins for Regular Army and AGR who fail combat standard</li>
              <li><strong>June 1, 2026:</strong> Reserve Component deadline for combat standard compliance</li>
              <li><strong>Failing two consecutive AFTs</strong> may result in involuntary separation</li>
              <li>AFT scores now directly affect <strong>promotion points</strong></li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Shield} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="Navy Physical Readiness Test (PRT)" desc="Twice-yearly testing returns in 2026">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The Navy PRT evaluates muscular endurance and aerobic capacity, alongside a Body Composition Assessment (BCA) measuring height, weight, abdominal circumference, and body fat percentage.
        </p>

        <HighlightBox variant="blue" title="PRT Events">
          <ul className="space-y-1.5">
            <li><strong>Push-ups:</strong> Maximum repetitions in 2 minutes</li>
            <li><strong>Forearm Plank:</strong> Maximum hold time (replaced crunches)</li>
            <li><strong>1.5-Mile Run:</strong> Timed run — or alternate cardio options: 500-yard swim, 12-minute stationary cycle, or 1.5-mile treadmill run/walk (requires CO approval)</li>
          </ul>
        </HighlightBox>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <HighlightBox variant="green" title="Testing Frequency (2026)">
            <ul className="space-y-1">
              <li><strong>Active Duty:</strong> Twice per year (Cycle 1: Jan–Jun, Cycle 2: Jul–Dec)</li>
              <li><strong>Reserve:</strong> At least once per year</li>
              <li><strong>Combat Arms:</strong> One PRT plus one Combat Fitness Test per year</li>
            </ul>
          </HighlightBox>
          <HighlightBox variant="red" title="Failure Consequences">
            <ul className="space-y-1">
              <li>Three PRT failures within a four-year period results in administrative separation</li>
              <li>Failures do not need to be consecutive</li>
              <li>This is stricter than the previous policy requiring two consecutive failures</li>
            </ul>
          </HighlightBox>
        </div>

        <div className="mt-4">
          <HighlightBox variant="teal" title="Navy Combat Fitness Test (New for Combat Arms)">
            <p className="mb-2">For SEALs, SWCC, EOD, and fleet divers:</p>
            <ul className="space-y-1">
              <li><strong>800-meter swim with fins</strong></li>
              <li><strong>2-minute push-up test</strong> (with 20-lb weight vest or plate carrier)</li>
              <li><strong>Untimed pull-up test</strong> (with 20-lb weight vest or plate carrier)</li>
              <li><strong>1-mile run</strong> (with 20-lb weight vest or plate carrier)</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Shield} iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" title="Marine Corps PFT & CFT" desc="The toughest fitness standard in the military">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The Marine Corps maintains two separate fitness assessments: the Physical Fitness Test (PFT) for general fitness and the Combat Fitness Test (CFT) for functional, combat-related fitness.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <HighlightBox variant="red" title="Physical Fitness Test (PFT)">
            <ul className="space-y-1.5">
              <li><strong>Pull-ups</strong> (max reps) or push-ups (alternative)</li>
              <li><strong>Plank</strong> (max hold — replaced crunches)</li>
              <li><strong>3-mile timed run</strong></li>
            </ul>
            <p className="mt-2 text-xs">To max the PFT you must do pull-ups (not push-ups), plank, and a fast 3-mile run.</p>
          </HighlightBox>
          <HighlightBox variant="amber" title="Combat Fitness Test (CFT)">
            <ul className="space-y-1.5">
              <li><strong>Movement to Contact:</strong> 880-yard sprint</li>
              <li><strong>Ammo Can Lifts:</strong> Max reps overhead pressing a 30-lb ammo can in 2 minutes</li>
              <li><strong>Maneuver Under Fire:</strong> Timed course including crawls, carries, grenade throws, and agility drills</li>
            </ul>
          </HighlightBox>
        </div>

        <div className="mt-4">
          <HighlightBox variant="blue" title="Testing Schedule">
            <p>Marines complete both the PFT and CFT annually. PFT is typically conducted in the first half of the fiscal year and CFT in the second half. Scores affect promotion points and assignment eligibility.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Shield} iconBg="bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400" title="Air Force Physical Fitness Assessment (PFA)" desc="Flexible testing with multiple component options">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The Air Force emphasizes functional health and long-term wellness. Airmen are tested twice per year and must meet a minimum composite score of 75 out of 100 and minimum standards in all components.
        </p>

        <HighlightBox variant="blue" title="PFA Events">
          <ul className="space-y-1.5">
            <li><strong>Push-ups</strong> (1 min) or <strong>Hand-Release Push-ups</strong> (2 min)</li>
            <li><strong>Sit-ups</strong> (1 min) or <strong>Reverse Crunches</strong> or <strong>Plank</strong></li>
            <li><strong>1.5-mile run</strong> (primary cardio option) — or alternatives: 20-meter HAMR shuttle run, walk test, or row</li>
          </ul>
        </HighlightBox>

        <div className="mt-4">
          <HighlightBox variant="green" title="Scoring">
            <ul className="space-y-1">
              <li><strong>Minimum composite score:</strong> 75/100</li>
              <li>Must meet minimum in each individual component</li>
              <li>Exemptions available for medical or deployment reasons</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Shield} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="Space Force Physical Fitness Assessment" desc="Holistic wellness approach with 2-mile run requirement">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The Space Force emphasizes holistic wellness including sleep, mental health, strength, mobility, and cardiovascular fitness through its Continuous Fitness Assessment Program.
        </p>

        <HighlightBox variant="purple" title="Space Force PFA Events">
          <ul className="space-y-1.5">
            <li><strong>Push-ups</strong> (1 min) or <strong>Hand-Release Push-ups</strong> (2 min)</li>
            <li><strong>Sit-ups</strong> (1 min) or <strong>Reverse Crunches</strong> or <strong>Plank</strong></li>
            <li><strong>2-mile run</strong> or <strong>20-meter HAMR shuttle run</strong> — the 2-mile run is required in at least one of the twice-yearly tests</li>
          </ul>
        </HighlightBox>

        <div className="mt-4">
          <HighlightBox variant="blue" title="Key Differences from Air Force">
            <ul className="space-y-1">
              <li>Longer run distance (2 miles vs. 1.5 miles)</li>
              <li>Two Human Performance Assessments required annually (as of Jan 2026)</li>
              <li>Greater emphasis on holistic health beyond just physical testing</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Shield} iconBg="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400" title="Coast Guard Physical Fitness Test" desc="Annual testing for all Coast Guard members">
        <HighlightBox variant="amber" title="Coast Guard PFT Events">
          <ul className="space-y-1.5">
            <li><strong>Sit-ups:</strong> 1-minute timed test</li>
            <li><strong>Push-ups:</strong> 1-minute timed test</li>
            <li><strong>1.5-mile run</strong> — or alternate cardio options including swimming</li>
          </ul>
        </HighlightBox>
        <p className="text-sm text-muted-foreground mt-3">
          The Coast Guard tests annually and includes swimming as a cardio alternative, which is unique among the branches. Standards are age- and gender-normed.
        </p>
      </Accordion>

      <Accordion icon={Activity} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="Body Composition Standards" desc="Height/weight and body fat requirements across branches">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          All branches maintain body composition standards in addition to fitness test requirements. Failing body composition standards can result in the same consequences as failing a fitness test.
        </p>

        <CostTable
          headers={["Branch", "Primary Method", "Max Body Fat (Male)", "Max Body Fat (Female)"]}
          rows={[
            ["Army", "Height/Weight → Tape Test", "20-26% (age-based)", "30-36% (age-based)"],
            ["Navy", "Height/Weight → Abdominal Circumference → BCA", "22-26% (age-based)", "33-36% (age-based)"],
            ["Marine Corps", "Height/Weight → Tape Test", "18% (all ages)", "26% (all ages)"],
            ["Air Force", "Height/Weight → Abdominal Circumference", "20% (all ages)", "28% (all ages)"],
            ["Coast Guard", "Height/Weight → Circumference Measurement", "Varies by age", "Varies by age"],
          ]}
          footnote="Exact standards vary by age group. Check your branch's current regulations for precise figures."
        />

        <div className="mt-4">
          <HighlightBox variant="amber" title="How It Works">
            <p>All branches use a tiered approach: if you meet the height/weight screening table, no further measurement is needed. If you exceed the screening weight, a body fat measurement (typically by tape measure) is conducted. Some branches grant exceptions for high-performing service members on their fitness test.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={HeartPulse} iconBg="bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400" title="Holistic Health & Fitness (H2F)" desc="Army's comprehensive wellness program">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The Army{"'"}s Holistic Health and Fitness (H2F) system is a comprehensive human performance optimization program. Other branches have similar wellness initiatives.
        </p>

        <HighlightBox variant="purple" title="H2F Five Domains">
          <ul className="space-y-1.5">
            <li><strong>Physical Readiness:</strong> Strength and conditioning, injury prevention, movement optimization</li>
            <li><strong>Nutritional Readiness:</strong> Performance nutrition, body composition management, hydration</li>
            <li><strong>Mental Readiness:</strong> Cognitive performance, stress management, mental toughness</li>
            <li><strong>Spiritual Readiness:</strong> Purpose, identity, resilience through meaning and community</li>
            <li><strong>Sleep Readiness:</strong> Sleep hygiene, recovery, fatigue management</li>
          </ul>
        </HighlightBox>

        <div className="mt-4">
          <HighlightBox variant="green" title="H2F Resources Available">
            <ul className="space-y-1">
              <li>Strength and conditioning coaches at many installations</li>
              <li>Registered dietitians for performance nutrition</li>
              <li>Cognitive performance specialists</li>
              <li>Athletic trainers for injury prevention and rehabilitation</li>
              <li>Physical therapists embedded with units</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Lightbulb} iconBg="bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" title="Training Tips & Best Practices" desc="How to prepare for and pass your fitness test">
        <div className="space-y-3">
          {[
            { title: "Start Training Early", desc: "Begin preparing at least 8–12 weeks before your test date. Gradual, progressive training is more effective and reduces injury risk compared to cramming.", variant: "green" as const },
            { title: "Train All Components Equally", desc: "Don't just run. Balance your training across strength, muscular endurance, core stability, and cardiovascular fitness to hit minimums in every event.", variant: "blue" as const },
            { title: "Simulate Test Conditions", desc: "Practice the actual events in the order and timing of the real test. Get used to performing fatigued after previous events.", variant: "purple" as const },
            { title: "Address Weak Events First", desc: "Identify your lowest-scoring event and allocate extra training time to it. Raising a low score has a bigger impact than improving an already strong one.", variant: "amber" as const },
            { title: "Use Available Resources", desc: "Take advantage of installation gyms, unit fitness leaders, H2F coaches, and branch-specific training apps (like the Navy's NOFFS program). These are free.", variant: "teal" as const },
          ].map((tip) => (
            <HighlightBox key={tip.title} variant={tip.variant} title={tip.title}>
              <p>{tip.desc}</p>
            </HighlightBox>
          ))}
        </div>
      </Accordion>

      <Accordion icon={Globe} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="Fitness Resources & Tools" desc="Official tools, apps, and training programs">
        <div className="space-y-2">
          {[
            { name: "Army AFT Official Page", desc: "Standards, scoring tables, events, and FAQs", url: "https://www.army.mil/aft/" },
            { name: "GoArmy Fitness Requirements", desc: "AFT event descriptions and training videos", url: "https://www.goarmy.com/how-to-join/requirements/fitness" },
            { name: "Navy PFA / PRT Information", desc: "Official Navy physical readiness resources", url: "https://www.mynavyhr.navy.mil/Support-Services/Culture-Resilience/Physical/" },
            { name: "Military OneSource Fitness Guide", desc: "Tips for meeting standards across all branches", url: "https://www.militaryonesource.mil/military-basics/new-to-the-military/meeting-military-fitness-standards/" },
            { name: "Military.com Fitness Tests 2026", desc: "Comparison of all current DoD fitness tests", url: "https://www.military.com/military-fitness/these-are-current-military-fitness-tests-2026" },
            { name: "NOFFS (Navy Operational Fitness)", desc: "Free Navy training apps for strength, endurance, and more", url: "https://www.navyfitness.org/fitness/noffs" },
          ].map((r) => (
            <ResourceCard key={r.name} name={r.name} url={r.url} icon={Globe} />
          ))}
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.army.mil/aft/" icon={Dumbbell}>Army AFT Standards</LinkButton>
        <LinkButton href="https://www.military.com/military-fitness/these-are-current-military-fitness-tests-2026" icon={Activity} variant="secondary">All Branch Fitness Tests</LinkButton>
        <LinkButton href="https://www.militaryonesource.mil/military-basics/new-to-the-military/meeting-military-fitness-standards/" icon={Globe} variant="secondary">Military OneSource Fitness</LinkButton>
      </div>
    </div>
  )
}

function PHAContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Periodic Health Assessment (PHA)</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Periodic Health Assessment is the annual comprehensive medical readiness screening required for all service members. It evaluates individual medical readiness, identifies health risks, and is the foundation for maintaining your deployable status. Governed by <strong className="text-foreground">DoDI 6200.06</strong>.
        </p>
      </div>

      <Callout variant="warn" icon={AlertTriangle}>
        <strong>Don{"'"}t wait:</strong> An overdue PHA will turn your Individual Medical Readiness (IMR) status red, making you non-deployable. If your PHA is approaching expiration, take action immediately — scheduling and lab work can take weeks.
      </Callout>

      <Accordion icon={ClipboardCheck} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="What is the PHA?" desc="Understanding the annual health assessment process">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The PHA is an annual screening tool used by all armed forces to evaluate individual medical readiness. It combines a self-assessment questionnaire, a clinician review of your medical records, and a face-to-face encounter that includes a mental health assessment.
        </p>

        <HighlightBox variant="blue" title="PHA Includes">
          <ul className="space-y-1.5">
            <li><strong>Health Risk Assessment:</strong> Self-reported questionnaire covering lifestyle, health history, mental health, and risk factors</li>
            <li><strong>Medical Records Review:</strong> A clinician reviews your records for any outstanding conditions or concerns</li>
            <li><strong>Face-to-Face Encounter:</strong> A provider conducts a clinical assessment including mental health screening</li>
            <li><strong>Preventive Health Counseling:</strong> Counseling on diet, exercise, dental health, tobacco cessation, alcohol use, injury prevention, and more</li>
            <li><strong>Readiness Determination:</strong> Provider determines if you are medically ready to perform military duties</li>
          </ul>
        </HighlightBox>

        <div className="mt-4">
          <HighlightBox variant="green" title="Who Needs a PHA?">
            <ul className="space-y-1">
              <li>All Active Duty service members (annually)</li>
              <li>All Selected Reserve members (annually)</li>
              <li>Individual Ready Reserve members when changing status</li>
              <li>Members being recalled to active duty or transferring components</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={ListCheck} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="How to Complete Your PHA" desc="Step-by-step process for getting it done">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The PHA is a two-part process. Part 1 is completed online by the service member. Part 2 is the clinical encounter with a healthcare provider.
        </p>

        <div className="space-y-3">
          <StepItem num={1} title="Complete Part 1 Online (Self-Assessment)" desc="Log into the MEDPROS portal (medpros.mods.army.mil/portal for Army, or your branch's equivalent system) and navigate to the Periodic Health Assessment under 'Self Service.' Complete the online health questionnaire honestly and thoroughly. This covers your health history, current symptoms, lifestyle factors, and mental health screening." />
          <StepItem num={2} title="Complete Required Lab Work" desc="Visit your nearest MTF or your primary care provider (for Tricare Prime Remote members) to complete any required labs. This typically includes HIV screening, blood type verification, and any other labs your provider orders based on your age, sex, and risk factors." />
          <StepItem num={3} title="Ensure Supporting Screenings Are Current" desc="Make sure your dental exam, vision exam, hearing test (audiogram), and immunizations are all up to date. These contribute to your overall IMR status and are often reviewed as part of the PHA process." />
          <StepItem num={4} title="Schedule Part 2 (Provider Encounter)" desc="Contact your MTF to schedule the face-to-face portion. For Active Component members at an MTF, contact your PCM's office. For Reserve Component or Tricare Prime Remote members, schedule through the VAMO (Virtual Appointment Management Office) or your RHRP (Reserve Health Readiness Program) provider. Some units use QTC Management for scheduling." />
          <StepItem num={5} title="Attend the Appointment" desc="The provider will review your Part 1 answers, discuss any concerns, conduct the mental health assessment, perform any needed physical examination, and determine your medical readiness status. Bring your shot records, medication list, and any relevant medical documents." />
          <StepItem num={6} title="Verify Completion in MEDPROS" desc="After your appointment, allow 10 business days for processing and database updates. Log back into MEDPROS to verify your PHA shows as complete and your IMR status reflects the update. If there are issues, contact your S1/G1 office." />
        </div>

        <div className="mt-4">
          <HighlightBox variant="amber" title="Troubleshooting MEDPROS Access">
            <p className="mb-2">If you have issues with the MEDPROS website, contact the MODS Help Desk:</p>
            <ul className="space-y-1">
              <li><strong>Email:</strong> usarmy.ncr.hqda-otsg.mbx.mods-helpdesk@army.mil</li>
              <li><strong>Phone:</strong> 1-877-256-6477</li>
              <li><strong>Hours:</strong> Mon–Fri 0600–1800 EST, Sat–Sun 0700–1700</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={BadgeCheck} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="PHA & Individual Medical Readiness (IMR)" desc="How the PHA connects to your readiness status">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Your PHA is one of several components that make up your Individual Medical Readiness (IMR) status. All components must be current to achieve Fully Medically Ready (FMR) status.
        </p>

        <HighlightBox variant="purple" title="IMR Components (All Must Be Green)">
          <ul className="space-y-1.5">
            <li><strong>PHA:</strong> Current within 12 months</li>
            <li><strong>Dental:</strong> Class 1 or 2 (exam within 12 months)</li>
            <li><strong>Immunizations:</strong> All required vaccinations current</li>
            <li><strong>Vision:</strong> Current eye exam on file</li>
            <li><strong>Hearing:</strong> Current audiogram on file</li>
            <li><strong>HIV:</strong> Current screening on file</li>
            <li><strong>Medical Readiness Lab Work:</strong> Any branch-specific requirements</li>
            <li><strong>Medical/Dental Profiles:</strong> No disqualifying profiles</li>
          </ul>
        </HighlightBox>

        <div className="grid gap-4 md:grid-cols-3 mt-4">
          <HighlightBox variant="green" title="FMR (Green)">
            <p>All IMR components current. You are deployable and medically ready.</p>
          </HighlightBox>
          <HighlightBox variant="amber" title="PMR (Amber)">
            <p>Partially medically ready. Some items approaching expiration or minor issues flagged.</p>
          </HighlightBox>
          <HighlightBox variant="red" title="NMR (Red)">
            <p>Not medically ready. One or more items expired or disqualifying. You are non-deployable.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Brain} iconBg="bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400" title="Mental Health Assessment (MHA)" desc="Required component of every PHA">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every PHA includes a Mental Health Assessment (MHA) conducted during the face-to-face encounter. This is a standardized screening, not a comprehensive psychiatric evaluation.
        </p>

        <HighlightBox variant="purple" title="What the MHA Covers">
          <ul className="space-y-1">
            <li>Depression screening (PHQ-2 or similar)</li>
            <li>PTSD screening</li>
            <li>Alcohol use screening (AUDIT-C)</li>
            <li>Traumatic brain injury (TBI) screening</li>
            <li>Suicidal ideation screening</li>
            <li>Assessment of overall psychological well-being</li>
          </ul>
        </HighlightBox>

        <div className="mt-4">
          <HighlightBox variant="green" title="Important: Confidentiality & Career Impact">
            <p>Answering honestly on mental health screenings is encouraged. Seeking mental health care does <strong>not</strong> automatically result in adverse career actions. The purpose of the MHA is to connect you with resources and support, not to penalize you. If you need help, the PHA is a safe opportunity to raise concerns.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Globe} iconBg="bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" title="Special Situations" desc="Remote members, OCONUS, Reserve Component">
        <div className="space-y-3">
          <HighlightBox variant="teal" title="Tricare Prime Remote Members">
            <p>Members enrolled in Tricare Prime Remote who do not have access to an MTF can complete their PHA through the Reserve Health Readiness Program (RHRP) or with their local civilian primary care provider. Use the QTC scheduling portal at smp.qtcm.com to arrange your appointment.</p>
          </HighlightBox>

          <HighlightBox variant="blue" title="OCONUS Members">
            <p>Personnel stationed overseas (except Alaska, Hawaii, and Puerto Rico) may waive the PHA pending return to CONUS for up to 90 days. Members on prolonged expeditionary deployments (e.g., six months) may waive the PHA with Commanding Officer approval.</p>
          </HighlightBox>

          <HighlightBox variant="amber" title="Reserve Component (IRR to SELRES)">
            <p>Soldiers transferring from the Individual Ready Reserve (IRR) to the Selected Reserve (TPU, AGR, or IMA) must have a current PHA and be medically cleared by the HRC Command Surgeon Office before transfer.</p>
          </HighlightBox>

          <HighlightBox variant="green" title="Virtual PHA Options">
            <p>Some MTFs offer virtual PHA appointments through the Virtual Appointment Management Office (VAMO). This can be especially helpful for geographically displaced service members. Contact your local MTF to check availability.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={CalendarCheck} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="PHA Checklist" desc="What to bring and prepare before your appointment">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Being prepared for your PHA appointment helps ensure it goes smoothly and everything gets documented correctly.
        </p>

        <div className="space-y-2">
          {[
            ["Complete Part 1 online", "Finish the self-assessment questionnaire before your appointment"],
            ["Military ID (CAC)", "Required for identification and system access"],
            ["Immunization record card", "Physical copy or digital access to verify shot records"],
            ["Current medication list", "Include prescription and over-the-counter medications, supplements"],
            ["Civilian medical records", "Any care received outside the military system since your last PHA"],
            ["List of concerns", "Write down any health issues, symptoms, or questions you want to discuss"],
            ["Glasses/contacts prescription", "If applicable, bring your current vision prescription"],
            ["Recent lab results", "If you had labs done at a civilian provider, bring copies"],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-2.5 bg-card p-3.5 rounded-lg border border-border">
              <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion icon={AlertTriangle} iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" title="Consequences of an Overdue PHA" desc="What happens if you don't complete your PHA on time">
        <div className="space-y-3">
          <HighlightBox variant="red" title="Immediate Impacts">
            <ul className="space-y-1">
              <li><strong>IMR status turns red:</strong> You are flagged as Not Medically Ready (NMR)</li>
              <li><strong>Non-deployable:</strong> You cannot deploy until your PHA is current</li>
              <li><strong>Unit readiness affected:</strong> Your status negatively impacts your unit{"'"}s overall medical readiness statistics</li>
              <li><strong>Command visibility:</strong> Commanding officers receive reports on PHA completion rates</li>
            </ul>
          </HighlightBox>

          <HighlightBox variant="amber" title="Potential Career Impacts">
            <ul className="space-y-1">
              <li>May affect favorability for assignments, schools, and special duties</li>
              <li>Can result in counseling statements or adverse administrative action</li>
              <li>Reflects poorly on leadership and personal responsibility</li>
              <li>May delay promotion processing or reenlistment</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <HighlightBox variant="blue" title="Governing Regulation">
        <p>The PHA is governed by <strong>DoDI 6200.06 (Periodic Health Assessment Program)</strong> and service-specific implementing guidance. Requirements may vary slightly by branch. The PHA is the responsibility of each individual service member, while unit commanding officers are responsible for ensuring their members complete it on time.</p>
      </HighlightBox>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.health.mil/Military-Health-Topics/Health-Readiness/Reserve-Health-Readiness-Program/Our-Services/PHA" icon={ClipboardCheck}>Health.mil PHA Information</LinkButton>
        <LinkButton href="https://www.health.mil/Military-Health-Topics/Health-Readiness" icon={Activity} variant="secondary">Military Health Readiness</LinkButton>
      </div>
    </div>
  )
}

function VAContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">VA Healthcare</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Department of Veterans Affairs provides comprehensive health care through the Veterans Health Administration. VA healthcare is a separate system from TRICARE, designed specifically for veterans who have separated from military service.
        </p>
      </div>

      <Callout variant="info" icon={Lightbulb}>
        <strong>Important:</strong> Once enrolled, you remain enrolled without having to reapply annually. However, some veterans may need to update their financial information yearly to maintain their enrollment priority group.
      </Callout>

      <Accordion icon={Clipboard} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="How to Enroll in VA Healthcare" desc="Step-by-step enrollment process">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          To apply for VA health care, complete <strong className="text-foreground">VA Form 10-10EZ</strong>, the Enrollment Application for Health Benefits.
        </p>
        <div className="space-y-3">
          <StepItem num={1} title="Online" desc="Apply at va.gov/health-care/apply/application — fastest option with real-time status updates." />
          <StepItem num={2} title="By Phone" desc="Call the toll-free number: 877-222-VETS (8387) to apply over the phone with a representative." />
          <StepItem num={3} title="In Person" desc="Visit your local VA medical center to complete the application with assistance from enrollment coordinators." />
        </div>
        <div className="mt-4">
          <HighlightBox variant="blue" title="What You'll Need">
            <ul className="space-y-1">
              <li>Social Security numbers (yours, spouse, dependents)</li>
              <li>Current health insurance card information</li>
              <li>DD-214 or military separation documents (recommended)</li>
              <li>Details about military service and toxic exposures</li>
              <li>Income information for you and dependents</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={CheckCircle} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="Priority Groups" desc="Understanding VA enrollment priority">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The VA uses your 10-10EZ application to place you into one of 8 Priority Groups. Higher priority groups have enhanced benefits and lower copays.
        </p>
        <HighlightBox variant="green" title="Factors That Determine Priority">
          <ul className="space-y-1">
            <li>Service-connected disabilities and their ratings</li>
            <li>Receipt of VA disability compensation</li>
            <li>Purple Heart, Medal of Honor, or former POW status</li>
            <li>Income level relative to VA thresholds</li>
            <li>Catastrophic disability status</li>
          </ul>
        </HighlightBox>
      </Accordion>

      <Accordion icon={HeartPulse} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="VA Healthcare Services" desc="Coverage and special programs">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          VA health care is comprehensive and portable across the entire VA system. The VA also offers specialized programs for specific conditions and populations.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Specialized Programs</h4>
            <BulletList items={[
              "Blindness Rehabilitation",
              "Agent Orange Exposure Care",
              "Military Sexual Trauma (MST)",
              "Traumatic Brain Injury (TBI)",
              "Spinal Cord Injury Care",
              "PTSD Treatment",
            ]} />
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Community Care</h4>
            <p className="text-sm text-muted-foreground mb-2">When VA authorization is granted, receive care from non-VA providers:</p>
            <BulletList items={[
              "Community doctor appointments",
              "Emergency room visits at civilian hospitals",
              "Urgent care clinic visits",
            ]} />
          </Card>
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.va.gov/health-care/apply/application" icon={Heart}>Apply for VA Healthcare</LinkButton>
        <LinkButton href="https://www.military.com/benefits/veterans-health-care" icon={Building2} variant="secondary">Military.com VA Guide</LinkButton>
      </div>
    </div>
  )
}

function MentalHealthContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Mental Health Services</h2>
        <p className="text-muted-foreground leading-relaxed">
          Mental health care is a critical benefit for service members, veterans, and their families. Both TRICARE and VA offer comprehensive services. <strong className="text-foreground">Over 1.7 million Veterans received mental health services at VA last year.</strong> Getting help is a sign of strength.
        </p>
      </div>

      <CrisisBox />

      <Accordion icon={Brain} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="TRICARE Mental Health Coverage" desc="Comprehensive services for service members and families">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          TRICARE covers a wide range of mental health services. Seeking help early leads to better outcomes.
        </p>

        <HighlightBox variant="blue" title="Covered Mental Health Services">
          <div className="grid gap-1 md:grid-cols-2">
            {[
              "Individual, group, and family therapy",
              "Psychiatric evaluations",
              "Medication management",
              "Substance use disorder treatment",
              "Inpatient psychiatric care",
              "Partial hospitalization programs",
              "Applied behavior analysis (ABA) for autism",
              "Intensive outpatient programs",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 py-0.5">
                <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </HighlightBox>

        <div className="mt-4">
          <HighlightBox variant="green" title="No Referral Needed">
            <p>TRICARE beneficiaries can <strong>self-refer</strong> for outpatient mental health care. You do not need a referral from your primary care manager.</p>
          </HighlightBox>
        </div>

        <div className="mt-4">
          <HighlightBox variant="purple" title="Conditions TRICARE Covers">
            <ul className="space-y-1">
              <li><strong>Anxiety disorders</strong> — generalized anxiety, panic disorder, social anxiety, phobias</li>
              <li><strong>Depression</strong> — major depressive disorder, persistent depressive disorder</li>
              <li><strong>PTSD</strong> — post-traumatic stress disorder</li>
              <li><strong>Bipolar disorder</strong></li>
              <li><strong>Seasonal affective disorder (SAD)</strong></li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={AlertTriangle} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="PTSD Treatment" desc="VA's world-leading PTSD care for veterans">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The VA{"'"}s National Center for PTSD is the <strong className="text-foreground">world leader in PTSD research, education, and treatment</strong>. It{"'"}s never too late to get help.
        </p>

        <HighlightBox variant="amber" title="Evidence-Based PTSD Treatments at VA">
          <ul className="space-y-1.5">
            <li><strong>Cognitive Processing Therapy (CPT):</strong> Helps understand and change how you think about trauma</li>
            <li><strong>Prolonged Exposure (PE):</strong> Teaches gradual approach to trauma-related memories</li>
            <li><strong>EMDR:</strong> Uses guided eye movements to help process traumatic memories</li>
            <li><strong>Medication:</strong> FDA-approved medications proven to help with PTSD symptoms</li>
          </ul>
        </HighlightBox>

        <Card className="p-4 mt-4">
          <h4 className="text-sm font-bold text-foreground mb-2">VA PTSD Services Include</h4>
          <BulletList items={[
            "1-to-1 mental health assessment and testing",
            "1-to-1 psychotherapy (talk therapy)",
            "Group therapy for anger management, stress, or combat support",
            "Family therapy",
            "Residential (live-in) treatment programs for severe PTSD",
            "Telemental health (counseling over phone or video)",
          ]} />
        </Card>

        <div className="mt-4">
          <HighlightBox variant="green" title="Get Help Without Enrollment">
            <p>You can walk into any VA medical center for mental health care — <strong>regardless of discharge status or VA enrollment</strong>. Same-day mental health services are available.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Activity} iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" title="Substance Use Disorder" desc="Treatment and recovery support">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Both TRICARE and VA provide comprehensive treatment for substance use disorders (SUD). Treatment is confidential.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <HighlightBox variant="blue" title="TRICARE SUD Coverage">
            <BulletList items={["Detoxification services", "Inpatient rehabilitation", "Intensive outpatient programs (IOP)", "Outpatient counseling", "Medication-assisted treatment (MAT)"]} color="bg-blue-400" />
          </HighlightBox>
          <HighlightBox variant="green" title="VA SUD Treatment">
            <BulletList items={["Medical detox", "Residential treatment programs", "Opioid treatment programs", "Medications (Suboxone, Naltrexone, etc.)", "Peer support specialists"]} color="bg-emerald-400" />
          </HighlightBox>
        </div>
        <div className="mt-4">
          <HighlightBox variant="amber" title="SAMHSA National Helpline">
            <p className="mb-1">Free, confidential, 24/7 treatment referral and information (English and Spanish)</p>
            <p className="text-lg font-bold text-foreground">1-800-662-4357</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Heart} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="Military Sexual Trauma (MST)" desc="Free counseling regardless of VA enrollment">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The VA provides <strong className="text-foreground">free MST-related care to all Veterans — even those not enrolled in VA health care</strong>.
        </p>
        <HighlightBox variant="purple" title="VA MST Services">
          <ul className="space-y-1">
            <li>Free counseling and treatment — no cost for MST-related care</li>
            <li>No documentation or proof of MST required</li>
            <li>Available regardless of when you served</li>
            <li>Includes treatment for both men and women</li>
            <li>Specialty MST coordinators at every VA facility</li>
          </ul>
        </HighlightBox>
        <div className="mt-4">
          <HighlightBox variant="red" title="Safe Helpline (DoD)">
            <p className="mb-1">Confidential crisis support for military members affected by sexual assault</p>
            <p className="text-lg font-bold text-foreground">1-877-995-5247</p>
            <a href="https://safehelpline.org" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">SafeHelpline.org <ExternalLink className="h-3 w-3" /></a>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Building2} iconBg="bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" title="Vet Centers" desc="Community-based counseling for combat veterans">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Over <strong className="text-foreground">300 Vet Centers</strong> across the U.S. provide free counseling. <strong className="text-foreground">No VA enrollment required.</strong>
        </p>
        <HighlightBox variant="teal" title="Vet Center Services (All Free)">
          <BulletList items={[
            "Individual and group counseling",
            "Couples and family counseling",
            "Military sexual trauma counseling",
            "Readjustment counseling",
            "Bereavement (grief) counseling",
            "Substance use assessment and referral",
            "Help applying for VA benefits",
            "Employment counseling",
          ]} color="bg-teal-400" />
        </HighlightBox>
        <div className="mt-4">
          <HighlightBox variant="green" title="Who Can Use Vet Centers">
            <ul className="space-y-1">
              <li>Combat Veterans from any era</li>
              <li>Veterans who experienced sexual trauma during service</li>
              <li>Veterans who served in mortuary affairs or as drone operators</li>
              <li>Family members of eligible Veterans</li>
            </ul>
          </HighlightBox>
        </div>
        <Card className="p-4 mt-4">
          <p className="text-sm font-bold text-foreground mb-1">Vet Center Call Center</p>
          <p className="text-sm text-muted-foreground">Talk with a fellow combat Veteran, 24/7/365</p>
          <p className="text-lg font-bold text-primary mt-1">1-877-927-8387</p>
        </Card>
      </Accordion>

      <Accordion icon={Users} iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" title="Additional Mental Health Resources" desc="Free counseling, apps, and support programs">
        <div className="space-y-2">
          {[
            { name: "Military OneSource", desc: "Free, confidential, non-medical counseling (up to 12 sessions)", number: "1-800-342-9647", url: "https://www.militaryonesource.mil" },
            { name: "Make the Connection", desc: "Stories of Veterans who've overcome mental health challenges", url: "https://www.maketheconnection.net" },
            { name: "VA Mobile Apps", desc: "Free apps: PTSD Coach, Mindfulness Coach, Insomnia Coach, and more", url: "https://mobile.va.gov/appstore" },
            { name: "Veteran Training Portal", desc: "Online self-help tools for anger, parenting, problem-solving — no login required", url: "https://www.veterantraining.va.gov" },
          ].map((r) => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-4 bg-card p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all group">
              <div>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
                {r.number && <p className="text-sm font-bold text-primary mt-1">{r.number}</p>}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
            </a>
          ))}
          <Card className="p-4">
            <p className="text-sm font-bold text-foreground mb-1">Military Family Life Counselors (MFLC)</p>
            <p className="text-sm text-muted-foreground">Short-term, situational counseling on installations. <strong className="text-foreground">No records kept.</strong></p>
          </Card>
          <Card className="p-4">
            <p className="text-sm font-bold text-foreground mb-1">Chaplain Services</p>
            <p className="text-sm text-muted-foreground">Confidential spiritual support available 24/7 on most installations.</p>
          </Card>
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.va.gov/health-care/health-needs-conditions/mental-health" icon={Brain}>VA Mental Health Services</LinkButton>
        <LinkButton href="https://www.tricare.mil/CoveredServices/Mental" icon={Shield} variant="secondary">TRICARE Mental Health</LinkButton>
        <LinkButton href="https://www.militaryonesource.mil/health-wellness/mental-health/" icon={Globe} variant="secondary">Military OneSource</LinkButton>
      </div>
    </div>
  )
}

function PharmacyContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Pharmacy Benefits</h2>
        <p className="text-muted-foreground leading-relaxed">
          The TRICARE Pharmacy Program provides prescription drugs safely, easily, and affordably. Administered by <strong className="text-foreground">Express Scripts</strong>, you have four pharmacy options with different costs and convenience levels.
        </p>
      </div>

      <Callout variant="success" icon={Lightbulb}>
        <strong>New in 2026: Zero Copays for Some Beneficiaries.</strong> Starting Feb. 28, 2026, active duty family members enrolled in TRICARE Prime Remote pay $0 copays for covered drugs at military pharmacies, home delivery, and retail pharmacies.
      </Callout>

      <Accordion icon={Pill} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="Pharmacy Options" desc="Four ways to fill your prescriptions">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "1. Military Pharmacy", desc: "Located at MTFs", items: ["$0 copay for most covered drugs", "Up to 90-day supply", "Best for maintenance medications"], variant: "green" as const },
            { title: "2. Home Delivery", desc: "Mail-order through Express Scripts", items: ["$0 copay for generic formulary", "Up to 90-day supply", "Free shipping, auto-refill available"], variant: "blue" as const },
            { title: "3. Retail Network", desc: "CVS, Walgreens, Walmart, etc.", items: ["Higher copays than MTF/home delivery", "Up to 30-day supply (90 for some)", "Over 56,000 network pharmacies"], variant: "amber" as const },
            { title: "4. Non-Network", desc: "Any non-TRICARE pharmacy", items: ["Highest costs — pay upfront, file claim", "Only use when necessary", "May not be reimbursed full amount"], variant: "red" as const },
          ].map((opt) => (
            <HighlightBox key={opt.title} variant={opt.variant} title={opt.title}>
              <p className="mb-2">{opt.desc}</p>
              <BulletList items={opt.items} />
            </HighlightBox>
          ))}
        </div>

        <h4 className="text-sm font-bold text-foreground mt-4 mb-2">2026 Pharmacy Copays Comparison</h4>
        <CostTable
          headers={["Drug Type", "Military Pharmacy", "Home Delivery (90-day)", "Retail Network (30-day)"]}
          rows={[
            ["Generic Formulary", "$0", "$0", "$14"],
            ["Brand-Name Formulary", "$0", "$34", "$34"],
            ["Non-Formulary", "$0", "$68", "$68"],
          ]}
          footnote="Note: Active duty members pay $0 at all pharmacy options."
        />
      </Accordion>

      <Accordion icon={FileText} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="TRICARE Formulary Explained" desc="Understanding drug tiers and coverage">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The <strong className="text-foreground">TRICARE Formulary</strong> is the list of medications covered by TRICARE. Drugs are organized into three tiers based on cost.
        </p>
        <div className="space-y-3">
          {[
            { tier: "Tier 1", name: "Generic Formulary", desc: "Lowest cost. FDA-approved generic versions with same active ingredients.", color: "green" as const },
            { tier: "Tier 2", name: "Brand-Name Formulary", desc: "Medium cost. Preferred brand-name medications approved without prior authorization.", color: "blue" as const },
            { tier: "Tier 3", name: "Non-Formulary", desc: "Highest cost. May require prior authorization — your provider must establish medical necessity.", color: "amber" as const },
          ].map((t) => (
            <div key={t.tier} className="flex items-start gap-3">
              <span className={`px-2 py-1 text-xs font-bold rounded text-white flex-shrink-0 ${t.color === "green" ? "bg-emerald-600" : t.color === "blue" ? "bg-blue-600" : "bg-amber-600"}`}>{t.tier}</span>
              <div>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <HighlightBox variant="purple" title="Search the Formulary">
            <p className="mb-2">Use the TRICARE Formulary Search Tool to look up any medication — see tier, copays, and generic alternatives.</p>
            <a href="https://www.express-scripts.com/frontend/open-enrollment/tricare/fst" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 dark:bg-violet-500 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors mt-1">
              Search Formulary <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Globe} iconBg="bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" title="Pharmacy Tools & Resources" desc="Find pharmacies, manage prescriptions, save money">
        <div className="space-y-2">
          {[
            { name: "Find a Military Pharmacy", desc: "Locate MTFs with pharmacies near you", url: "https://tricare.mil/mtf" },
            { name: "Find a Retail Network Pharmacy", desc: "Search 56,000+ network pharmacies", url: "https://militaryrx.express-scripts.com/find-pharmacy" },
            { name: "Express Scripts Account", desc: "Manage prescriptions, set up home delivery, view order status", url: "https://www.express-scripts.com/TRICARE" },
            { name: "Formulary Search Tool", desc: "Look up drug coverage, copays, and generic alternatives", url: "https://www.express-scripts.com/frontend/open-enrollment/tricare/fst" },
          ].map((r) => (
            <ResourceCard key={r.name} name={r.name} url={r.url} icon={Globe} />
          ))}
        </div>
      </Accordion>

      <Accordion icon={DollarSign} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="Save Money on Medications" desc="Tips and programs to reduce prescription costs">
        <div className="space-y-3">
          {[
            { title: "Use Military Pharmacies When Possible", desc: "$0 copay for all covered drugs — the best deal available", variant: "green" as const },
            { title: "Switch to Home Delivery for Maintenance Meds", desc: "$0 for generics, lower costs for brands, plus free shipping", variant: "blue" as const },
            { title: "Ask About Generic Alternatives", desc: "Same active ingredients as brand-names but cost significantly less", variant: "purple" as const },
            { title: "Check the Formulary Before Your Appointment", desc: "Ask your provider to prescribe formulary drugs when medically appropriate", variant: "amber" as const },
          ].map((tip) => (
            <HighlightBox key={tip.title} variant={tip.variant} title={tip.title}>
              <p>{tip.desc}</p>
            </HighlightBox>
          ))}
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.express-scripts.com/TRICARE" icon={Pill}>Express Scripts TRICARE</LinkButton>
        <LinkButton href="https://www.tricare.mil/CoveredServices/Pharmacy" icon={Shield} variant="secondary">TRICARE Pharmacy Guide</LinkButton>
      </div>
    </div>
  )
}

function DentalContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Dental & Vision Coverage</h2>
        <p className="text-muted-foreground leading-relaxed">
          Dental and vision coverage are <strong className="text-foreground">separate from TRICARE medical coverage</strong>. Your options depend on your status: active duty, family member, retiree, or Guard/Reserve.
        </p>
      </div>

      <Accordion icon={Smile} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="Active Duty Dental Program (ADDP)" desc="Free dental care for active duty service members">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Active duty service members receive comprehensive dental care at military dental clinics at <strong className="text-foreground">no cost</strong>.
        </p>
        <HighlightBox variant="blue" title="What's Covered">
          <BulletList items={["Routine exams and cleanings", "X-rays", "Fillings and restorations", "Root canals", "Extractions", "Crowns and bridges", "Orthodontics (when mission-required)"]} color="bg-blue-400" />
        </HighlightBox>
        <div className="mt-4">
          <HighlightBox variant="green">
            <p className="text-2xl font-bold text-foreground">$0</p>
            <p>No premiums, no copays, no deductibles for active duty</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Smile} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="TRICARE Dental Program (TDP)" desc="For family members and Guard/Reserve">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Voluntary dental plan for eligible family members and Guard/Reserve. Managed by <strong className="text-foreground">United Concordia Companies, Inc.</strong>
        </p>

        <CostTable
          headers={["Enrollment Type", "Active Duty Family", "Guard/Reserve"]}
          rows={[
            ["Single", "$13.58/month", "$13.58/month"],
            ["Single + 1", "$27.15/month", "$40.73/month"],
            ["Family", "$40.73/month", "$81.45/month"],
          ]}
        />

        <div className="mt-4">
          <HighlightBox variant="blue" title="TDP Coverage Summary">
            <ul className="space-y-1">
              <li><strong>Diagnostic & Preventive:</strong> 100% covered (exams, cleanings, x-rays)</li>
              <li><strong>Basic Restorative:</strong> 80% covered (fillings, extractions)</li>
              <li><strong>Major Restorative:</strong> 50% covered (crowns, bridges, dentures)</li>
              <li><strong>Orthodontics:</strong> 50% covered ($1,750 lifetime max)</li>
              <li><strong>Annual Maximum:</strong> $1,500 per person</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Smile} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="FEDVIP Dental" desc="For retirees and their families">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The Federal Employees Dental and Vision Insurance Program (FEDVIP) offers dental coverage to military retirees. Multiple plan options available.
        </p>
        <HighlightBox variant="blue" title="Available FEDVIP Dental Plans (2026)">
          <BulletList items={["Aetna Dental", "Delta Dental", "Dominion National", "GEHA", "Humana", "MetLife", "United Concordia"]} color="bg-blue-400" />
          <p className="mt-2">Premiums and benefits vary by plan. Compare options at BENEFEDS.</p>
        </HighlightBox>
        <div className="mt-4">
          <HighlightBox variant="amber" title="Enrollment Period">
            <p>Federal Benefits Open Season: <strong>November – December</strong> each year. Also available during Qualifying Life Events.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Eye} iconBg="bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400" title="Active Duty Vision Care" desc="Comprehensive vision benefits for service members">
        <HighlightBox variant="teal" title="What's Covered">
          <BulletList items={["Annual comprehensive eye exams", "Prescription glasses (military-issue frames)", "Contact lenses (when medically necessary)", "Protective mask inserts", "Safety glasses for certain jobs"]} color="bg-teal-400" />
        </HighlightBox>
        <div className="mt-4">
          <HighlightBox variant="green">
            <p className="text-2xl font-bold text-foreground">$0</p>
            <p>No premiums, no copays for active duty at military facilities</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Eye} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="Limited TRICARE Vision Coverage" desc="What TRICARE does and doesn't cover">
        <HighlightBox variant="amber" title="Important: TRICARE Has Limited Vision Coverage">
          <p>For most beneficiaries (family members, retirees), TRICARE medical coverage does <strong>NOT</strong> include routine eye exams, glasses, or contact lenses.</p>
        </HighlightBox>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-2">TRICARE DOES Cover</h4>
            <BulletList items={["Eye exams for medical conditions (diabetes, glaucoma)", "Eye surgery for medical necessity", "Treatment for eye injuries and diseases", "Prime/TYA Prime: Routine exam every 2 years"]} />
          </Card>
          <HighlightBox variant="red" title="TRICARE Does NOT Cover">
            <ul className="space-y-1">
              <li>Routine eye exams (for Select, TFL, most plans)</li>
              <li>Glasses or contact lenses</li>
              <li>LASIK or refractive surgery (unless active duty)</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Eye} iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" title="FEDVIP Vision" desc="Vision coverage for retirees and families">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          FEDVIP Vision provides routine eye exams and coverage for glasses/contacts to eligible beneficiaries.
        </p>
        <HighlightBox variant="blue" title="Typical FEDVIP Vision Benefits">
          <ul className="space-y-1">
            <li><strong>Eye Exam:</strong> Covered annually (low or no copay)</li>
            <li><strong>Glasses:</strong> Frames + lenses allowance each year</li>
            <li><strong>Contacts:</strong> Annual allowance for contact lenses</li>
            <li><strong>Discounts:</strong> Additional savings on LASIK, lens upgrades</li>
          </ul>
          <p className="mt-2">Premiums typically range from $10-30/month depending on plan and coverage level.</p>
        </HighlightBox>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.tricare.mil/CoveredServices/Dental" icon={Smile}>TRICARE Dental</LinkButton>
        <LinkButton href="https://www.tricare.mil/CoveredServices/Vision" icon={Eye} variant="secondary">TRICARE Vision</LinkButton>
        <LinkButton href="https://www.benefeds.com" icon={FileText} variant="secondary">FEDVIP Enrollment</LinkButton>
      </div>
    </div>
  )
}

function CrisisContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Crisis Support & Emergency Resources</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you or someone you know is in crisis, <strong className="text-foreground">help is available 24/7</strong>. Below is a comprehensive list of crisis hotlines and emergency resources.
        </p>
      </div>

      {/* Primary Crisis Line */}
      <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full flex-shrink-0">
            <Phone className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">Veterans Crisis Line</h3>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">988 (Press 1)</p>
            <p className="text-sm text-muted-foreground mb-3">Call, text, or chat available <strong className="text-foreground">24/7/365</strong>. Confidential support from trained responders.</p>
            <div className="flex flex-wrap gap-2">
              <a href="tel:988" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">Call 988 Now</a>
              <a href="sms:838255" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors">Text 838255</a>
              <a href="https://www.veteranscrisisline.net/get-help/chat" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors">Chat Online <ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </div>
      </div>

      <Accordion icon={Phone} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="All Crisis & Emergency Hotlines" desc="Complete directory of important numbers">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Suicide & Mental Health Crisis</h4>
        <div className="space-y-2 mb-6">
          <HotlineItem name="988 Suicide & Crisis Lifeline" desc="For anyone — mental health, substance use, emotional distress" number="988" />
          <HotlineItem name="Veterans Crisis Line" desc="Veterans, service members, and families (24/7)" number="988 (Press 1)" />
          <HotlineItem name="Crisis Text Line" desc="Text HOME to connect with a counselor" number="Text 741741" />
        </div>

        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Military-Specific Support</h4>
        <div className="space-y-2 mb-6">
          <HotlineItem name="Military OneSource" desc="Free counseling, resources (active duty, Guard, Reserve, families)" number="1-800-342-9647" />
          <HotlineItem name="Military Crisis Line (Overseas)" desc="For those stationed outside the U.S." number="DSN 988" />
          <HotlineItem name="Vet Center Call Center" desc="Talk to a combat veteran (24/7)" number="1-877-927-8387" />
          <HotlineItem name="MHS Nurse Advice Line" desc="Medical advice for TRICARE beneficiaries (24/7)" number="1-800-874-2273" />
        </div>

        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Substance Abuse</h4>
        <div className="space-y-2 mb-6">
          <HotlineItem name="SAMHSA National Helpline" desc="Substance abuse treatment referrals (24/7, English/Spanish)" number="1-800-662-4357" />
        </div>

        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Sexual Assault & Domestic Violence</h4>
        <div className="space-y-2 mb-6">
          <HotlineItem name="DoD Safe Helpline" desc="Sexual assault support for military (24/7)" number="1-877-995-5247" />
          <HotlineItem name="National Domestic Violence Hotline" desc="Domestic violence support (24/7)" number="1-800-799-7233" />
          <HotlineItem name="RAINN (Sexual Assault)" desc="National Sexual Assault Hotline (24/7)" number="1-800-656-4673" />
        </div>

        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Homeless Veterans</h4>
        <div className="space-y-2 mb-6">
          <HotlineItem name="National Call Center for Homeless Veterans" desc="Housing assistance, VA programs (24/7)" number="1-877-424-3838" />
        </div>

        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">General VA & Health Support</h4>
        <div className="space-y-2">
          <HotlineItem name="VA Health Benefits Hotline" desc="Enrollment, benefits questions" number="1-877-222-8387" />
          <HotlineItem name="VA General Information" desc="VA benefits and services (Mon-Fri 8a-9p ET)" number="1-800-827-1000" />
          <HotlineItem name="Caregiver Support Line" desc="Support for caregivers of Veterans" number="1-855-260-3274" />
          <HotlineItem name="Coaching Into Care" desc="Help encouraging a Veteran to seek care" number="1-888-823-7458" />
        </div>
      </Accordion>

      <Accordion icon={AlertTriangle} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="Warning Signs & How to Help" desc="Recognizing crisis and taking action">
        <HighlightBox variant="amber" title="Warning Signs of Crisis">
          <ul className="space-y-1">
            <li>Talking about wanting to die or feeling like a burden</li>
            <li>Looking for ways to harm themselves</li>
            <li>Talking about feeling hopeless or having no reason to live</li>
            <li>Withdrawing from friends, family, and activities</li>
            <li>Extreme mood swings or sudden calmness after depression</li>
            <li>Increased alcohol or drug use</li>
            <li>Giving away prized possessions</li>
            <li>Reckless or dangerous behavior</li>
          </ul>
        </HighlightBox>

        <div className="mt-4">
          <HighlightBox variant="blue" title="How to Help Someone in Crisis">
            <ol className="list-decimal list-inside space-y-1.5">
              <li><strong>Ask directly:</strong> {"'"}Are you thinking about suicide?{"'"} (Asking does NOT plant the idea)</li>
              <li><strong>Listen without judgment:</strong> Let them talk</li>
              <li><strong>Keep them safe:</strong> Remove access to lethal means if safe to do so</li>
              <li><strong>Stay with them:</strong> Don{"'"}t leave them alone</li>
              <li><strong>Connect to help:</strong> Help them call 988 or take them to an ER</li>
              <li><strong>Follow up:</strong> Check in on them in the days after</li>
            </ol>
          </HighlightBox>
        </div>

        <div className="mt-4">
          <HighlightBox variant="green" title="Remember">
            <p>You don{"'"}t have to be an expert to help. Just being there and listening can save a life. When in doubt, call 988.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Globe} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="Online Resources & Apps" desc="Digital tools for crisis support and self-help">
        <div className="space-y-2">
          {[
            { name: "Veterans Crisis Line Chat", desc: "Confidential online chat with crisis counselors", url: "https://www.veteranscrisisline.net/get-help/chat" },
            { name: "988 Lifeline Chat", desc: "24/7 online chat for anyone in crisis", url: "https://988lifeline.org/chat" },
            { name: "Safe Helpline Online", desc: "Chat support for military sexual assault survivors", url: "https://safehelpline.org" },
            { name: "PTSD Coach App", desc: "Free app for managing PTSD symptoms", url: "https://mobile.va.gov/app/ptsd-coach" },
            { name: "Make the Connection", desc: "Stories of Veterans who found help, plus resources", url: "https://www.maketheconnection.net" },
          ].map((r) => (
            <ResourceCard key={r.name} name={r.name} url={r.url} icon={Globe} />
          ))}
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.veteranscrisisline.net" icon={Phone}>Veterans Crisis Line</LinkButton>
        <LinkButton href="https://988lifeline.org" icon={Heart} variant="secondary">988 Lifeline</LinkButton>
        <LinkButton href="https://www.mentalhealth.va.gov/suicide_prevention" icon={Shield} variant="secondary">Suicide Prevention</LinkButton>
      </div>
    </div>
  )
}

// ─── Content Map ─────────────────────────────────────────────────────────────

const contentMap: Record<string, React.FC> = {
  home: HomeContent,
  tricare: TricareContent,
  plans: PlansContent,
  predeployment: PreDeploymentContent,
  fitness: FitnessContent,
  pha: PHAContent,
  va: VAContent,
  mental: MentalHealthContent,
  pharmacy: PharmacyContent,
  dental: DentalContent,
  crisis: CrisisContent,
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MedicalPage() {
  const [activeCategory, setActiveCategory] = useState("home")
  const [pageLabel, setPageLabel] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const ContentComponent = contentMap[activeCategory] || HomeContent

  return (
    <div className="min-h-screen bg-background">
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
              Services
            </a>
            <ChevronRight className="h-4 w-4" />
            {activeCategory !== "home" ?
              <div className="flex items-center gap-2">
                <a onClick={() => setActiveCategory("home")} className="hover:text-primary transition-colors cursor-pointer">Medical</a>
                <ChevronRight className="h-4 w-4" />
                <a className="text-foreground font-medium">
                  {pageLabel}
                </a>
              </div>
              : <span className="text-foreground font-medium">Medical</span>
            }
          </div>
        </div>
      </div>

      {/* Layout: Sidebar + Main */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-200px)]">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className="w-full lg:w-80 bg-sidebar border-r overflow-y-auto">
          <div className="top-20 p-6">
            <h2 onClick={() => setActiveCategory("home")} className="text-2xl font-bold text-sidebar-foreground mb-3 pb-3 border-b-2 border-muted-foreground text-center cursor-pointer">
              Medical Services
            </h2>
            <div className="space-y-3">
              <a key={"wellness-hub"} href={`/services/command-center/wellness`} className="block">
                <Card
                  key={"wellness-hub"}
                  className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                      <BicepsFlexed className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        Fitness and Wellness Hub
                      </h3>
                    </div>
                  </div>
                </Card>
              </a>
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Card
                    key={category.name}
                    onClick={() => {setActiveCategory(category.id); setPageLabel(category.name)}}
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
                )
              })}
            </div>

            <div className="mt-8 pt-5 border-t border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] px-3 mb-2">
                Quick Links
              </p>
              <div className="space-y-0.5">
                {quickLinks.map((link) => {
                  const LinkIcon = link.icon
                  return (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span className="truncate">{link.name}</span>
                      <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0 opacity-50" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="max-w-4xl p-6 lg:p-10">
            <ContentComponent />
          </div>
        </main>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden w-12 h-12 rounded-full bg-[#0a1628] dark:bg-primary text-white dark:text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>
  )
}