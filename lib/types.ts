export type Category =
  | "uniforms"
  | "tactical-gear"
  | "electronics"
  | "furniture"
  | "vehicles"
  | "household"
  | "clothing"
  | "sports"
  | "other"

export type Condition = "new" | "like-new" | "good" | "fair" | "poor"

export type ListingStatus = "active" | "sold" | "pending" | "inactive"

export type MilitaryBranch =
  | "army"
  | "navy"
  | "air-force"
  | "marines"
  | "coast-guard"
  | "space-force"
  | "national-guard"
  | "civilian"

export type MilitaryBase = {
  id: number
  name: string
  state: string
  latitude: number
  longitude: number
}

export interface Profile {
  id: string
  display_name: string | null
  location: string | null
  military_branch: string | null
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number
  category: Category
  condition: Condition
  location: string
  latitude: number | null
  longitude: number | null
  images: string[]
  status: ListingStatus
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Message {
  id: string
  listing_id: string | null
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export interface SavedListing {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listings?: Listing
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "uniforms", label: "Uniforms & Dress" },
  { value: "tactical-gear", label: "Tactical Gear" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "vehicles", label: "Vehicles" },
  { value: "household", label: "Household Items" },
  { value: "clothing", label: "Clothing & Apparel" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "other", label: "Other" },
]

export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
]

export const MILITARY_BRANCHES: { value: MilitaryBranch; label: string }[] = [
  { value: "army", label: "Army" },
  { value: "navy", label: "Navy" },
  { value: "air-force", label: "Air Force" },
  { value: "marines", label: "Marines" },
  { value: "coast-guard", label: "Coast Guard" },
  { value: "space-force", label: "Space Force" },
  { value: "national-guard", label: "National Guard" },
  { value: "civilian", label: "Civilian" },
]

export const MILITARY_STATUS: { value: string; label: string }[] = [
  { value: "active-duty", label: "Active Duty" },
  { value: "veteran-retired", label: "Veteran/Retired" },
  { value: "national-guard-reserve", label: "National Guard/Reserve" },
  { value: "recruit", label: "Recruit" },
  { value: "family", label: "Family" },
  { value: "military-support", label: "Military Support" },
  { value: "other", label: "Other" },
]

export const PAYGRADES: { value: string; label: string }[] = [
  { value: "e1", label: "E-1" },
  { value: "e2", label: "E-2" },
  { value: "e3", label: "E-3" },
  { value: "e4", label: "E-4" },
  { value: "e5", label: "E-5" },
  { value: "e6", label: "E-6" },
  { value: "e7", label: "E-7" },
  { value: "e8", label: "E-8" },
  { value: "e9", label: "E-9" },
  { value: "w1", label: "W-1" },
  { value: "w2", label: "W-2" },
  { value: "w3", label: "W-3" },
  { value: "w4", label: "W-4" },
  { value: "w5", label: "W-5" },
  { value: "o1", label: "O-1" },
  { value: "o2", label: "O-2" },
  { value: "o3", label: "O-3" },
  { value: "o4", label: "O-4" },
  { value: "o5", label: "O-5" },
  { value: "o6", label: "O-6" },
  { value: "o7", label: "O-7" },
  { value: "o8", label: "O-8" },
  { value: "o9", label: "O-9" },
  { value: "o10", label: "O-10" },
  { value: "cdt-midn", label: "CDT/MIDN" },
  { value: "civilian", label: "Civilian" },
  { value: "other", label: "Other" },
]

