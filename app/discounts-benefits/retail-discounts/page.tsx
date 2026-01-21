"use client"

<<<<<<< HEAD
import { Header } from "@/components/header"
import LocationForm from "@/components/location-form"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import { DiscountMap } from "@/components/discount-map"
import { JSX } from "react"

type MapCenter = {
  lat: number
  lng: number
}

type MapDefaults = {
  center: MapCenter
  zoom: number
}

export default function RetailDiscountsPage(): JSX.Element {
  const defaultProps: MapDefaults = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627,
    },
    zoom: 11,
  }
=======
import { useState, useCallback, useEffect } from "react"
import { MapView } from "@/components/discountMap/map-view"
import { SearchBar } from "@/components/discountMap/search-bar"
import { CategoryFilter } from "@/components/discountMap/category-filter"
import { ResultsList } from "@/components/discountMap/results-list"
import { StatusIndicator } from "@/components/discountMap/status-indicator"
import { FeedbackSection } from "@/components/discountMap/feedback-section"
import { CacheControls } from "@/components/discountMap/cache-controls"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import type { Business } from "@/lib/known-chains"
import { Shield, Map, List } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import Head from "next/head"

export default function MilitaryDiscountMap() {
  const [center, setCenter] = useState({ lat: 32.776470, lng: -79.931030 }) // Center of US
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentAddress, setCurrentAddress] = useState("United States")
  const [activeTab, setActiveTab] = useState("map")
  const [selectedCategory, setSelectedCategory] = useState("all"); // Declare selectedCategory

  const { isLoaded, isPlacesLoaded, isSearching, status, statusMessage, businesses, cacheStats, searchNearby, clearCache } =
    useGoogleMaps()

  // Filter businesses by selected categories
  const filteredBusinesses =
    selectedCategories.length === 0
      ? businesses
      : businesses.filter((b) => selectedCategories.includes(b.category))

  // Handle search
  const handleSearch = useCallback(
    (lat: number, lng: number, address: string) => {
      setCenter({ lat, lng })
      setCurrentAddress(address)
      searchNearby(lat, lng)
    },
    [searchNearby],
  )

  // Handle map movement
  const handleMapMove = useCallback(
    (newCenter: { lat: number; lng: number }) => {
      // Only trigger search if map moved significantly (debounced by idle event)
      const distance = Math.sqrt(Math.pow(newCenter.lat - center.lat, 2) + Math.pow(newCenter.lng - center.lng, 2))

      if (distance > 0.05) {
        // ~5km movement threshold
        setCenter(newCenter)
        searchNearby(newCenter.lat, newCenter.lng)
      }
    },
    [center, searchNearby],
  )

  // Handle current location
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCenter({ lat: latitude, lng: longitude })
        setCurrentAddress("Your current location")
        searchNearby(latitude, longitude)
        setIsGettingLocation(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Unable to get your location. Please search manually.")
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [searchNearby])

  // Handle business selection
  const handleBusinessSelect = useCallback((business: Business | null) => {
    setSelectedBusiness(business)
    if (business) {
      setActiveTab("map")
    }
  }, [])

  // Initial search on load
  useEffect(() => {
    if (isLoaded && businesses.length === 0) {
      // Try to get user's location on initial load
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setCenter({ lat: latitude, lng: longitude })
            setCurrentAddress("Your current location")
            searchNearby(latitude, longitude)
          },
          () => {
            // If location access denied, search default location
            searchNearby(center.lat, center.lng)
          },
          { enableHighAccuracy: true, timeout: 5000 },
        )
      }
    }
  }, [isLoaded]) // eslint-disable-line react-hooks/exhaustive-deps
>>>>>>> eric-v2

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
<<<<<<< HEAD
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto">
            <Container fluid>
              <Row>
                <h1 className="text-3xl font-bold mb-4 text-center">
                  Discount Database
                </h1>
              </Row>

              <Row className="flex justify-center items-center my-6">
                {/* Map */}
                <DiscountMap />
              </Row>

              <Row className="flex justify-center items-center my-6">
                <LocationForm
                  onSubmit={(data: unknown) =>
                    console.log("Location submitted:", data)
                  }
                />
              </Row>
            </Container>
=======
      <main className="container mx-auto px-4 py-6">
        {/* Search Section */}
        <div className="space-y-4 mb-6">
          <SearchBar
            onSearch={handleSearch}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLoading={isGettingLocation || isSearching}
            isLoaded={isLoaded}
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CategoryFilter selected={selectedCategories} onChange={setSelectedCategories} />
          </div>

          <StatusIndicator status={status} message={statusMessage} cacheStats={cacheStats} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            {/* Mobile Tabs */}
            <div className="lg:hidden mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Map
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List ({filteredBusinesses.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="map" className="mt-4">
                  <div className="h-[400px] rounded-lg overflow-hidden border border-border">
                    <MapView
                      center={center}
                      businesses={filteredBusinesses}
                      selectedBusiness={selectedBusiness}
                      onMapMove={handleMapMove}
                      onBusinessSelect={handleBusinessSelect}
                      isLoaded={isLoaded}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="list" className="mt-4">
                  <ResultsList
                    businesses={filteredBusinesses}
                    selectedBusiness={selectedBusiness}
                    onBusinessSelect={handleBusinessSelect}
                    isLoading={isSearching}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop Map */}
            <div className="hidden lg:block h-[600px] rounded-lg overflow-hidden border border-border">
              <MapView
                center={center}
                businesses={filteredBusinesses}
                selectedBusiness={selectedBusiness}
                onMapMove={handleMapMove}
                onBusinessSelect={handleBusinessSelect}
                isLoaded={isLoaded}
              />
            </div>
>>>>>>> eric-v2
          </div>

          {/* Results Section - Takes 1 column */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <List className="h-5 w-5" />
                Results ({filteredBusinesses.length})
              </h2>
              <ResultsList
                businesses={filteredBusinesses}
                selectedBusiness={selectedBusiness}
                onBusinessSelect={handleBusinessSelect}
                isLoading={isSearching}
              />
            </div>

            <CacheControls cacheStats={cacheStats} onClearCache={clearCache} />
          </div>
        </div>

        {/* Mobile Cache Controls */}
        <div className="lg:hidden mt-6">
          <CacheControls cacheStats={cacheStats} onClearCache={clearCache} />
        </div>

        {/* Feedback Section */}
        <div className="mt-8">
          <FeedbackSection isMapLoaded={isPlacesLoaded} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Disclaimer:</strong> Discounts are subject to change. Always verify with the business before
              visiting.
            </p>
            <p>© {new Date().getFullYear()} Milify. Supporting our military community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
