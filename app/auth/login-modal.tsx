"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LogIn } from "lucide-react"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSwitchToSignup: () => void
}

export function LoginModal({ open, onClose, onSwitchToSignup }: LoginModalProps) {
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Login submitted:", { emailOrPhone })
    // Handle login logic here
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 border-2 border-blue-200/50">
        <DialogTitle className="sr-only">Log In</DialogTitle>
        <div
          className="absolute inset-0 -z-10 opacity-5"
          style={{
            backgroundImage: "url(/placeholder.svg?height=600&width=600&query=military+eagle+stars+emblem)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="flex flex-col items-center pt-4 pb-4 border-b-2 border-blue-200/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-bold text-primary">
              Milify Login
            </span>
          </div>
          <div className="text-sm text-slate-600">
            Not a member?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="login-email-phone" className="text-slate-700 font-medium">
              Email/Phone Number
            </Label>
            <Input
              id="login-email-phone"
              type="text"
              placeholder="Enter your email or phone number"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-slate-700 font-medium">
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Enter
          </Button>
          <div className="text-center pt-2">
            <button
              type="button"
              className="text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
