"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Sparkles } from "lucide-react"

interface SignupModalProps {
  open: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

const serviceOptions = [
  "Army",
  "Navy",
  "Marine Corps",
  "Air Force",
  "Space Force",
  "Coast Guard",
  "National Guard",
  "Civilian",
]

const statusOptions = [
  "Active Duty",
  "Veteran/Retired",
  "National Guard/Reserve",
  "Recruit",
  "Family",
  "Military Support",
  "Other",
]

const paygradeOptions = [
  "E-1",
  "E-2",
  "E-3",
  "E-4",
  "E-5",
  "E-6",
  "E-7",
  "E-8",
  "E-9",
  "W-1",
  "W-2",
  "W-3",
  "W-4",
  "W-5",
  "O-1",
  "O-2",
  "O-3",
  "O-4",
  "O-5",
  "O-6",
  "O-7",
  "O-8",
  "O-9",
  "O-10",
  "CDT/MIDN",
  "Civilian",
  "Other"
]

export function SignupModal({ open, onClose, onSwitchToLogin }: SignupModalProps) {
  const [service, setService] = useState("")
  const [status, setStatus] = useState("")
  const [securityClearance, setSecurityClearance] = useState("")
  const [militaryJobCode, setMilitaryJobCode] = useState("")
  const [paygrade, setPaygrade] = useState("")
  const [rank, setRank] = useState("")
  const [separationDate, setSeparationDate] = useState("")
  const [ssn, setSsn] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Signup submitted:", { service, status, email, zipCode })
    // Handle signup logic here
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
                {serviceOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
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
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
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
                {paygradeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
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
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Join Now
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
