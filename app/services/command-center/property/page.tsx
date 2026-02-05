"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { 
  Home, Car, Warehouse, Building2, Plus, ArrowLeft, AlertTriangle, 
  Calendar, Wrench, ChevronDown, Trash2, Edit, User, Shield, 
  Clock, CheckCircle2, Download, MapPin, FileText, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { pdf } from '@react-pdf/renderer'
import { PropertySummaryDocument, SummaryData } from '@/lib/pdf-generation/property-management'
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

function getPropertyIcon(type: PropertyType, className = "w-5 h-5") {
  const icons: Record<PropertyType, React.ReactNode> = {
    home: <Home className={className} />,
    rental: <Building2 className={className} />,
    vehicle: <Car className={className} />,
    storage: <Warehouse className={className} />,
    other: <Home className={className} />,
  }
  return icons[type] || icons.home
}

function getDaysUntil(date: string): number {
  const target = new Date(date)
  const today = new Date()
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(date: string): string {
  return new Date(date+"T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Animated gradient background component
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100" />
      <div 
        className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
          animation: 'float 20s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(168,162,158,0.2) 0%, transparent 70%)',
          animation: 'float 25s ease-in-out infinite reverse',
        }}
      />
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
      `}</style>
    </div>
  )
}

// Stat card with hover animation
function StatCard({ 
  icon, 
  value, 
  label, 
  accent = false,
  warning = false 
}: { 
  icon: React.ReactNode
  value: number
  label: string
  accent?: boolean
  warning?: boolean
}) {
  return (
    <div className={`
      group relative overflow-hidden rounded-2xl p-5
      transition-all duration-300 ease-out
      hover:scale-[1.02] hover:shadow-lg
      ${accent 
        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-amber-200/50 shadow-md' 
        : warning && value > 0
          ? 'bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200/50'
          : 'bg-white/80 backdrop-blur-sm border border-stone-200/50'
      }
    `}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-3xl font-light tracking-tight ${accent ? 'text-white' : 'text-stone-800'}`}>
            {value}
          </p>
          <p className={`text-sm mt-1 ${accent ? 'text-amber-100' : 'text-stone-500'}`}>
            {label}
          </p>
        </div>
        <div className={`
          p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110
          ${accent 
            ? 'bg-white/20' 
            : warning && value > 0
              ? 'bg-rose-200/50 text-rose-600'
              : 'bg-stone-100 text-stone-400'
          }
        `}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Property card with refined design
