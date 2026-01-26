"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Scale,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trash2,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  useLegal,
  type LegalDocument,
  type DocumentStatus,
  type LegalDocumentType,
  type JAGAppointment,
  type LegalContact,
} from "@/hooks/use-legal"

const statusConfig: Record<DocumentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { label: "Not Started", color: "bg-muted text-muted-foreground", icon: <Circle className="h-4 w-4" /> },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-800", icon: <Clock className="h-4 w-4" /> },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  needs_update: {
    label: "Needs Update",
    color: "bg-red-100 text-red-800",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
}

const documentTypeLabels: Record<LegalDocumentType, string> = {
  will: "Will",
  poa_general: "General POA",
  poa_special: "Special POA",
  poa_medical: "Medical POA",
  living_will: "Living Will",
  trust: "Trust",
  dd93: "DD Form 93",
  sgli: "SGLI",
  other: "Other",
}

const jagResources = [
  {
    name: "Air Force Legal Assistance",
    url: "https://aflegalassistance.law.af.mil/",
    description: "Find your nearest Air Force legal office",
  },
  {
    name: "Army Legal Assistance",
    url: "https://myarmybenefits.us.army.mil/",
    description: "Army legal services locator",
  },
  {
    name: "Navy Legal Services",
    url: "https://www.jag.navy.mil/legal_services.htm",
    description: "Navy JAG legal assistance",
  },
  {
    name: "Marine Corps Legal Services",
    url: "https://www.hqmc.marines.mil/sja/",
    description: "Marine Corps legal support",
  },
  {
    name: "Coast Guard Legal",
    url: "https://www.dcms.uscg.mil/Our-Organization/Assistant-Commandant-for-Human-Resources-CG-1/Legal-Division-CG-LGL/",
    description: "Coast Guard legal services",
  },
  {
    name: "Military OneSource Legal",
    url: "https://www.militaryonesource.mil/financial-legal/legal/",
    description: "Free legal consultations",
  },
]

