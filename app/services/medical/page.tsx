import { Header } from "@/components/header"
import { Stethoscope, Heart, Brain, Pill, Activity, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MedicalPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Medical Services</h1>
            <p className="text-lg text-muted-foreground">Healthcare resources and support for military families</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Stethoscope className="h-8 w-8 text-primary mb-2" />
                <CardTitle>TRICARE</CardTitle>
                <CardDescription>Military health insurance information</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Learn More</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-8 w-8 text-primary mb-2" />
                <CardTitle>VA Healthcare</CardTitle>
                <CardDescription>Veterans health benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Enroll Now</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Mental Health</CardTitle>
                <CardDescription>Counseling and support services</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Get Support</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Pill className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Pharmacy</CardTitle>
                <CardDescription>Prescriptions and medications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Refill Prescription</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Activity className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Wellness Programs</CardTitle>
                <CardDescription>Fitness and preventive care</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Programs</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Phone className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Crisis Support</CardTitle>
                <CardDescription>24/7 hotline and emergency care</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Get Help Now</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
