"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LogIn, Eye, EyeClosed } from "lucide-react"
import { useRouter } from "next/navigation"
import { loadAndApplyUserTheme } from "@/app/settings/page"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSwitchToSignup: () => void
  onSwitchToForgotPassword: () => void
}

export function LoginModal({ open, onClose, onSwitchToSignup, onSwitchToForgotPassword }: LoginModalProps) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

      await loadAndApplyUserTheme()
      
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
      <DialogContent className="sm:max-w-md bg-card border-2 border-border">
        <DialogTitle className="sr-only">Log In</DialogTitle>
        <DialogDescription />
        <div className="flex flex-col items-center pt-4 pb-4 border-b-2 border-slate-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-bold text-primary">
              Milify Login
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Not a member?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-blue-600 dark:text-blue-700 font-semibold hover:text-blue-700 hover:underline transition-colors cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="login-email-phone" className="text-muted-foreground font-medium">
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
            <Label htmlFor="login-password" className="text-muted-foreground font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeClosed className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-800 hover:bg-blue-700 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
            size="lg"
            disabled={isLoading}
          >
            <LogIn className="mr-2 h-5 w-5" />
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-blue-600 dark:text-blue-700 font-medium hover:text-blue-700 hover:underline transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}