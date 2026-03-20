"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  PawPrint, Plus, ArrowLeft, Phone, User, ChevronDown, Trash2, Edit,
  Heart, Stethoscope, Calendar, AlertTriangle, Pill, Shield, ClipboardList,
  DollarSign, Home, ExternalLink, Syringe, X, MoreVertical, Loader2, Beef, ChevronsUpDown, Check
} from "lucide-react"
import { usePets, type Pet, type PetType, type VetRecord } from "@/hooks/use-pets"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { useProperties, type EmergencyContact } from "@/hooks/use-properties"
import { cn } from "@/lib/utils"

// ─── Constants ───────────────────────────────────────────────────────────────

const PET_TYPES: { value: PetType; label: string; emoji: string }[] = [
  { value: "dog", label: "Dog", emoji: "🐕" },
  { value: "cat", label: "Cat", emoji: "🐈" },
  { value: "bird", label: "Bird", emoji: "🐦" },
  { value: "fish", label: "Fish", emoji: "🐟" },
  { value: "reptile", label: "Reptile", emoji: "🦎" },
  { value: "small_mammal", label: "Small Mammal", emoji: "🐹" },
  { value: "other", label: "Other", emoji: "🐾" },
]

const RESOURCES = [
  {
    name: "Dogs on Deployment",
    url: "https://www.dogsondeployment.org/",
    desc: "Find volunteer foster families for your pets during deployment. Also offers financial assistance for pet emergencies.",
    tags: ["Foster Care", "Financial Aid"],
  },
  {
    name: "Guardian Angels for Soldier's Pet",
    url: "https://guardianangelsforsoldierspet.org/",
    desc: "Connects military members with volunteer foster families across all 50 states and every branch of service.",
    tags: ["Foster Care", "All Branches"],
  },
  {
    name: "PACT for Animals",
    url: "https://pactforanimals.org/",
    desc: "Screens and matches fosterers with service members. Facilitates regular contact between pets, owners, and caretakers.",
    tags: ["Foster Care", "Matching"],
  },
  {
    name: "Military OneSource – Pet Resources",
    url: "https://www.militaryonesource.mil/moving-pcs/plan-to-move/moving-with-pets/",
    desc: "Official DoD resource for PCS moves with pets, including reimbursement info and travel requirements.",
    tags: ["PCS Moves", "Official DoD"],
  },
  {
    name: "SPCA International – Operation Military Pets",
    url: "https://www.spcai.org/",
    desc: "Provides grants to military families who need financial assistance with pet relocation during PCS moves.",
    tags: ["Relocation Grants", "Financial Aid"],
  },
  {
    name: "Pets for Patriots",
    url: "https://www.petsforpatriots.org/",
    desc: "Helps veterans adopt companion pets from shelters and connects those needing foster care with resources.",
    tags: ["Adoption", "Veterans"],
  },
]

const CHECKLIST = [
  { icon: User, text: "Assign a trusted caregiver or foster family", color: "text-emerald-400" },
  { icon: ClipboardList, text: "Create a written pet care agreement", color: "text-sky-400" },
  { icon: Syringe, text: "Update all vaccinations and vet records", color: "text-violet-400" },
  { icon: Shield, text: "Ensure microchip info is current", color: "text-amber-400" },
  { icon: DollarSign, text: "Arrange finances for food, vet, and emergencies", color: "text-emerald-400" },
  { icon: Home, text: "Transition pet to caregiver's home early", color: "text-sky-400" },
]

