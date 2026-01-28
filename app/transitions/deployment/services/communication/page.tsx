"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Phone, Video, Mail, Users, MessageSquare, FileText, Trash2, Edit, Calendar, Clock, ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useContacts, type CommunicationLog, type CommunicationType } from "@/hooks/use-contacts"
import { format } from "date-fns"

const communicationIcons: Record<CommunicationType, any> = {
  call: Phone,
  video: Video,
  email: Mail,
  message: MessageSquare,
  letter: FileText,
}

const communicationColors: Record<CommunicationType, string> = {
  call: "text-blue-600 bg-blue-50",
  video: "text-purple-600 bg-purple-50",
  email: "text-green-600 bg-green-50",
  message: "text-yellow-600 bg-yellow-50",
  letter: "text-gray-600 bg-gray-50",
}

function CommunicationLogCard({
  log,
  contactName,
  onEdit,
  onDelete,
}: {
  log: CommunicationLog
  contactName: string
  onEdit: () => void
  onDelete: () => void
}) {
  const Icon = communicationIcons[log.communicationType]
  const colorClass = communicationColors[log.communicationType]

  return (
    <div className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{contactName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                log.direction === "outgoing" 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {log.direction === "outgoing" ? "Outgoing" : "Incoming"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(log.communicationDate), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(log.communicationDate), "h:mm a")}
              </span>
              {log.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {log.durationMinutes} min
                </span>
              )}
            </div>
            {log.notes && (
              <p className="mt-2 text-sm text-muted-foreground">{log.notes}</p>
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
              Edit Log
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function AddCommunicationDialog({
  open,
  onOpenChange,
  onSave,
  contacts,
  editingLog,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (log: Omit<CommunicationLog, "id" | "createdAt" | "contactName">) => void
  contacts: Array<{ id: string; name: string }>
  editingLog?: CommunicationLog | null
}) {
  const [contactId, setContactId] = useState("")
  const [type, setType] = useState<CommunicationType>("call")
  const [direction, setDirection] = useState<"incoming" | "outgoing">("outgoing")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (editingLog) {
      setContactId(editingLog.contactId || "")
      setType(editingLog.communicationType)
      setDirection(editingLog.direction)
      const logDate = new Date(editingLog.communicationDate)
      setDate(format(logDate, "yyyy-MM-dd"))
      setTime(format(logDate, "HH:mm"))
      setDuration(editingLog.durationMinutes?.toString() || "")
      setNotes(editingLog.notes || "")
    } else if (open) {
      // Set defaults for new log
      const now = new Date()
      setContactId("")
      setType("call")
      setDirection("outgoing")
      setDate(format(now, "yyyy-MM-dd"))
      setTime(format(now, "HH:mm"))
      setDuration("")
      setNotes("")
    }
  }, [editingLog, open])

  const handleSave = () => {
    if (!contactId || !date || !time) return

    const communicationDate = new Date(`${date}T${time}`)

    onSave({
      contactId,
      communicationType: type,
      direction,
      communicationDate: communicationDate.toISOString(),
      durationMinutes: duration ? parseInt(duration) : undefined,
      notes: notes.trim() || undefined,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingLog ? "Edit Communication Log" : "Add Communication Log"}
          </DialogTitle>
          <DialogDescription>
            Record communication with your emergency contacts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger id="contact">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Communication Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CommunicationType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="message">Text/Message</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as "incoming" | "outgoing")}>
                <SelectTrigger id="direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                  <SelectItem value="incoming">Incoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was discussed, follow-up needed, etc."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!contactId || !date || !time}>
            {editingLog ? "Save Changes" : "Add Log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CommunicationLogsPage() {
  const {
    contacts,
    communicationLog,
    isLoaded,
    addCommunication,
    deleteCommunication,
    getRecentCommunications,
    getContactCommunications,
  } = useContacts()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<CommunicationLog | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedContact, setSelectedContact] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  const contactOptions = contacts.map((c) => ({ id: c.id, name: c.contactName }))

  // Filter logs
  const filteredLogs = communicationLog.filter((log) => {
    if (activeTab !== "all") {
      if (activeTab === "outgoing" && log.direction !== "outgoing") return false
      if (activeTab === "incoming" && log.direction !== "incoming") return false
    }
    if (selectedContact !== "all" && log.contactId !== selectedContact) return false
    if (selectedType !== "all" && log.communicationType !== selectedType) return false
    return true
  })

  // Group by date
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = format(new Date(log.communicationDate), "yyyy-MM-dd")
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {} as Record<string, CommunicationLog[]>)

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a))

  const handleSaveLog = async (logData: Omit<CommunicationLog, "id" | "createdAt" | "contactName">) => {
    await addCommunication(logData)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this communication log?")) {
      await deleteCommunication(id)
    }
  }

  // Stats
  const totalLogs = communicationLog.length
  const outgoingCount = communicationLog.filter((l) => l.direction === "outgoing").length
  const incomingCount = communicationLog.filter((l) => l.direction === "incoming").length
  const thisMonth = communicationLog.filter((l) => {
    const logDate = new Date(l.communicationDate)
    const now = new Date()
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()
  }).length

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
                <h1 className="text-xl font-bold text-foreground">Communication Logs</h1>
                <p className="text-sm text-muted-foreground">
                  Track all communications with your emergency contacts
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/emergency-contacts">
                  <Users className="w-4 h-4 mr-2" />
                  Contacts
                </Link>
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Log
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
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalLogs}</p>
                <p className="text-sm text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">{outgoingCount}</p>
                <p className="text-sm text-muted-foreground">Outgoing</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">{incomingCount}</p>
                <p className="text-sm text-muted-foreground">Incoming</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">{thisMonth}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  {contactOptions.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="message">Text/Message</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({communicationLog.length})</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing ({outgoingCount})</TabsTrigger>
            <TabsTrigger value="incoming">Incoming ({incomingCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredLogs.length > 0 ? (
              <div className="space-y-6">
                {sortedDates.map((date) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </h3>
                    <div className="space-y-3">
                      {groupedLogs[date]
                        .sort((a, b) => new Date(b.communicationDate).getTime() - new Date(a.communicationDate).getTime())
                        .map((log) => {
                          const contact = contacts.find((c) => c.id === log.contactId)
                          return (
                            <CommunicationLogCard
                              key={log.id}
                              log={log}
                              contactName={contact?.contactName || log.contactName}
                              onEdit={() => {
                                setEditingLog(log)
                                setIsDialogOpen(true)
                              }}
                              onDelete={() => handleDelete(log.id)}
                            />
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border rounded-lg">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {communicationLog.length === 0
                    ? "No communication logs yet"
                    : "No logs match your filters"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {communicationLog.length === 0
                    ? "Start tracking your communications with emergency contacts."
                    : "Try adjusting your filters to see more results."}
                </p>
                {communicationLog.length === 0 && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Log
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog */}
      <AddCommunicationDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingLog(null)
        }}
        onSave={handleSaveLog}
        contacts={contactOptions}
        editingLog={editingLog}
      />
    </div>
  )
}