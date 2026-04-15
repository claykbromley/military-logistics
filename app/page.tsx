"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      console.log("Session refreshed", data.session)
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
