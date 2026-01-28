import { Phone, AlertTriangle, Heart, Shield, Users } from "lucide-react"

const emergencyContacts = [
  {
    name: "Military OneSource",
    phone: "1-800-342-9647",
    description: "24/7 confidential support for military members and families",
    icon: Shield,
  },
  {
    name: "Veterans Crisis Line",
    phone: "988 (Press 1)",
    description: "Free, confidential support for Veterans in crisis",
    icon: AlertTriangle,
  },
  {
    name: "American Red Cross",
    phone: "1-877-272-7337",
    description: "Emergency communication and family support services",
    icon: Heart,
  },
  {
    name: "Army Emergency Relief",
    phone: "1-866-878-6378",
    description: "Financial assistance for Army service members",
    icon: Users,
  },
  {
    name: "Navy-Marine Corps Relief",
    phone: "1-800-654-8364",
    description: "Emergency financial assistance and education",
    icon: Users,
  },
  {
    name: "Air Force Aid Society",
    phone: "1-703-972-2650",
    description: "Emergency assistance for Air Force families",
    icon: Users,
  },
]

export function EmergencyContacts() {
  return (
    <section id="emergency" className="py-16 bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Emergency Contacts
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Keep these numbers handy. Help is always available, 24/7.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyContacts.map((contact) => {
            const IconComponent = contact.icon
            return (
              <div
                key={contact.name}
                className="bg-background border border-border rounded-lg p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{contact.name}</h3>
                    <a
                      href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-accent font-medium mt-1 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {contact.phone}
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      {contact.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
