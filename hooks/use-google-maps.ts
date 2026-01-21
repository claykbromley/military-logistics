"use client"

import { useEffect, useState, useCallback } from "react"
import { KNOWN_CHAINS } from "@/lib/known-chains"
import type { Business } from "@/lib/known-chains"
import {
  getCachedResults,
  setCachedResults,
  clearCache as clearCacheUtil,
  getCacheStats,
} from "@/lib/cache-utils"

declare global {
  interface Window {
    google: typeof google
  }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyAdrCyFkQA2fmt-Lup40KN4qhI2yKpRLbI"
const SEARCH_RADIUS = 24140 // 15 miles in meters

interface UseGoogleMapsReturn {
  isLoaded: boolean
  isPlacesLoaded: boolean
  isSearching: boolean
  status: "idle" | "searching" | "cached" | "error"
  statusMessage: string
  businesses: Business[]
  cacheStats: { entries: number; size: string }
  searchNearby: (lat: number, lng: number) => Promise<void>
  clearCache: () => void
}

export function useGoogleMaps(): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlacesLoaded, setIsPlacesLoaded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [status, setStatus] = useState<"idle" | "searching" | "cached" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [cacheStats, setCacheStatsState] = useState({ entries: 0, size: "0 bytes" })

  // Load Google Maps script
  useEffect(() => {
    // Check if places library is already loaded (for autocomplete)
    if (window.google?.maps?.places) {
      setIsPlacesLoaded(true)
    }
    
    // Check if marker library is already loaded (for map markers)
    if (window.google?.maps?.marker?.AdvancedMarkerElement) {
      setIsLoaded(true)
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Wait for existing script to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          setIsPlacesLoaded(true)
        }
        if (window.google?.maps?.marker?.AdvancedMarkerElement) {
          setIsLoaded(true)
          clearInterval(checkLoaded)
        }
      }, 100)
      return () => clearInterval(checkLoaded)
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => {
      const checkLibraries = setInterval(() => {
        if (window.google?.maps?.places) {
          setIsPlacesLoaded(true)
        }
        if (window.google?.maps?.marker?.AdvancedMarkerElement) {
          setIsLoaded(true)
          clearInterval(checkLibraries)
        }
      }, 50)
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkLibraries)
        if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
          setStatus("error")
          setStatusMessage("Failed to load marker library")
        }
      }, 5000)
    }
    script.onerror = () => {
      setStatus("error")
      setStatusMessage("Failed to load Google Maps")
    }
    document.head.appendChild(script)

    return () => {
      // Don't remove script on cleanup to avoid reloading
    }
  }, [])

  // Update cache stats
  const updateCacheStats = useCallback(() => {
    setCacheStatsState(getCacheStats())
  }, [])

  useEffect(() => {
    updateCacheStats()
  }, [updateCacheStats])

  const searchNearby = useCallback(
    async (lat: number, lng: number) => {
      if (!isLoaded) return

      // Check cache first
      const cached = getCachedResults(lat, lng)
      if (cached) {
        setBusinesses(cached.businesses)
        setStatus("cached")
        setStatusMessage(`Using cached results (${cached.businesses.length} businesses found)`)
        updateCacheStats()
        return
      }

      setIsSearching(true)
      setStatus("searching")
      setStatusMessage("Searching for military discount locations...")

      try {
        const mapDiv = document.createElement("div")
        const map = new window.google.maps.Map(mapDiv)
        const service = new window.google.maps.places.PlacesService(map)

        const chainNames = Object.keys(KNOWN_CHAINS)
        const foundBusinesses: Business[] = []
        const processedPlaceIds = new Set<string>()

        // Search for each chain
        const searchPromises = chainNames.map((chainName) => {
          return new Promise<void>((resolve) => {
            service.nearbySearch(
              {
                location: { lat, lng },
                radius: SEARCH_RADIUS,
                keyword: chainName,
              },
              (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  results.forEach((place) => {
                    if (!place.place_id || processedPlaceIds.has(place.place_id)) return

                    const placeName = place.name?.toLowerCase() || ""
                    const matchingChain = chainNames.find((chain) => {
                      const chainLower = chain.toLowerCase()
                      return placeName.includes(chainLower) || chainLower.includes(placeName.split(" ")[0])
                    })

                    if (matchingChain && place.geometry?.location) {
                      processedPlaceIds.add(place.place_id)
                      const chainInfo = KNOWN_CHAINS[matchingChain]

                      foundBusinesses.push({
                        id: place.place_id,
                        name: place.name || matchingChain,
                        address: place.vicinity || "Address not available",
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        category: chainInfo.category,
                        discount: chainInfo.discount,
                        note: chainInfo.note,
                        placeId: place.place_id,
                      })
                    }
                  })
                }
                resolve()
              },
            )
          })
        })

        await Promise.all(searchPromises)

        // Sort by distance from center
        foundBusinesses.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lng - lng, 2))
          const distB = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2))
          return distA - distB
        })

        // Cache results
        setCachedResults(lat, lng, foundBusinesses)

        setBusinesses(foundBusinesses)
        setStatus("searching")
        setStatusMessage(`Found ${foundBusinesses.length} businesses via API`)
        updateCacheStats()

        // After a brief delay, show as complete
        setTimeout(() => {
          setStatus("idle")
          setStatusMessage(`${foundBusinesses.length} businesses with military discounts`)
        }, 2000)
      } catch (error) {
        console.error("Search error:", error)
        setStatus("error")
        setStatusMessage("Failed to search for businesses")
      } finally {
        setIsSearching(false)
      }
    },
    [isLoaded, updateCacheStats],
  )

  const clearCache = useCallback(() => {
    clearCacheUtil()
    setBusinesses([])
    updateCacheStats()
    setStatus("idle")
    setStatusMessage("Cache cleared")
  }, [updateCacheStats])

  return {
    isLoaded,
    isPlacesLoaded,
    isSearching,
    status,
    statusMessage,
    businesses,
    cacheStats,
    searchNearby,
    clearCache,
  }
}