export default function LegalReadyCenterPage() {
  const {
    documents,
    appointments,
    contacts,
    isLoaded,
    updateDocument,
    addDocument,
    deleteDocument,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addContact,
    deleteContact,
    getCompletionStats,
  } = useLegal()

  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false)
  const [isApptDialogOpen, setIsApptDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)

  const [newDoc, setNewDoc] = useState<Partial<LegalDocument>>({
    type: "other",
    name: "",
    status: "not_started",
    location: "",
    notes: "",
  })

  const [newAppt, setNewAppt] = useState<Partial<JAGAppointment>>({
    date: "",
    time: "",
    location: "",
    purpose: "",
    notes: "",
    completed: false,
  })

  const [newContact, setNewContact] = useState<Partial<LegalContact>>({
    name: "",
    role: "",
    organization: "",
    phone: "",
    email: "",
    address: "",
  })

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-12 w-12 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your legal documents...</p>
        </div>
      </div>
    )
  }

  const stats = getCompletionStats()

  const handleAddDocument = () => {
    if (newDoc.name && newDoc.type) {
      addDocument({
        type: newDoc.type as LegalDocumentType,
        name: newDoc.name,
        status: newDoc.status as DocumentStatus,
        location: newDoc.location || "",
        lastUpdated: null,
        expirationDate: newDoc.expirationDate || null,
        notes: newDoc.notes || "",
        attorney: newDoc.attorney || null,
        witnessNames: [],
      })
      setNewDoc({ type: "other", name: "", status: "not_started", location: "", notes: "" })
      setIsDocDialogOpen(false)
    }
  }

  const handleAddAppointment = () => {
    if (newAppt.date && newAppt.purpose) {
      addAppointment({
        date: newAppt.date,
        time: newAppt.time || "",
        location: newAppt.location || "",
        purpose: newAppt.purpose,
        notes: newAppt.notes || "",
        completed: false,
      })
      setNewAppt({ date: "", time: "", location: "", purpose: "", notes: "", completed: false })
      setIsApptDialogOpen(false)
    }
  }

  const handleAddContact = () => {
    if (newContact.name) {
      addContact({
        name: newContact.name,
        role: newContact.role || "",
        organization: newContact.organization || "",
        phone: newContact.phone || "",
        email: newContact.email || "",
        address: newContact.address || "",
      })
      setNewContact({ name: "", role: "", organization: "", phone: "", email: "", address: "" })
      setIsContactDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Scale className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Legal Ready Center</h1>
                <p className="text-sm text-muted-foreground">Track legal documents and JAG appointments</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <Card className="mb-8 border-accent/20 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Legal Readiness Status</h2>
                <p className="text-sm text-muted-foreground">
                  {stats.completed} of {stats.total} essential documents completed
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-2xl font-bold text-emerald-600">{stats.completed}</span>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-amber-600">{stats.inProgress}</span>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-red-600">{stats.needsUpdate}</span>
                  <p className="text-xs text-muted-foreground">Needs Update</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={stats.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{stats.percentage}% ready</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="resources">JAG Resources</TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">Essential Legal Documents</h3>
              <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Legal Document</DialogTitle>
                    <DialogDescription>Track a new legal document for deployment readiness.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select
                        value={newDoc.type}
                        onValueChange={(value) => setNewDoc({ ...newDoc, type: value as LegalDocumentType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(documentTypeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Document Name</Label>
                      <Input
                        value={newDoc.name}
                        onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                        placeholder="e.g., Last Will and Testament"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Storage Location</Label>
                      <Input
                        value={newDoc.location}
                        onChange={(e) => setNewDoc({ ...newDoc, location: e.target.value })}
                        placeholder="e.g., Safe deposit box at USAA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={newDoc.notes}
                        onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
                        placeholder="Additional details..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDocDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDocument} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Add Document
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => {
                const status = statusConfig[doc.status]
                const isExpanded = expandedDoc === doc.id

                return (
                  <Card key={doc.id} className="border-border">
                    <CardContent className="pt-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium text-foreground">{doc.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {documentTypeLabels[doc.type]}
                              {doc.lastUpdated && (
                                <span className="ml-2">
                                  - Updated {new Date(doc.lastUpdated).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={status.color}>
                            {status.icon}
                            <span className="ml-1">{status.label}</span>
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={doc.status}
                                onValueChange={(value) => updateDocument(doc.id, { status: value as DocumentStatus })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                      {config.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Storage Location</Label>
                              <Input
                                value={doc.location}
                                onChange={(e) => updateDocument(doc.id, { location: e.target.value })}
                                placeholder="Where is this document stored?"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Attorney/Preparer</Label>
                              <Input
                                value={doc.attorney || ""}
                                onChange={(e) => updateDocument(doc.id, { attorney: e.target.value })}
                                placeholder="Who prepared this document?"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Expiration Date (if applicable)</Label>
                              <Input
                                type="date"
                                value={doc.expirationDate || ""}
                                onChange={(e) => updateDocument(doc.id, { expirationDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={doc.notes}
                              onChange={(e) => updateDocument(doc.id, { notes: e.target.value })}
                              placeholder="Additional notes about this document..."
                            />
                          </div>
                          {!["will", "poa_general", "poa_special", "poa_medical", "living_will", "dd93", "sgli"].includes(
                            doc.type
                          ) && (
                            <div className="flex justify-end">
                              <Button variant="destructive" size="sm" onClick={() => deleteDocument(doc.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">JAG Appointments</h3>
              <Dialog open={isApptDialogOpen} onOpenChange={setIsApptDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule JAG Appointment</DialogTitle>
                    <DialogDescription>Track your legal assistance appointments.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newAppt.date}
                          onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={newAppt.time}
                          onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={newAppt.location}
                        onChange={(e) => setNewAppt({ ...newAppt, location: e.target.value })}
                        placeholder="e.g., Base Legal Office, Bldg 123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose</Label>
                      <Input
                        value={newAppt.purpose}
                        onChange={(e) => setNewAppt({ ...newAppt, purpose: e.target.value })}
                        placeholder="e.g., Will preparation, POA signing"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={newAppt.notes}
                        onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                        placeholder="Documents to bring, questions to ask..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsApptDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddAppointment}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Add Appointment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {appointments.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Appointments Scheduled</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule your JAG appointments to keep track of legal preparations.
                  </p>
                  <Button
                    onClick={() => setIsApptDialogOpen(true)}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {appointments
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((appt) => (
                    <Card key={appt.id} className={appt.completed ? "opacity-60" : ""}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${appt.completed ? "bg-emerald-100" : "bg-accent/10"}`}
                            >
                              <Calendar
                                className={`h-5 w-5 ${appt.completed ? "text-emerald-600" : "text-accent"}`}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{appt.purpose}</h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(appt.date).toLocaleDateString()}
                                  {appt.time && ` at ${appt.time}`}
                                </span>
                                {appt.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {appt.location}
                                  </span>
                                )}
                              </div>
                              {appt.notes && <p className="text-sm text-muted-foreground mt-2">{appt.notes}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateAppointment(appt.id, { completed: !appt.completed })}
                            >
                              {appt.completed ? "Undo" : "Complete"}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteAppointment(appt.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground">Legal Contacts</h3>
              <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Legal Contact</DialogTitle>
                    <DialogDescription>Save contact information for attorneys and legal advisors.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          value={newContact.role}
                          onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                          placeholder="e.g., JAG Officer, Estate Attorney"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Organization</Label>
                        <Input
                          value={newContact.organization}
                          onChange={(e) => setNewContact({ ...newContact, organization: e.target.value })}
                          placeholder="e.g., Base Legal Office"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Textarea
                        value={newContact.address}
                        onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                        placeholder="Office address"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddContact} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Add Contact
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {contacts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Legal Contacts</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your JAG officers, attorneys, and legal advisors.
                  </p>
                  <Button
                    onClick={() => setIsContactDialogOpen(true)}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-accent/10">
                            <User className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{contact.name}</h4>
                            <p className="text-sm text-muted-foreground">{contact.role}</p>
                            {contact.organization && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Building2 className="h-3 w-3" />
                                {contact.organization}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteContact(contact.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border space-y-1">
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-2 text-sm text-accent hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-2 text-sm text-accent hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </a>
                        )}
                        {contact.address && (
                          <p className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mt-0.5" />
                            {contact.address}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* JAG Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">JAG Legal Assistance Resources</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {jagResources.map((resource) => (
                <Card key={resource.name} className="hover:border-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      {resource.name}
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline"
                    >
                      Visit Website
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50 mt-6">
              <CardHeader>
                <CardTitle className="text-base">What to Bring to Your JAG Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    Military ID and dependent IDs
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    Names, addresses, and dates of birth for beneficiaries
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    Information about real estate, vehicles, and major assets
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    Names of desired executors, guardians, and POA holders
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    List of debts and financial obligations
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    Previous wills or legal documents to update
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
