import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, FileText, Award, BriefcaseBusiness, Dumbbell, DollarSign } from "lucide-react"

const features = [
  {
    icon: Award,
    title: "Benefits & Discounts",
    description: "Access exclusive military discounts and benefits programs from trusted partners.",
    path: "/discounts-benefits/retail-discounts",
  },
  {
    icon: FileText,
    title: "Pre-Deployment Checklist",
    description: "Stay organized with comprehensive checklists tailored to your branch and deployment type.",
    path: "/transitions/deployment",
  },
  {
    icon: Dumbbell,
    title: "Enlistment",
    description: "Access everything you need before you enlist as you prepare to start your career.",
    path: "/transitions/enlistment",
  },
  {
    icon: DollarSign,
    title: "Financial Management",
    description: "Automate your finances by analyzing and controlling monthly expenditures.",
    path: "/services/financial/manage-finances",
  },
  {
    icon: BriefcaseBusiness,
    title: "Transitioning to Civilian Life",
    description: "Find job opportunities perfect for your experience as well as resources for veterans.",
    path: "/transitions/leaving-the-military",
  },
    {
    icon: Calendar,
    title: "Appointment Scheduler",
    description: "Schedule medical appointments, training sessions, and administrative tasks in one place.",
    path: "/scheduler/appointments",
  },
  {
    icon: FileText,
    title: "Tasks",
    description: "Create and manage your personal and professional tasks with ease.",
    path: "/scheduler/tasks",
  },
  {
    icon: Calendar,
    title: "Calendar",
    description: "Personalize your schedule and manage all your events in one place.",
    path: "/scheduler/calendar",
  },
]

export function Features() {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Everything You Need to Manage your Personal Logistics
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Comprehensive tools and resources designed specifically for military service members so you can focus on what mattes most
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <a
                key={index}
                href={feature.path}
              >
                <Card
                  key={index}
                  className="border-border hover:border-navy-400 transition-colors bg-white shadow-sm hover:shadow-md cursor-pointer"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-navy-100 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-navy-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
