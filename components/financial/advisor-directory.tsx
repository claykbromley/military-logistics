"use client"

import { useState, useEffect, useRef } from "react"
import {
  Users, Search, Phone, Mail, Globe, Shield,
  MapPin, Filter, ChevronDown, ChevronUp, Video, HandHelping,
  X, Check, DollarSign, BookOpen, Info, AlertCircle, Loader2,
  ExternalLink
} from "lucide-react"
import { useAdvisors, fetchDistinctStates, fetchDistinctSpecialties, fetchDistinctBranches } from "@/hooks/use-financial-manager"
import { Advisor } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// ─── CONSTANTS ───────────────────────────────────────────────
const FEE_TYPES = ["Fee-Only", "Fee-Based", "Free / Non-Profit"]

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviewed" },
  { value: "name", label: "Name A–Z" },
] as const

const RESOURCES = [
  {
    name: "Military OneSource",
    desc: "Free financial counseling for active duty, Guard, Reserve & families",
    url: "https://www.militaryonesource.mil/financial-legal/financial-planners-consultants/",
    category: "counseling",
  },
  {
    name: "FINRA BrokerCheck",
    desc: "Verify any advisor's registration, background & disciplinary history",
    url: "https://brokercheck.finra.org/",
    category: "verification",
  },
  {
    name: "CFP Board — Find a CFP®",
    desc: "Search Certified Financial Planners with military specialization",
    url: "https://www.letsmakeaplan.org/",
    category: "search",
  },
  {
    name: "AFCPE — Find an AFC®",
    desc: "Accredited Financial Counselors, many working on installations",
    url: "https://www.afcpe.org/find-an-afc/",
    category: "search",
  },
  {
    name: "NAPFA",
    desc: "Fee-only fiduciary advisors — filter by military experience",
    url: "https://www.napfa.org/find-an-advisor",
    category: "search",
  },
  {
    name: "VA.gov Financial Resources",
    desc: "Official VA benefits, compensation calculators & claims guidance",
    url: "https://www.va.gov/",
    category: "benefits",
  },
]

const BRANCH_COLORS: Record<string, string> = {
  Army: "#4a6741",
  Navy: "#1a3a5c",
  "Air Force": "#3a5a8c",
  Marines: "#8b2500",
  "Coast Guard": "#d4721a",
  "Space Force": "#1a1a3a",
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill =
          i < Math.floor(rating) ? 1 : i === Math.floor(rating) ? rating - Math.floor(rating) : 0
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" className="shrink-0">
            <defs>
              <clipPath id={`sc-${i}-${rating}`}>
                <rect x="0" y="0" width={24 * fill} height="24" />
              </clipPath>
            </defs>
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill="none"
              stroke="var(--chart-2, #c8a820)"
              strokeWidth="1.5"
            />
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill="var(--chart-2, #c8a820)"
              clipPath={`url(#sc-${i}-${rating})`}
            />
          </svg>
        )
      })}
    </span>
  )
}

