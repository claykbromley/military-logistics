"use client"

import { useState } from "react"
import {
  Users, Search, Star, Phone, Mail, Globe, Shield,
  MapPin, Filter, ChevronDown, ChevronUp
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdvisors } from "@/hooks/use-financial-manager"

const SPECIALTIES = [
  "TSP",
  "Military Retirement",
  "VA Benefits",
  "SCRA",
  "Deployment Finance",
  "Savings Deposit Program",
  "Estate Planning",
  "SGLI",
  "Tax Planning",
  "Disability Compensation",
  "TRICARE",
  "Investment Management",
]

const STATES = [
  "CA", "CO", "GA", "HI", "NC", "TN", "TX", "VA", "WA",
]

export function AdvisorDirectory() {
  const [search, setSearch] = useState("")
  const [specialty, setSpecialty] = useState<string>("all")
  const [state, setState] = useState<string>("all")
  const [militaryOnly, setMilitaryOnly] = useState(false)
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null)

  const { data: advisors, isLoading } = useAdvisors({
    specialty,
    state,
    militaryOnly,
    search,
  })

  const advisorsList = advisors || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Military Financial Advisors</CardTitle>
              <CardDescription>
                Certified planners who specialize in military finance
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline">{advisorsList.length} found</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, firm, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full sm:w-32">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={militaryOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setMilitaryOnly(!militaryOnly)}
              className={`whitespace-nowrap ${militaryOnly ? "bg-primary text-primary-foreground" : "bg-transparent"}`}
            >
              <Shield className="w-4 h-4 mr-1" />
              Veteran Advisors
            </Button>
          </div>
        </div>

        {/* Advisor list */}
        <div className="space-y-3 max-h-[32rem] overflow-y-auto">
          {advisorsList.map((advisor) => {
            const isExpanded = expandedAdvisor === advisor.id
            return (
              <div
                key={advisor.id}
                className="rounded-lg border border-border bg-secondary/30 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedAdvisor(isExpanded ? null : advisor.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-foreground">{advisor.name}</h4>
                          {advisor.military_experience && (
                            <Badge className="bg-primary/10 text-primary border border-primary/30 text-[10px]">
                              <Shield className="w-3 h-3 mr-0.5" />
                              Veteran
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{advisor.credentials}</p>
                        <p className="text-sm text-muted-foreground">{advisor.firm}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                            <span className="text-sm font-medium text-foreground">{advisor.rating}</span>
                            <span className="text-xs text-muted-foreground">({advisor.review_count})</span>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{advisor.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border">
                    <p className="text-sm text-muted-foreground mt-3 mb-3 leading-relaxed">
                      {advisor.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {advisor.specialties.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>

                    {advisor.accepts_tricare && (
                      <p className="text-xs text-accent font-medium mb-3">
                        Accepts TRICARE/military benefits referrals
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {advisor.phone && (
                        <Button variant="outline" size="sm" asChild className="bg-transparent">
                          <a href={`tel:${advisor.phone}`}>
                            <Phone className="w-3.5 h-3.5 mr-1.5" />{advisor.phone}
                          </a>
                        </Button>
                      )}
                      {advisor.email && (
                        <Button variant="outline" size="sm" asChild className="bg-transparent">
                          <a href={`mailto:${advisor.email}`}>
                            <Mail className="w-3.5 h-3.5 mr-1.5" />Email
                          </a>
                        </Button>
                      )}
                      {advisor.website && (
                        <Button variant="outline" size="sm" asChild className="bg-transparent">
                          <a href={advisor.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-3.5 h-3.5 mr-1.5" />Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {advisorsList.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No advisors match your filters.</p>
              <p className="text-sm">Try broadening your search criteria.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
