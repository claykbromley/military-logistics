"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  ArrowLeft, Scale, Shield, CheckCircle2, Circle, Clock, CalendarPlus,
  ExternalLink, FileText, AlertTriangle, ChevronRight, Phone, MapPin,
  Globe, Users, Briefcase, Heart, CreditCard, ChevronDown, ChevronUp,
  Calendar, X, Check, RotateCcw, Search, Navigation, Building2,
  Bookmark, BookmarkCheck, Video, Plus, Pencil, Trash2, Pin, PinOff,
  Loader2, ClipboardCheck, LayoutDashboard, MapPinned, Library,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useDocuments, type Document } from "@/hooks/use-documents"
import { CommunicationHubProvider } from "@/hooks/use-communication-hub"
import {
  useLegalChecklist, useLegalAppointments, useLegalOffices, useLegalNotes,
  type AppointmentRow, type AppointmentType, type OfficeRow, type NoteRow,
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
  { id: "sgli-review", label: "SGLI Coverage Review", description: "Confirm SGLI coverage amount ($400K max) and Family SGLI elections. Update SGLV 8286.", category: "estate", linkedDocType: "insurance", priority: "critical" },
  { id: "life-insurance-private", label: "Private Life Insurance", description: "Review any supplemental civilian life insurance policies.", category: "estate", linkedDocType: "insurance", priority: "recommended" },
  { id: "dd93", label: "DD Form 93 (Record of Emergency Data)", description: "Update person authorized to direct disposition, SGLI beneficiaries, emergency contacts.", category: "estate", priority: "critical" },
  { id: "allotments", label: "Set Up Pay Allotments", description: "Ensure allotments cover mortgage/rent, utilities, car payments, and family needs.", category: "financial", priority: "recommended" },
  { id: "tax-documents", label: "Organize Tax Documents", description: "Gather W-2s, tax returns, financial records. Consider free VITA tax assistance on base.", category: "financial", linkedDocType: "financial", priority: "recommended" },
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

const LEGAL_CATEGORY_META: Record<string, { label: string; icon: typeof Scale; color: string; bgColor: string }> = {
  documents: { label: "Legal Documents", icon: FileText, color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-500/10" },
  estate: { label: "Estate & Beneficiaries", icon: Shield, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/10" },
  financial: { label: "Financial & SCRA", icon: CreditCard, color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-500/10" },
  family: { label: "Family Preparedness", icon: Heart, color: "text-rose-600 dark:text-rose-400", bgColor: "bg-rose-500/10" },
  deployment: { label: "Deployment Prep", icon: Briefcase, color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-500/10" },
}

const LEGAL_APPOINTMENT_TYPES: { value: AppointmentType; label: string }[] = [
  { value: "jag", label: "JAG Legal Assistance" },
  { value: "will_prep", label: "Will Preparation" },
  { value: "poa_signing", label: "POA Signing / Notary" },
  { value: "scra_filing", label: "SCRA Filing" },
  { value: "legal_aid", label: "Legal Aid Consultation" },
  { value: "notary", label: "Notary Services" },
  { value: "tax", label: "Tax Assistance (VITA)" },
  { value: "general", label: "General Legal" },
]

const LEGAL_OFFICE_TYPE_LABELS: Record<string, string> = {
  jag_office: "JAG Office", legal_aid: "Legal Aid", notary: "Notary",
  tax_center: "Tax Center", veterans_clinic: "Veterans Clinic",
  private_attorney: "Private Attorney", military_onesource: "Military OneSource",
  family_advocacy: "Family Advocacy", other: "Other",
}

interface LegalResourceLink {
  id: string; title: string; description: string
  category: "scra" | "wills" | "family" | "financial" | "benefits" | "deployment" | "general"
  url: string; phone?: string; org: string
}

const LEGAL_RESOURCE_LINKS: LegalResourceLink[] = [
  { id: "afla", title: "Armed Forces Legal Assistance Locator", description: "Find your nearest military legal assistance office by zip code or installation.", category: "general", url: "https://legalassistance.law.af.mil/content/locator.php", org: "DoD" },
  { id: "mil-onesource-legal", title: "Military OneSource — Free Legal Help", description: "Confidential consultations with licensed attorneys on personal civil-legal matters at no cost.", category: "general", url: "https://www.militaryonesource.mil/legal/legal-assistance/", phone: "1-800-342-9647", org: "Military OneSource" },
  { id: "scra-lookup", title: "SCRA Website & Active Duty Verification", description: "Verify active duty status for SCRA claims. Download certificates for lenders and courts.", category: "scra", url: "https://scra.dmdc.osd.mil", org: "DMDC" },
  { id: "scra-doj", title: "DOJ — Servicemembers Civil Relief Act", description: "Full SCRA text, enforcement information, and how to file a complaint.", category: "scra", url: "https://www.justice.gov/servicemembers/servicemembers-civil-relief-act-scra", org: "Dept. of Justice" },
  { id: "cfpb-military", title: "CFPB Office of Servicemember Affairs", description: "File complaints about financial products and learn your consumer rights.", category: "financial", url: "https://www.consumerfinance.gov/consumer-tools/educator-tools/servicemembers/", phone: "1-855-411-2372", org: "CFPB" },
  { id: "mla-info", title: "Military Lending Act (MLA) Protections", description: "36% MAPR cap on consumer credit for active duty service members.", category: "financial", url: "https://www.consumerfinance.gov/consumer-tools/educator-tools/servicemembers/the-military-lending-act/", org: "CFPB" },
  { id: "tsp-info", title: "TSP — Deployment & BRS", description: "Manage TSP contributions during deployment. Tax-exempt combat zone contributions.", category: "financial", url: "https://www.tsp.gov/military/", org: "TSP" },
  { id: "vita-irs", title: "MilTax / VITA Free Tax Preparation", description: "Free tax filing for military members. Available on most installations.", category: "financial", url: "https://www.militaryonesource.mil/financial-legal/tax-resource-center/miltax-military-tax-services/", org: "IRS / MilTax" },
  { id: "will-army", title: "Army Will Preparation Guide", description: "Step-by-step guide to preparing your will through Army legal assistance.", category: "wills", url: "https://myarmybenefits.us.army.mil/Benefit-Library/Federal-Benefits/Wills", org: "U.S. Army" },
  { id: "sgli-va", title: "SGLI / FSGLI — VA Life Insurance", description: "Manage Servicemembers' Group Life Insurance. Update beneficiaries, file claims.", category: "benefits", url: "https://www.va.gov/life-insurance/options-eligibility/sgli/", org: "VA" },
  { id: "va-vso", title: "Find a Veterans Service Organization", description: "Free legal representation on VA claims, appeals, and benefits.", category: "benefits", url: "https://www.va.gov/vso/", org: "VA" },
  { id: "family-advocacy", title: "Family Advocacy Program", description: "Support for family legal matters — custody, domestic situations, prevention services.", category: "family", url: "https://www.militaryonesource.mil/family-relationships/family-life/family-advocacy-program/", phone: "1-800-342-9647", org: "Military OneSource" },
  { id: "deers-update", title: "Update DEERS & Dependent Info", description: "Ensure dependents are enrolled for ID cards, TRICARE, and commissary access.", category: "family", url: "https://milconnect.dmdc.osd.mil/milconnect/", org: "DMDC" },
  { id: "deployment-guide", title: "Pre-Deployment Legal Checklist (DoD)", description: "Official DoD guide covering all legal readiness requirements.", category: "deployment", url: "https://www.militaryonesource.mil/military-life-cycle/deployment/preparing-for-deployment/pre-deployment-legal-checklist/", org: "Military OneSource" },
  { id: "sbd-va", title: "Survivors & Dependents Benefits", description: "DIC, SGLI payouts, education benefits, and housing assistance for families.", category: "benefits", url: "https://www.va.gov/survivors/", org: "VA" },
]

const LEGAL_RESOURCE_CATEGORIES = [
  { value: "all", label: "All Resources" }, { value: "general", label: "General Legal" },
  { value: "scra", label: "SCRA" }, { value: "financial", label: "Financial" },
  { value: "wills", label: "Wills & Estate" }, { value: "family", label: "Family" },
  { value: "benefits", label: "VA & Benefits" }, { value: "deployment", label: "Deployment" },
]

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function ReadinessRing({ percentage, size = 128 }: { percentage: number; size?: number }) {
  const radius = (size / 2) - 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const color = percentage >= 80 ? "text-emerald-500" : percentage >= 50 ? "text-amber-500" : "text-red-500"
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/30" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} className={cn(color, "transition-all duration-700 ease-out")} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", color)}>{percentage}%</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Ready</span>
      </div>
    </div>
  )
}

function ChecklistCategory({ category, items, completionMap, onToggle, linkedDocs }: {
  category: string; items: LegalChecklistItemDef[]; completionMap: Record<string, { completed: boolean; notes: string | null }>
  onToggle: (id: string) => void; linkedDocs: Document[]
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = LEGAL_CATEGORY_META[category]
  const completed = items.filter((i) => completionMap[i.id]?.completed).length
  const Icon = meta.icon

  useEffect(() => {
    if (!items.length || !linkedDocs.length) return

    items.forEach((item) => {
      if (!item.linkedDocType) return

      const hasDoc = linkedDocs.some(
        (d) => d.documentType === item.linkedDocType
      )

      const rowExists = completionMap[item.id]
      if (hasDoc && !rowExists) {
        onToggle(item.id)
      }
    })
  }, [items, linkedDocs, completionMap, onToggle])


  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", meta.bgColor)}><Icon className={cn("w-4 h-4", meta.color)} /></div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">{meta.label}</h3>
            <p className="text-xs text-muted-foreground">{completed} of {items.length} complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-24"><Progress value={items.length > 0 ? (completed / items.length) * 100 : 0} className="h-1.5" /></div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t divide-y">
          {items.map((item) => {
            const done = completionMap[item.id]?.completed ?? false
            const hasDoc = item.linkedDocType ? linkedDocs.some((d) => d.documentType === item.linkedDocType) : false
            return (
              <div key={item.id} className={cn("flex items-start gap-3 p-4 transition-colors", done && "bg-muted/20")}>
                <button onClick={() => onToggle(item.id)} className="mt-0.5 flex-shrink-0">
                  {done ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-sm font-medium leading-tight", done && "line-through text-muted-foreground")}>{item.label}</span>
                    {item.priority === "critical" && <Badge variant="destructive" className="text-[9px] px-1.5 py-0 font-semibold uppercase tracking-wider">Critical</Badge>}
                    {item.priority === "optional" && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium uppercase tracking-wider">Optional</Badge>}
                    {hasDoc && <Link href="./documents"><Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium cursor-pointer hover:bg-accent/10"><FileText className="w-2.5 h-2.5 mr-1" />In Vault</Badge></Link>}
                  </div>
                  <p className={cn("text-xs text-muted-foreground mt-0.5 leading-relaxed", done && "opacity-60")}>{item.description}</p>
                  {item.helpUrl && <a href={item.helpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline mt-1"><ExternalLink className="w-2.5 h-2.5" />Learn more</a>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AppointmentCard({ appointment, onComplete, onCancel, onDelete }: {
  appointment: AppointmentRow; onComplete: () => void; onCancel: () => void; onDelete: () => void
}) {
  const apptDate = new Date(`${appointment.scheduled_date}T${appointment.scheduled_time}`)
  const isToday = new Date().toDateString() === apptDate.toDateString()
  const typeLabel = LEGAL_APPOINTMENT_TYPES.find((t) => t.value === appointment.appointment_type)?.label || appointment.appointment_type
  const isActive = appointment.status === "scheduled" || appointment.status === "confirmed"
  return (
    <div className={cn("border rounded-xl p-4 transition-all",
      appointment.status === "cancelled" && "opacity-50",
      appointment.status === "completed" && "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-800/30",
      isToday && isActive && "border-accent ring-1 ring-accent/20",
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            appointment.status === "completed" ? "bg-emerald-500/10 text-emerald-600"
            : appointment.is_virtual ? "bg-indigo-500/10 text-indigo-600"
            : isToday ? "bg-accent/10 text-accent" : "bg-muted/60 text-muted-foreground")}>
            {appointment.status === "completed" ? <CheckCircle2 className="w-5 h-5" />
              : appointment.is_virtual ? <Video className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm">{appointment.title}</h4>
              {isToday && isActive && <Badge className="text-[9px] px-1.5 py-0 font-semibold uppercase tracking-wider">Today</Badge>}
              {appointment.status === "cancelled" && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Cancelled</Badge>}
              {appointment.status === "confirmed" && <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-emerald-600 border-emerald-300">Confirmed</Badge>}
              {appointment.is_virtual && <Badge variant="outline" className="text-[9px] px-1.5 py-0">Virtual</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{typeLabel}{appointment.duration_min ? ` · ${appointment.duration_min} min` : ""}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                {apptDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {apptDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
              {appointment.location_name && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{appointment.location_name}</span>}
              {appointment.provider_name && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{appointment.provider_name}</span>}
            </div>
            {appointment.is_virtual && appointment.virtual_link && (
              <a href={appointment.virtual_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline mt-0.5"><Video className="w-2.5 h-2.5" />Join virtual meeting</a>
            )}
            {appointment.notes && <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{appointment.notes}</p>}
          </div>
        </div>
        {isActive ? (
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={onComplete} title="Done"><Check className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onCancel} title="Cancel"><X className="w-3.5 h-3.5" /></Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onDelete} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
        )}
      </div>
    </div>
  )
}

function ScheduleDialog({ open, onOpenChange, onSave, offices, prefilledOffice }: {
  open: boolean; onOpenChange: (v: boolean) => void
  onSave: (appt: Partial<AppointmentRow>) => Promise<AppointmentRow | null>
  offices: OfficeRow[]; prefilledOffice?: OfficeRow | null
}) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<AppointmentType>("jag")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("09:00")
  const [duration, setDuration] = useState("60")
  const [locationName, setLocationName] = useState("")
  const [locationAddress, setLocationAddress] = useState("")
  const [provider, setProvider] = useState("")
  const [providerPhone, setProviderPhone] = useState("")
  const [isVirtual, setIsVirtual] = useState(false)
  const [virtualLink, setVirtualLink] = useState("")
  const [officeId, setOfficeId] = useState<string>("none")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(""); setType("jag"); setDate(""); setTime("09:00"); setDuration("60")
      setLocationName(prefilledOffice?.name || ""); setLocationAddress(prefilledOffice?.address_line1 || "")
      setProvider(""); setProviderPhone(prefilledOffice?.phone || "")
      setIsVirtual(false); setVirtualLink(""); setOfficeId(prefilledOffice?.id || "none"); setNotes("")
    }
  }, [open, prefilledOffice])

  const handleOfficeSelect = (id: string) => {
    setOfficeId(id)
    if (id !== "none") {
      const office = offices.find((o) => o.id === id)
      if (office) { setLocationName(office.name); setLocationAddress(office.address_line1 || ""); setProviderPhone(office.phone || "") }
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !date) return
    setSaving(true)
    await onSave({
      title: title.trim(), appointment_type: type, scheduled_date: date, scheduled_time: time,
      duration_min: parseInt(duration) || 60, location_name: locationName.trim() || undefined,
      location_address: locationAddress.trim() || undefined, provider_name: provider.trim() || undefined,
      provider_phone: providerPhone.trim() || undefined, is_virtual: isVirtual,
      virtual_link: isVirtual ? virtualLink.trim() || undefined : undefined,
      office_id: officeId !== "none" ? officeId : undefined, notes: notes.trim() || undefined, status: "scheduled",
    })
    setSaving(false); onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">Schedule Appointment</DialogTitle>
          <DialogDescription>Book a legal consultation, notary, or tax assistance session.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Will Preparation — JAG Office" className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AppointmentType)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>{LEGAL_APPOINTMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem><SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem><SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10" /></div>
            <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10" /></div>
          </div>
          {offices.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal Office <span className="font-normal normal-case tracking-normal opacity-60">(optional)</span></Label>
              <Select value={officeId} onValueChange={handleOfficeSelect}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select an office…" /></SelectTrigger>
                <SelectContent><SelectItem value="none">— None —</SelectItem>{offices.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}{o.installation ? ` (${o.installation})` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</Label>
            <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g., Bldg 450, Legal Assistance" className="h-10" />
            <Input value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="Address (optional)" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provider <span className="font-normal normal-case tracking-normal opacity-60">(optional)</span></Label>
            <div className="grid grid-cols-2 gap-3">
              <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Name" className="h-10" />
              <Input value={providerPhone} onChange={(e) => setProviderPhone(e.target.value)} placeholder="Phone" className="h-10" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20">
            <input type="checkbox" id="virtual-toggle" checked={isVirtual} onChange={(e) => setIsVirtual(e.target.checked)} className="rounded" />
            <label htmlFor="virtual-toggle" className="text-sm font-medium cursor-pointer">Virtual appointment</label>
          </div>
          {isVirtual && <Input value={virtualLink} onChange={(e) => setVirtualLink(e.target.value)} placeholder="Meeting link (Zoom, Teams, etc.)" className="h-10" />}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What to bring, topics to discuss…" rows={3} className="resize-none" />
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || !date || saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Schedule Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OfficeCard({ office, onSchedule, onBookmark }: { office: OfficeRow; onSchedule: () => void; onBookmark: () => void }) {
  const [showHours, setShowHours] = useState(false)
  const typeLabel = LEGAL_OFFICE_TYPE_LABELS[office.office_type] || office.office_type
  const typeColors: Record<string, string> = {
    jag_office: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    legal_aid: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    tax_center: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    military_onesource: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    family_advocacy: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    veterans_clinic: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  }
  return (
    <div className="group border rounded-xl p-4 bg-card hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", typeColors[office.office_type] || "bg-gray-500/10 text-gray-500")}><Building2 className="w-5 h-5" /></div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm leading-tight">{office.name}</h4>
              {office.is_verified && <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium text-emerald-600 border-emerald-300"><CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />Verified</Badge>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium", typeColors[office.office_type] || "bg-gray-100 text-gray-600")}>{typeLabel}</span>
              {office.installation && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{office.installation}</span>}
              {office.branch && <span className="text-xs text-muted-foreground">· {office.branch}</span>}
            </div>
            {office.description && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{office.description}</p>}
            <div className="flex items-center gap-3 flex-wrap">
              {office.phone && <a href={`tel:${office.phone}`} className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"><Phone className="w-3 h-3" />{office.phone}</a>}
              {office.website && <a href={office.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"><Globe className="w-3 h-3" />Website</a>}
              {office.booking_url && <a href={office.booking_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"><CalendarPlus className="w-3 h-3" />Book Online</a>}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              {office.walk_in && <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Walk-ins</span>}
              {office.appointment_req && <span className="text-muted-foreground">Appt recommended</span>}
              {office.accepts_virtual && <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1"><Video className="w-3 h-3" />Virtual</span>}
            </div>
            {office.hours_json && (
              <div>
                <button onClick={() => setShowHours(!showHours)} className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Clock className="w-3 h-3" />{showHours ? "Hide hours" : "Show hours"}
                  {showHours ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {showHours && (
                  <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                    {Object.entries(office.hours_json).map(([day, hours]) => <div key={day} className="flex justify-between"><span className="capitalize font-medium">{day}</span><span>{String(hours)}</span></div>)}
                  </div>
                )}
              </div>
            )}
            {office.distance_miles !== undefined && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Navigation className="w-3 h-3" />{office.distance_miles.toFixed(1)} mi away</p>}
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBookmark} title="Bookmark">
            {office.is_bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-accent" /> : <Bookmark className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSchedule} title="Schedule here"><CalendarPlus className="w-3.5 h-3.5" /></Button>
        </div>
      </div>
    </div>
  )
}

function LegalResourceLinkCard({ resource }: { resource: LegalResourceLink }) {
  const catColors: Record<string, string> = {
    scra: "bg-amber-500/10 text-amber-600 dark:text-amber-400", wills: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    family: "bg-rose-500/10 text-rose-600 dark:text-rose-400", financial: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    benefits: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", deployment: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    general: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  }
  return (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="group block border rounded-xl p-4 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", catColors[resource.category] || catColors.general)}><ExternalLink className="w-4 h-4" /></div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm leading-tight group-hover:text-accent transition-colors">{resource.title}</h4>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground/70">{resource.org}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{resource.description}</p>
          {resource.phone && <span className="inline-flex items-center gap-1 text-xs font-medium text-accent"><Phone className="w-3 h-3" />{resource.phone}</span>}
        </div>
      </div>
    </a>
  )
}

function NoteCard({ note, onEdit, onDelete, onTogglePin }: { note: NoteRow; onEdit: () => void; onDelete: () => void; onTogglePin: () => void }) {
  return (
    <div className={cn("border rounded-xl p-4 bg-card transition-all", note.pinned && "border-accent/30 ring-1 ring-accent/10")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><h4 className="font-semibold text-sm truncate">{note.title}</h4>{note.pinned && <Pin className="w-3 h-3 text-accent flex-shrink-0" />}{note.category && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{note.category}</Badge>}</div>
          {note.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">{note.content}</p>}
          <p className="text-[10px] text-muted-foreground/50 mt-2">{new Date(note.updated_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onTogglePin}>{note.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}</Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}><Pencil className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={onDelete}><Trash2 className="w-3 h-3" /></Button>
        </div>
      </div>
    </div>
  )
}

function NoteDialog({ open, onOpenChange, onSave, editing }: {
  open: boolean; onOpenChange: (v: boolean) => void
  onSave: (data: { title: string; content: string; category: string }) => void; editing?: NoteRow | null
}) {
  const [title, setTitle] = useState(""); const [content, setContent] = useState(""); const [category, setCategory] = useState("")
  useEffect(() => { if (open) { setTitle(editing?.title || ""); setContent(editing?.content || ""); setCategory(editing?.category || "") } }, [open, editing])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editing ? "Edit Note" : "Add Note"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title…" className="h-10" /></div>
          <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category <span className="font-normal normal-case tracking-normal opacity-60">(optional)</span></Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., SCRA, deployment" className="h-10" /></div>
          <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note…" rows={6} className="resize-none" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave({ title, content, category }); onOpenChange(false) }} disabled={!title.trim()}>{editing ? "Save" : "Add Note"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function LegalReadinessPage() {
  return <CommunicationHubProvider><LegalReadinessContent /></CommunicationHubProvider>
}

function LegalReadinessContent() {
  const { documents, isLoaded: docsLoaded } = useDocuments()
  const { completionMap, loading: checklistLoading, toggle, resetAll, isAuthenticated } = useLegalChecklist()
  const { upcoming, past, loading: apptsLoading, add: addAppt, update: updateAppt, remove: removeAppt } = useLegalAppointments()
  const { offices, loading: officesLoading, searchByInstallation, bookmarkOffice } = useLegalOffices()
  const { notes, loading: notesLoading, add: addNote, update: updateNote, remove: removeNote } = useLegalNotes()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [prefilledOffice, setPrefilledOffice] = useState<OfficeRow | null>(null)
  const [resourceFilter, setResourceFilter] = useState("all")
  const [officeSearch, setOfficeSearch] = useState("")
  const [officeSearchResults, setOfficeSearchResults] = useState<OfficeRow[] | null>(null)
  const [officeSearching, setOfficeSearching] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteRow | null>(null)

  const isLoaded = docsLoaded && !checklistLoading && !apptsLoading

  const totalItems = LEGAL_CHECKLIST_ITEMS.length
  const completedItems = LEGAL_CHECKLIST_ITEMS.filter((i) => completionMap[i.id]?.completed).length
  const readinessPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  const criticalItems = LEGAL_CHECKLIST_ITEMS.filter((i) => i.priority === "critical")
  const criticalCompleted = criticalItems.filter((i) => completionMap[i.id]?.completed).length
  const criticalRemaining = criticalItems.length - criticalCompleted

  const groupedChecklist = useMemo(() => {
    const groups: Record<string, LegalChecklistItemDef[]> = {}
    LEGAL_CHECKLIST_ITEMS.forEach((item) => { if (!groups[item.category]) groups[item.category] = []; groups[item.category].push(item) })
    return groups
  }, [])

  const filteredResources = useMemo(() => resourceFilter === "all" ? LEGAL_RESOURCE_LINKS : LEGAL_RESOURCE_LINKS.filter((r) => r.category === resourceFilter), [resourceFilter])
  const displayedOffices = officeSearchResults ?? offices

  const handleOfficeSearch = async () => {
    if (!officeSearch.trim()) { setOfficeSearchResults(null); return }
    setOfficeSearching(true)
    const results = await searchByInstallation(officeSearch.trim())
    setOfficeSearchResults(results)
    setOfficeSearching(false)
  }

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
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden border-b bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="text-white/80 hover:text-white hover:bg-white/10"><Link href="./"><ArrowLeft className="w-5 h-5" /></Link></Button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Legal Readiness</h1>
                  <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white"><Scale className="w-3 h-3" /><span className="text-[10px] font-semibold uppercase tracking-wider">Hub</span></div>
                </div>
                <p className="text-white/80 mt-1">Your one-stop shop for legal preparedness, appointments, and resources</p>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer" onClick={() => { setPrefilledOffice(null); setScheduleOpen(true) }}>
                <CalendarPlus className="w-4 h-4 mr-2" />Schedule Appointment
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <button onClick={() => setActiveTab("checklist")} className="bg-white/10 backdrop-blur rounded-xl p-3.5 text-left hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center"><ClipboardCheck className="w-4 h-4 text-white" /></div>
                <div><p className="text-xl font-bold text-white">{completedItems}/{totalItems}</p><p className="text-xs text-white/70">Tasks Done</p></div>
              </div>
            </button>
            <button onClick={() => setActiveTab("checklist")} className={cn("bg-white/10 backdrop-blur rounded-xl p-3.5 text-left hover:bg-white/15 transition-colors", criticalRemaining > 0 && "ring-1 ring-red-400/30")}>
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", criticalRemaining > 0 ? "bg-red-500/20" : "bg-white/20")}><AlertTriangle className={cn("w-4 h-4", criticalRemaining > 0 ? "text-red-300" : "text-white")} /></div>
                <div><p className="text-xl font-bold text-white">{criticalRemaining}</p><p className="text-xs text-white/70">Critical Left</p></div>
              </div>
            </button>
            <button onClick={() => setActiveTab("appointments")} className="bg-white/10 backdrop-blur rounded-xl p-3.5 text-left hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center"><Calendar className="w-4 h-4 text-white" /></div>
                <div><p className="text-xl font-bold text-white">{upcoming.length}</p><p className="text-xs text-white/70">Appointments</p></div>
              </div>
            </button>
            <button onClick={() => setActiveTab("find-help")} className="bg-white/10 backdrop-blur rounded-xl p-3.5 text-left hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center"><Building2 className="w-4 h-4 text-white" /></div>
                <div><p className="text-xl font-bold text-white">{offices.length}</p><p className="text-xs text-white/70">Legal Offices</p></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {!isAuthenticated && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Sign in to save your progress</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">Your checklist progress, appointments, and notes require an account to persist across sessions.</p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="rounded-lg gap-1.5 text-xs sm:text-sm"><LayoutDashboard className="w-3.5 h-3.5" /><span className="hidden sm:inline">Dashboard</span><span className="sm:hidden">Home</span></TabsTrigger>
            <TabsTrigger value="checklist" className="rounded-lg gap-1.5 text-xs sm:text-sm"><ClipboardCheck className="w-3.5 h-3.5" />Checklist</TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg gap-1.5 text-xs sm:text-sm"><Calendar className="w-3.5 h-3.5" /><span className="hidden sm:inline">Appointments</span><span className="sm:hidden">Appts</span></TabsTrigger>
            <TabsTrigger value="find-help" className="rounded-lg gap-1.5 text-xs sm:text-sm"><MapPinned className="w-3.5 h-3.5" /><span className="hidden sm:inline">Find Legal Help</span><span className="sm:hidden">Find Help</span></TabsTrigger>
            <TabsTrigger value="resources" className="rounded-lg gap-1.5 text-xs sm:text-sm"><Library className="w-3.5 h-3.5" />Resources</TabsTrigger>
          </TabsList>

          {/* ═══ TAB: DASHBOARD ═══ */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Readiness Score */}
              <div className="lg:col-span-1 border rounded-2xl bg-card p-6 flex flex-col items-center text-center">
                <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-5">Legal Readiness Score</h2>
                <ReadinessRing percentage={readinessPercent} />
                <div className="mt-5 space-y-1">
                  <p className="text-sm font-medium">{readinessPercent >= 80 ? "Looking great — almost fully prepared." : readinessPercent >= 50 ? "Making progress — keep going." : "Just getting started — tackle critical items first."}</p>
                  <p className="text-xs text-muted-foreground">{criticalRemaining > 0 ? `${criticalRemaining} critical item${criticalRemaining !== 1 ? "s" : ""} need attention` : "All critical items complete"}</p>
                </div>
                <div className="flex gap-2 mt-5 w-full">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setActiveTab("checklist")}><ClipboardCheck className="w-3 h-3 mr-1.5" />View Checklist</Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs" asChild><Link href="./documents"><FileText className="w-3 h-3 mr-1.5" />Open Vault</Link></Button>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="lg:col-span-2 border rounded-2xl bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Upcoming Appointments</h2>
                  <Button size="sm" variant="outline" onClick={() => { setPrefilledOffice(null); setScheduleOpen(true) }}><CalendarPlus className="w-3.5 h-3.5 mr-1.5" />New</Button>
                </div>
                {upcoming.length > 0 ? (
                  <div className="space-y-3">
                    {upcoming.slice(0, 3).map((a) => (
                      <AppointmentCard key={a.id} appointment={a}
                        onComplete={() => updateAppt(a.id, { status: "completed" })}
                        onCancel={() => updateAppt(a.id, { status: "cancelled" })}
                        onDelete={() => removeAppt(a.id)} />
                    ))}
                    {upcoming.length > 3 && <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setActiveTab("appointments")}>View all {upcoming.length} appointments <ChevronRight className="w-3 h-3 ml-1" /></Button>}
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-xl bg-muted/20">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3"><Calendar className="w-5 h-5 text-muted-foreground/60" /></div>
                    <h3 className="text-sm font-semibold mb-1">No Upcoming Appointments</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">Schedule a JAG consultation, notary, or tax assistance session.</p>
                    <Button size="sm" className="mt-4" onClick={() => { setPrefilledOffice(null); setScheduleOpen(true) }}><CalendarPlus className="w-3.5 h-3.5 mr-1.5" />Schedule Now</Button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Find JAG Office", desc: "Locate your nearest legal assistance", icon: MapPinned, tab: "find-help" },
                { label: "SCRA Protections", desc: "File for interest rate caps & more", icon: Shield, tab: "resources", url: "https://scra.dmdc.osd.mil" },
                { label: "Free Legal Help", desc: "Military OneSource consultations", icon: Phone, tab: "resources", url: "https://www.militaryonesource.mil/legal/legal-assistance/" },
                { label: "Document Vault", desc: "Store wills, POAs, and more", icon: FileText, href: "./documents" },
              ].map((action) => (
                action.href ? (
                  <Link key={action.label} href={action.href} className="border rounded-xl p-4 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                    <action.icon className="w-5 h-5 text-accent mb-2" />
                    <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{action.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </Link>
                ) : action.url ? (
                  <a key={action.label} href={action.url} target="_blank" rel="noopener noreferrer" className="border rounded-xl p-4 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                    <action.icon className="w-5 h-5 text-accent mb-2" />
                    <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{action.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </a>
                ) : (
                  <button key={action.label} onClick={() => setActiveTab(action.tab!)} className="border rounded-xl p-4 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group text-left">
                    <action.icon className="w-5 h-5 text-accent mb-2" />
                    <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{action.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </button>
                )
              ))}
            </div>

            {/* Critical items remaining */}
            {criticalRemaining > 0 && (
              <div className="border border-red-200 dark:border-red-800/40 rounded-xl bg-red-50 dark:bg-red-950/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200">Critical Items Need Attention</h3>
                    <p className="text-sm text-red-700 dark:text-red-300/80 mt-0.5 leading-relaxed">{criticalRemaining} critical task{criticalRemaining !== 1 ? "s" : ""} remain incomplete. These are essential for deployment readiness.</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {criticalItems.filter((i) => !completionMap[i.id]?.completed).slice(0, 4).map((item) => (
                        <span key={item.id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">{item.label}</span>
                      ))}
                      {criticalRemaining > 4 && <span className="text-xs text-red-700 dark:text-red-300 px-2.5 py-1">+{criticalRemaining - 4} more</span>}
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700" onClick={() => setActiveTab("checklist")}>
                      <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />Go to Checklist
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes preview */}
            {notes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Recent Notes</h2>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingNote(null); setNoteDialogOpen(true) }}><Plus className="w-3.5 h-3.5 mr-1" />Add Note</Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {notes.slice(0, 4).map((n) => (
                    <NoteCard key={n.id} note={n}
                      onEdit={() => { setEditingNote(n); setNoteDialogOpen(true) }}
                      onDelete={() => removeNote(n.id)}
                      onTogglePin={() => updateNote(n.id, { pinned: !n.pinned })} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB: CHECKLIST ═══ */}
          <TabsContent value="checklist" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Legal Readiness Checklist</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Items linked to your Document Vault are tagged automatically.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block w-48"><Progress value={readinessPercent} className="h-2" /></div>
                <Button variant="outline" size="sm" onClick={resetAll}><RotateCcw className="w-3 h-3 mr-1.5" />Reset</Button>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(groupedChecklist).map(([cat, items]) => (
                <ChecklistCategory key={cat} category={cat} items={items} completionMap={completionMap} onToggle={toggle} linkedDocs={documents} />
              ))}
            </div>
          </TabsContent>

          {/* ═══ TAB: APPOINTMENTS ═══ */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Appointments</h2>
              <Button onClick={() => { setPrefilledOffice(null); setScheduleOpen(true) }}><CalendarPlus className="w-4 h-4 mr-2" />Schedule New</Button>
            </div>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</h3>
                {upcoming.map((a) => (
                  <AppointmentCard key={a.id} appointment={a}
                    onComplete={() => updateAppt(a.id, { status: "completed" })}
                    onCancel={() => updateAppt(a.id, { status: "cancelled" })}
                    onDelete={() => removeAppt(a.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border rounded-2xl bg-card">
                <div className="w-16 h-16 rounded-3xl bg-muted/60 flex items-center justify-center mx-auto mb-5"><Calendar className="w-7 h-7 text-muted-foreground/60" /></div>
                <h3 className="text-lg font-semibold mb-1.5">No Upcoming Appointments</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">Schedule a JAG consultation, notary service, or tax assistance session to get started.</p>
                <div className="flex gap-2 justify-center mt-6">
                  <Button onClick={() => { setPrefilledOffice(null); setScheduleOpen(true) }}><CalendarPlus className="w-4 h-4 mr-2" />Schedule Now</Button>
                  <Button variant="outline" onClick={() => setActiveTab("find-help")}><MapPinned className="w-4 h-4 mr-2" />Find an Office</Button>
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Past & Cancelled</h3>
                {past.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} onComplete={() => {}} onCancel={() => {}} onDelete={() => removeAppt(a.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB: FIND LEGAL HELP ═══ */}
          <TabsContent value="find-help" className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Find Legal Help</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Search military legal offices by installation name. Book appointments directly.</p>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by installation (e.g., Fort Liberty, Camp Pendleton)…" value={officeSearch}
                  onChange={(e) => setOfficeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleOfficeSearch()}
                  className="pl-10 h-10 rounded-xl" />
              </div>
              <Button onClick={handleOfficeSearch} disabled={officeSearching} className="rounded-xl">
                {officeSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
              {officeSearchResults && (
                <Button variant="outline" className="rounded-xl" onClick={() => { setOfficeSearch(""); setOfficeSearchResults(null) }}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Immediate help banner */}
            <div className="rounded-xl border bg-accent/5 border-accent/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-accent" /></div>
                <div>
                  <h3 className="font-semibold text-sm">Need Immediate Legal Help?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Call Military OneSource at <a href="tel:1-800-342-9647" className="font-semibold text-accent hover:underline">1-800-342-9647</a> for free, confidential consultations with licensed attorneys — 24/7, worldwide.</p>
                </div>
              </div>
            </div>

            {/* Office results */}
            {officeSearchResults && officeSearchResults.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-muted/20">
                <MapPinned className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">No offices found for &ldquo;{officeSearch}&rdquo;</h3>
                <p className="text-xs text-muted-foreground">Try a different installation name or use the <a href="https://legalassistance.law.af.mil/content/locator.php" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Armed Forces Legal Assistance Locator</a>.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {displayedOffices.map((o) => (
                  <OfficeCard key={o.id} office={o}
                    onSchedule={() => { setPrefilledOffice(o); setScheduleOpen(true) }}
                    onBookmark={() => bookmarkOffice(o.id, !o.is_bookmarked)} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB: RESOURCES ═══ */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Legal Resources & Services</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Free legal services, tools, and support programs for service members and families.</p>
              </div>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-full sm:w-44 h-9 rounded-xl text-sm"><SelectValue placeholder="All Resources" /></SelectTrigger>
                <SelectContent>{LEGAL_RESOURCE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Key hotlines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Military OneSource Legal", phone: "1-800-342-9647", desc: "Free attorney consultations" },
                { label: "CFPB Servicemember Line", phone: "1-855-411-2372", desc: "Financial complaints & help" },
                { label: "Armed Forces Legal Aid", phone: null, desc: "Find office by zip code", url: "https://legalassistance.law.af.mil/content/locator.php" },
              ].map((h) => (
                <div key={h.label} className="border rounded-xl p-4 bg-card">
                  <h4 className="font-semibold text-sm">{h.label}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
                  {h.phone ? (
                    <a href={`tel:${h.phone}`} className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-accent hover:underline"><Phone className="w-3.5 h-3.5" />{h.phone}</a>
                  ) : h.url ? (
                    <a href={h.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-accent hover:underline"><ExternalLink className="w-3.5 h-3.5" />Open Locator</a>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredResources.map((r) => <LegalResourceLinkCard key={r.id} resource={r} />)}
            </div>

            {/* Notes section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">My Legal Notes</h2>
                <Button size="sm" variant="outline" onClick={() => { setEditingNote(null); setNoteDialogOpen(true) }}><Plus className="w-3.5 h-3.5 mr-1" />Add Note</Button>
              </div>
              {notes.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {notes.map((n) => (
                    <NoteCard key={n.id} note={n}
                      onEdit={() => { setEditingNote(n); setNoteDialogOpen(true) }}
                      onDelete={() => removeNote(n.id)}
                      onTogglePin={() => updateNote(n.id, { pinned: !n.pinned })} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-xl bg-muted/20">
                  <p className="text-sm text-muted-foreground">No notes yet. Add notes to track legal tasks, attorney names, case numbers, etc.</p>
                </div>
              )}
            </div>

            {/* Vault cross-link */}
            <div className="rounded-2xl border bg-gradient-to-br from-muted/40 via-background to-muted/20 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6 text-accent" /></div>
                  <div>
                    <h3 className="font-semibold">Document Vault</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed max-w-md">Store, organize, and share your legal documents securely — wills, POAs, insurance policies, and more.</p>
                  </div>
                </div>
                <Button asChild variant="outline" className="rounded-xl flex-shrink-0">
                  <Link href="./documents"><FileText className="w-4 h-4 mr-2" />Go to Vault<ChevronRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} onSave={addAppt} offices={offices} prefilledOffice={prefilledOffice} />
      <NoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} editing={editingNote}
        onSave={(data) => {
          if (editingNote) { updateNote(editingNote.id, data) }
          else { addNote({ title: data.title, content: data.content, category: data.category || undefined }) }
        }} />

      <Footer />
    </div>
  )
}