const TIPS = [
  "Create a written pet care agreement covering liability, emergencies, and what happens if the caregiver can no longer help.",
  "Complete a pet profile with health history, medications, temperament, eating habits, and training info.",
  "Ensure your pet's tags include the temporary caretaker's contact information alongside your own.",
  "Microchip your pet — it provides permanent identification that stays with them no matter what.",
  "Arrange how expenses for food, grooming, routine care, and emergencies will be handled.",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPhone(input: string | number): string | null {
  if (input === null || input === undefined) return null;
  let digits = String(input).replace(/\D/g, "");
  if (digits.length < 10) return null;

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  const countryCodeLength = digits.length - 10;
  const countryCode = digits.slice(0, countryCodeLength);
  const rest = digits.slice(countryCodeLength);

  return `+${countryCode} (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number)
  const localDate = new Date(year, month - 1, day)
  return localDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getDaysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - new Date().getTime()) / 864e5)
}

function getPetTypeInfo(type: PetType) {
  return PET_TYPES.find((t) => t.value === type) || PET_TYPES[6]
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function Tag({ children, colorClass = "text-primary bg-primary/10" }: { children: React.ReactNode; colorClass?: string }) {
  return (
    <span className={`text-xs font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${colorClass}`}>
      {children}
    </span>
  )
}

// ─── Pet Card ────────────────────────────────────────────────────────────────

function PetCard({
  pet,
  onEdit,
  onDelete,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
}: {
  pet: Pet
  onEdit: () => void
  onDelete: () => void
  onAddRecord: () => void
  onEditRecord: (record: VetRecord) => void
  onDeleteRecord: (recordId: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const typeInfo = getPetTypeInfo(pet.petType)

  const upcoming = pet.vetRecords
    ?.filter((r) => r.nextDue)
    .sort((a, b) => new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime())[0]
  const days = upcoming?.nextDue ? getDaysUntil(upcoming.nextDue) : null

  return (
    <div className="bg-card border border-border rounded-[14px] hover:border-primary transition-colors">
      {/* Header */}
      <div className="p-5 pb-3.5 flex justify-between items-start">
        <div className="flex gap-3.5 items-start">
          <div className="w-[52px] h-[52px] rounded-[14px] bg-sky-500/10 flex items-center justify-center text-[26px]">
            {typeInfo.emoji}
          </div>
          <div>
            <h3 className="font-bold text-primary">{pet.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {typeInfo.label}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </p>
            <div className="flex">
            {pet.age != null && (
              <p className="text-xs text-muted-foreground mt-0.5">{pet.age} year{pet.age !== 1 && 's'} old</p>
            )}
            {pet.microchipId != null && (
              <p className="text-xs text-muted-foreground mt-0.5 ml-1"> · microchip: {pet.microchipId}</p>
            )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-md hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 bg-popover border border-border rounded-[10px] p-1 min-w-[160px] shadow-xl shadow-black/30">
                <button
                  onClick={() => { onEdit(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Pet
                </button>
                <button
                  onClick={() => { onAddRecord(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Add Vet Record
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this pet?")) {
                      onDelete(); setMenuOpen(false)
                    }}}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Vet Alert */}
      {days !== null && days <= 60 && (
        <div
          className={`mx-5 mb-3 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium ${
            days <= 0
              ? "bg-red-400/10 text-red-600"
              : days <= 14
                ? "bg-amber-400/10 text-amber-600"
                : "bg-sky-400/10 text-sky-600"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {upcoming!.type}: {days <= 0 ? "Overdue!" : `Due ${formatDate(upcoming!.nextDue!)}`}
        </div>
      )}

      {/* Medications & Special Needs */}
      {(pet.feedingInstructions || pet.medications || pet.specialNeeds) && (
        <div className="px-5 pb-3.5 space-y-1.5">
          {pet.feedingInstructions && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Beef className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-400" />
              <span>{pet.feedingInstructions}</span>
            </div>
          )}
          {pet.medications && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Pill className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-400" />
              <span>{pet.medications}</span>
            </div>
          )}
          {pet.specialNeeds && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Heart className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-400" />
              <span>{pet.specialNeeds}</span>
            </div>
          )}
        </div>
      )}

      {/* Caregiver */}
      {pet.caregiverName && (
        <div className="mx-5 mb-3.5 p-3.5 bg-background border-border rounded-lg">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Caregiver</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-text-foreground">
              <User className="w-3.5 h-3.5 text-text-muted-foreground" /> {pet.caregiverName}
            </div>
            {pet.caregiverPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-3.5 h-3.5 text-text-muted-foreground" />
                <a href={`tel:${pet.caregiverPhone}`} className="text-primary hover:underline">
                  {formatPhone(pet.caregiverPhone)}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vet Records Expandable */}
      {pet.vetRecords?.length > 0 && (
        <div className="border-t border-border dark:border-slate-500">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-text-foreground transition-colors"
          >
            <span>{pet.vetRecords.length} Vet Record{pet.vetRecords.length > 1 ? "s" : ""}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          {expanded && (
            <div className="px-4 pb-3.5 space-y-1.5">
              {[...pet.vetRecords]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((r) => {
                  const d = r.nextDue ? getDaysUntil(r.nextDue) : null
                  return (
                    <VetRecordRow
                      key={r.id}
                      record={r}
                      daysUntilDue={d}
                      onEdit={() => onEditRecord(r)}
                      onDelete={() => onDeleteRecord(r.id)}
                    />
                  )
                })}
            </div>
          )}
        </div>
      )}
      
      {(pet.vetName || pet.insuranceCompany) &&
        <div className="px-5 py-3 bg-muted/30 border-t border-border dark:border-slate-500">
          {/* Vet Footer */}
          {pet.vetName && (
            <div className="flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{pet.vetName}</span>
              {pet.vetPhone && (
                <>
                  <span className="text-text-muted-foreground">·</span>
                  <a href={`tel:${pet.vetPhone}`} className="text-sm text-sky-400 hover:underline">
                    {formatPhone(pet.vetPhone)}
                  </a>
                </>
              )}
            </div>
          )}

          {/* Insurance Footer */}
          {pet.insuranceCompany && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-text-muted-foreground" />
              <span>
                {pet.insuranceCompany}
                {pet.insurancePolicy && (
                  <span className="text-muted-foreground/70"> • #{pet.insurancePolicy}</span>
                )}
              </span>
            </div>
          )}
        </div>
      }

      {/* No caregiver warning */}
      {!pet.caregiverName && (
        <div className="border-t border-border px-4 py-2.5 flex items-center gap-2 bg-amber-400/8">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">No caregiver assigned</span>
        </div>
      )}
    </div>
  )
}

