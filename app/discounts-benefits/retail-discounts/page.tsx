"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { MapView } from "@/components/discountMap/map-view"
import { SearchBar } from "@/components/discountMap/search-bar"
import { CategoryFilter } from "@/components/discountMap/category-filter"
import { ResultsList } from "@/components/discountMap/results-list"
import { StatusIndicator } from "@/components/discountMap/status-indicator"
import { FeedbackSection } from "@/components/discountMap/feedback-section"
import { CacheControls } from "@/components/discountMap/cache-controls"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import type { Business } from "@/lib/known-chains"
import { Map, List, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function MilitaryDiscountMap() {
  const [center, setCenter] = useState({ lat: 32.776470, lng: -79.931030 })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentAddress, setCurrentAddress] = useState("United States")
  const [activeTab, setActiveTab] = useState("map")
  const [showSearchButton, setShowSearchButton] = useState(false)
  const [pendingCenter, setPendingCenter] = useState<{ lat: number; lng: number } | null>(null)

  const { 
    isLoaded, 
    isPlacesLoaded, 
    isSearching, 
    chainsReady,
    status, 
    statusMessage, 
    searchProgress,
    businesses, 
    cacheStats, 
    searchNearby, 
    clearCache,
    refreshUserSubmissions 
  } = useGoogleMaps()

  // Filter businesses by selected categories
  const filteredBusinesses =
    selectedCategories.length === 0
      ? businesses
      : businesses.filter((b) => selectedCategories.includes(b.category))

  // Separate user-submitted from Google businesses for display
  const userSubmittedCount = businesses.filter(b => b.source === 'user_submitted').length
  const googleBusinessCount = businesses.filter(b => b.source === 'google').length

  // Handle search
  const handleSearch = useCallback(
    (lat: number, lng: number, address: string) => {
      setCenter({ lat, lng })
      setCurrentAddress(address)
      setShowSearchButton(false)
      setPendingCenter(null)
      searchNearby(lat, lng)
    },
    [searchNearby],
  )

  // Handle map movement — show "Search this area" button instead of auto-searching
  const handleMapMove = useCallback(
    (newCenter: { lat: number; lng: number }) => {
      const distance = Math.sqrt(Math.pow(newCenter.lat - center.lat, 2) + Math.pow(newCenter.lng - center.lng, 2))
      if (distance > 0.02) {
        setPendingCenter(newCenter)
        setShowSearchButton(true)
      }
    },
    [center],
  )

  // "Search this area" handler
  const handleSearchThisArea = useCallback(() => {
    if (pendingCenter) {
      setCenter(pendingCenter)
      setCurrentAddress("Map location")
      searchNearby(pendingCenter.lat, pendingCenter.lng)
      setShowSearchButton(false)
      setPendingCenter(null)
    }
  }, [pendingCenter, searchNearby])

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

  // Initial search on load — waits for both Places API and chains
  const initialSearchDone = useRef(false)
  useEffect(() => {
    if (!isPlacesLoaded || !chainsReady || initialSearchDone.current) return
    initialSearchDone.current = true

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCenter({ lat: latitude, lng: longitude })
          setCurrentAddress("Your current location")
          searchNearby(latitude, longitude)
        },
        () => {
          searchNearby(center.lat, center.lng)
        },
        { enableHighAccuracy: true, timeout: 5000 },
      )
    } else {
      searchNearby(center.lat, center.lng)
    }
  }, [isPlacesLoaded, chainsReady]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background">
      <Header />
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

          <StatusIndicator 
            status={status} 
            message={statusMessage} 
            cacheStats={{
              ...cacheStats
            }} 
          />

          {/* Search progress bar */}
          {searchProgress && (
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((searchProgress.searched / searchProgress.total) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {searchProgress.searched}/{searchProgress.total} chains searched
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
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
                  <div className="h-[400px] rounded-lg overflow-hidden border border-border relative">
                    <MapView
                      center={center}
                      businesses={filteredBusinesses}
                      selectedBusiness={selectedBusiness}
                      onMapMove={handleMapMove}
                      onBusinessSelect={handleBusinessSelect}
                      isLoaded={isLoaded}
                    />
                    {showSearchButton && !isSearching && (
                      <button
                        onClick={handleSearchThisArea}
                        className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all text-sm font-medium cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Search this area
                      </button>
                    )}
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
            <div className="hidden lg:block h-[600px] rounded-lg overflow-hidden border border-border relative">
              <MapView
                center={center}
                businesses={filteredBusinesses}
                selectedBusiness={selectedBusiness}
                onMapMove={handleMapMove}
                onBusinessSelect={handleBusinessSelect}
                isLoaded={isLoaded}
              />
              {showSearchButton && !isSearching && (
                <button
                  onClick={handleSearchThisArea}
                  className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all text-sm font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Search this area
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
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
          <FeedbackSection 
            isMapLoaded={isPlacesLoaded} 
            onSubmitSuccess={refreshUserSubmissions}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}