function PropertyCard({
  property,
  onEdit,
  onDelete,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  index,
}: {
  property: Property
  onEdit: () => void
  onDelete: () => void
  onAddTask: () => void
  onEditTask: (task: MaintenanceTask) => void
  onDeleteTask: (taskId: string) => void
  onCompleteTask: (taskId: string) => void
  index: number
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

  const typeColors: Record<PropertyType, string> = {
    home: 'from-emerald-400 to-teal-500',
    rental: 'from-violet-400 to-purple-500',
    vehicle: 'from-blue-400 to-indigo-500',
    storage: 'from-amber-400 to-orange-500',
    other: 'from-stone-400 to-stone-500',
  }

  return (
    <div 
      className="group bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-stone-200/50 shadow-sm hover:shadow-xl transition-all duration-500 ease-out"
      style={{
        animation: `fadeSlideIn 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      {/* Header with gradient accent */}
      <div className={`h-1.5 bg-gradient-to-r ${typeColors[property.propertyType]}`} />
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`
              w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[property.propertyType]}
              flex items-center justify-center text-white shadow-lg
              transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
            `}>
              {getPropertyIcon(property.propertyType)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-800 text-lg truncate">
                {property.propertyName}
              </h3>
              {property.address && (
                <p className="text-sm text-stone-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{property.address}</span>
                </p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={onEdit} className="rounded-lg">
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddTask} className="rounded-lg">
                <Wrench className="w-4 h-4 mr-2" />
                Add Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-rose-600 rounded-lg">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Caretaker Info */}
        {property.caretakerName && (
          <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-100">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                <User className="w-4 h-4 text-stone-600" />
              </div>
              <div>
                <p className="font-medium text-stone-700">{property.caretakerName}</p>
                {property.caretakerPhone && (
                  <p className="text-stone-500 text-xs">{property.caretakerPhone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expiring Items Alert */}
        {expiringItems.length > 0 && (
          <div className="mt-4 space-y-2">
            {expiringItems.map((item) => (
              <div
                key={item.label}
                className={`
                  flex items-center gap-2 text-xs px-3 py-2 rounded-xl
                  ${item.days <= 0
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : item.days <= 30
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-stone-50 text-stone-600 border border-stone-200"
                  }
                `}
              >
                {item.days <= 0 ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                <span className="font-medium">
                  {item.label}: {item.days <= 0 ? "Expired" : `Expires ${formatDate(item.date)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Tasks */}
      {pendingTasks.length > 0 && (
        <div className="px-5 pb-5">
          <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-xl p-4 border border-stone-100">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5" />
              Maintenance ({pendingTasks.length})
            </h4>
            <div className="space-y-2">
              {pendingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-stone-100 hover:border-stone-200 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-700 text-sm truncate">{task.taskName}</p>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                      {task.nextDue && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(task.nextDue)}
                        </span>
                      )}
                      {task.assignedToName && (
                        <span className="truncate">• {task.assignedToName}</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-lg h-8 w-8 p-0">
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => onCompleteTask(task.id)} className="rounded-lg">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                        Complete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditTask(task)} className="rounded-lg">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-rose-600 rounded-lg">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              {pendingTasks.length > 3 && (
                <p className="text-xs text-stone-400 text-center pt-1">
                  +{pendingTasks.length - 3} more
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insurance Footer */}
      {property.insuranceCompany && (
        <div className="px-5 py-3 bg-stone-50/50 border-t border-stone-100 flex items-center gap-2 text-sm text-stone-500">
          <Shield className="w-4 h-4" />
          <span>
            {property.insuranceCompany}
            {property.insurancePolicyNumber && (
              <span className="text-stone-400"> • #{property.insurancePolicyNumber}</span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}

// Alert card component
function AlertCard({
  type,
  title,
  children,
}: {
  type: 'warning' | 'info'
  title: string
  children: React.ReactNode
}) {
  return (
    <div className={`
      rounded-2xl p-5 border backdrop-blur-sm
      ${type === 'warning' 
        ? 'bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-amber-200/50' 
        : 'bg-white/80 border-stone-200/50'
      }
    `}>
      <div className="flex items-start gap-3">
        {type === 'warning' ? (
          <div className="p-2 rounded-xl bg-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-stone-100">
            <Clock className="w-5 h-5 text-stone-600" />
          </div>
        )}
        <div className="flex-1">
          <h3 className={`font-semibold ${type === 'warning' ? 'text-amber-800' : 'text-stone-800'}`}>
            {title}
          </h3>
          {children}
        </div>
      </div>
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
    if (contactId === "none") {
      setCaretakerContactId("")
      setCaretakerName("")
      setCaretakerPhone("")
    } else {
      const contact = emergencyContacts.find((c) => c.id === contactId)
      if (contact) {
        setCaretakerContactId(contactId)
        setCaretakerName(contact.name)
        setCaretakerPhone(contact.phone || "")
      }
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{editingProperty ? "Edit Property" : "Add Property"}</DialogTitle>
          <DialogDescription className="text-stone-500">
            Track your property, vehicle, or storage with insurance and maintenance details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prop-name" className="text-stone-700">Name</Label>
              <Input
                id="prop-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Primary Residence"
                className="rounded-xl border-stone-200 focus:border-amber-400 focus:ring-amber-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prop-type" className="text-stone-700">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as PropertyType)}>
                <SelectTrigger className="rounded-xl border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {propertyTypes.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value} className="rounded-lg">
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
            <Label htmlFor="address" className="text-stone-700">
              {isVehicle ? "Description (Year, Make, Model)" : "Address"}
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isVehicle ? "e.g., 2022 Toyota Tacoma" : "e.g., 123 Main St, City, State"}
              className="rounded-xl border-stone-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>

          <div className="border-t border-stone-100 pt-5">
            <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-stone-400" />
              Insurance Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance-company" className="text-stone-600 text-sm">Company</Label>
                <Input
                  id="insurance-company"
                  value={insuranceCompany}
                  onChange={(e) => setInsuranceCompany(e.target.value)}
                  placeholder="e.g., USAA"
                  className="rounded-xl border-stone-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance-policy" className="text-stone-600 text-sm">Policy Number</Label>
                <Input
                  id="insurance-policy"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  placeholder="e.g., ABC123456"
                  className="rounded-xl border-stone-200"
                />
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <Label htmlFor="insurance-expiry" className="text-stone-600 text-sm">Expiration Date</Label>
              <Input
                id="insurance-expiry"
                type="date"
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
                className="rounded-xl border-stone-200"
              />
            </div>
          </div>

          {isVehicle && (
            <div className="border-t border-stone-100 pt-5">
              <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
                <Car className="w-4 h-4 text-stone-400" />
                Vehicle Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration" className="text-stone-600 text-sm">Registration Expiry</Label>
                  <Input
                    id="registration"
                    type="date"
                    value={registrationExpiry}
                    onChange={(e) => setRegistrationExpiry(e.target.value)}
                    className="rounded-xl border-stone-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspection" className="text-stone-600 text-sm">Inspection Expiry</Label>
                  <Input
                    id="inspection"
                    type="date"
                    value={inspectionExpiry}
                    onChange={(e) => setInspectionExpiry(e.target.value)}
                    className="rounded-xl border-stone-200"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-stone-100 pt-5">
            <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-stone-400" />
              Caretaker (while deployed)
            </h4>
            {emergencyContacts.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="caretaker-contact" className="text-stone-600 text-sm">
                    Select from Emergency Contacts
                  </Label>
                  <Select value={caretakerContactId} onValueChange={handleCaretakerChange}>
                    <SelectTrigger className="rounded-xl border-stone-200">
                      <SelectValue placeholder="Choose a contact or enter manually" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none" className="rounded-lg">None (Enter manually)</SelectItem>
                      {emergencyContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id} className="rounded-lg">
                          {contact.name} {contact.phone && `- ${contact.phone}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-stone-400 mt-2 mb-3">
                  Or enter caretaker details manually below
                </p>
              </>
            ) : (
              <p className="text-sm text-stone-500 mb-3 p-3 bg-stone-50 rounded-xl">
                No emergency contacts found. Add contacts in your Emergency Contacts section.
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caretaker-name" className="text-stone-600 text-sm">Name</Label>
                <Input
                  id="caretaker-name"
                  value={caretakerName}
                  onChange={(e) => {
                    setCaretakerName(e.target.value)
                    setCaretakerContactId("")
                  }}
                  placeholder="e.g., John Smith"
                  className="rounded-xl border-stone-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caretaker-phone" className="text-stone-600 text-sm">Phone</Label>
                <Input
                  id="caretaker-phone"
                  value={caretakerPhone}
                  onChange={(e) => {
                    setCaretakerPhone(e.target.value)
                    setCaretakerContactId("")
                  }}
                  placeholder="e.g., (555) 123-4567"
                  className="rounded-xl border-stone-200"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-stone-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-400" />
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="rounded-xl border-stone-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-stone-200"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim()}
            className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-0"
          >
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

  useEffect(() => {
    if (editingTask && open) {
      setTaskName(editingTask.taskName || "")
      setDescription(editingTask.description || "")
      setFrequency(editingTask.frequency || "monthly")
      setNextDue(editingTask.nextDue || "")
      setAssignedToContactId(editingTask.assignedToContactId || "")
      setAssignedToName(editingTask.assignedToName || "")
    } else if (!open) {
      setTaskName("")
      setDescription("")
      setFrequency("monthly")
      setNextDue("")
      setAssignedToContactId("")
      setAssignedToName("")
    }
  }, [editingTask, open])

  const handleAssigneeChange = (contactId: string) => {
    if (contactId === "none") {
      setAssignedToName("")
    } else {
      setAssignedToContactId(contactId)
      const contact = emergencyContacts.find(c => c.id === contactId)
      if (contact) {
        setAssignedToName(contact.name)
      }
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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingTask ? "Edit Task" : "Add Maintenance Task"}
          </DialogTitle>
          <DialogDescription className="text-stone-500">
            {editingTask ? "Update the" : "Add a"} maintenance task for {propertyName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-stone-700">Task Name</Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Change oil, Check HVAC filter"
              className="rounded-xl border-stone-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc" className="text-stone-700">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about the task..."
              rows={2}
              className="rounded-xl border-stone-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-stone-600 text-sm">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as MaintenanceFrequency)}>
                <SelectTrigger className="rounded-xl border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {maintenanceFrequencies.map((f) => (
                    <SelectItem key={f.value} value={f.value} className="rounded-lg">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="next-due" className="text-stone-600 text-sm">Next Due Date</Label>
              <Input
                id="next-due"
                type="date"
                value={nextDue}
                onChange={(e) => setNextDue(e.target.value)}
                className="rounded-xl border-stone-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigned-to" className="text-stone-700">Assign To</Label>
            {emergencyContacts.length > 0 ? (
              <>
                <Select value={assignedToContactId} onValueChange={handleAssigneeChange}>
                  <SelectTrigger className="rounded-xl border-stone-200">
                    <SelectValue placeholder="Choose a contact or enter name" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none" className="rounded-lg">None (Enter name manually)</SelectItem>
                    {emergencyContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id} className="rounded-lg">
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
                  className="mt-2 rounded-xl border-stone-200"
                />
              </>
            ) : (
              <Input
                id="assigned-to"
                value={assignedToName}
                onChange={(e) => setAssignedToName(e.target.value)}
                placeholder="e.g., Caretaker name or self"
                className="rounded-xl border-stone-200"
              />
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-stone-200"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!taskName.trim()}
            className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-0"
          >
            {editingTask ? "Save Changes" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Empty state component
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-16 px-8">
      <div className="relative inline-block">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Home className="w-10 h-10 text-amber-600" />
        </div>
        <div 
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg"
          style={{ animation: 'bounce 2s ease-in-out infinite' }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      <h3 className="text-xl font-semibold text-stone-800 mb-2">No properties yet</h3>
      <p className="text-stone-500 mb-6 max-w-sm mx-auto">
        Add your properties and vehicles to track maintenance schedules and insurance details.
      </p>
      <Button 
        onClick={onAdd}
        className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-0 shadow-lg shadow-amber-200/50 px-6"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Your First Property
      </Button>
    </div>
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
      updateMaintenanceTask(taskDialogState.property.id, taskDialogState.editingTask.id, task)
    } else {
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

      const doc = <PropertySummaryDocument data={summaryData} />
      const asPdf = pdf(doc)
      const blob = await asPdf.toBlob()
      
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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center animate-pulse">
            <Home className="w-6 h-6 text-white" />
          </div>
          <p className="text-stone-500">Loading your properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
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
                  Property & Vehicle Manager
                </h1>
                <p className="text-white/80 mt-1">
                  Track homes, vehicles, and maintenance schedules
                </p>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                onClick={handleDownloadSummary}
                disabled={isDownloading || properties.length === 0}
                asChild
              >
                <div className="cursor-pointer">
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? "Generating..." : "Export PDF"}
                </div>
              </Button>
              <Button
                className="bg-white text-primary hover:bg-white/90 cursor-pointer"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{properties.length}</p>
                  <p className="text-sm text-white/70">Total Properties</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{vehicles.length}</p>
                  <p className="text-sm text-white/70">Vehicles</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{upcomingMaintenance.length}</p>
                  <p className="text-sm text-white/70">Tasks Due</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{expiringItems.length}</p>
                  <p className="text-sm text-white/70">Expiring Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Alerts Section */}
        {(upcomingMaintenance.length > 0 || expiringItems.length > 0) && (
          <div className="space-y-4 mb-8">
            {expiringItems.length > 0 && (
              <AlertCard type="warning" title="Items Expiring Soon">
                <div className="flex flex-wrap gap-2 mt-3">
                  {expiringItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/80 text-amber-800 text-xs font-medium border border-amber-200"
                    >
                      {item.propertyName}: {item.type}
                      <span className="ml-2 text-amber-600">({formatDate(item.date)})</span>
                    </span>
                  ))}
                </div>
              </AlertCard>
            )}

            {upcomingMaintenance.length > 0 && (
              <AlertCard type="info" title="Upcoming Maintenance">
                <div className="space-y-2 mt-3">
                  {upcomingMaintenance.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-stone-800">{task.taskName}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {task.propertyName} • Due: {formatDate(task.nextDue!)}
                          {task.assignedToName && ` • ${task.assignedToName}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AlertCard>
            )}
          </div>
        )}

        {/* Tabs and Property Grid */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-stone-200/50">
              <TabsTrigger 
                value="all" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-white"
              >
                All ({properties.length})
              </TabsTrigger>
              <TabsTrigger 
                value="homes"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-white"
              >
                Homes ({homes.length})
              </TabsTrigger>
              <TabsTrigger 
                value="vehicles"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-white"
              >
                Vehicles ({vehicles.length})
              </TabsTrigger>
              <TabsTrigger 
                value="other"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-white"
              >
                Other
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {filteredProperties.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredProperties.map((prop, index) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    index={index}
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200/50">
                <EmptyState onAdd={() => setIsAddDialogOpen(true)} />
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