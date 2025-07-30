# Send Invitation Email Function

This Supabase Edge Function sends invitation emails when users are invited to collaborate on trips.

## Setup

1. Deploy this function to Supabase:
\`\`\`bash
supabase functions deploy send-invitation-email
\`\`\`

2. Set up environment variables in your Supabase project:
- `SUPABASE_URL` (automatically available)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically available)

## Usage

The function expects a POST request with the following body:
\`\`\`json
{
  "to": "user@example.com",
  "inviterName": "John Doe", 
  "tripName": "Summer Europe Trip",
  "invitationLink": "https://yourapp.com/invitations/123",
  "message": "Optional personal message"
}
\`\`\`

## Email Template

The email will use Supabase's built-in invitation template. You can customize this in your Supabase dashboard under Authentication > Email Templates.
