"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Users, Plus, ArrowLeft, Phone, Mail, Shield, AlertTriangle, ChevronDown, Trash2, Edit, Key, FileText, MapPin, Star, StarOff, GripVertical, Download, Info, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useContacts, type Contact, useSharedWithMe } from "@/hooks/use-contacts"
import { createClient } from "@/lib/supabase/client"

function EmergencyContactCard({
  contact,
  onEdit,
  onDelete,
  onToggleRole,
  showPriority = false,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isSharedWithMe = false,
}: {
  contact: Contact
  onEdit?: () => void
  onDelete?: () => void
  onToggleRole?: (role: "emergency" | "poa" | "accounts") => void
  showPriority?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
  isSharedWithMe?: boolean
}) {
  const roles = []
  if (contact.isEmergencyContact) roles.push("Emergency Contact")
  if (contact.isPoaHolder) roles.push("POA Holder")
  if (contact.canAccessAccounts) roles.push("Account Access")

  return (
    <div className={`bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-colors ${isSharedWithMe ? 'border-blue-300 bg-blue-50/50' : ''}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {showPriority && !isSharedWithMe && (
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-xs text-muted-foreground text-center font-mono">
                  #{contact.priority}
                </span>
              </div>
            )}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                contact.isEmergencyContact
                  ? "bg-destructive/10 text-destructive"
                  : contact.isPoaHolder
                  ? "bg-accent/10 text-accent"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {contact.isEmergencyContact ? (
                <AlertTriangle className="w-6 h-6" />
              ) : contact.isPoaHolder ? (
                <Shield className="w-6 h-6" />
              ) : (
                <Users className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{contact.contactName}</h3>
                {isSharedWithMe && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Listed you as contact
                  </span>
                )}
              </div>
              {contact.relationship && (
                <p className="text-sm text-muted-foreground">{contact.relationship}</p>
              )}
            </div>
          </div>
          {!isSharedWithMe && onEdit && onDelete && onToggleRole && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Contact
                </DropdownMenuItem>
                {showPriority && (
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
                  {contact.isEmergencyContact ? "Remove from" : "Add as"} Emergency Contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleRole("poa")}>
                  <Shield className="w-4 h-4 mr-2" />
                  {contact.isPoaHolder ? "Remove" : "Designate as"} POA Holder
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
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-medium">
                <AlertTriangle className="w-3 h-3" />
                Emergency Contact
              </span>
            )}
            {contact.isPoaHolder && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent/10 text-accent text-xs font-medium">
                <Shield className="w-3 h-3" />
                POA Holder
              </span>
            )}
            {contact.canAccessAccounts && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-medium">
                <Key className="w-3 h-3" />
                Account Access
              </span>
            )}
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-4 space-y-2">
          {contact.phonePrimary && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a href={`tel:${contact.phonePrimary}`} className="text-foreground hover:text-accent">
                {contact.phonePrimary}
              </a>
              {contact.phoneSecondary && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <a href={`tel:${contact.phoneSecondary}`} className="text-foreground hover:text-accent">
                    {contact.phoneSecondary}
                  </a>
                </>
              )}
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
      </div>
    </div>
  )
}

function AddEmergencyContactDialog({
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
      priority: editingContact?.priority || 0,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingContact ? "Edit Contact" : "Add Emergency Contact"}</DialogTitle>
          <DialogDescription>
            Add someone who can be contacted or take action on your behalf during deployment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
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
                placeholder="e.g., Spouse, Parent, Attorney"
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
              If this email has an account, your info will appear on their contacts page
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

export default function EmergencyContactsPage() {
  const {
    contacts,
    isLoaded,
    addContact,
    updateContact,
    deleteContact,
    getEmergencyContacts,
    getPoaHolders,
    exportToPDF,
  } = useContacts()

  const { sharedContacts, isLoaded: sharedLoaded, refreshSharedContacts } = useSharedWithMe()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

  const emergencyContacts = getEmergencyContacts()
  const poaHolders = getPoaHolders()
  const accountAccessContacts = contacts.filter((c) => c.canAccessAccounts)

  const handleSaveContact = async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    if (editingContact) {
      await updateContact(editingContact.id, contactData)
      setEditingContact(null)
    } else {
      const maxPriority = contacts.reduce((max, c) => Math.max(max, c.priority || 0), 0)
      await addContact({
        ...contactData,
        priority: maxPriority + 1,
      })
    }
  }

  const handleToggleRole = async (contact: Contact, role: "emergency" | "poa" | "accounts") => {
    const updates: Partial<Contact> = {}
    
    if (role === "emergency") {
      updates.isEmergencyContact = !contact.isEmergencyContact
      if (!contact.isEmergencyContact) {
        updates.role = "primary"
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
  }

  const handleMovePriority = async (contactId: string, direction: "up" | "down") => {
    const sortedContacts = [...contacts].sort((a, b) => (a.priority || 0) - (b.priority || 0))
    const currentIndex = sortedContacts.findIndex((c) => c.id === contactId)
    
    if (currentIndex === -1) return
    if (direction === "up" && currentIndex === 0) return
    if (direction === "down" && currentIndex === sortedContacts.length - 1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const currentContact = sortedContacts[currentIndex]
    const targetContact = sortedContacts[targetIndex]

    await updateContact(currentContact.id, { priority: targetContact.priority })
    await updateContact(targetContact.id, { priority: currentContact.priority })
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await exportToPDF()
    } catch (error) {
      console.error("Error exporting PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const filteredContacts =
    activeTab === "all"
      ? [...contacts].sort((a, b) => (a.priority || 0) - (b.priority || 0))
      : activeTab === "emergency"
      ? emergencyContacts
      : activeTab === "poa"
      ? poaHolders
      : activeTab === "shared"
      ? sharedContacts
      : accountAccessContacts

  if (!isLoaded || !sharedLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="./">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Emergency Contact Network</h1>
                <p className="text-sm text-muted-foreground">
                  Manage emergency contacts, POA holders, and account access
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                asChild
              >
                <Link href="./communication">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Logs
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={isExporting || contacts.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-foreground">{emergencyContacts.length}</p>
                <p className="text-sm text-muted-foreground">Emergency</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{poaHolders.length}</p>
                <p className="text-sm text-muted-foreground">POA Holders</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{accountAccessContacts.length}</p>
                <p className="text-sm text-muted-foreground">Account Access</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 border-blue-300">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">{sharedContacts.length}</p>
                <p className="text-sm text-muted-foreground">Shared With You</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shared Contacts Alert */}
        {sharedContacts.length > 0 && (
          <Alert className="mb-6 border-blue-300 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>{sharedContacts.length} {sharedContacts.length === 1 ? 'person has' : 'people have'}</strong> listed you as their emergency contact. 
              View them in the "Shared With You" tab.
            </AlertDescription>
          </Alert>
        )}

        {/* Important Notice */}
        {(emergencyContacts.length === 0 || poaHolders.length === 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Important Roles Missing</h3>
                <p className="text-sm text-amber-700 mt-1">
                  {emergencyContacts.length === 0 && "You haven't designated an emergency contact. "}
                  {poaHolders.length === 0 && "You haven't designated a Power of Attorney holder. "}
                  These are critical for deployment readiness.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Reference Card */}
        {(emergencyContacts.length > 0 || poaHolders.length > 0) && (
          <div className="bg-card border rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quick Reference Card
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {emergencyContacts.length > 0 && (
                <div className="bg-destructive/5 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-destructive mb-2">Primary Emergency Contact</h4>
                  <p className="font-semibold text-foreground">{emergencyContacts[0].contactName}</p>
                  {emergencyContacts[0].phonePrimary && (
                    <a
                      href={`tel:${emergencyContacts[0].phonePrimary}`}
                      className="text-sm text-accent hover:underline"
                    >
                      {emergencyContacts[0].phonePrimary}
                    </a>
                  )}
                </div>
              )}
              {poaHolders.length > 0 && (
                <div className="bg-accent/5 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-accent mb-2">Power of Attorney</h4>
                  <p className="font-semibold text-foreground">{poaHolders[0].contactName}</p>
                  {poaHolders[0].phonePrimary && (
                    <a
                      href={`tel:${poaHolders[0].phonePrimary}`}
                      className="text-sm text-accent hover:underline"
                    >
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
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({contacts.length})</TabsTrigger>
            <TabsTrigger value="emergency">Emergency ({emergencyContacts.length})</TabsTrigger>
            <TabsTrigger value="poa">POA ({poaHolders.length})</TabsTrigger>
            <TabsTrigger value="accounts">Account Access ({accountAccessContacts.length})</TabsTrigger>
            <TabsTrigger value="shared" className="relative">
              Shared With You ({sharedContacts.length})
              {sharedContacts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {activeTab === "all" && contacts.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                <strong>Priority Order:</strong> Use the move buttons to reorder contacts by priority. 
                Lower numbers indicate higher priority.
              </div>
            )}

            {activeTab === "shared" && sharedContacts.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800 flex items-center justify-between">
                <div>
                  <strong>Shared Contacts:</strong> These people have listed you as their emergency contact. 
                  You cannot edit or delete these entries.
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refreshSharedContacts}
                  className="ml-4"
                >
                  Refresh
                </Button>
              </div>
            )}
            
            {filteredContacts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredContacts.map((contact, index) => (
                  <EmergencyContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={activeTab !== "shared" ? () => {
                      setEditingContact(contact)
                      setIsDialogOpen(true)
                    } : undefined}
                    onDelete={activeTab !== "shared" ? () => deleteContact(contact.id) : undefined}
                    onToggleRole={activeTab !== "shared" ? (role) => handleToggleRole(contact, role) : undefined}
                    showPriority={activeTab === "all"}
                    onMoveUp={() => handleMovePriority(contact.id, "up")}
                    onMoveDown={() => handleMovePriority(contact.id, "down")}
                    isFirst={index === 0}
                    isLast={index === filteredContacts.length - 1}
                    isSharedWithMe={activeTab === "shared"}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border rounded-lg">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {contacts.length === 0 && activeTab !== "shared" 
                    ? "No contacts yet" 
                    : activeTab === "shared"
                    ? "No one has listed you yet"
                    : "No contacts in this category"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {contacts.length === 0 && activeTab !== "shared"
                    ? "Add trusted people who can act on your behalf during deployment."
                    : activeTab === "shared"
                    ? "When someone adds your email as their emergency contact, they'll appear here."
                    : "Add contacts to this category using the dropdown menu."}
                </p>
                {contacts.length === 0 && activeTab !== "shared" && (
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

      {/* Dialog */}
      <AddEmergencyContactDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingContact(null)
        }}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />
    </div>
  )
}