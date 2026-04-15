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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ConnectionsProvider } from "@/hooks/use-connections"
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

      <Footer />
    </div>
  )
}