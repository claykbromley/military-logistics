import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GraduationCap, ClipboardList, FileText, Gift, GitCompare, DollarSign, Heart, Home,
  BookOpen, Shield, Plane, ExternalLink, HeartPulse, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { name: 'Overview', href: '/transitions/enlistment', icon: GraduationCap },
  { name: 'Checklist', href: '/transitions/enlistment/checklist', icon: ClipboardList },
  { name: 'Documents', href: '/transitions/enlistment/documents', icon: FileText },
  { name: 'Benefits', href: '/transitions/enlistment/benefits', icon: Gift },
  { name: 'Branch Comparison', href: '/transitions/enlistment/branch-comparison', icon: GitCompare },
]

const educationBenefits = [
  {
    title: 'Post-9/11 GI Bill',
    description: 'Up to 36 months of education benefits for college, vocational training, or apprenticeships.',
    highlights: [
      'Full tuition and fees at public schools (or private school cap)',
      'Monthly housing allowance (BAH E-5 rate)',
      'Books and supplies stipend ($1,000/year)',
      'Transferable to spouse/children after 6 years',
    ],
    link: 'https://www.va.gov/education/about-gi-bill-benefits/post-9-11/',
  },
  {
    title: 'Montgomery GI Bill',
    description: 'Alternative education benefit with $1,200 buy-in during training.',
    highlights: [
      '$2,200/month for full-time students',
      'Can be combined with other benefits',
      'Available for active duty and reservists',
    ],
  },
  {
    title: 'Tuition Assistance',
    description: 'Up to $250 per credit hour while serving, separate from GI Bill.',
    highlights: [
      'Up to $4,500 per fiscal year',
      'Use while on active duty',
      "Doesn't reduce GI Bill benefits",
      'Available for college courses',
    ],
  },
  {
    title: 'College Loan Repayment',
    description: 'Military may repay student loans as enlistment incentive.',
    highlights: [
      'Up to $65,000 in loan repayment',
      'Varies by branch and job',
      'May be combined with other bonuses',
    ],
  },
]

const healthcareBenefits = [
  {
    title: 'TRICARE Prime',
    description: 'Comprehensive healthcare coverage for service members.',
    highlights: [
      'No premiums for active duty',
      'Minimal copays',
      'Worldwide coverage',
      'Includes dental and vision',
    ],
  },
  {
    title: 'Mental Health Services',
    description: 'Full mental health coverage without stigma.',
    highlights: [
      'Counseling and therapy',
      'Substance abuse treatment',
      'Family counseling available',
    ],
  },
  {
    title: 'Family Coverage',
    description: 'TRICARE extends to your dependents.',
    highlights: [
      'Spouse and children covered',
      'Prenatal and childbirth care',
      'Pediatric services',
    ],
  },
]

const housingBenefits = [
  {
    title: 'Basic Allowance for Housing (BAH)',
    description: 'Tax-free monthly allowance based on rank, location, and dependency status.',
    highlights: [
      'Rates vary by zip code',
      'Higher with dependents',
      'Increases with rank',
      'Tax-free income',
    ],
    link: '/services/command-center/career',
  },
  {
    title: 'On-Base Housing',
    description: 'Free housing on military installations.',
    highlights: [
      'No rent or utilities',
      'Maintenance included',
      'Family housing available',
      'Safe communities',
    ],
  },
]

const additionalBenefits = [
  {
    icon: DollarSign,
    title: 'Special & Incentive Pays',
    description: 'Additional pay for hazardous duty, special skills, bonuses, and more.',
    href: 'https://www.dfas.mil/MilitaryMembers/payentitlements/specialpay/'
  },
  {
    icon: Plane,
    title: 'Space-Available Travel',
    description: 'Free flights on military aircraft when space permits.',
    href: 'https://www.militaryonesource.mil/benefits/space-a-travel/'
  },
  {
    icon: Shield,
    title: 'Life Insurance (SGLI)',
    description: 'Up to $500,000 in low-cost life insurance coverage.',
    href: 'https://milconnect.dmdc.osd.mil/milconnect/public/faq/Life_Insurance-SGLI'
  },
  {
    icon: Gift,
    title: 'Commissary & Exchange',
    description: 'Tax-free shopping at military stores with significant savings.',
    href: 'https://shop.commissaries.com/'
  },
]

