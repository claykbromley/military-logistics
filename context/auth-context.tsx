"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

type UserData = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    display_name?: string
    avatar_url?: string
    military_branch?: string
    service_status?: string
    paygrade?: string
    phone?: string
    zip_code?: string
  }
} | null

type AuthState = {
  user: UserData
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let initialLoadDone = false

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as UserData) ?? null)
      if (!initialLoadDone) {
        initialLoadDone = true
        setLoading(false)
      }
    })

    const timeout = setTimeout(() => {
      if (!initialLoadDone) {
        initialLoadDone = true
        setLoading(false)
      }
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}