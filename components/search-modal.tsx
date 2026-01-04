"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Search submitted:", { searchQuery })
    // Handle search logic here
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div
          className="absolute inset-0 -z-10 opacity-10"
          style={{
            backgroundImage: "url(/images/placeholder.svg?height=600&width=800&query=military+tactical+map)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="flex flex-col items-center pt-4 pb-2">
          <div className="flex items-center gap-2 mb-6">
            <Search className="h-8 w-8 text-navy-600" />
            <span className="text-2xl font-bold text-navy-800">Search Milify</span>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <Input
              type="search"
              placeholder="Search for services, benefits, resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white text-lg py-6"
              autoFocus
            />
            <Button type="submit" className="w-full" size="lg">
              Search
            </Button>
          </form>

          <div className="mt-6 w-full">
            <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {["Deployment Checklist", "Military Discounts", "Schedule Appointment", "Benefits Guide"].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm hover:bg-navy-200 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
