"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
//import type { google } from "google-maps"

interface SearchBarProps {
  onSearch: (lat: number, lng: number, address: string) => void
  onUseCurrentLocation: () => void
  isLoading: boolean
  isLoaded: boolean
}

interface Prediction {
  place_id: string
  description: string
}

export function SearchBar({ onSearch, onUseCurrentLocation, isLoading, isLoaded }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesRef = useRef<google.maps.places.PlacesService | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService()
      const mapDiv = document.createElement("div")
      const tempMap = new window.google.maps.Map(mapDiv)
      placesRef.current = new window.google.maps.places.PlacesService(tempMap)
    }
  }, [isLoaded])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPredictions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)

    if (value.length > 2 && autocompleteRef.current) {
      autocompleteRef.current.getPlacePredictions(
        { input: value, types: ["geocode"] },
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
    setQuery(prediction.description)
    setShowPredictions(false)

    if (placesRef.current) {
      placesRef.current.getDetails(
        { placeId: prediction.place_id, fields: ["geometry", "formatted_address"] },
        (result: google.maps.places.PlaceResult | null) => {
          if (result?.geometry?.location) {
            onSearch(
              result.geometry.location.lat(),
              result.geometry.location.lng(),
              result.formatted_address || prediction.description,
            )
          }
        },
      )
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (predictions.length > 0) {
      handlePredictionSelect(predictions[0])
    }
  }

  const clearSearch = () => {
    setQuery("")
    setPredictions([])
    setShowPredictions(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search for a location..."
            className="pl-10 pr-10 bg-card border-border"
            disabled={!isLoaded}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onUseCurrentLocation}
          disabled={isLoading || !isLoaded}
          className="shrink-0 bg-transparent"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          <span className="hidden sm:inline ml-2">Current Location</span>
        </Button>
      </form>

      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
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
  )
}
