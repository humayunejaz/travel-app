# Travel Collaboration App

A modern travel planning application built with Next.js, Supabase, and TypeScript. Plan trips, invite collaborators, and manage your travel adventures together.

## Features

- 🔐 **Authentication** - Sign up/in with email or Google OAuth
- ✈️ **Trip Management** - Create, edit, and delete trips
- 👥 **Collaboration** - Invite friends and colleagues to collaborate
- 📧 **Email Invitations** - Send real email invitations via EmailJS
- 🏢 **Agency Dashboard** - Special view for travel agencies
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS, shadcn/ui
- **Email**: EmailJS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- EmailJS account (optional, for email invitations)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/travel-app.git
   cd travel-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your Supabase and EmailJS credentials in `.env.local`

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL scripts in the `scripts/` folder in order:
     \`\`\`sql
     -- Run these in your Supabase SQL editor
     scripts/01-create-tables.sql
     scripts/02-create-functions.sql
     scripts/03-seed-data.sql
     \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open [http://localhost:3000](http://localhost:3000)**

## Environment Variables

Create a `.env.local` file with:

\`\`\`env
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - EmailJS (for email invitations)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
\`\`\`

## Database Schema

The app uses the following main tables:
- `users` - User profiles and authentication
- `trips` - Trip information and settings
- `trip_collaborators` - User-trip relationships
- `invitations` - Pending collaboration invitations

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables** in Vercel dashboard
4. **Deploy**

The app will be automatically deployed on every push to main branch.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or run into issues, please open an issue on GitHub.
