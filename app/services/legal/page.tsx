import { Header } from "@/components/header"
import { Scale, FileText, HomeIcon, Users, Shield, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LegalPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Legal Services</h1>
            <p className="text-lg text-muted-foreground">Legal assistance and resources for service members</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Scale className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Legal Assistance</CardTitle>
                <CardDescription>Free legal help for service members</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Find Attorney</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Estate Planning</CardTitle>
                <CardDescription>Wills, trusts, and powers of attorney</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Planning</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <HomeIcon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Housing Rights</CardTitle>
                <CardDescription>SCRA and tenant protections</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Learn Rights</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Family Law</CardTitle>
                <CardDescription>Divorce, custody, and support</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Get Help</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Consumer Protection</CardTitle>
                <CardDescription>Protect against fraud and scams</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Report Issue</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Legal Resources</CardTitle>
                <CardDescription>Guides and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Browse Resources</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
