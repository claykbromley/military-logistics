"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, Heart, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardTabsProps {
  activeTab: "listings" | "saved" | "messages"
}

export function DashboardTabs({ activeTab }: DashboardTabsProps) {
  const pathname = usePathname()

  const tabs = [
    {
      id: "listings",
      label: "My Listings",
      href: "/community/marketplace/dashboard",
      icon: Package,
    },
    {
      id: "saved",
      label: "Saved Items",
      href: "/community/marketplace/dashboard/saved",
      icon: Heart,
    },
    {
      id: "messages",
      label: "Messages",
      href: "/community/marketplace/dashboard/messages",
      icon: MessageSquare,
    },
  ]

  return (
    <div className="flex border-b items-center justify-between w-full">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab || pathname === tab.href
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>
      <div className="flex">
        <Button asChild>
          <Link href="/community/marketplace">Browse Listings</Link>
        </Button>
      </div>
    </div>
  )
}
