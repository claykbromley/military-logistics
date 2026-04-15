"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeClosed, CheckCircle, KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Supabase automatically handles the token exchange from the email link.
    // We just need to verify that a session exists.
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setIsValidSession(true)
      } else {
        // Listen for the auth state change (the SIGNED_IN event from the recovery link)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
              setIsValidSession(true)
            }
          }
        )

        // Give it a moment, then check once more
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (retrySession) {
            setIsValidSession(true)
          }
          setIsChecking(false)
        }, 2000)

        return () => subscription.unsubscribe()
      }

      setIsChecking(false)
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) throw updateError

      setIsSuccess(true)

      // Redirect to home after a brief pause
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Verifying reset link...</div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto p-8 bg-card border-2 border-border rounded-lg text-center space-y-4">
          <h1 className="text-2xl font-bold text-primary">Invalid or Expired Link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 dark:bg-blue-800 hover:bg-blue-700 dark:hover:bg-blue-700 text-white cursor-pointer"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full mx-auto p-8 bg-card border-2 border-border rounded-lg">
        <div className="flex flex-col items-center pb-4 mb-4 border-b-2 border-slate-500">
          <span className="text-3xl font-bold text-primary">Set New Password</span>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center py-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold text-foreground">Password Updated!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your password has been successfully updated. Redirecting you to the home page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <p className="text-sm text-muted-foreground">
              Enter your new password below.
            </p>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-muted-foreground font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-muted-foreground font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showConfirmPassword ? (
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
              <KeyRound className="mr-2 h-5 w-5" />
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}