import React from "react"
import { ExternalLink } from "lucide-react"

interface ResourceCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  category: string
}

export function ResourceCard({ title, description, href, icon, category }: ResourceCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-card border border-border rounded-lg p-5 hover:border-accent/50 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
            {icon}
          </div>
          <div>
            <span className="text-xs font-medium text-accent uppercase tracking-wide">
              {category}
            </span>
            <h3 className="font-semibold text-foreground mt-1 group-hover:text-accent transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
      </div>
    </a>
  )
}
