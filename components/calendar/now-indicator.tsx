"use client"

import { useEffect, useState } from "react"

export function NowIndicator() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const top = (now.getHours() + now.getMinutes() / 60) * 64

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="flex items-center">
        <div
          className="w-3 h-3 rounded-full bg-red-500 -ml-[7px] shadow-sm"
          style={{ boxShadow: "0 0 6px 1px rgba(239,68,68,0.45)" }}
        />
        <div
          className="flex-1 h-[2px] bg-gradient-to-r from-red-500 to-red-500/40"
        />
      </div>
    </div>
  )
}