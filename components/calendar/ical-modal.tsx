"use client"

import { useState } from "react"
import { X, Check, Copy } from "lucide-react"

interface IcalModalProps {
  open: boolean
  icalUrl: string
  onClose: () => void
}

export function IcalModal({ open, icalUrl, onClose }: IcalModalProps) {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(icalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Subscribe to Calendar
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Use this URL to subscribe to your Milify calendar in Google Calendar
            or any other calendar app.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={icalUrl}
              className="flex-1 bg-muted rounded-md px-3 py-2 text-xs text-foreground font-mono outline-none select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <p className="text-xs font-medium text-foreground mb-2">
              Google Calendar Instructions:
            </p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Open Google Calendar Settings</li>
              <li>Click &quot;Add calendar&quot; → &quot;From URL&quot;</li>
              <li>Paste the URL above</li>
              <li>Click &quot;Add calendar&quot;</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}