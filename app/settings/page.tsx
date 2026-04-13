"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NOTIFICATION_TYPE_LABELS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
  type NotificationType,
} from "@/lib/notifications"
import {
  User, Shield, Bell, Palette, Eye, Loader2, Save, CheckCircle2,
  AlertCircle, Lock, Mail, Trash2, Moon, Sun, Monitor, EyeClosed,
  Globe, Users, FileText, Search, Info, Phone, MapPin, Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import { useConnections, ConnectionsProvider } from "@/hooks/use-connections"
import { PrivacyLevel } from "@/lib/types"

// ─── Theme Helpers (exported for use in login / layout) ──────────────────────

/** Apply a theme value to the document */
export function applyTheme(theme: "light" | "dark" | "system") {
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.classList.toggle("dark", prefersDark)
  } else {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }
}

/** Load the user's theme from their profile and apply it */
export async function loadAndApplyUserTheme(userId?: string) {
  const supabase = createClient()

  // If no userId provided, get current user
  let uid = userId
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser()
    uid = user?.id
  }
  if (!uid) return "system"

  const { data } = await supabase
    .from("profiles")
    .select("theme")
    .eq("id", uid)
    .single()

  const theme = (data?.theme as "light" | "dark" | "system") || "system"
  applyTheme(theme)
  return theme
}

// ─── Tab Definitions ─────────────────────────────────────────────────────────

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy", icon: Eye },
] as const

