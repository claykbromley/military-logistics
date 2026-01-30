import { ArrowDown, CheckCircle2 } from "lucide-react"

export function Hero() {
  return (
    <section className="relative py-8 md:py-12 bg-primary overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div>
          <h1 className="text-center text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight text-balance">
            Pre-Deployment Preparation Made Simple
          </h1>
          <p className="text-center mt-6 text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
            Everything you need to prepare for deployment in one place. Interactive checklists, 
            essential resources, and support services to ensure you and your family are ready.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="#checklists"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary font-semibold px-6 py-3 rounded-lg hover:bg-primary-foreground/90 transition-colors"
            >
              Start Your Checklist
              <ArrowDown className="w-4 h-4" />
            </a>
            <a
              href="/services/command-center"
              className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary-foreground/10 transition-colors"
            >
              View Services
            </a>
            <a
              href="/transitions/deployment/resources"
              className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary-foreground/10 transition-colors"
            >
              External Resources
            </a>
            <a
              href="/transitions/deployment/emergency-contacts"
              className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary-foreground/10 transition-colors"
            >
              Emergency Contacts
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
