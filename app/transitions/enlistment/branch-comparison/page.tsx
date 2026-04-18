'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GraduationCap, ClipboardList, FileText, Gift, GitCompare, Clock, Users, Anchor, Plane,
  Shield, Ship, Rocket, Waves, ChevronRight } from 'lucide-react'

const navItems = [
  { name: 'Overview', href: '/transitions/enlistment', icon: GraduationCap },
  { name: 'Checklist', href: '/transitions/enlistment/checklist', icon: ClipboardList },
  { name: 'Documents', href: '/transitions/enlistment/documents', icon: FileText },
  { name: 'Benefits', href: '/transitions/enlistment/benefits', icon: Gift },
  { name: 'Branch Comparison', href: '/transitions/enlistment/branch-comparison', icon: GitCompare },
]

interface BranchData {
  id: string
  name: string
  fullName: string
  icon: typeof Shield
  color: string
  mission: string
  founded: string
  personnel: string
  basicTraining: {
    duration: string
    location: string
  }
  minAsvab: number
  enlistmentBonus: string
  uniqueBenefits: string[]
  lifestyle: string[]
  deploymentFrequency: string
  jobCategories: string[]
}

const branches: BranchData[] = [
  {
    id: 'army',
    name: 'Army',
    fullName: 'U.S. Army',
    icon: Shield,
    color: '#4B5320',
    mission: 'Land-based military operations and ground combat',
    founded: '1775',
    personnel: '485,000+ Active Duty',
    basicTraining: {
      duration: '10 weeks',
      location: 'Fort Jackson, Fort Leonard Wood, Fort Sill, Fort Moore',
    },
    minAsvab: 31,
    enlistmentBonus: 'Up to $50,000',
    uniqueBenefits: [
      'Most MOS options (150+)',
      'Army College Fund up to $50,000',
      'Warrant Officer programs',
      'Special Forces opportunities',
    ],
    lifestyle: [
      'Many duty stations worldwide',
      'Strong family support programs',
      'Frequent field exercises',
    ],
    deploymentFrequency: 'Varies by MOS - Combat Arms deploy frequently',
    jobCategories: ['Combat', 'Combat Support', 'Combat Service Support', 'Aviation', 'Cyber', 'Medical'],
  },
  {
    id: 'navy',
    name: 'Navy',
    fullName: 'U.S. Navy',
    icon: Anchor,
    color: '#000080',
    mission: 'Sea-based military operations and power projection',
    founded: '1775',
    personnel: '340,000+ Active Duty',
    basicTraining: {
      duration: '8 weeks',
      location: 'Great Lakes, Illinois',
    },
    minAsvab: 31,
    enlistmentBonus: 'Up to $40,000',
    uniqueBenefits: [
      'Nuclear propulsion training',
      'SEAL and Special Warfare',
      'Submarine duty pay',
      'Sea duty pay',
    ],
    lifestyle: [
      'Extended deployments at sea',
      'Port visits worldwide',
      'Shipboard living',
    ],
    deploymentFrequency: '6-9 month deployments typical',
    jobCategories: ['Surface Warfare', 'Submarine', 'Aviation', 'Special Warfare', 'Medical', 'Engineering'],
  },
  {
    id: 'airforce',
    name: 'Air Force',
    fullName: 'U.S. Air Force',
    icon: Plane,
    color: '#00308F',
    mission: 'Air and space superiority, rapid global mobility',
    founded: '1947',
    personnel: '325,000+ Active Duty',
    basicTraining: {
      duration: '8.5 weeks',
      location: 'Lackland AFB, Texas',
    },
    minAsvab: 31,
    enlistmentBonus: 'Up to $40,000',
    uniqueBenefits: [
      'Best quality of life ratings',
      'Tech-focused careers',
      'Community College of AF',
      'Space operations',
    ],
    lifestyle: [
      'Generally better housing',
      'Shorter deployments typically',
      'Tech-focused environment',
    ],
    deploymentFrequency: '4-6 month deployments typical',
    jobCategories: ['Operations', 'Maintenance', 'Cyber', 'Intelligence', 'Medical', 'Support'],
  },
  {
    id: 'marines',
    name: 'Marines',
    fullName: 'U.S. Marine Corps',
    icon: Ship,
    color: '#8B0000',
    mission: 'Rapid-response expeditionary force, amphibious operations',
    founded: '1775',
    personnel: '180,000+ Active Duty',
    basicTraining: {
      duration: '13 weeks',
      location: 'Parris Island, SC or San Diego, CA',
    },
    minAsvab: 32,
    enlistmentBonus: 'Up to $30,000',
    uniqueBenefits: [
      'Elite warrior culture',
      'Force Recon/MARSOC',
      'Strong brotherhood/sisterhood',
      'First to fight tradition',
    ],
    lifestyle: [
      'High operational tempo',
      'Strong unit cohesion',
      'Rigorous physical standards',
    ],
    deploymentFrequency: 'Frequent deployments, often short notice',
    jobCategories: ['Infantry', 'Combat Support', 'Aviation', 'Logistics', 'Communications', 'Intelligence'],
  },
  {
    id: 'coastguard',
    name: 'Coast Guard',
    fullName: 'U.S. Coast Guard',
    icon: Waves,
    color: '#FF6600',
    mission: 'Maritime safety, security, and environmental protection',
    founded: '1790',
    personnel: '42,000+ Active Duty',
    basicTraining: {
      duration: '8 weeks',
      location: 'Cape May, New Jersey',
    },
    minAsvab: 36,
    enlistmentBonus: 'Up to $20,000',
    uniqueBenefits: [
      'Primarily CONUS duty',
      'Law enforcement authority',
      'Search and rescue missions',
      'Environmental protection',
    ],
    lifestyle: [
      'More home time typically',
      'Smaller, tight-knit units',
      'Direct community impact',
    ],
    deploymentFrequency: 'Shorter deployments, often patrol-based',
    jobCategories: ['Operations', 'Engineering', 'Aviation', 'Intelligence', 'Administration', 'Health Services'],
  },
  {
    id: 'spaceforce',
    name: 'Space Force',
    fullName: 'U.S. Space Force',
    icon: Rocket,
    color: '#1C1C1C',
    mission: 'Space operations, satellite control, and space domain awareness',
    founded: '2019',
    personnel: '8,600+ Guardians',
    basicTraining: {
      duration: '8.5 weeks',
      location: 'Lackland AFB, Texas (with Air Force)',
    },
    minAsvab: 31,
    enlistmentBonus: 'Varies by specialty',
    uniqueBenefits: [
      'Newest branch - shape its future',
      'Cutting-edge technology',
      'High-tech career fields',
      'Growing opportunities',
    ],
    lifestyle: [
      'Tech-focused environment',
      'Limited duty locations',
      'Primarily CONUS assignments',
    ],
    deploymentFrequency: 'Minimal traditional deployments',
    jobCategories: ['Space Operations', 'Cyber Operations', 'Intelligence', 'Engineering', 'Acquisitions'],
  },
]

