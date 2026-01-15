"use client"

import { createContext, useContext, useState } from "react"

type UIContextType = {
  showLogin: boolean
  setShowLogin: (value: boolean) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <UIContext.Provider value={{ showLogin, setShowLogin }}>
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
