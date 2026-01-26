"use client"

import { useState, Suspense, useRef, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FileText, Plus, Search, AlertTriangle, Calendar, Lock, Shield, ArrowLeft, Filter, ChevronDown, Trash2, Edit, Share2, Star, StarOff, Clock, Upload, Download, X, Mail, Check } from "lucide-react"
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
import { createClient } from "@/lib/supabase/client"

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
      className={`bg-card border rounded-lg p-4 transition-all hover:border-accent/50 ${
        document.isCritical ? "border-accent/30 ring-1 ring-accent/10" : "border-border"
      } ${!isOwner ? "bg-muted/20" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              document.isCritical ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-foreground truncate">{document.documentName}</h3>
              {document.isCritical && <Lock className="w-4 h-4 text-accent flex-shrink-0" />}
              {!isOwner && (
                <Badge variant="secondary" className="text-xs">
                  Shared with you
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{getTypeLabel(document.documentType)}</p>
            {document.fileName && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {document.fileName} {document.fileSize && `(${formatFileSize(document.fileSize)})`}
              </p>
            )}
            {document.expirationDate && (
              <div
                className={`flex items-center gap-1 mt-2 text-xs ${
                  isExpired
                    ? "text-destructive"
                    : isExpiringSoon
                    ? "text-amber-600"
                    : "text-muted-foreground"
                }`}
              >
                {isExpired ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>
                  {isExpired
                    ? `Expired ${Math.abs(daysUntilExpiration!)} days ago`
                    : `Expires in ${daysUntilExpiration} days`}
                </span>
              </div>
            )}
            {document.sharedWith.length > 0 && isOwner && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Share2 className="w-3 h-3" />
                <span>Shared with {document.sharedWith.length} people</span>
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {document.notes && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{document.notes}</p>
      )}
    </div>
  )
}

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

  // Update form when editingDocument changes
  useEffect(() => {
    if (editingDocument) {
      setName(editingDocument.documentName)
      setType(editingDocument.documentType)
      setExpirationDate(editingDocument.expirationDate?.split("T")[0] || "")
      setNotes(editingDocument.notes || "")
      setIsCritical(editingDocument.isCritical)
      setReplaceFile(false)
    } else {
      setName(isQuickAdd? isQuickAdd.label : "")
      setType(isQuickAdd? isQuickAdd.category : "other")
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
      
      // Reset form
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
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingDocument ? "Edit Document" : "Add Document"}</DialogTitle>
          <DialogDescription>
            {editingDocument
              ? "Update the document details below."
              : "Add a new document to your vault."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Document File</Label>
            {editingDocument?.fileUrl && !replaceFile ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{editingDocument.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(editingDocument.fileSize)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplaceFile(true)}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, JPG, PNG (max 10MB)
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
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Last Will and Testament"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-type">Document Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
              <SelectTrigger>
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
            <Label htmlFor="expiration">Expiration Date (if applicable)</Label>
            <Input
              id="expiration"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details about this document..."
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="critical"
              checked={isCritical}
              onCheckedChange={(checked) => setIsCritical(checked === true)}
            />
            <label
              htmlFor="critical"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as critical document (will appear in emergency quick-access)
            </label>
          </div>
        </div>
        <DialogFooter>
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

function ShareDialog({
  open,
  onOpenChange,
  document,
  onShare,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
  onShare: (emails: string[]) => void
}) {
  const [emails, setEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState("")

  // Update emails when document changes
  useEffect(() => {
    if (document) {
      setEmails(document.sharedWith || [])
    } else {
      setEmails([])
    }
  }, [document, open])

  const addEmail = () => {
    const trimmedEmail = newEmail.trim()
    if (trimmedEmail && !emails.includes(trimmedEmail)) {
      setEmails([...emails, trimmedEmail])
      setNewEmail("")
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
            Share "{document?.documentName}" with trusted contacts via email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Add email address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addEmail()}
                placeholder="email@example.com"
              />
              <Button onClick={addEmail} size="icon" disabled={!newEmail.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {emails.length > 0 && (
            <div className="space-y-2">
              <Label>Shared with</Label>
              <div className="space-y-2">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeEmail(email)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p>
              Note: Shared contacts will receive access to view this document. Make sure you trust
              them with this information.
            </p>
          </div>
        </div>
        <DialogFooter>
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

export default function DocumentVaultPage() {
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

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<DocumentType | "all">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [sharingDocument, setSharingDocument] = useState<Document | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [quickAdd, setQuickAdd] = useState<QuickAdd | null>(null)
  const [showCritDocs, setShowCritDocs]= useState(false)

  // Get current user ID
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
                <h1 className="text-xl font-bold text-foreground">Document Vault</h1>
                <p className="text-sm text-muted-foreground">
                  Securely store and organize critical documents
                </p>
              </div>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Sign in to sync your documents</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your documents are currently stored locally. Sign in to sync them across devices
                  and enable file uploads.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{documents.length}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{criticalDocs.length}</p>
                <p className="text-sm text-muted-foreground">Critical Documents</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  expiringDocs.length > 0 ? "bg-amber-100" : "bg-muted"
                }`}
              >
                <Clock
                  className={`w-5 h-5 ${
                    expiringDocs.length > 0 ? "text-amber-600" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{expiringDocs.length}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Documents Alert */}
        {expiringDocs.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Documents Expiring Soon</h3>
                <p className="text-sm text-amber-700 mt-1">
                  {expiringDocs.length} document{expiringDocs.length !== 1 ? "s" : ""} will expire
                  in the next 90 days. Review and renew them before deployment.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {expiringDocs.slice(0, 3).map((doc) => (
                    <span
                      key={doc.id}
                      className="inline-flex items-center px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs"
                    >
                      {doc.documentName}
                    </span>
                  ))}
                  {expiringDocs.length > 3 && (
                    <span className="text-xs text-amber-700">
                      +{expiringDocs.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as DocumentType | "all")}
          >
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
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
          <Button onClick={() => setShowCritDocs(!showCritDocs)}>
            <AlertTriangle />
            {showCritDocs? "Show All Documents" : "Show Critical Documents"}
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
          <div className="text-center py-12 bg-card border rounded-lg">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {documents.length === 0 ? "No documents yet" : "No documents match your search"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {documents.length === 0
                ? "Start by adding your important documents to keep them organized and accessible."
                : "Try adjusting your search or filter criteria."}
            </p>
            {documents.length === 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Document
              </Button>
            )}
          </div>
        )}

        {/* Quick Add Suggestions */}
        {documents.length < 5 && (
          <div className="mt-8 bg-muted/50 rounded-lg p-6">
            <h3 className="font-medium text-foreground mb-3">Suggested Documents to Add</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These documents are commonly needed during deployment preparation:
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
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-card border text-sm text-foreground hover:border-accent transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
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

      {/* Share Dialog */}
      <Suspense fallback={<Loading />}>
        <ShareDialog
          open={!!sharingDocument}
          onOpenChange={(open) => !open && setSharingDocument(null)}
          document={sharingDocument}
          onShare={handleSaveSharing}
        />
      </Suspense>
      <Footer />
    </div>
  )
}