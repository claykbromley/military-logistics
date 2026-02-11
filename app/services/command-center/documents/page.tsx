"use client"

import { useState, Suspense, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FileText, Plus, Search, AlertTriangle, Calendar, Lock, Shield, ChevronsUpDown, ArrowLeft, Filter, ChevronDown, Trash2, Edit, Share2, Star, StarOff, Clock, Upload, Download, X, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useDocuments, type Document, type DocumentType } from "@/hooks/use-documents"
import { useCommunicationHub, CommunicationHubProvider } from "@/hooks/use-communication-hub"
import { createClient } from "@/lib/supabase/client"
import { Contact } from "@/lib/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"

const documentTypes: { value: DocumentType; label: string; icon: string }[] = [
  { value: "will", label: "Will & Testament", icon: "scroll" },
  { value: "poa", label: "Power of Attorney", icon: "stamp" },
  { value: "insurance", label: "Insurance", icon: "shield" },
  { value: "identification", label: "Identification", icon: "id-card" },
  { value: "financial", label: "Financial", icon: "wallet" },
  { value: "medical", label: "Medical", icon: "heart-pulse" },
  { value: "military", label: "Military Records", icon: "medal" },
  { value: "property", label: "Property & Deeds", icon: "home" },
  { value: "other", label: "Other", icon: "file" },
]

interface QuickAdd {
  value: string,
  label: string,
  category: DocumentType
}

const quickAdds: QuickAdd[] = [
  { value: "will", label: "Last Will and Testament", category: "will" },
  { value: "gpoa", label: "General Power of Attorney", category: "poa" },
  { value: "spoa", label: "Special Power of Attorney", category: "poa" },
  { value: "sgli", label: "SGLI Policy", category: "financial" },
  { value: "registration", label: "Vehicle Registration", category: "property" },
  { value: "lease", label: "Lease Agreement", category: "property" },
  { value: "medical", label: "Medical Directives", category: "medical" },
  { value: "birth", label: "Birth Certificates", category: "identification" }
]

function getTypeLabel(type: DocumentType): string {
  return documentTypes.find((t) => t.value === type)?.label || type
}

