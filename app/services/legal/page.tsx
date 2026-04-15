"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Scale, FileText, HomeIcon, Users, Shield, BookOpen, Gavel, Heart,
  DollarSign, Clock, AlertTriangle, CheckCircle, ExternalLink, ChevronDown,
  Building2, FileCheck, Briefcase, Info, Lightbulb, Lock, MapPin, Phone,
  Globe, Award, Menu, X, ChevronRight
} from "lucide-react"

// ─── Data ────────────────────────────────────────────────────────────────────

const categories = [
  { name: "Powers of Attorney", icon: FileText, id: "poa", color: "text-blue-500 dark:text-blue-400" },
  { name: "Estate Planning", icon: BookOpen, id: "estate", color: "text-violet-500 dark:text-violet-400" },
  { name: "Medical Directives", icon: Heart, id: "medical", color: "text-red-500 dark:text-red-400" },
  { name: "SCRA Protections", icon: Shield, id: "scra", color: "text-emerald-500 dark:text-emerald-400" },
  { name: "Family Law", icon: Users, id: "family", color: "text-amber-500 dark:text-amber-400" },
  { name: "Civil Protections", icon: Scale, id: "civil", color: "text-indigo-500 dark:text-indigo-400" },
  { name: "Tax Assistance", icon: DollarSign, id: "tax", color: "text-green-500 dark:text-green-400" },
  { name: "Employment Rights", icon: Briefcase, id: "userra", color: "text-sky-500 dark:text-sky-400" },
  { name: "Consumer Protection", icon: Lock, id: "consumer", color: "text-fuchsia-500 dark:text-fuchsia-400" },
]

const quickLinks = [
  { name: "Navy JAG Corps", url: "https://www.jag.navy.mil/", icon: Gavel },
  { name: "Army JAG Corps", url: "https://www.jagcnet.army.mil/", icon: Gavel },
  { name: "Air Force Legal", url: "https://legalassistance.law.af.mil/", icon: Scale },
  { name: "Marines Legal", url: "https://www.hqmc.marines.mil/sja/", icon: Gavel },
  { name: "Military OneSource", url: "https://www.militaryonesource.mil/financial-legal/legal/", icon: Building2 },
  { name: "Armed Forces Legal", url: "https://legalassistance.law.af.mil/", icon: MapPin },
]

const allResources = [
  { name: "Navy JAG Corps", url: "https://www.jag.navy.mil/", icon: Gavel },
  { name: "Army JAG Corps", url: "https://www.jagcnet.army.mil/", icon: Gavel },
  { name: "Air Force Legal", url: "https://legalassistance.law.af.mil/", icon: Scale },
  { name: "Marines Legal", url: "https://www.hqmc.marines.mil/sja/", icon: Gavel },
  { name: "Military OneSource Legal", url: "https://www.militaryonesource.mil/financial-legal/legal/", icon: Building2 },
  { name: "DOJ SCRA Info", url: "https://www.justice.gov/servicemembers/servicemembers-civil-relief-act-scra", icon: Shield },
  { name: "IRS Military Tax", url: "https://www.irs.gov/individuals/military", icon: DollarSign },
  { name: "milConnect", url: "https://milconnect.dmdc.osd.mil/", icon: Globe },
  { name: "TSP.gov", url: "https://www.tsp.gov", icon: DollarSign },
  { name: "ESGR / USERRA", url: "https://www.esgr.mil/", icon: Briefcase },
  { name: "VA Legal Services", url: "https://www.va.gov/ogc/legalservices.asp", icon: Award },
  { name: "CFPB Military", url: "https://www.consumerfinance.gov/consumer-tools/military-financial-readiness/", icon: Lock },
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
  variant: "amber" | "red" | "blue" | "green" | "purple"
  title?: string
  children: React.ReactNode
}) {
  const styles = {
    amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50",
    red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50",
    green: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50",
    purple: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50",
  }

  return (
    <div className={`rounded-lg border p-4 mt-4 ${styles[variant]}`}>
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

// ─── Content Sections ────────────────────────────────────────────────────────

function HomeContent() {
  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-7 text-center">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-5 bg-primary text-primary-foreground">
          <Shield className="w-3 h-3" />
          Legal Services
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight text-foreground">
          Military Legal Services
        </h1>
        <p className="text-base lg:text-lg max-w-lg mx-auto text-muted-foreground">
          Comprehensive legal resources for active-duty service members. All services listed below
          are available at no cost through your installation{"'"}s Legal Assistance Office or Judge
          Advocate General (JAG) Corps.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        <Button asChild>
          <a
            href="https://legalassistance.law.af.mil/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin className="h-4 w-4" />
            Find Legal Assistance Office
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
        <Button asChild>
          <a
            href="https://www.militaryonesource.mil/financial-legal/legal/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Phone className="h-4 w-4" />
            Military OneSource Legal
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-lg text-center font-bold text-foreground mb-4">All Legal Resources</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allResources.map((r) => (
            <ResourceCard key={r.name} name={r.name} url={r.url} icon={r.icon} />
          ))}
        </div>
      </div>
    </div>
  )
}

function POAContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Powers of Attorney</h2>
        <p className="text-muted-foreground leading-relaxed">
          A Power of Attorney (POA) is one of the most critical legal documents a service member can have before deployment. It allows a trusted person to manage your affairs while you{"'"}re away, from bank accounts to vehicle transactions to housing decisions.
        </p>
      </div>

      <Callout variant="warn" icon={Lightbulb}>
        <strong>Free preparation available:</strong> Your installation{"'"}s Legal Assistance Office can prepare a POA at no cost, typically in a single appointment. Bring a valid military ID and know what specific powers you want to grant. Some banks and institutions have their own POA forms. Check with them beforehand.
      </Callout>

      <Accordion icon={FileText} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="General vs. Special POA" desc="Understanding the different types and when to use each">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-2 text-sm">General POA</h4>
            <p className="text-xs text-muted-foreground mb-3">Broad authority to act on your behalf:</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Managing all bank accounts and finances</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Selling, buying, or investing in assets</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Purchasing and maintaining insurance policies</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Entering into binding contracts</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Filing and paying taxes</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Making real estate decisions</li>
            </ul>
            <HighlightBox variant="amber">
              <p><strong>Caution:</strong> Some institutions may not accept a general POA for complex transactions. Always verify beforehand.</p>
            </HighlightBox>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-2 text-sm">Special / Limited POA</h4>
            <p className="text-xs text-muted-foreground mb-3">Restricted to specific tasks:</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Named bank accounts only</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Specific vehicle transactions</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Specific property sale or management</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Named insurance policy management</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Specific government benefits enrollment</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Individual contract negotiations</li>
            </ul>
            <HighlightBox variant="amber">
              <p><strong>Note:</strong> You{"'"}ll need a separate POA for each distinct business relationship or institution.</p>
            </HighlightBox>
          </div>
        </div>
      </Accordion>

      <Accordion icon={Clock} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="Types of POA by Duration" desc="Regular, Durable, and Springing powers explained">
        <div className="space-y-0 divide-y divide-border dark:divide-slate-500">
          {[
            { icon: Clock, name: "Regular POA", desc: "Takes effect immediately when signed. Remains valid until expiration date, revocation by the grantor, incapacitation, or death. Best for short deployments with a defined timeline." },
            { icon: Shield, name: "Durable POA", desc: "Contains special legal language allowing it to continue even if you become incapacitated. Highly recommended for deployment — ensures your agent can continue acting if you are injured and unable to communicate." },
            { icon: AlertTriangle, name: "Springing POA", desc: "Only becomes valid upon a triggering event (commonly incapacitation determined by a physician). Does not give your agent any authority until the condition is met. Useful as a backup plan without granting immediate authority." },
          ].map((item) => (
            <div key={item.name} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <item.icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <HighlightBox variant="blue" title="Which should you choose?">
          <p>For most deploying service members, a <strong>Durable Special POA</strong> is recommended — it limits authority to specific tasks but ensures continuity if you{"'"}re incapacitated. Discuss your situation with your JAG attorney.</p>
        </HighlightBox>
      </Accordion>

      <Accordion icon={CheckCircle} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="What Your POA Holder Can Do" desc="Common tasks your agent can handle while you're deployed">
        <div className="grid gap-1 md:grid-cols-2">
          {[
            "Access family finances and bank accounts",
            "Pay bills, rent, and mortgage",
            "Pay taxes and receive tax refunds",
            "Receive emergency financial assistance",
            "Accept government housing on waiting list",
            "Enroll newborn children in DEERS/TRICARE",
            "Handle vehicle transactions",
            "Manage insurance claims",
            "Sign for shipment of household goods",
            "Handle school enrollment for children",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5 py-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion icon={AlertTriangle} iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" title="POA Pitfalls and Revocation" desc="Common mistakes and how to revoke a POA">
        <HighlightBox variant="red" title="Common Mistakes">
          <ul className="space-y-1">
            <li>Granting general POA when only specific authority is needed</li>
            <li>Not verifying institutions will accept your POA format before deployment</li>
            <li>Failing to set an expiration date</li>
            <li>Not providing a copy to your agent, the institution, and keeping one in your records</li>
            <li>Choosing someone who is not trustworthy or financially responsible</li>
          </ul>
        </HighlightBox>
        <div className="mt-4">
          <HighlightBox variant="blue" title="How to Revoke a POA">
            <ul className="space-y-1">
              <li>Submit a written revocation to your agent</li>
              <li>Notify all institutions that received a copy</li>
              <li>Your JAG office can prepare a revocation letter</li>
              <li>Some states require the revocation to be notarized</li>
              <li>Destroying the document alone does NOT revoke the POA if copies exist</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.jag.navy.mil/" icon={Gavel}>JAG Corps — Get POA</LinkButton>
        <LinkButton href="https://www.militaryonesource.mil/financial-legal/legal/" icon={Building2} variant="secondary">Military OneSource Legal</LinkButton>
      </div>
    </div>
  )
}

function EstateContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Estate Planning</h2>
        <p className="text-muted-foreground leading-relaxed">
          Drafting or updating a Last Will and Testament to designate property distribution and guardianship for children is essential before deployment. A proper estate plan ensures your wishes are carried out and your family is protected.
        </p>
      </div>

      <Callout variant="info" icon={Lightbulb}>
        <strong>Free will preparation:</strong> JAG offices prepare basic wills at no cost, often in a single appointment. Bring information about your assets, debts, beneficiary preferences, and who you{"'"}d want as guardian for any minor children.
      </Callout>

      <Accordion icon={BookOpen} iconBg="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" title="What a Will Should Include" desc="Essential components of a military member's will">
        <HighlightBox variant="purple" title="Essential Will Components">
          <ul className="space-y-1">
            <li>Designation of property and asset distribution</li>
            <li>Guardianship appointment for minor children (and alternates)</li>
            <li>Executor designation — who manages your estate</li>
            <li>Beneficiary designations coordinated with SGLI, TSP, and bank accounts</li>
            <li>Specific bequests for personal items of sentimental or monetary value</li>
            <li>Digital asset instructions (passwords, crypto wallets, online accounts)</li>
            <li>Pet care arrangements if applicable</li>
          </ul>
        </HighlightBox>
        <div className="mt-4">
          <HighlightBox variant="red" title="Critical Reminder">
            <p>SGLI, TSGLI, TSP, and bank accounts with named beneficiaries pass <strong>directly</strong> to those beneficiaries regardless of what your will states. Always ensure your beneficiary designations match your will{"'"}s intent.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={FileCheck} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="Will Preparation: Step by Step" desc="How to prepare for your JAG appointment">
        <div className="space-y-3">
          <StepItem num={1} title="Inventory your assets" desc="List all bank accounts, investment accounts (TSP, IRA, brokerage), real estate, vehicles, valuable personal property, and digital assets including cryptocurrency and important online accounts." />
          <StepItem num={2} title="Inventory your debts" desc="List mortgages, car loans, credit cards, student loans, and personal loans with lender names and account numbers." />
          <StepItem num={3} title="Choose your beneficiaries" desc="Decide who receives what. Be specific — 'my spouse receives all real property' or 'divide equally among my children.' Name alternate beneficiaries in case your primary choice predeceases you." />
          <StepItem num={4} title="Name a guardian for minor children" desc="Choose a guardian and alternate. Discuss this with them before your appointment. This is legally separate from your Family Care Plan." />
          <StepItem num={5} title="Select an executor" desc="The executor manages your estate after death — paying debts, distributing assets, filing paperwork. Choose someone trustworthy and organized. Have an alternate." />
          <StepItem num={6} title="Coordinate beneficiary designations" desc="Ensure SGLI, TSP, bank POD designations, and IRA beneficiaries all match your will's intent. Review on milConnect and TSP.gov." />
        </div>
        <div className="mt-4">
          <HighlightBox variant="amber" title="What to bring to your JAG appointment">
            <ul className="space-y-1">
              <li>Military ID</li>
              <li>Full legal names and addresses of beneficiaries, guardians, and executor</li>
              <li>Complete list of assets and debts</li>
              <li>Any existing will or estate planning documents</li>
              <li>Spouse{"'"}s information — both spouses should attend if possible</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Briefcase} iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" title="Trusts & Advanced Planning" desc="When a basic will isn't enough — revocable and irrevocable trusts">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Most junior service members only need a simple will. As you advance in rank and accumulate assets — especially real estate in multiple states, significant investments, or complex family situations — a trust may be beneficial. JAG offices can advise whether a trust is appropriate but typically cannot draft trusts; they{"'"}ll refer you to qualified civilian attorneys.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Revocable Living Trust</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Purpose:</strong> Holds assets during your lifetime, distributes at death</li>
              <li><strong className="text-foreground">Avoids probate:</strong> Assets transfer directly, bypassing court</li>
              <li><strong className="text-foreground">Privacy:</strong> Trust distributions are private (wills become public record)</li>
              <li><strong className="text-foreground">Flexible:</strong> Can be modified or revoked while alive</li>
              <li><strong className="text-foreground">Best for:</strong> Real estate in multiple states, blended families</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Irrevocable Trust</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Purpose:</strong> Permanently removes assets from your estate</li>
              <li><strong className="text-foreground">Tax benefits:</strong> Reduces estate taxes for high-net-worth individuals</li>
              <li><strong className="text-foreground">Asset protection:</strong> Shields assets from creditors and lawsuits</li>
              <li><strong className="text-foreground">Cannot be changed:</strong> Terms generally fixed once established</li>
              <li><strong className="text-foreground">Best for:</strong> Estates exceeding federal exemption thresholds</li>
            </ul>
          </Card>
        </div>
        <div className="mt-4">
          <HighlightBox variant="blue" title="Do You Need a Trust?">
            <p>Most service members do not. A well-drafted will with properly designated beneficiaries on SGLI, TSP, and bank accounts covers most situations. Consider a trust if you own real estate in multiple states, have a blended family, or have assets exceeding state probate thresholds.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Clock} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="When to Update Your Will" desc="Life events that trigger a review">
        <HighlightBox variant="red" title="Update your will immediately after:">
          <ul className="space-y-1.5">
            <li><strong>Marriage or divorce</strong> — your ex-spouse may still inherit under an old will</li>
            <li><strong>Birth or adoption of a child</strong> — add guardianship provisions</li>
            <li><strong>Death of a beneficiary, executor, or guardian</strong> — name replacements</li>
            <li><strong>Significant change in assets</strong> — buying a home, inheritance, large investments</li>
            <li><strong>PCS to a new state</strong> — state laws governing wills vary significantly</li>
            <li><strong>Before any deployment</strong> — standard pre-deployment legal readiness</li>
            <li><strong>Promotion or reenlistment</strong> — changes in SGLI coverage, pay, and benefits</li>
          </ul>
        </HighlightBox>
        <div className="mt-4">
          <Callout variant="warn" icon={Lightbulb}>
            <strong>Pro tip:</strong> Set a calendar reminder to review your will annually. When you PCS, schedule a legal assistance appointment as part of check-in to review under the new state{"'"}s laws.
          </Callout>
        </div>
      </Accordion>

      <Accordion icon={Users} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="Beneficiary Designations" desc="SGLI, TSP, and bank accounts — these override your will">
        <HighlightBox variant="red" title="Beneficiary designations override your will">
          <p>If your SGLI names your ex-spouse but your will leaves everything to your current spouse, your ex-spouse gets the SGLI money. Always keep these in sync.</p>
        </HighlightBox>
        <Card className="p-4 mt-4">
          <h4 className="text-sm font-bold text-foreground mb-3">Accounts with beneficiary designations</h4>
          <div className="divide-y divide-border dark:divide-slate-500">
            {[
              ["SGLI ($500,000):", "Update on milConnect or SOES (SGLI Online Enrollment System)"],
              ["TSP:", "Update on TSP.gov under 'Beneficiaries' — must be witnessed or notarized"],
              ["Bank accounts:", "Check POD (Payable on Death) designations with each bank"],
              ["IRA / Roth IRA:", "Update through your brokerage provider"],
              ["Private life insurance:", "Contact your insurance company directly"],
              ["SBP (Survivor Benefit Plan):", "Notify DFAS of any changes"],
            ].map(([label, desc]) => (
              <p key={label} className="text-sm text-muted-foreground py-2.5"><strong className="text-foreground">{label}</strong> {desc}</p>
            ))}
          </div>
        </Card>
        <div className="grid gap-3 md:grid-cols-2 mt-4">
          <ResourceCard name="milConnect — SGLI Updates" url="https://milconnect.dmdc.osd.mil/" icon={Globe} />
          <ResourceCard name="TSP.gov — TSP Beneficiaries" url="https://www.tsp.gov" icon={DollarSign} />
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.jag.navy.mil/" icon={Gavel}>Schedule Estate Planning with JAG</LinkButton>
        <LinkButton href="https://www.militaryonesource.mil/financial-legal/legal/estate-planning/" icon={Building2} variant="secondary">Military OneSource Estate Guide</LinkButton>
      </div>
    </div>
  )
}

function MedicalContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Advanced Medical Directives</h2>
        <p className="text-muted-foreground leading-relaxed">
          A Living Will and Healthcare Power of Attorney ensure your medical wishes are respected if you become unable to make decisions. These are separate from a regular POA and are critical documents for any deploying service member.
        </p>
      </div>

      <Callout variant="info" icon={Info}>
        <strong>Both documents at no cost:</strong> Your JAG office can prepare both a Living Will and Healthcare POA in a single appointment. These documents are recognized across all 50 states, though state-specific forms may provide additional protections.
      </Callout>

      <Accordion icon={Heart} iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" title="Living Will & Healthcare POA" desc="What each document covers and why you need both" >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-3 text-sm">Living Will</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Life-sustaining treatment preferences (ventilator, feeding tube, dialysis)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Pain management and comfort care decisions</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Organ and tissue donation wishes</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />End-of-life care instructions</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Religious or spiritual considerations</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Do Not Resuscitate (DNR) preferences</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-3 text-sm">Healthcare POA</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Designates someone to make all medical decisions</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Activates only if you{"'"}re unable to communicate</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Agent can consent to or refuse treatment</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Can authorize access to medical records</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Can make mental health treatment decisions</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Should name an alternate agent</li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <HighlightBox variant="amber" title="Important Distinctions">
            <p>A Living Will speaks for you — it states your wishes in advance. A Healthcare POA empowers someone else to make decisions in situations your Living Will doesn{"'"}t cover. <strong>You should have both.</strong></p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={FileCheck} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="What to Decide Before Your Appointment" desc="Key medical decisions to make in advance">
        <div className="space-y-3">
          <StepItem num={1} title="Life-sustaining treatment" desc="Do you want CPR, mechanical ventilation, artificial nutrition and hydration, or dialysis if you have a terminal condition or are permanently unconscious?" />
          <StepItem num={2} title="Pain management" desc="Would you want maximum pain relief even if it might hasten death? Are there religious or personal beliefs that affect pain management?" />
          <StepItem num={3} title="Organ donation" desc="Do you want to donate organs, tissues, or your entire body? Are there specific organs you do or don't want donated?" />
          <StepItem num={4} title="Choose your healthcare agent" desc="Pick someone who understands and will honor your wishes, can handle difficult decisions under stress, and is likely to be reachable. Name an alternate agent." />
          <StepItem num={5} title="Distribute copies" desc="Give copies to your healthcare agent, primary care provider, the MTF, your unit, and keep one in your personal records." />
        </div>
      </Accordion>

      <Accordion icon={AlertTriangle} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="HIPAA Authorization" desc="Allow your agent to access your medical information">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          A Healthcare POA alone may not grant access to all your medical records. A separate HIPAA Authorization form allows your designated agent to receive medical updates, access records, and communicate with your healthcare providers. Without this, providers may be legally unable to share information even with your Healthcare POA holder.
        </p>
        <HighlightBox variant="blue" title="HIPAA Authorization Should Include:">
          <ul className="space-y-1">
            <li>Name and contact info of the person authorized to receive information</li>
            <li>Scope of information they can access (all records vs. specific conditions)</li>
            <li>Duration of the authorization</li>
            <li>Your signature and date</li>
          </ul>
        </HighlightBox>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.jag.navy.mil/" icon={Heart}>Create Medical Directives with JAG</LinkButton>
        <LinkButton href="https://www.militaryonesource.mil/financial-legal/legal/" icon={Building2} variant="secondary">Military OneSource</LinkButton>
      </div>
    </div>
  )
}

function SCRAContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">SCRA Protections</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Servicemembers Civil Relief Act (SCRA) provides powerful legal protections for active-duty service members including lease termination, interest rate caps, eviction protection, and civil court stay of proceedings. These protections also apply to activated Guard and Reserve members.
        </p>
      </div>

      <Callout variant="success" icon={Lightbulb}>
        <strong>How to invoke SCRA:</strong> Contact your creditor or landlord in writing, include a copy of your military orders, cite the specific SCRA provision, and send via certified mail with return receipt. Your JAG office can draft these letters for free.
      </Callout>

      <Accordion icon={Shield} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="Complete SCRA Protections" desc="All protections under the Servicemembers Civil Relief Act" >
        <div className="divide-y divide-border dark:divide-slate-500">
          {[
            ["Lease Termination (§535):", "Terminate residential or auto leases without penalty with deployment or PCS orders. Provide written notice with a copy of orders. Residential leases terminate 30 days after next rent payment; auto leases terminate immediately."],
            ["Interest Rate Cap (§527):", "Cap interest rates at 6% on all pre-service debts including mortgages, credit cards, auto loans, and student loans. Lender must forgive interest above 6%, not just defer it."],
            ["Eviction Protection (§531):", "Landlord cannot evict a service member or their dependents from housing during military service without a court order. Rent threshold adjusted annually."],
            ["Default Judgment Protection (§521):", "Courts must appoint an attorney for the service member before entering a default judgment. Any default judgment entered during service can be reopened."],
            ["Stay of Civil Proceedings (§522):", "Request postponement of any civil court case where your military service materially affects your ability to appear. Courts must grant at least a 90-day initial stay."],
            ["Cell Phone Contract (§535a):", "Terminate or suspend cell phone and internet contracts without early termination fees when deploying or receiving PCS orders to a location where service is unavailable."],
            ["Storage Lien Protection (§537):", "Items placed in storage before or during military service cannot be sold to satisfy a storage lien without a court order."],
            ["Taxes and Assessments (§561):", "Non-payment of taxes by a service member cannot result in the sale of their property during service or 180 days after."],
            ["Insurance Protection (§536):", "Life insurance policies cannot be terminated for non-payment during military service. SGLI and VGLI provide guaranteed coverage."],
            ["Mortgage Foreclosure (§533):", "No foreclosure sale during military service or within one year after without a court order. Service member can request a stay of proceedings."],
          ].map(([label, desc]) => (
            <p key={label} className="text-sm text-muted-foreground py-3 leading-relaxed"><strong className="text-foreground">{label}</strong> {desc}</p>
          ))}
        </div>
      </Accordion>

      <Accordion icon={FileText} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="How to File an SCRA Claim" desc="Step-by-step process for invoking your rights">
        <div className="space-y-3">
          <StepItem num={1} title="Verify your eligibility" desc="Confirm you are on active duty (including activated Guard/Reserve). Use the SCRA website to generate a verification letter showing your active-duty status." />
          <StepItem num={2} title="Identify the protection you need" desc="Determine which SCRA provision applies to your situation (lease termination, interest rate cap, stay of proceedings, etc.)." />
          <StepItem num={3} title="Draft your notice letter" desc="Your JAG office can prepare this for free. The letter should cite the specific SCRA section, include your name, rank, and unit, and state the specific relief you're requesting." />
          <StepItem num={4} title="Attach your military orders" desc="Include a copy of your deployment orders, PCS orders, or active-duty orders. A letter from your commanding officer may also be accepted." />
          <StepItem num={5} title="Send via certified mail" desc="Always send SCRA correspondence by certified mail with return receipt requested. Keep copies of everything for your records." />
          <StepItem num={6} title="Follow up and escalate" desc="If a creditor or landlord refuses to comply, contact your JAG office. The Department of Justice can also enforce SCRA violations and impose penalties." />
        </div>
      </Accordion>

      <Accordion icon={AlertTriangle} iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" title="SCRA Violations & Enforcement" desc="What to do if your rights are violated">
        <HighlightBox variant="red" title="If Your SCRA Rights Are Violated">
          <ul className="space-y-1">
            <li>Document everything — save all letters, emails, and records of phone calls</li>
            <li>Contact your installation{"'"}s Legal Assistance Office immediately</li>
            <li>File a complaint with the Department of Justice Civil Rights Division</li>
            <li>Contact the Consumer Financial Protection Bureau (CFPB) for financial violations</li>
            <li>SCRA violations can result in fines and criminal penalties for the violator</li>
          </ul>
        </HighlightBox>
        <div className="mt-4">
          <HighlightBox variant="blue" title="Where to Report Violations">
            <ul className="space-y-1">
              <li><strong>DOJ:</strong> servicemembers@usdoj.gov or 800-552-3366</li>
              <li><strong>CFPB:</strong> consumerfinance.gov/complaint</li>
              <li><strong>Your installation JAG office</strong></li>
              <li><strong>Military OneSource:</strong> 800-342-9647</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.justice.gov/servicemembers/servicemembers-civil-relief-act-scra" icon={Shield}>SCRA Full Information (DOJ)</LinkButton>
        <LinkButton href="https://scra.dmdc.osd.mil/" icon={Globe} variant="secondary">SCRA Status Verification</LinkButton>
        <LinkButton href="https://www.jag.navy.mil/" icon={Gavel} variant="secondary">JAG SCRA Assistance</LinkButton>
      </div>
    </div>
  )
}

function FamilyContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Family Law Support</h2>
        <p className="text-muted-foreground leading-relaxed">
          Military legal assistance offices handle a wide range of family law matters including custody arrangements, family care plans, divorce guidance, and adoption assistance. All single parents and dual-military couples with dependents must maintain a current Family Care Plan.
        </p>
      </div>

      <Callout variant="warn" icon={Info}>
        <strong>Family Care Plans:</strong> Single parents and dual-military couples must complete DD Form 1342 designating short-term and long-term caregivers. Failure to maintain a current plan can affect your deployability and may be grounds for administrative separation.
      </Callout>

      <Accordion icon={Users} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="Family Care Plan Requirements" desc="Everything your DD Form 1342 must include" >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-3 text-sm">Plan Must Include</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Short-term caregiver (available within hours)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Long-term caregiver (for deployment)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Financial arrangements — allotments, POA</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Legal documents — guardianship, medical POA</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Transportation and logistics</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Special needs dependent care</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Pet care arrangements</li>
            </ul>
          </div>
          <Card className="p-4">
            <h4 className="font-bold text-foreground mb-3 text-sm">Supporting Documents Needed</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Special Power of Attorney for caregivers</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Medical POA for dependent care</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />School enrollment authorization letters</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />TRICARE enrollment documentation</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />ID card documentation for dependents</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Consent from non-custodial parent (if divorced)</li>
            </ul>
          </Card>
        </div>
      </Accordion>

      <Accordion icon={Scale} iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" title="Divorce & Separation" desc="Military-specific considerations for divorce">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Military divorce involves unique considerations including division of retirement pay, survivor benefits, continued healthcare through TRICARE, and the impact on housing allowances. JAG offices can provide guidance but typically cannot represent you in contested divorce proceedings.
        </p>
        <div className="divide-y divide-border dark:divide-slate-500">
          {[
            ["Jurisdiction:", "You can file in the state where you're stationed, the state of legal residence, or the state where your spouse resides. Each may have different waiting periods and property division rules."],
            ["10/10 Rule:", "If the marriage overlapped with 10+ years of creditable military service, the former spouse can receive their share of retirement pay directly from DFAS."],
            ["20/20/20 Rule:", "Former spouses married to military members for 20+ years, with 20+ years of service, and 20+ years of overlap retain full TRICARE and commissary/exchange privileges."],
            ["20/20/15 Rule:", "Similar to 20/20/20 but with 15-20 years of overlap. Former spouse receives one year of transitional healthcare coverage."],
            ["SBP:", "Courts can order SBP coverage for former spouses as part of the divorce decree. Must be elected within one year of the divorce."],
            ["BAH:", "Service members are required to provide adequate financial support to dependents regardless of divorce status. Commands can direct BAH payments."],
          ].map(([label, desc]) => (
            <p key={label} className="text-sm text-muted-foreground py-3 leading-relaxed"><strong className="text-foreground">{label}</strong> {desc}</p>
          ))}
        </div>
        <div className="mt-4">
          <HighlightBox variant="amber" title="What JAG Can and Cannot Do">
            <p>JAG can provide legal advice, explain your rights, help you understand the process, and prepare some documents. JAG <strong>cannot</strong> represent you in contested divorce proceedings — they can refer you to civilian attorneys. Many bar associations offer reduced rates for military members.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={Heart} iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" title="Child Custody & Support" desc="Protecting parental rights during deployment">
        <div className="divide-y divide-border dark:divide-slate-500">
          {[
            ["Deployment Protection:", "Under federal and most state laws, a temporary duty absence cannot be the sole basis for a permanent change in custody. Courts must consider the child's best interest, not just the parent's availability."],
            ["Temporary Custody Orders:", "You can obtain a temporary custody order before deployment designating who will care for your child while you're away. This does not permanently change custody."],
            ["Child Support:", "Military pay is subject to garnishment for child support. DFAS processes involuntary allotments for court-ordered child support. Voluntary allotments can also be set up."],
            ["Interstate Custody:", "The UCCJEA determines which state has jurisdiction. Military families may have contacts with multiple states, making this complex."],
            ["Mediation:", "Military OneSource offers free family mediation services that can help resolve custody disputes without court involvement."],
          ].map(([label, desc]) => (
            <p key={label} className="text-sm text-muted-foreground py-3 leading-relaxed"><strong className="text-foreground">{label}</strong> {desc}</p>
          ))}
        </div>
      </Accordion>

      <Accordion icon={FileCheck} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="Additional Family Law Services" desc="Adoption, paternity, name changes, and more">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Through JAG</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Adoption assistance and guidance</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Paternity establishment</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Name change petitions</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Domestic violence protective orders</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Immigration support for military families</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">External Resources</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Military OneSource counseling (800-342-9647)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Installation Family Support Center</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />State bar military committees</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />ABA Military Pro Bono Project</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Legal Aid for qualifying members</li>
            </ul>
          </Card>
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.jag.navy.mil/" icon={Users}>Family Law Consultation</LinkButton>
        <LinkButton href="https://www.militaryonesource.mil/family-relationships/" icon={Building2} variant="secondary">Military OneSource Family</LinkButton>
      </div>
    </div>
  )
}

function CivilContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Civil Legal Protections</h2>
        <p className="text-muted-foreground leading-relaxed">
          When you{"'"}re deployed, you shouldn{"'"}t lose a legal case simply because you can{"'"}t appear in court. The SCRA and other laws provide powerful protections to stay proceedings, prevent default judgments, and protect your property while you serve.
        </p>
      </div>

      <Callout variant="warn" icon={Lightbulb}>
        <strong>Act immediately:</strong> If you receive any legal papers or court notices while deployed, contact your JAG office right away. They can file motions on your behalf to delay proceedings. Do not ignore legal notices — inaction can result in default judgments.
      </Callout>

      <Accordion icon={Scale} iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" title="Civil Protections Available" desc="Stays, foreclosure protection, and default judgment protections" >
        <div className="divide-y divide-border dark:divide-slate-500">
          {[
            ["Stay of Proceedings:", "Request postponement of civil court cases during deployment. The court must grant at least a 90-day initial stay. Additional stays may be granted at the court's discretion."],
            ["Foreclosure Protection:", "No foreclosure sale during service or within one year after without a court order. Courts may adjust obligations to preserve the service member's interest."],
            ["Default Judgment Protection:", "Before entering a default judgment, the court must appoint an attorney to represent the service member and postpone the case for at least 90 days if on active duty."],
            ["Reopening Default Judgments:", "Default judgments entered during service can be reopened if the service member was materially affected and has a meritorious defense. Must apply within 90 days of release from active duty."],
            ["Fines and Penalties:", "No fines or penalties can be imposed for failure to comply with court orders during military service if compliance was prevented by military duty."],
            ["Statute of Limitations Tolling:", "The period of military service does not count toward statutes of limitation for civil legal proceedings."],
          ].map(([label, desc]) => (
            <p key={label} className="text-sm text-muted-foreground py-3 leading-relaxed"><strong className="text-foreground">{label}</strong> {desc}</p>
          ))}
        </div>
      </Accordion>

      <Accordion icon={HomeIcon} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="Property Protections" desc="Protecting your home, car, and personal property">
        <div className="divide-y divide-border dark:divide-slate-500">
          {[
            ["Eviction Protection:", "Cannot be evicted without a court order during military service for rentals below the adjusted threshold (updated annually)."],
            ["Mortgage Interest Cap:", "Mortgage interest on pre-service mortgages capped at 6%. Applies upon written request with copy of orders."],
            ["Property Taxes:", "Cannot lose property for non-payment of taxes during service and 180 days after."],
            ["Installment Contracts:", "No repossession of property purchased on installment before service without a court order, if any payment was made before service."],
            ["Vehicle Protection:", "No repossession of a vehicle purchased before service without a court order."],
          ].map(([label, desc]) => (
            <p key={label} className="text-sm text-muted-foreground py-3 leading-relaxed"><strong className="text-foreground">{label}</strong> {desc}</p>
          ))}
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.jag.navy.mil/" icon={Scale}>Civil Law Assistance</LinkButton>
        <LinkButton href="https://www.justice.gov/servicemembers" icon={Shield} variant="secondary">DOJ Service Members Page</LinkButton>
      </div>
    </div>
  )
}

function TaxContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Tax Assistance</h2>
        <p className="text-muted-foreground leading-relaxed">
          Military members receive significant tax benefits during deployment, including the Combat Zone Tax Exclusion (CZTE), automatic filing extensions, and free tax preparation services through installation tax centers and the IRS VITA program.
        </p>
      </div>

      <Callout variant="info" icon={Info}>
        <strong>Filing extensions:</strong> If deployed to a combat zone, you automatically receive at least 180 days after leaving the zone to file your return and pay any taxes due. This also applies to your spouse on joint returns.
      </Callout>

      <Accordion icon={DollarSign} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="Combat Zone Tax Exclusion (CZTE)" desc="Tax-free pay in designated combat zones" >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-3 text-sm">Enlisted Members</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />ALL military pay is tax-free in combat zone</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Includes base pay, bonuses, and special pays</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Applies to months with at least one day in zone</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Hostile fire / imminent danger pay always excluded</li>
            </ul>
          </div>
          <Card className="p-4">
            <h4 className="font-bold text-foreground mb-3 text-sm">Officers</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Tax-free up to the highest enlisted rate plus hostile fire pay</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Amount above threshold is taxable</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Same {"'"}one day{"'"} rule applies for monthly exclusion</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Check current year{"'"}s enlisted max rate</li>
            </ul>
          </Card>
        </div>
        <div className="mt-4">
          <HighlightBox variant="blue" title="Additional Tax Benefits for Deployed Members">
            <ul className="space-y-1.5">
              <li><strong>TSP contributions:</strong> Combat zone pay contributed to Roth TSP is tax-free going in AND coming out — double tax benefit</li>
              <li><strong>Earned Income Tax Credit:</strong> You can elect to include or exclude combat pay for EITC — calculate both ways to maximize refund</li>
              <li><strong>State taxes:</strong> Most states exempt combat zone pay; check your state of legal residence</li>
              <li><strong>Deadline extensions:</strong> Automatic extension of 180+ days after leaving combat zone</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={FileText} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="Military-Specific Tax Benefits" desc="SDP, moving expenses, and other deductions">
        <div className="divide-y divide-border dark:divide-slate-500">
          {[
            ["Savings Deposit Program (SDP):", "While deployed, deposit up to $10,000 earning 10% annual interest. Interest earned is taxable but the guaranteed return is exceptional."],
            ["Moving Expenses:", "PCS moving expenses paid by the military are not included in taxable income. Unreimbursed PCS expenses may be deductible."],
            ["Legal Residence (Domicile):", "Under the SCRA, you can maintain legal residence in one state regardless of where you're stationed. This affects state income tax."],
            ["MSRRA:", "Military spouses can maintain the same state of legal residence as the service member for tax purposes."],
            ["BAH & BAS:", "Basic Allowance for Housing and Basic Allowance for Subsistence are never taxable income."],
            ["Uniform Deduction:", "Unreimbursed costs for uniforms and maintenance may be deductible if you itemize."],
          ].map(([label, desc]) => (
            <p key={label} className="text-sm text-muted-foreground py-3 leading-relaxed"><strong className="text-foreground">{label}</strong> {desc}</p>
          ))}
        </div>
      </Accordion>

      <Accordion icon={FileCheck} iconBg="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" title="Free Tax Preparation Services" desc="Where to get your taxes done for free">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">On-Installation Tax Centers</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Free for active duty, retirees, and dependents</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Available January through April</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />IRS-certified volunteer preparers</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Federal and state returns</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />Electronic filing available</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Other Free Options</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" /><strong className="text-foreground">MilTax:</strong> Free software through Military OneSource</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" /><strong className="text-foreground">IRS Free File:</strong> Free for qualifying income levels</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" /><strong className="text-foreground">VITA:</strong> IRS Volunteer Income Tax Assistance</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" /><strong className="text-foreground">TCE:</strong> Tax Counseling for the Elderly (retirees)</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" /><strong className="text-foreground">MilTax consultants:</strong> Free phone/chat year-round</li>
            </ul>
          </Card>
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.irs.gov/individuals/military" icon={DollarSign}>IRS Military Tax Info</LinkButton>
        <LinkButton href="https://www.militaryonesource.mil/financial-legal/tax-resource-center/miltax-military-tax-services/" icon={FileCheck} variant="secondary">MilTax Free Filing</LinkButton>
        <LinkButton href="https://www.jag.navy.mil/" icon={Gavel} variant="secondary">JAG Tax Assistance</LinkButton>
      </div>
    </div>
  )
}

function USERRAContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Employment Rights (USERRA)</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Uniformed Services Employment and Reemployment Rights Act (USERRA) protects the civilian employment rights of service members, veterans, and Reserve/Guard members. It ensures you can return to your civilian job after military service with the same seniority, status, and pay.
        </p>
      </div>

      <Callout variant="success" icon={Shield}>
        <strong>USERRA applies broadly:</strong> It covers virtually all employers regardless of size, including federal, state, and local governments, and private employers. There is no minimum employee count required.
      </Callout>

      <Accordion icon={Briefcase} iconBg="bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400" title="Your USERRA Rights" desc="Job protections during and after military service" >
        <div className="divide-y divide-border dark:divide-slate-500">
          {[
            ["Reemployment Rights:", "After service of up to 5 years (cumulative), you have the right to return to your civilian job with the same seniority, pay, and benefits as if you had never left."],
            ["Anti-Discrimination:", "Employers cannot deny employment, reemployment, promotion, or any benefit based on past, current, or future military service."],
            ["Health Insurance:", "Continue employer health insurance for up to 24 months during service (up to 102% of full premium). Upon return, coverage reinstated immediately with no waiting period or pre-existing condition exclusions."],
            ["Pension/Retirement:", "Military service counts as continuous employment for pension vesting and benefit accrual. Employer must make up any missed contributions upon reemployment."],
            ["Protection from Discharge:", "After reemployment, cannot be fired without cause for one year (service 181+ days) or six months (service 31-180 days)."],
            ["Prompt Reemployment:", "Employer must reemploy you promptly — generally within two weeks of your application."],
          ].map(([label, desc]) => (
            <p key={label} className="text-sm text-muted-foreground py-3 leading-relaxed"><strong className="text-foreground">{label}</strong> {desc}</p>
          ))}
        </div>
      </Accordion>

      <Accordion icon={FileCheck} iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="How to Reapply for Your Job" desc="Timelines and requirements for reemployment">
        <div className="space-y-3">
          <StepItem num={1} title="Provide advance notice" desc="Before leaving, give your employer written or verbal notice of upcoming military service. No specific form is required. Orders only if requested." />
          <StepItem num={2} title="Know your reporting deadlines" desc="Service 1-30 days: report by next scheduled workday (plus 8-hour rest/travel). Service 31-180 days: apply within 14 days. Service 181+ days: apply within 90 days." />
          <StepItem num={3} title="Submit your application" desc="Apply for reemployment in writing. Include DD-214 or orders if available, though the employer cannot delay reemployment pending documentation." />
          <StepItem num={4} title="Know your escalation path" desc="If refused: contact ESGR for free mediation. If mediation fails, file with DOL VETS. As a last resort, DOJ can file a lawsuit on your behalf." />
        </div>
      </Accordion>

      <Accordion icon={AlertTriangle} iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" title="Filing a USERRA Complaint" desc="What to do if your employer violates your rights">
        <HighlightBox variant="red" title="Where to Get Help">
          <ul className="space-y-1.5">
            <li><strong>ESGR:</strong> Free mediation between you and your employer — 1-800-336-4590</li>
            <li><strong>DOL VETS:</strong> File at dol.gov/agencies/vets/programs/userra</li>
            <li><strong>DOJ:</strong> Can represent you in federal court for federal employer violations</li>
            <li><strong>Private Attorney:</strong> USERRA allows recovery of lost wages, benefits, and attorney{"'"}s fees</li>
            <li><strong>Your JAG Office:</strong> Can provide initial advice and draft correspondence</li>
          </ul>
        </HighlightBox>
        <div className="mt-4">
          <HighlightBox variant="blue" title="No Statute of Limitations">
            <p>There is no time limit for filing a USERRA complaint. However, the sooner you act, the stronger your case and the easier it is to recover lost wages and benefits.</p>
          </HighlightBox>
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.esgr.mil/" icon={Briefcase}>ESGR — Employer Support</LinkButton>
        <LinkButton href="https://www.dol.gov/agencies/vets/programs/userra" icon={FileText} variant="secondary">DOL USERRA Info</LinkButton>
      </div>
    </div>
  )
}

