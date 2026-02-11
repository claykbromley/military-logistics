"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Send, Star, Search, MessageCircle, UserPlus, Check, X, Inbox, ChevronsUpDown, AlertCircle, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandEmpty, CommandGroup,CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageThread, Message, Contact, SharedContact } from "@/lib/types"
import { useCommunicationHub } from "@/hooks/use-communication-hub"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Helper to get the "other party" info for a thread
function getOtherPartyInfo(
  thread: MessageThread,
  currentUser: { id: string; email: string } | null,
  contacts: Contact[],
  sharedContacts: SharedContact[]
): { name: string; email: string } {
  if (!currentUser) {
    return {
      name: thread.contactName || thread.contactEmail,
      email: thread.contactEmail
    }
  }
  
  const isThreadCreator = thread.user_id === currentUser.id
  
  if (isThreadCreator) {
    return {
      name: thread.contactName || thread.contactEmail,
      email: thread.contactEmail
    }
  } else {
    const firstMessage = thread.messages[0]
    if (firstMessage && firstMessage.senderId !== currentUser.id) {
      const localContact = contacts.find(c => (c.email === firstMessage.senderEmail))
      const sharedContact = sharedContacts.find(c => (c.ownerEmail === firstMessage.senderEmail))
      
      return {
        name: localContact?.contactName || sharedContact?.localDisplayName || firstMessage.senderName || firstMessage.senderEmail || "Unknown User",
        email: firstMessage.senderEmail || "unknown"
      }
    }
    return {
      name: thread.contactName || thread.contactEmail,
      email: thread.contactEmail
    }
  }
}

