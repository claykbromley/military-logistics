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

export const PAYGRADES: { value: string; label: string; next?: string; typicalYOS?: number, note?: string }[] = [
  // ENLISTED
  { value: "e1", label: "E-1", next: "E-2", typicalYOS: 0, note: "Automatic on enlistment" },
  { value: "e2", label: "E-2", next: "E-3", typicalYOS: 1, note: "6 months TIS" },
  { value: "e3", label: "E-3", next: "E-4", typicalYOS: 2, note: "12 months TIS, 4 months TIG" },
  { value: "e4", label: "E-4", next: "E-5", typicalYOS: 3, note: "24 months TIS, 6 months TIG" },
  { value: "e5", label: "E-5", next: "E-6", typicalYOS: 6, note: "Promotion board, ~4-6 YOS typical" },
  { value: "e6", label: "E-6", next: "E-7", typicalYOS: 10, note: "Promotion board, ~8-12 YOS typical" },
  { value: "e7", label: "E-7", next: "E-8", typicalYOS: 16, note: "Centralized board, ~14-18 YOS typical" },
  { value: "e8", label: "E-8", next: "E-9", typicalYOS: 20, note: "Centralized board, ~18-22 YOS typical" },
  { value: "e9", label: "E-9", typicalYOS: 24, note: "Centralized board, ~22-26 YOS typical" },

  // WARRANT OFFICER
  { value: "w1", label: "W-1", next: "W-2", typicalYOS: 8, note: "Warrant Officer Candidate School" },
  { value: "w2", label: "W-2", next: "W-3", typicalYOS: 12, note: "~2 years as W-1" },
  { value: "w3", label: "W-3", next: "W-4", typicalYOS: 16, note: "~4 years as W-2, promotion board" },
  { value: "w4", label: "W-4", next: "W-5", typicalYOS: 22, note: "~6 years as W-3, promotion board" },
  { value: "w5", label: "W-5", typicalYOS: 28, note: "~4 years as W-4, centralized board" },

  // OFFICER
  { value: "o1", label: "O-1", next: "O-2", typicalYOS: 0, note: "Commission (OCS/ROTC/Service Academy)" },
  { value: "o1e", label: "O-1E", next: "O-2E", typicalYOS: 4, note: "Commission (STA-21/Green to Gold/MECEP)" },
  { value: "o2", label: "O-2", next: "O-3", typicalYOS: 2, note: "2 years as O-1" },
  { value: "o2e", label: "O-2E", next: "O-3E", typicalYOS: 6, note: "2 years as O-1E" },
  { value: "o3", label: "O-3", next: "O-4", typicalYOS: 4, note: "2 years as O-2" },
  { value: "o3e", label: "O-3E", next: "O-4", typicalYOS: 8, note: "2 years as O-2E" },
  { value: "o4", label: "O-4", next: "O-5", typicalYOS: 10, note: "~4-6 years as O-3, promotion board" },
  { value: "o5", label: "O-5", next: "O-6", typicalYOS: 16, note: "~5-6 years as O-4, promotion board" },
  { value: "o6", label: "O-6", next: "O-7", typicalYOS: 22, note: "~5-6 years as O-5, promotion board" },
  { value: "o7", label: "O-7", next: "O-8", typicalYOS: 26, note: "Presidential nomination, Senate confirmation" },
  { value: "o8", label: "O-8", next: "O-9", typicalYOS: 30, note: "Presidential nomination, Senate confirmation" },
  { value: "o9", label: "O-9", next: "O-10", typicalYOS: 32, note: "Presidential nomination, Senate confirmation" },
  { value: "o10", label: "O-10", typicalYOS: 34, note: "Presidential nomination, Senate confirmation" },

  // OTHER
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
  { name: "District of Columbia", abbr: "DC", dmv: "https://dmv.dc.gov/" },
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

// MARKETPLACE
export type MarketplaceCategory =
  | "uniforms"
  | "tactical-gear"
  | "electronics"
  | "furniture"
  | "vehicles"
  | "household"
  | "clothing"
  | "sports"
  | "other"

export type MarketplaceCondition = "new" | "like-new" | "good" | "fair" | "poor"

export type MarketplaceListingStatus = "active" | "sold" | "pending" | "inactive"

export interface MarketplaceListing {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number
  category: MarketplaceCategory
  condition: MarketplaceCondition
  location: string
  latitude: number | null
  longitude: number | null
  images: string[]
  status: MarketplaceListingStatus
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface MarketplaceMessage {
  id: string
  listing_id: string | null
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export interface MarketplaceSavedListing {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listings?: MarketplaceListing
}

export const MARKETPLACECATEGORIES: { value: MarketplaceCategory; label: string }[] = [
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

export const MARKETPLACECONDITIONS: { value: MarketplaceCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
]

export interface MarketplaceProfile {
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

export interface MarketplaceListing {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number
  category: MarketplaceCategory
  condition: MarketplaceCondition
  location: string
  city: string | null
  state: string | null
  nearby_base: string | null
  latitude: number | null
  longitude: number | null
  images: string[]
  status: MarketplaceListingStatus
  created_at: string
  updated_at: string
  profiles?: Profile
  distance?: number
}

export interface MarketplaceConversation {
  id: string
  listing_id: string | null
  buyer_id: string
  seller_id: string
  last_message_at: string
  created_at: string
  listings?: Pick<MarketplaceListing, "id" | "title" | "images"> | null
  buyer?: Pick<Profile, "id" | "display_name"> | null
  seller?: Pick<Profile, "id" | "display_name"> | null
  last_message?: MarketplaceMessage | null
  unread_count: number
}

export interface MarketplaceMessage {
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

export interface MarketplaceSavedListing {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listings?: MarketplaceListing
}

export interface MarketplaceUserLocation {
  city: string
  state: string
  latitude: number
  longitude: number
  nearbyBase?: string
}

// EMERGENCY CONTACTS AND COMMUNICATION
export type CommunicationType = "call" | "video" | "email" | "letter" | "message"
export type ContactRole = "primary" | "secondary" | "medical" | "financial" | "legal" | "other"
export type EventType = "call" | "video" | "meeting" | "reminder"
export type EventStatus = "scheduled" | "completed" | "cancelled" | "rescheduled"
export type InvitationStatus = "pending" | "accepted" | "declined" | "tentative"

export interface Contact {
  id: string
  user_id?: string
  contactName: string
  relationship?: string
  phonePrimary?: string
  phoneSecondary?: string
  email?: string
  address?: string
  timezone?: string
  role: ContactRole
  isEmergencyContact: boolean
  isPoaHolder: boolean
  poaType?: string
  canAccessAccounts: boolean
  priority: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CommunicationLog {
  id: string
  user_id?: string
  contactId?: string
  contactName: string
  communicationType: CommunicationType
  direction: "incoming" | "outgoing" | "twoway"
  communicationDate: string
  durationMinutes?: number
  notes?: string
  createdAt: string
}

export interface ScheduledEvent {
  id: string
  user_id?: string
  title: string
  description?: string
  eventType: EventType
  startTime: string
  endTime?: string
  durationMinutes: number
  location?: string
  meetingLink?: string
  isRecurring: boolean
  status: EventStatus
  notes?: string
  invitations: EventInvitation[]
  isInvitee?: boolean
  myInvitationStatus?: InvitationStatus
  createdAt: string
  updatedAt: string
  recurrencePattern?: "daily" | "weekly" | "monthly"
  recurrenceInterval?: number
  recurrenceEndDate?: string
  recurrenceCount?: number
}

export interface EventInvitation {
  id: string
  eventId: string
  contactId?: string
  inviteeEmail: string
  inviteeName?: string
  status: InvitationStatus
  responseMessage?: string
  notifiedAt?: string
  respondedAt?: string
  createdAt: string
}

export interface InvitationWithEvent extends EventInvitation {
  event: ScheduledEvent
}

export interface MessageThread {
  id: string
  user_id?: string
  contactId?: string
  contactEmail: string
  contactName?: string
  subject?: string
  isArchived: boolean
  isStarred: boolean
  lastMessageAt: string
  unreadCount: number
  messages: Message[]
  createdAt: string
}

export interface Message {
  id: string
  threadId: string
  senderType: "user" | "contact"
  senderId?: string
  senderEmail: string
  senderName?: string
  recipientEmail?: string
  content: string
  contentType: "text" | "html" | "markdown"
  isRead: boolean
  readAt?: string
  attachments: any[]
  editedAt: string
  createdAt: string
}

export interface SharedContact {
  id: string
  ownerId: string
  ownerDisplayName?: string
  ownerEmail: string
  ownerPhone: string
  contactName: string
  relationship?: string
  phone?: string
  contactEmail?: string
  address?: string
  role?: string
  hasPoa: boolean
  poaType?: string
  notes?: string
  priority: number
  createdAt: string
  updatedAt: string
  localDisplayName?: string
  localRelationship?: string
  addedToContacts?: boolean
}

// Financial Manager

export interface PlaidItem {
  id: string;
  user_id: string;
  access_token: string;
  item_id: string;
  institution_id: string | null;
  institution_name: string | null;
  cursor: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  plaid_item_id: string;
  account_id_plaid: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance_current: number;
  balance_available: number | null;
  mask: string | null;
  updated_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  merchant_name: string | null;
  category: string;
  amount: number;
  frequency: string;
  last_date: string | null;
  next_date: string | null;
  is_on_hold: boolean;
  is_essential: boolean;
  stream_id: string | null;
  created_at: string;
}

export interface InvestmentRule {
  id: string
  funding_account_id: string
  user_id: string
  type: "amount" | "shares"
  symbol: string
  value: number
  frequency: "daily" | "weekly" | "biweekly" | "monthly"
  min_price: number | null
  max_price: number | null
  is_active: boolean
  last_executed_at: string | null
  created_at: string
  strategy: "dca" | "smart_dip" | "threshold"
  strategy_params: Record<string, any> | null
  estimated_share_price: number | null
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  category: string;
  target_date: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface Advisor {
  id: string
  name: string
  credentials: string
  firm: string
  bio: string
  specialties: string[]
  rating: number
  review_count: number
  location: string
  state: string
  phone: string | null
  email: string | null
  website: string | null
  military_experience: boolean
  branch: string | null
  accepts_tricare: boolean
  fee_structure: "Fee-Only" | "Fee-Based" | "Free / Non-Profit"
  virtual_available: boolean
  languages: string[]
  minimum_assets: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface AdvisorFilters {
  search?: string
  specialty?: string
  state?: string
  branch?: string
  feeType?: string
  militaryOnly?: boolean
  virtualOnly?: boolean
  tricareOnly?: boolean
  sortBy?: "rating" | "reviews" | "name"
  limit?: number
  offset?: number
}

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  symbol: string;
  qty?: string;
  notional?: string;
  side: string;
  type: string;
  time_in_force: string;
  status: string;
  submitted_at: string;
  filled_at?: string;
  filled_avg_price?: string;
  filled_qty?: string;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  qty: string;
  avg_entry_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price: string;
}

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  cash: string;
  portfolio_value: string;
  buying_power: string;
  equity: string;
}
