"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Search, UserPlus, UserCheck, Clock, Loader2,
  ExternalLink, Shield, Award, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useConnections } from "@/hooks/use-connections"
import { MILITARY_BRANCHES, PAYGRADES } from "@/lib/types"

interface SearchResult {
  id: string
  display_name: string
  email: string
  avatar_url?: string
  military_branch?: string
  paygrade?: string
  privacy_level?: string
  privacy_show_in_search?: boolean
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

/** Embed this on any page to give users a search trigger */
export function MemberSearchBar({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:border-primary/30 hover:bg-muted/50 transition-colors cursor-pointer w-full ${className}`}
      >
        <Search className="h-4 w-4" />
        <span>Find members...</span>
      </button>
      <MemberSearchDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}

/** Full search dialog with debounced search, privacy filtering, and connection actions */
export function MemberSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const {
    getConnectionStatus,
    sendConnectionRequest,
    getRequestForUser,
    cancelConnectionRequest,
    currentUserId,
    isSyncing,
  } = useConnections()

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open) {
      setQuery(""); setResults([]); setHasSearched(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setHasSearched(false); return }
    setSearching(true); setHasSearched(true)
    try {
      const supabase = createClient()
      const searchTerm = `%${q.trim()}%`
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, email, avatar_url, military_branch, paygrade, privacy_level, privacy_show_in_search")
        .or(`display_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .neq("id", currentUserId || "")
        .limit(20)
      if (error) { console.error(error); setResults([]); return }

      // Filter out users who opted out of search (unless connected)
      const filtered = (data || []).filter((u) => {
        if (u.privacy_show_in_search ?? true) return true
        return getConnectionStatus(u.id) === "connected"
      })
      setResults(filtered)
    } catch (err) { console.error(err); setResults([]) }
    finally { setSearching(false) }
  }, [currentUserId, getConnectionStatus])

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const handleViewProfile = (userId: string) => {
    onOpenChange(false)
    router.push(`/profile/${userId}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find Members
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 pr-9"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); setHasSearched(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px]">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!searching && hasSearched && results.length === 0 && (
            <div className="text-center py-8 px-4">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">No members found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different name or email address</p>
            </div>
          )}

          {!searching && !hasSearched && (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="divide-y">
              {results.map((user) => {
                const status = getConnectionStatus(user.id)
                const branchLabel = MILITARY_BRANCHES.find(b => b.value === user.military_branch)?.label
                const paygradeLabel = PAYGRADES.find(p => p.value === user.paygrade)?.label
                const reqInfo = getRequestForUser(user.id)

                return (
                  <div key={user.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleViewProfile(user.id)} className="cursor-pointer shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.display_name} className="h-10 w-10 rounded-xl object-cover" />
                        ) : (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm">
                              {getInitials(user.display_name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <button onClick={() => handleViewProfile(user.id)}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer truncate block">
                          {user.display_name}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {branchLabel && <span className="flex items-center gap-0.5"><Shield className="h-3 w-3" />{branchLabel}</span>}
                          {paygradeLabel && <span className="flex items-center gap-0.5"><Award className="h-3 w-3" />{paygradeLabel}</span>}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {status === "connected" && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                            <UserCheck className="h-3 w-3 mr-1" />Connected
                          </Badge>
                        )}
                        {status === "pending_sent" && (
                          <Button variant="outline" size="sm" className="h-7 text-xs cursor-pointer"
                            onClick={() => { if (reqInfo) cancelConnectionRequest(reqInfo.requestId) }}
                            disabled={isSyncing}>
                            <Clock className="h-3 w-3 mr-1 text-amber-500" />Pending
                          </Button>
                        )}
                        {status === "pending_received" && (
                          <Badge variant="default" className="text-xs">Wants to connect</Badge>
                        )}
                        {status === "none" && (
                          <Button variant="outline" size="sm" className="h-7 text-xs cursor-pointer"
                            onClick={() => sendConnectionRequest(user.id)}
                            disabled={isSyncing}>
                            {isSyncing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <UserPlus className="h-3 w-3 mr-1" />}
                            Connect
                          </Button>
                        )}
                      </div>

                      <button onClick={() => handleViewProfile(user.id)}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0" title="View profile">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}