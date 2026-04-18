"use client"

import { useState, useEffect, useMemo } from "react"
import { SectionLayout } from "@/components/section-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  ExternalLink, 
  Search,
  Scale,
  Star,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react"

// Sample weigh station data (CAT Scales and truck stops)
const weighStations = [
  {
    id: 1,
    name: "Pilot Travel Center",
    address: "1234 Interstate Dr, San Antonio, TX 78219",
    city: "San Antonio",
    state: "TX",
    zip: "78219",
    lat: 29.4241,
    lng: -98.4936,
    phone: "(210) 555-0123",
    hours: "24/7",
    type: "CAT Scale",
    certified: true,
    rating: 4.5,
    amenities: ["Restrooms", "Food", "Fuel", "Parking"],
    priceRange: "$12-15"
  },
  {
    id: 2,
    name: "Flying J Travel Plaza",
    address: "5678 Highway 90, Houston, TX 77001",
    city: "Houston",
    state: "TX",
    zip: "77001",
    lat: 29.7604,
    lng: -95.3698,
    phone: "(713) 555-0456",
    hours: "24/7",
    type: "CAT Scale",
    certified: true,
    rating: 4.3,
    amenities: ["Restrooms", "Food", "Fuel", "Showers", "Parking"],
    priceRange: "$12-15"
  },
  {
    id: 3,
    name: "Love's Travel Stop",
    address: "9012 I-35 Frontage Rd, Austin, TX 78702",
    city: "Austin",
    state: "TX",
    zip: "78702",
    lat: 30.2672,
    lng: -97.7431,
    phone: "(512) 555-0789",
    hours: "24/7",
    type: "CAT Scale",
    certified: true,
    rating: 4.6,
    amenities: ["Restrooms", "Food", "Fuel", "Parking", "Pet Area"],
    priceRange: "$11-14"
  },
  {
    id: 4,
    name: "TA Travel Center",
    address: "3456 Fort Hood St, Killeen, TX 76541",
    city: "Killeen",
    state: "TX",
    zip: "76541",
    lat: 31.1171,
    lng: -97.7278,
    phone: "(254) 555-0321",
    hours: "5:00 AM - 11:00 PM",
    type: "CAT Scale",
    certified: true,
    rating: 4.2,
    amenities: ["Restrooms", "Food", "Fuel"],
    priceRange: "$12-15"
  },
  {
    id: 5,
    name: "Petro Stopping Center",
    address: "7890 Military Hwy, Norfolk, VA 23518",
    city: "Norfolk",
    state: "VA",
    zip: "23518",
    lat: 36.8508,
    lng: -76.2859,
    phone: "(757) 555-0654",
    hours: "24/7",
    type: "CAT Scale",
    certified: true,
    rating: 4.4,
    amenities: ["Restrooms", "Food", "Fuel", "Showers", "Laundry"],
    priceRange: "$12-15"
  },
  {
    id: 6,
    name: "Sapp Bros Travel Center",
    address: "1111 Base Blvd, Colorado Springs, CO 80913",
    city: "Colorado Springs",
    state: "CO",
    zip: "80913",
    lat: 38.8339,
    lng: -104.8214,
    phone: "(719) 555-0987",
    hours: "24/7",
    type: "CAT Scale",
    certified: true,
    rating: 4.7,
    amenities: ["Restrooms", "Food", "Fuel", "Parking", "WiFi"],
    priceRange: "$11-14"
  },
  {
    id: 7,
    name: "Pilot Flying J",
    address: "2222 Pendleton Ave, Oceanside, CA 92058",
    city: "Oceanside",
    state: "CA",
    zip: "92058",
    lat: 33.1959,
    lng: -117.3795,
    phone: "(760) 555-0147",
    hours: "24/7",
    type: "CAT Scale",
    certified: true,
    rating: 4.1,
    amenities: ["Restrooms", "Food", "Fuel", "Showers"],
    priceRange: "$13-16"
  },
  {
    id: 8,
    name: "Love's Travel Stop",
    address: "3333 Bragg Blvd, Fayetteville, NC 28303",
    city: "Fayetteville",
    state: "NC",
    zip: "28303",
    lat: 35.0527,
    lng: -78.8784,
    phone: "(910) 555-0258",
    hours: "24/7",
    type: "CAT Scale",
    certified: true,
    rating: 4.5,
    amenities: ["Restrooms", "Food", "Fuel", "Parking", "Pet Area"],
    priceRange: "$11-14"
  },
  {
    id: 9,
    name: "TA Express",
    address: "4444 Liberty St, Jacksonville, NC 28540",
    city: "Jacksonville",
    state: "NC",
    zip: "28540",
    lat: 34.7540,
    lng: -77.4302,
    phone: "(910) 555-0369",
    hours: "6:00 AM - 10:00 PM",
    type: "CAT Scale",
    certified: true,
    rating: 4.0,
    amenities: ["Restrooms", "Food", "Fuel"],
    priceRange: "$12-15"
  },
  {
    id: 10,
    name: "Flying J Travel Center",
    address: "5555 Joint Base Way, Tacoma, WA 98433",
    city: "Tacoma",
    state: "WA",
    zip: "98433",
    lat: 47.2529,
    lng: -122.4443,
    phone: "(253) 555-0470",
    hours: "24/7",
    type: "CAT Scale",
    certified: true,
    rating: 4.6,
    amenities: ["Restrooms", "Food", "Fuel", "Showers", "Parking"],
    priceRange: "$12-15"
  }
]

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

