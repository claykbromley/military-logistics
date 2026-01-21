"use client"

import { useEffect, useRef } from "react"
import { type Business, CATEGORY_COLORS } from "@/lib/known-chains"
//import type { google } from "google-maps"

interface MapViewProps {
  center: { lat: number; lng: number }
  businesses: Business[]
  selectedBusiness: Business | null
  onMapMove: (center: { lat: number; lng: number }) => void
  onBusinessSelect: (business: Business | null) => void
  isLoaded: boolean
}

declare global {
  interface Window {
    google: typeof google
  }
}

export function MapView({ center, businesses, selectedBusiness, onMapMove, onBusinessSelect, isLoaded }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const idleListenerRef = useRef<google.maps.MapsEventListener | null>(null)

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) return

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      mapId: "milify_map",
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    })

    mapInstanceRef.current = map
    infoWindowRef.current = new window.google.maps.InfoWindow()

    // Add idle listener for map movement
    idleListenerRef.current = map.addListener("idle", () => {
      const newCenter = map.getCenter()
      if (newCenter) {
        onMapMove({ lat: newCenter.lat(), lng: newCenter.lng() })
      }
    })

    return () => {
      if (idleListenerRef.current) {
        window.google.maps.event.removeListener(idleListenerRef.current)
      }
    }
  }, [isLoaded, center, onMapMove])

  // Update center when it changes externally
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(center)
    }
  }, [center])

  // Update markers when businesses change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null
    })
    markersRef.current = []

    // Add new markers
    businesses.forEach((business) => {
      const color = CATEGORY_COLORS[business.category] || "#6b7280"

      const pinElement = document.createElement("div")
      pinElement.innerHTML = `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 14px;">
            ${getCategoryEmoji(business.category)}
          </span>
        </div>
      `

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: business.lat, lng: business.lng },
        map: mapInstanceRef.current,
        title: business.name,
        content: pinElement,
      })

      marker.addListener("click", () => {
        onBusinessSelect(business)

        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="font-weight: 600; margin: 0 0 4px 0; color: #1e3a5f;">${business.name}</h3>
              <p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">${business.address}</p>
              <div style="background: #f0f9ff; padding: 8px; border-radius: 6px; border-left: 3px solid ${color};">
                <p style="font-weight: 500; margin: 0 0 4px 0; color: #1e3a5f;">${business.discount}</p>
                <p style="font-size: 11px; color: #666; margin: 0;">${business.note}</p>
              </div>
            </div>
          `)
          infoWindowRef.current.open(mapInstanceRef.current, marker)
        }
      })

      markersRef.current.push(marker)
    })
  }, [businesses, isLoaded, onBusinessSelect])

  // Handle selected business
  useEffect(() => {
    if (selectedBusiness && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: selectedBusiness.lat, lng: selectedBusiness.lng })
      mapInstanceRef.current.setZoom(15)
    }
  }, [selectedBusiness])

  return <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" style={{ backgroundColor: "#e5e7eb" }} />
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    restaurant: "🍽️",
    retail: "🛍️",
    automotive: "🚗",
    hotel: "🏨",
    entertainment: "🎯",
  }
  return emojis[category] || "📍"
}

export type { Business }
