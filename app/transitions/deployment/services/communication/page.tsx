"use client"

import React from "react"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  MessageSquare,
  Plus,
  ArrowLeft,
  Phone,
  Video,
  Mail,
  Send,
  Clock,
  User,
  ChevronDown,
  Trash2,
  Edit,
  Globe,
  Calendar,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContacts, type Contact, type CommunicationType, type CommunicationLog } from "@/hooks/use-contacts"

const communicationTypes: { value: CommunicationType; label: string; icon: React.ReactNode }[] = [
  { value: "call", label: "Phone Call", icon: <Phone className="w-4 h-4" /> },
  { value: "video", label: "Video Call", icon: <Video className="w-4 h-4" /> },
  { value: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { value: "message", label: "Message", icon: <Send className="w-4 h-4" /> },
  { value: "letter", label: "Letter", icon: <Mail className="w-4 h-4" /> },
]

const timezones = [
  { value: "America/New_York", label: "Eastern (ET)", offset: -5 },
  { value: "America/Chicago", label: "Central (CT)", offset: -6 },
  { value: "America/Denver", label: "Mountain (MT)", offset: -7 },
  { value: "America/Los_Angeles", label: "Pacific (PT)", offset: -8 },
  { value: "America/Anchorage", label: "Alaska (AKT)", offset: -9 },
  { value: "Pacific/Honolulu", label: "Hawaii (HT)", offset: -10 },
  { value: "Europe/London", label: "London (GMT)", offset: 0 },
  { value: "Europe/Berlin", label: "Central Europe (CET)", offset: 1 },
  { value: "Asia/Tokyo", label: "Japan (JST)", offset: 9 },
  { value: "Asia/Seoul", label: "Korea (KST)", offset: 9 },
  { value: "Asia/Dubai", label: "Gulf (GST)", offset: 4 },
  { value: "Asia/Kabul", label: "Afghanistan (AFT)", offset: 4.5 },
]

function getCommIcon(type: CommunicationType) {
  const found = communicationTypes.find((t) => t.value === type)
  return found?.icon || <MessageSquare className="w-4 h-4" />
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function getTimeInTimezone(timezone: string): string {
  try {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return "Unknown"
  }
}

function ContactCard({
  contact,
  communications,
  onEdit,
  onDelete,
  onLogCommunication,
}: {
  contact: Contact
  communications: CommunicationLog[]
  onEdit: () => void
  onDelete: () => void
  onLogCommunication: () => void
}) {
  const recentComm = communications[0]
  const currentTime = contact.timezone ? getTimeInTimezone(contact.timezone) : null

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{contact.contactName}</h3>
              {contact.relationship && (
                <p className="text-sm text-muted-foreground">{contact.relationship}</p>
              )}
              {currentTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Globe className="w-3 h-3" />
                  <span>Local time: {currentTime}</span>
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onLogCommunication}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Log Communication
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Contact
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact Info */}
        <div className="mt-4 space-y-2">
          {contact.phonePrimary && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a href={`tel:${contact.phonePrimary}`} className="text-foreground hover:text-accent">
                {contact.phonePrimary}
              </a>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a href={`mailto:${contact.email}`} className="text-foreground hover:text-accent">
                {contact.email}
              </a>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          {contact.phonePrimary && (
            <Button variant="outline" size="sm" asChild className="bg-transparent">
              <a href={`tel:${contact.phonePrimary}`}>
                <Phone className="w-4 h-4 mr-1" />
                Call
              </a>
            </Button>
          )}
          {contact.email && (
            <Button variant="outline" size="sm" asChild className="bg-transparent">
              <a href={`mailto:${contact.email}`}>
                <Mail className="w-4 h-4 mr-1" />
                Email
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onLogCommunication} className="bg-transparent">
            <MessageSquare className="w-4 h-4 mr-1" />
            Log
          </Button>
        </div>
      </div>

      {/* Last Communication */}
      {recentComm && (
        <div className="px-4 py-3 bg-muted/30 border-t">
          <div className="flex items-center gap-2 text-sm">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Last contact: {formatDate(recentComm.communicationDate)}
            </span>
            <span className="text-muted-foreground">via</span>
            {getCommIcon(recentComm.communicationType)}
          </div>
        </div>
      )}
    </div>
  )
}

function AddContactDialog({
  open,
  onOpenChange,
  onSave,
  editingContact,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => void
  editingContact?: Contact | null
}) {
  const [name, setName] = useState(editingContact?.contactName || "")
  const [relationship, setRelationship] = useState(editingContact?.relationship || "")
  const [phonePrimary, setPhonePrimary] = useState(editingContact?.phonePrimary || "")
  const [email, setEmail] = useState(editingContact?.email || "")
  const [timezone, setTimezone] = useState(editingContact?.timezone || "")
  const [notes, setNotes] = useState(editingContact?.notes || "")

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      contactName: name.trim(),
      relationship: relationship.trim() || undefined,
      phonePrimary: phonePrimary.trim() || undefined,
      email: email.trim() || undefined,
      timezone: timezone || undefined,
      notes: notes.trim() || undefined,
      isEmergencyContact: editingContact?.isEmergencyContact || false,
      isPoaHolder: editingContact?.isPoaHolder || false,
      canAccessAccounts: editingContact?.canAccessAccounts || false,
    })
    setName("")
    setRelationship("")
    setPhonePrimary("")
    setEmail("")
    setTimezone("")
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          <DialogDescription>
            Add family or friends to stay connected during deployment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g., Spouse, Parent"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phonePrimary}
              onChange={(e) => setPhonePrimary(e.target.value)}
              placeholder="e.g., (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., jane@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Their Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Best times to call, etc..."
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

function LogCommunicationDialog({
  open,
  onOpenChange,
  onSave,
  contacts,
  preselectedContactId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (log: Omit<CommunicationLog, "id" | "createdAt" | "contactName">) => void
  contacts: Contact[]
  preselectedContactId?: string
}) {
  const [contactId, setContactId] = useState(preselectedContactId || "")
  const [type, setType] = useState<CommunicationType>("call")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")

  const handleSave = () => {
    if (!contactId) return
    onSave({
      contactId,
      communicationType: type,
      communicationDate: new Date(date).toISOString(),
      durationMinutes: duration ? parseInt(duration, 10) : undefined,
      notes: notes.trim() || undefined,
    })
    setContactId("")
    setType("call")
    setDate(new Date().toISOString().split("T")[0])
    setDuration("")
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Communication</DialogTitle>
          <DialogDescription>Record a call, message, or other communication.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger>
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.contactName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CommunicationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {communicationTypes.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      <span className="flex items-center gap-2">
                        {ct.icon}
                        {ct.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you talk about?"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!contactId}>
            Log Communication
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CommunicationHubPage() {
  const {
    contacts,
    communicationLog,
    isLoaded,
    addContact,
    updateContact,
    deleteContact,
    addCommunication,
    getContactCommunications,
    getRecentCommunications,
  } = useContacts()

  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [logContactId, setLogContactId] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState("contacts")

  const recentComms = getRecentCommunications(20)

  const handleSaveContact = (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    if (editingContact) {
      updateContact(editingContact.id, contactData)
      setEditingContact(null)
    } else {
      addContact(contactData)
    }
  }

  const handleLogCommunication = (contactId?: string) => {
    setLogContactId(contactId)
    setIsLogDialogOpen(true)
  }

  // Communication stats
  const thisWeekComms = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return communicationLog.filter((log) => new Date(log.communicationDate) >= weekAgo).length
  }, [communicationLog])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Family Communication Hub</h1>
                <p className="text-sm text-muted-foreground">
                  Stay connected with loved ones across time zones
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleLogCommunication()} className="bg-transparent">
                <MessageSquare className="w-4 h-4 mr-2" />
                Log Call
              </Button>
              <Button onClick={() => setIsContactDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
                <p className="text-sm text-muted-foreground">Contacts</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{communicationLog.length}</p>
                <p className="text-sm text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{thisWeekComms}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {contacts.filter((c) => c.timezone).length}
                </p>
                <p className="text-sm text-muted-foreground">Time Zones Tracked</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="history">Communication History</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            {contacts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {contacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    communications={getContactCommunications(contact.id)}
                    onEdit={() => {
                      setEditingContact(contact)
                      setIsContactDialogOpen(true)
                    }}
                    onDelete={() => deleteContact(contact.id)}
                    onLogCommunication={() => handleLogCommunication(contact.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border rounded-lg">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No contacts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add family and friends to track communication during deployment.
                </p>
                <Button onClick={() => setIsContactDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contact
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {recentComms.length > 0 ? (
              <div className="bg-card border rounded-lg divide-y">
                {recentComms.map((log) => (
                  <div key={log.id} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      {getCommIcon(log.communicationType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{log.contactName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(log.communicationDate)}</span>
                        <span>at</span>
                        <span>{formatTime(log.communicationDate)}</span>
                        {log.durationMinutes && (
                          <>
                            <span>-</span>
                            <span>{log.durationMinutes} min</span>
                          </>
                        )}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{log.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border rounded-lg">
                <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No communication logged</h3>
                <p className="text-muted-foreground mb-4">
                  Start logging calls and messages to track your communication.
                </p>
                <Button onClick={() => handleLogCommunication()}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Log Your First Communication
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AddContactDialog
        open={isContactDialogOpen}
        onOpenChange={(open) => {
          setIsContactDialogOpen(open)
          if (!open) setEditingContact(null)
        }}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />

      <LogCommunicationDialog
        open={isLogDialogOpen}
        onOpenChange={setIsLogDialogOpen}
        onSave={addCommunication}
        contacts={contacts}
        preselectedContactId={logContactId}
      />
    </div>
  )
}
