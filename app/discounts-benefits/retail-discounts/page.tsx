import { Header } from "@/components/header"
import { Tag } from "lucide-react"

export default function RetailDiscountsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Tag className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Retail Discounts</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Exclusive discounts for military members and veterans.</p>
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-muted-foreground">Discount listings coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
