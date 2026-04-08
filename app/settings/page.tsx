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
  AlertCircle, Lock, Mail, Trash2, Moon, Sun, Monitor, ChevronRight,
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

// ─── Tab Definitions ─────────────────────────────────────────────────────────

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy", icon: Eye },
] as const

type TabId = (typeof tabs)[number]["id"]

// ─── Settings Page ───────────────────────────────────────────────────────────

export default function SettingsPage() {
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

  // Security state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  )

  // Appearance state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [compactMode, setCompactMode] = useState(false)

  // Privacy state
  const [profileVisible, setProfileVisible] = useState(true)
  const [showPaygrade, setShowPaygrade] = useState(false)
  const [showLocation, setShowLocation] = useState(true)
  const [activityVisible, setActivityVisible] = useState(true)

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

    // Load theme
    const stored = localStorage.getItem("milify-theme")
    if (stored === "dark") setTheme("dark")
    else if (stored === "light") setTheme("light")
    else setTheme("system")

    // Load notification preferences
    getNotificationPreferences().then(setNotifPrefs)

    // Load privacy settings from profile
    const supabase = createClient()
    supabase
      .from("profiles")
      .select("privacy_settings")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.privacy_settings) {
          const ps = data.privacy_settings
          setProfileVisible(ps.profile_visible ?? true)
          setShowPaygrade(ps.show_paygrade ?? false)
          setShowLocation(ps.show_location ?? true)
          setActivityVisible(ps.activity_visible ?? true)
        }
      })
  }, [user])

  const showSaved = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }, [])

  // ── Save Account ───────────────────────────────────────────
  const saveAccount = async () => {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
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
  const saveNotifPrefs = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateNotificationPreferences(notifPrefs)
      showSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  // ── Save Appearance ────────────────────────────────────────
  const saveAppearance = () => {
    if (theme === "system") {
      localStorage.removeItem("milify-theme")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", prefersDark)
    } else {
      localStorage.setItem("milify-theme", theme)
      document.documentElement.classList.toggle("dark", theme === "dark")
    }
    showSaved()
  }

  // ── Save Privacy ───────────────────────────────────────────
  const savePrivacy = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      await supabase
        .from("profiles")
        .update({
          privacy_settings: {
            profile_visible: profileVisible,
            show_paygrade: showPaygrade,
            show_location: showLocation,
            activity_visible: activityVisible,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
      showSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save privacy settings")
    } finally {
      setSaving(false)
    }
  }

  // ── Delete Account ─────────────────────────────────────────
  const deleteAccount = async () => {
    // In production, this should call a server-side function
    // that uses the service role key to delete the user
    alert("Account deletion requires server-side processing. Contact support.")
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
    <div className="min-h-screen bg-muted/30">
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
            <div className="bg-background border border-border rounded-xl p-1.5 md:sticky md:top-20">
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
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
                <div className="bg-background border border-border rounded-xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-5">
                    Account Information
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="s-name">Display Name</Label>
                      <Input
                        id="s-name"
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
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={changeEmail}
                          disabled={emailChanging || (!newEmail.trim()) || newEmail === email}
                          className="shrink-0 self-start h-9"
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
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          Confirmation link sent to <strong>{newEmail}</strong>. Check your inbox to complete the change.
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          A confirmation link will be sent to the new address. Your email won&apos;t change until you click it.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button onClick={saveAccount} disabled={saving}>
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
                      <Button variant="destructive" size="sm">
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
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteAccount}
                          className="bg-red-600 hover:bg-red-700"
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
                <div className="bg-background border border-border rounded-xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Change Password
                  </h2>
                  <div className="space-y-5 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="s-curpw">Current Password</Label>
                      <Input
                        id="s-curpw"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s-newpw">New Password</Label>
                      <Input
                        id="s-newpw"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s-confpw">Confirm New Password</Label>
                      <Input
                        id="s-confpw"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button onClick={savePassword} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-1" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="bg-background border border-border rounded-xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account with 2FA.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            )}

            {/* ════════ NOTIFICATIONS TAB ════════ */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                {/* Global toggles */}
                <div className="bg-background border border-border rounded-xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-5">
                    Notification Delivery
                  </h2>
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
                        onCheckedChange={(v) =>
                          setNotifPrefs({ ...notifPrefs, email_enabled: v })
                        }
                      />
                    </div>

                    {notifPrefs.email_enabled && (
                      <div className="ml-0 space-y-2">
                        <Label>Email Frequency</Label>
                        <Select
                          value={notifPrefs.email_frequency}
                          onValueChange={(v) =>
                            setNotifPrefs({
                              ...notifPrefs,
                              email_frequency: v as "instant" | "daily" | "weekly",
                            })
                          }
                        >
                          <SelectTrigger className="w-48">
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
                        onCheckedChange={(v) =>
                          setNotifPrefs({ ...notifPrefs, push_enabled: v })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Per-type toggles */}
                <div className="bg-background border border-border rounded-xl p-6">
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
                          className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-border last:border-0"
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
                                onCheckedChange={(v) =>
                                  setNotifPrefs({
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
                                onCheckedChange={(v) =>
                                  setNotifPrefs({
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

                <div className="flex justify-end">
                  <Button onClick={saveNotifPrefs} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save Notification Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* ════════ APPEARANCE TAB ════════ */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="bg-background border border-border rounded-xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-5">
                    Theme
                  </h2>
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
                          onClick={() => setTheme(t.value)}
                          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer ${
                            theme === t.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
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

                <div className="bg-background border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Compact Mode
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reduce spacing and padding for denser information display
                      </p>
                    </div>
                    <Switch
                      checked={compactMode}
                      onCheckedChange={setCompactMode}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveAppearance}>
                    <Save className="h-4 w-4 mr-1" />
                    Apply Theme
                  </Button>
                </div>
              </div>
            )}

            {/* ════════ PRIVACY TAB ════════ */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div className="bg-background border border-border rounded-xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-5">
                    Profile Visibility
                  </h2>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Public Profile
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Allow other service members to find and view your profile
                        </p>
                      </div>
                      <Switch
                        checked={profileVisible}
                        onCheckedChange={setProfileVisible}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Show Paygrade
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Display your paygrade on your public profile
                        </p>
                      </div>
                      <Switch
                        checked={showPaygrade}
                        onCheckedChange={setShowPaygrade}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Show Location
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Display your duty station / zip code area
                        </p>
                      </div>
                      <Switch
                        checked={showLocation}
                        onCheckedChange={setShowLocation}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Activity Visibility
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Show your forum posts and marketplace activity on your profile
                        </p>
                      </div>
                      <Switch
                        checked={activityVisible}
                        onCheckedChange={setActivityVisible}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={savePrivacy} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save Privacy Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}