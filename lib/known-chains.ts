export type CategoryType = "restaurant" | "retail" | "automotive" | "hotel" | "entertainment";

export interface Business {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  distance?: number; // Make optional
  category: CategoryType;
  discount: string;
  rating?: number;
  note?: string;
  zipCode?: string;
  placeId?: string;
}

export const KNOWN_CHAINS: Record<string, { discount: string; category: CategoryType; note: string }> = {
  // RESTAURANTS - Only verified with current corporate policies
  "applebee's": { discount: "Free Veterans Day meal", category: "restaurant", note: "Veterans Day only" },
  "chili's": { discount: "Free Veterans Day meal", category: "restaurant", note: "Veterans Day only" },
  "outback steakhouse": { discount: "10% off year-round", category: "restaurant", note: "Plus Veterans Day free meal" },
  "buffalo wild wings": {
    discount: "10% off at participating locations",
    category: "restaurant",
    note: "Location-dependent",
  },
  "denny's": { discount: "Free Grand Slam on Veterans Day", category: "restaurant", note: "Veterans Day only" },
  "ihop": { discount: "Free pancake combo on Veterans Day", category: "restaurant", note: "Veterans Day only" },
  "golden corral": {
    discount: "Free Veterans Day buffet",
    category: "restaurant",
    note: "Plus year-round 10-20% at participating locations",
  },
  "texas roadhouse": { discount: "Free Veterans Day meal voucher", category: "restaurant", note: "Veterans Day only" },

  // RETAIL - Only verified with current corporate policies
  "the home depot": { discount: "10% off year-round", category: "retail", note: "Excludes appliances" },
  "home depot": { discount: "10% off year-round", category: "retail", note: "Excludes appliances" },
  "lowe's": { discount: "10% off year-round", category: "retail", note: "Year-round discount" },
  "target": { discount: "10% off during military events", category: "retail", note: "Limited time events only" },
  "gap": { discount: "10% off factory stores only", category: "retail", note: "Factory stores only" },
  "under armour": { discount: "20% off year-round", category: "retail", note: "ID.me verification required" },
  "nike": { discount: "10% off year-round", category: "retail", note: "Online verification required" },
  "foot locker": { discount: "10% off most purchases", category: "retail", note: "Restrictions apply" },

  // AUTOMOTIVE - Only verified with current corporate policies
  "jiffy lube": {
    discount: "15% off year-round",
    category: "automotive",
    note: "Participating Team Car Care locations only",
  },
  "valvoline": {
    discount: "15% off year-round",
    category: "automotive",
    note: "Excludes battery replacement/state inspection",
  },
  "meineke": { discount: "Free Veterans Day oil change", category: "automotive", note: "Veterans Day only" },
  "firestone": { discount: "10% off year-round", category: "automotive", note: "Tax-free advantages available" },

  // HOTELS - Only verified with current corporate policies
  "hampton inn": { discount: "10% off government rate", category: "hotel", note: "Military ID required" },
  "marriott": { discount: "15% off flexible rates", category: "hotel", note: "Participating resorts, code XYD" },
  "hilton": { discount: "Military family rate", category: "hotel", note: "Varies by hotel, military ID required" },
  "holiday inn": { discount: "5%+ off best flexible rate", category: "hotel", note: "Minimum 5% discount" },
  "best western": { discount: "10% off + per diem rates", category: "hotel", note: "Military/government personnel" },
  "la quinta inn": { discount: "12% off standard rate", category: "hotel", note: "Military ID required" },
  "motel 6": { discount: "10% off year-round", category: "hotel", note: "All 1,400+ locations" },

  // ENTERTAINMENT/FITNESS - Only verified with current corporate policies
  "24 hour fitness": {
    discount: "$0 initiation + $5 off monthly",
    category: "entertainment",
    note: "Select memberships, military ID required",
  },
}

export const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "restaurant", label: "Restaurants" },
  { value: "retail", label: "Retail" },
  { value: "automotive", label: "Automotive" },
  { value: "hotel", label: "Hotels" },
  { value: "entertainment", label: "Entertainment" },
]

export const CATEGORY_COLORS: Record<string, string> = {
  restaurant: "#ef4444",
  retail: "#3b82f6",
  automotive: "#f59e0b",
  hotel: "#8b5cf6",
  entertainment: "#10b981",
}

export const CATEGORY_ICONS: Record<string, string> = {
  restaurant: "🍽️",
  retail: "🛍️",
  automotive: "🚗",
  hotel: "🏨",
  entertainment: "🎯",
}
