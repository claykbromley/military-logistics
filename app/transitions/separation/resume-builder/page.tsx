"use client"

import { useState } from "react"
import { SectionLayout } from "@/components/section-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Download,
  Save,
  Lightbulb,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

// Military to civilian translations
const MOS_TRANSLATIONS: Record<string, { civilian: string; skills: string[] }> = {
  "11B": { civilian: "Security Operations Specialist", skills: ["Team Leadership", "Physical Security", "Risk Assessment", "Crisis Management"] },
  "68W": { civilian: "Emergency Medical Technician / Healthcare Specialist", skills: ["Emergency Care", "Patient Assessment", "Medical Documentation", "Trauma Response"] },
  "25B": { civilian: "Information Technology Specialist", skills: ["Network Administration", "System Maintenance", "Technical Support", "Cybersecurity Basics"] },
  "92Y": { civilian: "Inventory Control / Logistics Specialist", skills: ["Inventory Management", "Supply Chain", "Database Management", "Quality Control"] },
  "88M": { civilian: "Commercial Driver / Transportation Coordinator", skills: ["CDL Operations", "Route Planning", "Cargo Management", "Safety Compliance"] },
  "35F": { civilian: "Intelligence Analyst / Research Specialist", skills: ["Data Analysis", "Report Writing", "Threat Assessment", "Research Methods"] },
  "42A": { civilian: "Human Resources Specialist / Administrator", skills: ["Personnel Management", "Administrative Support", "Data Entry", "Customer Service"] },
  "31B": { civilian: "Law Enforcement / Security Professional", skills: ["Investigations", "Report Writing", "Conflict Resolution", "Emergency Response"] },
  "91B": { civilian: "Diesel Mechanic / Equipment Technician", skills: ["Mechanical Repair", "Diagnostics", "Preventive Maintenance", "Equipment Operation"] },
  "15T": { civilian: "Aviation Technician / Helicopter Mechanic", skills: ["Aircraft Maintenance", "Safety Inspections", "Technical Documentation", "Troubleshooting"] }
}

const MILITARY_TERMS_TO_CIVILIAN: Record<string, string> = {
  "squad leader": "Team Supervisor",
  "platoon sergeant": "Department Manager",
  "company commander": "Operations Director",
  "battalion": "Division",
  "regiment": "Business Unit",
  "mission": "Project",
  "deployment": "Remote Assignment",
  "combat": "High-pressure",
  "tactical": "Strategic",
  "weapons": "Equipment",
  "troops": "Team Members",
  "subordinates": "Direct Reports",
  "NCO": "Supervisor",
  "officer": "Manager/Director",
  "MOS": "Job Code/Specialty",
  "PT": "Physical Fitness",
  "briefing": "Presentation",
  "NCOIC": "Department Lead",
  "OIC": "Project Manager"
}

interface Experience {
  id: string
  title: string
  unit: string
  dates: string
  duties: string[]
  civilianTranslation: string
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  dates: string
  honors: string
}

interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  expiration: string
}

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Experience", icon: Briefcase },
  { id: 3, title: "Education", icon: GraduationCap },
  { id: 4, title: "Skills & Certs", icon: Award },
  { id: 5, title: "Preview", icon: FileText }
]