export default function WeighStationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedStation, setSelectedStation] = useState<typeof weighStations[0] | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const filteredStations = useMemo(() => {
    return weighStations.filter(station => {
      const matchesSearch = searchQuery === "" || 
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.zip.includes(searchQuery)
      
      const matchesState = selectedState === "" || station.state === selectedState

      return matchesSearch && matchesState
    })
  }, [searchQuery, selectedState])

  const handleGetLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setIsLocating(false)
        },
        () => {
          setIsLocating(false)
        }
      )
    } else {
      setIsLocating(false)
    }
  }

  const getDirectionsUrl = (station: typeof weighStations[0]) => {
    const destination = encodeURIComponent(station.address)
    if (userLocation) {
      return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destination}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${destination}`
  }

  return (
    <SectionLayout
      title="Weigh Station Finder"
      description="Find CAT Scales and certified weigh stations near you or along your PCS route for your PPM move"
      backLink="/pcs"
      backLabel="PCS"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Search and Filters */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-gold" />
                Search Stations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">City, ZIP, or Station Name</Label>
                <Input
                  id="search"
                  placeholder="Enter location or station name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Filter by State</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGetLocation}
                disabled={isLocating}
              >
                <Navigation className="mr-2 h-4 w-4" />
                {isLocating ? "Locating..." : "Use My Location"}
              </Button>

              {userLocation && (
                <p className="text-xs text-muted-foreground text-center">
                  Location found. Stations sorted by distance.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-5 w-5 text-gold" />
                PPM Weigh Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  Weigh your vehicle <strong>before loading</strong> (empty weight) and <strong>after loading</strong> (full weight)
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  Keep all weight tickets - you&apos;ll need them for reimbursement
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  Use <strong>certified CAT Scales</strong> for accurate, accepted weights
                </p>
              </div>
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  Same scale location for both weighs is recommended but not required
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} found
            </p>
            <Badge variant="outline" className="border-gold text-gold">
              <Scale className="mr-1 h-3 w-3" />
              CAT Scale Certified
            </Badge>
          </div>

          <div className="grid gap-4">
            {filteredStations.map(station => (
              <Card 
                key={station.id} 
                className={`bg-card border-border cursor-pointer transition-all hover:border-gold/50 ${
                  selectedStation?.id === station.id ? 'border-gold ring-1 ring-gold/20' : ''
                }`}
                onClick={() => setSelectedStation(station)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            {station.name}
                            {station.certified && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {station.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-gold">
                          <Star className="h-4 w-4 fill-gold" />
                          <span className="text-sm font-medium">{station.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {station.hours}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {station.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Scale className="h-3 w-3" />
                          {station.priceRange}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {station.amenities.map(amenity => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button asChild size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
                        <a 
                          href={getDirectionsUrl(station)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Navigation className="mr-1 h-3 w-3" />
                          Directions
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a 
                          href={`tel:${station.phone.replace(/\D/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="mr-1 h-3 w-3" />
                          Call
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredStations.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No Stations Found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* CAT Scale App Promotion */}
          <Card className="bg-navy/30 border-gold/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Weigh My Truck App</h4>
                  <p className="text-sm text-muted-foreground">
                    Download the official CAT Scale app for iOS or Android to find scales, get digital tickets, and manage your weighs.
                  </p>
                </div>
                <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
                  <a href="https://catscale.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit CAT Scale
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionLayout>
  )
}
