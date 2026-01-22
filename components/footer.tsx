export function Footer() {
  return (
    <footer className="bg-primary py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-2xl font-bold text-primary-foreground/70">
            Milify
          </div>
          <p className="text-sm text-primary-foreground/70 max-w-md">
            © {new Date().getFullYear()} Milify. Supporting our service members and their families. This resource is provided 
            for informational purposes. All information is subject to change. Always consult with your command for official guidance.
          </p>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              Not an official Department of Defense website. For official resources, visit{" "}
              <a
                href="https://www.defense.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-primary-foreground underline"
              >
                defense.gov
              </a>
            </p>
            <div className="flex items-center gap-4 text-sm text-primary-foreground/60">
              <a href="#" className="hover:text-primary-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
