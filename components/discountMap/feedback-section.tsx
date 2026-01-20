"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Send, PlusCircle, MapPin } from "lucide-react"

export interface MissingBusinessSubmission {
  businessName: string
  address: string
  discountDetails: string
  submittedAt: Date
}

export type SubmitMissingBusiness = (data: MissingBusinessSubmission) => Promise<void>

interface Prediction {
  place_id: string
  description: string
}

interface FeedbackSectionProps {
  onSubmit?: SubmitMissingBusiness
  isMapLoaded?: boolean
}

export function FeedbackSection({ onSubmit, isMapLoaded = false }: FeedbackSectionProps) {
  const [businessName, setBusinessName] = useState("")
  const [addressInput, setAddressInput] = useState("")
  const [validatedAddress, setValidatedAddress] = useState("")
  const [discountDetails, setDiscountDetails] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)

  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesRef = useRef<google.maps.places.PlacesService | null>(null)
  const addressContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isMapLoaded && window.google) {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService()
      const mapDiv = document.createElement("div")
      const tempMap = new window.google.maps.Map(mapDiv)
      placesRef.current = new window.google.maps.places.PlacesService(tempMap)
    }
  }, [isMapLoaded])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addressContainerRef.current && !addressContainerRef.current.contains(event.target as Node)) {
        setShowPredictions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAddressChange = (value: string) => {
    setAddressInput(value)
    setValidatedAddress("") // Clear validated address when user types

    if (value.length > 2 && autocompleteRef.current) {
      autocompleteRef.current.getPlacePredictions(
        { input: value, types: ["address"] },
        (results: google.maps.places.AutocompletePrediction[] | null) => {
          if (results) {
            setPredictions(results.map((r) => ({ place_id: r.place_id, description: r.description })))
            setShowPredictions(true)
          }
        },
      )
    } else {
      setPredictions([])
      setShowPredictions(false)
    }
  }

  const handlePredictionSelect = (prediction: Prediction) => {
    setShowPredictions(false)

    if (placesRef.current) {
      placesRef.current.getDetails(
        { placeId: prediction.place_id, fields: ["formatted_address"] },
        (result: google.maps.places.PlaceResult | null) => {
          const formattedAddress = result?.formatted_address || prediction.description
          setAddressInput(formattedAddress)
          setValidatedAddress(formattedAddress)
        },
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const submission: MissingBusinessSubmission = {
      businessName: businessName.trim(),
      address: validatedAddress.trim(),
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
      setAddressInput("")
      setValidatedAddress("")
      setDiscountDetails("")
    }, 3000)
  }

  // Form is only valid if business name is filled AND address was selected from autocomplete
  const isFormValid = businessName.trim() && validatedAddress.trim()
  const isAddressValidated = validatedAddress === addressInput && validatedAddress.trim() !== ""

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

          <div className="space-y-2" ref={addressContainerRef}>
            <Label htmlFor="address">Address *</Label>
            <p className="text-xs text-muted-foreground">Please select an address from the suggestions</p>
            <div className="relative">
              <Input
                id="address"
                value={addressInput}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Start typing an address..."
                required
                className={isAddressValidated ? "border-emerald-500 pr-10" : ""}
                disabled={!isMapLoaded}
              />
              {isAddressValidated && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              )}
              {showPredictions && predictions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  {predictions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      type="button"
                      onClick={() => handlePredictionSelect(prediction)}
                      className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b border-border last:border-0"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{prediction.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {addressInput && !isAddressValidated && (
              <p className="text-xs text-amber-600">Please select an address from the dropdown suggestions</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountDetails">Discount Details</Label>
            <Textarea
              id="discountDetails"
              value={discountDetails}
              onChange={(e) => setDiscountDetails(e.target.value)}
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
