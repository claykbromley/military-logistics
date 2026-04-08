"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { MILITARY_BRANCHES, MILITARY_STATUS, PAYGRADES } from "@/lib/types"
import {
  Mail, Phone, MapPin, Shield, ChevronRight,
  Camera, Save, Loader2, Award, Briefcase, Calendar,
  CheckCircle2, AlertCircle, Clock, ImagePlus,
  Globe, Users, Lock, FileText, Search, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useConnections, ConnectionsProvider } from "@/hooks/use-connections"
import { PrivacyLevel } from "@/lib/types"
import { ConnectionRequestsInbox } from "@/components/command-center/connection-components"
import { MemberSearchBar } from "@/components/member-search"

interface Profile {
  id: string
  display_name: string
  email: string
  phone: string
  military_branch: string
  service_status: string
  paygrade: string
  zip_code: string
  bio?: string
  duty_station?: string
  mos?: string
  years_of_service?: number
  avatar_url?: string
  banner_url?: string
  created_at?: string
  updated_at?: string
}

// ─── Image Upload Helper ─────────────────────────────────────────────────────

async function uploadImage(
  userId: string,
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  const supabase = createClient()

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error("Image must be under 5MB")
  }
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!validTypes.includes(file.type)) {
    throw new Error("Image must be JPEG, PNG, WebP, or GIF")
  }

  const ext = file.name.split(".").pop() || "jpg"
  const filePath = `${userId}/${path}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: "3600", upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return `${data.publicUrl}?t=${Date.now()}`
}

function formatPhone(input: string | number): string | null {
  if (input === null || input === undefined) return null;
  let digits = String(input).replace(/\D/g, "");
  if (digits.length < 10) return null;

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  const countryCodeLength = digits.length - 10;
  const countryCode = digits.slice(0, countryCodeLength);
  const rest = digits.slice(countryCodeLength);

  return `+${countryCode} (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
}

// ─── Privacy Settings ─────────────────────────────────────────────────────
 
const PRIVACY_LEVELS: {
  value: PrivacyLevel
  label: string
  description: string
  icon: React.ElementType
}[] = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can view your profile and send you messages",
    icon: Globe,
  },
  {
    value: "connections_only",
    label: "Connections Only",
    description: "Only your connections can view your full profile and message you",
    icon: Users,
  },
  {
    value: "private",
    label: "Private",
    description: "Nobody can view your profile. People must request a connection first",
    icon: Lock,
  },
]
 
