"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Globe } from "lucide-react"
import { MilitaryBase } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface LocationSelectorProps {
  selectedLocation: string | null
  onLocationChange: (location: string | null, coords?: { lat: number; lng: number }) => void
}

export function LocationSelector({ selectedLocation, onLocationChange }: LocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [locationType, setLocationType] = useState<"current" | "base" | "all">("all")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [stateSelected, setStateSelected] = useState<string>("")
  const [baseSelectedId, setBaseSelectedId] = useState<number | null>(null)
  const [militaryBases, setMilitaryBases] = useState<MilitaryBase[]>([])
  const [uniqueStates, setUniqueStates] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const loadBases = async () => {
      const { data, error } = await supabase
        .from("military_bases")
        .select("id, name, state, latitude, longitude")

      if (error) {
        console.error("Failed to load bases", error)
        return
      }

      setMilitaryBases(data)
      setUniqueStates([...new Set(data.map((base) => base.state))].sort())
    }

    loadBases()
  }, [])

  const getCurrentLocation = () => {
    if (!militaryBases.length) return
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        )
        const data = await response.json()

        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.municipality ||
          null
        const state = data.address?.state || null

        if (city && state) {
          onLocationChange(
            `${city}, ${state}`,
            { lat: latitude, lng: longitude }
          )
        } else {
          onLocationChange("Current location", { lat: latitude, lng: longitude })
        }
        setIsGettingLocation(false)
        setOpen(false)
      },
      () => {
        setError("Unable to get your location. Please select a base instead.")
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const handleShowAll = () => {
    onLocationChange(null)
    setOpen(false)
  }

  const handleLocationTypeChange = (value: "all" | "current" | "base") => {
    setLocationType(value)
    setStateSelected("")
    setBaseSelectedId(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent cursor-pointer">
          <MapPin className="h-4 w-4" />
          {selectedLocation || "All Locations"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription>Choose a military base or use your current location</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <RadioGroup value={locationType} onValueChange={(v) => handleLocationTypeChange(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                <Globe className="h-4 w-4" />
                Show all locations
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="current" id="current" />
              <Label htmlFor="current" className="flex items-center gap-2 cursor-pointer">
                <Navigation className="h-4 w-4" />
                Use my current location
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="base" id="base" />
              <Label htmlFor="base" className="flex items-center gap-2 cursor-pointer">
                <MapPin className="h-4 w-4" />
                Select a military base
              </Label>
            </div>
          </RadioGroup>

          {locationType === "base" && (
            <div className="flex gap-3 rounded-lg border bg-muted/50 p-3">
              {/* State Select */}
              <Select
                value={stateSelected}
                onValueChange={(value) => {
                  setStateSelected(value)
                  setBaseSelectedId(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Base Select */}
              {stateSelected && (
                <Select
                  value={baseSelectedId ? baseSelectedId.toString() : ""}
                  onValueChange={(value) => {
                    const baseId = Number(value)
                    setBaseSelectedId(baseId)

                    const base = militaryBases.find((b) => b.id === baseId)
                    if (!base) return

                    onLocationChange(`${base.name}, ${base.state.toUpperCase()}`, {
                      lat: base.latitude,
                      lng: base.longitude,
                    })

                    setOpen(false)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a military base" />
                  </SelectTrigger>
                  <SelectContent>
                    {militaryBases
                      .filter((b) => b.state === stateSelected)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((base) => (
                        <SelectItem key={base.id} value={base.id.toString()}>
                          {base.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {locationType === "all" && (
              <Button className="flex-1" onClick={handleShowAll}>
                Show All Listings
              </Button>
            )}
            {locationType === "current" && (
              <Button className="flex-1" onClick={getCurrentLocation} disabled={isGettingLocation}>
                {isGettingLocation ? "Getting location..." : "Use My Location"}
              </Button>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
