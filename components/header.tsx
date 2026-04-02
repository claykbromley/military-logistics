"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Menu, Search, ChevronDown, Moon, Sun, Bell, User, Settings, LogOut, Shield, Bookmark, HelpCircle,
  ArrowRight, Clock, Calendar, MessageSquare, CreditCard, Briefcase, MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { LoginModal } from "../app/auth/login-modal"
import { SignupModal } from "../app/auth/signup-modal"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useUI } from "@/context/ui-context"

type User = {
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
} | null

// ─── Data ────────────────────────────────────────────────────────────────────

const branches = [
  { name: "Army", url: "https://www.goarmy.com", abbr: "USA" },
  { name: "Navy", url: "https://www.navy.com", abbr: "USN" },
  { name: "Marine Corps", url: "https://www.marines.com", abbr: "USMC" },
  { name: "Air Force", url: "https://www.airforce.com", abbr: "USAF" },
  { name: "Space Force", url: "https://www.spaceforce.com", abbr: "USSF" },
  { name: "Coast Guard", url: "https://www.gocoastguard.com", abbr: "USCG" },
]

const navItems = [
  {
    name: "Services",
    icon: Briefcase,
    items: [
      "Command Center",
      "Automotive",
      "Employment",
      "Financial",
      "Legal",
      "Medical",
    ],
  },
  {
    name: "Transitions",
    icon: ArrowRight,
    items: ["Enlistment", "Deployment", "PCS", "Retirement/Separation", "Changing Dependents"],
  },
  {
    name: "Discounts/Benefits",
    icon: CreditCard,
    items: [
      "Retail Discounts",
      "Travel Deals",
      "Insurance",
      "Education Benefits",
      "Healthcare",
    ],
  },
  {
    name: "Scheduler",
    icon: Calendar,
    items: ["Calendar", "Appointments", "Tasks", "Reminders"],
  },
  {
    name: "Community",
    icon: MessageSquare,
    items: ["Marketplace", "Forum"],
  },
  {
    name: "Contact Us",
    icon: HelpCircle,
    items: ["Support", "Feedback", "Report Issue", "FAQs"],
  },
]

// Searchable index for the command palette
const searchableItems = [
  ...navItems.flatMap((section) =>
    section.items.map((item) => ({
      label: item,
      section: section.name,
      icon: section.icon,
      url: getItemUrl(section.name, item),
    }))
  ),
  { label: "My Profile", section: "Account", icon: User, url: "/profile" },
  {
    label: "Settings",
    section: "Account",
    icon: Settings,
    url: "/settings",
  },
  {
    label: "Saved Items",
    section: "Account",
    icon: Bookmark,
    url: "/saved",
  },
  {
    label: "Notifications",
    section: "Account",
    icon: Bell,
    url: "/notifications",
  },
]

function getItemUrl(sectionName: string, itemName: string) {
  const section = sectionName
    .toLowerCase()
    .replace(/\//g, "-")
    .replace(/\s+/g, "-")
  const item = itemName
    .toLowerCase()
    .replace(/\//g, "-")
    .replace(/\s+/g, "-")
  return `/${section}/${item}`
}

// ─── Command Palette / Search ────────────────────────────────────────────────

function CommandPalette({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate: (url: string) => void
}) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const recentSearches = [
    "Deployment Checklist",
    "Military Discounts",
    "Schedule Appointment",
    "Benefits Guide",
  ]

  const filtered = query.trim()
    ? searchableItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.section.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const grouped = filtered.reduce(
    (acc, item) => {
      if (!acc[item.section]) acc[item.section] = []
      acc[item.section].push(item)
      return acc
    },
    {} as Record<string, typeof filtered>
  )

  const flatResults = Object.values(grouped).flat()

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && flatResults[selectedIndex]) {
      e.preventDefault()
      onNavigate(flatResults[selectedIndex].url)
      onClose()
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Palette */}
      <div className="relative flex items-start justify-center pt-[15vh]">
        <div
          className="w-full max-w-xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search services, benefits, pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 py-4 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded border border-border">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {query.trim() === "" ? (
              <div className="p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Recent & Popular
                </p>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {term}
                  </button>
                ))}
              </div>
            ) : flatResults.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              Object.entries(grouped).map(([section, items]) => (
                <div key={section} className="mb-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-1.5">
                    {section}
                  </p>
                  {items.map((item) => {
                    const globalIdx = flatResults.indexOf(item)
                    const Icon = item.icon
                    return (
                      <button
                        key={item.url}
                        onClick={() => {
                          onNavigate(item.url)
                          onClose()
                        }}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                          globalIdx === selectedIndex
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ArrowRight className="h-3 w-3 opacity-50" />
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-xs text-muted-foreground bg-muted/30">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">
                ↵
              </kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">
                esc
              </kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Dark Mode Hook ──────────────────────────────────────────────────────────

function useDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("milify-theme")
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
    const dark = stored ? stored === "dark" : prefersDark
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
  }, [])

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem("milify-theme", next ? "dark" : "light")
      return next
    })
  }, [])

  return { isDark, toggle }
}

// ─── Header Component ────────────────────────────────────────────────────────