export default function EnlistmentBenefitsPage() {
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
            <span className="text-foreground font-medium">Benefits</span>
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Military Benefits Overview</h2>
              <p className="text-primary mb-6">
                Comprehensive benefits package for service members and their families
              </p>
            </div>

            {/* Content */}
            <Tabs defaultValue="pay" className="space-y-6">
              <TabsList className="w-full h-auto flex gap-3 overflow-x-auto rounded-2xl bg-muted/60 p-1.5 backdrop-blur-sm border border-border shadow-sm">
                {[
                  { value: "pay", label: "Pay" },
                  { value: "education", label: "Education" },
                  { value: "healthcare", label: "Healthcare" },
                  { value: "housing", label: "Housing" },
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

              {/* Pay Tab */}
              <TabsContent value="pay" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div className='flex flex-col gap-2'>
                        <CardTitle>Total Compensation</CardTitle>
                        <CardDescription>
                          Base pay is just the beginning - here&apos;s what you actually receive
                        </CardDescription>
                      </div>
                      <Button asChild>
                        <Link href="/services/command-center/career">
                          Full Military Pay Calculator
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                        <div className='flex gap-2'>
                          <span className="font-medium">Base Pay:</span>
                          <span className="font-small">based on rank and years of service</span>
                        </div>
                        <span>Taxable</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                        <div className='flex gap-2'>
                          <span className="font-medium">Basic Allowance for Housing (BAH):</span>
                          <span className="font-small">based on location, rank, and dependents</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">Tax-Free</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                        <div className='flex gap-2'>
                          <span className="font-medium">Basic Allowance for Subsistence (BAS):</span>
                          <span className="font-small">based on rank</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">Tax-Free</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                        <div className='flex gap-2'>
                          <span className="font-medium">Special & Incentive Pays:</span>
                          <span className="font-small">based on job</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Varies</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                        <span className="font-medium">Healthcare Value</span>
                        <span className="text-sm text-muted-foreground">~$15,000/year</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="space-y-6">
                {educationBenefits.map((benefit) => (
                  <Card key={benefit.title}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {benefit.title}
                          </CardTitle>
                          <CardDescription className="mt-1">{benefit.description}</CardDescription>
                        </div>
                        {benefit.link && (
                          <Button size="sm" asChild>
                            <a href={benefit.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Learn More
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {benefit.highlights.map((highlight) => (
                          <li key={highlight} className="flex items-start gap-2 text-sm">
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Healthcare Tab */}
              <TabsContent value="healthcare" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {healthcareBenefits.map((benefit) => (
                    <Card key={benefit.title}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Heart className="h-5 w-5 text-primary" />
                          {benefit.title}
                        </CardTitle>
                        <CardDescription>{benefit.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {benefit.highlights.map((highlight) => (
                            <li key={highlight} className="flex items-start gap-2 text-sm">
                              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <HeartPulse className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          Military Medical Coverage
                        </p>
                        <p className="text-xs text-muted-foreground">
                          TRICARE coverage continues for families, including during deployments.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                      <Button size="sm" asChild>
                        <a href="/services/medical">
                          Learn Your Benefits
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href="https://www.tricare.mil/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          TRICARE.mil
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Housing Tab */}
              <TabsContent value="housing" className="space-y-6 mb-6">
                {housingBenefits.map((benefit) => (
                  <Card key={benefit.title}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5 text-primary" />
                            {benefit.title}
                          </CardTitle>
                          <CardDescription className="mt-1">{benefit.description}</CardDescription>
                        </div>
                        {benefit.link && (
                          <Button size="sm" asChild>
                            <a href={benefit.link}>
                              <ExternalLink className="mr-1 h-3 w-3" />
                              BAH Calculator
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {benefit.highlights.map((highlight) => (
                          <li key={highlight} className="flex items-start gap-2 text-sm">
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            {/* Additional Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Benefits</CardTitle>
                <CardDescription>
                  More ways the military takes care of its service members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {additionalBenefits.map((benefit) => (
                    <Link key={benefit.title} href={benefit.href} className="flex items-start gap-3 rounded-lg bg-primary/5 hover:bg-primary/10 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <benefit.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{benefit.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
