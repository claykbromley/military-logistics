"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Users, Plus, ArrowLeft, Phone, Mail, Shield, AlertTriangle, ChevronDown, Trash2, Edit,
  Key, FileText, MapPin, Star, StarOff, GripVertical, Download, MessageSquare, Calendar, Video,
  Clock, Send, CalendarPlus, History, RefreshCw, UserPlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useCommunicationHub, CommunicationHubProvider } from "@/hooks/use-communication-hub"
import { Contact, SharedContact } from "@/lib/types"
import { format, formatDistanceToNow } from "date-fns"

// ============================================
// HELPER FUNCTIONS
// ============================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ============================================
// CONTACT CARD COMPONENT
// ============================================

function EmergencyContactCard({
  contact,
  onEdit,
  onDelete,
  onToggleRole,
  onScheduleCall,
  onSendMessage,
  showPriority = false,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  recentActivity,
}: {
  contact: Contact
  onEdit?: () => void
  onDelete?: () => void
  onToggleRole?: (role: "emergency" | "poa" | "accounts") => void
  onScheduleCall?: () => void
  onSendMessage?: () => void
  showPriority?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
  recentActivity?: { type: string; date: string } | null
}) {
  const roles = []
  if (contact.isEmergencyContact) roles.push("Emergency Contact")
  if (contact.isPoaHolder) roles.push("POA Holder")
  if (contact.canAccessAccounts) roles.push("Account Access")

  return (
    <div className="bg-card border rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {showPriority && contact.isEmergencyContact && (
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-xs text-muted-foreground text-center font-mono bg-muted px-2 py-0.5 rounded">
                  #{contact.priority}
                </span>
              </div>
            )}
            <Avatar className="w-12 h-12">
              <AvatarFallback
                className={`text-sm font-medium ${
                  contact.isEmergencyContact
                    ? "bg-gradient-to-br from-red-500 to-orange-500 text-white"
                    : contact.isPoaHolder
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                    : "bg-gradient-to-br from-slate-400 to-slate-500 text-white"
                }`}
              >
                {getInitials(contact.contactName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{contact.contactName}</h3>
              </div>
              {contact.relationship && (
                <p className="text-sm text-muted-foreground">{contact.relationship}</p>
              )}
              {recentActivity && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last {recentActivity.type}:{" "}
                  {formatDistanceToNow(new Date(recentActivity.date), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
          {onEdit && onDelete && onToggleRole && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Contact
                </DropdownMenuItem>
                {showPriority && contact.isEmergencyContact && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onMoveUp} disabled={isFirst}>
                      <GripVertical className="w-4 h-4 mr-2" />
                      Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onMoveDown} disabled={isLast}>
                      <GripVertical className="w-4 h-4 mr-2" />
                      Move Down
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleRole("emergency")}>
                  {contact.isEmergencyContact ? (
                    <StarOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Star className="w-4 h-4 mr-2" />
                  )}
                  {contact.isEmergencyContact ? "Remove from" : "Add as"} Emergency
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleRole("poa")}>
                  <Shield className="w-4 h-4 mr-2" />
                  {contact.isPoaHolder ? "Remove" : "Designate as"} POA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleRole("accounts")}>
                  <Key className="w-4 h-4 mr-2" />
                  {contact.canAccessAccounts ? "Revoke" : "Grant"} Account Access
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Roles */}
        {roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {contact.isEmergencyContact && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Emergency
              </Badge>
            )}
            {contact.isPoaHolder && (
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                POA
              </Badge>
            )}
            {contact.canAccessAccounts && (
              <Badge variant="secondary" className="text-xs">
                <Key className="w-3 h-3 mr-1" />
                Accounts
              </Badge>
            )}
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-4 space-y-2">
          {contact.phonePrimary && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a
                href={`tel:${contact.phonePrimary}`}
                className="text-foreground hover:text-indigo-600 transition-colors"
              >
                {contact.phonePrimary}
              </a>
              {contact.phoneSecondary && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <a
                    href={`tel:${contact.phoneSecondary}`}
                    className="text-foreground hover:text-indigo-600 transition-colors"
                  >
                    {contact.phoneSecondary}
                  </a>
                </>
              )}
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a
                href={`mailto:${contact.email}`}
                className="text-foreground hover:text-indigo-600 transition-colors"
              >
                {contact.email}
              </a>
            </div>
          )}
          {contact.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-foreground">{contact.address}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {contact.notes && (
          <p className="mt-3 text-sm text-muted-foreground border-t pt-3">{contact.notes}</p>
        )}

        {/* Quick Actions */}
        {(onScheduleCall || onSendMessage) && contact.email && (
          <div className="mt-4 pt-3 border-t flex gap-2">
            {onScheduleCall && (
              <Button variant="outline" size="sm" className="flex-1" onClick={onScheduleCall}>
                <CalendarPlus className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            )}
            {onSendMessage && (
              <Button variant="outline" size="sm" className="flex-1" onClick={onSendMessage}>
                <Send className="w-4 h-4 mr-2" />
                Message
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// SHARED CONTACT CARD COMPONENT
// ============================================

function SharedContactCard({
  sharedContact,
  onEdit,
  onAddToContacts,
}: {
  sharedContact: SharedContact
  onEdit: () => void
  onAddToContacts: () => void
}) {
  const displayName = sharedContact.localDisplayName || sharedContact.ownerDisplayName || sharedContact.ownerEmail.split("@")[0]
  const displayRelationship = sharedContact.localRelationship || "Listed you as contact"

  return (
    <div className="bg-card border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden hover:shadow-md transition-all">
      <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
            Listed you as their emergency contact
          </span>
          {sharedContact.addedToContacts && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
              Added to contacts
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-medium">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{displayRelationship}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {sharedContact.ownerEmail}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Display Name
              </DropdownMenuItem>
              {!sharedContact.addedToContacts && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onAddToContacts}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add to My Contacts
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* What they listed */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-2">Their listing info:</p>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {sharedContact.contactName}</p>
            {sharedContact.relationship && (
              <p><span className="text-muted-foreground">Relationship:</span> {sharedContact.relationship}</p>
            )}
            {sharedContact.phone && (
              <p><span className="text-muted-foreground">Phone:</span> {sharedContact.phone}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        {sharedContact.ownerPhone && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a
                href={`tel:${sharedContact.ownerPhone}`}
                className="text-foreground hover:text-indigo-600 transition-colors"
              >
                {sharedContact.ownerPhone}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// EDIT SHARED CONTACT DIALOG
// ============================================

function EditSharedContactDialog({
  open,
  onOpenChange,
  sharedContact,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sharedContact: SharedContact | null
  onSave: (displayName: string, relationship: string) => void
}) {
  const [displayName, setDisplayName] = useState("")
  const [relationship, setRelationship] = useState("")

  useEffect(() => {
    if (sharedContact && open) {
      setDisplayName(sharedContact.localDisplayName || sharedContact.ownerDisplayName || "")
      setRelationship(sharedContact.localRelationship || "")
    }
  }, [sharedContact, open])

  const handleSave = () => {
    onSave(displayName.trim(), relationship.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Contact Display</DialogTitle>
          <DialogDescription>
            Customize how this person appears in your shared contacts list
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={sharedContact?.ownerEmail.split("@")[0]}
            />
            <p className="text-xs text-muted-foreground">
              Original: {sharedContact?.ownerDisplayName || sharedContact?.ownerEmail}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Your Relationship to Them</Label>
            <Input
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g., Friend, Family member, Colleague"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// ADD/EDIT CONTACT DIALOG
// ============================================

function AddEmergencyContactDialog({
  open,
  onOpenChange,
  onSave,
  editingContact,
  nextPriority,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => void
  editingContact?: Contact | null
  nextPriority: number
}) {
  const [name, setName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [phonePrimary, setPhonePrimary] = useState("")
  const [phoneSecondary, setPhoneSecondary] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [isEmergencyContact, setIsEmergencyContact] = useState(false)
  const [isPoaHolder, setIsPoaHolder] = useState(false)
  const [canAccessAccounts, setCanAccessAccounts] = useState(false)

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.contactName || "")
      setRelationship(editingContact.relationship || "")
      setPhonePrimary(editingContact.phonePrimary || "")
      setPhoneSecondary(editingContact.phoneSecondary || "")
      setEmail(editingContact.email || "")
      setAddress(editingContact.address || "")
      setNotes(editingContact.notes || "")
      setIsEmergencyContact(editingContact.isEmergencyContact || false)
      setIsPoaHolder(editingContact.isPoaHolder || false)
      setCanAccessAccounts(editingContact.canAccessAccounts || false)
    } else {
      setName("")
      setRelationship("")
      setPhonePrimary("")
      setPhoneSecondary("")
      setEmail("")
      setAddress("")
      setNotes("")
      setIsEmergencyContact(false)
      setIsPoaHolder(false)
      setCanAccessAccounts(false)
    }
  }, [editingContact, open])

  const handleSave = () => {
    if (!name.trim()) return

    let role: Contact["role"] = "other"
    if (isEmergencyContact) role = "primary"
    else if (canAccessAccounts) role = "financial"
    else if (isPoaHolder) role = "legal"

    // For new emergency contacts, use next priority; for existing, keep current
    const priority = editingContact
      ? editingContact.priority
      : isEmergencyContact
      ? nextPriority
      : 0

    onSave({
      contactName: name.trim(),
      relationship: relationship.trim() || undefined,
      phonePrimary: phonePrimary.trim() || undefined,
      phoneSecondary: phoneSecondary.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      isEmergencyContact,
      isPoaHolder,
      canAccessAccounts,
      role,
      priority,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            {editingContact ? "Edit Contact" : "Add Emergency Contact"}
          </DialogTitle>
          <DialogDescription>
            Add someone who can be contacted or take action on your behalf.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Spouse, Parent, Attorney"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone1">Primary Phone</Label>
              <Input
                id="phone1"
                type="tel"
                value={phonePrimary}
                onChange={(e) => setPhonePrimary(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone2">Secondary Phone</Label>
              <Input
                id="phone2"
                type="tel"
                value={phoneSecondary}
                onChange={(e) => setPhoneSecondary(e.target.value)}
                placeholder="(555) 765-4321"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
            <p className="text-xs text-muted-foreground">
              Required for scheduling events and sending messages
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State ZIP"
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Roles & Permissions</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="emergency"
                  checked={isEmergencyContact}
                  onCheckedChange={(checked) => setIsEmergencyContact(checked === true)}
                />
                <div>
                  <label htmlFor="emergency" className="text-sm font-medium cursor-pointer">
                    Emergency Contact
                  </label>
                  <p className="text-xs text-muted-foreground">
                    First person to call in case of emergency
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="poa"
                  checked={isPoaHolder}
                  onCheckedChange={(checked) => setIsPoaHolder(checked === true)}
                />
                <div>
                  <label htmlFor="poa" className="text-sm font-medium cursor-pointer">
                    Power of Attorney Holder
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Has legal authority to act on your behalf
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="accounts"
                  checked={canAccessAccounts}
                  onCheckedChange={(checked) => setCanAccessAccounts(checked === true)}
                />
                <div>
                  <label htmlFor="accounts" className="text-sm font-medium cursor-pointer">
                    Financial Account Access
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Can access and manage your financial accounts
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specific instructions, best contact times, etc."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {editingContact ? "Save Changes" : "Add Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// QUICK SCHEDULE DIALOG
// ============================================

function QuickScheduleDialog({
  open,
  onOpenChange,
  contact,
  onSchedule,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  onSchedule: (
    title: string,
    eventType: "call" | "video",
    startTime: string,
    duration: number
  ) => void
}) {
  const [title, setTitle] = useState("")
  const [eventType, setEventType] = useState<"call" | "video">("call")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("30")

  useEffect(() => {
    if (open && contact) {
      setTitle(`Call with ${contact.contactName}`)
      const now = new Date()
      now.setHours(now.getHours() + 1, 0, 0, 0)
      setDate(format(now, "yyyy-MM-dd"))
      setTime(format(now, "HH:mm"))
    }
  }, [open, contact])

  const handleSchedule = () => {
    if (!title || !date || !time) return
    const startTime = new Date(`${date}T${time}`).toISOString()
    onSchedule(title, eventType, startTime, parseInt(duration))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-indigo-500" />
            Quick Schedule
          </DialogTitle>
          <DialogDescription>
            Schedule a call with {contact?.contactName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Call title"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={eventType === "call" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setEventType("call")}
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone Call
            </Button>
            <Button
              type="button"
              variant={eventType === "video" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setEventType("video")}
            >
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!title || !date || !time}>
            <CalendarPlus className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// QUICK MESSAGE DIALOG
// ============================================

function QuickMessageDialog({
  open,
  onOpenChange,
  contact,
  onSend,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  onSend: (subject: string, message: string, attachedFiles: File[]) => void
}) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  

  useEffect(() => {
    if (open) {
      setSubject("")
      setMessage("")
    }
  }, [open])

  const handleSend = () => {
    if (!message.trim()) return
    onSend(subject.trim(), message.trim(), attachedFiles)
    onOpenChange(false)
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-500" />
            Send Message
          </DialogTitle>
          <DialogDescription>Send a message to {contact?.contactName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
            />
          </div>
        </div>

        <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilesSelected} />

        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachedFiles.map((file, i) => (
              <div key={i} className="relative border rounded-lg p-2 bg-muted text-xs flex items-center gap-2">
                {file.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(file)} className="h-12 w-12 object-cover rounded" />
                ) : (
                  <span className="truncate max-w-[120px]">{file.name}</span>
                )}
                <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-black text-white rounded-full w-4 h-4 text-[10px]">✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <Button className="mb-2 cursor-pointer" type="button" onClick={handleFileClick}>
            <Plus className="w-4 h-4 mr-1" />
            Upload Attachment
          </Button>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!message.trim() && attachedFiles.length === 0}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function EmergencyContactsPage() {
  return (
    <CommunicationHubProvider>
      <EmergencyContactsPageContent />
    </CommunicationHubProvider>
  )
}

function EmergencyContactsPageContent() {
  const {
    contacts,
    sharedContacts,
    communicationLog,
    scheduledEvents,
    messageThreads,
    isLoaded,
    isSyncing,
    addContact,
    updateContact,
    deleteContact,
    updateSharedContactLocal,
    addSharedContactToMyContacts,
    refreshSharedContacts,
    createEvent,
    createThread,
    sendMessage,
    getEmergencyContacts,
    getPoaHolders,
    reorderEmergencyPriorities,
    exportToPDF,
  } = useCommunicationHub()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Shared contact editing
  const [editingSharedContact, setEditingSharedContact] = useState<SharedContact | null>(null)
  const [isEditSharedDialogOpen, setIsEditSharedDialogOpen] = useState(false)

  // Quick action dialogs
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const emergencyContacts = getEmergencyContacts().sort((a, b) => (a.priority || 0) - (b.priority || 0))
  const poaHolders = getPoaHolders()
  const accountAccessContacts = contacts.filter((c) => c.canAccessAccounts)

  // Calculate next priority for new emergency contacts
  const nextEmergencyPriority = emergencyContacts.length > 0
    ? Math.max(...emergencyContacts.map(c => c.priority || 0)) + 1
    : 1

  // Get recent activity for each contact
  const getRecentActivity = (contactId: string) => {
    const logs = communicationLog.filter((l) => l.contactId === contactId)
    const events = scheduledEvents.filter((e) =>
      e.invitations.some((i) => i.contactId === contactId)
    )
    const threads = messageThreads.filter((t) => t.contactId === contactId)

    const activities: { type: string; date: string }[] = []

    if (logs.length > 0) {
      activities.push({ type: "contact", date: logs[0].communicationDate })
    }
    if (events.length > 0) {
      activities.push({ type: "event", date: events[0].startTime })
    }
    if (threads.length > 0) {
      activities.push({ type: "message", date: threads[0].lastMessageAt })
    }

    if (activities.length === 0) return null

    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
  }

  const handleSaveContact = async (
    contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingContact) {
      await updateContact(editingContact.id, contactData)
      setEditingContact(null)
    } else {
      await addContact(contactData)
    }
  }

  const handleToggleRole = async (
    contact: Contact,
    role: "emergency" | "poa" | "accounts"
  ) => {
    const updates: Partial<Contact> = {}

    if (role === "emergency") {
      updates.isEmergencyContact = !contact.isEmergencyContact
      if (!contact.isEmergencyContact) {
        // Adding as emergency - assign next priority
        updates.role = "primary"
        updates.priority = nextEmergencyPriority
      } else {
        // Removing from emergency - clear priority
        updates.role = "other"
        updates.priority = 0
      }
    }
    if (role === "poa") {
      updates.isPoaHolder = !contact.isPoaHolder
      if (!contact.isPoaHolder && !contact.isEmergencyContact) {
        updates.role = "legal"
      }
    }
    if (role === "accounts") {
      updates.canAccessAccounts = !contact.canAccessAccounts
      if (!contact.canAccessAccounts && !contact.isEmergencyContact && !contact.isPoaHolder) {
        updates.role = "financial"
      }
    }

    await updateContact(contact.id, updates)

    // If removing from emergency, reorder remaining
    if (role === "emergency") {
      const updatedContact = { ...contact, ...updates }
      const nextContacts = contacts.map((c) =>
        c.id === contact.id ? updatedContact : c
      )

      await reorderEmergencyPriorities(nextContacts)
    }
  }

  const handleMovePriority = async (contactId: string, direction: "up" | "down") => {
    const currentIndex = emergencyContacts.findIndex((c) => c.id === contactId)

    if (currentIndex === -1) return
    if (direction === "up" && currentIndex === 0) return
    if (direction === "down" && currentIndex === emergencyContacts.length - 1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const currentContact = emergencyContacts[currentIndex]
    const targetContact = emergencyContacts[targetIndex]

    // Swap priorities
    await updateContact(currentContact.id, { priority: targetContact.priority })
    await updateContact(targetContact.id, { priority: currentContact.priority })
  }

  const handleQuickSchedule = async (
    title: string,
    eventType: "call" | "video",
    startTime: string,
    duration: number
  ) => {
    if (!selectedContact?.email) return

    await createEvent(
      {
        title,
        eventType,
        startTime,
        endTime: new Date(new Date(startTime).getTime() + duration * 60000).toISOString(),
        durationMinutes: duration,
        isRecurring: false,
        status: "scheduled",
      },
      [
        {
          email: selectedContact.email,
          name: selectedContact.contactName,
          contactId: selectedContact.id,
        },
      ]
    )
  }

  const handleQuickMessage = async (subject: string, message: string, attachedFiles?: File[]) => {
    if (!selectedContact?.email) return

    const thread = await createThread(
      selectedContact.email,
      selectedContact.contactName,
      selectedContact.id,
      subject || undefined
    )

    if (thread) {
      await sendMessage(thread, message, attachedFiles)
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await exportToPDF()
    } finally {
      setIsExporting(false)
    }
  }

  const handleEditSharedContact = (sc: SharedContact) => {
    setEditingSharedContact(sc)
    setIsEditSharedDialogOpen(true)
  }

  const handleSaveSharedContactEdit = (displayName: string, relationship: string) => {
    if (editingSharedContact) {
      updateSharedContactLocal(editingSharedContact.id, {
        localDisplayName: displayName || undefined,
        localRelationship: relationship || undefined,
      })
    }
    setEditingSharedContact(null)
  }

  const query = searchQuery.toLowerCase()
  let baseContacts: Contact[] =
    activeTab === "all"
      ? contacts
      : activeTab === "emergency"
      ? emergencyContacts
      : activeTab === "poa"
      ? poaHolders
      : activeTab === "shared"
      ? [] // handled separately
      : accountAccessContacts

  const filteredContacts = baseContacts
    .filter((contact) => {
      if (!query) return true

      return (
        contact.contactName.toLowerCase().includes(query) ||
        contact.notes?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (activeTab !== "all") return 0

      if (a.isEmergencyContact && !b.isEmergencyContact) return -1
      if (!a.isEmergencyContact && b.isEmergencyContact) return 1
      if (a.isEmergencyContact && b.isEmergencyContact) {
        return (a.priority || 0) - (b.priority || 0)
      }

      return 0
    })

  const filteredSharedContacts = sharedContacts
    .filter((contact) => {
      if (!query) return true

      return (
        contact.contactName.toLowerCase().includes(query) ||
        contact.notes?.toLowerCase().includes(query)
      )
    })

  // Stats
  const upcomingEventsCount = scheduledEvents.filter(e => e.status === "scheduled" && new Date(e.startTime) >= new Date()).length
  const recentLogsCount = communicationLog.length

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading contacts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Header />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Link href="./">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Emergency Contact Network
                </h1>
                <p className="text-white/80 mt-1">
                  Manage contacts, schedule calls, and track communications
                </p>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                asChild
              >
                <Link href="./communication">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Communication Hub
                </Link>
              </Button>
              <Button
                className="bg-white text-primary hover:bg-white/90 cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{contacts.length}</p>
                  <p className="text-sm text-white/70">Total Contacts</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{emergencyContacts.length}</p>
                  <p className="text-sm text-white/70">Emergency</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{upcomingEventsCount}</p>
                  <p className="text-sm text-white/70">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{recentLogsCount}</p>
                  <p className="text-sm text-white/70">Logged</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="sm:hidden flex gap-2 p-4 border-b bg-background">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="./communication-hub">
            <MessageSquare className="w-4 h-4 mr-2" />
            Hub
          </Link>
        </Button>
        <Button className="flex-1" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Important Notice */}
        {(emergencyContacts.length === 0 || poaHolders.length === 0) && (
          <Alert className="mb-6 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Important:</strong>{" "}
              {emergencyContacts.length === 0 && "No emergency contact designated. "}
              {poaHolders.length === 0 && "No Power of Attorney holder designated. "}
              These are critical for emergency preparedness.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Reference Card */}
        {(emergencyContacts.length > 0 || poaHolders.length > 0) && (
          <div className="bg-card border rounded-xl p-5 mb-8">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Quick Reference
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {emergencyContacts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Primary Emergency Contact
                  </h4>
                  <p className="font-semibold text-foreground text-lg">
                    {emergencyContacts[0].contactName}
                  </p>
                  {emergencyContacts[0].phonePrimary && (
                    <a
                      href={`tel:${emergencyContacts[0].phonePrimary}`}
                      className="text-indigo-600 hover:underline flex items-center gap-2 mt-1"
                    >
                      <Phone className="w-4 h-4" />
                      {emergencyContacts[0].phonePrimary}
                    </a>
                  )}
                </div>
              )}
              {poaHolders.length > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                  <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Power of Attorney
                  </h4>
                  <p className="font-semibold text-foreground text-lg">
                    {poaHolders[0].contactName}
                  </p>
                  {poaHolders[0].phonePrimary && (
                    <a
                      href={`tel:${poaHolders[0].phonePrimary}`}
                      className="text-indigo-600 hover:underline flex items-center gap-2 mt-1"
                    >
                      <Phone className="w-4 h-4" />
                      {poaHolders[0].phonePrimary}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all">All ({contacts.length})</TabsTrigger>
              <TabsTrigger value="emergency">Emergency ({emergencyContacts.length})</TabsTrigger>
              <TabsTrigger value="poa">POA ({poaHolders.length})</TabsTrigger>
              <TabsTrigger value="accounts">Accounts ({accountAccessContacts.length})</TabsTrigger>
              <TabsTrigger value="shared" className="relative">
                Shared ({sharedContacts.length})
                {sharedContacts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {activeTab === "shared"?
                <Button variant="outline" size="sm" onClick={refreshSharedContacts} className="cursor-pointer">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>:
                <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}  className="cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              }
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting || contacts.length === 0} className="cursor-pointer">
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </div>

          {/* Shared Contacts Tab */}
          <TabsContent value="shared">
            {sharedContacts.length > 0 ? (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-sm text-blue-800 dark:text-blue-200">
                  <strong>Shared With You:</strong> These people have listed your email as their emergency contact. 
                  You can customize how they appear and optionally add them to your own contacts.
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredSharedContacts.map((sc) => (
                    <SharedContactCard
                      key={sc.id}
                      sharedContact={sc}
                      onEdit={() => handleEditSharedContact(sc)}
                      onAddToContacts={() => addSharedContactToMyContacts(sc)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-card border rounded-2xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No shared contacts yet</h3>
                <p className="text-muted-foreground">
                  When someone adds your email as their emergency contact, they'll appear here.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value={activeTab === "shared" ? "never" : activeTab}>
            {activeTab === "all" && contacts.length > 0 && emergencyContacts.length > 0 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 mb-4 text-sm text-indigo-800 dark:text-indigo-200">
                <strong>Priority:</strong> Emergency contacts show their priority number. Use the dropdown to reorder.
              </div>
            )}

            {filteredContacts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredContacts.map((contact, index) => (
                  <EmergencyContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={() => {
                      setEditingContact(contact)
                      setIsDialogOpen(true)
                    }}
                    onDelete={() => {
                      if (confirm("Delete this contact?")) {
                        deleteContact(contact.id, contact.email)
                      }
                    }}
                    onToggleRole={(role) => handleToggleRole(contact, role)}
                    onScheduleCall={() => {
                      setSelectedContact(contact)
                      setScheduleDialogOpen(true)
                    }}
                    onSendMessage={() => {
                      setSelectedContact(contact)
                      setMessageDialogOpen(true)
                    }}
                    showPriority={activeTab === "all"}
                    onMoveUp={() => handleMovePriority(contact.id, "up")}
                    onMoveDown={() => handleMovePriority(contact.id, "down")}
                    isFirst={index === 0}
                    isLast={index === filteredContacts.filter(c => c.isEmergencyContact === true).length - 1}
                    recentActivity={getRecentActivity(contact.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border rounded-2xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {contacts.length === 0 ? "No contacts yet" : "No contacts in this category"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {contacts.length === 0
                    ? "Add trusted people who can act on your behalf."
                    : "Add contacts to this category using the dropdown menu."}
                </p>
                {contacts.length === 0 && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Contact
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Dialogs */}
      <AddEmergencyContactDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingContact(null)
        }}
        onSave={handleSaveContact}
        editingContact={editingContact}
        nextPriority={nextEmergencyPriority}
      />

      <QuickScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        contact={selectedContact}
        onSchedule={handleQuickSchedule}
      />

      <QuickMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        contact={selectedContact}
        onSend={handleQuickMessage}
      />

      <EditSharedContactDialog
        open={isEditSharedDialogOpen}
        onOpenChange={(open) => {
          setIsEditSharedDialogOpen(open)
          if (!open) setEditingSharedContact(null)
        }}
        sharedContact={editingSharedContact}
        onSave={handleSaveSharedContactEdit}
      />

      {/* Sync indicator */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Syncing...</span>
        </div>
      )}
    </div>
  )
}