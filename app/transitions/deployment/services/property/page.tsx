"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Home, Car, Warehouse, Building2, Plus, ArrowLeft, AlertTriangle, Calendar, Wrench, ChevronDown, Trash2, Edit, User, Phone, Shield, Clock, CheckCircle2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { pdf } from '@react-pdf/renderer'
import { PropertySummaryDocument, SummaryData } from '@/lib/pdf-generator'
import {
  useProperties,
  type Property,
  type PropertyType,
  type MaintenanceTask,
  type MaintenanceFrequency,
  type EmergencyContact,
} from "@/hooks/use-properties"

const propertyTypes: { value: PropertyType; label: string; icon: React.ReactNode }[] = [
  { value: "home", label: "Home / Residence", icon: <Home className="w-4 h-4" /> },
  { value: "rental", label: "Rental Property", icon: <Building2 className="w-4 h-4" /> },
  { value: "vehicle", label: "Vehicle", icon: <Car className="w-4 h-4" /> },
  { value: "storage", label: "Storage Unit", icon: <Warehouse className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <Home className="w-4 h-4" /> },
]

const maintenanceFrequencies: { value: MaintenanceFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
  { value: "one_time", label: "One Time" },
]

function getPropertyIcon(type: PropertyType) {
  const found = propertyTypes.find((t) => t.value === type)
  return found?.icon || <Home className="w-4 h-4" />
}

