"use server"

import { z } from "zod"
import { Resend } from "resend"

const schema = z.object({ email: z.string().email() })

const welcomeEmailHtml = `
<div style="background:#03065c;padding:40px 24px;font-family:sans-serif;color:#f5f5f5;max-width:480px;margin:0 auto;border-radius:12px">
  <p style="font-size:24px;font-weight:700;margin:0 0 16px">Welcome to 4Herfrika</p>
  <p style="color:#ccc;line-height:1.6;margin:0 0 24px">
    Thank you for subscribing. You're now part of a community built to celebrate and uplift African women.
    We'll be in touch with stories, projects, and updates worth your attention.
  </p>
  <p style="color:#ccc;line-height:1.6;margin:0">
    With love,<br/>
    <strong style="color:#ec008c">The 4Herfrika team</strong>
  </p>
</div>
`

export async function subscribeAction(formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get("email") })
  if (!parsed.success) return { error: "Invalid email address" }

  const { email } = parsed.data

  // Save to Google Sheet via Apps Script webhook
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL
  if (webhookUrl) {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()
    if (json.duplicate) {
      console.log(`[subscribe] duplicate email skipped: ${email}`)
      return { success: true }
    }
    console.log(`[subscribe] email saved to sheet: ${email}`)
  }

  // Send welcome email via Resend
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: "4herfrika <hello@4herfrika.org>",
    to: email,
    subject: "Welcome to 4herfrika Newsletter",
    html: welcomeEmailHtml,
  })
  console.log(`[subscribe] welcome email sent: ${email}`)

  return { success: true }
}
