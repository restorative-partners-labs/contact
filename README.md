# Message Sender (Next.js + Resend)

A secure, privacy-focused contact form system that allows users to send messages to staff members without exposing their email addresses in URLs.

## Features

- **Privacy First**: Staff emails are never exposed in URLs or client-side code
- **Hashed IDs**: Each staff member gets a unique, URL-safe hashed identifier
- **Dual Routing**: Support for both path-based (`/form/[id]`) and query-based (`/form?sid=[id]`) URLs
- **Security**: Rate limiting, input validation, HTML sanitization
- **Email Integration**: Powered by Resend for reliable email delivery
- **Modern UI**: Clean, responsive form with real-time validation

## Quick Start

### 1. Environment Setup

Create `.env.local` with your Resend configuration:

```bash
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM=noreply@yourdomain.com
HASH_SECRET=your_secret_key_here
```

**Important**: 
- `RESEND_FROM` must be a verified sender/domain in Resend
- `HASH_SECRET` should be a strong, unique secret (change from default)

### 2. Add Staff Members

Create a JSON file (e.g., `staff-source.json`) with your staff:

```json
[
  { "firstName": "Gus", "email": "gus@yourdomain.com" },
  { "firstName": "Kathy", "email": "kathy@yourdomain.com" }
]
```

Generate the staff map:

```bash
npm run generate-staff staff-source.json
```

This creates `src/data/staff.ts` with hashed IDs mapping to emails.

### 3. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000/form` to see the form.

## URL Structure

### Path-based Routing
- `/form/[hashed-id]` - Direct access to a specific staff member's form
- Example: `/form/f90c7debd89d693a`

### Query-based Routing  
- `/form?sid=[hashed-id]` - Form with staff ID as query parameter
- Example: `/form?sid=f90c7debd89d693a`

## How It Works

### 1. Staff ID Generation
- First names are normalized (trimmed, lowercased, letters only)
- HMAC-SHA256 hash is generated using `HASH_SECRET`
- First 16 bytes are used as the URL-safe identifier

### 2. Form Submission
- Form data is validated using Zod schemas
- Staff ID is looked up in the server-side staff map
- Email is sent via Resend with proper sanitization
- Reply-to is set to the sender's email for easy responses

### 3. Security Features
- Rate limiting (5 requests/minute per IP+staffId)
- Input validation and sanitization
- No staff emails exposed in logs or client code
- CORS protection

## API Endpoints

### POST `/api/send`
Sends the contact form email.

**Request Body:**
```json
{
  "staffId": "f90c7debd89d693a",
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "Hello, I have a question..."
}
```

**Response:**
```json
{
  "ok": true
}
```

## File Structure

```
src/
├── app/
│   ├── form/
│   │   ├── [id]/          # Dynamic routing
│   │   │   └── page.tsx   # Form page with ID from URL
│   │   └── page.tsx       # Form page with query param
│   ├── api/
│   │   └── send/
│   │       └── route.ts   # Email sending API
│   ├── contact/
│   │   └── page.tsx       # Redirects to /form
│   └── page.tsx           # Redirects to /form
├── components/
│   └── ContactForm.tsx    # Reusable form component
├── data/
│   └── staff.ts           # Generated staff mapping
└── lib/
    └── id.ts              # ID generation utilities

scripts/
└── generate-staff-map.js  # Staff map generator

staff-source.json           # Staff input data
```

## WordPress Integration

For WordPress buttons, use either format:

```html
<!-- Path-based -->
<a href="https://yoursite.com/form/f90c7debd89d693a">Contact Gus</a>

<!-- Query-based -->
<a href="https://yoursite.com/form?sid=f90c7debd89d693a">Contact Gus</a>
```

## Customization

### Styling
The form uses Tailwind CSS classes. Modify `ContactForm.tsx` to change the appearance.

### Email Templates
Edit the `renderHtml()` and `renderText()` functions in `src/app/api/send/route.ts` to customize email content.

### Validation Rules
Modify the Zod schema in `ContactForm.tsx` to adjust field requirements and limits.

## Production Deployment

### 1. Build
```bash
npm run build
```

### 2. Environment Variables
Ensure all environment variables are set in your production environment.

### 3. Domain Verification
Verify your domain in Resend and ensure `RESEND_FROM` matches.

### 4. Rate Limiting
The current implementation has simplified rate limiting. Consider implementing Redis-based rate limiting for production.

## Troubleshooting

### Common Issues

1. **"Email service not configured"**
   - Check `RESEND_API_KEY` in your environment variables

2. **"Invalid staff ID"**
   - Regenerate the staff map using `npm run generate-staff`
   - Ensure the staff ID in the URL matches the generated map

3. **Rate limiting errors**
   - Check if you're hitting the rate limit (5 requests/minute per IP+staffId)

### Debug Mode
Check the browser console and server logs for detailed error messages.

## Security Considerations

- **HASH_SECRET**: Use a strong, unique secret and keep it secure
- **Rate Limiting**: Implement proper rate limiting for production
- **Input Sanitization**: All user inputs are sanitized before email rendering
- **Logging**: Only hashed IDs are logged, never real emails

## License

This project is licensed under the MIT License.