export default function BranchComparisonPage() {
  const [selectedBranches, setSelectedBranches] = useState<Set<string>>(
    new Set(['army', 'airforce', 'navy'])
  )

  const toggleBranch = (branchId: string) => {
    setSelectedBranches((prev) => {
      const next = new Set(prev)
      if (next.has(branchId)) {
        if (next.size > 1) next.delete(branchId)
      } else {
        next.add(branchId)
      }
      return next
    })
  }

  const selectedBranchData = branches.filter((b) => selectedBranches.has(b.id))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4" />
            <a className="hover:text-primary transition-colors">
              Transitions
            </a>
            <ChevronRight className="h-4 w-4" />
            <a href="/transitions/enlistment" className="hover:text-primary transition-colors">
              Enlistment
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Branch Comparison</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-sidebar border-r">
          <div className="top-20 p-6">
            <a href="/transitions/enlistment">
              <h2 className="text-2xl font-bold text-sidebar-foreground mb-6 pb-3 border-b-2 border-muted-foreground text-center">
                Enlistment
              </h2>
            </a>
            <div className="space-y-3">
              {navItems.map((category) => {
                const Icon = category.icon
                return (
                  <a key={category.name} href={category.href} className="block">
                    <Card
                      key={category.name}
                      className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </Card>
                  </a>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
            {/* Hero */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-3">Branch Comparison Tool</h2>
              <p className="text-primary mb-6">
                Compare military branches side-by-side to find the best fit for you
              </p>
            </div>

            {/* Content */}
            <div className="space-y-6">

              {/* Branch Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Branches to Compare</CardTitle>
                  <CardDescription>Choose at least one branch to view details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {branches.map((branch) => {
                      const Icon = branch.icon
                      const isSelected = selectedBranches.has(branch.id)
                      return (
                        <div
                          key={branch.id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={branch.id}
                            checked={isSelected}
                            onCheckedChange={() => toggleBranch(branch.id)}
                            className='dark:border-slate-500/50'
                          />
                          <label
                            htmlFor={branch.id}
                            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                          >
                            <Icon className="h-4 w-4" style={{ color: branch.color }} />
                            {branch.name}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="w-full h-auto flex gap-3 overflow-x-auto rounded-2xl bg-muted/60 p-1.5 backdrop-blur-sm border border-border shadow-sm">
                  {[
                    { value: "overview", label: "Overview" },
                    { value: "benefits", label: "Benefits" },
                    { value: "training", label: "Training" },
                    { value: "lifestyle", label: "Lifestyle" },
                  ].map(({ value, label }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/10 data-[state=active]:!bg-primary/30 data-[state=active]:!text-foreground cursor-pointer"
                    >
                      <span className="whitespace-nowrap">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className='border-b border-border dark:border-slate-500/50 hover:bg-primary/10'>
                              <TableHead className="w-[150px]">Attribute</TableHead>
                              {selectedBranchData.map((branch) => (
                                <TableHead key={branch.id}>
                                  <div className="flex items-center gap-2">
                                    <branch.icon className="h-4 w-4" style={{ color: branch.color }} />
                                    {branch.name}
                                  </div>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className='border-b border-border dark:border-slate-500/50 hover:bg-primary/10'>
                              <TableCell className="font-medium">Founded</TableCell>
                              {selectedBranchData.map((branch) => (
                                <TableCell key={branch.id}>{branch.founded}</TableCell>
                              ))}
                            </TableRow>
                            <TableRow className='border-b border-border dark:border-slate-500/50 hover:bg-primary/10'>
                              <TableCell className="font-medium">Active Personnel</TableCell>
                              {selectedBranchData.map((branch) => (
                                <TableCell key={branch.id}>{branch.personnel}</TableCell>
                              ))}
                            </TableRow>
                            <TableRow className='border-b border-border dark:border-slate-500/50 hover:bg-primary/10'>
                              <TableCell className="font-medium">Min ASVAB Score</TableCell>
                              {selectedBranchData.map((branch) => (
                                <TableCell key={branch.id}>{branch.minAsvab}</TableCell>
                              ))}
                            </TableRow>
                            <TableRow className='hover:bg-primary/10'>
                              <TableCell className="font-medium">Mission</TableCell>
                              {selectedBranchData.map((branch) => (
                                <TableCell key={branch.id} className="max-w-[200px] whitespace-normal break-words">
                                  {branch.mission}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Training Tab */}
                <TabsContent value="training">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedBranchData.map((branch) => {
                      const Icon = branch.icon
                      return (
                        <Card key={branch.id}>
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5" style={{ color: branch.color }} />
                              <CardTitle className="text-lg">{branch.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Basic Training Duration</p>
                              <div className="mt-1 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{branch.basicTraining.duration}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Location</p>
                              <p className="mt-1 text-sm">{branch.basicTraining.location}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Job Categories</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {branch.jobCategories.slice(0, 4).map((cat) => (
                                  <Badge key={cat} variant="secondary" className="text-xs">
                                    {cat}
                                  </Badge>
                                ))}
                                {branch.jobCategories.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{branch.jobCategories.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                {/* Benefits Tab */}
                <TabsContent value="benefits">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedBranchData.map((branch) => {
                      const Icon = branch.icon
                      return (
                        <Card key={branch.id}>
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5" style={{ color: branch.color }} />
                              <CardTitle className="text-lg">{branch.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Enlistment Bonus</p>
                              <p className="mt-1 font-semibold text-primary">{branch.enlistmentBonus}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Unique Benefits</p>
                              <ul className="mt-2 space-y-1">
                                {branch.uniqueBenefits.map((benefit) => (
                                  <li key={benefit} className="flex items-start gap-2 text-sm">
                                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                {/* Lifestyle Tab */}
                <TabsContent value="lifestyle">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedBranchData.map((branch) => {
                      const Icon = branch.icon
                      return (
                        <Card key={branch.id}>
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5" style={{ color: branch.color }} />
                              <CardTitle className="text-lg">{branch.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Deployment Frequency</p>
                              <p className="mt-1 text-sm">{branch.deploymentFrequency}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Lifestyle Factors</p>
                              <ul className="mt-2 space-y-1">
                                {branch.lifestyle.map((item) => (
                                  <li key={item} className="flex items-start gap-2 text-sm">
                                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Call to Action */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <h3 className="font-semibold text-foreground">Ready to take the next step?</h3>
                    <p className="text-sm text-muted-foreground">
                      Talk to recruiters from the branches you&apos;re interested in.
                    </p>
                  </div>
                  <Button asChild>
                    <a
                      href="https://www.military.com/join-armed-forces/visiting-a-recruiter"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Find a Recruiter
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