function getDaysUntil(date: string): number {
  const target = new Date(date)
  const today = new Date()
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function PropertyCard({
  property,
  onEdit,
  onDelete,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
}: {
  property: Property
  onEdit: () => void
  onDelete: () => void
  onAddTask: () => void
  onEditTask: (task: MaintenanceTask) => void
  onDeleteTask: (taskId: string) => void
  onCompleteTask: (taskId: string) => void
}) {
  const pendingTasks = property.maintenanceTasks.filter((t) => !t.isCompleted)
  const expiringItems: { label: string; date: string; days: number }[] = []

  if (property.insuranceExpiry) {
    const days = getDaysUntil(property.insuranceExpiry)
    if (days <= 60) expiringItems.push({ label: "Insurance", date: property.insuranceExpiry, days })
  }
  if (property.registrationExpiry) {
    const days = getDaysUntil(property.registrationExpiry)
    if (days <= 60) expiringItems.push({ label: "Registration", date: property.registrationExpiry, days })
  }
  if (property.inspectionExpiry) {
    const days = getDaysUntil(property.inspectionExpiry)
    if (days <= 60) expiringItems.push({ label: "Inspection", date: property.inspectionExpiry, days })
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              {getPropertyIcon(property.propertyType)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{property.propertyName}</h3>
              {property.address && (
                <p className="text-sm text-muted-foreground">{property.address}</p>
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
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddTask}>
                <Wrench className="w-4 h-4 mr-2" />
                Add Maintenance Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Caretaker Info */}
        {property.caretakerName && (
          <div className="mt-3 flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Caretaker: {property.caretakerName}</span>
            </div>
            {property.caretakerPhone && (
              <div className="flex items-center gap-1 text-muted-foreground pl-5">
                <Phone className="w-3 h-3" />
                <span>{property.caretakerPhone}</span>
              </div>
            )}
            {property.caretakerEmail && (
              <div className="flex items-center gap-1 text-muted-foreground pl-5 text-xs">
                <span>{property.caretakerEmail}</span>
              </div>
            )}
          </div>
        )}

        {/* Expiring Items Alert */}
        {expiringItems.length > 0 && (
          <div className="mt-3 space-y-1">
            {expiringItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                  item.days <= 0
                    ? "bg-destructive/10 text-destructive"
                    : item.days <= 30
                    ? "bg-amber-100 text-amber-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {item.days <= 0 ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>
                  {item.label}: {item.days <= 0 ? "Expired" : `Expires ${formatDate(item.date)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Tasks */}
      {pendingTasks.length > 0 && (
        <div className="p-4 bg-muted/30">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Upcoming Maintenance ({pendingTasks.length})
          </h4>
          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between bg-card rounded p-2 text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{task.taskName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {task.nextDue && (
                      <span>Due: {formatDate(task.nextDue)}</span>
                    )}
                    {task.assignedToName && (
                      <span>• {task.assignedToName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onCompleteTask(task.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditTask(task)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {pendingTasks.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{pendingTasks.length - 3} more tasks
              </p>
            )}
          </div>
        </div>
      )}

      {/* Insurance Info */}
      {property.insuranceCompany && (
        <div className="px-4 py-3 border-t text-sm flex items-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>
            {property.insuranceCompany}
            {property.insurancePolicyNumber && ` (#${property.insurancePolicyNumber})`}
          </span>
        </div>
      )}
    </div>
  )
}

function AddPropertyDialog({
  open,
  onOpenChange,
  onSave,
  editingProperty,
  emergencyContacts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (prop: Omit<Property, "id" | "createdAt" | "updatedAt" | "maintenanceTasks">) => void
  editingProperty?: Property | null
  emergencyContacts: EmergencyContact[]
}) {
  const [name, setName] = useState("")
  const [type, setType] = useState<PropertyType>("home")
  const [address, setAddress] = useState("")
  const [insuranceCompany, setInsuranceCompany] = useState("")
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("")
  const [insuranceExpiry, setInsuranceExpiry] = useState("")
  const [registrationExpiry, setRegistrationExpiry] = useState("")
  const [inspectionExpiry, setInspectionExpiry] = useState("")
  const [caretakerContactId, setCaretakerContactId] = useState("")
  const [caretakerName, setCaretakerName] = useState("")
  const [caretakerPhone, setCaretakerPhone] = useState("")
  const [notes, setNotes] = useState("")

  // Populate form when editing
  useEffect(() => {
    if (editingProperty && open) {
      setName(editingProperty.propertyName || "")
      setType(editingProperty.propertyType || "home")
      setAddress(editingProperty.address || "")
      setInsuranceCompany(editingProperty.insuranceCompany || "")
      setInsurancePolicyNumber(editingProperty.insurancePolicyNumber || "")
      setInsuranceExpiry(editingProperty.insuranceExpiry || "")
      setRegistrationExpiry(editingProperty.registrationExpiry || "")
      setInspectionExpiry(editingProperty.inspectionExpiry || "")
      setCaretakerContactId(editingProperty.caretakerContactId || "")
      setCaretakerName(editingProperty.caretakerName || "")
      setCaretakerPhone(editingProperty.caretakerPhone || "")
      setNotes(editingProperty.notes || "")
    } else if (!open) {
      // Reset when dialog closes
      setName("")
      setType("home")
      setAddress("")
      setInsuranceCompany("")
      setInsurancePolicyNumber("")
      setInsuranceExpiry("")
      setRegistrationExpiry("")
      setInspectionExpiry("")
      setCaretakerContactId("")
      setCaretakerName("")
      setCaretakerPhone("")
      setNotes("")
    }
  }, [editingProperty, open])

  const handleCaretakerChange = (contactId: string) => {
    setCaretakerContactId(contactId)
    if (contactId) {
      const contact = emergencyContacts.find(c => c.id === contactId)
      if (contact) {
        setCaretakerName(contact.name)
        setCaretakerPhone(contact.phone || "")
      }
    } else {
      setCaretakerName("")
      setCaretakerPhone("")
    }
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      propertyName: name.trim(),
      propertyType: type,
      address: address.trim() || undefined,
      insuranceCompany: insuranceCompany.trim() || undefined,
      insurancePolicyNumber: insurancePolicyNumber.trim() || undefined,
      insuranceExpiry: insuranceExpiry || undefined,
      registrationExpiry: registrationExpiry || undefined,
      inspectionExpiry: inspectionExpiry || undefined,
      caretakerContactId: caretakerContactId || undefined,
      caretakerName: caretakerName.trim() || undefined,
      caretakerPhone: caretakerPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  const isVehicle = type === "vehicle"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProperty ? "Edit Property" : "Add Property"}</DialogTitle>
          <DialogDescription>
            Track your property, vehicle, or storage with insurance and maintenance details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prop-name">Name</Label>
              <Input
                id="prop-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Primary Residence"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prop-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as PropertyType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      <span className="flex items-center gap-2">
                        {pt.icon}
                        {pt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{isVehicle ? "Description (Year, Make, Model)" : "Address"}</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isVehicle ? "e.g., 2022 Toyota Tacoma" : "e.g., 123 Main St, City, State"}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Insurance Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance-company">Company</Label>
                <Input
                  id="insurance-company"
                  value={insuranceCompany}
                  onChange={(e) => setInsuranceCompany(e.target.value)}
                  placeholder="e.g., USAA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance-policy">Policy Number</Label>
                <Input
                  id="insurance-policy"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  placeholder="e.g., ABC123456"
                />
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <Label htmlFor="insurance-expiry">Insurance Expiration</Label>
              <Input
                id="insurance-expiry"
                type="date"
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
              />
            </div>
          </div>

          {isVehicle && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration">Registration Expiry</Label>
                  <Input
                    id="registration"
                    type="date"
                    value={registrationExpiry}
                    onChange={(e) => setRegistrationExpiry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspection">Inspection Expiry</Label>
                  <Input
                    id="inspection"
                    type="date"
                    value={inspectionExpiry}
                    onChange={(e) => setInspectionExpiry(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Caretaker (while deployed)</h4>
            {emergencyContacts.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="caretaker-contact">Select from Emergency Contacts</Label>
                  <Select value={caretakerContactId} onValueChange={handleCaretakerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact or enter manually" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Enter manually)</SelectItem>
                      {emergencyContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} {contact.phone && `- ${contact.phone}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-2 mb-3">
                  Or enter caretaker details manually below
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">
                No emergency contacts found. Add contacts in your Emergency Contacts section.
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caretaker-name">Name</Label>
                <Input
                  id="caretaker-name"
                  value={caretakerName}
                  onChange={(e) => {
                    setCaretakerName(e.target.value)
                    setCaretakerContactId("")
                  }}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caretaker-phone">Phone</Label>
                <Input
                  id="caretaker-phone"
                  value={caretakerPhone}
                  onChange={(e) => {
                    setCaretakerPhone(e.target.value)
                    setCaretakerContactId("")
                  }}
                  placeholder="e.g., (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {editingProperty ? "Save Changes" : "Add Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddTaskDialog({
  open,
  onOpenChange,
  onSave,
  propertyName,
  editingTask,
  emergencyContacts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Omit<MaintenanceTask, "id" | "propertyId" | "createdAt" | "updatedAt">) => void
  propertyName: string
  editingTask?: MaintenanceTask | null
  emergencyContacts: EmergencyContact[]
}) {
  const [taskName, setTaskName] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState<MaintenanceFrequency>("monthly")
  const [nextDue, setNextDue] = useState("")
  const [assignedToContactId, setAssignedToContactId] = useState("")
  const [assignedToName, setAssignedToName] = useState("")

  // Populate form when editing
  useEffect(() => {
    if (editingTask && open) {
      setTaskName(editingTask.taskName || "")
      setDescription(editingTask.description || "")
      setFrequency(editingTask.frequency || "monthly")
      setNextDue(editingTask.nextDue || "")
      setAssignedToContactId(editingTask.assignedToContactId || "")
      setAssignedToName(editingTask.assignedToName || "")
    } else if (!open) {
      // Reset when dialog closes
      setTaskName("")
      setDescription("")
      setFrequency("monthly")
      setNextDue("")
      setAssignedToContactId("")
      setAssignedToName("")
    }
  }, [editingTask, open])

  const handleAssigneeChange = (contactId: string) => {
    setAssignedToContactId(contactId)
    if (contactId) {
      const contact = emergencyContacts.find(c => c.id === contactId)
      if (contact) {
        setAssignedToName(contact.name)
      }
    } else {
      setAssignedToName("")
    }
  }

  const handleSave = () => {
    if (!taskName.trim()) return
    onSave({
      taskName: taskName.trim(),
      description: description.trim() || undefined,
      frequency,
      nextDue: nextDue || undefined,
      assignedToContactId: assignedToContactId || undefined,
      assignedToName: assignedToName.trim() || undefined,
      isCompleted: false,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTask ? "Edit Maintenance Task" : "Add Maintenance Task"}</DialogTitle>
          <DialogDescription>
            {editingTask ? "Update the" : "Add a"} maintenance task for {propertyName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Change oil, Check HVAC filter"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about the task..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as MaintenanceFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceFrequencies.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="next-due">Next Due Date</Label>
              <Input
                id="next-due"
                type="date"
                value={nextDue}
                onChange={(e) => setNextDue(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigned-to">Assign To</Label>
            {emergencyContacts.length > 0 ? (
              <>
                <Select value={assignedToContactId} onValueChange={handleAssigneeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a contact or enter name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Enter name manually)</SelectItem>
                    {emergencyContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="assigned-to"
                  value={assignedToName}
                  onChange={(e) => {
                    setAssignedToName(e.target.value)
                    setAssignedToContactId("")
                  }}
                  placeholder="Or enter name directly"
                  className="mt-2"
                />
              </>
            ) : (
              <Input
                id="assigned-to"
                value={assignedToName}
                onChange={(e) => setAssignedToName(e.target.value)}
                placeholder="e.g., Caretaker name or self"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!taskName.trim()}>
            {editingTask ? "Save Changes" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PropertyManagerPage() {
  const {
    properties,
    emergencyContacts,
    isLoaded,
    addProperty,
    updateProperty,
    deleteProperty,
    addMaintenanceTask,
    updateMaintenanceTask,
    deleteMaintenanceTask,
    getUpcomingMaintenance,
    getExpiringItems,
  } = useProperties()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [taskDialogState, setTaskDialogState] = useState<{
    property: Property | null
    editingTask: MaintenanceTask | null
  }>({ property: null, editingTask: null })
  const [activeTab, setActiveTab] = useState("all")
  const [isDownloading, setIsDownloading] = useState(false)

  const upcomingMaintenance = getUpcomingMaintenance(30)
  const expiringItems = getExpiringItems(60)
  const vehicles = properties.filter((p) => p.propertyType === "vehicle")
  const homes = properties.filter((p) => p.propertyType === "home" || p.propertyType === "rental")

  const handleSaveProperty = (propData: Omit<Property, "id" | "createdAt" | "updatedAt" | "maintenanceTasks">) => {
    if (editingProperty) {
      updateProperty(editingProperty.id, propData)
      setEditingProperty(null)
    } else {
      addProperty(propData)
    }
  }

  const handleSaveTask = (task: Omit<MaintenanceTask, "id" | "propertyId" | "createdAt" | "updatedAt">) => {
    if (!taskDialogState.property) return

    if (taskDialogState.editingTask) {
      // Update existing task
      updateMaintenanceTask(taskDialogState.property.id, taskDialogState.editingTask.id, task)
    } else {
      // Add new task
      addMaintenanceTask(taskDialogState.property.id, task)
    }
  }

  const handleCompleteTask = (propertyId: string, taskId: string) => {
    updateMaintenanceTask(propertyId, taskId, {
      isCompleted: true,
      lastCompleted: new Date().toISOString().split("T")[0],
    })
  }

  const handleDeleteTask = (propertyId: string, taskId: string) => {
    if (confirm("Are you sure you want to delete this maintenance task?")) {
      deleteMaintenanceTask(propertyId, taskId)
    }
  }

  const handleDownloadSummary = async () => {
    setIsDownloading(true)
    try {
      const summaryData: SummaryData = {
        properties: properties.map(p => ({
          ...p,
          maintenanceTasks: p.maintenanceTasks.filter(t => !t.isCompleted)
        })),
        vehicles: vehicles.map(v => ({
          ...v,
          maintenanceTasks: v.maintenanceTasks.filter(t => !t.isCompleted)
        })),
        upcomingTasks: upcomingMaintenance,
        expiringItems: expiringItems
      }

      // Generate PDF on client side
      const doc = <PropertySummaryDocument data={summaryData} />
      const asPdf = pdf(doc)
      const blob = await asPdf.toBlob()
      
      // Download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `property-summary-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to generate summary:', error)
      alert('Failed to generate summary. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const filteredProperties =
    activeTab === "all"
      ? properties
      : activeTab === "vehicles"
      ? vehicles
      : activeTab === "homes"
      ? homes
      : properties.filter((p) => p.propertyType === "storage" || p.propertyType === "other")

  if (!isLoaded) {
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
                <Link href="/transitions/deployment/services">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Property & Vehicle Manager</h1>
                <p className="text-sm text-muted-foreground">
                  Track homes, vehicles, and maintenance schedules
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleDownloadSummary}
                disabled={isDownloading || properties.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Generating..." : "Download Summary"}
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
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
              <Home className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{properties.length}</p>
                <p className="text-sm text-muted-foreground">Total Properties</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{vehicles.length}</p>
                <p className="text-sm text-muted-foreground">Vehicles</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{upcomingMaintenance.length}</p>
                <p className="text-sm text-muted-foreground">Tasks Due</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle
                className={`w-5 h-5 ${expiringItems.length > 0 ? "text-amber-500" : "text-muted-foreground"}`}
              />
              <div>
                <p className="text-2xl font-bold text-foreground">{expiringItems.length}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(upcomingMaintenance.length > 0 || expiringItems.length > 0) && (
          <div className="space-y-4 mb-8">
            {expiringItems.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800">Items Expiring Soon</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {expiringItems.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs"
                        >
                          {item.propertyName}: {item.type} ({formatDate(item.date)})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {upcomingMaintenance.length > 0 && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-medium text-foreground flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-accent" />
                  Upcoming Maintenance
                </h3>
                <div className="space-y-2">
                  {upcomingMaintenance.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">{task.taskName}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.propertyName} - Due: {formatDate(task.nextDue!)}
                          {task.assignedToName && ` - ${task.assignedToName}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Property List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({properties.length})</TabsTrigger>
            <TabsTrigger value="homes">Homes ({homes.length})</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles ({vehicles.length})</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredProperties.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onEdit={() => {
                      setEditingProperty(prop)
                      setIsAddDialogOpen(true)
                    }}
                    onDelete={() => {
                      if (confirm("Are you sure you want to delete this property?")) {
                        deleteProperty(prop.id)
                      }
                    }}
                    onAddTask={() => setTaskDialogState({ property: prop, editingTask: null })}
                    onEditTask={(task) => setTaskDialogState({ property: prop, editingTask: task })}
                    onDeleteTask={(taskId) => handleDeleteTask(prop.id, taskId)}
                    onCompleteTask={(taskId) => handleCompleteTask(prop.id, taskId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border rounded-lg">
                <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No properties yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your properties and vehicles to track maintenance and insurance.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Dialogs */}
      <AddPropertyDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) setEditingProperty(null)
        }}
        onSave={handleSaveProperty}
        editingProperty={editingProperty}
        emergencyContacts={emergencyContacts}
      />

      {taskDialogState.property && (
        <AddTaskDialog
          open={!!taskDialogState.property}
          onOpenChange={(open) => {
            if (!open) setTaskDialogState({ property: null, editingTask: null })
          }}
          onSave={handleSaveTask}
          propertyName={taskDialogState.property.propertyName}
          editingTask={taskDialogState.editingTask}
          emergencyContacts={emergencyContacts}
        />
      )}
    </div>
  )
}