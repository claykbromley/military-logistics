"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Users,
  Plus,
  ArrowLeft,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  ChevronDown,
  Trash2,
  Edit,
  Key,
  Wallet,
  FileText,
  MapPin,
  Star,
  StarOff,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContacts, type Contact } from "@/hooks/use-contacts"

const roleDescriptions = {
  emergency: "First person to call in emergencies",
  poa: "Has Power of Attorney authority",
  accounts: "Can access financial accounts",
}

function EmergencyContactCard({
  contact,
  onEdit,
  onDelete,
  onToggleRole,
}: {
  contact: Contact
  onEdit: () => void
  onDelete: () => void
  onToggleRole: (role: "emergency" | "poa" | "accounts") => void
}) {
  const roles = []
  if (contact.isEmergencyContact) roles.push("Emergency Contact")
  if (contact.isPoaHolder) roles.push("POA Holder")
  if (contact.canAccessAccounts) roles.push("Account Access")

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
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
            <div>
              <h3 className="font-semibold text-foreground">{contact.contactName}</h3>
              {contact.relationship && (
                <p className="text-sm text-muted-foreground">{contact.relationship}</p>
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
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Contact
              </DropdownMenuItem>
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
  const [name, setName] = useState(editingContact?.contactName || "")
  const [relationship, setRelationship] = useState(editingContact?.relationship || "")
  const [phonePrimary, setPhonePrimary] = useState(editingContact?.phonePrimary || "")
  const [phoneSecondary, setPhoneSecondary] = useState(editingContact?.phoneSecondary || "")
  const [email, setEmail] = useState(editingContact?.email || "")
  const [address, setAddress] = useState(editingContact?.address || "")
  const [notes, setNotes] = useState(editingContact?.notes || "")
  const [isEmergencyContact, setIsEmergencyContact] = useState(editingContact?.isEmergencyContact || false)
  const [isPoaHolder, setIsPoaHolder] = useState(editingContact?.isPoaHolder || false)
  const [canAccessAccounts, setCanAccessAccounts] = useState(editingContact?.canAccessAccounts || false)

  const handleSave = () => {
    if (!name.trim()) return
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
    })
    // Reset form
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
                  <label htmlFor="emergency" className="text-sm font-medium">
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
                  <label htmlFor="poa" className="text-sm font-medium">
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
                  <label htmlFor="accounts" className="text-sm font-medium">
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
  } = useContacts()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const emergencyContacts = getEmergencyContacts()
  const poaHolders = getPoaHolders()
  const accountAccessContacts = contacts.filter((c) => c.canAccessAccounts)

  const handleSaveContact = (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    if (editingContact) {
      updateContact(editingContact.id, contactData)
      setEditingContact(null)
    } else {
      addContact(contactData)
    }
  }

  const handleToggleRole = (contact: Contact, role: "emergency" | "poa" | "accounts") => {
    const updates: Partial<Contact> = {}
    if (role === "emergency") updates.isEmergencyContact = !contact.isEmergencyContact
    if (role === "poa") updates.isPoaHolder = !contact.isPoaHolder
    if (role === "accounts") updates.canAccessAccounts = !contact.canAccessAccounts
    updateContact(contact.id, updates)
  }

  const filteredContacts =
    activeTab === "all"
      ? contacts
      : activeTab === "emergency"
      ? emergencyContacts
      : activeTab === "poa"
      ? poaHolders
      : accountAccessContacts

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
                <h1 className="text-xl font-bold text-foreground">Emergency Contact Network</h1>
                <p className="text-sm text-muted-foreground">
                  Manage emergency contacts, POA holders, and account access
                </p>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
        </div>

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
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredContacts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredContacts.map((contact) => (
                  <EmergencyContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={() => {
                      setEditingContact(contact)
                      setIsDialogOpen(true)
                    }}
                    onDelete={() => deleteContact(contact.id)}
                    onToggleRole={(role) => handleToggleRole(contact, role)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border rounded-lg">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {contacts.length === 0 ? "No contacts yet" : "No contacts in this category"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {contacts.length === 0
                    ? "Add trusted people who can act on your behalf during deployment."
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
