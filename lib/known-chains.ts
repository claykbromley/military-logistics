// ─── Types ───────────────────────────────────────────────────

export interface Business {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  category: string
  discount: string
  note?: string
  placeId?: string
  source: "google" | "user_submitted" | "individual"
}

export interface DiscountChain {
  id: number
  name: string
  category: string
  timing: string
  discount: string
  note: string
  source_type: string
}

// ─── Category config ─────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, string> = {
  restaurant: "#e11d48",
  retail: "#2563eb",
  automotive: "#d97706",
  hotel: "#7c3aed",
  entertainment: "#059669",
  fitness: "#0891b2",
  other: "#6b7280",
}

export const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "restaurant", label: "Restaurants" },
  { value: "retail", label: "Retail" },
  { value: "automotive", label: "Automotive" },
  { value: "hotel", label: "Hotels" },
  { value: "entertainment", label: "Entertainment" },
  { value: "fitness", label: "Fitness" },
]

// ─── Legacy compatibility ────────────────────────────────────
// KNOWN_CHAINS is no longer used — chains are fetched from Supabase
// This empty object keeps imports from breaking during migration
export const KNOWN_CHAINS: Record<string, { category: string; discount: string; note: string }> = {}