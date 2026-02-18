import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary py-12 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <a href="/" className="flex items-center gap-1.5">
            <Shield className="h-6 w-6 text-secondary-foreground" />
            <span className="text-xl font-bold tracking-tight text-secondary-foreground">
              Milify
            </span>
          </a>
          <p className="text-sm text-secondary-foreground max-w-md">
            © {new Date().getFullYear()} Milify. Supporting our service members and their families. This resource is provided 
            for informational purposes. All information is subject to change. Always consult with your command for official guidance.
          </p>
        </div>
        <div className="border-t border-secondary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-secondary-foreground/60">
              Not an official Department of Defense website. For official resources, visit{" "}
              <a
                href="https://www.defense.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground/80 hover:text-secondary-foreground underline"
              >
                defense.gov
              </a>
            </p>
            <div className="flex items-center gap-4 text-sm text-secondary-foreground/60">
              <a href="#" className="hover:text-secondary-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-secondary-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-secondary-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
