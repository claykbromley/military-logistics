"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Navigation, Globe } from "lucide-react"
import { MILITARY_BASES } from "@/lib/types"

interface LocationSelectorProps {
  selectedLocation: string | null
  onLocationChange: (location: string | null, coords?: { lat: number; lng: number }) => void
}

export function LocationSelector({ selectedLocation, onLocationChange }: LocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationType, setLocationType] = useState<"current" | "base" | "all">("all")
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const filteredBases = MILITARY_BASES.filter(
    (base) =>
      base.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      base.state.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          // Find nearest base or use coordinates
          const nearestBase = MILITARY_BASES.reduce((prev, curr) => {
            const prevDist = Math.sqrt(Math.pow(prev.lat - latitude, 2) + Math.pow(prev.lng - longitude, 2))
            const currDist = Math.sqrt(Math.pow(curr.lat - latitude, 2) + Math.pow(curr.lng - longitude, 2))
            return currDist < prevDist ? curr : prev
          })

          onLocationChange(`Near ${nearestBase.name}, ${nearestBase.state}`, { lat: latitude, lng: longitude })
          setIsGettingLocation(false)
          setOpen(false)
        },
        () => {
          setIsGettingLocation(false)
        },
      )
    }
  }

  const handleSelectBase = (base: (typeof MILITARY_BASES)[0]) => {
    onLocationChange(`${base.name}, ${base.state}`, { lat: base.lat, lng: base.lng })
    setOpen(false)
  }

  const handleShowAll = () => {
    onLocationChange(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
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
          <RadioGroup value={locationType} onValueChange={(v) => setLocationType(v as typeof locationType)}>
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
            <>
              <Input placeholder="Search bases..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <ScrollArea className="h-48">
                <div className="flex flex-col gap-1">
                  {filteredBases.map((base) => (
                    <Button
                      key={base.name}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleSelectBase(base)}
                    >
                      {base.name}, {base.state}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
