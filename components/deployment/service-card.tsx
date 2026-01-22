import React from "react"
import { Phone, ArrowRight } from "lucide-react"

interface ServiceCardProps {
  title: string
  description: string
  phone?: string
  href?: string
  icon: React.ReactNode
}

export function ServiceCard({ title, description, phone, href, icon }: ServiceCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {phone && (
              <a
                href={`tel:${phone.replace(/[^0-9]/g, "")}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                {phone}
              </a>
            )}
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                Learn more
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
