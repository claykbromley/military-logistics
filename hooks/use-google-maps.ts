"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type { Business, DiscountChain } from "@/lib/known-chains"
import { createClient } from "@/lib/supabase/client"

declare global {
  interface Window {
    google: typeof google
  }
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
const SEARCH_RADIUS_METERS = 8047  // 5 miles
const SEARCH_RADIUS_DEG = 0.08     // ~5.5 miles in degrees (for DB range queries)
const GRID_PRECISION = 0.05        // ~3.5 mile grid cells
const CACHE_TTL_DAYS = 14
const BATCH_SIZE = 50
const RETRY_DELAY_MS = 1500  // only used if Google returns OVER_QUERY_LIMIT

interface UseGoogleMapsReturn {
  isLoaded: boolean
  isPlacesLoaded: boolean
  isSearching: boolean
  chainsReady: boolean
  status: "idle" | "searching" | "cached" | "error"
  statusMessage: string
  searchProgress: { searched: number; total: number } | null
  businesses: Business[]
  cacheStats: { entries: number; size: string; userSubmittedCount: number; googleBusinessCount: number }
  searchNearby: (lat: number, lng: number) => Promise<void>
  clearCache: () => void
  refreshUserSubmissions: () => Promise<void>
}

function toGridKey(lat: number, lng: number): string {
  const gLat = (Math.round(lat / GRID_PRECISION) * GRID_PRECISION).toFixed(2)
  const gLng = (Math.round(lng / GRID_PRECISION) * GRID_PRECISION).toFixed(2)
  return `${gLat}_${gLng}`
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[''`\-\.]/g, "").replace(/\s+/g, " ").trim()
}

const PRIORITY_CHAINS = new Set([
  "starbucks", "mcdonalds", "chick fil a", "home depot", "lowes", "walmart",
  "target", "applebees", "chilis", "denny s", "golden corral", "cracker barrel",
  "texas roadhouse", "buffalo wild wings", "red lobster", "olive garden",
  "outback steakhouse", "ihop", "waffle house", "wendys", "burger king",
  "arbys", "five guys", "chipotle", "dunkin", "subway", "great clips",
  "jiffy lube", "valvoline", "autozone", "oreilly auto parts", "advance auto parts",
  "under armor", "nike", "columbia", "north face",
  "best western", "wyndham", "marriott", "hilton", "hyatt",
])

export function useGoogleMaps(): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlacesLoaded, setIsPlacesLoaded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [status, setStatus] = useState<"idle" | "searching" | "cached" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [searchProgress, setSearchProgress] = useState<{ searched: number; total: number } | null>(null)
  const [googleBusinesses, setGoogleBusinesses] = useState<Business[]>([])
  const [userSubmittedBusinesses, setUserSubmittedBusinesses] = useState<Business[]>([])
  const [chains, setChains] = useState<DiscountChain[]>([])
  const [cacheStats, setCacheStatsState] = useState({
    entries: 0, size: "0", userSubmittedCount: 0, googleBusinessCount: 0,
  })
  const abortRef = useRef(false)
  const lastSearchCenter = useRef<{ lat: number; lng: number } | null>(null)

  // ── Load Google Maps ──
  useEffect(() => {
    const check = () => {
      if (window.google?.maps?.places) setIsPlacesLoaded(true)
      if (window.google?.maps?.marker?.AdvancedMarkerElement) setIsLoaded(true)
      else if (window.google?.maps?.places) setIsLoaded(true)
    }
    check()
    if (isPlacesLoaded) return
    const existing = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existing) {
      const iv = setInterval(() => { check(); if (window.google?.maps?.places) clearInterval(iv) }, 100)
      setTimeout(() => { clearInterval(iv); check() }, 5000)
      return () => clearInterval(iv)
    }
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,marker&v=weekly`
    script.async = true; script.defer = true
    script.onload = () => {
      const iv = setInterval(() => { check(); if (window.google?.maps?.places) clearInterval(iv) }, 50)
      setTimeout(() => { clearInterval(iv); check() }, 5000)
    }
    script.onerror = () => { setStatus("error"); setStatusMessage("Failed to load Google Maps") }
    document.head.appendChild(script)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch chains ──
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("military_discount_chains").select("*")
        .eq("is_active", true).eq("source_type", "chain").order("name")
      if (error || !data) return
      const seen = new Set<string>()
      const deduped = data.filter((c: any) => {
        const key = normalizeName(c.name); if (seen.has(key)) return false; seen.add(key); return true
      })
      deduped.sort((a: any, b: any) => {
        const ap = PRIORITY_CHAINS.has(normalizeName(a.name)) ? 0 : 1
        const bp = PRIORITY_CHAINS.has(normalizeName(b.name)) ? 0 : 1
        return ap !== bp ? ap - bp : a.name.localeCompare(b.name)
      })
      setChains(deduped as DiscountChain[])
    }
    load()
    const supabase = createClient()
    const ch = supabase.channel("chains-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "military_discount_chains" }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // ── Fetch user-submitted (range-filtered at query time) ──
  const fetchUserSubmittedInRange = useCallback(async (lat: number, lng: number) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("business_discounts").select("*")
      .eq("status", "approved")
      .not("latitude", "is", null).not("longitude", "is", null)
      .gte("latitude", lat - SEARCH_RADIUS_DEG).lte("latitude", lat + SEARCH_RADIUS_DEG)
      .gte("longitude", lng - SEARCH_RADIUS_DEG).lte("longitude", lng + SEARCH_RADIUS_DEG)
    if (data) {
      setUserSubmittedBusinesses(data.map((item: any) => ({
        id: `user-${item.id}`, name: item.business_name, address: item.address,
        lat: item.latitude, lng: item.longitude, category: item.category || "other",
        discount: item.discount_details || "Military discount available",
        note: "", source: "user_submitted" as const,
      })))
    }
  }, [])

  const allBusinesses = [...googleBusinesses, ...userSubmittedBusinesses]

  const updateCacheStats = useCallback(async () => {
    const supabase = createClient()
    const { count } = await supabase
      .from("cached_business_locations").select("*", { count: "exact", head: true })
    setCacheStatsState({
      entries: count || 0, size: `${count || 0} locations`,
      userSubmittedCount: userSubmittedBusinesses.length,
      googleBusinessCount: googleBusinesses.length,
    })
  }, [userSubmittedBusinesses.length, googleBusinesses.length])
  useEffect(() => { updateCacheStats() }, [updateCacheStats])

  // ══════════════════════════════════════════
  // MAIN SEARCH
  // ══════════════════════════════════════════
  const searchNearby = useCallback(async (lat: number, lng: number) => {
    if (!isPlacesLoaded || chains.length === 0) return

    abortRef.current = true
    await new Promise((r) => setTimeout(r, 50))
    abortRef.current = false
    lastSearchCenter.current = { lat, lng }

    const gridKey = toGridKey(lat, lng)
    const supabase = createClient()
    const now = new Date().toISOString()

    setIsSearching(true)
    setStatus("searching")
    setSearchProgress(null)
    setStatusMessage("Checking cache...")

    // Fetch user-submitted in range
    fetchUserSubmittedInRange(lat, lng)

    // ── Step 1: Has this grid cell been searched before? ──
    const { data: gridRow } = await supabase
      .from("searched_grid_cells")
      .select("grid_key, expires_at")
      .eq("grid_key", gridKey)
      .maybeSingle()

    const gridIsCached = gridRow && new Date(gridRow.expires_at) > new Date()

    // ── Step 2: Load cached locations in range ──
    const { data: cachedLocations } = await supabase
      .from("cached_business_locations")
      .select("*")
      .gte("latitude", lat - SEARCH_RADIUS_DEG)
      .lte("latitude", lat + SEARCH_RADIUS_DEG)
      .gte("longitude", lng - SEARCH_RADIUS_DEG)
      .lte("longitude", lng + SEARCH_RADIUS_DEG)

    const cachedBusinesses: Business[] = (cachedLocations || []).map((loc: any) => ({
      id: loc.place_id,
      name: loc.business_name,
      address: loc.address,
      lat: loc.latitude,
      lng: loc.longitude,
      category: loc.category,
      discount: loc.discount,
      note: loc.note || "",
      placeId: loc.place_id,
      source: "google" as const,
    }))

    if (gridIsCached) {
      // This area was fully searched before — use cache only, no API calls
      setGoogleBusinesses(sortByDistance(cachedBusinesses, lat, lng))
      setStatus("cached")
      setStatusMessage(`${cachedBusinesses.length + userSubmittedBusinesses.length} businesses (instant from cache)`)
      setIsSearching(false)
      setSearchProgress(null)
      updateCacheStats()
      return
    }

    // ── Step 3: Search via Google Places API ──
    // Show any cached results immediately while we search
    const allFound: Business[] = [...cachedBusinesses]
    const processedIds = new Set(cachedBusinesses.map((b) => b.id))

    if (allFound.length > 0) {
      setGoogleBusinesses(sortByDistance(allFound, lat, lng))
    }
    setSearchProgress({ searched: 0, total: chains.length })
    setStatusMessage(`Searching ${chains.length} chains...`)

    try {
      const mapDiv = document.createElement("div")
      const map = new window.google.maps.Map(mapDiv)
      const service = new window.google.maps.places.PlacesService(map)
      let searched = 0
      const newLocationsToInsert: any[] = []

      for (let i = 0; i < chains.length; i += BATCH_SIZE) {
        if (abortRef.current) break
        const batch = chains.slice(i, i + BATCH_SIZE)

        const searchChain = (chain: DiscountChain): Promise<{ chain: DiscountChain; places: any[]; rateLimited: boolean }> =>
          new Promise((resolve) => {
            service.nearbySearch(
              { location: { lat, lng }, radius: SEARCH_RADIUS_METERS, keyword: chain.name },
              (res, apiStatus) => {
                if (apiStatus === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                  resolve({ chain, places: [], rateLimited: true })
                  return
                }
                const places: any[] = []
                if (apiStatus === google.maps.places.PlacesServiceStatus.OK && res) {
                  const cNorm = normalizeName(chain.name)
                  for (const place of res) {
                    if (!place.place_id || !place.geometry?.location || !place.name) continue
                    if (processedIds.has(place.place_id)) continue
                    const pNorm = normalizeName(place.name)
                    const firstP = pNorm.split(" ")[0]
                    const firstC = cNorm.split(" ")[0]
                    const match = pNorm.includes(cNorm) || cNorm.includes(pNorm) ||
                      (firstP.length > 3 && firstC.length > 3 && firstP === firstC)
                    if (!match) continue
                    processedIds.add(place.place_id)
                    const loc = {
                      place_id: place.place_id, chain_name: chain.name,
                      business_name: place.name, address: place.vicinity || "",
                      latitude: place.geometry.location.lat(),
                      longitude: place.geometry.location.lng(),
                      category: chain.category, discount: chain.discount,
                      note: chain.note || "",
                    }
                    places.push(loc)
                    allFound.push({
                      id: loc.place_id, name: loc.business_name, address: loc.address,
                      lat: loc.latitude, lng: loc.longitude, category: loc.category,
                      discount: loc.discount, note: loc.note,
                      placeId: loc.place_id, source: "google",
                    })
                  }
                }
                resolve({ chain, places, rateLimited: false })
              },
            )
          })

        let results = await Promise.all(batch.map(searchChain))

        // Retry any rate-limited chains after a pause
        const rateLimited = results.filter((r) => r.rateLimited).map((r) => r.chain)
        if (rateLimited.length > 0 && !abortRef.current) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
          const retryResults = await Promise.all(rateLimited.map(searchChain))
          results = [...results.filter((r) => !r.rateLimited), ...retryResults]
        }

        for (const { places } of results) {
          newLocationsToInsert.push(...places)
        }

        searched += batch.length
        setGoogleBusinesses(sortByDistance([...allFound], lat, lng))
        setSearchProgress({ searched, total: chains.length })
        setStatusMessage(`Searched ${searched}/${chains.length} — ${allFound.length} locations found`)
      }

      // ── Step 4: Bulk insert new locations into cache ──
      if (newLocationsToInsert.length > 0 && !abortRef.current) {
        // Insert in chunks to avoid payload limits
        for (let j = 0; j < newLocationsToInsert.length; j += 50) {
          const chunk = newLocationsToInsert.slice(j, j + 50)
          // Use individual inserts with conflict handling since we can't upsert on place_id
          for (const loc of chunk) {
            const { data: exists } = await supabase
              .from("cached_business_locations")
              .select("id")
              .eq("place_id", loc.place_id)
              .maybeSingle()
            if (!exists) {
              await supabase.from("cached_business_locations").insert(loc)
            }
          }
        }
      }

      // ── Step 5: Mark this grid cell as fully searched ──
      if (!abortRef.current) {
        const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 86400000).toISOString()
        const { data: existingGrid } = await supabase
          .from("searched_grid_cells")
          .select("grid_key")
          .eq("grid_key", gridKey)
          .maybeSingle()

        if (existingGrid) {
          await supabase.from("searched_grid_cells")
            .update({ searched_at: now, expires_at: expiresAt, chain_count: chains.length })
            .eq("grid_key", gridKey)
        } else {
          await supabase.from("searched_grid_cells")
            .insert({ grid_key: gridKey, searched_at: now, expires_at: expiresAt, chain_count: chains.length })
        }
      }

      setGoogleBusinesses(sortByDistance(allFound, lat, lng))
      const total = allFound.length + userSubmittedBusinesses.length
      setStatus("idle")
      setStatusMessage(`${total} businesses with military discounts`)
      setSearchProgress(null)
      updateCacheStats()
    } catch (err) {
      console.error("[DiscountMap] Search error:", err)
      setGoogleBusinesses(sortByDistance(allFound, lat, lng))
      setStatus("error")
      setStatusMessage(`Error. Showing ${allFound.length} results.`)
      setSearchProgress(null)
    } finally {
      setIsSearching(false)
    }
  }, [isPlacesLoaded, chains, fetchUserSubmittedInRange, userSubmittedBusinesses.length, updateCacheStats])

  const clearCache = useCallback(async () => {
    abortRef.current = true
    const supabase = createClient()
    await supabase.from("cached_business_locations").delete().gt("place_id", "")
    await supabase.from("searched_grid_cells").delete().gt("grid_key", "")
    setGoogleBusinesses([])
    setSearchProgress(null)
    updateCacheStats()
    setStatus("idle")
    setStatusMessage("Cache cleared")
  }, [updateCacheStats])

  const refreshUserSubmissions = useCallback(async () => {
    if (lastSearchCenter.current) {
      fetchUserSubmittedInRange(lastSearchCenter.current.lat, lastSearchCenter.current.lng)
    }
  }, [fetchUserSubmittedInRange])

  return {
    isLoaded, isPlacesLoaded, isSearching, chainsReady: chains.length > 0,
    status, statusMessage, searchProgress,
    businesses: allBusinesses, cacheStats, searchNearby, clearCache,
    refreshUserSubmissions,
  }
}

function sortByDistance(businesses: Business[], lat: number, lng: number): Business[] {
  return [...businesses].sort((a, b) => {
    const dA = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lng - lng, 2))
    const dB = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2))
    return dA - dB
  })
}