"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  ArrowLeft, Scale, Shield, CheckCircle2, Circle,
  ExternalLink, FileText, AlertTriangle, ChevronRight, Phone,
  Briefcase, Heart, CreditCard, ChevronDown,
  RotateCcw, Plus, Pencil, Trash2, Pin, PinOff,
  ClipboardCheck, LayoutDashboard, MapPinned, Library,
  Search, PhoneCall, Users, Gavel, ShieldCheck, HandHelping,
  MessageSquare, Landmark, ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useDocuments, type Document } from "@/hooks/use-documents"
import { CommunicationHubProvider, useCommunicationHub } from "@/hooks/use-communication-hub"
import {
  useLegalChecklist, useLegalNotes, type NoteRow,
} from "@/hooks/use-legal"

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════════════════════ */

interface LegalChecklistItemDef {
  id: string; label: string; description: string
  category: "documents" | "estate" | "financial" | "family" | "deployment"
  linkedDocType?: string; priority: "critical" | "recommended" | "optional"
  helpUrl?: string
}

const LEGAL_CHECKLIST_ITEMS: LegalChecklistItemDef[] = [
  { id: "will", label: "Will & Testament", description: "Execute or update your last will and testament through your installation's legal assistance office.", category: "documents", linkedDocType: "will", priority: "critical", helpUrl: "https://www.militaryonesource.mil/resources/millife-guides/estate-planning/" },
  { id: "poa-general", label: "General Power of Attorney", description: "Designate someone to act on your behalf for legal and financial matters while deployed.", category: "documents", linkedDocType: "poa", priority: "critical" },
  { id: "poa-special", label: "Special Power of Attorney", description: "Limited POA for specific transactions — vehicle titles, property sales, tax filing.", category: "documents", linkedDocType: "poa", priority: "recommended" },
  { id: "advance-directive", label: "Advance Medical Directive", description: "Document your healthcare wishes and designate a healthcare proxy.", category: "documents", linkedDocType: "medical", priority: "critical" },
  { id: "beneficiaries", label: "Review Beneficiary Designations", description: "Verify SGLI, TSP, bank accounts, and retirement plan beneficiaries are current.", category: "estate", linkedDocType: "financial", priority: "critical" },
  { id: "sgli-review", label: "SGLI Coverage Review", description: "Confirm SGLI coverage amount ($400K max) and Family SGLI elections. Update SGLV 8286.", category: "estate", linkedDocType: "insurance", priority: "critical", helpUrl: "https://www.va.gov/life-insurance/options-eligibility/sgli/" },
  { id: "life-insurance-private", label: "Private Life Insurance", description: "Review any supplemental civilian life insurance policies.", category: "estate", linkedDocType: "insurance", priority: "recommended" },
  { id: "dd93", label: "DD Form 93 (Record of Emergency Data)", description: "Update person authorized to direct disposition, SGLI beneficiaries, emergency contacts.", category: "estate", priority: "critical" },
  { id: "allotments", label: "Set Up Pay Allotments", description: "Ensure allotments cover mortgage/rent, utilities, car payments, and family needs.", category: "financial", priority: "recommended" },
  { id: "tax-documents", label: "Organize Tax Documents", description: "Gather W-2s, tax returns, financial records. Consider free VITA tax assistance on base.", category: "financial", linkedDocType: "financial", priority: "recommended", helpUrl: "https://www.militaryonesource.mil/financial-legal/tax-resource-center/miltax-military-tax-services/" },
  { id: "debt-inventory", label: "Debt & Account Inventory", description: "List all debts, accounts, login credentials, and recurring payments.", category: "financial", priority: "optional" },
  { id: "scra-interest", label: "Request SCRA Interest Rate Reduction", description: "Notify lenders in writing to cap pre-service debts at 6% APR under SCRA.", category: "financial", priority: "recommended", helpUrl: "https://scra.dmdc.osd.mil" },
  { id: "family-care-plan", label: "Family Care Plan", description: "Establish short-term and long-term care arrangements for dependents.", category: "family", priority: "critical" },
  { id: "emergency-contacts", label: "Update Emergency Contacts", description: "Ensure DD Form 93 and SGLV 8286 contacts are current. Verify DEERS enrollment.", category: "family", priority: "critical" },
  { id: "childcare-poa", label: "Childcare Power of Attorney", description: "Authorize a caregiver for medical decisions and school enrollment.", category: "family", priority: "recommended" },
  { id: "id-cards", label: "Dependent ID Cards", description: "Ensure all dependents have valid military ID cards and understand TRICARE access.", category: "family", linkedDocType: "identification", priority: "recommended" },
  { id: "vehicle-storage", label: "Vehicle Storage & Insurance", description: "Arrange storage, adjust insurance to storage rates, file SCRA protections.", category: "deployment", linkedDocType: "property", priority: "recommended" },
  { id: "lease-review", label: "Lease / Housing Review", description: "Review SCRA lease-termination rights. Notify landlord with deployment orders.", category: "deployment", linkedDocType: "property", priority: "recommended", helpUrl: "https://www.militaryonesource.mil/deployment/pre-deployment/military-clause-terminate-your-lease-due-to-deployment-or-pcs/" },
  { id: "scra-protections", label: "SCRA Protections Filed", description: "File SCRA protections — interest caps, eviction protection, contract termination.", category: "deployment", priority: "recommended", helpUrl: "https://scra.dmdc.osd.mil" },
  { id: "mail-forwarding", label: "Mail Forwarding / Secure Storage", description: "Set up USPS mail forwarding or arrange a trusted person to handle mail.", category: "deployment", priority: "optional" },
]

