"use client"

import { Header } from "@/components/header"
import { CalendarApp } from "@/components/calendar/calendar-app"
import { useUI } from "@/context/ui-context"

export default function Page() {
  const { isLoggedIn, setShowLogin } = useUI()

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-hidden">
        <CalendarApp
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setShowLogin(true)}
        />
      </main>
    </div>
  )
}