type TabId = (typeof tabs)[number]["id"]

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
 
  return (
    <div className="bg-card border border-border rounded-xl p-6">
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
                  className={`flex items-start gap-3 w-full text-left p-3 rounded-lg border transition-all dark:border-slate-500/40 cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-primary/5"
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

export default function SettingsPage() {
  return (
    <ConnectionsProvider>
      <SettingsPageContent />
    </ConnectionsProvider>
  )
}

// ─── Settings Page ───────────────────────────────────────────────────────────

function SettingsPageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>("account")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Account state
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [emailChanging, setEmailChanging] = useState(false)
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const requiredText = "I want to delete my Milify account"
  const isMatch = confirmText === requiredText

  // Security state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  )
  const [notifsSaving, setNotifsSaving] = useState(false)
  const [notifsSaved, setNotifsSaved] = useState(false)

  // Appearance state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [themeSaving, setThemeSaving] = useState(false)
  const [themeSaved, setThemeSaved] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push("/")
  }, [authLoading, user, router])

  // Load user data
  useEffect(() => {
    if (!user) return
    setDisplayName(
      user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        ""
    )
    setEmail(user.email || "")
    setPhone(user.user_metadata?.phone || "")

    // Load theme from profile
    const loadTheme = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("theme")
        .eq("id", user.id)
        .single()
      if (data?.theme) {
        setTheme(data.theme as "light" | "dark" | "system")
        applyTheme(data.theme as "light" | "dark" | "system")
      }
    }
    loadTheme()

    // Load notification preferences
    getNotificationPreferences().then(setNotifPrefs)

    // Privacy settings are loaded via ConnectionsProvider / useConnections hook
  }, [user])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.refreshSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setEmail(session.user.email)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user?.email) {
          setEmail(session.user.email)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const showSaved = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }, [])

  // ── Auto-save theme to profiles table ──────────────────────
  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    applyTheme(newTheme)

    if (!user) return

    setThemeSaving(true)
    try {
      const supabase = createClient()
      await supabase
        .from("profiles")
        .update({ theme: newTheme, updated_at: new Date().toISOString() })
        .eq("id", user.id)
      setThemeSaved(true)
      setTimeout(() => setThemeSaved(false), 2000)
    } catch (err) {
      console.error("Failed to save theme:", err)
    } finally {
      setThemeSaving(false)
    }
  }

  // ── Save Account ───────────────────────────────────────────
  const saveAccount = async () => {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("display_name", displayName)
        .neq("id", user.id)
        .maybeSingle()

      if (existing) {
        alert("This Display Name is already taken!")
        return
      }

      await supabase.auth.updateUser({
        data: { display_name: displayName, full_name: displayName, phone },
      })
      await supabase
        .from("profiles")
        .update({ display_name: displayName, phone, updated_at: new Date().toISOString() })
        .eq("id", user.id)
      showSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  // ── Change Email ─────────────────────────────────────────
  const changeEmail = async () => {
    if (!user) return

    if (!newEmail.trim()) {
      setError("Please enter a new email address")
      return
    }
    if (newEmail === email) {
      setError("This is already your current email")
      return
    }
    setEmailChanging(true)
    setError(null)
    setEmailChangeSuccess(false)

    try {
      const supabase = createClient()
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newEmail)
        .neq("id", user.id)
        .maybeSingle()

      if (existing) {
        alert("This email is already associated with an account!")
        return
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      setEmailChangeSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update email")
    } finally {
      setEmailChanging(false)
    }
  }

  // ── Save Password ──────────────────────────────────────────
  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      showSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setSaving(false)
    }
  }

  // ── Save Notification Preferences ──────────────────────────

  const saveNotifPrefs = async (update: NotificationPreferences)=> {
    if (!user) return
    setNotifsSaving(true)
    setError(null)
    setNotifPrefs(update)

    try {
      await updateNotificationPreferences(update)
      setNotifsSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences")
    } finally {
      setNotifsSaving(false)
    }
  }

  // ── Delete Account ─────────────────────────────────────────

  const deleteAccount = async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user?.id }),
    })

    if (!res.ok) {
      throw new Error("Failed to delete account")
    }

    await supabase.auth.signOut()
    router.push("/")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account, preferences, and privacy
          </p>
        </div>

        {/* Success / Error */}
        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully
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

        <div className="flex flex-col md:flex-row gap-6">
          {/* ── Sidebar Tabs ────────────────────────────────────── */}
          <nav className="md:w-56 shrink-0">
            <div className="bg-card border border-border rounded-xl p-1.5 md:sticky md:top-20">
              {/* Mobile: horizontal scroll */}
              <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setError(null)
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-white hover:bg-accent"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* ── Content Area ────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* ════════ ACCOUNT TAB ════════ */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-5">
                    Account Information
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="s-name">Display Name</Label>
                      <Input
                        id="s-name"
                        className="dark:border-slate-500"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s-phone">Phone Number</Label>
                      <Input
                        id="s-phone"
                        type="tel"
                        value={phone}
                        className="dark:border-slate-500"
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="s-email">Email Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="s-email"
                          type="email"
                          value={newEmail || email}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="your-email@example.com"
                          className="flex-1 dark:border-slate-500"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={changeEmail}
                          disabled={emailChanging || (!newEmail.trim()) || newEmail === email}
                          className="shrink-0 self-start h-9 cursor-pointer"
                        >
                          {emailChanging ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4 mr-1" />
                          )}
                          Update Email
                        </Button>
                      </div>
                      {emailChangeSuccess ? (
                        <div className="flex items-start gap-2 text-sm text-green-600 max-w-full">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          
                          <p className="leading-snug break-words">
                            Confirmation links sent to{" "}
                            <strong className="break-all">{newEmail}</strong> and{" "}
                            <strong className="break-all">{email}</strong>.{" "}
                            Check your inboxes to complete the change.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          A confirmation link will be sent to the new and old addresses. Your email won&apos;t change until you click both links.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button onClick={saveAccount} className="cursor-pointer" disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-background border border-red-200 dark:border-red-900 rounded-xl p-6">
                  <h2 className="text-base font-semibold text-red-600 mb-2">
                    Danger Zone
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="cursor-pointer" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account, profile,
                          saved items, and all associated data. This action
                          cannot be undone.
                          <br /><br />
                          Please type <strong>{requiredText}</strong> to confirm.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type confirmation phrase..."
                        className="w-full mt-2 px-3 py-2 text-sm border rounded-md bg-background"
                      />

                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                          onClick={deleteAccount}
                          disabled={!isMatch}
                          className={`cursor-pointer ${
                            isMatch
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-red-300 cursor-not-allowed"
                          }`}
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* ════════ SECURITY TAB ════════ */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Change Password
                  </h2>
                  <div className="space-y-5 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="s-curpw">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="s-curpw"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          className="dark:border-slate-500"
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showCurrentPassword ? (
                            <EyeClosed className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s-newpw">New Password</Label>
                      <div className="relative">
                        <Input
                          id="s-newpw"
                          type={showNewPassword ? "text" : "password"}
                          className="dark:border-slate-500"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showNewPassword ? (
                            <EyeClosed className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s-confpw">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="s-confpw"
                          type={showConfirmPassword ? "text" : "password"}
                          className="dark:border-slate-500"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <EyeClosed className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button onClick={savePassword} disabled={saving || newPassword.length < 8 || newPassword !== confirmPassword} className="cursor-pointer">
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-1" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ NOTIFICATIONS TAB ════════ */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                {/* Global toggles */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-foreground">
                      Notification Delivery
                    </h2>
                    {notifsSaving && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Saving...
                      </span>
                    )}
                    {notifsSaved && !notifsSaving && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Saved
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Email Notifications
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notifPrefs.email_enabled}
                        className="dark:border-slate-500 cursor-pointer"
                        onCheckedChange={(v) =>
                          saveNotifPrefs({ ...notifPrefs, email_enabled: v })
                        }
                      />
                    </div>

                    {notifPrefs.email_enabled && (
                      <div className="ml-0 space-y-2">
                        <Label>Email Frequency</Label>
                        <Select
                          value={notifPrefs.email_frequency}
                          onValueChange={(v) =>
                            saveNotifPrefs({
                              ...notifPrefs,
                              email_frequency: v as "instant" | "daily" | "weekly",
                            })
                          }
                        >
                          <SelectTrigger className="w-48 cursor-pointer dark:border-slate-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">Instant</SelectItem>
                            <SelectItem value="daily">Daily Digest</SelectItem>
                            <SelectItem value="weekly">Weekly Summary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Push Notifications
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Browser push notifications for urgent updates
                        </p>
                      </div>
                      <Switch
                        checked={notifPrefs.push_enabled}
                        className="dark:border-slate-500 cursor-pointer"
                        onCheckedChange={(v) =>
                          saveNotifPrefs({ ...notifPrefs, push_enabled: v })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Per-type toggles */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-5">
                    Notification Categories
                  </h2>
                  <div className="space-y-4">
                    {(
                      Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]
                    ).map((type) => {
                      const info = NOTIFICATION_TYPE_LABELS[type]
                      const typePrefs = notifPrefs.types[type]
                      return (
                        <div
                          key={type}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-border dark:border-slate-500 last:border-0"
                        >
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${info.color}`}
                            >
                              {info.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {info.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                              <Switch
                                checked={typePrefs.enabled}
                                className="dark:border-slate-500 cursor-pointer"
                                onCheckedChange={(v) =>
                                  saveNotifPrefs({
                                    ...notifPrefs,
                                    types: {
                                      ...notifPrefs.types,
                                      [type]: { ...typePrefs, enabled: v },
                                    },
                                  })
                                }
                              />
                              In-app
                            </label>
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                              <Switch
                                checked={typePrefs.email}
                                className="dark:border-slate-500 cursor-pointer"
                                onCheckedChange={(v) =>
                                  saveNotifPrefs({
                                    ...notifPrefs,
                                    types: {
                                      ...notifPrefs.types,
                                      [type]: { ...typePrefs, email: v },
                                    },
                                  })
                                }
                                disabled={!notifPrefs.email_enabled}
                              />
                              Email
                            </label>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ════════ APPEARANCE TAB ════════ */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-foreground">
                      Theme
                    </h2>
                    {themeSaving && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Saving...
                      </span>
                    )}
                    {themeSaved && !themeSaving && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Saved
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        { value: "light", icon: Sun, label: "Light" },
                        { value: "dark", icon: Moon, label: "Dark" },
                        { value: "system", icon: Monitor, label: "System" },
                      ] as const
                    ).map((t) => {
                      const Icon = t.icon
                      return (
                        <button
                          key={t.value}
                          onClick={() => handleThemeChange(t.value)}
                          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer ${
                            theme === t.value
                              ? "border-primary bg-primary/5"
                              : "border-border dark:border-slate-500/30 hover:border-primary/60 dark:hover:border-primary/60"
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${
                              theme === t.value
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              theme === t.value
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {t.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ════════ PRIVACY TAB ════════ */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <PrivacySettingsPanel />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}