const LEGAL_CATEGORY_META: Record<string, {
  label: string; icon: typeof Scale; color: string
  bgColor: string; accentHex: string
}> = {
  documents: { label: "Legal Documents", icon: FileText, color: "text-indigo-700 dark:text-indigo-300", bgColor: "bg-indigo-500/10 dark:bg-indigo-500/20", accentHex: "#4F46E5" },
  estate: { label: "Estate & Beneficiaries", icon: Shield, color: "text-emerald-700 dark:text-emerald-300", bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20", accentHex: "#059669" },
  financial: { label: "Financial & SCRA", icon: CreditCard, color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-500/10 dark:bg-amber-500/20", accentHex: "#D97706" },
  family: { label: "Family Preparedness", icon: Heart, color: "text-rose-700 dark:text-rose-300", bgColor: "bg-rose-500/10 dark:bg-rose-500/20", accentHex: "#E11D48" },
  deployment: { label: "Deployment Prep", icon: Briefcase, color: "text-sky-700 dark:text-sky-300", bgColor: "bg-sky-500/10 dark:bg-sky-500/20", accentHex: "#0284C7" },
}

interface LegalResourceLink {
  id: string; title: string; description: string
  category: "scra" | "wills" | "family" | "financial" | "benefits" | "deployment" | "general"
  url: string; phone?: string; org: string
}

const LEGAL_RESOURCE_LINKS: LegalResourceLink[] = [
  { id: "milify", title: "Milify Legal Benefits", description: "View legal benefits afforded to servicemembers.", category: "general", url: "/services/legal", org: "Milify" },
  { id: "afla", title: "Armed Forces Legal Assistance Locator", description: "Find your nearest military legal assistance office by zip code or installation.", category: "general", url: "https://legalassistance.law.af.mil/", org: "DoD" },
  { id: "mil-onesource-legal", title: "Military OneSource — Free Legal Help", description: "Confidential consultations with licensed attorneys on personal civil-legal matters at no cost.", category: "general", url: "https://www.militaryonesource.mil/financial-legal/legal/", phone: "1-800-342-9647", org: "Military OneSource" },
  { id: "aba-probono", title: "ABA Military Pro Bono Project", description: "Free legal representation for active duty service members who cannot obtain adequate legal assistance on base.", category: "general", url: "https://www.militaryprobono.org/", org: "American Bar Association" },
  { id: "stateside-legal", title: "Stateside Legal", description: "Free legal help for lower-income military families. Covers family law, housing, consumer issues, and benefits.", category: "general", url: "https://www.statesidelegal.org/", org: "Stateside Legal" },
  { id: "scra-lookup", title: "SCRA Website & Active Duty Verification", description: "Verify active duty status for SCRA claims. Download free certificates for lenders and courts.", category: "scra", url: "https://scra.dmdc.osd.mil/scra/#/home", org: "DMDC" },
  { id: "scra-doj", title: "DOJ — Servicemembers Civil Relief Act", description: "Full SCRA text, enforcement information, and how to file a complaint.", category: "scra", url: "https://www.justice.gov/servicemembers/servicemembers-civil-relief-act-scra", org: "Dept. of Justice" },
  { id: "cfpb-military", title: "CFPB Office of Servicemember Affairs", description: "File complaints about financial products and learn your consumer rights.", category: "financial", url: "https://www.consumerfinance.gov/consumer-tools/educator-tools/servicemembers/", phone: "1-855-411-2372", org: "CFPB" },
  { id: "mla-info", title: "Military Lending Act (MLA) Protections", description: "36% MAPR cap on consumer credit for active duty service members.", category: "financial", url: "https://www.consumerfinance.gov/consumer-tools/educator-tools/servicemembers/the-military-lending-act/", org: "CFPB" },
  { id: "tsp-info", title: "TSP — Deployment & BRS", description: "Manage TSP contributions during deployment. Tax-exempt combat zone contributions.", category: "financial", url: "https://www.tsp.gov/military/", org: "TSP" },
  { id: "vita-irs", title: "MilTax / VITA Free Tax Preparation", description: "Free tax filing for military members. Available on most installations.", category: "financial", url: "https://www.militaryonesource.mil/financial-legal/tax-resource-center/miltax-military-tax-services/", org: "IRS / MilTax" },
  { id: "will-army", title: "Army Will Preparation Guide", description: "Step-by-step guide to preparing your will through Army legal assistance.", category: "wills", url: "https://myarmybenefits.us.army.mil/Benefit-Library/Federal-Benefits/Wills", org: "U.S. Army" },
  { id: "sgli-va", title: "SGLI / FSGLI — VA Life Insurance", description: "Manage Servicemembers' Group Life Insurance. Update beneficiaries, file claims.", category: "benefits", url: "https://www.va.gov/life-insurance/options-eligibility/sgli/", org: "VA" },
  { id: "va-vso", title: "Find a Veterans Service Organization", description: "Free legal representation on VA claims, appeals, and benefits.", category: "benefits", url: "https://www.va.gov/vso/", org: "VA" },
  { id: "nvlsp", title: "National Veterans Legal Services Program", description: "Advocacy and legal representation for veterans denied VA benefits.", category: "benefits", url: "https://www.nvlsp.org/", org: "NVLSP" },
  { id: "family-advocacy", title: "Family Advocacy Program", description: "Support for family legal matters — custody, domestic situations, prevention services.", category: "family", url: "https://www.militaryonesource.mil/family-relationships/family-life/family-advocacy-program/", phone: "1-800-342-9647", org: "Military OneSource" },
  { id: "deers-update", title: "Update DEERS & Dependent Info", description: "Ensure dependents are enrolled for ID cards, TRICARE, and commissary access.", category: "family", url: "https://milconnect.dmdc.osd.mil/milconnect/", org: "DMDC" },
  { id: "deployment-guide", title: "Pre-Deployment Legal Checklist", description: "Milify deployment checklist covering legal readiness requirements.", category: "deployment", url: "/transitions/deployment", org: "Milify" },
  { id: "sbd-va", title: "Survivors & Dependents Benefits", description: "DIC, SGLI payouts, education benefits, and housing assistance for families.", category: "benefits", url: "https://www.va.gov/survivors/", org: "VA" },
]

const LEGAL_RESOURCE_CATEGORIES = [
  { value: "all", label: "All Resources" }, { value: "general", label: "General Legal" },
  { value: "scra", label: "SCRA" }, { value: "financial", label: "Financial" },
  { value: "wills", label: "Wills & Estate" }, { value: "family", label: "Family" },
  { value: "benefits", label: "VA & Benefits" }, { value: "deployment", label: "Deployment" },
]

const SCRA_FAQ = [
  { q: "What is the SCRA?", a: "The Servicemembers Civil Relief Act (50 U.S.C. §§ 3901–4043) provides legal protections to active duty service members. It covers interest rate caps, lease termination rights, eviction protection, default judgment protections, and more." },
  { q: "Who is eligible for SCRA protections?", a: "Active duty members of the Army, Navy, Air Force, Marine Corps, Coast Guard, and commissioned members of NOAA and the Public Health Service. Reservists and National Guard members are covered when activated under federal orders." },
  { q: "How do I cap my interest rates at 6%?", a: "Send a written request to each creditor along with a copy of your military orders. Lenders must reduce the rate on all pre-service obligations to no more than 6% APR. The reduction applies for the duration of military service plus an additional period after." },
  { q: "Can I break my lease under SCRA?", a: "Yes. You may terminate a residential lease early if you receive PCS orders, deployment orders of 90+ days, or are entering active duty. Provide written notice and a copy of orders to the landlord. Rent obligations end 30 days after the next rent due date following your notice." },
  { q: "What about eviction protection?", a: "A landlord cannot evict you or your dependents from a residence where rent is below a certain threshold (adjusted annually for inflation) without a court order while you are on active duty. The court can stay proceedings for up to 90 days or longer." },
  { q: "How do I verify my active duty status for SCRA?", a: "Use the free SCRA website at scra.dmdc.osd.mil to generate an official certificate verifying your active duty status. This certificate can be provided to courts, lenders, and landlords at no charge." },
  { q: "Does SCRA protect against default judgments?", a: "Yes. Before a court can enter a default judgment, the plaintiff must file an affidavit stating whether the defendant is in military service. If you are on active duty and a default judgment is entered, you may reopen it within specific time limits." },
  { q: "Can I terminate contracts like cell phone or gym memberships?", a: "Yes. You can terminate certain service contracts (cell phone, internet, gym memberships, etc.) upon receiving military orders for a PCS, deployment of 90+ days, or a stop-movement order. Provide written notice and a copy of your orders." },
]

const EMERGENCY_HOTLINES = [
  { name: "Military OneSource", phone: "1-800-342-9647", desc: "24/7 legal & life support — interpreters available", available: "24/7" },
  { name: "Veterans Crisis Line", phone: "988 (press 1)", desc: "Confidential crisis support for all service members", available: "24/7" },
  { name: "CFPB Servicemember Line", phone: "1-855-411-2372", desc: "Financial complaints & consumer protection", available: "M–F 8am–8pm ET" },
  { name: "VA Benefits Hotline", phone: "1-800-827-1000", desc: "Claims, appeals, and benefits questions", available: "M–F 8am–9pm ET" },
]

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function ReadinessRing({ percentage, size = 136 }: { percentage: number; size?: number }) {
  const radius = (size / 2) - 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const color = percentage >= 80
    ? "text-emerald-500 dark:text-emerald-400"
    : percentage >= 50
      ? "text-amber-500 dark:text-amber-400"
      : "text-red-500 dark:text-red-400"
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Legal readiness score: ${percentage} percent`}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className={cn(color, "transition-all duration-700 ease-out")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold tracking-tight", color)}>{percentage}<span className="text-lg">%</span></span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mt-0.5">Ready</span>
      </div>
    </div>
  )
}

function ChecklistCategory({ category, items, completionMap, onToggle, linkedDocs }: {
  category: string
  items: LegalChecklistItemDef[]
  completionMap: Record<string, { completed: boolean; notes: string | null }>
  onToggle: (id: string) => void
  linkedDocs: Document[]
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = LEGAL_CATEGORY_META[category]
  const completed = items.filter((i) => completionMap[i.id]?.completed).length
  const Icon = meta.icon
  const pct = items.length > 0 ? (completed / items.length) * 100 : 0

  /* Auto-check items that have a linked doc in the vault */
  useEffect(() => {
    if (!items.length || !linkedDocs.length) return
    items.forEach((item) => {
      if (!item.linkedDocType) return
      const hasDoc = linkedDocs.some((d) => d.documentType === item.linkedDocType)
      const rowExists = completionMap[item.id]
      if (hasDoc && !rowExists) onToggle(item.id)
    })
  }, [items, linkedDocs, completionMap, onToggle])

  return (
    <div className={cn(
      "border rounded-2xl overflow-hidden bg-card transition-all duration-200",
      expanded && "ring-1 ring-primary/10 shadow-sm"
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`category-${category}`}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
      >
        <div className="flex items-center gap-3.5">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", meta.bgColor)}>
            <Icon className={cn("w-[18px] h-[18px]", meta.color)} aria-hidden="true" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm">{meta.label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{completed} of {items.length} complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-28">
            <Progress value={pct} className="h-1.5" aria-label={`${meta.label}: ${Math.round(pct)}% complete`} />
          </div>
          <div className={cn("transition-transform duration-200", expanded && "rotate-180")}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>
      </button>

      {expanded && (
        <div id={`category-${category}`} className="border-t divide-y" role="group" aria-label={`${meta.label} checklist items`}>
          {items.map((item) => {
            const done = completionMap[item.id]?.completed ?? false
            const hasDoc = item.linkedDocType ? linkedDocs.some((d) => d.documentType === item.linkedDocType) : false
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3.5 p-4 sm:px-5 transition-colors",
                  done && "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]"
                )}
              >
                <button
                  onClick={() => onToggle(item.id)}
                  className="mt-0.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
                  aria-label={`${done ? "Uncheck" : "Check"}: ${item.label}`}
                  aria-pressed={done}
                >
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <Circle className="w-5 h-5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "text-sm font-semibold leading-tight",
                      done && "line-through text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                    {item.priority === "critical" && (
                      <Badge variant="destructive" className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider">Critical</Badge>
                    )}
                    {item.priority === "optional" && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium uppercase tracking-wider">Optional</Badge>
                    )}
                    {hasDoc && (
                      <Link href="./documents">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium cursor-pointer hover:bg-accent/10 transition-colors">
                          <FileText className="w-2.5 h-2.5 mr-1" aria-hidden="true" />In Vault
                        </Badge>
                      </Link>
                    )}
                  </div>
                  <p className={cn("text-xs text-muted-foreground mt-1 leading-relaxed", done && "opacity-50")}>
                    {item.description}
                  </p>
                  {item.helpUrl && (
                    <a
                      href={item.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline mt-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                    >
                      <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />Learn more
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LegalResourceCard({ resource }: { resource: LegalResourceLink }) {
  const catColors: Record<string, string> = {
    scra: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    wills: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    family: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    financial: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    benefits: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    deployment: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    general: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  }
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border rounded-2xl p-5 bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className="flex items-start gap-3.5">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          catColors[resource.category] || catColors.general
        )}>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm leading-tight group-hover:text-accent transition-colors">{resource.title}</h4>
            <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-hidden="true" />
          </div>
          <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{resource.org}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{resource.description}</p>
          {resource.phone && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
              <Phone className="w-3 h-3" aria-hidden="true" />{resource.phone}
            </span>
          )}
        </div>
      </div>
    </a>
  )
}

function NoteCard({ note, onEdit, onDelete, onTogglePin }: {
  note: NoteRow; onEdit: () => void; onDelete: () => void; onTogglePin: () => void
}) {
  return (
    <div className={cn(
      "border rounded-2xl p-4 bg-card transition-all",
      note.pinned && "border-accent/30 ring-1 ring-accent/10 shadow-sm"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm truncate">{note.title}</h4>
            {note.pinned && <Pin className="w-3 h-3 text-accent flex-shrink-0" aria-label="Pinned" />}
            {note.category && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{note.category}</Badge>}
          </div>
          {note.content && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed">{note.content}</p>}
          <p className="text-[10px] text-muted-foreground/40 mt-2 font-medium">
            {new Date(note.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onTogglePin} aria-label={note.pinned ? "Unpin note" : "Pin note"}>
            {note.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} aria-label="Edit note">
            <Pencil className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={onDelete} aria-label="Delete note">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function NoteDialog({ open, onOpenChange, onSave, editing }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: { title: string; content: string; category: string }) => void
  editing?: NoteRow | null
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  useEffect(() => {
    if (open) {
      setTitle(editing?.title || "")
      setContent(editing?.content || "")
      setCategory(editing?.category || "")
    }
  }, [open, editing])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editing ? "Edit Note" : "Add Note"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
            <Input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title…" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-cat" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category <span className="font-normal normal-case tracking-normal opacity-60">(optional)</span>
            </Label>
            <Input id="note-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., SCRA, deployment" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-content" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content</Label>
            <Textarea id="note-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note…" rows={6} className="resize-none" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave({ title, content, category }); onOpenChange(false) }} disabled={!title.trim()}>
            {editing ? "Save Changes" : "Add Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SCRAAccordionItem({ item, isOpen, onToggle }: { item: { q: string; a: string }; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={cn("border rounded-xl overflow-hidden bg-card transition-all", isOpen && "ring-1 ring-accent/10 shadow-sm")}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
      >
        <span className="font-bold text-sm pr-4">{item.q}</span>
        <div className={cn("transition-transform duration-200 flex-shrink-0", isOpen && "rotate-180")}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </div>
      </button>
      {isOpen && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-muted-foreground leading-relaxed border-t pt-3">
          {item.a}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function LegalReadinessPage() {
  return <CommunicationHubProvider><LegalReadinessContent /></CommunicationHubProvider>
}

function LegalReadinessContent() {
  /* ── Supabase-backed hooks ── */
  const { documents, isLoaded: docsLoaded } = useDocuments()
  const { completionMap, loading: checklistLoading, toggle, resetAll, isAuthenticated } = useLegalChecklist()
  const { notes, loading: notesLoading, add: addNote, update: updateNote, remove: removeNote } = useLegalNotes()
  const { getEmergencyContacts, getPoaHolders, isLoaded: contactsLoaded } = useCommunicationHub()

  /* ── Local UI state ── */
  const [activeTab, setActiveTab] = useState("dashboard")
  const [resourceFilter, setResourceFilter] = useState("all")
  const [resourceSearch, setResourceSearch] = useState("")
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteRow | null>(null)
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null)
  const notesRef = useRef<HTMLDivElement | null>(null)
  const [shouldScrollToNotes, setShouldScrollToNotes] = useState(false)

  const isLoaded = docsLoaded && !checklistLoading && !notesLoading
  const emergencyContactsList = contactsLoaded ? getEmergencyContacts() : []
  const poaHolders = contactsLoaded ? getPoaHolders() : []

  /* ── Derived stats ── */
  const totalItems = LEGAL_CHECKLIST_ITEMS.length
  const completedItems = LEGAL_CHECKLIST_ITEMS.filter((i) => completionMap[i.id]?.completed).length
  const readinessPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  const criticalItems = LEGAL_CHECKLIST_ITEMS.filter((i) => i.priority === "critical")
  const criticalCompleted = criticalItems.filter((i) => completionMap[i.id]?.completed).length
  const criticalRemaining = criticalItems.length - criticalCompleted

  useEffect(() => {
    if (activeTab === "resources" && shouldScrollToNotes) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          notesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }, 50)
      })

      setShouldScrollToNotes(false)
    }
  }, [activeTab, shouldScrollToNotes])


  const groupedChecklist = useMemo(() => {
    const groups: Record<string, LegalChecklistItemDef[]> = {}
    LEGAL_CHECKLIST_ITEMS.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    })
    return groups
  }, [])

  const filteredResources = useMemo(() => {
    let list = resourceFilter === "all" ? LEGAL_RESOURCE_LINKS : LEGAL_RESOURCE_LINKS.filter((r) => r.category === resourceFilter)
    if (resourceSearch.trim()) {
      const q = resourceSearch.toLowerCase()
      list = list.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.org.toLowerCase().includes(q)
      )
    }
    return list
  }, [resourceFilter, resourceSearch])

  /* ── Loading state ── */
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading legal readiness…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-semibold focus:text-sm">
        Skip to main content
      </a>

      <Header />

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden border-b bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
          {/* Top row */}
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                <Link href="./" aria-label="Go back">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Legal Readiness</h1>
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/10">
                    <Scale className="w-3 h-3" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Hub</span>
                  </div>
                </div>
                <p className="text-white/70 mt-1.5 text-sm sm:text-base max-w-lg leading-relaxed">
                  Deployment legal preparedness, SCRA protections, and military legal resources — all in one place.
                </p>
              </div>
            </div>
            {/* Emergency line - desktop */}
            <a
              href="tel:18003429647"
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white/90 hover:bg-white/15 transition-colors text-sm font-semibold"
              aria-label="Call Military OneSource: 1-800-342-9647"
            >
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              <span>1-800-342-9647</span>
              <span className="text-white/50 text-xs font-normal ml-1">24/7</span>
            </a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-7">
            {[
              { label: "Tasks Done", value: `${completedItems}/${totalItems}`, icon: ClipboardCheck, tab: "checklist" },
              { label: "Critical Left", value: criticalRemaining, icon: AlertTriangle, tab: "checklist", alert: criticalRemaining > 0 },
              { label: "Resources", value: LEGAL_RESOURCE_LINKS.length, icon: Library, tab: "resources" },
            ].map((stat) => (
              <button
                key={stat.label}
                onClick={() => setActiveTab(stat.tab)}
                className={cn(
                  "bg-white/[0.07] backdrop-blur rounded-xl p-3.5 text-left hover:bg-white/[0.12] transition-all duration-200 border",
                  stat.alert ? "border-red-400/30" : "border-white/[0.06]"
                )}
                aria-label={`${stat.label}: ${stat.value}. Click to view.`}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    stat.alert ? "bg-red-500/20" : "bg-white/10"
                  )}>
                    <stat.icon className={cn("w-4 h-4", stat.alert ? "text-red-300" : "text-white/80")} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-[11px] text-white/50 font-medium">{stat.label}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Auth warning */}
        {!isAuthenticated && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 mb-6" role="alert">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 dark:text-amber-200 text-sm">Sign in to save your progress</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  Your checklist progress, notes, and legal readiness data require an account to persist across sessions.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 rounded-xl h-auto flex-wrap" aria-label="Legal readiness sections">
            <TabsTrigger value="dashboard" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm">
              <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Dashboard</span><span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm">
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />Checklist
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm">
              <Library className="w-3.5 h-3.5" aria-hidden="true" />Resources
            </TabsTrigger>
            <TabsTrigger value="scra-guide" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm">
              <Gavel className="w-3.5 h-3.5" aria-hidden="true" />SCRA Guide
            </TabsTrigger>
            <TabsTrigger value="get-help" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm">
              <HandHelping className="w-3.5 h-3.5" aria-hidden="true" />Get Help
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════
              TAB: DASHBOARD
              ═══════════════════════════════════════════ */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex flex-col justify-between gap-3 lg:col-span-1">
                {/* Readiness Score Card */}
                <div className="border rounded-2xl bg-card p-6 flex flex-col items-center text-center">
                  <h2 className="font-bold text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-5">Legal Readiness Score</h2>
                  <ReadinessRing percentage={readinessPercent} />
                  <div className="mt-5 space-y-1">
                    <p className="text-sm font-semibold">
                      {readinessPercent >= 80 ? "Looking great — almost fully prepared." : readinessPercent >= 50 ? "Making good progress — keep going." : "Just getting started — tackle critical items first."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {criticalRemaining > 0
                        ? `${criticalRemaining} critical item${criticalRemaining !== 1 ? "s" : ""} need attention`
                        : "All critical items complete ✓"
                      }
                    </p>
                  </div>
                  <div className="flex gap-2 mt-5 w-full">
                    <Button variant="outline" size="sm" className="flex-1 text-xs rounded-xl cursor-pointer" onClick={() => setActiveTab("checklist")}>
                      <ClipboardCheck className="w-3 h-3 mr-1.5" aria-hidden="true" />Checklist
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs rounded-xl" asChild>
                      <Link href="./documents"><FileText className="w-3 h-3 mr-1.5" aria-hidden="true" />Vault</Link>
                    </Button>
                  </div>
                </div>

                <div className="border rounded-2xl bg-card p-6 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Recent Notes</h2>
                    <Button size="sm" variant="outline" className="rounded-lg cursor-pointer" onClick={() => {setShouldScrollToNotes(true), setActiveTab("resources")}}>
                      See All
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg cursor-pointer" onClick={() => { setEditingNote(null); setNoteDialogOpen(true) }}>
                      <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />Add Note
                    </Button>
                  </div>
                  {notes.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-1">
                      {notes.slice(0,2).map((n) => (
                        <NoteCard key={n.id} note={n}
                          onEdit={() => { setEditingNote(n); setNoteDialogOpen(true) }}
                          onDelete={() => removeNote(n.id)}
                          onTogglePin={() => updateNote(n.id, { pinned: !n.pinned })}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-xl bg-muted/20">
                      <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
                      <p className="text-sm text-muted-foreground">No notes yet. Add notes to track legal tasks, attorney names, case numbers, etc.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="lg:col-span-2 flex flex-col justify-between">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Find JAG Office", desc: "Locate nearest legal assistance", icon: MapPinned, url: "https://installations.militaryonesource.mil/search?program-service=40/view-by=ALL" },
                    { label: "SCRA Protections", desc: "File for interest rate caps", icon: Shield, url: "https://scra.dmdc.osd.mil/scra/#/home" },
                    { label: "Free Legal Help", desc: "Military OneSource attorneys", icon: Phone, url: "https://www.militaryonesource.mil/financial-legal/legal/" },
                    { label: "Document Vault", desc: "Store wills, POAs, & more", icon: FileText, href: "./documents" },
                  ].map((action) => {
                    const isInternal = !!action.href
                    const Wrapper = isInternal ? Link : "a"
                    const wrapperProps = isInternal
                      ? { href: action.href! }
                      : { href: action.url!, target: "_blank" as const, rel: "noopener noreferrer" }
                    return (
                      <Wrapper
                        key={action.label}
                        {...wrapperProps}
                        className="border rounded-xl p-4 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
                        <action.icon className="w-5 h-5 text-accent mb-2" aria-hidden="true" />
                        <h3 className="font-bold text-sm group-hover:text-accent transition-colors">{action.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.desc}</p>
                      </Wrapper>
                    )
                  })}
                </div>

                {/* Critical items alert */}
                {criticalRemaining > 0 && (
                  <div className="border border-red-200 dark:border-red-800/40 rounded-xl bg-red-50 dark:bg-red-950/20 p-4" role="alert">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-800 dark:text-red-200 text-sm">Critical Items Need Attention</h3>
                        <p className="text-sm text-red-700 dark:text-red-300/80 mt-0.5 leading-relaxed">
                          {criticalRemaining} critical task{criticalRemaining !== 1 ? "s" : ""} remain incomplete. These are essential for deployment readiness.
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {criticalItems.filter((i) => !completionMap[i.id]?.completed).slice(0, 4).map((item) => (
                            <span key={item.id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                              {item.label}
                            </span>
                          ))}
                          {criticalRemaining > 4 && (
                            <span className="text-xs text-red-700 dark:text-red-300 px-2.5 py-1 font-medium">+{criticalRemaining - 4} more</span>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="mt-3 text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700 rounded-lg cursor-pointer" onClick={() => setActiveTab("checklist")}>
                          <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />Go to Checklist
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency contacts */}
                <div>
                  <h3 className="font-bold text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-3">Emergency & Support Lines</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EMERGENCY_HOTLINES.map((h) => (
                      <div key={h.phone} className="border rounded-xl p-4 bg-card">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm">{h.name}</h4>
                          <span className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">{h.available}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{h.desc}</p>
                        <a
                          href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                          className="inline-flex items-center gap-1.5 mt-2.5 text-sm font-bold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                          aria-label={`Call ${h.name}: ${h.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" aria-hidden="true" />{h.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {isLoaded && (emergencyContactsList.length > 0 || poaHolders.length > 0) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Your Quick Reference Card</h3>
                    <p className="text-sm text-muted-foreground">
                      Your designated emergency contacts for quick access
                    </p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {emergencyContactsList.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <h4 className="text-sm font-semibold text-red-600">Primary Emergency Contact</h4>
                      </div>
                      <p className="font-bold text-foreground text-lg">{emergencyContactsList[0].contactName}</p>
                      {emergencyContactsList[0].relationship && (
                        <p className="text-sm text-muted-foreground">{emergencyContactsList[0].relationship}</p>
                      )}
                      {emergencyContactsList[0].phonePrimary && (
                        <a
                          href={`tel:${emergencyContactsList[0].phonePrimary.replace(/[^0-9]/g, "")}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium mt-2 hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          {emergencyContactsList[0].phonePrimary}
                        </a>
                      )}
                    </div>
                  )}
                  
                  {poaHolders.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-semibold text-indigo-600">Power of Attorney</h4>
                      </div>
                      <p className="font-bold text-foreground text-lg">{poaHolders[0].contactName}</p>
                      {poaHolders[0].relationship && (
                        <p className="text-sm text-muted-foreground">{poaHolders[0].relationship}</p>
                      )}
                      {poaHolders[0].phonePrimary && (
                        <a
                          href={`tel:${poaHolders[0].phonePrimary.replace(/[^0-9]/g, "")}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium mt-2 hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          {poaHolders[0].phonePrimary}
                        </a>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-muted-foreground text-center">
                    Manage all contacts in your{" "}
                    <a href="/services/command-center/contacts" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Emergency Contact Network
                    </a>
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════
              TAB: CHECKLIST
              ═══════════════════════════════════════════ */}
          <TabsContent value="checklist" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold">Legal Readiness Checklist</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Items linked to your Document Vault are tagged automatically. Progress saves to your account.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{readinessPercent}%</span>
                  <div className="w-32"><Progress value={readinessPercent} className="h-2" aria-label={`Overall progress: ${readinessPercent}%`} /></div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={resetAll}>
                  <RotateCcw className="w-3 h-3 mr-1.5" aria-hidden="true" />Reset
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(groupedChecklist).map(([cat, items]) => (
                <ChecklistCategory
                  key={cat}
                  category={cat}
                  items={items}
                  completionMap={completionMap}
                  onToggle={toggle}
                  linkedDocs={documents}
                />
              ))}
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════
              TAB: RESOURCES
              ═══════════════════════════════════════════ */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Legal Resources & Services</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Free legal services, tools, and support programs for service members and families.</p>
              </div>
            </div>

            {/* Key hotlines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Military OneSource Legal", phone: "1-800-342-9647", desc: "Free attorney consultations", url: "https://www.militaryonesource.mil/financial-legal/legal/" },
                { label: "CFPB Servicemember Line", phone: "1-855-411-2372", desc: "Financial complaints & help", url: "https://www.consumerfinance.gov/consumer-tools/educator-tools/servicemembers/" },
                { label: "Armed Forces Legal Aid", phone: null as string | null, desc: "Find office by zip code", url: "https://legalassistance.law.af.mil/content/locator.php" },
              ].map((h) => (
                <div key={h.label} className="border rounded-xl p-4 bg-gradient-to-br from-accent/[0.04] to-transparent">
                  <h4 className="font-bold text-sm">{h.label}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    {h.phone ? (
                      <a href={`tel:${h.phone}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline" aria-label={`Call ${h.label}: ${h.phone}`}>
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" />{h.phone}
                      </a>
                    ) : (
                      <a href={h.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />Open Locator
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Search resources…"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  className="pl-9 h-10 rounded-xl"
                  aria-label="Search legal resources"
                />
              </div>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl text-sm" aria-label="Filter resources by category">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  {LEGAL_RESOURCE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resource cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredResources.map((r) => <LegalResourceCard key={r.id} resource={r} />)}
            </div>
            {filteredResources.length === 0 && (
              <div className="text-center py-12 border rounded-xl bg-muted/20">
                <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">No resources match your search. Try a different term or category.</p>
              </div>
            )}

            {/* Notes section */}
            <div ref={notesRef} className="space-y-3 pt-2 scroll-mt-25">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[11px] uppercase tracking-[0.12em] text-muted-foreground">My Legal Notes</h2>
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => { setEditingNote(null); setNoteDialogOpen(true) }}>
                  <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />Add Note
                </Button>
              </div>
              {notes.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {notes.map((n) => (
                    <NoteCard key={n.id} note={n}
                      onEdit={() => { setEditingNote(n); setNoteDialogOpen(true) }}
                      onDelete={() => removeNote(n.id)}
                      onTogglePin={() => updateNote(n.id, { pinned: !n.pinned })}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-xl bg-muted/20">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">No notes yet. Add notes to track legal tasks, attorney names, case numbers, etc.</p>
                </div>
              )}
            </div>

            {/* Vault cross-link */}
            <div className="rounded-2xl border bg-gradient-to-br from-muted/40 via-background to-muted/20 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold">Document Vault</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed max-w-md">
                      Store, organize, and share your legal documents securely — wills, POAs, insurance policies, and more.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="rounded-xl flex-shrink-0">
                  <Link href="./documents">
                    <FileText className="w-4 h-4 mr-2" aria-hidden="true" />Go to Vault<ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════
              TAB: SCRA GUIDE
              ═══════════════════════════════════════════ */}
          <TabsContent value="scra-guide" className="space-y-6">
            <div className="max-w-3xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <Badge className="mb-3 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  <Gavel className="w-3 h-3 mr-1.5" aria-hidden="true" />Know Your Rights
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">SCRA Quick-Reference Guide</h2>
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
                  Essential information about the Servicemembers Civil Relief Act and your legal protections as an active duty service member.
                </p>
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-2" role="region" aria-label="SCRA frequently asked questions">
                {SCRA_FAQ.map((item, idx) => (
                  <SCRAAccordionItem
                    key={idx}
                    item={item}
                    isOpen={openFaqIdx === idx}
                    onToggle={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  />
                ))}
              </div>

              {/* Action cards */}
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <a
                  href="https://scra.dmdc.osd.mil/scra/#/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center p-6 rounded-2xl bg-primary text-primary-foreground hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                >
                  <ShieldCheck className="w-8 h-8 mb-3 opacity-80" aria-hidden="true" />
                  <h3 className="font-bold text-base">Verify Active Duty Status</h3>
                  <p className="text-sm opacity-70 mt-1">Free certificate from scra.dmdc.osd.mil</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold opacity-60 mt-3">
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />Open SCRA Website
                  </span>
                </a>
                <a
                  href="https://www.justice.gov/servicemembers/servicemembers-civil-relief-act-scra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center text-center p-6 rounded-2xl border-2 border-accent/20 hover:border-accent/40 hover:shadow-lg transition-all duration-200 bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Landmark className="w-8 h-8 mb-3 text-accent" aria-hidden="true" />
                  <h3 className="font-bold text-base">Full SCRA Text & Enforcement</h3>
                  <p className="text-sm text-muted-foreground mt-1">Department of Justice — file a complaint</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent mt-3">
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />justice.gov
                  </span>
                </a>
              </div>

              {/* Additional SCRA resources */}
              <div className="mt-8 border rounded-2xl p-5 bg-card">
                <h3 className="font-bold text-sm mb-3">Additional SCRA Resources</h3>
                <div className="space-y-3">
                  {[
                    { title: "CFPB Military Lending Act Guide", url: "https://www.consumerfinance.gov/consumer-tools/educator-tools/servicemembers/the-military-lending-act/", desc: "36% MAPR cap on consumer credit" },
                    { title: "Military OneSource SCRA Overview", url: "https://www.militaryonesource.mil/financial-legal/legal/articles/", desc: "Detailed articles on SCRA protections" },
                    { title: "DOJ SCRA Enforcement Actions", url: "https://www.justice.gov/servicemembers/servicemembers-civil-relief-act-scra", desc: "See how the DOJ enforces SCRA violations" },
                  ].map((r) => (
                    <a
                      key={r.title}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 -mx-1 rounded-lg hover:bg-muted/50 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <ExternalLink className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold group-hover:text-accent transition-colors">{r.title}</span>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-accent flex-shrink-0 ml-auto transition-colors" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════
              TAB: GET HELP
              ═══════════════════════════════════════════ */}
          <TabsContent value="get-help" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Get Legal Help Now</h2>
                <p className="text-muted-foreground mt-2">
                  Free legal assistance is available to all active duty service members and their families.
                </p>
              </div>

              {/* Primary CTA */}
              <div className="border-2 border-accent/20 rounded-2xl p-8 text-center bg-gradient-to-br from-accent/[0.04] via-transparent to-accent/[0.02] mb-8">
                <Scale className="w-10 h-10 text-accent mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-bold">Military OneSource Legal Help</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  Free confidential consultations with licensed attorneys on personal civil-legal matters.
                  Available to active duty, Guard, Reserve, and eligible family members.
                </p>
                <a
                  href="tel:18003429647"
                  className="inline-flex items-center gap-2.5 mt-6 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground text-lg font-bold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                  aria-label="Call Military OneSource: 1-800-342-9647"
                >
                  <PhoneCall className="w-5 h-5" aria-hidden="true" />1-800-342-9647
                </a>
                <p className="text-xs text-muted-foreground mt-3">Available 24/7 — Interpreters available in over 140 languages</p>
              </div>

              {/* Help cards grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Armed Forces Legal Assistance Locator", desc: "Find your nearest military legal assistance office by zip code or installation name.", url: "https://legalassistance.law.af.mil/content/locator.php", icon: MapPinned },
                  { name: "ABA Military Pro Bono Project", desc: "Free legal representation for active duty members who can't get adequate help on base.", url: "https://www.militaryprobono.org/", icon: Users },
                  { name: "Stateside Legal", desc: "Free legal help for lower-income military families — family law, housing, consumer issues.", url: "https://www.statesidelegal.org/", icon: HandHelping },
                  { name: "VA Benefits Hotline", desc: "Claims, appeals, education benefits, and survivor benefits questions.", url: "https://www.va.gov/", phone: "1-800-827-1000", icon: Phone },
                  { name: "CFPB Servicemember Affairs", desc: "Financial complaints, predatory lending, and Military Lending Act protections.", url: "https://www.consumerfinance.gov/consumer-tools/educator-tools/servicemembers/", phone: "1-855-411-2372", icon: Shield },
                  { name: "National Veterans Legal Services", desc: "Advocacy and legal representation for veterans denied VA benefits.", url: "https://www.nvlsp.org/", icon: Gavel },
                ].map((contact) => (
                  <div key={contact.name} className="border rounded-2xl p-5 bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <contact.icon className="w-4 h-4 text-accent" aria-hidden="true" />
                      </div>
                      <h4 className="font-bold text-sm">{contact.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{contact.desc}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                          aria-label={`Call ${contact.name}: ${contact.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" aria-hidden="true" />{contact.phone}
                        </a>
                      )}
                      <a
                        href={contact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                      >
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />Visit Website
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Crisis line */}
              <div className="mt-8 border border-red-200 dark:border-red-800/40 rounded-2xl p-6 bg-red-50 dark:bg-red-950/20 text-center" role="alert">
                <h3 className="font-bold text-base text-red-800 dark:text-red-200">In Crisis? You Are Not Alone.</h3>
                <p className="text-sm text-red-700 dark:text-red-300/80 mt-1.5 leading-relaxed">
                  The Military / Veterans Crisis Line provides free, confidential support 24/7 for all service members, veterans, and their families.
                </p>
                <a
                  href="tel:988"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-red-600 dark:bg-red-800 text-white text-base font-bold hover:bg-red-700 dark:hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  aria-label="Call the Veterans Crisis Line: dial 988, then press 1"
                >
                  <PhoneCall className="w-5 h-5" aria-hidden="true" />988 (press 1)
                </a>
                <p className="text-xs text-red-700 dark:text-red-300/70 mt-3">
                  Or text <strong>838255</strong> · Chat at <a href="https://www.veteranscrisisline.net/get-help-now/chat/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:no-underline">VeteransCrisisLine.net</a>
                </p>
              </div>

              {/* Vault cross-link */}
              <div className="mt-6 rounded-2xl border bg-gradient-to-br from-muted/40 via-background to-muted/20 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-accent" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold">Bring Your Documents</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed max-w-md">
                        When meeting with a legal assistance attorney, bring your military orders, IDs, and relevant documents. Use the Document Vault to keep everything organized.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="rounded-xl flex-shrink-0">
                    <Link href="./documents">
                      <FileText className="w-4 h-4 mr-2" aria-hidden="true" />Open Vault<ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Note dialog (Supabase-backed) */}
      <NoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        editing={editingNote}
        onSave={(data) => {
          if (editingNote) {
            updateNote(editingNote.id, data)
          } else {
            addNote({ title: data.title, content: data.content, category: data.category || undefined })
          }
        }}
      />

      <Footer />
    </div>
  )
}