export default function ResumeBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1)
  
  // Personal Info
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [linkedIn, setLinkedIn] = useState("")
  const [summary, setSummary] = useState("")
  
  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([{
    id: "1",
    title: "",
    unit: "",
    dates: "",
    duties: [""],
    civilianTranslation: ""
  }])
  
  // Education
  const [education, setEducation] = useState<Education[]>([{
    id: "1",
    institution: "",
    degree: "",
    field: "",
    dates: "",
    honors: ""
  }])
  
  // Certifications and Skills
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [mos, setMos] = useState("")

  const translateMOS = () => {
    const translation = MOS_TRANSLATIONS[mos.toUpperCase()]
    if (translation) {
      // Add skills from MOS translation
      setSkills([...new Set([...skills, ...translation.skills])])
    }
  }

  const translateToCivilian = (text: string): string => {
    let translated = text.toLowerCase()
    Object.entries(MILITARY_TERMS_TO_CIVILIAN).forEach(([military, civilian]) => {
      const regex = new RegExp(military, 'gi')
      translated = translated.replace(regex, civilian)
    })
    // Capitalize first letter of sentences
    return translated.replace(/(^\w|\.\s+\w)/g, letter => letter.toUpperCase())
  }

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Date.now().toString(),
      title: "",
      unit: "",
      dates: "",
      duties: [""],
      civilianTranslation: ""
    }])
  }

  const updateExperience = (id: string, field: keyof Experience, value: Experience[keyof Experience]) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ))
  }

  const addDuty = (expId: string) => {
    setExperiences(experiences.map(exp => 
      exp.id === expId ? { ...exp, duties: [...exp.duties, ""] } : exp
    ))
  }

  const updateDuty = (expId: string, dutyIndex: number, value: string) => {
    setExperiences(experiences.map(exp => 
      exp.id === expId ? {
        ...exp,
        duties: exp.duties.map((d, i) => i === dutyIndex ? value : d)
      } : exp
    ))
  }

  const removeDuty = (expId: string, dutyIndex: number) => {
    setExperiences(experiences.map(exp => 
      exp.id === expId && exp.duties.length > 1 ? {
        ...exp,
        duties: exp.duties.filter((_, i) => i !== dutyIndex)
      } : exp
    ))
  }

  const removeExperience = (id: string) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter(exp => exp.id !== id))
    }
  }

  const addEducation = () => {
    setEducation([...education, {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      dates: "",
      honors: ""
    }])
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ))
  }

  const removeEducation = (id: string) => {
    if (education.length > 1) {
      setEducation(education.filter(edu => edu.id !== id))
    }
  }

  const addCertification = () => {
    setCertifications([...certifications, {
      id: Date.now().toString(),
      name: "",
      issuer: "",
      date: "",
      expiration: ""
    }])
  }

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ))
  }

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const calculateProgress = () => {
    let filled = 0
    let total = 10

    if (fullName) filled++
    if (email) filled++
    if (phone) filled++
    if (summary) filled++
    if (experiences.some(e => e.title && e.duties[0])) filled++
    if (education.some(e => e.institution)) filled++
    if (skills.length >= 3) filled++
    if (skills.length >= 6) filled++
    if (location) filled++
    if (certifications.length > 0) filled++

    return Math.round((filled / total) * 100)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.smith@email.com"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>LinkedIn Profile (optional)</Label>
                  <Input
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    placeholder="linkedin.com/in/yourname"
                    className="bg-secondary border-border"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
                <CardDescription>
                  A brief overview of your experience and career goals (2-4 sentences)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Highly motivated professional with [X] years of military experience in [field]. Proven leader with expertise in [skills]. Seeking to leverage [abilities] in a challenging civilian role."
                  className="bg-secondary border-border min-h-[120px]"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSummary(translateToCivilian(summary))}
                    disabled={!summary}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Translate to Civilian
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <Card className="bg-secondary/50 border-gold/30">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Translation Tips</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>Replace military jargon with civilian equivalents</li>
                      <li>Use action verbs: Led, Managed, Coordinated, Developed</li>
                      <li>Quantify achievements: numbers, percentages, dollar amounts</li>
                      <li>Focus on transferable skills and leadership</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {experiences.map((exp, index) => (
              <Card key={exp.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Briefcase className="h-5 w-5 text-gold" />
                      Experience {index + 1}
                    </CardTitle>
                    {experiences.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(exp.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Position/Title *</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                        placeholder="e.g., Squad Leader, Logistics NCO"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit/Organization</Label>
                      <Input
                        value={exp.unit}
                        onChange={(e) => updateExperience(exp.id, "unit", e.target.value)}
                        placeholder="e.g., 101st Airborne Division"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dates of Service</Label>
                    <Input
                      value={exp.dates}
                      onChange={(e) => updateExperience(exp.id, "dates", e.target.value)}
                      placeholder="e.g., March 2020 - Present"
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Civilian-Equivalent Title (optional)</Label>
                    <Input
                      value={exp.civilianTranslation}
                      onChange={(e) => updateExperience(exp.id, "civilianTranslation", e.target.value)}
                      placeholder="e.g., Team Supervisor, Operations Coordinator"
                      className="bg-secondary border-border"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Key Responsibilities & Achievements *</Label>
                    {exp.duties.map((duty, dutyIndex) => (
                      <div key={dutyIndex} className="flex gap-2">
                        <Input
                          value={duty}
                          onChange={(e) => updateDuty(exp.id, dutyIndex, e.target.value)}
                          placeholder="Start with action verb: Led, Managed, Coordinated..."
                          className="bg-secondary border-border"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDuty(exp.id, dutyIndex)}
                          disabled={exp.duties.length === 1}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addDuty(exp.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Bullet Point
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={addExperience} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Position
            </Button>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            {education.map((edu, index) => (
              <Card key={edu.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <GraduationCap className="h-5 w-5 text-gold" />
                      Education {index + 1}
                    </CardTitle>
                    {education.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institution Name</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                      placeholder="e.g., University of Maryland, Community College of the Air Force"
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        placeholder="e.g., Bachelor of Science, Associate Degree"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                        placeholder="e.g., Business Administration"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Dates</Label>
                      <Input
                        value={edu.dates}
                        onChange={(e) => updateEducation(edu.id, "dates", e.target.value)}
                        placeholder="e.g., 2018 - 2022 or Expected 2024"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Honors/GPA (optional)</Label>
                      <Input
                        value={edu.honors}
                        onChange={(e) => updateEducation(edu.id, "honors", e.target.value)}
                        placeholder="e.g., Cum Laude, GPA 3.8"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={addEducation} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Education
            </Button>

            <Card className="bg-secondary/50 border-border">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Include Military Education</p>
                    <p>Don&apos;t forget to include relevant military training and education such as NCOES, professional military education, and any Joint Service Schools.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gold" />
                  MOS/AFSC Translation
                </CardTitle>
                <CardDescription>
                  Enter your MOS code to auto-populate relevant civilian skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={mos}
                    onChange={(e) => setMos(e.target.value)}
                    placeholder="e.g., 11B, 68W, 25B"
                    className="bg-secondary border-border max-w-[200px]"
                  />
                  <Button onClick={translateMOS} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Translate
                  </Button>
                </div>
                {mos && MOS_TRANSLATIONS[mos.toUpperCase()] && (
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <p className="text-sm text-foreground">
                      <strong>Civilian Equivalent:</strong> {MOS_TRANSLATIONS[mos.toUpperCase()].civilian}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add both technical and soft skills relevant to your target career
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    className="bg-secondary border-border"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive/20"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill}
                      <span className="ml-1 text-xs">&times;</span>
                    </Badge>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Certifications & Licenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {certifications.map(cert => (
                  <div key={cert.id} className="grid gap-4 md:grid-cols-4 items-end border-b border-border pb-4">
                    <div className="space-y-2">
                      <Label>Certification Name</Label>
                      <Input
                        value={cert.name}
                        onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                        placeholder="e.g., PMP, Security+"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Organization</Label>
                      <Input
                        value={cert.issuer}
                        onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                        placeholder="e.g., CompTIA"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date Obtained</Label>
                      <Input
                        value={cert.date}
                        onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                        placeholder="MM/YYYY"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertification(cert.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addCertification}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Certification
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      
      case 5:
        return (
          <div className="space-y-6">
            <Tabs defaultValue="preview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="checklist">Final Checklist</TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <Card className="bg-card border-border">
                  <CardContent className="p-8 space-y-6 font-sans">
                    {/* Header */}
                    <div className="text-center border-b border-border pb-4">
                      <h1 className="text-2xl font-bold text-foreground">
                        {fullName || "Your Name"}
                      </h1>
                      <p className="text-muted-foreground text-sm mt-1">
                        {[location, phone, email].filter(Boolean).join(" | ")}
                      </p>
                      {linkedIn && (
                        <p className="text-muted-foreground text-sm">{linkedIn}</p>
                      )}
                    </div>

                    {/* Summary */}
                    {summary && (
                      <div>
                        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-1 mb-2">
                          Professional Summary
                        </h2>
                        <p className="text-sm text-muted-foreground">{summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {experiences.some(e => e.title) && (
                      <div>
                        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-1 mb-3">
                          Experience
                        </h2>
                        {experiences.filter(e => e.title).map(exp => (
                          <div key={exp.id} className="mb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {exp.civilianTranslation || exp.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">{exp.unit}</p>
                              </div>
                              <span className="text-sm text-muted-foreground">{exp.dates}</span>
                            </div>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              {exp.duties.filter(d => d).map((duty, i) => (
                                <li key={i} className="text-sm text-muted-foreground">{duty}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {education.some(e => e.institution) && (
                      <div>
                        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-1 mb-3">
                          Education
                        </h2>
                        {education.filter(e => e.institution).map(edu => (
                          <div key={edu.id} className="mb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-foreground">{edu.institution}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                                  {edu.honors && ` - ${edu.honors}`}
                                </p>
                              </div>
                              <span className="text-sm text-muted-foreground">{edu.dates}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-1 mb-2">
                          Skills
                        </h2>
                        <p className="text-sm text-muted-foreground">{skills.join(" • ")}</p>
                      </div>
                    )}

                    {/* Certifications */}
                    {certifications.filter(c => c.name).length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-1 mb-2">
                          Certifications
                        </h2>
                        {certifications.filter(c => c.name).map(cert => (
                          <p key={cert.id} className="text-sm text-muted-foreground">
                            {cert.name} - {cert.issuer} ({cert.date})
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-4 mt-6">
                  <Button className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90">
                    <Save className="mr-2 h-4 w-4" />
                    Save Resume
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="checklist">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Resume Checklist</CardTitle>
                    <CardDescription>
                      Ensure your resume is ready for civilian job applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { check: !!fullName && !!email && !!phone, label: "Contact information complete" },
                      { check: summary.length > 50, label: "Professional summary written (2-4 sentences)" },
                      { check: !summary.toLowerCase().includes("combat") && !summary.toLowerCase().includes("weapons"), label: "Military jargon removed from summary" },
                      { check: experiences.some(e => e.title && e.duties[0]), label: "At least one experience entry with details" },
                      { check: experiences.every(e => e.civilianTranslation || !e.title), label: "Civilian job titles used" },
                      { check: skills.length >= 6, label: "At least 6 relevant skills listed" },
                      { check: education.some(e => e.institution), label: "Education section complete" },
                      { check: true, label: "Action verbs used (Led, Managed, Developed, etc.)" },
                      { check: true, label: "Achievements quantified where possible" },
                      { check: !linkedIn.includes("linkedin.com/in/") || linkedIn.length > 25, label: "LinkedIn profile added (optional)" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {item.check ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gold" />
                        )}
                        <span className={`text-sm ${item.check ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <SectionLayout
      title="Military Resume Builder"
      description="Translate your military experience into a civilian-friendly resume"
      backLink="/separation"
      backLabel="Separation"
    >
      <div className="space-y-6">
        {/* Progress */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Resume Completion</span>
              <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex overflow-x-auto pb-2 gap-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                currentStep === step.id
                  ? "bg-gold text-gold-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <step.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </SectionLayout>
  )
}
