import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/military-flag-waving-against-sky-silhouette.jpg"
          alt="Military background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-800/85 to-slate-800/80" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance">
            Manage Your Life Like a Warrior
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 text-pretty leading-relaxed">
            Milify provides comprehensive resources, tools, and support for service members at every stage of their career.
            Access everything you need in one centralized platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gap-2 bg-navy-600 hover:bg-navy-700 text-white">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/50">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