function getDaysUntilExpiration(date: string): number {
  const expDate = new Date(date)
  const today = new Date()
  const diff = expDate.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ─── Colour helpers for document type badges ─── */
function getTypeBadgeClasses(type: DocumentType): string {
  const map: Record<DocumentType, string> = {
    will: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    poa: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    insurance: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    identification: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    financial: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    medical: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    military: "bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
    property: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    other: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  }
  return map[type] ?? map.other
}

function getTypeIconBg(type: DocumentType): string {
  const map: Record<DocumentType, string> = {
    will: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    poa: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    insurance: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    identification: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    financial: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    medical: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    military: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    property: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    other: "bg-gray-500/10 text-gray-500 dark:text-gray-400",
  }
  return map[type] ?? map.other
}

/* ─── Document Card ─── */
function DocumentCard({
  document,
  onEdit,
  onDelete,
  onToggleCritical,
  onShare,
  onDownload,
  isOwner,
}: {
  document: Document
  onEdit: () => void
  onDelete: () => void
  onToggleCritical: () => void
  onShare: () => void
  onDownload: () => void
  isOwner: boolean
}) {
  const daysUntilExpiration = document.expirationDate
    ? getDaysUntilExpiration(document.expirationDate)
    : null
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 90
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0

  return (
    <div
      className={cn(
        "group relative bg-card border rounded-xl p-5 transition-all duration-200",
        "hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5",
        document.isCritical
          ? "border-accent/40 ring-1 ring-accent/10 bg-accent/[0.02]"
          : "border-border",
        !isOwner && "bg-muted/30"
      )}
    >
      {/* Critical indicator stripe */}
      {document.isCritical && (
        <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Type icon */}
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
              document.isCritical
                ? "bg-accent/15 text-accent"
                : getTypeIconBg(document.documentType)
            )}
          >
            <FileText className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate leading-tight">
                {document.documentName}
              </h3>
              {document.isCritical && (
                <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              )}
              {!isOwner && (
                <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0">
                  Shared
                </Badge>
              )}
            </div>

            {/* Type badge */}
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide",
                getTypeBadgeClasses(document.documentType)
              )}
            >
              {getTypeLabel(document.documentType)}
            </span>

            {/* File info */}
            {document.fileName && (
              <p className="text-xs text-muted-foreground/70 truncate">
                {document.fileName}
                {document.fileSize && (
                  <span className="ml-1 opacity-60">· {formatFileSize(document.fileSize)}</span>
                )}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3 flex-wrap">
              {document.expirationDate && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    isExpired
                      ? "text-destructive"
                      : isExpiringSoon
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground/70"
                  )}
                >
                  {isExpired ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <Calendar className="w-3 h-3" />
                  )}
                  <span>
                    {isExpired
                      ? `Expired ${Math.abs(daysUntilExpiration!)}d ago`
                      : `Expires in ${daysUntilExpiration}d`}
                  </span>
                </div>
              )}

              {document.sharedWith.length > 0 && isOwner && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                  <Share2 className="w-3 h-3" />
                  <span>
                    {document.sharedWith.length} {document.sharedWith.length === 1 ? "person" : "people"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {document.fileUrl && (
              <>
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {isOwner && (
              <>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleCritical}>
                  {document.isCritical ? (
                    <>
                      <StarOff className="w-4 h-4 mr-2" />
                      Remove from Critical
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Mark as Critical
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notes */}
      {document.notes && (
        <p className="mt-3 pt-3 border-t text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
          {document.notes}
        </p>
      )}
    </div>
  )
}

/* ─── Add / Edit Dialog ─── */
function AddDocumentDialog({
  open,
  onOpenChange,
  onSave,
  editingDocument,
  isUploading,
  isQuickAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (doc: Omit<Document, "id" | "createdAt" | "updatedAt">, file?: File) => Promise<void>
  editingDocument?: Document | null
  isUploading: boolean
  isQuickAdd: QuickAdd | null
}) {
  const [name, setName] = useState("")
  const [type, setType] = useState<DocumentType>("other")
  const [expirationDate, setExpirationDate] = useState("")
  const [notes, setNotes] = useState("")
  const [isCritical, setIsCritical] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [replaceFile, setReplaceFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingDocument) {
      setName(editingDocument.documentName)
      setType(editingDocument.documentType)
      setExpirationDate(editingDocument.expirationDate?.split("T")[0] || "")
      setNotes(editingDocument.notes || "")
      setIsCritical(editingDocument.isCritical)
      setReplaceFile(false)
    } else {
      setName(isQuickAdd ? isQuickAdd.label : "")
      setType(isQuickAdd ? isQuickAdd.category : "other")
      setExpirationDate("")
      setNotes("")
      setIsCritical(false)
      setSelectedFile(null)
      setReplaceFile(false)
    }
  }, [editingDocument, open])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!name) {
        setName(file.name.split(".").slice(0, -1).join("."))
      }
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      await onSave(
        {
          documentName: name.trim(),
          documentType: type,
          expirationDate: expirationDate || undefined,
          notes: notes.trim() || undefined,
          isCritical,
          sharedWith: editingDocument?.sharedWith || [],
          fileUrl: editingDocument?.fileUrl,
          fileName: editingDocument?.fileName,
          fileSize: editingDocument?.fileSize,
        },
        selectedFile || undefined
      )
      setName("")
      setType("other")
      setExpirationDate("")
      setNotes("")
      setIsCritical(false)
      setSelectedFile(null)
      setReplaceFile(false)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving document:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">{editingDocument ? "Edit Document" : "Add Document"}</DialogTitle>
          <DialogDescription>
            {editingDocument
              ? "Update the document details below."
              : "Add a new document to your vault."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Document File
            </Label>
            {editingDocument?.fileUrl && !replaceFile ? (
              <div className="flex items-center justify-between p-3.5 border rounded-xl bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{editingDocument.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(editingDocument.fileSize)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setReplaceFile(true)}>
                  Replace
                </Button>
              </div>
            ) : (
              <>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                    "hover:border-accent/50 hover:bg-accent/[0.02]",
                    selectedFile && "border-accent/30 bg-accent/[0.02]"
                  )}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground/80">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, JPG, PNG up to 10 MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Document Name
            </Label>
            <Input
              id="doc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Last Will and Testament"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Document Type
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>
                    {dt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Expiration Date
              <span className="font-normal normal-case tracking-normal ml-1 opacity-60">
                (if applicable)
              </span>
            </Label>
            <Input
              id="expiration"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details about this document..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex items-start space-x-3 p-3.5 rounded-xl border bg-muted/20">
            <Checkbox
              id="critical"
              checked={isCritical}
              onCheckedChange={(checked) => setIsCritical(checked === true)}
              className="mt-0.5"
            />
            <div>
              <label
                htmlFor="critical"
                className="text-sm font-medium leading-tight cursor-pointer"
              >
                Mark as critical document
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Will appear in emergency quick-access
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isUploading}>
            {isUploading ? "Uploading..." : editingDocument ? "Save Changes" : "Add Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Share Dialog ─── */
function ShareDialog({
  open,
  onOpenChange,
  document,
  onShare,
  contacts
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
  onShare: (emails: string[]) => void
  contacts: Contact[]
}) {
  const [emails, setEmails] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (document) {
      setEmails(document.sharedWith || [])
    } else {
      setEmails([])
    }
  }, [document, open])

  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase()
    return contacts.filter(
      (c) =>
        c.contactName.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    )
  }, [contacts, search])

  const addEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase()
    if (trimmed && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed])
    }
  }

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email))
  }

  const handleSave = () => {
    onShare(emails)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Share &ldquo;{document?.documentName}&rdquo; with trusted contacts via email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Add people
            </Label>

            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-10"
                >
                  <span className="text-muted-foreground font-normal">Search name or type email…</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Type name or email and press Enter…"
                    value={search}
                    onValueChange={setSearch}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && search.trim()) {
                        addEmail(search)
                        setSearch("")
                        setPickerOpen(false)
                      }
                    }}
                  />
                  <CommandEmpty>
                    Press Enter to add &ldquo;{search}&rdquo;
                  </CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {filteredContacts.map((contact) => (
                      <CommandItem
                        key={contact.id}
                        onSelect={() => {
                          addEmail(contact.email || "")
                          setSearch("")
                          setPickerOpen(false)
                        }}
                      >
                        {contact.contactName}
                        <span className="ml-2 text-muted-foreground text-xs">
                          {contact.email}
                        </span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            emails.includes(contact.email || "")
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

          {emails.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shared with
              </Label>
              <div className="space-y-1.5">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2.5 border rounded-xl bg-muted/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <span className="text-sm">{email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeEmail(email)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-muted/30 p-3.5 text-sm text-muted-foreground leading-relaxed">
            <p>
              Shared contacts will receive access to view this document. Make sure you trust
              them with this information.
            </p>
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" />
            Save Sharing Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Loading() {
  return null
}

/* ─── Main Page ─── */
export default function DocumentVaultPage() {
  return (
    <CommunicationHubProvider>
      <DocumentVaultPageContent />
    </CommunicationHubProvider>
  )
}

function DocumentVaultPageContent() {
  const {
    documents,
    isLoaded,
    isAuthenticated,
    isUploading,
    addDocument,
    updateDocument,
    deleteDocument,
    shareDocument,
    getCriticalDocuments,
    getExpiringDocuments,
  } = useDocuments()
  const { contacts } = useCommunicationHub()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<DocumentType | "all">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [sharingDocument, setSharingDocument] = useState<Document | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [quickAdd, setQuickAdd] = useState<QuickAdd | null>(null)
  const [showCritDocs, setShowCritDocs] = useState(false)

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    if (isAuthenticated) {
      getCurrentUser()
    }
  }, [isAuthenticated])

  const criticalDocs = getCriticalDocuments()
  const expiringDocs = getExpiringDocuments(90)

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || doc.documentType === filterType
    const matchesCrit = !showCritDocs || doc.isCritical
    return matchesSearch && matchesType && matchesCrit
  })

  const handleSaveDocument = async (
    docData: Omit<Document, "id" | "createdAt" | "updatedAt">,
    file?: File
  ) => {
    if (editingDocument) {
      await updateDocument(editingDocument.id, docData, file)
      setEditingDocument(null)
    } else {
      await addDocument(docData, file)
    }
  }

  const handleEdit = (doc: Document) => {
    setEditingDocument(doc)
    setIsAddDialogOpen(true)
  }

  const handleToggleCritical = (doc: Document) => {
    updateDocument(doc.id, { isCritical: !doc.isCritical })
  }

  const handleShare = (doc: Document) => {
    setSharingDocument(doc)
  }

  const handleSaveSharing = (emails: string[]) => {
    if (sharingDocument) {
      shareDocument(sharingDocument.id, emails)
    }
  }

  const handleDownload = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank")
    }
  }

  const expiredDocs = expiringDocs.filter(doc =>
    doc.expirationDate && getDaysUntilExpiration(doc.expirationDate) <= 0
  )
  const isExpired = expiredDocs.length > 0

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading vault…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Document Vault
                  </h1>
                  <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white">
                    <Shield className="w-3 h-3" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Secure</span>
                  </div>
                </div>
                <p className="text-white/80 mt-1">
                  Securely store and organize critical documents
                </p>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{documents.length}</p>
                  <p className="text-sm text-white/70">Total Documents</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{criticalDocs.length}</p>
                  <p className="text-sm text-white/70">Critical Documents</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center",
                    isExpired
                      ? "bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-900/20"
                      : expiringDocs.length > 0
                      ? "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20"
                      : ""
                  )}
                >
                  <Clock
                    className={cn(
                      "w-5 h-5 text-white",
                      isExpired
                        ? "text-red-600 dark:text-red-400"
                        : expiringDocs.length > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : ""
                    )}
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{isExpired ? expiredDocs.length : expiringDocs.length}</p>
                  <p className="text-sm text-white/70">
                    {isExpired ? "Expired Documents" : "Expiring Soon"}
                  </p>
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
                  Sign in to sync your documents
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  Your documents are currently stored locally. Sign in to sync them across devices
                  and enable file uploads.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expiring Documents Alert */}
        {expiringDocs.length > 0 && 
        <div className={cn(
          "rounded-xl p-4 border",
          isExpired
            ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/40"
            : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40"
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
              isExpired
                ? "bg-red-100 dark:bg-red-900/40"
                : "bg-amber-100 dark:bg-amber-900/40"
            )}>
              <AlertTriangle className={cn(
                "w-4 h-4",
                isExpired ? "text-red-600" : "text-amber-600"
              )} />
            </div>
            <div>
              <h3 className={cn(
                "font-semibold",
                isExpired
                  ? "text-red-800 dark:text-red-200"
                  : "text-amber-800 dark:text-amber-200"
              )}>
                {isExpired ? "Documents Expired" : "Documents Expiring Soon"}
              </h3>
              <p className={cn(
                "text-sm mt-0.5 leading-relaxed",
                isExpired
                  ? "text-red-700 dark:text-red-300/80"
                  : "text-amber-700 dark:text-amber-300/80"
              )}>
                {isExpired
                  ? `${expiredDocs.length} document${expiredDocs.length !== 1 ? "s have" : " has"} expired. Renew immediately.`
                  : `${expiringDocs.length} document${expiringDocs.length !== 1 ? "s" : ""} will expire in the next 90 days. Review and renew them before deployment.`
                }
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {expiringDocs.slice(0, 3).map((doc) => {
                  const daysLeft = doc.expirationDate ? getDaysUntilExpiration(doc.expirationDate) : 0
                  const docExpired = daysLeft <= 0

                  return (
                    <span
                      key={doc.id}
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium",
                        docExpired
                          ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                      )}
                    >
                      {doc.documentName}
                    </span>
                  )
                })}
                {expiringDocs.length > 3 && (
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 text-xs font-medium",
                    isExpired
                      ? "text-red-700 dark:text-red-300"
                      : "text-amber-700 dark:text-amber-300"
                  )}>
                    +{expiringDocs.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        }

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as DocumentType | "all")}
          >
            <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {documentTypes.map((dt) => (
                <SelectItem key={dt.value} value={dt.value}>
                  {dt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setShowCritDocs(!showCritDocs)}
            variant={showCritDocs ? "default" : "outline"}
            className="rounded-xl h-10"
          >
            {showCritDocs ? (
              <Shield className="w-4 h-4 mr-2" />
            ) : (
              <AlertTriangle className="w-4 h-4 mr-2" />
            )}
            {showCritDocs ? "Show All" : "Critical Only"}
          </Button>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onEdit={() => handleEdit(doc)}
                onDelete={() => deleteDocument(doc.id)}
                onToggleCritical={() => handleToggleCritical(doc)}
                onShare={() => handleShare(doc)}
                onDownload={() => handleDownload(doc)}
                isOwner={doc.user_id === currentUserId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border rounded-2xl">
            <div className="w-16 h-16 rounded-3xl bg-muted/60 flex items-center justify-center mx-auto mb-5">
              <FileText className="w-7 h-7 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1.5">
              {documents.length === 0 ? "No documents yet" : "No documents match your search"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              {documents.length === 0
                ? "Start by adding your important documents to keep them organized and accessible."
                : "Try adjusting your search or filter criteria."}
            </p>
            {documents.length === 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="mt-6 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Document
              </Button>
            )}
          </div>
        )}

        {/* Quick Add Suggestions */}
        {documents.length < 5 && (
          <div className="rounded-2xl border bg-gradient-to-br from-muted/40 via-background to-muted/20 p-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">Suggested Documents</h3>
              <Badge variant="secondary" className="text-[10px] font-medium">Quick Add</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Commonly needed documents during deployment preparation:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickAdds.map((suggestion) => (
                <button
                  key={suggestion.value}
                  onClick={() => {
                    setEditingDocument(null)
                    setIsAddDialogOpen(true)
                    setQuickAdd(suggestion)
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium",
                    "bg-card border shadow-sm",
                    "text-foreground hover:border-accent/50 hover:shadow-md hover:-translate-y-0.5",
                    "transition-all duration-200"
                  )}
                >
                  <Plus className="w-3 h-3 text-accent" />
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <Suspense fallback={<Loading />}>
        <AddDocumentDialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) setEditingDocument(null)
          }}
          onSave={handleSaveDocument}
          editingDocument={editingDocument}
          isUploading={isUploading}
          isQuickAdd={quickAdd}
        />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <ShareDialog
          open={!!sharingDocument}
          onOpenChange={(open) => !open && setSharingDocument(null)}
          document={sharingDocument}
          onShare={handleSaveSharing}
          contacts={contacts}
        />
      </Suspense>
      <Footer />
    </div>
  )
}