function NewMessageDialog({
  open,
  onOpenChange,
  onSend,
  contacts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (
    contactEmail: string,
    contactName: string | undefined,
    contactId: string | undefined,
    subject: string | undefined,
    message: string,
    attachedFiles: File[]
  ) => void
  contacts: Array<{ id: string; name: string; email?: string }>
}) {
  const [selectedContactId, setSelectedContactId] = useState<string>("")
  const [customEmail, setCustomEmail] = useState("")
  const [customName, setCustomName] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [useCustomEmail, setUseCustomEmail] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [openContacts, setOpenContacts] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (open) {
      setSelectedContactId("")
      setCustomEmail("")
      setCustomName("")
      setSubject("")
      setMessage("")
      setUseCustomEmail(false)
    }
  }, [open])

  const handleSend = () => {
    let email: string
    let name: string | undefined
    let contactId: string | undefined

    if (useCustomEmail) {
      email = customEmail.trim()
      name = customName.trim() || undefined
    } else {
      const contact = contacts.find((c) => c.id === selectedContactId)
      if (!contact?.email) return
      email = contact.email
      name = contact.name
      contactId = contact.id
    }

    if (!email || (!message.trim() && attachedFiles.length === 0)) return

    onSend(email, name, contactId, subject.trim() || undefined, message.trim(), attachedFiles)
    onOpenChange(false)
  }

  const contactsWithEmail = contacts.filter((c) => c.email)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase()
    return contactsWithEmail.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    ).slice(0,5)
  }, [contactsWithEmail, search])

  const selectedContact = contactsWithEmail.find(
    (c) => c.id === selectedContactId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-500" />
            New Message
          </DialogTitle>
          <DialogDescription>Start a conversation with your contacts</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button type="button" variant={!useCustomEmail ? "default" : "outline"} size="sm" onClick={() => setUseCustomEmail(false)}>
              Select Contact
            </Button>
            <Button type="button" variant={useCustomEmail ? "default" : "outline"} size="sm" onClick={() => setUseCustomEmail(true)}>
              Enter Email
            </Button>
          </div>

          {!useCustomEmail ? (
          <div className="space-y-2">
            <Label>To</Label>
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
                          setSelectedContactId(contact.id)
                          setOpenContacts(false)
                          setSearch("")
                        }}
                      >
                        {contact.name} ({contact.email})

                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedContactId === contact.id
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
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customEmail">Email Address</Label>
                <Input id="customEmail" type="email" value={customEmail} onChange={(e) => setCustomEmail(e.target.value)} placeholder="recipient@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customName">Name (optional)</Label>
                <Input id="customName" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="John Doe" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." rows={5} />
          </div>
        </div>

        <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilesSelected} />

        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachedFiles.map((file, i) => (
              <div key={i} className="relative border rounded-lg p-2 bg-muted text-xs flex items-center gap-2">
                {file.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(file)} className="h-12 w-12 object-cover rounded" />
                ) : (
                  <span className="truncate max-w-[120px]">{file.name}</span>
                )}
                <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-black text-white rounded-full w-4 h-4 text-[10px]">✕</button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between">
          <Button className="mb-2 cursor-pointer" type="button" onClick={handleFileClick}>
            <Plus className="w-4 h-4 mr-1" />
            Upload Attachment
          </Button>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={(!useCustomEmail && !selectedContactId) || (useCustomEmail && !customEmail) || (!message.trim() && attachedFiles.length === 0)}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ThreadListItem({
  thread, isSelected, contacts, sharedContacts, onClick, onStar, onDelete, currentUser,
}: {
  thread: MessageThread
  isSelected: boolean
  contacts: Contact[]
  sharedContacts: SharedContact[]
  onClick: () => void
  onStar: () => void
  onDelete: () => void
  currentUser: { id: string; email: string } | null
}) {
  const lastMessage = thread.messages[thread.messages.length - 1]
  const otherParty = getOtherPartyInfo(thread, currentUser, contacts, sharedContacts)
  const isLastMessageFromCurrentUser = lastMessage && currentUser && (lastMessage.senderId === currentUser.id || lastMessage.senderEmail === currentUser.email)
  const inContacts = contacts.some(c => c.email === otherParty.email)

  return (
    <div onClick={onClick} className={`p-3 border-b cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-l-indigo-500" : ""}`}>
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">{getInitials(otherParty.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-medium truncate ${thread.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>{otherParty.name}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}</span>
          </div>
          {!inContacts && <span className={`font-medium truncate ${thread.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>(not in contacts)</span>}
          {thread.subject && <p className={`text-sm truncate ${thread.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{thread.subject}</p>}
          {lastMessage && <p className="text-sm text-muted-foreground truncate mt-0.5">{isLastMessageFromCurrentUser ? "You: " : ""}{lastMessage.content}</p>}
        </div>
        <div className="flex flex-col items-center gap-1">
          {thread.unreadCount > 0 && <Badge variant="default" className="h-5 min-w-[20px] flex items-center justify-center">{thread.unreadCount}</Badge>}
          <button onClick={(e) => { e.stopPropagation(); onStar() }} className="p-1 hover:bg-muted rounded">
            {thread.isStarred ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Star className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1 hover:bg-muted rounded mt-2">
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ThreadHeader({ thread, currentUser, contacts, sharedContacts, onStar, onDelete, onAddContact }: {
  thread: MessageThread
  currentUser: { id: string; email: string } | null
  contacts: Contact[]
  sharedContacts: SharedContact[]
  onStar: () => void
  onDelete: () => void
  onAddContact: () => void
}) {
  const otherParty = getOtherPartyInfo(thread, currentUser, contacts, sharedContacts)
  const inContacts = contacts.some(c => c.email === otherParty.email)

  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">{getInitials(otherParty.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{otherParty.name + (!inContacts?" (not in contacts)":"")}</h3>
          <p className="text-sm text-muted-foreground">{otherParty.email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {!inContacts &&
          <Button onClick={onAddContact} className="cursor-pointer">
              <UserPlus className="w-4 h-4" />
              Add To Contacts
          </Button>
        }
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onStar}>
            {thread.isStarred ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Star className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4"/>
          </Button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  isCurrentUser,
  onEdit,
  onDelete,
}: {
  message: Message
  isCurrentUser: boolean
  onEdit: (newContent: string, newAttachments?: File[], attachmentsToRemove?: string[]) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [showActions, setShowActions] = useState(false)
  const [newAttachments, setNewAttachments] = useState<File[]>([])
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<string[]>([])
  const [fileInputKey, setFileInputKey] = useState(0) // Key to force re-render of file input
  
  const existingAttachments = useMemo(() => 
    (message.attachments ?? []).filter((att): att is string => typeof att === "string"),
    [message.attachments]
  )
  
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)

  // Reset edit state when entering edit mode
  const handleStartEdit = () => {
    setEditContent(message.content)
    setNewAttachments([])
    setAttachmentsToRemove([])
    setFileInputKey(prev => prev + 1)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const hasContentChanged = editContent !== message.content
    const hasAttachmentsChanged = newAttachments.length > 0 || attachmentsToRemove.length > 0
    
    if (hasContentChanged || hasAttachmentsChanged) {
      onEdit(
        editContent.trim(),
        newAttachments.length > 0 ? newAttachments : undefined,
        attachmentsToRemove.length > 0 ? attachmentsToRemove : undefined
      )
    }
    setIsEditing(false)
    setNewAttachments([])
    setAttachmentsToRemove([])
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setNewAttachments([])
    setAttachmentsToRemove([])
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this message?")) {
      onDelete()
    }
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const filesArray = Array.from(files)
    setNewAttachments(prev => [...prev, ...filesArray])
    
    // Reset file input by incrementing key
    setFileInputKey(prev => prev + 1)
  }

  const removeNewAttachment = (index: number) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const markExistingAttachmentForRemoval = (url: string) => {
    setAttachmentsToRemove(prev => [...prev, url])
  }

  const unmarkExistingAttachmentForRemoval = (url: string) => {
    setAttachmentsToRemove(prev => prev.filter((u) => u !== url))
  }

  // Get visible existing attachments (not marked for removal)
  const visibleExistingAttachments = existingAttachments.filter(
    (url) => !attachmentsToRemove.includes(url)
  )

  // Create object URLs for new attachments - memoized to prevent recreation
  const newAttachmentPreviews = useMemo(() => {
    return newAttachments.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isImage: file.type.startsWith("image/")
    }))
  }, [newAttachments])

  // Cleanup object URLs on unmount or when attachments change
  useEffect(() => {
    return () => {
      newAttachmentPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url)
      })
    }
  }, [newAttachmentPreviews])

  return (
    <div 
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action buttons for current user's messages */}
      {isCurrentUser && showActions && !isEditing && (
        <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleStartEdit}>
            <Pencil className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}

      <div className={`max-w-[70%] rounded-2xl px-4 py-2 space-y-2 ${isCurrentUser ? "bg-indigo-600 text-white rounded-br-md" : "bg-muted rounded-bl-md"}`}>
        {isEditing ? (
          <div className="space-y-3">
            {/* File input - using key to force re-render */}
            <input
              key={fileInputKey}
              type="file"
              multiple
              className="hidden"
              id={`file-input-${message.id}`}
              onChange={handleFilesSelected}
            />

            {/* Text content */}
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`min-h-[60px] text-sm ${isCurrentUser ? "bg-indigo-700 border-indigo-500 text-white placeholder:text-indigo-200" : ""}`}
              autoFocus
            />

            {/* Existing attachments (with remove option) */}
            {visibleExistingAttachments.length > 0 && (
              <div className="space-y-1">
                <p className={`text-xs ${isCurrentUser ? "text-indigo-200" : "text-muted-foreground"}`}>
                  Current attachments:
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleExistingAttachments.map((url, i) => (
                    <div key={`existing-${i}-${url}`} className="relative">
                      {isImage(url) ? (
                        <img
                          src={url}
                          alt="attachment"
                          className="h-16 w-16 object-cover rounded-lg border border-white/20"
                        />
                      ) : (
                        <div className={`h-16 px-3 flex items-center rounded-lg border ${isCurrentUser ? "border-indigo-400 bg-indigo-700" : "border-gray-300 bg-gray-100"}`}>
                          <span className={`text-xs truncate max-w-[100px] ${isCurrentUser ? "text-indigo-200" : "text-gray-600"}`}>
                            {url.split('/').pop()?.split('-').slice(1).join('-').replace('%20', ' ')}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => markExistingAttachmentForRemoval(url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                        title="Remove attachment"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments marked for removal */}
            {attachmentsToRemove.length > 0 && (
              <div className="space-y-1">
                <p className={`text-xs ${isCurrentUser ? "text-red-300" : "text-red-500"}`}>
                  Will be removed:
                </p>
                <div className="flex flex-wrap gap-2">
                  {attachmentsToRemove.map((url, i) => (
                    <div key={`remove-${i}-${url}`} className="relative opacity-50">
                      {isImage(url) ? (
                        <img
                          src={url}
                          alt="attachment"
                          className="h-12 w-12 object-cover rounded-lg border border-red-400"
                        />
                      ) : (
                        <div className="h-12 px-2 flex items-center rounded-lg border border-red-400 bg-red-100">
                          <span className="text-xs truncate max-w-[80px] text-red-600">
                            {url.split('/').pop()?.split('-').slice(1).join('-').replace('%20', ' ')}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => unmarkExistingAttachmentForRemoval(url)}
                        className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-green-600"
                        title="Keep attachment"
                      >
                        ↩
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New attachments to add */}
            {newAttachmentPreviews.length > 0 && (
              <div className="space-y-1">
                <p className={`text-xs ${isCurrentUser ? "text-green-300" : "text-green-600"}`}>
                  New attachments ({newAttachmentPreviews.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {newAttachmentPreviews.map((preview, i) => (
                    <div key={`new-${i}-${preview.file.name}`} className="relative">
                      {preview.isImage ? (
                        <img
                          src={preview.url}
                          alt="new attachment"
                          className="h-12 w-12 object-cover rounded-lg border-2 border-green-400"
                        />
                      ) : (
                        <div className={`h-12 px-2 flex items-center rounded-lg border-2 border-green-400 ${isCurrentUser ? "bg-indigo-700" : "bg-gray-100"}`}>
                          <span className={`text-xs truncate max-w-[80px] ${isCurrentUser ? "text-indigo-200" : "text-gray-600"}`}>
                            {preview.file.name}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeNewAttachment(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 justify-between items-center">
              <label
                htmlFor={`file-input-${message.id}`}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 cursor-pointer ${
                  isCurrentUser 
                    ? "text-white border border-indigo-400 hover:bg-indigo-700" 
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Plus className="w-3 h-3 mr-1" /> Add File
              </label>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancelEdit} className={isCurrentUser ? "text-white hover:bg-indigo-700" : ""}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} className={isCurrentUser ? "bg-white text-indigo-600 hover:bg-indigo-100" : ""}>
                  <Check className="w-3 h-3 mr-1" /> Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}

            {existingAttachments.length > 0 && (
              <div className="flex flex-col gap-2">
                {existingAttachments.map((url, i) => {
                  return isImage(url) ? (
                    <img key={`display-${i}-${url}`} src={url} alt="attachment" className="rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90" onClick={() => window.open(url, "_blank")} />
                  ) : (
                    <a key={`display-${i}-${url}`} href={url} target="_blank" className={`text-xs underline break-all ${isCurrentUser ? "text-indigo-200" : "text-blue-600"}`}>
                      {url.split('/').pop()?.split('-').slice(1).join('-').replace('%20', ' ')}
                    </a>
                  )
                })}
              </div>
            )}

            <div className="flex items-center gap-2">
              <p className={`text-[10px] ${isCurrentUser ? "text-indigo-200" : "text-muted-foreground"}`}>
                {format(new Date(message.createdAt), "h:mm a")}
              </p>
              {message.editedAt && (
                <span className={`text-[10px] ${isCurrentUser ? "text-indigo-200" : "text-muted-foreground"}`}>(edited)</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action buttons for other user's messages (on the right) */}
      {!isCurrentUser && showActions && !isEditing && (
        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Non-owner can only delete their copy, typically not shown */}
        </div>
      )}
    </div>
  )
}
 
export function MessagesTab() {
  const {
    contacts,
    sharedContacts,
    messageThreads,
    isLoaded,
    isSyncing,
    syncError,
    currentUser,
    createThread,
    sendMessage,
    markThreadAsRead,
    toggleThreadStar,
    deleteThread,
    editMessage,
    deleteMessage,
    addSharedContactToMyContacts,
    addNonContactToMyContacts
  } = useCommunicationHub()

  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [newMessageContent, setNewMessageContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [messageFilter, setMessageFilter] = useState<"all" | "starred" | "unread">("all")
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Auto-scroll to bottom when thread changes or new messages arrive
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null

    if (!viewport) return

    viewport.scrollTop = viewport.scrollHeight
  }

  // Scroll to bottom when selected thread changes
  useEffect(() => {
    if (selectedThread) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100)
    }
  }, [selectedThread?.id])

  // Scroll to bottom when messages change in current thread
  useEffect(() => {
    if (selectedThread) {
      scrollToBottom()
    }
  }, [selectedThread?.messages?.length])

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSelectedThread(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Keep selectedThread in sync with messageThreads updates
  useEffect(() => {
    if (selectedThread) {
      const updatedThread = messageThreads.find(t => t.id === selectedThread.id)
      if (updatedThread) {
        setSelectedThread(updatedThread)
      }
    }
  }, [messageThreads, selectedThread?.id])

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: c.contactName,
    email: c.email,
  }))

  // Count of threads with unread messages (for the badge)
  const unreadThreadCount = useMemo(() => {
    return messageThreads.filter(t => !t.isArchived && t.unreadCount > 0).length
  }, [messageThreads])

  const filteredThreads = useMemo(() => {
    let threads = messageThreads.filter((t) => !t.isArchived)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      threads = threads.filter(
        (t) =>
          t.contactName?.toLowerCase().includes(q) ||
          t.contactEmail.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q)
      )
    }

    if (messageFilter === "starred") {
      threads = threads.filter((t) => t.isStarred)
    } else if (messageFilter === "unread") {
      threads = threads.filter((t) => t.unreadCount > 0)
    }

    return threads
  }, [messageThreads, searchQuery, messageFilter])

  const handleSendNewMessage = async (
    contactEmail: string,
    contactName: string | undefined,
    contactId: string | undefined,
    subject: string | undefined,
    message: string,
    attachedFiles?: File[]
  ) => {
    const thread = await createThread(contactEmail, contactName, contactId, subject)
    if (thread) {
      const newMessage = await sendMessage(thread, message, attachedFiles)
      const updatedThread = { ...thread, messages: [newMessage] }
      setSelectedThread(updatedThread)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFiles = Array.from(e.dataTransfer.files)
    setAttachedFiles((prev) => [...prev, ...droppedFiles])
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleSendReply = async () => {
    if (!selectedThread || (!newMessageContent.trim() && attachedFiles.length === 0)) return
    const recipient = getOtherPartyInfo(selectedThread, currentUser ? { id: currentUser.id, email: currentUser.email || '' } : null, contacts, sharedContacts).email
    const newMessage = await sendMessage(selectedThread, newMessageContent.trim(), attachedFiles, recipient)
    const updatedThread = { ...selectedThread, messages: [...selectedThread.messages, newMessage] }
    setSelectedThread(updatedThread)
    setNewMessageContent("")
    setAttachedFiles([])
  }

  const handleSelectThread = (thread: MessageThread) => {
    setSelectedThread(thread)
    if (thread.unreadCount > 0) {
      markThreadAsRead(thread.id)
    }
  }

  const handleEditMessage = async (threadId: string, messageId: string, newContent: string, newAttachments?: File[], attachmentsToRemove?: string[]) => {
    await editMessage(threadId, messageId, newContent, newAttachments, attachmentsToRemove)
  }

  const handleDeleteMessage = async (threadId: string, messageId: string) => {
    await deleteMessage(threadId, messageId)
  }

  // Create currentUser object for passing to components
  const currentUserInfo = currentUser ? { id: currentUser.id, email: currentUser.email || '' } : null

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
      <TabsContent value="messages">
        <div className="bg-card border rounded-2xl overflow-hidden min-h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            {/* Thread List */}
            <div className="border-r flex flex-col h-full min-h-0">
              <div className="p-3 border-b space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button size="icon" onClick={() => setIsMessageDialogOpen(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  {(["all", "unread", "starred"] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={messageFilter === filter ? "default" : "ghost"}
                      size="sm"
                      className="capitalize"
                      onClick={() => setMessageFilter(filter)}
                    >
                      {filter}
                      {filter === "unread" && unreadThreadCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 min-w-[16px] text-[10px]">
                          {unreadThreadCount}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
                {filteredThreads.length > 0 ? (
                  filteredThreads.map((thread) => (
                    <ThreadListItem
                      key={thread.id}
                      thread={thread}
                      isSelected={selectedThread?.id === thread.id}
                      contacts={contacts}
                      sharedContacts={sharedContacts}
                      onClick={() => handleSelectThread(thread)}
                      onStar={() => toggleThreadStar(thread.id)}
                      onDelete={() => {
                        if (confirm("Are you sure you want to delete this thread? This thread will be deleted for both you and your contact, and it cannot be undone.")) {
                          deleteThread(thread.id)
                          if (selectedThread && selectedThread.id === thread.id) {setSelectedThread(null)}
                        }}
                      }
                      currentUser={currentUserInfo}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      {messageFilter === "unread" 
                        ? "No unread messages" 
                        : messageFilter === "starred"
                        ? "No starred messages"
                        : "No messages yet"}
                    </p>
                    {messageFilter === "all" && (
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => setIsMessageDialogOpen(true)}
                      >
                        Start a conversation
                      </Button>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Message View */}
            <div className="col-span-2 flex flex-col h-full min-h-0">
              {selectedThread ? (
                <>
                  {/* Thread Header */}
                  <ThreadHeader
                    thread={selectedThread}
                    currentUser={currentUserInfo}
                    contacts={contacts}
                    sharedContacts={sharedContacts}
                    onStar={() => toggleThreadStar(selectedThread.id)}
                    onDelete={() => {
                      if (confirm("Are you sure you want to delete this thread? This thread will be deleted for both you and your contact, and it cannot be undone.")) {
                        deleteThread(selectedThread.id)
                        setSelectedThread(null)
                      }
                    }}
                    onAddContact={() => {
                      const otherParty = getOtherPartyInfo(selectedThread, currentUser, contacts, sharedContacts)
                      const sc = sharedContacts.find(c => c.ownerEmail === otherParty.email)
                      sc ? addSharedContactToMyContacts(sc) : addNonContactToMyContacts(otherParty.name, otherParty.email)
                    }}
                  />

                  {/* Messages */}
                  <ScrollArea className="flex-1 min-h-0 p-4 overflow-y-auto" ref={scrollAreaRef}>
                    <div className="space-y-4">
                      {selectedThread.messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isCurrentUser={message.senderId === currentUser?.id || message.senderEmail === currentUser?.email}
                          onEdit={(newContent, newAttachments, attachmentsToRemove) => handleEditMessage(selectedThread.id, message.id, newContent, newAttachments, attachmentsToRemove)}
                          onDelete={() => handleDeleteMessage(selectedThread.id, message.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Compose */}
                  <div
                    className={`p-4 border-t transition-colors ${
                      isDragging ? "bg-indigo-50 border-indigo-400" : ""
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >

                    {/* hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      hidden
                      onChange={handleFilesSelected}
                    />

                    {/* PREVIEW ROW */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {attachedFiles.map((file, i) => (
                          <div
                            key={i}
                            className="relative border rounded-lg p-2 bg-muted text-xs flex items-center gap-2"
                          >
                            {file.type.startsWith("image/") ? (
                              <img
                                src={URL.createObjectURL(file)}
                                className="h-12 w-12 object-cover rounded"
                              />
                            ) : (
                              <span className="truncate max-w-[120px]">{file.name}</span>
                            )}

                            <button
                              onClick={() => removeFile(i)}
                              className="absolute -top-2 -right-2 bg-black text-white rounded-full w-4 h-4 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessageContent}
                        onChange={(e) => setNewMessageContent(e.target.value)}
                        className="min-h-[80px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendReply()
                          }
                        }}
                      />

                      <div>
                        <Button
                          className="mb-2 cursor-pointer"
                          onClick={handleFileClick}
                          type="button"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>

                        <Button
                          className="self-end cursor-pointer"
                          onClick={handleSendReply}
                          disabled={!newMessageContent.trim() && attachedFiles.length === 0}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a thread from the list or start a new conversation
                    </p>
                    <Button onClick={() => setIsMessageDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      <NewMessageDialog
        open={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        onSend={handleSendNewMessage}
        contacts={contactOptions}
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