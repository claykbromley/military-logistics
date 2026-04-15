import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { UIProvider } from "@/context/ui-context"
import { AuthProvider } from "@/context/auth-context"

export const metadata: Metadata = {
  title: "Milify - Logistics Management Resources for Service Members",
  description: "Comprehensive logistics management services and resources for military service members",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

// Inline script that runs before React hydrates to prevent flash of wrong theme.
// Reads from localStorage first, falls back to system preference.
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('milify-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          <UIProvider>
            {children}
          </UIProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}