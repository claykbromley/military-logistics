import type { Business } from "./known-chains"

export interface CachedLocation {
  lat: number
  lng: number
  timestamp: number
  businesses: Business[]
}

/*export interface Business {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  category: string
  discount: string
  note: string
  placeId?: string
}*/

const CACHE_KEY = "milify_location_cache"
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export function getCacheKey(lat: number, lng: number): string {
  // Round to 2 decimal places to create reasonable cache zones (~1km)
  const roundedLat = Math.round(lat * 100) / 100
  const roundedLng = Math.round(lng * 100) / 100
  return `${roundedLat},${roundedLng}`
}

export function getCache(): Record<string, CachedLocation> {
  if (typeof window === "undefined") return {}
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch {
    return {}
  }
}

export function setCache(cache: Record<string, CachedLocation>): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.error("Failed to save cache:", e)
  }
}

export function getCachedResults(lat: number, lng: number): CachedLocation | null {
  const cache = getCache()
  const key = getCacheKey(lat, lng)
  const cached = cache[key]

  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached
  }

  return null
}

export function setCachedResults(lat: number, lng: number, businesses: Business[]): void {
  const cache = getCache()
  const key = getCacheKey(lat, lng)

  cache[key] = {
    lat,
    lng,
    timestamp: Date.now(),
    businesses,
  }

  setCache(cache)
}

export function clearCache(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CACHE_KEY)
}

export function getCacheStats(): { entries: number; size: string } {
  const cache = getCache()
  const entries = Object.keys(cache).length
  const size = new Blob([JSON.stringify(cache)]).size
  return {
    entries,
    size: size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} bytes`,
  }
}