function ConsumerContent() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Consumer Protection</h2>
        <p className="text-muted-foreground leading-relaxed">
          Service members face unique consumer protection challenges — from predatory lending near military installations to identity theft while deployed. Federal laws including the Military Lending Act (MLA) and the SCRA provide specific protections beyond what civilian consumers receive.
        </p>
      </div>

      <Callout variant="danger" icon={AlertTriangle}>
        <strong>Watch out for predatory lenders:</strong> High-interest lenders, payday loan shops, and {"'"}military discount{"'"} scams often cluster near installations. The Military Lending Act caps interest at 36% MAPR, but you need to know your rights to enforce them.
      </Callout>

      <Accordion icon={Lock} iconBg="bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400" title="Military Lending Act (MLA)" desc="Interest rate caps and protections for consumer credit" >
        <div className="divide-y divide-border dark:divide-slate-500">
          {[
            ["36% MAPR Cap:", "The Military Annual Percentage Rate on most consumer credit cannot exceed 36%. This includes all fees, charges, and add-on products, not just the stated interest rate."],
            ["Covered Products:", "Payday loans, vehicle title loans, refund anticipation loans, consumer installment loans, unsecured open-end lines of credit, and credit cards (with some exceptions)."],
            ["Banned Practices:", "Lenders cannot require you to waive SCRA protections, submit to mandatory arbitration, use a vehicle title as security, use a military allotment as a payment mechanism, or charge prepayment penalties."],
            ["Right to Rescind:", "If a lender violates the MLA, the loan may be void from inception. You may be entitled to return of all fees and charges paid."],
          ].map(([label, desc]) => (
            <p key={label} className="text-sm text-muted-foreground py-3 leading-relaxed"><strong className="text-foreground">{label}</strong> {desc}</p>
          ))}
        </div>
      </Accordion>

      <Accordion icon={Shield} iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="Identity Theft Protection" desc="Free credit monitoring and fraud protection while deployed">
        <div className="divide-y divide-border dark:divide-slate-500">
          {[
            ["Active Duty Alert:", "Free alert on your credit report requiring creditors to verify identity before issuing credit. Lasts one year, renewable."],
            ["Free Credit Reports:", "All service members entitled to free reports from annualcreditreport.com. Deployed members can request additional free reports."],
            ["Credit Freeze:", "Free credit freeze with all three bureaus, preventing new accounts from being opened in your name."],
            ["SCRA Protections:", "Additional protections against liens, garnishments, and adverse credit reporting during service."],
            ["IRS Identity Protection PIN:", "Request an IP PIN to prevent fraudulent tax returns from being filed in your name."],
          ].map(([label, desc]) => (
            <p key={label} className="text-sm text-muted-foreground py-3 leading-relaxed"><strong className="text-foreground">{label}</strong> {desc}</p>
          ))}
        </div>
        <div className="mt-4">
          <HighlightBox variant="green" title="Before You Deploy: Credit Protection Checklist">
            <ul className="space-y-1">
              <li>Place an active duty alert on your credit reports</li>
              <li>Set up credit monitoring (free through many military banks)</li>
              <li>Review all three credit reports for accuracy</li>
              <li>Request an IRS Identity Protection PIN</li>
              <li>Consider a credit freeze if you won{"'"}t need new credit while deployed</li>
              <li>Notify your bank and credit card companies of your deployment</li>
            </ul>
          </HighlightBox>
        </div>
      </Accordion>

      <Accordion icon={AlertTriangle} iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" title="Common Scams Targeting Military" desc="What to watch for and how to report">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Common Scams</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Payday loans with hidden fees exceeding MLA limits</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />VA loan and benefits scams</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Fake military discount programs</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Romance scams using fake military identities</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Phishing emails impersonating military orgs</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />Predatory car dealers near bases</li>
            </ul>
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Where to Report</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-foreground">FTC:</strong> reportfraud.ftc.gov</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-foreground">CFPB:</strong> consumerfinance.gov/complaint</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-foreground">JAG:</strong> Your installation legal office</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-foreground">Military OneSource:</strong> 800-342-9647</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-foreground">State AG:</strong> Consumer protection division</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-foreground">BBB Military Line:</strong> bbb.org/military</li>
            </ul>
          </Card>
        </div>
      </Accordion>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <LinkButton href="https://www.consumerfinance.gov/consumer-tools/military-financial-readiness/" icon={Shield}>CFPB Military Resources</LinkButton>
        <LinkButton href="https://www.militaryonesource.mil/financial-legal/" icon={Building2} variant="secondary">Military OneSource Financial</LinkButton>
      </div>
    </div>
  )
}

// ─── Content Map ─────────────────────────────────────────────────────────────

const contentMap: Record<string, React.FC> = {
  home: HomeContent,
  poa: POAContent,
  estate: EstateContent,
  medical: MedicalContent,
  scra: SCRAContent,
  family: FamilyContent,
  civil: CivilContent,
  tax: TaxContent,
  userra: USERRAContent,
  consumer: ConsumerContent,
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LegalPage() {
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
                <a onClick={() => setActiveCategory("home")} className="hover:text-primary transition-colors cursor-pointer">Legal</a>
                <ChevronRight className="h-4 w-4" />
                <a className="text-foreground font-medium">
                  {pageLabel}
                </a>
              </div>
              : <span className="text-foreground font-medium">Legal</span>
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
              Legal Services
            </h2>
            <div className="space-y-3">
              <a key={"legal-hub"} href={`/services/command-center/legal`} className="block">
                <Card
                  key={"legal-hub"}
                  className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                      <Gavel className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        Milify Legal Hub
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