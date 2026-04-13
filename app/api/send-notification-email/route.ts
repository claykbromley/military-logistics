// This gets called by the Supabase database trigger (via webhook)
// whenever a new notification is inserted, OR you can call it
// directly from server-side code:
//
//   await fetch("/api/send-notification-email", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ notification_id, user_id, email, ... }),
//   })

import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

// ─── Config ──────────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || "clay.k.bromley@gmail.com"//"Milify <notifications@milify.com>"
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

// Service-role client for marking email_sent (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Styling Constants ───────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  low: "#6B7280",
  medium: "#2563EB",
  high: "#F59E0B",
  urgent: "#DC2626",
}

const TYPE_LABELS: Record<string, string> = {
  system: "System Update",
  appointment: "Appointment",
  benefit: "Benefits & Eligibility",
  community: "Community",
  transition: "Transition Update",
  discount: "Discount & Deal",
  reminder: "Reminder",
}

// ─── Email HTML Builder ──────────────────────────────────────────────────────

function buildEmailHtml(params: {
  title: string
  message: string
  type: string
  priority: string
  action_url?: string
  action_label?: string
}): string {
  const color = PRIORITY_COLORS[params.priority] || "#2563EB"
  const typeLabel = TYPE_LABELS[params.type] || params.type

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <tr>
      <td style="background:#1e293b;padding:24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Milify</span>
            </td>
            <td align="right">
              <span style="background:${color};color:#ffffff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;">
                ${typeLabel}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">
          ${params.title}
        </h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
          ${params.message}
        </p>
        ${
          params.action_url
            ? `<a href="${SITE_URL}${params.action_url}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
                ${params.action_label || "View Details"}
              </a>`
            : ""
        }
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
          You received this because of your notification preferences on Milify.<br>
          <a href="${SITE_URL}/settings" style="color:#6b7280;text-decoration:underline;">
            Manage preferences
          </a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Optional: verify the request comes from Supabase webhook
    // by checking an Authorization header or shared secret.
    // const authHeader = request.headers.get("authorization")
    // if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const {
      notification_id,
      user_id,
      email,
      type,
      priority,
      title,
      message,
      action_url,
      action_label,
    } = body

    // Validate required fields
    if (!email || !title || !notification_id) {
      return NextResponse.json(
        { error: "Missing required fields: email, title, notification_id" },
        { status: 400 }
      )
    }

    // Check API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "[send-notification-email] RESEND_API_KEY not set. Email not sent."
      )
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      )
    }

    // Build the email
    const html = buildEmailHtml({
      title,
      message,
      type,
      priority,
      action_url,
      action_label,
    })

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `[Milify] ${title}`,
      html,
    })

    if (error) {
      console.error("[send-notification-email] Resend error:", error)
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      )
    }

    // Mark email_sent = true in the notifications table
    const { error: updateError } = await supabaseAdmin
      .from("notifications")
      .update({ email_sent: true })
      .eq("id", notification_id)

    if (updateError) {
      console.warn(
        "[send-notification-email] Could not update email_sent flag:",
        updateError
      )
    }

    return NextResponse.json({
      success: true,
      email_id: data?.id,
    })
  } catch (err) {
    console.error("[send-notification-email] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}