export function PrivacySettingsPanel() {
  const {
    privacySettings,
    updatePrivacySettings,
    savingPrivacy,
  } = useConnections()
 
  const [saved, setSaved] = useState(false)
 
  const handleUpdate = async (updates: Parameters<typeof updatePrivacySettings>[0]) => {
    await updatePrivacySettings(updates)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
 
  const isRestricted = privacySettings.privacyLevel !== "public"
 
  return (
    <div className="bg-background border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Privacy Settings
        </h3>
        {savingPrivacy && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        )}
        {saved && !savingPrivacy && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>
 
      {/* Privacy Level Selector */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Profile Visibility</Label>
          <div className="grid gap-2">
            {PRIVACY_LEVELS.map((level) => {
              const Icon = level.icon
              const isActive = privacySettings.privacyLevel === level.value
              return (
                <button
                  key={level.value}
                  onClick={() => handleUpdate({ privacyLevel: level.value })}
                  className={`flex items-start gap-3 w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`mt-0.5 rounded-full p-1.5 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-foreground"}`}>
                      {level.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {level.description}
                    </p>
                  </div>
                  {isActive && (
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
 
        {/* Granular visibility toggles — only relevant for connections_only */}
        {privacySettings.privacyLevel === "connections_only" && (
          <div className="pt-4 border-t space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Non-connections will always see your name, branch, and paygrade.
                Control what else they can see below.
              </p>
            </div>
 
            <TooltipProvider>
              {[
                {
                  key: "showEmail" as const,
                  label: "Email Address",
                  icon: Mail,
                  tip: "Show your email to people who aren't connected with you",
                },
                {
                  key: "showPhone" as const,
                  label: "Phone Number",
                  icon: Phone,
                  tip: "Show your phone number to non-connections",
                },
                {
                  key: "showBio" as const,
                  label: "Bio",
                  icon: FileText,
                  tip: "Show your bio to non-connections",
                },
                {
                  key: "showDutyStation" as const,
                  label: "Duty Station",
                  icon: MapPin,
                  tip: "Show your duty station to non-connections",
                },
                {
                  key: "showMos" as const,
                  label: "MOS / Rate / AFSC",
                  icon: Award,
                  tip: "Show your MOS to non-connections",
                },
                {
                  key: "showInSearch" as const,
                  label: "Appear in Member Search",
                  icon: Search,
                  tip: "Allow non-connections to find you when searching members",
                },
              ].map(({ key, label, icon: ItemIcon, tip }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 px-1"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2.5 cursor-help">
                        <ItemIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p className="text-xs max-w-[200px]">{tip}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Switch
                    checked={privacySettings[key]}
                    onCheckedChange={(checked) => handleUpdate({ [key]: checked })}
                  />
                </div>
              ))}
            </TooltipProvider>
          </div>
        )}
 
        {/* Private mode note */}
        {privacySettings.privacyLevel === "private" && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-200">
            <strong>Private mode:</strong> Other members will only see your
            display name and a prompt to request a connection. No profile details,
            contact info, or service details will be visible. You must accept
            connection requests before others can message you or view your profile.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Wrapper with ConnectionsProvider ────────────────────────────────────────

export default function ProfilePage() {
  return (
    <ConnectionsProvider>
      <ProfilePageContent />
    </ConnectionsProvider>
  )
}

// ─── Profile Page Content ────────────────────────────────────────────────────

function ProfilePageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Email change state
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    military_branch: "",
    service_status: "",
    paygrade: "",
    zip_code: "",
    bio: "",
    duty_station: "",
    mos: "",
    years_of_service: "",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return

    async function fetchProfile() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        setProfile({
          id: user!.id,
          display_name: user!.user_metadata?.display_name || user!.user_metadata?.full_name || "",
          email: user!.email || "",
          phone: user!.user_metadata?.phone || "",
          military_branch: user!.user_metadata?.military_branch || "",
          service_status: user!.user_metadata?.service_status || "",
          paygrade: user!.user_metadata?.paygrade || "",
          zip_code: user!.user_metadata?.zip_code || "",
        })
      } else {
        setProfile(data as Profile)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user])

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        phone: profile.phone || "",
        military_branch: profile.military_branch || "",
        service_status: profile.service_status || "",
        paygrade: profile.paygrade || "",
        zip_code: profile.zip_code || "",
        bio: profile.bio || "",
        duty_station: profile.duty_station || "",
        mos: profile.mos || "",
        years_of_service: profile.years_of_service?.toString() || "",
      })
    }
  }, [profile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    setError(null)

    try {
      const url = await uploadImage(user.id, file, "avatars", "avatar")

      const supabase = createClient()
      const {error} = await supabase
        .from("profiles")
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq("id", user.id)
      console.log(error)

      await supabase.auth.updateUser({ data: { avatar_url: url } })

      setProfile((prev) => prev ? { ...prev, avatar_url: url } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar")
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingBanner(true)
    setError(null)

    try {
      const url = await uploadImage(user.id, file, "banners", "banner")

      const supabase = createClient()
      await supabase
        .from("profiles")
        .update({ banner_url: url, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      setProfile((prev) => prev ? { ...prev, banner_url: url } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload banner")
    } finally {
      setUploadingBanner(false)
      if (bannerInputRef.current) bannerInputRef.current.value = ""
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      setEmailError("Please enter a new email address")
      return
    }
    if (newEmail === profile?.email) {
      setEmailError("This is already your current email")
      return
    }

    setEmailSaving(true)
    setEmailError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      setEmailSuccess(true)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to update email")
    } finally {
      setEmailSaving(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const updateData: Partial<Profile> = {
        id: user.id,
        display_name: form.display_name,
        email: user.email,
        phone: form.phone,
        military_branch: form.military_branch,
        service_status: form.service_status,
        paygrade: form.paygrade,
        zip_code: form.zip_code,
        bio: form.bio,
        duty_station: form.duty_station,
        mos: form.mos,
        years_of_service: form.years_of_service ? parseInt(form.years_of_service) : undefined,
        updated_at: new Date().toISOString(),
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("display_name", form.display_name)
        .neq("id", user.id)
        .maybeSingle()

      if (existing) {
        alert("This Display Name is already taken!")
        return
      }
     
      const { error } = await supabase.from("profiles").upsert(updateData)
      if (error) throw error

      await supabase.auth.updateUser({
        data: {
          display_name: form.display_name,
          full_name: form.display_name,
          phone: form.phone,
          military_branch: form.military_branch,
          service_status: form.service_status,
          paygrade: form.paygrade,
          zip_code: form.zip_code,
        },
      })

      setProfile((prev) => prev ? { ...prev, ...updateData } : null)
      setIsEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || !profile) return null

  const initials = (profile.display_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const branchLabel = MILITARY_BRANCHES.find(
    (b) => b.value === profile.military_branch
  )?.label
  const statusLabel = MILITARY_STATUS.find(
    (s) => s.value === profile.service_status
  )?.label
  const paygradeLabel = PAYGRADES.find(
    (p) => p.value === profile.paygrade
  )?.label

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hidden file inputs */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleBannerUpload}
        />

        {/* ── Profile Header Card ─────────────────────────────────── */}
        <div className="bg-background border border-border rounded-xl overflow-hidden mb-6">
          <div
            className="h-36 sm:h-44 relative group cursor-pointer"
            onClick={() => bannerInputRef.current?.click()}
          >
            {profile.banner_url ? (
              <img
                src={profile.banner_url}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5">
                <div className="absolute inset-0 opacity-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white text-sm font-medium bg-black/60 rounded-lg px-4 py-2">
                {uploadingBanner ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {uploadingBanner ? "Uploading..." : "Change Banner"}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 -mt-9 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="h-24 w-24 rounded-2xl border-4 border-background object-cover shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-primary border-4 border-background flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center border-4 border-transparent">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingAvatar ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 sm:pb-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.display_name || "Service Member"}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  {branchLabel && (
                    <span className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" />
                      {branchLabel}
                    </span>
                  )}
                  {paygradeLabel && (
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {paygradeLabel}
                    </span>
                  )}
                  {statusLabel && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {statusLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="cursor-pointer">
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success / Error banners */}
        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Profile updated successfully
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* ── Left Column: Contact & Quick Info ────────────────── */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-background border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{profile.email}</span>
                  <button
                    onClick={() => {
                      setNewEmail("")
                      setEmailSuccess(false)
                      setEmailError(null)
                      setShowEmailDialog(true)
                    }}
                    className="text-primary hover:underline text-xs shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{formatPhone(profile.phone) || "Not set"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{profile.zip_code || "Not set"}</span>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-background border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Service Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch</span>
                  <span className="font-medium text-foreground">
                    {branchLabel || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-foreground">
                    {statusLabel || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paygrade</span>
                  <span className="font-medium text-foreground">
                    {paygradeLabel || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MOS/Rate</span>
                  <span className="font-medium text-foreground">
                    {profile.mos || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duty Station</span>
                  <span className="font-medium text-foreground">
                    {profile.duty_station || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Years of Service</span>
                  <span className="font-medium text-foreground">
                    {profile.years_of_service ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Requests Inbox — NEW */}
            <ConnectionRequestsInbox />

            {/* Quick Links */}
            <div className="bg-background border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Quick Links
              </h3>
              <MemberSearchBar className="mb-3" />
              <div className="space-y-1">
                {[
                  { label: "Account Settings", url: "/settings" },
                  { label: "Notifications", url: "/notifications" },
                ].map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    className="flex items-center justify-between px-2 py-2 text-sm text-muted-foreground hover:text-white hover:bg-accent rounded-lg transition-colors"
                  >
                    {link.label}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column: Edit Form / Bio ───────────────────── */}
          <div className="md:col-span-2 space-y-6">
            {isEditing ? (
              <>
                {/* Personal Information */}
                <div className="bg-background border border-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-foreground mb-5">
                    Personal Information
                  </h3>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={form.display_name}
                        onChange={(e) =>
                          setForm({ ...form, display_name: e.target.value })
                        }
                        placeholder="Your display name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip_code">Zip Code</Label>
                      <Input
                        id="zip_code"
                        value={form.zip_code}
                        onChange={(e) =>
                          setForm({ ...form, zip_code: e.target.value })
                        }
                        placeholder="12345"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duty_station">Duty Station</Label>
                      <Input
                        id="duty_station"
                        value={form.duty_station}
                        onChange={(e) =>
                          setForm({ ...form, duty_station: e.target.value })
                        }
                        placeholder="e.g. Fort Liberty, NC"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={form.bio}
                        onChange={(e) =>
                          setForm({ ...form, bio: e.target.value })
                        }
                        placeholder="Tell other service members about yourself..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Military Information */}
                <div className="bg-background border border-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-foreground mb-5">
                    Military Information
                  </h3>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Branch of Service</Label>
                      <Select
                        value={form.military_branch}
                        onValueChange={(v) =>
                          setForm({ ...form, military_branch: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {MILITARY_BRANCHES.map((b) => (
                            <SelectItem key={b.value} value={b.value}>
                              {b.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Service Status</Label>
                      <Select
                        value={form.service_status}
                        onValueChange={(v) =>
                          setForm({ ...form, service_status: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {MILITARY_STATUS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Paygrade</Label>
                      <Select
                        value={form.paygrade}
                        onValueChange={(v) =>
                          setForm({ ...form, paygrade: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select paygrade" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYGRADES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mos">MOS / Rate / AFSC</Label>
                      <Input
                        id="mos"
                        value={form.mos}
                        onChange={(e) =>
                          setForm({ ...form, mos: e.target.value })
                        }
                        placeholder="e.g. 11B, OS, 1N0X1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yos">Years of Service</Label>
                      <Input
                        id="yos"
                        type="number"
                        min={0}
                        max={50}
                        value={form.years_of_service}
                        onChange={(e) =>
                          setForm({ ...form, years_of_service: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy Settings — NEW */}
                <PrivacySettingsPanel />
              </>
            ) : (
              <>
                {/* Bio display */}
                <div className="bg-background border border-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    About
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile.bio || "No bio yet. Click Edit Profile to add one."}
                  </p>
                </div>

                {/* Privacy Settings — always visible, even outside edit mode — NEW */}
                <PrivacySettingsPanel />

                {/* Activity / Timestamps */}
                <div className="bg-background border border-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-foreground mb-4">
                    Account Activity
                  </h3>
                  <div className="space-y-3 text-sm">
                    {profile.created_at &&
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                      </div>
                    }
                    {profile.updated_at && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>
                          Last updated{" "}
                          {new Date(profile.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Email Change Dialog ───────────────────────────────── */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
          </DialogHeader>

          {emailSuccess ? (
            <div className="py-4">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Confirmation email sent
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    We sent a confirmation link to <strong>{newEmail}</strong>.
                    Click the link in that email to confirm the change. You may
                    also need to confirm from your current email address.
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button onClick={() => setShowEmailDialog(false)}>
                  Got it
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  A confirmation link will be sent to your new email address.
                  Your email won&apos;t change until you click that link.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input
                    id="current-email"
                    value={profile?.email || ""}
                    disabled
                    className="opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email Address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="your-new-email@example.com"
                  />
                </div>
                {emailError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {emailError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setShowEmailDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEmailChange} disabled={emailSaving || !newEmail} className="cursor-pointer">
                  {emailSaving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-1" />
                  )}
                  Send Confirmation
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}