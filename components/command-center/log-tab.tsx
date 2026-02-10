"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Phone, Video, Mail, MessageSquare, FileText, Check, Trash2, ChevronsUpDown, Edit, Calendar, Clock, Filter, History, MoreVertical, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { CommunicationLog, CommunicationType } from "@/lib/types"
import { useCommunicationHub } from "@/hooks/use-communication-hub"
import { format } from "date-fns"
import { Command, CommandEmpty, CommandGroup,CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const communicationIcons: Record<CommunicationType, any> = {
  call: Phone,
  video: Video,
  email: Mail,
  message: MessageSquare,
  letter: FileText,
}

const communicationColors: Record<CommunicationType, string> = {
  call: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  video: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  email: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  message: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  letter: "text-slate-600 bg-slate-100 dark:bg-slate-900/30",
}

export function AddCommunicationDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  contacts,
  editingLog,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (log: Omit<CommunicationLog, "id" | "createdAt" | "contactName">) => void
  onUpdate: (
    logId: string,
    updates: Partial<Omit<CommunicationLog, "id" | "createdAt" | "contactName" | "user_id">>
  ) => void
  contacts: Array<{ id: string; name: string; email: string }>
  editingLog?: CommunicationLog | null
}) {
  const [contactId, setContactId] = useState<string>("")
  const [type, setType] = useState<CommunicationType>("call")
  const [direction, setDirection] = useState<"incoming" | "outgoing" | "twoway">("twoway")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")
  const [openContacts, setOpenContacts] = useState(false)
  const [search, setSearch] = useState("")

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
      const now = new Date()
      setContactId("")
      setType("call")
      setDirection("twoway")
      setDate(format(now, "yyyy-MM-dd"))
      setTime(format(now, "HH:mm"))
      setDuration("")
      setNotes("")
    }
  }, [editingLog, open])

  const handleSave = () => {
    if (!contactId || !date || !time) return

    const communicationDate = new Date(`${date}T${time}`)

    const logData = {
      contactId,
      communicationType: type,
      direction,
      communicationDate: communicationDate.toISOString(),
      durationMinutes: duration ? parseInt(duration) : undefined,
      notes: notes.trim() || undefined,
    }

    if (editingLog) {
      onUpdate(editingLog.id, logData)
    } else {
      onSave(logData)
    }

    onOpenChange(false)
  }

  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase()
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    ).slice(0,5)
  }, [contacts, search])

  const selectedContact = contacts.find(
    (c) => c.id === contactId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            {editingLog ? "Edit Communication Log" : "Log Communication"}
          </DialogTitle>
          <DialogDescription>Record a past communication for your records</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Contact</Label>
            <Popover open={openContacts} onOpenChange={setOpenContacts}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openContacts}
                  className="w-full justify-between"
                >
                  {selectedContact
                    ? `${selectedContact.name} (${selectedContact.email})`
                    : "Search contacts..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Type name or email..."
                    value={search}
                    onValueChange={setSearch}
                  />

                  <CommandEmpty>No contacts found.</CommandEmpty>

                  <CommandGroup className="max-h-60 overflow-auto">
                    {filteredContacts.map((contact) => (
                      <CommandItem
                        key={contact.id}
                        value={contact.id}
                        onSelect={() => {
                          setContactId(contact.id)
                          setOpenContacts(false)
                          setSearch("")
                        }}
                      >
                        {contact.name} ({contact.email})

                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            contactId === contact.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
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
              <Select
                value={direction}
                onValueChange={(v) => setDirection(v as "incoming" | "outgoing" | "twoway")}
              >
                <SelectTrigger id="direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twoway">Two Way</SelectItem>
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
    <div className="bg-card border rounded-lg p-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{contactName}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  log.direction === "twoway"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : log.direction === "outgoing"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {log.direction === "twoway" ? "Two Way" : log.direction === "outgoing" ? "Outgoing" : "Incoming"}
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
            {log.notes && <p className="mt-2 text-sm text-muted-foreground">{log.notes}</p>}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
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

export function LogTab() {
  const {
    contacts,
    communicationLog,
    isLoaded,
    isSyncing,
    syncError,
    addCommunication,
    updateCommunication,
    deleteCommunication
  } = useCommunicationHub()

  // Dialog states
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<CommunicationLog | null>(null)

  // View states
  const [logFilter, setLogFilter] = useState<string>("all")
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all")

  // Derived data
  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: c.contactName,
    email: c.email || "",
  }))

  const filteredLogs = useMemo(() => {
    let logs = communicationLog

    if (logFilter !== "all") {
      logs = logs.filter((l) => l.contactId === logFilter)
    }

    if (logTypeFilter !== "all") {
      logs = logs.filter((l) => l.communicationType === logTypeFilter)
    }

    return logs
  }, [communicationLog, logFilter, logTypeFilter])

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, CommunicationLog[]> = {}
    filteredLogs.forEach((log) => {
      const date = format(new Date(log.communicationDate), "yyyy-MM-dd")
      if (!groups[date]) groups[date] = []
      groups[date].push(log)
    })
    return groups
  }, [filteredLogs])

  const sortedLogDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a))

  const handleDeleteLog = async (id: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      await deleteCommunication(id)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading communication hub...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <TabsContent value="logs" className="space-y-6">
        {/* Filters */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium">Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={logFilter} onValueChange={setLogFilter}>
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
              <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
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

        {/* Logs List */}
        {filteredLogs.length > 0 ? (
          <div className="space-y-6">
            {sortedLogDates.map((date) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </h3>
                <div className="space-y-3">
                  {groupedLogs[date]
                    .sort(
                      (a, b) =>
                        new Date(b.communicationDate).getTime() -
                        new Date(a.communicationDate).getTime()
                    )
                    .map((log) => {
                      const contact = contacts.find((c) => c.id === log.contactId)
                      return (
                        <CommunicationLogCard
                          key={log.id}
                          log={log}
                          contactName={contact?.contactName || log.contactName}
                          onEdit={() => {
                            setEditingLog(log)
                            setIsLogDialogOpen(true)
                          }}
                          onDelete={() => handleDeleteLog(log.id)}
                        />
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border rounded-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {communicationLog.length === 0
                ? "No communication logs yet"
                : "No logs match your filters"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {communicationLog.length === 0
                ? "Start tracking your communications for future reference"
                : "Try adjusting your filters to see more results"}
            </p>
            {communicationLog.length === 0 && (
              <Button onClick={() => setIsLogDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Log
              </Button>
            )}
          </div>
        )}
      </TabsContent>

      <AddCommunicationDialog
        open={isLogDialogOpen}
        onOpenChange={(open) => {
          setIsLogDialogOpen(open)
          if (!open) setEditingLog(null)
        }}
        onSave={addCommunication}
        onUpdate={updateCommunication}
        contacts={contactOptions}
        editingLog={editingLog}
      />

      {/* Sync indicator */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Syncing...</span>
        </div>
      )}

      {/* Error indicator */}
      {syncError && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{syncError}</span>
        </div>
      )}
    </>
  )
}