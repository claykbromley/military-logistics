"use client"

import { useState } from "react"
import Link from "next/link"
import {
  PawPrint,
  Plus,
  ArrowLeft,
  Phone,
  Mail,
  User,
  ChevronDown,
  Trash2,
  Edit,
  Heart,
  Stethoscope,
  Calendar,
  AlertTriangle,
  ClipboardList,
  Pill,
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
import { usePets, type Pet, type PetType, type VetRecord } from "@/hooks/use-pets"

const petTypes: { value: PetType; label: string }[] = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "fish", label: "Fish" },
  { value: "reptile", label: "Reptile" },
  { value: "small_mammal", label: "Small Mammal" },
  { value: "other", label: "Other" },
]

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getDaysUntil(date: string): number {
  const target = new Date(date)
  const today = new Date()
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function PetCard({
  pet,
  onEdit,
  onDelete,
  onAddVetRecord,
}: {
  pet: Pet
  onEdit: () => void
  onDelete: () => void
  onAddVetRecord: () => void
}) {
  const upcomingVet = pet.vetRecords
    .filter((r) => r.nextDue)
    .sort((a, b) => new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime())[0]
  const daysUntilVet = upcomingVet?.nextDue ? getDaysUntil(upcomingVet.nextDue) : null

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{pet.name}</h3>
              <p className="text-sm text-muted-foreground">
                {petTypes.find((t) => t.value === pet.petType)?.label}
                {pet.breed && ` - ${pet.breed}`}
              </p>
              {pet.age && (
                <p className="text-xs text-muted-foreground mt-1">{pet.age} years old</p>
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
                Edit Pet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddVetRecord}>
                <Stethoscope className="w-4 h-4 mr-2" />
                Add Vet Record
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Upcoming Vet Alert */}
        {daysUntilVet !== null && daysUntilVet <= 60 && (
          <div
            className={`mt-3 flex items-center gap-2 text-xs px-2 py-1 rounded ${
              daysUntilVet <= 0
                ? "bg-destructive/10 text-destructive"
                : daysUntilVet <= 14
                ? "bg-amber-100 text-amber-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>
              {upcomingVet?.type}: {daysUntilVet <= 0 ? "Overdue" : `Due ${formatDate(upcomingVet.nextDue!)}`}
            </span>
          </div>
        )}

        {/* Caregiver Info */}
        {pet.caregiverName && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Caregiver</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{pet.caregiverName}</span>
              </div>
              {pet.caregiverPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${pet.caregiverPhone}`} className="text-accent hover:underline">
                    {pet.caregiverPhone}
                  </a>
                </div>
              )}
              {pet.caregiverEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${pet.caregiverEmail}`} className="text-accent hover:underline">
                    {pet.caregiverEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Needs / Medications */}
        {(pet.specialNeeds || pet.medications) && (
          <div className="mt-3 space-y-2">
            {pet.medications && (
              <div className="flex items-start gap-2 text-sm">
                <Pill className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground">{pet.medications}</span>
              </div>
            )}
            {pet.specialNeeds && (
              <div className="flex items-start gap-2 text-sm">
                <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground">{pet.specialNeeds}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vet Info Footer */}
      {pet.vetName && (
        <div className="px-4 py-3 border-t text-sm">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{pet.vetName}</span>
            {pet.vetPhone && (
              <>
                <span className="text-muted-foreground">-</span>
                <a href={`tel:${pet.vetPhone}`} className="text-accent hover:underline">
                  {pet.vetPhone}
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AddPetDialog({
  open,
  onOpenChange,
  onSave,
  editingPet,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (pet: Omit<Pet, "id" | "createdAt" | "updatedAt" | "vetRecords">) => void
  editingPet?: Pet | null
}) {
  const [name, setName] = useState(editingPet?.name || "")
  const [petType, setPetType] = useState<PetType>(editingPet?.petType || "dog")
  const [breed, setBreed] = useState(editingPet?.breed || "")
  const [age, setAge] = useState(editingPet?.age?.toString() || "")
  const [microchipId, setMicrochipId] = useState(editingPet?.microchipId || "")
  const [vetName, setVetName] = useState(editingPet?.vetName || "")
  const [vetPhone, setVetPhone] = useState(editingPet?.vetPhone || "")
  const [caregiverName, setCaregiverName] = useState(editingPet?.caregiverName || "")
  const [caregiverPhone, setCaregiverPhone] = useState(editingPet?.caregiverPhone || "")
  const [caregiverEmail, setCaregiverEmail] = useState(editingPet?.caregiverEmail || "")
  const [specialNeeds, setSpecialNeeds] = useState(editingPet?.specialNeeds || "")
  const [feedingInstructions, setFeedingInstructions] = useState(editingPet?.feedingInstructions || "")
  const [medications, setMedications] = useState(editingPet?.medications || "")

  const handleSave = () => {
    if (!name.trim()) return
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
      caregiverEmail: caregiverEmail.trim() || undefined,
      specialNeeds: specialNeeds.trim() || undefined,
      feedingInstructions: feedingInstructions.trim() || undefined,
      medications: medications.trim() || undefined,
    })
    // Reset form
    setName("")
    setPetType("dog")
    setBreed("")
    setAge("")
    setMicrochipId("")
    setVetName("")
    setVetPhone("")
    setCaregiverName("")
    setCaregiverPhone("")
    setCaregiverEmail("")
    setSpecialNeeds("")
    setFeedingInstructions("")
    setMedications("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPet ? "Edit Pet" : "Add Pet"}</DialogTitle>
          <DialogDescription>
            Add your pet's information and caregiver details for while you're deployed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pet Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Max"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={petType} onValueChange={(v) => setPetType(v as PetType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {petTypes.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      {pt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g., Labrador"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="microchip">Microchip ID</Label>
              <Input
                id="microchip"
                value={microchipId}
                onChange={(e) => setMicrochipId(e.target.value)}
                placeholder="ID number"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Veterinarian</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vet-name">Vet Name / Clinic</Label>
                <Input
                  id="vet-name"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  placeholder="e.g., Happy Paws Vet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vet-phone">Vet Phone</Label>
                <Input
                  id="vet-phone"
                  type="tel"
                  value={vetPhone}
                  onChange={(e) => setVetPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Caregiver (Foster/Pet Sitter)</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="caregiver-name">Name</Label>
                  <Input
                    id="caregiver-name"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caregiver-phone">Phone</Label>
                  <Input
                    id="caregiver-phone"
                    type="tel"
                    value={caregiverPhone}
                    onChange={(e) => setCaregiverPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="caregiver-email">Email</Label>
                <Input
                  id="caregiver-email"
                  type="email"
                  value={caregiverEmail}
                  onChange={(e) => setCaregiverEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Care Instructions</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feeding">Feeding Instructions</Label>
                <Textarea
                  id="feeding"
                  value={feedingInstructions}
                  onChange={(e) => setFeedingInstructions(e.target.value)}
                  placeholder="Feeding schedule, food brand, portions..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Medications</Label>
                <Textarea
                  id="medications"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="Any medications, dosage, schedule..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="special-needs">Special Needs / Notes</Label>
                <Textarea
                  id="special-needs"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  placeholder="Allergies, behavior notes, etc..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {editingPet ? "Save Changes" : "Add Pet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddVetRecordDialog({
  open,
  onOpenChange,
  onSave,
  petName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (record: Omit<VetRecord, "id">) => void
  petName: string
}) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [type, setType] = useState("")
  const [notes, setNotes] = useState("")
  const [nextDue, setNextDue] = useState("")

  const handleSave = () => {
    if (!date || !type.trim()) return
    onSave({
      date: new Date(date).toISOString(),
      type: type.trim(),
      notes: notes.trim() || undefined,
      nextDue: nextDue ? new Date(nextDue).toISOString() : undefined,
    })
    setDate(new Date().toISOString().split("T")[0])
    setType("")
    setNotes("")
    setNextDue("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vet Record</DialogTitle>
          <DialogDescription>Add a vet visit or vaccination record for {petName}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit-date">Visit Date</Label>
              <Input
                id="visit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit-type">Type</Label>
              <Input
                id="visit-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., Rabies Vaccine"
              />
            </div>
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
          <div className="space-y-2">
            <Label htmlFor="visit-notes">Notes</Label>
            <Textarea
              id="visit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!date || !type.trim()}>
            Add Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PetCarePage() {
  const {
    pets,
    isLoaded,
    addPet,
    updatePet,
    deletePet,
    addVetRecord,
    getUpcomingVetVisits,
  } = usePets()

  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [vetRecordPet, setVetRecordPet] = useState<Pet | null>(null)

  const upcomingVisits = getUpcomingVetVisits(60)

  const handleSavePet = (petData: Omit<Pet, "id" | "createdAt" | "updatedAt" | "vetRecords">) => {
    if (editingPet) {
      updatePet(editingPet.id, petData)
      setEditingPet(null)
    } else {
      addPet(petData)
    }
  }

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
                <h1 className="text-xl font-bold text-foreground">Pet Care Coordinator</h1>
                <p className="text-sm text-muted-foreground">
                  Manage pet care, vet records, and caregivers
                </p>
              </div>
            </div>
            <Button onClick={() => setIsPetDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Pet
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <PawPrint className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{pets.length}</p>
                <p className="text-sm text-muted-foreground">Pets</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pets.filter((p) => p.caregiverName).length}
                </p>
                <p className="text-sm text-muted-foreground">With Caregivers</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar
                className={`w-5 h-5 ${upcomingVisits.length > 0 ? "text-amber-500" : "text-muted-foreground"}`}
              />
              <div>
                <p className="text-2xl font-bold text-foreground">{upcomingVisits.length}</p>
                <p className="text-sm text-muted-foreground">Vet Visits Due</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Vet Visits Alert */}
        {upcomingVisits.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Upcoming Vet Visits</h3>
                <div className="mt-2 space-y-1">
                  {upcomingVisits.slice(0, 3).map((visit) => (
                    <p key={visit.record.id} className="text-sm text-amber-700">
                      {visit.petName}: {visit.record.type} - {formatDate(visit.record.nextDue!)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pets Missing Caregivers Alert */}
        {pets.some((p) => !p.caregiverName) && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Pets Need Caregivers</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {pets.filter((p) => !p.caregiverName).length} pet(s) don't have a caregiver
                  assigned. Consider using{" "}
                  <a
                    href="https://www.dogsondeployment.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Dogs on Deployment
                  </a>{" "}
                  to find a foster family.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pets Grid */}
        {pets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onEdit={() => {
                  setEditingPet(pet)
                  setIsPetDialogOpen(true)
                }}
                onDelete={() => deletePet(pet.id)}
                onAddVetRecord={() => setVetRecordPet(pet)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border rounded-lg">
            <PawPrint className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No pets yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your pets to track their care, vet visits, and caregivers during deployment.
            </p>
            <Button onClick={() => setIsPetDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Pet
            </Button>
          </div>
        )}

        {/* Resources */}
        <div className="mt-8 bg-muted/50 rounded-lg p-6">
          <h3 className="font-medium text-foreground mb-3">Pet Foster Resources</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These organizations help military families find temporary foster homes for pets during
            deployment:
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.dogsondeployment.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-card border text-sm font-medium text-foreground hover:border-accent transition-colors"
            >
              Dogs on Deployment
            </a>
            <a
              href="https://netpets.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-card border text-sm font-medium text-foreground hover:border-accent transition-colors"
            >
              NetPets
            </a>
            <a
              href="https://guardianangelsforsoldierspet.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-card border text-sm font-medium text-foreground hover:border-accent transition-colors"
            >
              Guardian Angels for Soldier's Pet
            </a>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddPetDialog
        open={isPetDialogOpen}
        onOpenChange={(open) => {
          setIsPetDialogOpen(open)
          if (!open) setEditingPet(null)
        }}
        onSave={handleSavePet}
        editingPet={editingPet}
      />

      {vetRecordPet && (
        <AddVetRecordDialog
          open={!!vetRecordPet}
          onOpenChange={(open) => {
            if (!open) setVetRecordPet(null)
          }}
          onSave={(record) => addVetRecord(vetRecordPet.id, record)}
          petName={vetRecordPet.name}
        />
      )}
    </div>
  )
}
