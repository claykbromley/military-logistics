"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSwitchToSignup: () => void
}

export function LoginModal({ open, onClose, onSwitchToSignup }: LoginModalProps) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      let emailToLogin: string

      const isEmail = identifier.includes("@")

      if (isEmail) {
        emailToLogin = identifier
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("display_name", identifier)
          .single()

        if (error || !data) {
          throw new Error("Invalid login credentials")
        }

        emailToLogin = data.email
      }

      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: emailToLogin,
          password,
        })

      if (authError) throw authError
      
      onClose()
      router.refresh()
    } catch (error) {
      setError("Invalid login credentials")
    } finally {
      setIsLoading(false)
    }
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
              Username or Email
            </Label>
            <Input
              id="login-email-username"
              type="text"
              placeholder="Enter your username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            size="lg"
            disabled={isLoading}
          >
            <LogIn className="mr-2 h-5 w-5" />
            {isLoading ? "Signing in..." : "Sign In"}
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
