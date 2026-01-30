"use client"

import { Phone, AlertTriangle, Heart, Shield, Users, FileText } from "lucide-react"
import { useContacts } from "@/hooks/use-contacts"

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
  const { getEmergencyContacts, getPoaHolders, isLoaded } = useContacts()
  
  const emergencyContactsList = isLoaded ? getEmergencyContacts() : []
  const poaHolders = isLoaded ? getPoaHolders() : []

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

        {/* Your Personal Quick Reference Card */}
        {isLoaded && (emergencyContactsList.length > 0 || poaHolders.length > 0) && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Your Quick Reference Card</h3>
                <p className="text-sm text-muted-foreground">
                  Your designated emergency contacts for quick access
                </p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {emergencyContactsList.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <h4 className="text-sm font-semibold text-red-600">Primary Emergency Contact</h4>
                  </div>
                  <p className="font-bold text-foreground text-lg">{emergencyContactsList[0].contactName}</p>
                  {emergencyContactsList[0].relationship && (
                    <p className="text-sm text-muted-foreground">{emergencyContactsList[0].relationship}</p>
                  )}
                  {emergencyContactsList[0].phonePrimary && (
                    <a
                      href={`tel:${emergencyContactsList[0].phonePrimary.replace(/[^0-9]/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium mt-2 hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {emergencyContactsList[0].phonePrimary}
                    </a>
                  )}
                </div>
              )}
              
              {poaHolders.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-sm font-semibold text-indigo-600">Power of Attorney</h4>
                  </div>
                  <p className="font-bold text-foreground text-lg">{poaHolders[0].contactName}</p>
                  {poaHolders[0].relationship && (
                    <p className="text-sm text-muted-foreground">{poaHolders[0].relationship}</p>
                  )}
                  {poaHolders[0].phonePrimary && (
                    <a
                      href={`tel:${poaHolders[0].phonePrimary.replace(/[^0-9]/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium mt-2 hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {poaHolders[0].phonePrimary}
                    </a>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
              <p className="text-xs text-muted-foreground text-center">
                Manage all contacts in your{" "}
                <a href="/services/command-center/contacts" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Emergency Contact Network
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Official Emergency Resources */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyContacts.map((contact) => {
            const IconComponent = contact.icon
            return (
              <div
                key={contact.name}
                className="bg-background border border-border rounded-lg p-5 hover:border-accent/50 transition-colors"
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