export const STATES: { name: string; abbr: string; dmv: string }[] = [
  { name: "Alabama", abbr: "AL", dmv: "https://www.alea.gov/dps/driver-license" },
  { name: "Alaska", abbr: "AK", dmv: "https://doa.alaska.gov/dmv/" },
  { name: "Arizona", abbr: "AZ", dmv: "https://azdot.gov/motor-vehicles" },
  { name: "Arkansas", abbr: "AR", dmv: "https://www.dfa.arkansas.gov/driver-services/" },
  { name: "California", abbr: "CA", dmv: "https://www.dmv.ca.gov/" },
  { name: "Colorado", abbr: "CO", dmv: "https://dmv.colorado.gov/" },
  { name: "Connecticut", abbr: "CT", dmv: "https://portal.ct.gov/dmv" },
  { name: "Delaware", abbr: "DE", dmv: "https://www.dmv.de.gov/" },
  { name: "Florida", abbr: "FL", dmv: "https://www.flhsmv.gov/" },
  { name: "Georgia", abbr: "GA", dmv: "https://dds.georgia.gov/" },
  { name: "Hawaii", abbr: "HI", dmv: "https://hidot.hawaii.gov/" },
  { name: "Idaho", abbr: "ID", dmv: "https://itd.idaho.gov/dmv/" },
  { name: "Illinois", abbr: "IL", dmv: "https://www.ilsos.gov/" },
  { name: "Indiana", abbr: "IN", dmv: "https://www.in.gov/bmv/" },
  { name: "Iowa", abbr: "IA", dmv: "https://iowadot.gov/mvd" },
  { name: "Kansas", abbr: "KS", dmv: "https://www.ksrevenue.gov/dovindex.html" },
  { name: "Kentucky", abbr: "KY", dmv: "https://drive.ky.gov/" },
  { name: "Louisiana", abbr: "LA", dmv: "https://omv.dps.louisiana.gov/" },
  { name: "Maine", abbr: "ME", dmv: "https://www.maine.gov/sos/bmv/" },
  { name: "Maryland", abbr: "MD", dmv: "https://mva.maryland.gov/" },
  { name: "Massachusetts", abbr: "MA", dmv: "https://www.mass.gov/orgs/registry-of-motor-vehicles" },
  { name: "Michigan", abbr: "MI", dmv: "https://www.michigan.gov/sos" },
  { name: "Minnesota", abbr: "MN", dmv: "https://dps.mn.gov/divisions/dvs/" },
  { name: "Mississippi", abbr: "MS", dmv: "https://www.dps.ms.gov/" },
  { name: "Missouri", abbr: "MO", dmv: "https://dor.mo.gov/motor-vehicle/" },
  { name: "Montana", abbr: "MT", dmv: "https://dojmt.gov/driving/" },
  { name: "Nebraska", abbr: "NE", dmv: "https://dmv.ne.gov/" },
  { name: "Nevada", abbr: "NV", dmv: "https://dmv.nv.gov/" },
  { name: "New Hampshire", abbr: "NH", dmv: "https://www.nh.gov/safety/divisions/dmv/" },
  { name: "New Jersey", abbr: "NJ", dmv: "https://www.nj.gov/mvc/" },
  { name: "New Mexico", abbr: "NM", dmv: "https://www.mvd.newmexico.gov/" },
  { name: "New York", abbr: "NY", dmv: "https://dmv.ny.gov/" },
  { name: "North Carolina", abbr: "NC", dmv: "https://www.ncdot.gov/dmv/" },
  { name: "North Dakota", abbr: "ND", dmv: "https://www.dot.nd.gov/" },
  { name: "Ohio", abbr: "OH", dmv: "https://bmv.ohio.gov/" },
  { name: "Oklahoma", abbr: "OK", dmv: "https://www.ok.gov/dps/" },
  { name: "Oregon", abbr: "OR", dmv: "https://www.oregon.gov/odot/dmv/" },
  { name: "Pennsylvania", abbr: "PA", dmv: "https://www.dmv.pa.gov/" },
  { name: "Rhode Island", abbr: "RI", dmv: "https://dmv.ri.gov/" },
  { name: "South Carolina", abbr: "SC", dmv: "https://www.scdmvonline.com/" },
  { name: "South Dakota", abbr: "SD", dmv: "https://dps.sd.gov/" },
  { name: "Tennessee", abbr: "TN", dmv: "https://www.tn.gov/safety/driver-services.html" },
  { name: "Texas", abbr: "TX", dmv: "https://www.txdmv.gov/" },
  { name: "Utah", abbr: "UT", dmv: "https://dmv.utah.gov/" },
  { name: "Vermont", abbr: "VT", dmv: "https://dmv.vermont.gov/" },
  { name: "Virginia", abbr: "VA", dmv: "https://www.dmv.virginia.gov/" },
  { name: "Washington", abbr: "WA", dmv: "https://www.dol.wa.gov/" },
  { name: "West Virginia", abbr: "WV", dmv: "https://transportation.wv.gov/dmv/" },
  { name: "Wisconsin", abbr: "WI", dmv: "https://wisconsindot.gov/pages/dmv/index.aspx" },
  { name: "Wyoming", abbr: "WY", dmv: "https://dot.state.wy.us/" },
]

export interface Profile {
  id: string
  display_name: string | null
  location: string | null
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  nearby_base: string | null
  military_branch: string | null
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number
  category: Category
  condition: Condition
  location: string
  city: string | null
  state: string | null
  nearby_base: string | null
  latitude: number | null
  longitude: number | null
  images: string[]
  status: ListingStatus
  created_at: string
  updated_at: string
  profiles?: Profile
  distance?: number
}

export interface Conversation {
  id: string
  listing_id: string | null
  buyer_id: string
  seller_id: string
  last_message_at: string
  created_at: string
  listings?: Pick<Listing, "id" | "title" | "images"> | null
  buyer?: Pick<Profile, "id" | "display_name"> | null
  seller?: Pick<Profile, "id" | "display_name"> | null
  last_message?: Message | null
  unread_count: number
}

export interface Message {
  id: string
  listing_id: string | null
  conversation_id: string | null
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender_profile?: Pick<Profile, "id" | "display_name"> | null
}

export interface SavedListing {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listings?: Listing
}

export interface UserLocation {
  city: string
  state: string
  latitude: number
  longitude: number
  nearbyBase?: string
}