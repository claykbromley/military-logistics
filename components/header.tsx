"use client"

import { useState } from "react"
import { Menu, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LoginModal } from "../app/auth/login-modal"
import { SignupModal } from "../app/auth/signup-modal"
import { SearchModal } from "./search-modal"

const branches = [
  { name: "Army", url: "https://www.goarmy.com" },
  { name: "Navy", url: "https://www.navy.com" },
  { name: "Marine Corps", url: "https://www.marines.com" },
  { name: "Air Force", url: "https://www.airforce.com" },
  { name: "Space Force", url: "https://www.spaceforce.com" },
  { name: "Coast Guard", url: "https://www.gocoastguard.com" },
]

const navItems = [
  {
    name: "Services",
    items: ["Automotive", "Employment", "Financial", "Legal", "Medical"],
  },
  {
    name: "Transitions",
    items: ["Enlistment", "Deployment", "PCS", "Leaving the Military"],
  },
  {
    name: "Discounts/Benefits",
    items: ["Retail Discounts", "Travel Deals", "Insurance", "Education Benefits", "Healthcare"],
  },
  {
    name: "Scheduler",
    items: ["Appointments", "Tasks", "Reminders", "Calendar"],
  },
  {
    name: "Community",
    items: ["Marketplace", "Forum"],
  },
  {
    name: "Contact Us",
    items: ["Support", "Feedback", "Report Issue", "FAQs"],
  },
]

const getItemUrl = (sectionName: string, itemName: string) => {
  const section = sectionName.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-")
  const item = itemName.toLowerCase().replace(/\s+/g, "-")
  return `/${section}/${item}`
}

export function Header() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle menu">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader className="border-b pb-4">
                    <SheetTitle className="text-2xl font-bold text-primary">
                      <a href="/" className="flex items-center">
                        <span>Milify</span>
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6">
                    <div className="flex flex-col gap-2">
                      {navItems.map((section) => (
                        <div key={section.name} className="border-b pb-2">
                          <button
                            onClick={() => setExpandedSection(expandedSection === section.name ? null : section.name)}
                            className="flex items-center justify-between w-full py-2 px-2 text-left font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                          >
                            <span>{section.name}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expandedSection === section.name ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {expandedSection === section.name && (
                            <div className="flex flex-col gap-1 mt-2 ml-4">
                              {section.items.map((item) => (
                                <a
                                  key={item}
                                  href={getItemUrl(section.name, item)}
                                  className="text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                                  onClick={() => setShowMobileMenu(false)}
                                >
                                  {item}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <span className="text-sm">Find a branch</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {branches.map((branch) => (
                    <DropdownMenuItem key={branch.name} asChild>
                      <a href={branch.url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        {branch.name}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2">
              <a href="/" className="flex items-center">
                <span className="text-3xl md:text-4xl font-bold text-primary">Milify</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={() => setShowLogin(true)}>
                Login
              </Button>
              <Button variant="default" size="sm" onClick={() => setShowSignup(true)}>
                Sign Up
              </Button>
            </div>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-6 py-3 border-t">
            {navItems.map((section) => (
              <div key={section.name} className="relative group">
                <a
                  href={`#${section.name.toLowerCase().replace(/\//g, "-")}`}
                  className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors py-2"
                >
                  {section.name}
                  <ChevronDown className="h-3 w-3" />
                </a>
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block w-56 bg-background border rounded-md shadow-lg py-2 z-50">
                  {section.items.map((item) => (
                    <a
                      key={item}
                      href={getItemUrl(section.name, item)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-white transition-colors"
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

      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
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