// ─── Vet Record Row (with edit/delete) ───────────────────────────────────────

function VetRecordRow({
  record,
  daysUntilDue,
  onEdit,
  onDelete,
}: {
  record: VetRecord
  daysUntilDue: number | null
  onEdit: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  
  return (
    <div className="p-2.5 bg-background rounded-lg flex justify-between items-center group">
      <div>
        <p className="text-sm font-semibold text-text-foreground">{record.type}</p>
        <p className="text-xs text-text-muted-foreground mt-0.5">
          {formatDate(record.date)}
          {record.nextDue ? ` · Next: ${formatDate(record.nextDue)}` : ""}
        </p>
        {record.notes && (
          <p className="text-xs text-text-muted-foreground mt-0.5 italic">{record.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {daysUntilDue !== null && (
          <Tag
            colorClass={
              daysUntilDue <= 0
                ? "text-red-400 bg-red-400/10"
                : daysUntilDue <= 14
                  ? "text-amber-400 bg-amber-400/10"
                  : "text-green-400 bg-green-400/10"
            }
          >
            {daysUntilDue <= 0 ? "Overdue" : `${daysUntilDue}d`}
          </Tag>
        )}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted cursor-pointer transition-all"
          >
            <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 z-20 bg-popover border border-border rounded-[10px] p-1 min-w-[140px] shadow-xl shadow-black/30">
                <button
                  onClick={() => { onEdit(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => {
                    if (confirm("Delete this vet record?")) {
                      onDelete(); setMenuOpen(false)
                    }
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Pet Form Dialog ─────────────────────────────────────────────────────────

function PetFormDialog({
  open,
  onClose,
  onSave,
  editingPet,
  contacts
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Pet, "id" | "createdAt" | "updatedAt" | "vetRecords">) => void
  editingPet: Pet | null
  contacts: EmergencyContact[]
}) {
  const [name, setName] = useState(editingPet?.name || "")
  const [petType, setPetType] = useState<PetType>(editingPet?.petType || "dog")
  const [breed, setBreed] = useState(editingPet?.breed || "")
  const [age, setAge] = useState(editingPet?.age?.toString() || "")
  const [microchipId, setMicrochipId] = useState(editingPet?.microchipId || "")
  const [vetName, setVetName] = useState(editingPet?.vetName || "")
  const [vetPhone, setVetPhone] = useState(editingPet?.vetPhone || "")
  const [caregiverContactId, setCaregiverContactId] = useState("")
  const [caregiverName, setCaregiverName] = useState(editingPet?.caregiverName || "")
  const [caregiverPhone, setCaregiverPhone] = useState(editingPet?.caregiverPhone || "")
  const [insuranceCompany, setInsuranceCompany] = useState("")
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("")
  const [feedingInstructions, setFeedingInstructions] = useState(editingPet?.feedingInstructions || "")
  const [medications, setMedications] = useState(editingPet?.medications || "")
  const [specialNeeds, setSpecialNeeds] = useState(editingPet?.specialNeeds || "")
  const [saving, setSaving] = useState(false)
  const [caregiverOpen, setCaregiverOpen] = useState(false)
  const [caregiverSearch, setCaregiverSearch] = useState("")

  const filteredEmergencyContacts = useMemo(() => {
    const q = caregiverSearch.toLowerCase()
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    ).slice(0,5)
  }, [contacts, caregiverSearch])

  const selectedCaregiver = contacts.find(
    (c) => c.id === caregiverContactId
  )

  const handleSave = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      onSave({
        name: name.trim(),
        petType,
        breed: breed.trim() || undefined,
        age: age ? parseInt(age, 10) : undefined,
        microchipId: microchipId.trim() || undefined,
        vetName: vetName.trim() || undefined,
        vetPhone: vetPhone.trim() || undefined,
        caregiverName: caregiverName.trim() || undefined,
        caregiverPhone: caregiverPhone.trim() || undefined,
        insuranceCompany: insuranceCompany.trim() || undefined,
        insurancePolicy: insurancePolicyNumber.trim() || undefined,
        feedingInstructions: feedingInstructions.trim() || undefined,
        medications: medications.trim() || undefined,
        specialNeeds: specialNeeds.trim() || undefined,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleCaregiverChange = (contactId: string) => {
    if (contactId === "none") {
      setCaregiverContactId("")
      setCaregiverName("")
      setCaregiverPhone("")
    } else {
      const contact = contacts.find((c) => c.id === contactId)
      if (contact) {
        setCaregiverContactId(contactId)
        setCaregiverName(contact.name)
        setCaregiverPhone(contact.phone || "")
      }
    }
  }

  const inputClass =
    "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-text-foreground placeholder:text-text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all"
  const labelClass = "text-xs font-semibold uppercase tracking-wider text-text-muted-foreground"
  const sectionClass = "border-t border-border pt-4 mt-4"
  const sectionTitle = "text-xs font-bold uppercase tracking-[0.08em] text-text-muted-foreground mb-3"
  
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background border border-border rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-5 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-text-foreground">
              {editingPet ? "Edit Pet" : "Add Pet"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track your pet's info, vet details, and caregiver contacts.
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted-foreground hover:text-text-foreground transition-colors p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Pet Name</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Max" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Type</label>
              <select className={`${inputClass} cursor-pointer`} value={petType} onChange={(e) => setPetType(e.target.value as PetType)}>
                {PET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Breed</label>
              <input className={inputClass} value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="e.g., Labrador" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Age (years)</label>
              <input className={inputClass} type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 5" />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Microchip ID</label>
              <input className={inputClass} value={microchipId} onChange={(e) => setMicrochipId(e.target.value)} placeholder="ID #" />
            </div>
          </div>

          <div className={sectionClass}>
            <p className={sectionTitle}>Veterinarian</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Vet / Clinic</label>
                <input className={inputClass} value={vetName} onChange={(e) => setVetName(e.target.value)} placeholder="e.g., Happy Paws Vet" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Vet Phone</label>
                <input className={inputClass} type="tel" value={vetPhone} onChange={(e) => setVetPhone(e.target.value)} placeholder="(555) 123-4567" />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <p className={sectionTitle}>Caregiver / Foster</p>
            <div className="space-y-2">
              <Label className="text-sm">
                Select from Contacts
              </Label>

              <Popover open={caregiverOpen} onOpenChange={setCaregiverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between rounded-xl"
                  >
                    {caregiverContactId === "none"
                      ? "None (Enter manually)"
                      : selectedCaregiver
                      ? `${selectedCaregiver.name}${
                          selectedCaregiver.phone ? ` - ${formatPhone(selectedCaregiver.phone)}` : ""
                        }`
                      : "Search or choose a contact..."}

                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0 rounded-xl">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search name or phone..."
                      value={caregiverSearch}
                      onValueChange={setCaregiverSearch}
                    />

                    <CommandEmpty>No contacts found.</CommandEmpty>

                    <CommandGroup className="max-h-60 overflow-auto">
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          handleCaregiverChange("none")
                          setCaregiverOpen(false)
                          setCaregiverSearch("")
                        }}
                      >
                        None (Enter manually)
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            caregiverContactId === "none" ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>

                      {filteredEmergencyContacts.map((contact) => (
                        <CommandItem
                          key={contact.id}
                          value={contact.id}
                          onSelect={() => {
                            handleCaregiverChange(contact.id)
                            setCaregiverOpen(false)
                            setCaregiverSearch("")
                          }}
                        >
                          {contact.name}
                          {contact.phone && (
                            <span className="ml-2 text-muted-foreground text-xs">
                              {formatPhone(contact.phone)}
                            </span>
                          )}

                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              caregiverContactId === contact.id
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
            <p className="text-xs text-muted-foreground mt-2 mb-3">
              Or enter caregiver details manually below
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caregiver-name" className="text-sm">Name</Label>
                <Input
                  id="caregiver-name"
                  value={caregiverName}
                  onChange={(e) => {
                    setCaregiverName(e.target.value)
                    setCaregiverContactId("")
                  }}
                  placeholder="e.g., John Smith"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caregiver-phone" className="text-sm">Phone</Label>
                <Input
                  id="caregiver-phone"
                  value={caregiverPhone}
                  onChange={(e) => {
                    setCaregiverPhone(e.target.value)
                    setCaregiverContactId("")
                  }}
                  placeholder="e.g., (555) 123-4567"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              Insurance Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance-company" className="text-sm">Company</Label>
                <Input
                  id="insurance-company"
                  value={insuranceCompany}
                  onChange={(e) => setInsuranceCompany(e.target.value)}
                  placeholder="e.g., ASPCA"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance-policy" className="text-sm">Policy Number</Label>
                <Input
                  id="insurance-policy"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  placeholder="e.g., ABC123456"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <p className={sectionTitle}>Care Instructions</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Feeding</label>
                <textarea className={`${inputClass} resize-y min-h-12`} value={feedingInstructions} onChange={(e) => setFeedingInstructions(e.target.value)} placeholder="Schedule, food brand, portions..." rows={2} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Medications</label>
                <textarea className={`${inputClass} resize-y min-h-12`} value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="Medications, dosage, schedule..." rows={2} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Special Needs</label>
                <textarea className={`${inputClass} resize-y min-h-12`} value={specialNeeds} onChange={(e) => setSpecialNeeds(e.target.value)} placeholder="Allergies, behavior notes..." rows={2} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 pt-3 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving} className="cursor-pointer">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Uploading..." : editingPet ? "Save Changes" : "Add Pet"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Vet Record Dialog (Add & Edit) ─────────────────────────────────────────

function VetRecordDialog({
  open,
  onClose,
  onSave,
  petName,
  editingRecord,
}: {
  open: boolean
  onClose: () => void
  onSave: (record: Omit<VetRecord, "id">) => void
  petName: string
  editingRecord?: VetRecord | null
}) {
  const [date, setDate] = useState(
    editingRecord?.date
      ? new Date(editingRecord.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  )
  const [type, setType] = useState(editingRecord?.type || "")
  const [notes, setNotes] = useState(editingRecord?.notes || "")
  const [nextDue, setNextDue] = useState(
    editingRecord?.nextDue
      ? new Date(editingRecord.nextDue).toISOString().split("T")[0]
      : ""
  )
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const isEditing = !!editingRecord

  const handleSave = async () => {
    if (!date || !type.trim() || saving) return
    setSaving(true)
    try {
      console.log(date)
      await onSave({
        date: date,
        type: type.trim(),
        notes: notes.trim() || undefined,
        nextDue: nextDue ? nextDue : undefined,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-text-foreground placeholder:text-text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all"
  const labelClass = "text-xs font-semibold uppercase tracking-wider text-text-muted-foreground"
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background border border-border rounded-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-5 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-text-foreground">
              {isEditing ? "Edit Vet Record" : "Add Vet Record"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing ? `Update record for ${petName}.` : `Add a vaccination or visit for ${petName}.`}
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted-foreground hover:text-text-foreground transition-colors p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Visit Date</label>
              <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Type</label>
              <input className={inputClass} value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Rabies Vaccine" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Next Due Date</label>
            <input className={inputClass} type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Notes</label>
            <textarea className={`${inputClass} resize-y min-h-12`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details..." rows={2} />
          </div>
        </div>

        <div className="p-5 pt-0 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!date || !type.trim() || saving} className="cursor-pointer">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Uploading..." : isEditing ? "Save Changes" : "Add Record"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Resource Card ───────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: (typeof RESOURCES)[number] }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card border border-border rounded-xl p-4 hover:border-primary hover:-translate-y-0.5 transition-all no-underline"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-bold text-text-foreground">{resource.name}</h4>
        <ExternalLink className="w-3.5 h-3.5 text-text-muted-foreground shrink-0 ml-2" />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{resource.desc}</p>
      <div className="flex gap-1.5 flex-wrap">
        {resource.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </a>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PetCarePage() {
  const {
    pets,
    isLoaded,
    isAuthenticated,
    addPet,
    updatePet,
    deletePet,
    addVetRecord,
    updateVetRecord,
    deleteVetRecord,
    getUpcomingVetVisits,
  } = usePets()
  const { emergencyContacts: contacts } = useProperties()

  const [showPetForm, setShowPetForm] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [vetRecordPet, setVetRecordPet] = useState<Pet | null>(null)
  const [editingVetRecord, setEditingVetRecord] = useState<VetRecord | null>(null)
  const [activeTab, setActiveTab] = useState<"pets" | "resources">("pets")

  const upcomingVisits = getUpcomingVetVisits(60)
  const petsWithoutCaregiver = pets.filter((p) => !p.caregiverName)

  const handleSavePet = async (data: Omit<Pet, "id" | "createdAt" | "updatedAt" | "vetRecords">) => {
    if (editingPet) {
      await updatePet(editingPet.id, data)
      setEditingPet(null)
    } else {
      await addPet(data)
    }
  }

  const handleDeletePet = async (id: string) => {
    await deletePet(id)
  }

  const handleSaveVetRecord = async (record: Omit<VetRecord, "id">) => {
    if (vetRecordPet && editingVetRecord) {
      // Editing existing record
      await updateVetRecord(vetRecordPet.id, editingVetRecord.id, record)
    } else if (vetRecordPet) {
      // Adding new record
      await addVetRecord(vetRecordPet.id, record)
    }
  }

  const handleDeleteVetRecord = async (petId: string, recordId: string) => {
    await deleteVetRecord(petId, recordId)
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-sm text-text-muted-foreground">Loading your pets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b bg-primary dark:bg-secondary">
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
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Pet Care Coordinator
                  </h1>
                </div>
                <p className="text-white/80 mt-1">
                  Military Pet Management
                </p>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
                onClick={() => {setEditingPet(null); setShowPetForm(true)}}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pet
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pets.length}</p>
                  <p className="text-sm text-white/70">Total Pets</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pets.filter((p) => p.caregiverName).length}</p>
                  <p className="text-sm text-white/70">With Caregivers</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{upcomingVisits.length}</p>
                  <p className="text-sm text-white/70">Vet Visits Due</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pets.filter((p) => p.microchipId).length}</p>
                  <p className="text-sm text-white/70">Microchiped</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Auth warning */}
        {!isAuthenticated && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  Sign in to sync your pets
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  Your information is not being saved. Sign in to sync your pets across devices.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {upcomingVisits.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 mb-5 flex gap-3.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1.5">Upcoming Vet Visits</p>
              {upcomingVisits.slice(0, 3).map((v, i) => (
                <p key={i} className="text-sm text-amber-700 dark:text-amber-300/80 mb-0.5">
                  {v.petName}: {v.record.type} — {formatDate(v.record.nextDue!)}
                </p>
              ))}
            </div>
          </div>
        )}

        {petsWithoutCaregiver.length > 0 && (
          <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 rounded-xl p-4 mb-5 flex gap-3.5">
            <User className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-violet-800 dark:text-violet-200 mb-1">
                {petsWithoutCaregiver.length} pet{petsWithoutCaregiver.length > 1 ? "s" : ""} need a caregiver
              </p>
              <p className="text-sm text-violet-700 dark:text-violet-300/80 leading-relaxed">
                Assign a foster family or pet sitter before deployment. Check the Resources tab for organizations that can help.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-card rounded-[10px] p-1 border border-border w-fit">
          {[
            { id: "pets" as const, label: "My Pets", icon: PawPrint },
            { id: "resources" as const, label: "Resources", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-[7px] transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-foreground hover:text-muted-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pets Tab */}
        {activeTab === "pets" && (
          <>
            {pets.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    onEdit={() => {
                      setEditingPet(pet)
                      setShowPetForm(true)
                    }}
                    onDelete={() => handleDeletePet(pet.id)}
                    onAddRecord={() => {
                      setEditingVetRecord(null)
                      setVetRecordPet(pet)
                    }}
                    onEditRecord={(record) => {
                      setEditingVetRecord(record)
                      setVetRecordPet(pet)
                    }}
                    onDeleteRecord={(recordId) => handleDeleteVetRecord(pet.id, recordId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <div className="w-[72px] h-[72px] rounded-[20px] bg-sky-100 dark:bg-sky-900/20 flex items-center justify-center mx-auto mb-5">
                  <PawPrint className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">No Pets Yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
                  Add your pets to track vaccinations, vet visits, and caregivers while you serve. Keep everything organized in one place.
                </p>
                <Button
                  onClick={() => {
                    setEditingPet(null)
                    setShowPetForm(true)
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Pet
                </Button>
              </div>
            )}
          </>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div>
            {/* Checklist */}
            <div className="bg-card border border-border rounded-[14px] p-6 mb-6">
              <div className="flex items-center gap-2.5 mb-4">
                <ClipboardList className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold">Pre-Deployment Pet Checklist</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {CHECKLIST.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 bg-background rounded-lg">
                    <item.icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.color}`} />
                    <span className="text-sm text-muted-foreground leading-snug">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PCS Reimbursement */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-5 mb-6 flex gap-3.5">
              <DollarSign className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">PCS Pet Reimbursement</p>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  The DoD now helps cover pet shipping and quarantine fees — up to $550 for CONUS
                  moves and up to $2,000 for OCONUS moves. As of Feb 2025, reimbursement is also
                  available when pets must go to an alternative location. Check with your
                  transportation office for details.
                </p>
              </div>
            </div>

            {/* Resources Grid */}
            <h3 className="text-xs font-bold text-text-muted-foreground uppercase tracking-[0.08em] mb-3.5">
              Organizations That Help
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {RESOURCES.map((r) => (
                <ResourceCard key={r.name} resource={r} />
              ))}
            </div>

            {/* Tips */}
            <div className="bg-card border border-border rounded-[14px] p-5">
              <p className="text-xs font-bold text-text-muted-foreground uppercase tracking-[0.08em] mb-3">
                Tips from American Humane Society
              </p>
              <div className="space-y-2">
                {TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                    <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Dialogs */}
      <PetFormDialog
        key={editingPet?.id ?? "new"}
        open={showPetForm}
        onClose={() => {
          setShowPetForm(false)
          setEditingPet(null)
        }}
        onSave={handleSavePet}
        editingPet={editingPet}
        contacts={contacts}
      />

      {vetRecordPet && (
        <VetRecordDialog
          key={editingVetRecord?.id ?? "new-record"}
          open={!!vetRecordPet}
          onClose={() => {
            setVetRecordPet(null)
            setEditingVetRecord(null)
          }}
          onSave={handleSaveVetRecord}
          petName={vetRecordPet.name}
          editingRecord={editingVetRecord}
        />
      )}
    </div>
  )
}