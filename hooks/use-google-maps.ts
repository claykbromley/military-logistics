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
const SEARCH_RADIUS = 24140 // 15 miles
const GRID_PRECISION = 0.1  // ~7 mile grid cells — larger cells = more cache hits
const CACHE_TTL_DAYS = 14
const BATCH_SIZE = 8        // chains per batch (Google rate limit ~10 QPS)
const BATCH_DELAY_MS = 1200 // delay between batches to stay under rate limit

interface UseGoogleMapsReturn {
  isLoaded: boolean
  isPlacesLoaded: boolean
  isSearching: boolean
  chainsReady: boolean
  status: "idle" | "searching" | "cached" | "error"
  statusMessage: string
  businesses: Business[]
  cacheStats: { entries: number; size: string; userSubmittedCount: number; googleBusinessCount: number }
  searchNearby: (lat: number, lng: number) => Promise<void>
  clearCache: () => void
  refreshUserSubmissions: () => Promise<void>
}

function toGridKey(lat: number, lng: number): string {
  const gLat = (Math.round(lat / GRID_PRECISION) * GRID_PRECISION).toFixed(1)
  const gLng = (Math.round(lng / GRID_PRECISION) * GRID_PRECISION).toFixed(1)
  return `${gLat}_${gLng}`
}

