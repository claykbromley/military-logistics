/**
 * PDF Export Library for Emergency Contacts
 * 
 * This module handles exporting emergency contact information to a PDF file
 */

import type { Contact } from "@/hooks/use-contacts"

export async function exportContactsToPDF(
  contacts: Contact[],
  userEmail: string
): Promise<void> {
  try {
    // Call the API endpoint that will generate the PDF
    const response = await fetch("/api/export-contacts-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contacts,
        userEmail,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`)
    }

    // Get the PDF blob
    const blob = await response.blob()

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0]
    link.download = `emergency-contacts-${timestamp}.pdf`
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log("PDF downloaded successfully")
  } catch (error) {
    console.error("Error exporting to PDF:", error)
    throw error
  }
}

/**
 * Alternative client-side PDF generation using jsPDF (fallback)
 * This doesn't require a server-side script but produces a simpler PDF
 */
export async function exportContactsToPDFClientSide(
  contacts: Contact[],
  userEmail: string
): Promise<void> {
  // Dynamic import to reduce bundle size
  const { jsPDF } = await import("jspdf")
  
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Helper to check if we need a new page
  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // Title
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("Emergency Contact Directory", pageWidth / 2, yPos, { align: "center" })
  yPos += 10

  // Subtitle
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  doc.text(`Generated for: ${userEmail} | ${dateStr}`, pageWidth / 2, yPos, {
    align: "center",
  })
  yPos += 15

  // Sort contacts by priority
  const sortedContacts = [...contacts].sort((a, b) => (a.priority || 0) - (b.priority || 0))

  // Helper to render a section
  const renderSection = (title: string, sectionContacts: Contact[]) => {
    if (sectionContacts.length === 0) return

    checkPageBreak(20)
    
    // Section heading
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(37, 99, 235) // Blue
    doc.text(title, margin, yPos)
    yPos += 10

    // Render each contact
    sectionContacts.forEach((contact, index) => {
      checkPageBreak(40)

      // Contact name
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      let nameText = contact.contactName
      if (contact.relationship) {
        nameText += ` (${contact.relationship})`
      }
      doc.text(nameText, margin, yPos)
      yPos += 7

      // Contact details
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(60, 60, 60)

      if (contact.phonePrimary) {
        let phoneText = `Phone: ${contact.phonePrimary}`
        if (contact.phoneSecondary) {
          phoneText += ` / ${contact.phoneSecondary}`
        }
        doc.text(phoneText, margin + 5, yPos)
        yPos += 5
      }

      if (contact.email) {
        doc.text(`Email: ${contact.email}`, margin + 5, yPos)
        yPos += 5
      }

      if (contact.address) {
        const addressLines = doc.splitTextToSize(
          `Address: ${contact.address}`,
          pageWidth - margin * 2 - 5
        )
        addressLines.forEach((line: string) => {
          doc.text(line, margin + 5, yPos)
          yPos += 5
        })
      }

      // Roles
      const roles = []
      if (contact.isEmergencyContact) roles.push("Emergency Contact")
      if (contact.isPoaHolder) roles.push("POA Holder")
      if (contact.canAccessAccounts) roles.push("Account Access")

      if (roles.length > 0) {
        doc.setFontSize(8)
        doc.setTextColor(37, 99, 235)
        doc.setFont("helvetica", "italic")
        doc.text(roles.join(" • "), margin + 5, yPos)
        yPos += 5
      }

      // Notes
      if (contact.notes) {
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.setFont("helvetica", "italic")
        const notesLines = doc.splitTextToSize(
          `Note: ${contact.notes}`,
          pageWidth - margin * 2 - 5
        )
        notesLines.forEach((line: string) => {
          checkPageBreak(5)
          doc.text(line, margin + 5, yPos)
          yPos += 4
        })
      }

      yPos += 8 // Space between contacts
    })

    yPos += 5 // Extra space between sections
  }

  // Render sections
  const emergencyContacts = sortedContacts.filter((c) => c.isEmergencyContact)
  const poaHolders = sortedContacts.filter((c) => c.isPoaHolder)
  const accountContacts = sortedContacts.filter((c) => c.canAccessAccounts)
  const otherContacts = sortedContacts.filter(
    (c) => !c.isEmergencyContact && !c.isPoaHolder && !c.canAccessAccounts
  )

  renderSection("🚨 Emergency Contacts", emergencyContacts)
  renderSection("🛡️ Power of Attorney Holders", poaHolders)
  renderSection("🔑 Financial Account Access", accountContacts)
  renderSection("📋 Other Contacts", otherContacts)

  // Footer
  const footerY = pageHeight - 15
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.setFont("helvetica", "normal")
  doc.text(
    "This document contains sensitive personal information. Keep it secure.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  )
  doc.text(
    "Generated by Emergency Contact Management System",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  )

  // Save the PDF
  const timestamp = new Date().toISOString().split("T")[0]
  doc.save(`emergency-contacts-${timestamp}.pdf`)
  
  console.log("PDF downloaded successfully (client-side)")
}