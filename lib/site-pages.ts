import {
  Briefcase, ArrowRight, CreditCard, Calendar, MessageSquare, HelpCircle,
  User, Settings, Bell, Bookmark, Shield, Car, DollarSign, Scale, Heart,
  FileText, Home, MapPin, GraduationCap, ShoppingBag, Plane, Umbrella,
  CheckSquare, Clock, BarChart3, Users, Tag, Star, Megaphone,
} from "lucide-react"

// ─── Page Registry ───────────────────────────────────────────────────────────
// Every page / feature on the site should be registered here so the command
// palette and search can surface it. Group them by section for UX.

export interface SearchablePage {
  label: string
  description: string
  section: string
  icon: React.ComponentType<{ className?: string }>
  url: string
  keywords: string[] // Extra terms users might search for
}

export const sitePages: SearchablePage[] = [
  // ── Services ─────────────────────────────────────────────────────────
  {
    label: "Command Center",
    description: "Your personalized military dashboard with quick links and status overview",
    section: "Services",
    icon: Shield,
    url: "/services/command-center",
    keywords: ["dashboard", "home", "overview", "hub", "main"],
  },
  {
    label: "Automotive",
    description: "Vehicle registration, inspections, insurance, and lemon law assistance",
    section: "Services",
    icon: Car,
    url: "/services/automotive",
    keywords: ["car", "vehicle", "registration", "dmv", "inspection", "lemon law"],
  },
  {
    label: "Employment",
    description: "Job search, resume help, career counseling, and transition assistance",
    section: "Services",
    icon: Briefcase,
    url: "/services/employment",
    keywords: ["job", "career", "resume", "work", "hiring", "interview", "linkedin"],
  },
  {
    label: "Financial Services",
    description: "Financial planning, tax assistance, TSP management, and debt counseling",
    section: "Services",
    icon: DollarSign,
    url: "/services/financial",
    keywords: ["money", "tax", "tsp", "budget", "savings", "debt", "finance", "pay"],
  },
  {
    label: "Legal Services",
    description: "JAG office, power of attorney, wills, legal assistance, and SCRA protections",
    section: "Services",
    icon: Scale,
    url: "/services/legal",
    keywords: ["jag", "lawyer", "attorney", "will", "poa", "power of attorney", "scra", "law"],
  },
  {
    label: "Medical Services",
    description: "Healthcare, TRICARE, mental health resources, dental, and pharmacy",
    section: "Services",
    icon: Heart,
    url: "/services/medical",
    keywords: ["health", "tricare", "doctor", "hospital", "dental", "pharmacy", "mental health", "ptsd", "va"],
  },

  // ── Transitions ──────────────────────────────────────────────────────
  {
    label: "Enlistment",
    description: "Enlistment resources, MEPS information, and boot camp preparation",
    section: "Transitions",
    icon: ArrowRight,
    url: "/transitions/enlistment",
    keywords: ["enlist", "join", "recruit", "meps", "boot camp", "basic training"],
  },
  {
    label: "Deployment",
    description: "Deployment checklists, family readiness, and pre-deployment preparation",
    section: "Transitions",
    icon: MapPin,
    url: "/transitions/deployment",
    keywords: ["deploy", "overseas", "combat", "family readiness", "checklist"],
  },
  {
    label: "PCS Move",
    description: "Permanent change of station guides, housing, and moving resources",
    section: "Transitions",
    icon: Home,
    url: "/transitions/pcs",
    keywords: ["move", "moving", "housing", "bah", "dity", "ppm", "relocation", "orders"],
  },
  {
    label: "Retirement & Separation",
    description: "Retirement planning, separation checklist, TAP, and veteran benefits",
    section: "Transitions",
    icon: FileText,
    url: "/transitions/retirement-separation",
    keywords: ["retire", "separate", "ets", "tap", "taps", "sfltap", "dd214", "veteran", "discharge"],
  },
  {
    label: "Changing Dependents",
    description: "DEERS enrollment, marriage, birth, divorce, and dependent updates",
    section: "Transitions",
    icon: Users,
    url: "/transitions/changing-dependents",
    keywords: ["deers", "dependent", "spouse", "child", "marriage", "divorce", "birth"],
  },

  // ── Discounts & Benefits ─────────────────────────────────────────────
  {
    label: "Retail Discounts",
    description: "Military discounts at stores, restaurants, and online retailers",
    section: "Discounts/Benefits",
    icon: ShoppingBag,
    url: "/discounts-benefits/retail-discounts",
    keywords: ["discount", "coupon", "deal", "savings", "store", "shopping", "military discount"],
  },
  {
    label: "Travel Deals",
    description: "Military travel discounts, Space-A flights, and vacation packages",
    section: "Discounts/Benefits",
    icon: Plane,
    url: "/discounts-benefits/travel-deals",
    keywords: ["travel", "flight", "hotel", "space-a", "vacation", "leave", "airline"],
  },
  {
    label: "Insurance",
    description: "SGLI, VGLI, USAA, and military-specific insurance options",
    section: "Discounts/Benefits",
    icon: Umbrella,
    url: "/discounts-benefits/insurance",
    keywords: ["sgli", "vgli", "usaa", "insurance", "life insurance", "renters"],
  },
  {
    label: "Education Benefits",
    description: "GI Bill, tuition assistance, scholarships, and education counseling",
    section: "Discounts/Benefits",
    icon: GraduationCap,
    url: "/discounts-benefits/education-benefits",
    keywords: ["gi bill", "tuition", "college", "school", "degree", "scholarship", "education", "ta"],
  },
  {
    label: "Healthcare Benefits",
    description: "TRICARE plans, VA healthcare enrollment, and wellness programs",
    section: "Discounts/Benefits",
    icon: Heart,
    url: "/discounts-benefits/healthcare",
    keywords: ["tricare", "va", "healthcare", "medical", "wellness", "health insurance"],
  },

  // ── Scheduler ────────────────────────────────────────────────────────
  {
    label: "Calendar",
    description: "View and manage your military and personal calendar",
    section: "Scheduler",
    icon: Calendar,
    url: "/scheduler/calendar",
    keywords: ["calendar", "schedule", "date", "event", "plan"],
  },
  {
    label: "Appointments",
    description: "Schedule and manage medical, legal, and service appointments",
    section: "Scheduler",
    icon: Clock,
    url: "/scheduler/appointments",
    keywords: ["appointment", "book", "schedule", "doctor", "meeting"],
  },
  {
    label: "Tasks",
    description: "Track to-do items, checklists, and action items",
    section: "Scheduler",
    icon: CheckSquare,
    url: "/scheduler/tasks",
    keywords: ["task", "todo", "checklist", "action", "to-do"],
  },
  {
    label: "Reminders",
    description: "Set and manage reminders for important deadlines and events",
    section: "Scheduler",
    icon: Bell,
    url: "/scheduler/reminders",
    keywords: ["reminder", "alert", "deadline", "notify"],
  },

  // ── Community ────────────────────────────────────────────────────────
  {
    label: "Marketplace",
    description: "Buy, sell, and trade with other service members",
    section: "Community",
    icon: Tag,
    url: "/community/marketplace",
    keywords: ["buy", "sell", "trade", "marketplace", "classifieds", "pcs sale"],
  },
  {
    label: "Forum",
    description: "Discuss topics, ask questions, and connect with the military community",
    section: "Community",
    icon: MessageSquare,
    url: "/community/forum",
    keywords: ["forum", "discussion", "post", "question", "community", "chat"],
  },

  // ── Contact / Support ────────────────────────────────────────────────
  {
    label: "Support",
    description: "Get help from our support team",
    section: "Contact Us",
    icon: HelpCircle,
    url: "/contact-us/support",
    keywords: ["help", "support", "contact", "assistance"],
  },
  {
    label: "Feedback",
    description: "Share your feedback and suggestions to improve Milify",
    section: "Contact Us",
    icon: Megaphone,
    url: "/contact-us/feedback",
    keywords: ["feedback", "suggestion", "improve", "idea"],
  },
  {
    label: "Report Issue",
    description: "Report a bug or technical issue",
    section: "Contact Us",
    icon: FileText,
    url: "/contact-us/report-issue",
    keywords: ["bug", "issue", "problem", "error", "broken"],
  },
  {
    label: "FAQs",
    description: "Frequently asked questions about Milify and military services",
    section: "Contact Us",
    icon: HelpCircle,
    url: "/contact-us/faqs",
    keywords: ["faq", "question", "help", "how to", "answer"],
  },

  // ── Account ──────────────────────────────────────────────────────────
  {
    label: "My Profile",
    description: "View and edit your military profile, service info, and bio",
    section: "Account",
    icon: User,
    url: "/profile",
    keywords: ["profile", "account", "me", "info", "personal"],
  },
  {
    label: "Settings",
    description: "Account settings, security, privacy, notification preferences, and appearance",
    section: "Account",
    icon: Settings,
    url: "/settings",
    keywords: ["settings", "preferences", "config", "password", "security", "privacy", "theme", "dark mode"],
  },
  {
    label: "Notifications",
    description: "View and manage your notifications",
    section: "Account",
    icon: Bell,
    url: "/notifications",
    keywords: ["notification", "alert", "message", "inbox", "updates"],
  },
  {
    label: "Saved Items",
    description: "View your bookmarked pages, resources, and saved content",
    section: "Account",
    icon: Bookmark,
    url: "/saved",
    keywords: ["saved", "bookmark", "favorite", "starred"],
  },
]

/**
 * Search through all site pages with fuzzy-ish matching.
 * Searches label, description, section, and keywords.
 */
export function searchPages(query: string): SearchablePage[] {
  if (!query.trim()) return []

  const terms = query.toLowerCase().split(/\s+/)

  return sitePages
    .map((page) => {
      const searchable = [
        page.label.toLowerCase(),
        page.description.toLowerCase(),
        page.section.toLowerCase(),
        ...page.keywords.map((k) => k.toLowerCase()),
      ].join(" ")

      // Score: how many query terms match
      const score = terms.reduce((acc, term) => {
        if (searchable.includes(term)) return acc + 1
        // Partial match bonus (prefix)
        if (
          page.label.toLowerCase().startsWith(term) ||
          page.keywords.some((k) => k.toLowerCase().startsWith(term))
        ) {
          return acc + 0.5
        }
        return acc
      }, 0)

      return { page, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ page }) => page)
}