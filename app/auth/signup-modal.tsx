"use client"

import { createClient } from "@/lib/supabase/client"
import type React from "react"
import { MILITARY_BRANCHES, MILITARY_STATUS, PAYGRADES } from "@/lib/types"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"

interface SignupModalProps {
  open: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function SignupModal({ open, onClose, onSwitchToLogin }: SignupModalProps) {
  const [service, setService] = useState("")
  const [status, setStatus] = useState("")
  const [paygrade, setPaygrade] = useState("")
  const [username, setUsername] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        phone,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            display_name: username,
            military_branch: service,
          },
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}> 
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 border-2 border-blue-200/50">
        <DialogTitle className="sr-only">Sign Up</DialogTitle>
        <div
          className="absolute inset-0 -z-10 opacity-5"
          style={{
            backgroundImage: "url(/placeholder.svg?height=800&width=600&query=american+flag+stars+stripes+pattern)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {success && 
        <div className="flex flex-col items-center pt-4 pb-4 border-b-2 border-blue-200/30">
          <div className="text-sm text-slate-600">
            <h3 className="text-2xl text-center font-bold">Check Your Email</h3>
            <p className="pb-2">We&apos;ve sent you a confirmation link</p>
          </div>
          <div>
            <hr />
            <p className="text-sm text-muted-foreground p-2 text-center">
              Please check your email and click the confirmation link to activate your account. Once confirmed, you
              can access Milify services.
            </p>
          </div>
        </div> ||
        <div>
          <div className="flex flex-col items-center pt-4 pb-4 border-b-2 border-blue-200/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl font-bold text-primary bg-clip-text">
                Milify Sign Up
              </span>
            </div>
            <div className="text-sm text-slate-600">
              Already a member?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="signup-username" className="text-slate-700 font-medium">
                Username
              </Label>
              <Input
                id="signup-username"
                type="username"
                placeholder="Create a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-slate-700 font-medium">
                Password
              </Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-700 font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <hr/>

            <div className="space-y-2">
              <Label htmlFor="service" className="text-slate-700 font-medium">
                Service
              </Label>
              <Select value={service} onValueChange={setService} required>
                <SelectTrigger
                  id="service"
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <SelectValue placeholder="Select your service" />
                </SelectTrigger>
                <SelectContent>
                  {MILITARY_BRANCHES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700 font-medium">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger
                  id="status"
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <SelectValue placeholder="Select your status" />
                </SelectTrigger>
                <SelectContent>
                  {MILITARY_STATUS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paygrade" className="text-slate-700 font-medium">
                Paygrade
              </Label>
              <Select value={paygrade} onValueChange={setPaygrade} required>
                <SelectTrigger
                  id="paygrade"
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <SelectValue placeholder="Select your paygrade" />
                </SelectTrigger>
                <SelectContent>
                  {PAYGRADES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-slate-700 font-medium">
                Zip Code
              </Label>
              <Input
                id="zipCode"
                type="text"
                inputMode="numeric"
                pattern="^\d{5}(-\d{4})?$"
                maxLength={10}
                placeholder="Enter your zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                pattern="^\+?1?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-slate-700 font-medium">
                Email
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isLoading ? "Creating account..." : "Join Now"}
            </Button>
          </form>
        </div>}
      </DialogContent>
    </Dialog>
  )
}
