import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GraduationCap, ClipboardList, FileText, Gift, GitCompare, ExternalLink, AlertCircle, CheckCircle2, Info, ChevronRight} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'

const navItems = [
  { name: 'Overview', href: '/transitions/enlistment', icon: GraduationCap },
  { name: 'Checklist', href: '/transitions/enlistment/checklist', icon: ClipboardList },
  { name: 'Documents', href: '/transitions/enlistment/documents', icon: FileText },
  { name: 'Benefits', href: '/transitions/enlistment/benefits', icon: Gift },
  { name: 'Branch Comparison', href: '/transitions/enlistment/branch-comparison', icon: GitCompare },
]

const requiredDocuments = [
  {
    title: 'Birth Certificate',
    description: 'Original or certified copy with raised seal. Hospital certificates are not accepted.',
    required: true,
    howToObtain: 'Contact vital records office in the state where you were born',
    link: 'https://www.cdc.gov/nchs/w2w/index.htm',
    linkLabel: 'Find Vital Records Office',
    tips: [
      'Order early - can take 2-4 weeks',
      'Must have raised seal or security features',
      'Photocopies not accepted',
    ],
  },
  {
    title: 'Social Security Card',
    description: 'Original card required. Replacement cards can be ordered online.',
    required: true,
    howToObtain: 'Order replacement through Social Security Administration',
    link: 'https://www.ssa.gov/myaccount/replacement-card.html',
    linkLabel: 'Replace SS Card',
    tips: [
      'Free to replace',
      'Takes 10-14 business days',
      'Can request up to 3 per year',
    ],
  },
  {
    title: 'Valid Photo ID',
    description: "Driver's license or state-issued ID card. Must be current and not expired.",
    required: true,
    howToObtain: 'Visit your state DMV or equivalent agency',
    tips: [
      "Ensure it won't expire before your ship date",
      'Address should match current residence',
    ],
  },
  {
    title: 'High School Diploma or GED',
    description: 'Original diploma or official transcripts. GED certificate if applicable.',
    required: true,
    howToObtain: 'Contact your high school or GED testing center',
    tips: [
      'High school diploma preferred over GED',
      'Some jobs require diploma',
      'College credits can help',
    ],
  },
  {
    title: 'College Transcripts',
    description: 'If you have any college credits, bring official transcripts.',
    required: false,
    howToObtain: 'Request from college registrar office',
    tips: [
      'Can help with advanced rank',
      'May qualify for officer programs',
      'Shows academic capability',
    ],
  },
]

const medicalDocuments = [
  {
    title: 'Medical Records',
    description: 'All hospitalizations, surgeries, and ongoing medical conditions.',
    required: true,
    tips: [
      'Be completely honest - lying is grounds for discharge',
      'Include mental health records',
      'Bring prescription medication list',
    ],
  },
  {
    title: 'Immunization Records',
    description: 'Any available vaccination records from childhood through present.',
    required: false,
    tips: [
      'Military will provide required vaccinations',
      'Having records speeds up processing',
    ],
  },
  {
    title: 'Prescription Glasses/Contacts',
    description: 'Current prescription and glasses. Bring glasses to MEPS, not contacts.',
    required: false,
    tips: [
      'Wear glasses to MEPS, not contacts',
      'Bring prescription documentation',
      'Military will provide BCGs (glasses)',
    ],
  },
]

const legalDocuments = [
  {
    title: 'Court Records',
    description: 'Any arrests, charges, or convictions, even if expunged or juvenile.',
    required: true,
    ifApplicable: true,
    tips: [
      'Full disclosure is mandatory',
      'Waivers may be available',
      'Lying will disqualify you',
    ],
  },
  {
    title: 'Divorce Decree',
    description: 'If previously married, final divorce documentation.',
    required: true,
    ifApplicable: true,
  },
  {
    title: 'Custody Documents',
    description: 'If you have children, custody agreements and child support orders.',
    required: true,
    ifApplicable: true,
  },
  {
    title: 'Naturalization Certificate',
    description: 'If naturalized citizen, bring certificate of naturalization.',
    required: true,
    ifApplicable: true,
    tips: [
      'Green card holders may enlist in some cases',
      'Citizenship required for many jobs',
    ],
  },
]

export default function EnlistmentDocumentsPage() {
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
            <span className="text-foreground font-medium">Documents</span>
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Required Documents</h2>
              <p className="text-primary mb-6">
                Gather these documents before your MEPS appointment
              </p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                  <span>
                    Create a folder with all your documents and make copies for your personal records. 
                    You'll need these documents multiple times throughout your military career. 
                    You can also store them in your{" "}
                    <a
                      href="/services/command-center/documents"
                      className="font-medium underline underline-offset-4 hover:text-primary"
                    >
                      Document Vault
                    </a>.
                  </span>
                </AlertDescription>
              </Alert>

              {/* Primary Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Identity & Education Documents
                  </CardTitle>
                  <CardDescription>
                    These documents are required for all applicants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {requiredDocuments.map((doc) => (
                      <div
                        key={doc.title}
                        className="rounded-lg border border-border/50 dark:border-slate-500/50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{doc.title}</h3>
                              {doc.required ? (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Required
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Recommended</Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
                            {doc.howToObtain && (
                              <p className="mt-2 text-sm">
                                <span className="font-medium">How to obtain:</span> {doc.howToObtain}
                              </p>
                            )}
                            {doc.tips && (
                              <ul className="mt-3 space-y-1">
                                {doc.tips.map((tip) => (
                                  <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          {doc.link && (
                            <Button size="sm" asChild className="shrink-0">
                              <a href={doc.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-1 h-3 w-3" />
                                {doc.linkLabel}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Medical Documentation
                  </CardTitle>
                  <CardDescription>
                    Medical history and records for MEPS processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertTitle className="text-destructive">Full Disclosure Required</AlertTitle>
                    <AlertDescription className="text-destructive/80">
                      You must disclose all medical conditions, hospitalizations, and mental health history.
                      Failure to disclose can result in discharge and loss of benefits.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-6">
                    {medicalDocuments.map((doc) => (
                      <div
                        key={doc.title}
                        className="rounded-lg border border-border/50 dark:border-slate-500/50 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{doc.title}</h3>
                          {doc.required ? (
                            <Badge variant="destructive" className="gap-1">Required</Badge>
                          ) : (
                            <Badge variant="secondary">If Available</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
                        {doc.tips && (
                          <ul className="mt-3 space-y-1">
                            {doc.tips.map((tip) => (
                              <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Legal Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Legal Documents (If Applicable)
                  </CardTitle>
                  <CardDescription>
                    Additional documents needed based on your situation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {legalDocuments.map((doc) => (
                      <div
                        key={doc.title}
                        className="rounded-lg border border-border/50 dark:border-slate-500/50 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{doc.title}</h3>
                          <Badge variant="outline" className='dark:border-slate-500/50'>If Applicable</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
                        {doc.tips && (
                          <ul className="mt-3 space-y-1">
                            {doc.tips.map((tip) => (
                              <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
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
