"use client"

import { SectionLayout } from "@/components/section-layout"
import { Checklist, type ChecklistCategory } from "@/components/checklist"

const deploymentChecklistData: ChecklistCategory[] = [
  {
    id: "90-days",
    title: "90 Days Before Deployment",
    description: "Initial planning and preparation phase",
    items: [
      {
        id: "notify-family",
        text: "Notify family members of deployment",
        description: "Have honest conversations about timeline and expectations"
      },
      {
        id: "family-care-plan",
        text: "Begin Family Care Plan (DD Form 1561)",
        description: "Required if you have dependents - identify caregivers"
      },
      {
        id: "review-sgli",
        text: "Review SGLI coverage and beneficiaries",
        description: "Ensure coverage is adequate and beneficiaries are current"
      },
      {
        id: "schedule-legal",
        text: "Schedule appointment with JAG/Legal Assistance",
        description: "For will, POA, and other legal documents"
      },
      {
        id: "dental-exam",
        text: "Complete dental examination",
        description: "Must be Class 1 or 2 dental readiness"
      },
      {
        id: "medical-readiness",
        text: "Verify medical readiness",
        description: "Immunizations, prescriptions, and health assessments"
      },
      {
        id: "financial-review",
        text: "Review financial situation",
        description: "Debts, savings, and deployment pay increases"
      },
      {
        id: "research-sdp",
        text: "Research Savings Deposit Program (SDP)",
        description: "10% interest rate available during deployment"
      }
    ]
  },
  {
    id: "60-days",
    title: "60 Days Before Deployment",
    description: "Documentation and legal preparation",
    items: [
      {
        id: "complete-will",
        text: "Complete will or update existing will",
        description: "Free service through JAG office"
      },
      {
        id: "execute-poa",
        text: "Execute Power of Attorney documents",
        description: "General and/or Special POA as needed"
      },
      {
        id: "living-will",
        text: "Complete living will/healthcare directive",
        description: "Specify healthcare wishes if incapacitated"
      },
      {
        id: "finalize-family-care",
        text: "Finalize Family Care Plan",
        description: "Get commander approval and file with S-1/Admin"
      },
      {
        id: "setup-allotments",
        text: "Set up allotments for bills and savings",
        description: "Automate payments to ensure bills are paid"
      },
      {
        id: "update-dd93",
        text: "Update DD Form 93 (Record of Emergency Data)",
        description: "Verify emergency contacts and beneficiaries"
      },
      {
        id: "vehicle-decisions",
        text: "Make decisions about vehicles",
        description: "Storage, spouse use, or sell - update registration/insurance"
      },
      {
        id: "brief-spouse",
        text: "Brief spouse on all financial accounts",
        description: "Passwords, account numbers, and contact information"
      }
    ]
  },
  {
    id: "30-days",
    title: "30 Days Before Deployment",
    description: "Final preparations and family readiness",
    items: [
      {
        id: "verify-documents",
        text: "Verify all legal documents are filed",
        description: "Will, POA, SGLI, DD93 all complete and on record"
      },
      {
        id: "test-allotments",
        text: "Verify allotments are working",
        description: "Check that automatic payments are processing"
      },
      {
        id: "communication-plan",
        text: "Establish communication plan with family",
        description: "Expected frequency, methods, and time zone differences"
      },
      {
        id: "frg-connection",
        text: "Connect family with FRG/unit support",
        description: "Ensure spouse has contact information and resources"
      },
      {
        id: "childcare-backup",
        text: "Confirm childcare backup plans",
        description: "Short-term and long-term caregiver arrangements"
      },
      {
        id: "school-notification",
        text: "Notify children's schools of deployment",
        description: "Schools often have support programs for military kids"
      },
      {
        id: "pet-arrangements",
        text: "Finalize pet care arrangements",
        description: "Veterinary records and caregiver instructions"
      },
      {
        id: "home-maintenance",
        text: "Complete home maintenance tasks",
        description: "Repairs, seasonal prep, and emergency contacts for spouse"
      }
    ]
  },
  {
    id: "14-days",
    title: "14 Days Before Deployment",
    description: "Final tasks and goodbyes",
    items: [
      {
        id: "pack-personal",
        text: "Begin packing personal items",
        description: "Follow unit packing list and weight limits"
      },
      {
        id: "important-docs-copy",
        text: "Create copies of important documents",
        description: "Leave copies with spouse and trusted family member"
      },
      {
        id: "pre-deployment-brief",
        text: "Attend pre-deployment briefs",
        description: "Unit requirements and family readiness briefings"
      },
      {
        id: "mail-forwarding",
        text: "Set up mail management",
        description: "Forward to spouse or set up scanning service"
      },
      {
        id: "social-media-prep",
        text: "Review social media and OPSEC",
        description: "Adjust privacy settings and brief family on OPSEC"
      },
      {
        id: "quality-time",
        text: "Plan quality time with family",
        description: "Create positive memories before departure"
      },
      {
        id: "contact-list",
        text: "Create emergency contact list for family",
        description: "Unit contacts, neighbors, family members, and services"
      }
    ]
  },
  {
    id: "final-week",
    title: "Final Week",
    description: "Last-minute items and departure",
    items: [
      {
        id: "final-packing",
        text: "Complete final packing",
        description: "Verify all required items per unit packing list"
      },
      {
        id: "sdp-enrollment",
        text: "Enroll in Savings Deposit Program",
        description: "Can contribute up to $10,000 at 10% interest"
      },
      {
        id: "goodbye-letters",
        text: "Write letters for family (optional)",
        description: "Birthday cards, anniversary notes, or just-because letters"
      },
      {
        id: "final-briefings",
        text: "Complete all required briefings",
        description: "Threat awareness, ROE, and operational briefings"
      },
      {
        id: "equipment-check",
        text: "Complete equipment and gear checks",
        description: "Verify all issued equipment is serviceable"
      },
      {
        id: "goodbye-family",
        text: "Say goodbyes to family",
        description: "Allow time for proper farewells"
      },
      {
        id: "deploy",
        text: "Report for deployment",
        description: "On time, with all required items and documents"
      }
    ]
  },
  {
    id: "during-deployment",
    title: "During Deployment",
    description: "Ongoing tasks while deployed",
    items: [
      {
        id: "regular-communication",
        text: "Maintain regular communication with family",
        description: "Stick to your communication plan when possible"
      },
      {
        id: "monitor-finances",
        text: "Monitor finances remotely",
        description: "Check accounts regularly and address any issues"
      },
      {
        id: "sdp-contributions",
        text: "Continue SDP contributions",
        description: "Maximize the 10% interest benefit"
      },
      {
        id: "check-family-welfare",
        text: "Check on family welfare",
        description: "Ensure spouse and children are doing okay"
      },
      {
        id: "document-experiences",
        text: "Document experiences (within OPSEC)",
        description: "Photos and journal entries for personal records"
      },
      {
        id: "plan-reintegration",
        text: "Begin planning for reintegration",
        description: "Think about transition back to home life"
      }
    ]
  }
]

export default function DeploymentChecklistPage() {
  return (
    <SectionLayout
      title="Deployment Checklist"
      description="A comprehensive timeline-based checklist to prepare for deployment"
      backLink="/deployment"
      backLabel="Deployment"
    >
      <Checklist 
        categories={deploymentChecklistData}
        storageKey="deployment-checklist"
      />
    </SectionLayout>
  )
}