export function Header() {
  const [user, setUser] = useState<User>(null)
  const { showLogin, setShowLogin } = useUI()
  const [showSignup, setShowSignup] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { isDark, toggle: toggleDark } = useDarkMode()
  const router = useRouter()

  // Track scroll for condensed header style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Global keyboard shortcut: Cmd/Ctrl + K opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowSearch((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // Auth listener
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  const handleNavigate = (url: string) => {
    router.push(url)
  }

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-background border-b border-border"
        }`}
      >
        <div className="container mx-auto px-4">
          {/* ── Primary Bar ─────────────────────────────────────────── */}
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Left: Mobile menu + Branch selector */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Mobile hamburger */}
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>
                      <a href="/" className="text-xl font-bold text-primary">
                        Milify
                      </a>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Mobile user section */}
                  {user && (
                    <div className="p-4 border-b bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <nav className="p-2">
                    {/* Search shortcut in mobile */}
                    <button
                      onClick={() => {
                        setShowMobileMenu(false)
                        setTimeout(() => setShowSearch(true), 200)
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 mb-1 text-sm text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span>Search</span>
                    </button>

                    {/* Nav sections */}
                    {navItems.map((section) => {
                      const Icon = section.icon
                      return (
                        <div key={section.name}>
                          <button
                            onClick={() =>
                              setExpandedSection(
                                expandedSection === section.name
                                  ? null
                                  : section.name
                              )
                            }
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1 text-left">
                              {section.name}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                expandedSection === section.name
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                          {expandedSection === section.name && (
                            <div className="ml-10 flex flex-col gap-0.5 mb-1">
                              {section.items.map((item) => (
                                <a
                                  key={item}
                                  href={getItemUrl(section.name, item)}
                                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                                  onClick={() => setShowMobileMenu(false)}
                                >
                                  {item}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Mobile dark mode + settings */}
                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={toggleDark}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                      >
                        {isDark ? (
                          <Sun className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                      </button>
                      {user && (
                        <>
                          <a
                            href="/profile"
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>My Profile</span>
                          </a>
                          <a
                            href="/settings"
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span>Settings</span>
                          </a>
                          <button
                            onClick={() => {
                              handleSignOut()
                              setShowMobileMenu(false)
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <a href="/" className="flex items-center gap-1.5">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold tracking-tight text-primary">
                  Milify
                </span>
              </a>

              {/* Branch selector (desktop) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <MapPin className="h-3 w-3" />
                    Branch
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Official Branch Sites
                  </DropdownMenuLabel>
                  {branches.map((branch) => (
                    <DropdownMenuItem key={branch.name} asChild>
                      <a
                        href={branch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                      >
                        {branch.name}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Center: Desktop search bar trigger */}
            <button
              onClick={() => setShowSearch(true)}
              className="hidden md:flex items-center gap-2 h-9 w-full max-w-sm px-3 bg-muted/50 hover:bg-muted border border-border rounded-lg text-sm text-muted-foreground transition-colors cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-background border border-border rounded">
                ⌘-K or Ctrl-K
              </kbd>
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {/* Mobile search */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDark}
                aria-label="Toggle dark mode"
                className="hidden sm:flex cursor-pointer"
              >
                {isDark ? (
                  <Sun className="h-[1.15rem] w-[1.15rem]" />
                ) : (
                  <Moon className="h-[1.15rem] w-[1.15rem]" />
                )}
              </Button>

              {user ? (
                <>
                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative cursor-pointer"
                        aria-label="Notifications"
                      >
                        <Bell className="h-[1.15rem] w-[1.15rem]" />
                        {/* Notification dot */}
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Notifications</span>
                        <a
                          href="/notifications"
                          className="text-xs text-primary font-normal hover:underline"
                        >
                          View all
                        </a>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>No new notifications</p>
                        <p className="text-xs mt-1">
                          We&apos;ll notify you about important updates
                        </p>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Saved/Bookmarks */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex cursor-pointer"
                    aria-label="Saved items"
                    onClick={() => router.push("/saved")}
                  >
                    <Bookmark className="h-[1.15rem] w-[1.15rem]" />
                  </Button>

                  {/* User menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="relative h-8 w-8 rounded-full ml-1 cursor-pointer"
                      >
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
                          {initials}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">{displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push("/profile")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push("/saved")}
                        >
                          <Bookmark className="mr-2 h-4 w-4" />
                          Saved Items
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push("/settings")}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => router.push("/contact-us/support")}
                      >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-white"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-1.5 ml-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLogin(true)}
                  >
                    Log in
                  </Button>
                  <Button size="sm" onClick={() => setShowSignup(true)}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── Desktop Nav Bar ─────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 pt-1.5 border-t border-border -mx-1">
            {navItems.map((section) => (
              <div key={section.name} className="relative group">
                <button className="flex items-center gap-1 mb-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-accent-foreground hover:bg-accent rounded-md transition-colors cursor-pointer">
                  {section.name}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block w-52 bg-background border border-border rounded-lg shadow-xl py-1.5 z-50">
                  {section.items.map((item) => (
                    <a
                      key={item}
                      href={getItemUrl(section.name, item)}
                      className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md mx-1.5 transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <CommandPalette
        open={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigate={handleNavigate}
      />
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignup={() => {
          setShowLogin(false)
          setShowSignup(true)
        }}
      />
      <SignupModal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => {
          setShowSignup(false)
          setShowLogin(true)
        }}
      />
    </>
  )
}