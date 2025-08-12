import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { STAFF_BY_ID } from '@/data/staff';

// Validation schema
const sendSchema = z.object({
  staffId: z.string().min(8).max(128),
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

// Sanitize HTML content
function sanitizeHtml(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Render HTML email
function renderHtml(payload: z.infer<typeof sendSchema>): string {
  const sanitizedName = sanitizeHtml(payload.name);
  const sanitizedMessage = sanitizeHtml(payload.message);
  const subject = payload.subject ? sanitizeHtml(payload.subject) : `New message from ${sanitizedName}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${sanitizedName} (${payload.email})</p>
          ${payload.subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        </div>
        
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 20px; background: #f1f5f9; border-radius: 8px; font-size: 14px; color: #64748b;">
          <p><strong>Note:</strong> You can reply directly to this email to respond to ${sanitizedName}.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Render plain text email
function renderText(payload: z.infer<typeof sendSchema>): string {
  const subject = payload.subject || `New message from ${payload.name}`;
  
  return `
New Contact Form Submission

From: ${payload.name} (${payload.email})
${payload.subject ? `Subject: ${payload.subject}` : ''}

Message:
${payload.message}

---
Note: You can reply directly to this email to respond to ${payload.name}.
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const payload = sendSchema.parse(body);

    // Check if staff ID exists
    const staffMember = STAFF_BY_ID[payload.staffId];
    if (!staffMember) {
      return NextResponse.json(
        { ok: false, error: 'Invalid staff ID' },
        { status: 400 }
      );
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    if (!resend) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { ok: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Send email
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: staffMember.email,
      replyTo: payload.email,
      subject: payload.subject || `New message from ${payload.name}`,
      html: renderHtml(payload),
      text: renderText(payload),
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json(
        { ok: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log success (only hashed ID, never real emails)
    console.log(`Email sent successfully to staff ID: ${payload.staffId}`);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