// Normalize name for matching: lowercase, strip punctuation, collapse spaces
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[''`\-\.]/g, "").replace(/\s+/g, " ").trim()
}

export function useGoogleMaps(): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlacesLoaded, setIsPlacesLoaded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [status, setStatus] = useState<"idle" | "searching" | "cached" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [googleBusinesses, setGoogleBusinesses] = useState<Business[]>([])
  const [userSubmittedBusinesses, setUserSubmittedBusinesses] = useState<Business[]>([])
  const [chains, setChains] = useState<DiscountChain[]>([])
  const [cacheStats, setCacheStatsState] = useState({
    entries: 0, size: "0", userSubmittedCount: 0, googleBusinessCount: 0,
  })
  const abortRef = useRef(false)

  // ── Load Google Maps script ──
  useEffect(() => {
    const checkReady = () => {
      if (window.google?.maps?.places) setIsPlacesLoaded(true)
      if (window.google?.maps?.marker?.AdvancedMarkerElement) setIsLoaded(true)
      else if (window.google?.maps?.places) setIsLoaded(true) // fallback: places is enough
    }

    checkReady()
    if (isLoaded) return

    const existing = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existing) {
      const iv = setInterval(() => { checkReady(); if (isPlacesLoaded) clearInterval(iv) }, 100)
      setTimeout(() => { clearInterval(iv); checkReady() }, 5000)
      return () => clearInterval(iv)
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,marker&v=weekly`
    script.async = true; script.defer = true
    script.onload = () => {
      const iv = setInterval(() => { checkReady(); if (isPlacesLoaded) clearInterval(iv) }, 50)
      setTimeout(() => { clearInterval(iv); checkReady() }, 5000)
    }
    script.onerror = () => { setStatus("error"); setStatusMessage("Failed to load Google Maps. Check API key.") }
    document.head.appendChild(script)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch chains from Supabase ──
  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("military_discount_chains")
        .select("*")
        .eq("is_active", true)
        .eq("source_type", "chain")
        .order("name")
      if (error) console.error("[DiscountMap] Chain fetch error:", error)
      else if (data) {
        // Dedupe by normalized name (keep first occurrence)
        const seen = new Set<string>()
        const deduped = data.filter((c: any) => {
          const key = normalizeName(c.name)
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        console.log(`[DiscountMap] Loaded ${deduped.length} unique chains`)
        setChains(deduped as DiscountChain[])
      }
    }
    fetch()
    const supabase = createClient()
    const ch = supabase.channel("chains-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "military_discount_chains" }, () => fetch())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // ── Fetch user-submitted businesses ──
  const fetchUserSubmitted = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("business_discounts").select("*")
      .eq("status", "approved")
      .not("latitude", "is", null).not("longitude", "is", null)
    if (data) {
      setUserSubmittedBusinesses(data.map((item: any) => ({
        id: `user-${item.id}`, name: item.business_name, address: item.address,
        lat: item.latitude, lng: item.longitude,
        category: item.category || "other",
        discount: item.discount_details || "Military discount available",
        note: "", source: "user_submitted" as const,
      })))
    }
  }, [])
  useEffect(() => { fetchUserSubmitted() }, [fetchUserSubmitted])

  const allBusinesses = [...googleBusinesses, ...userSubmittedBusinesses]

  // ── Cache stats ──
  const updateCacheStats = useCallback(async () => {
    const supabase = createClient()
    const { count } = await supabase
      .from("cached_place_results")
      .select("*", { count: "exact", head: true })
      .gt("expires_at", new Date().toISOString())
    setCacheStatsState({
      entries: count || 0,
      size: `${count || 0} cached lookups`,
      userSubmittedCount: userSubmittedBusinesses.length,
      googleBusinessCount: googleBusinesses.length,
    })
  }, [userSubmittedBusinesses.length, googleBusinesses.length])
  useEffect(() => { updateCacheStats() }, [updateCacheStats])

  // ── MAIN SEARCH ──
  const searchNearby = useCallback(async (lat: number, lng: number) => {
    if (!isPlacesLoaded) return
    if (chains.length === 0) {
      setStatusMessage("Loading discount database...")
      return
    }

    abortRef.current = false
    const gridKey = toGridKey(lat, lng)
    const supabase = createClient()
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 86400000).toISOString()

    setIsSearching(true)
    setStatus("searching")
    setStatusMessage("Checking cache...")

    // 1. Load ALL cached results for this grid cell
    const { data: cachedRows } = await supabase
      .from("cached_place_results")
      .select("chain_name, results")
      .eq("grid_key", gridKey)
      .gt("expires_at", now)

    const cachedChainNames = new Set<string>()
    const allFoundBusinesses: Business[] = []
    const processedPlaceIds = new Set<string>()

    // Build businesses from cache
    if (cachedRows && cachedRows.length > 0) {
      const chainMap = new Map(chains.map((c) => [c.name, c]))
      for (const row of cachedRows) {
        cachedChainNames.add(row.chain_name)
        const chain = chainMap.get(row.chain_name)
        if (!chain) continue
        for (const p of (row.results as any[] || [])) {
          if (processedPlaceIds.has(p.place_id)) continue
          processedPlaceIds.add(p.place_id)
          allFoundBusinesses.push({
            id: p.place_id, name: p.name, address: p.address,
            lat: p.lat, lng: p.lng, category: chain.category,
            discount: chain.discount, note: chain.note || "",
            placeId: p.place_id, source: "google",
          })
        }
      }
    }

    // 2. Find chains NOT yet cached for this grid
    const uncachedChains = chains.filter((c) => !cachedChainNames.has(c.name))

    if (uncachedChains.length === 0) {
      // Fully cached
      setGoogleBusinesses(sortByDistance(allFoundBusinesses, lat, lng))
      setStatus("cached")
      setStatusMessage(`${allFoundBusinesses.length + userSubmittedBusinesses.length} businesses (all cached)`)
      setIsSearching(false)
      updateCacheStats()
      return
    }

    // Show cached results immediately
    if (allFoundBusinesses.length > 0) {
      setGoogleBusinesses(sortByDistance(allFoundBusinesses, lat, lng))
      setStatusMessage(`${allFoundBusinesses.length} cached, searching ${uncachedChains.length} more...`)
    } else {
      setStatusMessage(`Searching ${uncachedChains.length} chains...`)
    }

    // 3. Search uncached chains via Google Places keyword search
    try {
      const mapDiv = document.createElement("div")
      const map = new window.google.maps.Map(mapDiv)
      const service = new window.google.maps.places.PlacesService(map)

      let searchedCount = 0

      for (let i = 0; i < uncachedChains.length; i += BATCH_SIZE) {
        if (abortRef.current) break

        const batch = uncachedChains.slice(i, i + BATCH_SIZE)

        const batchResults = await Promise.all(
          batch.map((chain) => new Promise<{ chain: DiscountChain; places: any[] }>((resolve) => {
            service.nearbySearch(
              { location: { lat, lng }, radius: SEARCH_RADIUS, keyword: chain.name },
              (results, apiStatus) => {
                const places: any[] = []
                if (apiStatus === google.maps.places.PlacesServiceStatus.OK && results) {
                  const chainNorm = normalizeName(chain.name)
                  for (const place of results) {
                    if (!place.place_id || !place.geometry?.location || !place.name) continue
                    if (processedPlaceIds.has(place.place_id)) continue

                    // Verify the result actually matches our chain
                    const placeNorm = normalizeName(place.name)
                    const match =
                      placeNorm.includes(chainNorm) ||
                      chainNorm.includes(placeNorm) ||
                      placeNorm.startsWith(chainNorm.split(" ")[0]) ||
                      chainNorm.startsWith(placeNorm.split(" ")[0])

                    if (!match) continue

                    processedPlaceIds.add(place.place_id)
                    const placeData = {
                      place_id: place.place_id,
                      name: place.name,
                      address: place.vicinity || "Address not available",
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    }
                    places.push(placeData)
                    allFoundBusinesses.push({
                      id: placeData.place_id, name: placeData.name,
                      address: placeData.address, lat: placeData.lat, lng: placeData.lng,
                      category: chain.category, discount: chain.discount,
                      note: chain.note || "", placeId: placeData.place_id,
                      source: "google",
                    })
                  }
                }
                resolve({ chain, places })
              },
            )
          }))
        )

        // Cache each chain's results (even empty — means "no locations here")
        for (const { chain, places } of batchResults) {
          await supabase.from("cached_place_results").upsert({
            grid_key: gridKey, chain_name: chain.name,
            results: places, searched_at: now, expires_at: expiresAt,
          }, { onConflict: "grid_key,chain_name" })
        }

        // Progressive UI update
        searchedCount += batch.length
        setGoogleBusinesses(sortByDistance([...allFoundBusinesses], lat, lng))
        setStatusMessage(`Searched ${searchedCount}/${uncachedChains.length} chains (${allFoundBusinesses.length} found)...`)

        // Rate limit delay between batches
        if (i + BATCH_SIZE < uncachedChains.length && !abortRef.current) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
        }
      }

      // Done
      const sorted = sortByDistance(allFoundBusinesses, lat, lng)
      setGoogleBusinesses(sorted)
      const total = sorted.length + userSubmittedBusinesses.length
      setStatus("idle")
      setStatusMessage(`${total} businesses with military discounts`)
      updateCacheStats()
    } catch (error) {
      console.error("[DiscountMap] Search error:", error)
      // Still show whatever we found
      setGoogleBusinesses(sortByDistance(allFoundBusinesses, lat, lng))
      setStatus("error")
      setStatusMessage(`Search error. Showing ${allFoundBusinesses.length} results found so far.`)
    } finally {
      setIsSearching(false)
    }
  }, [isPlacesLoaded, chains, userSubmittedBusinesses.length, updateCacheStats])

  const clearCache = useCallback(async () => {
    abortRef.current = true
    const supabase = createClient()
    await supabase.from("cached_place_results").delete().gt("grid_key", "")
    setGoogleBusinesses([])
    updateCacheStats()
    setStatus("idle")
    setStatusMessage("Cache cleared")
  }, [updateCacheStats])

  return {
    isLoaded, isPlacesLoaded, isSearching, status, statusMessage,
    chainsReady: chains.length > 0,
    businesses: allBusinesses, cacheStats, searchNearby, clearCache,
    refreshUserSubmissions: fetchUserSubmitted,
  }
}

function sortByDistance(businesses: Business[], lat: number, lng: number): Business[] {
  return [...businesses].sort((a, b) => {
    const dA = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lng - lng, 2))
    const dB = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2))
    return dA - dB
  })
}