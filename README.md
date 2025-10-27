# Salon Booking System

A modern online booking system for salons, spas, and barber shops built with Next.js, Tailwind CSS, and Supabase.

## Features

- 24/7 online appointment booking
- Real-time availability updates
- Automated email notifications
- Salon owner dashboard with calendar view
- Service management
- Admin approval system
- Mobile-responsive design

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Email**: Resend (to be configured)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))
- npm or yarn package manager

### Installation

1. **Clone and install dependencies**

```bash
npm install
```

2. **Set up Supabase**

Create a new project at [supabase.com](https://supabase.com), then:

```bash
# Link your Supabase project (optional, for local development)
npx supabase link --project-ref your-project-ref

# Or push the schema directly to your hosted project
npx supabase db push
```

3. **Configure environment variables**

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Get your Supabase credentials from: `https://app.supabase.com/project/_/settings/api`

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/
│   ├── (public)/[slug]/    # Public salon booking pages
│   ├── (auth)/             # Authentication pages
│   ├── dashboard/          # Salon owner dashboard
│   ├── admin/              # Platform admin
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── booking/            # Booking flow components
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── supabase/           # Supabase client setup
│   ├── email/              # Email templates
│   └── utils/              # Utility functions
├── types/                  # TypeScript type definitions
└── supabase/
    └── migrations/         # Database migrations
```

## Database

The database schema includes:
- `salons` - Salon information and settings
- `services` - Services offered by each salon
- `appointments` - Booking records
- `staff` - Staff members (optional for MVP)
- `availability_blocks` - Time blocks marked unavailable
- `activity_logs` - Audit logs

Row Level Security (RLS) is enabled to ensure data isolation between salons.

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database (Supabase)
npx supabase migration new [name]  # Create new migration
npx supabase db push              # Push schema to Supabase
npx supabase db reset             # Reset local database

# Linting
npm run lint             # Run ESLint
```

## Environment Variables

Required environment variables (see `.env.local.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `RESEND_API_KEY` - Resend API key for emails (optional for now)
- `NEXT_PUBLIC_APP_URL` - Application URL

## Next Steps

See `project.md` for detailed feature specifications and implementation plan.

Key features to implement:
1. Salon registration and onboarding
2. Service management CRUD
3. Public booking flow with availability calculation
4. Owner dashboard with calendar
5. Email notifications
6. Admin approval system

## Documentation

- [Project Specifications](./project.md) - Detailed project requirements
- [Claude Code Guide](./CLAUDE.md) - Guide for AI-assisted development

## License

Private project - all rights reserved.