function FilterDropdown({
  value,
  onChange,
  options,
  placeholder,
  icon,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative min-w-[140px]">
      <button
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center gap-2 px-3 py-2.5 bg-card border rounded-lg text-sm
          cursor-pointer transition-colors
          ${open ? "border-accent ring-1 ring-accent/20" : "border-border hover:border-muted-foreground/40"}
        `}
      >
        {icon}
        <span className="flex-1 text-left truncate text-foreground/70">
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto p-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`
                w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between
                transition-colors cursor-pointer
                ${
                  value === opt.value
                    ? "bg-accent/10 font-semibold text-accent"
                    : "hover:bg-muted text-foreground/70"
                }
              `}
            >
              {opt.label}
              {value === opt.value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AdvisorCard({
  advisor,
  isExpanded,
  onToggle,
}: {
  advisor: Advisor
  isExpanded: boolean
  onToggle: () => void
}) {
  const initials = advisor.name
    .split(" ")
    .filter((w) => w[0] && w[0] === w[0].toUpperCase() && !/[(\u00AE)]/.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")

  const avatarBg = advisor.military_experience
    ? BRANCH_COLORS[advisor.branch || ""] || "oklch(0.35 0.08 250)"
    : "oklch(0.42 0.05 230)"

  return (
    <div
      className={`
        rounded-xl border overflow-hidden bg-primary/20 transition-all duration-200
        ${isExpanded ? "shadow-md border-border" : "shadow-sm border-border hover:border-muted-foreground/30"}
      `}
    >
      {/* Header (always visible) */}
      <button onClick={onToggle} className="w-full p-5 text-left flex gap-4 items-start cursor-pointer">
        <div
          className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm tracking-wide"
          style={{ background: avatarBg }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="font-bold text-card-foreground text-[15px]">{advisor.name}</h3>
            {advisor.military_experience && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20">
                <Shield className="w-3 h-3" /> {advisor.branch} Veteran
              </span>
            )}
            {advisor.fee_structure === "Free / Non-Profit" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20">
                Free Services
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">{advisor.credentials}</p>
          <p className="text-sm text-foreground/60">{advisor.firm}</p>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <StarRating rating={advisor.rating} />
              <span className="text-sm font-bold text-card-foreground ml-1">{advisor.rating}</span>
              <span className="text-xs text-muted-foreground">({advisor.review_count})</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-foreground/60">
              <MapPin className="w-3 h-3" /> {advisor.location}
            </span>
            {advisor.virtual_available && (
              <span className="inline-flex items-center gap-1 text-xs text-chart-6">
                <Video className="w-3 h-3" /> Virtual
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 pt-1">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isExpanded ? 500 : 0 }}
      >
        <div className="px-5 pb-5 border-t border-slate-500">
          <p className="text-[13.5px] leading-relaxed text-foreground/70 mt-4 mb-3">{advisor.bio}</p>

          {/* Specialty tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {advisor.specialties.map((s) => (
              <span
                key={s}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground border border-slate-500"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-foreground/70 border border-slate-500">
              <DollarSign className="w-3 h-3" /> {advisor.fee_structure}
            </span>
            {advisor.minimum_assets && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-foreground/70 border border-slate-500">
                Min: {advisor.minimum_assets}
              </span>
            )}
            {advisor.accepts_tricare && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-accent border border-accent/20 bg-accent/20">
                <Check className="w-3 h-3" /> Accepts TRICARE referrals
              </span>
            )}
            {advisor.languages.length > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-foreground/70 border border-slate-500">
                {advisor.languages.join(", ")}
              </span>
            )}
          </div>

          {/* Contact buttons */}
          <div className="flex flex-wrap gap-2">
            {advisor.phone && (
              <a
                href={`tel:${advisor.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-500 text-sm font-medium text-foreground/80 hover:bg-muted transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> {advisor.phone}
              </a>
            )}
            {advisor.email && (
              <a
                href={`mailto:${advisor.email}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-500 text-sm font-medium text-foreground/80 hover:bg-muted transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
            )}
            {advisor.website && (
              <a
                href={advisor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-500 text-sm font-medium text-foreground/80 hover:bg-muted transition-colors"
              >
                <Globe className="w-3.5 h-3.5" /> Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
        transition-all cursor-pointer border
        ${
          active
            ? "bg-accent text-accent-foreground border-accent"
            : "bg-card text-muted-foreground border-border hover:border-muted-foreground/40"
        }
      `}
    >
      {children}
    </button>
  )
}

// ─── RESOURCES DIALOG ────────────────────────────────────────

function ResourcesDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const categories = [
    { key: "counseling", label: "Free Counseling", icon: <Phone className="w-4 h-4" /> },
    { key: "search", label: "Find an Advisor", icon: <Search className="w-4 h-4" /> },
    { key: "verification", label: "Verify Credentials", icon: <Shield className="w-4 h-4" /> },
    { key: "benefits", label: "Benefits & Claims", icon: <BookOpen className="w-4 h-4" /> },
  ]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Free Military Financial Resources"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <HandHelping className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-bold text-card-foreground text-lg leading-tight">
                Free Military Financial Resources
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vetted resources for service members &amp; families
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-foreground/70 leading-relaxed mb-5">
            Before hiring an advisor, take advantage of these free and vetted resources
            available to service members and their families. All links open in a new tab.
          </p>

          {categories.map((cat) => {
            const items = RESOURCES.filter((r) => r.category === cat.key)
            if (items.length === 0) return null
            return (
              <div key={cat.key} className="mb-5 last:mb-0">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-accent">{cat.icon}</span>
                  <h3 className="text-sm font-bold text-card-foreground">{cat.label}</h3>
                </div>
                <div className="grid gap-2">
                  {items.map((r) => (
                    <a
                      key={r.name}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 p-3.5 rounded-xl bg-muted/50 border border-border hover:border-accent/30 hover:bg-accent/5 transition-colors no-underline"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-accent group-hover:underline">
                          {r.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-accent transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Disclaimer */}
          <div className="mt-5 p-3.5 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                These resources are provided for informational purposes. Always verify an
                advisor&apos;s credentials through FINRA BrokerCheck or the CFP Board before
                engaging their services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────

export function AdvisorDirectory() {
  const [search, setSearch] = useState("")
  const [specialty, setSpecialty] = useState("all")
  const [state, setState] = useState("all")
  const [branch, setBranch] = useState("all")
  const [feeType, setFeeType] = useState("all")
  const [militaryOnly, setMilitaryOnly] = useState(false)
  const [virtualOnly, setVirtualOnly] = useState(false)
  const [tricareOnly, setTricareOnly] = useState(false)
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showResources, setShowResources] = useState(false)

  // Dynamic filter options from DB
  const [stateOptions, setStateOptions] = useState<string[]>([])
  const [specialtyOptions, setSpecialtyOptions] = useState<string[]>([])
  const [branchOptions, setBranchOptions] = useState<string[]>([])

  useEffect(() => {
    fetchDistinctStates().then(setStateOptions)
    fetchDistinctSpecialties().then(setSpecialtyOptions)
    fetchDistinctBranches().then(setBranchOptions)
  }, [])

  // Fetch advisors from Supabase
  const {
    data: advisors,
    isLoading,
    error,
  } = useAdvisors({
    search,
    specialty,
    state,
    branch,
    feeType,
    militaryOnly,
    virtualOnly,
    tricareOnly,
    sortBy,
  })

  const activeFilterCount = [
    specialty !== "all",
    state !== "all",
    branch !== "all",
    feeType !== "all",
    militaryOnly,
    virtualOnly,
    tricareOnly,
  ].filter(Boolean).length

  const clearFilters = () => {
    setSpecialty("all")
    setState("all")
    setBranch("all")
    setFeeType("all")
    setMilitaryOnly(false)
    setVirtualOnly(false)
    setTricareOnly(false)
    setSearch("")
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <HandHelping className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Find Your Financial Advisor</CardTitle>
                <CardDescription>
                  Vetted financial planners who understand military pay, benefits, and the unique
                  demands of service life.
                </CardDescription>
              </div>
            </div>

            {/* Resources button — prominently placed in the header */}
            <button
              onClick={() => setShowResources(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent/10 text-accent border border-accent/20 hover:bg-accent/30 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
              Free Resources
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search + Filters */}
          <div className="bg-primary/40 rounded-2xl border border-border p-5 mb-4 shadow-sm">
            {/* Search input */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, firm, specialty, or keyword..."
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
              />
            </div>

            {/* Quick-access toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border
                  ${
                    activeFilterCount > 0
                      ? "bg-accent/10 text-accent border-accent/30"
                      : "bg-card text-muted-foreground border-border hover:border-muted-foreground/40"
                  }
                `}
              >
                <Filter className="w-3.5 h-3.5" /> Filters
                {activeFilterCount > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center leading-none px-1.5 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <ToggleButton active={militaryOnly} onClick={() => setMilitaryOnly(!militaryOnly)}>
                <Shield className="w-3 h-3" /> Veteran Advisors
              </ToggleButton>
              <ToggleButton active={virtualOnly} onClick={() => setVirtualOnly(!virtualOnly)}>
                <Video className="w-3 h-3" /> Virtual Available
              </ToggleButton>
              <ToggleButton active={tricareOnly} onClick={() => setTricareOnly(!tricareOnly)}>
                <Check className="w-3 h-3" /> TRICARE Referrals
              </ToggleButton>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-destructive bg-destructive/20 hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            {/* Expanded filter dropdowns */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-border">
                <FilterDropdown
                  value={specialty}
                  onChange={setSpecialty}
                  icon={<BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  placeholder="Specialty"
                  options={[
                    { value: "all", label: "All Specialties" },
                    ...specialtyOptions.map((s) => ({ value: s, label: s })),
                  ]}
                />
                <FilterDropdown
                  value={state}
                  onChange={setState}
                  icon={<MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  placeholder="State"
                  options={[
                    { value: "all", label: "All States" },
                    ...stateOptions.map((s) => ({ value: s, label: s })),
                  ]}
                />
                <FilterDropdown
                  value={branch}
                  onChange={setBranch}
                  icon={<Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  placeholder="Branch"
                  options={[
                    { value: "all", label: "All Branches" },
                    ...branchOptions.map((b) => ({ value: b, label: b })),
                  ]}
                />
                <FilterDropdown
                  value={feeType}
                  onChange={setFeeType}
                  icon={<DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  placeholder="Fee Type"
                  options={[
                    { value: "all", label: "All Fee Types" },
                    ...FEE_TYPES.map((f) => ({ value: f, label: f })),
                  ]}
                />
              </div>
            )}
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">
              <strong className="text-card-foreground">{advisors.length}</strong>{" "}
              advisor{advisors.length !== 1 ? "s" : ""} found
            </span>
            <FilterDropdown
              value={sortBy}
              onChange={(v) => setSortBy(v as "rating" | "reviews" | "name")}
              placeholder="Sort by"
              options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm font-medium">Loading advisors...</p>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Failed to load advisors</p>
                <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Advisor list */}
          {!isLoading && !error && (
            <div className="flex flex-col gap-3 mb-4">
              {advisors.map((advisor) => (
                <AdvisorCard
                  key={advisor.id}
                  advisor={advisor}
                  isExpanded={expandedId === advisor.id}
                  onToggle={() => setExpandedId(expandedId === advisor.id ? null : advisor.id)}
                />
              ))}

              {advisors.length === 0 && (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-semibold text-card-foreground mb-1">
                    No advisors match your criteria
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try broadening your search or removing some filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources Dialog */}
      <ResourcesDialog open={showResources} onClose={() => setShowResources(false)} />
    </>
  )
}