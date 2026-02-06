"use client"

import React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

type User = {
  email?: string
} | null

type UIContextType = {
  showLogin: boolean
  setShowLogin: (value: boolean) => void
  user: User
  isLoggedIn: boolean
  signOut: () => Promise<void>
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<User>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <UIContext.Provider value={{ showLogin, setShowLogin, user, isLoggedIn: !!user, signOut }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error("useUI must be used within a UIProvider")
  }
  return context
}
