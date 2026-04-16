"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

interface ForgotPasswordModalProps {
  open: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export function ForgotPasswordModal({ open, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [identifier, setIdentifier] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      let emailToReset: string

      const isEmail = identifier.includes("@")

      if (isEmail) {
        emailToReset = identifier
      } else {
        // Look up email by display_name, same pattern as login
        const { data, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("display_name", identifier)
          .single()

        if (error || !data) {
          throw new Error("No account found with that username")
        }

        emailToReset = data.email
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        emailToReset,
        {
          // Update this to match your deployed URL
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )

      if (resetError) throw resetError

      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Reset state when closing
    setIdentifier("")
    setError(null)
    setIsSuccess(false)
    onClose()
  }

  const handleBackToLogin = () => {
    setIdentifier("")
    setError(null)
    setIsSuccess(false)
    onBackToLogin()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-border">
        <DialogTitle className="sr-only">Forgot Password</DialogTitle>
        <DialogDescription />
        <div
          className="absolute inset-0 -z-10 opacity-5"
          style={{
            backgroundImage: "url(/images/placeholder.svg?height=600&width=600&query=military+eagle+stars+emblem)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="flex flex-col items-center pt-4 pb-4 border-b-2 border-slate-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-bold text-primary">
              Reset Password
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-blue-600 dark:text-blue-700 font-semibold hover:text-blue-700 hover:underline transition-colors cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center py-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              We've sent a password reset link to your email address. Click the link to set a new password.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToLogin}
              className="mt-4 cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <p className="text-sm text-muted-foreground">
              Enter your username or email address and we'll send you a link to reset your password.
            </p>
            <div className="space-y-2">
              <Label htmlFor="forgot-identifier" className="text-muted-foreground font-medium">
                Username or Email
              </Label>
              <Input
                id="forgot-identifier"
                type="text"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-blue-600 dark:bg-blue-800 hover:bg-blue-700 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              size="lg"
              disabled={isLoading}
            >
              <Mail className="mr-2 h-5 w-5" />
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}