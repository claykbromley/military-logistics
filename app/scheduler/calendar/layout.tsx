import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { UIProvider } from "@/context/ui-context"

//import '../../../styles/globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Milify Calendar - Military Members Calendar',
  description: 'A full-featured calendar for military members with federal holidays, event management, and scheduling tools.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <UIProvider>{children}</UIProvider>
      </body>
    </html>
  )
}
