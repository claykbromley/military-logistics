import { Header } from "@/components/header"
import { Briefcase, FileText, Users, BookOpen, TrendingUp, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function EmploymentPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Employment Services</h1>
            <p className="text-lg text-muted-foreground">
              Career resources and job opportunities for service members and veterans
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Briefcase className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Job Search</CardTitle>
                <CardDescription>Find veteran-friendly employers</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Search Jobs</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Resume Builder</CardTitle>
                <CardDescription>Create a professional military resume</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Build Resume</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Career Counseling</CardTitle>
                <CardDescription>Get guidance from career experts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Schedule Session</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Skills Translation</CardTitle>
                <CardDescription>Translate military skills to civilian jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Translate Skills</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Training Programs</CardTitle>
                <CardDescription>Access certification and training</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Programs</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Entrepreneurship</CardTitle>
                <CardDescription>Start your own business</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Learn More</Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Featured Resources</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <a
                    href="https://www.dol.gov/veterans/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Department of Labor - Veterans' Employment
                  </a>
                  <p className="text-sm text-muted-foreground">Federal resources for veteran employment</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <a
                    href="https://www.va.gov/careers-employment/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    VA Careers & Employment
                  </a>
                  <p className="text-sm text-muted-foreground">VA career services and support</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <a
                    href="https://www.hiringourheroes.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Hiring Our Heroes
                  </a>
                  <p className="text-sm text-muted-foreground">Connecting military members with careers</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
