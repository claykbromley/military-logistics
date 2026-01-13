"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, Heart, MessageSquare } from "lucide-react"

interface DashboardTabsProps {
  activeTab: "listings" | "saved" | "messages"
}

export function DashboardTabs({ activeTab }: DashboardTabsProps) {
  const pathname = usePathname()

  const tabs = [
    {
      id: "listings",
      label: "My Listings",
      href: "/dashboard",
      icon: Package,
    },
    {
      id: "saved",
      label: "Saved Items",
      href: "/dashboard/saved",
      icon: Heart,
    },
    {
      id: "messages",
      label: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
  ]

  return (
    <div className="flex border-b">
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
  )
}
