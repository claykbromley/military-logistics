import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'
import { ChevronRight, type LucideIcon } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon?: LucideIcon
  description?: string
}

interface SectionLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  icon: LucideIcon
  navItems: NavItem[]
  currentPath: string
  accentColor?: string
}

export function SectionLayout({
  children,
  title,
  description,
  icon: Icon,
  navItems,
  currentPath,
}: SectionLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        {/* Section Header */}
        <div className="border-b border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
                <p className="mt-1 text-muted-foreground">{description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full shrink-0 lg:w-64">
              <nav className="sticky top-24 space-y-1">
                {navItems.map((item) => {
                  const isActive = currentPath === item.href
                  const ItemIcon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {ItemIcon && <ItemIcon className="h-4 w-4" />}
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </Link>
                  )
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
