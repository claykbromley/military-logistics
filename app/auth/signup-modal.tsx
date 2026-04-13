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
import { Sparkles, Eye, EyeClosed } from "lucide-react"

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
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select('*')
        .eq("display_name", username)
        .maybeSingle()

      if (existingUsername) {
        alert("This username is already taken!")
        return
      }

      const { data: existingEmail } = await supabase
        .from("profiles")
        .select('*')
        .eq("email", email)
        .maybeSingle()

      if (existingEmail) {
        alert("This email is already associated with an account!")
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: username,
            phone,
            military_branch: service,
            service_status: status,
            paygrade,
            zip_code: zipCode,
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-2 border-border">
        <DialogTitle className="sr-only">Sign Up</DialogTitle>
        <div
          className="absolute inset-0 -z-10 opacity-5"
          style={{
            backgroundImage: "url(/placeholder.svg?height=800&width=600&query=american+flag+stars+stripes+pattern)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {success? 
        <div className="flex flex-col items-center pt-4 pb-4">
          <div className="text-sm text-muted-foreground">
            <h3 className="text-2xl text-center font-bold">Check Your Email</h3>
            <p className="p-2">We&apos;ve sent you a confirmation link</p>
          </div>
          <div>
            <hr />
            <p className="text-sm text-muted-foreground p-2 text-center">
              Please check your email and click the confirmation link to activate your account. Once confirmed, you
              can access Milify services.
            </p>
            <div className="flex justify-center pt-3">
              <Button
                onClick={onClose}
                className="font-bold transition-colors cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div> :
        <div>
          <div className="flex flex-col items-center pt-4 pb-4 border-b-2 border-slate-500">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl font-bold text-primary bg-clip-text">
                Milify Sign Up
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Already a member?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 dark:text-blue-700 font-semibold hover:text-blue-700 hover:underline transition-colors cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="signup-username" className="text-muted-foreground font-medium">
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
              <Label htmlFor="signup-password" className="text-muted-foreground font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-muted-foreground font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <hr className="border-slate-500"/>

            <div className="space-y-2">
              <Label htmlFor="service" className="text-muted-foreground font-medium">
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
              <Label htmlFor="status" className="text-muted-foreground font-medium">
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
              <Label htmlFor="paygrade" className="text-muted-foreground font-medium">
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
              <Label htmlFor="zipCode" className="text-muted-foreground font-medium">
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
              <Label htmlFor="phone" className="text-muted-foreground font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                pattern="^\+?1?\s?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}$"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-muted-foreground font-medium">
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
              className="w-full bg-blue-600 dark:bg-blue-800 hover:bg-blue-700 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
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
