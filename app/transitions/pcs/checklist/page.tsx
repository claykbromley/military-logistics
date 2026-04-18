"use client"

import { SectionLayout } from "@/components/section-layout"
import { Checklist, type ChecklistCategory } from "@/components/checklist"

const pcsChecklistData: ChecklistCategory[] = [
  {
    id: "90-days",
    title: "90 Days Before PCS",
    description: "Initial planning and preparation phase",
    items: [
      {
        id: "orders-received",
        text: "Receive and review official PCS orders",
        description: "Verify all details are correct including reporting date and duty station"
      },
      {
        id: "contact-tmo",
        text: "Contact Transportation Management Office (TMO)",
        description: "Schedule counseling appointment to discuss move options (HHG, PPM, or combination)"
      },
      {
        id: "research-destination",
        text: "Research new duty station and surrounding area",
        description: "Look into housing, schools, cost of living, and base amenities"
      },
      {
        id: "start-declutter",
        text: "Begin decluttering and inventorying belongings",
        description: "Sell, donate, or dispose of items you won't be moving"
      },
      {
        id: "housing-decision",
        text: "Decide on housing at new location",
        description: "On-base housing, off-base rental, or purchasing a home"
      },
      {
        id: "school-research",
        text: "Research schools if you have children",
        description: "Look into school ratings, enrollment requirements, and registration deadlines"
      },
      {
        id: "pet-arrangements",
        text: "Make arrangements for pets if applicable",
        description: "Research pet policies, required vaccinations, and quarantine requirements"
      },
      {
        id: "spouse-employment",
        text: "Research spouse employment opportunities",
        description: "Look into job market, military spouse preference programs, and remote work options"
      }
    ]
  },
  {
    id: "60-days",
    title: "60 Days Before PCS",
    description: "Scheduling and documentation phase",
    items: [
      {
        id: "schedule-movers",
        text: "Schedule moving company through TMO",
        description: "Book pack-out and pick-up dates; get it in writing"
      },
      {
        id: "book-travel",
        text: "Book travel arrangements",
        description: "Flights, rental cars, or plan driving route with lodging stops"
      },
      {
        id: "medical-dental",
        text: "Schedule medical and dental appointments",
        description: "Get copies of records, complete any ongoing treatment, and refill prescriptions"
      },
      {
        id: "school-records",
        text: "Request children's school records",
        description: "Transcripts, immunization records, and IEP/504 plans if applicable"
      },
      {
        id: "notify-housing",
        text: "Notify current housing office",
        description: "Submit move-out notice and schedule pre-inspection"
      },
      {
        id: "vehicle-maintenance",
        text: "Complete vehicle maintenance",
        description: "Oil change, tire check, and any needed repairs before a long drive"
      },
      {
        id: "important-documents",
        text: "Gather important documents",
        description: "Birth certificates, marriage license, POA, wills, passports, social security cards"
      },
      {
        id: "notify-creditors",
        text: "Notify creditors and update accounts",
        description: "Banks, credit cards, insurance, and recurring bills"
      }
    ]
  },
  {
    id: "30-days",
    title: "30 Days Before PCS",
    description: "Final preparations and confirmations",
    items: [
      {
        id: "confirm-movers",
        text: "Confirm moving dates with TMO/movers",
        description: "Call to verify pack-out date, time, and what to expect"
      },
      {
        id: "housing-inspection",
        text: "Complete pre-move housing inspection",
        description: "Document condition and address any issues before final inspection"
      },
      {
        id: "utilities-notice",
        text: "Provide 30-day notice to utilities",
        description: "Electric, gas, water, internet, cable, and trash services"
      },
      {
        id: "forwarding-address",
        text: "Set up mail forwarding with USPS",
        description: "Update address with important contacts and subscriptions"
      },
      {
        id: "empty-weight",
        text: "Get empty weight ticket (for PPM)",
        description: "Weigh your vehicle empty before loading any household goods"
      },
      {
        id: "packing-supplies",
        text: "Acquire packing supplies for essentials box",
        description: "Items you'll need immediately upon arrival at new location"
      },
      {
        id: "cancel-services",
        text: "Cancel local memberships and services",
        description: "Gym, clubs, newspapers, lawn care, etc."
      },
      {
        id: "clear-post",
        text: "Begin clearing the post",
        description: "Return library books, clear CIF, finance, and any outstanding obligations"
      }
    ]
  },
  {
    id: "14-days",
    title: "14 Days Before PCS",
    description: "Pack-out preparation",
    items: [
      {
        id: "deep-clean",
        text: "Begin deep cleaning current residence",
        description: "Clean behind appliances, inside closets, and all fixtures"
      },
      {
        id: "separate-pcs-items",
        text: "Separate items not being moved",
        description: "Clearly mark or move items that movers should not pack"
      },
      {
        id: "valuables-list",
        text: "Create high-value inventory list",
        description: "Document electronics, jewelry, and items over $100 with photos"
      },
      {
        id: "defrost-fridge",
        text: "Plan to defrost freezer/refrigerator",
        description: "Use up frozen food and plan to defrost 24-48 hours before move"
      },
      {
        id: "confirm-lodging",
        text: "Confirm en-route lodging reservations",
        description: "Double-check hotel bookings and pet policies if applicable"
      },
      {
        id: "dts-authorization",
        text: "Complete DTS travel authorization",
        description: "Ensure travel orders are approved and per diem is authorized"
      },
      {
        id: "vehicle-registration",
        text: "Gather vehicle documentation",
        description: "Registration, insurance cards, and any required inspections"
      }
    ]
  },
  {
    id: "pack-week",
    title: "Pack-Out Week",
    description: "Moving day and departure",
    items: [
      {
        id: "be-present",
        text: "Be present during entire pack-out",
        description: "Supervise packing, ask questions, and document any concerns"
      },
      {
        id: "check-boxes",
        text: "Check all boxes are numbered and labeled",
        description: "Verify room labels and that inventory sheets are accurate"
      },
      {
        id: "do-not-pack",
        text: "Ensure 'Do Not Pack' items are secure",
        description: "Keep important documents, medications, and essentials separate"
      },
      {
        id: "inventory-sheet",
        text: "Review and sign inventory sheets carefully",
        description: "Note any pre-existing damage; don't sign until satisfied"
      },
      {
        id: "final-walkthrough",
        text: "Complete final walkthrough of residence",
        description: "Check all rooms, closets, attic, garage, and yard"
      },
      {
        id: "keys-return",
        text: "Return keys and complete checkout",
        description: "Get signed documentation of key return and final inspection"
      },
      {
        id: "full-weight",
        text: "Get full weight ticket (for PPM)",
        description: "Weigh your loaded vehicle and keep the ticket safe"
      },
      {
        id: "copy-of-orders",
        text: "Keep copy of orders accessible",
        description: "You may need to show orders at hotels, for discounts, or at new location"
      }
    ]
  },
  {
    id: "arrival",
    title: "Upon Arrival",
    description: "Getting settled at new duty station",
    items: [
      {
        id: "check-in-unit",
        text: "Check in with new unit/command",
        description: "Report to your new duty station and complete in-processing"
      },
      {
        id: "check-in-housing",
        text: "Check in to housing",
        description: "Complete housing inspection and document any existing damage"
      },
      {
        id: "utilities-setup",
        text: "Set up utilities at new residence",
        description: "Electric, gas, water, internet, and other services"
      },
      {
        id: "deers-update",
        text: "Update DEERS with new address",
        description: "Visit ID card office to update all family members"
      },
      {
        id: "vehicle-registration-new",
        text: "Register vehicle in new state if required",
        description: "Check state requirements and military exemptions"
      },
      {
        id: "drivers-license",
        text: "Update driver's license if required",
        description: "Some states have exemptions for active duty military"
      },
      {
        id: "school-enrollment",
        text: "Enroll children in school",
        description: "Bring records and proof of residency"
      },
      {
        id: "delivery-coordination",
        text: "Coordinate HHG delivery date",
        description: "Contact TMO to schedule delivery when ready"
      },
      {
        id: "inspect-delivery",
        text: "Inspect items during delivery",
        description: "Check for damage and note discrepancies on inventory"
      },
      {
        id: "file-claims",
        text: "File claims for any damaged items",
        description: "Document damage with photos and file within timeline (usually 75 days)"
      },
      {
        id: "submit-voucher",
        text: "Submit travel voucher in DTS",
        description: "Include all receipts and weight tickets for reimbursement"
      }
    ]
  }
]

export default function PCSChecklistPage() {
  return (
    <SectionLayout
      title="PCS Checklist"
      description="A comprehensive timeline-based checklist to ensure a smooth PCS move from start to finish"
      backLink="/pcs"
      backLabel="PCS"
    >
      <Checklist 
        categories={pcsChecklistData}
        storageKey="pcs-checklist"
      />
    </SectionLayout>
  )
}
