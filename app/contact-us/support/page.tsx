import { Header } from "@/components/header"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupportPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <MessageCircle className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Support</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Get help with your Millify account and services.</p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>We're here to help you 24/7</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <a href="mailto:support@millify.com" className="text-primary hover:underline">
                      support@millify.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Phone</p>
                    <a href="tel:1-800-MILLIFY" className="text-primary hover:underline">
                      1-800-MILLIFY
                    </a>
                  </div>
                  <Button className="w-full">Submit Support Ticket</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
