"use client"

import type React from "react"

import { useState, useEffect, use, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { MARKETPLACECATEGORIES, MARKETPLACECONDITIONS, MilitaryBase } from "@/lib/types"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImagePlus, X, MapPin, Building, Hash } from "lucide-react"
import Link from "next/link"

interface EditListingPageProps {
  params: Promise<{ id: string }>
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationType, setLocationType] = useState<"current" | "base" | "zip">("current")
  const [militaryBases, setMilitaryBases] = useState<MilitaryBase[]>([])
  const [uniqueStates, setUniqueStates] = useState<string[]>([])
  const [basesLoading, setBasesLoading] = useState(true)
  const [stateSelected, setStateSelected] = useState<string>("")
  const [baseSelectedId, setBaseSelectedId] = useState<number | null>(null)
  const [zipCode, setZipCode] = useState("")
  const [zipError, setZipError] = useState<string | null>(null)
  const [isLookingUpZip, setIsLookingUpZip] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    city: "",
    state: "",
    latitude: null as number | null,
    longitude: null as number | null,
    nearbyBase: "",
    zipCode: "",
    status: "",
  })

  const states = useMemo(
    () => uniqueStates.map((s) => s.toUpperCase()),
    [uniqueStates]
  )

  const basesByState = useMemo(() => {
    const map = new Map<string, typeof militaryBases>()

    for (const base of militaryBases) {
      const state = base.state.toUpperCase()
      if (!map.has(state)) map.set(state, [])
      map.get(state)!.push(base)
    }

    for (const bases of map.values()) {
      bases.sort((a, b) => a.name.localeCompare(b.name))
    }

    return map
  }, [militaryBases])

  // Load military bases first
  useEffect(() => {
    const supabase = createClient()

    const loadBases = async () => {
      const { data, error } = await supabase
        .from("military_bases")
        .select("id, name, state, latitude, longitude")

      if (error) {
        console.error("Failed to load bases", error)
        setBasesLoading(false)
        return
      }

      setMilitaryBases(data || [])
      setUniqueStates([...new Set((data || []).map((base) => base.state))].sort())
      setBasesLoading(false)
    }

    loadBases()
  }, [])

  // Load listing data after bases are loaded
  useEffect(() => {
    if (basesLoading) return

    const fetchData = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/community/marketplace")
        return
      }

      const { data: listing, error: listingError } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("id", id)
        .single()

      if (listingError || !listing || listing.user_id !== user.id) {
        router.push("/community/marketplace/dashboard")
        return
      }

      // Detect location type based on existing data
      const hasZipCode = !!listing.zip_code
      const isBaseLocation = !hasZipCode &&
                            listing.state?.length === 2 && 
                            militaryBases.some(base => base.name === listing.city)
      
      if (hasZipCode) {
        setLocationType("zip")
        setZipCode(listing.zip_code)
      } else if (isBaseLocation) {
        setLocationType("base")
        setStateSelected(listing.state.toUpperCase())
        
        // Find and set the base
        const matchingBase = militaryBases.find(
          base => base.name === listing.city && 
                  base.state.toUpperCase() === listing.state.toUpperCase()
        )
        
        if (matchingBase) {
          setBaseSelectedId(matchingBase.id)
        }
      } else {
        setLocationType("current")
      }

      setFormData({
        title: listing.title,
        description: listing.description || "",
        price: listing.price.toString(),
        category: listing.category,
        condition: listing.condition,
        city: listing.city,
        state: listing.state,
        latitude: listing.latitude,
        longitude: listing.longitude,
        nearbyBase: listing.nearby_base || "",
        zipCode: listing.zip_code || "",
        status: listing.status,
      })
      
      setImages(listing.images || [])
      setIsLoading(false)
    }

    fetchData()
  }, [id, router, basesLoading, militaryBases])

  // Update form data when base is selected
  useEffect(() => {
    if (!baseSelectedId) return
    
    const base = militaryBases.find((b) => b.id === baseSelectedId)
    if (!base) return

    setFormData((prev) => ({
      ...prev,
      city: base.name,
      state: base.state.toUpperCase(),
      latitude: base.latitude,
      longitude: base.longitude,
      nearbyBase: `${base.name}, ${base.state.toUpperCase()}`,
      zipCode: "",
    }))
  }, [baseSelectedId, militaryBases])

  const handleSelectState = (value: string) => {
    setStateSelected(value)
    setBaseSelectedId(null)
  }

  const findNearestBase = (lat: number, lng: number) => {
    let nearest = null
    let minDistance = Infinity
    
    for (const base of militaryBases) {
      const dLat = lat - base.latitude
      const dLng = lng - base.longitude
      const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 69

      if (distance < minDistance) {
        minDistance = distance
        nearest = base
      }
    }

    return { base: nearest, distance: minDistance }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages((prev) => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          )
          const data = await response.json()

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            "Unknown City"
          const state = data.address?.state || "Unknown State"
          const postcode = data.address?.postcode || ""

          const { base: nearestBase, distance } = findNearestBase(latitude, longitude)
          
          setFormData((prev) => ({
            ...prev,
            city,
            state,
            latitude,
            longitude,
            nearbyBase: nearestBase && distance < 50 
              ? `${nearestBase.name}, ${nearestBase.state.toUpperCase()}`
              : "",
            zipCode: postcode,
          }))
        } catch {
          const { base: nearestBase } = findNearestBase(latitude, longitude)
          
          setFormData((prev) => ({
            ...prev,
            city: nearestBase ? "Near " + nearestBase.name : "Unknown City",
            state: nearestBase ? nearestBase.state.toUpperCase() : "Unknown State",
            latitude,
            longitude,
            nearbyBase: nearestBase 
              ? `${nearestBase.name}, ${nearestBase.state.toUpperCase()}`
              : "",
            zipCode: "",
          }))
        }

        setIsGettingLocation(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        setError("Unable to get your location. Please select a base or enter a ZIP code instead.")
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleZipLookup = async () => {
    const trimmed = zipCode.trim()
    if (!/^\d{5}$/.test(trimmed)) {
      setZipError("Please enter a valid 5-digit ZIP code")
      return
    }

    setIsLookingUpZip(true)
    setZipError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&postalcode=${trimmed}&country=US&addressdetails=1&limit=1`
      )
      const data = await response.json()

      if (!data || data.length === 0) {
        setZipError("Could not find that ZIP code. Please try another.")
        setIsLookingUpZip(false)
        return
      }

      const result = data[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      const city =
        result.address?.city ||
        result.address?.town ||
        result.address?.village ||
        result.address?.municipality ||
        "Unknown City"
      const state = result.address?.state || "Unknown State"

      const { base: nearestBase, distance } = findNearestBase(lat, lng)

      setFormData((prev) => ({
        ...prev,
        city,
        state,
        latitude: lat,
        longitude: lng,
        nearbyBase: nearestBase && distance < 50
          ? `${nearestBase.name}, ${nearestBase.state.toUpperCase()}`
          : "",
        zipCode: trimmed,
      }))

      setIsLookingUpZip(false)
    } catch {
      setZipError("Failed to look up ZIP code. Please try again.")
      setIsLookingUpZip(false)
    }
  }

  const handleLocationTypeChange = (type: "current" | "base" | "zip") => {
    setLocationType(type)
    setZipCode("")
    setZipError(null)
    
    if (type === "current") {
      setStateSelected("")
      setBaseSelectedId(null)
      getCurrentLocation()
    } else {
      setFormData((prev) => ({
        ...prev,
        city: "",
        state: "",
        latitude: null,
        longitude: null,
        nearbyBase: "",
        zipCode: "",
      }))
    }

    if (type !== "base") {
      setStateSelected("")
      setBaseSelectedId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (locationType === 'current' && (!formData.city || !formData.state)) {
      setError("Please set your location")
      return
    }
    
    if (locationType === 'base' && !baseSelectedId) {
      setError("Please select a base")
      return
    }

    if (locationType === 'zip' && (!formData.latitude || !formData.longitude)) {
      setError("Please enter and look up a valid ZIP code")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()
    
    // Determine location string based on location type
    let locationString: string
    if (locationType === 'base') {
      locationString = formData.nearbyBase
    } else if (locationType === 'zip') {
      locationString = formData.zipCode
        ? `${formData.city}, ${formData.state} (${formData.zipCode})`
        : `${formData.city}, ${formData.state}`
    } else {
      locationString = `${formData.city}, ${formData.state}`
    }
    
    const { error: updateError } = await supabase
      .from("marketplace_listings")
      .update({
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: locationString,
        city: formData.city,
        state: formData.state,
        latitude: formData.latitude,
        longitude: formData.longitude,
        nearby_base: formData.nearbyBase || null,
        zip_code: formData.zipCode || null,
        images: images,
        status: formData.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      setError(updateError.message)
      setIsSubmitting(false)
      return
    }

    router.push("/community/marketplace/dashboard")
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="mx-auto max-w-2xl">
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/community/marketplace/dashboard"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Edit Listing</CardTitle>
              <CardDescription>Update your listing details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Images */}
                <div className="grid gap-2">
                  <Label>Photos</Label>
                  <div className="flex flex-wrap gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative h-24 w-24 overflow-hidden rounded-lg border">
                        <img src={image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6 cursor-pointer"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed dark:border-slate-500 hover:border-primary dark:hover:border-primary">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      <span className="mt-1 text-xs text-muted-foreground">Add photo</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    className="dark:border-slate-500"
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    className="dark:border-slate-500"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Price */}
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    className="dark:border-slate-500"
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                {/* Category */}
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="dark:border-slate-500 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKETPLACECATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div className="grid gap-2">
                  <Label>Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger className="dark:border-slate-500 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKETPLACECONDITIONS.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="grid gap-4">
                  <Label>Location</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={locationType === "current" ? "default" : "outline"}
                      onClick={() => handleLocationTypeChange("current")}
                      disabled={isGettingLocation}
                      className="flex-1 cursor-pointer"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {isGettingLocation ? "Getting..." : "My Location"}
                    </Button>
                    <Button
                      type="button"
                      variant={locationType === "zip" ? "default" : "outline"}
                      onClick={() => handleLocationTypeChange("zip")}
                      className="flex-1 cursor-pointer"
                    >
                      <Hash className="mr-2 h-4 w-4" />
                      ZIP Code
                    </Button>
                    <Button
                      type="button"
                      variant={locationType === "base" ? "default" : "outline"}
                      onClick={() => handleLocationTypeChange("base")}
                      className="flex-1 cursor-pointer"
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Select Base
                    </Button>
                  </div>

                  {locationType === "current" && (
                    <div className="space-y-3">
                      {formData.city && formData.state && (
                        <div className="rounded-lg border bg-primary/20 p-3">
                          <p className="text-sm font-medium">
                            {formData.city}, {formData.state}
                          </p>
                          {formData.nearbyBase && (
                            <p className="text-xs text-muted-foreground">Near {formData.nearbyBase}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {locationType === "zip" && (
                    <div className="flex flex-col gap-3 rounded-lg border bg-primary/20 p-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter 5-digit ZIP code"
                          className="bg-card dark:border-slate-500"
                          value={zipCode}
                          onChange={(e) => {
                            setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))
                            setZipError(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && zipCode.length === 5 && !isLookingUpZip) {handleZipLookup()}
                          }}
                          maxLength={5}
                          inputMode="numeric"
                        />
                        <Button
                          type="button"
                          onClick={handleZipLookup}
                          className="cursor-pointer"
                          disabled={isLookingUpZip || zipCode.length < 5}
                        >
                          {isLookingUpZip ? "Looking up..." : "Look Up"}
                        </Button>
                      </div>
                      {zipError && <p className="text-sm text-destructive">{zipError}</p>}
                      {formData.city && formData.state && locationType === "zip" && (
                        <div className="rounded-lg border bg-background p-3">
                          <p className="text-sm font-medium">
                            {formData.city}, {formData.state}
                          </p>
                          {formData.nearbyBase && (
                            <p className="text-xs text-muted-foreground">Near {formData.nearbyBase}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {locationType === "base" && (
                    <div className="flex gap-4 rounded-lg border bg-primary/20 p-3">
                      {/* State Select */}
                      <Select
                        value={stateSelected}
                        onValueChange={handleSelectState}
                        disabled={basesLoading}
                      >
                        <SelectTrigger className="bg-card cursor-pointer dark:border-slate-500">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Base Select */}
                      {stateSelected && (
                        <Select
                          value={baseSelectedId?.toString() ?? ""}
                          onValueChange={(value) => setBaseSelectedId(Number(value))}
                          disabled={basesLoading}
                        >
                          <SelectTrigger className="bg-card cursor-pointer dark:border-slate-500">
                            <SelectValue placeholder="Select a military base" />
                          </SelectTrigger>
                          <SelectContent>
                            {(basesByState.get(stateSelected) ?? []).map((base) => (
                              <SelectItem key={base.id} value={base.id.toString()}>
                                {base.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="cursor-pointer dark:border-slate-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-4">
                  <Button type="button"
                    disabled={isSubmitting || !formData.title || !formData.price || !(formData.zipCode || formData.city || formData.nearbyBase)}
                    onClick={handleSubmit}
                    className="flex-1 cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" className="cursor-pointer" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}