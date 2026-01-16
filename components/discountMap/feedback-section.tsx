"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Send, PlusCircle } from "lucide-react"

export interface MissingBusinessSubmission {
  businessName: string
  address: string
  discountDetails: string
  submittedAt: Date
}

export type SubmitMissingBusiness = (data: MissingBusinessSubmission) => Promise<void>

interface FeedbackSectionProps {
  onSubmit?: SubmitMissingBusiness
}

export function FeedbackSection({ onSubmit }: FeedbackSectionProps) {
  const [businessName, setBusinessName] = useState("")
  const [address, setAddress] = useState("")
  const [discountDetails, setDiscountDetails] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const submission: MissingBusinessSubmission = {
      businessName: businessName.trim(),
      address: address.trim(),
      discountDetails: discountDetails.trim(),
      submittedAt: new Date(),
    }

    if (onSubmit) {
      await onSubmit(submission)
    } else {
      // Placeholder: simulate API call when no backend is connected
      console.log("Missing business submission (no backend connected):", submission)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setIsSubmitting(false)
    setSubmitted(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setBusinessName("")
      setAddress("")
      setDiscountDetails("")
    }, 3000)
  }

  const isFormValid = businessName.trim() && address.trim()

  if (submitted) {
    return (
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="font-semibold text-lg text-emerald-800 mb-2">Thank You!</h3>
          <p className="text-emerald-700 text-sm">We&apos;ll review your submission and add it to our database.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Submit a Missing Business
        </CardTitle>
        <CardDescription>
          Know a business that offers military discounts? Help us grow our database by submitting it below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Joe's Auto Repair"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, San Diego, CA 92101"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountDetails">Discount Details</Label>
            <Textarea
              id="discountDetails"
              value={discountDetails}
              onChange={(e: { target: { value: React.SetStateAction<string> } }) => setDiscountDetails(e.target.value)}
              placeholder="e.g., 10% off all services with military ID"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={!isFormValid || isSubmitting} className="w-full">
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Business
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
