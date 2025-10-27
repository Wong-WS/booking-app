# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern salon booking system built with Next.js, Supabase, and Tailwind CSS. The platform enables salons, spas, and barber shops to accept 24/7 online appointments while clients can book without phone calls.

**Current Status**: Project is in planning phase with comprehensive documentation in `project.md`. No code has been implemented yet.

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS / UI Shadcn
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Email**: Resend
- **Deployment**: Vercel

## Development Commands

```bash
# Project setup (when initialized)
npm install
npm run dev              # Start dev server

# Database (Supabase CLI)
npx supabase init        # Initialize Supabase
npx supabase db reset    # Reset database
npx supabase db push     # Push schema changes

# Testing (when implemented)
npm run test             # Unit tests
npm run test:e2e         # E2E tests

# Build & Deploy
npm run build            # Production build
npm run start            # Start production server
vercel --prod            # Deploy to Vercel
```

## High-Level Architecture

### Three User Types

1. **Salon Owners**: Manage services, view calendar, handle appointments
2. **Clients**: Browse services and book appointments (no account required)
3. **Admin**: Approve salons and manage platform

### Core Data Flow

```
Client Booking Flow:
1. Visit salon page at /[slug]
2. Select service → DateTimePicker queries availability API
3. Availability calculation: business hours - existing appointments - blocked slots
4. Submit booking → POST /api/appointments
5. Supabase Realtime updates owner's dashboard
6. Email confirmations sent via Resend

Owner Management Flow:
1. Auth via Supabase (email verification required)
2. Dashboard shows appointments filtered by salon_id (RLS enforced)
3. Calendar drag-and-drop updates appointment times
4. Real-time subscription to appointments table for live updates
```

### Database Architecture

**Key tables**: `salons`, `services`, `appointments`, `staff`, `availability_blocks`, `activity_logs`

**Critical relationships**:
- Appointments reference salon, service, and optionally staff
- All times stored in UTC, displayed in salon's timezone
- `cancellation_token` UUID enables email-link cancellations without auth

**Security**: Row Level Security (RLS) ensures salons only access their data. Clients use email-based actions without accounts.

### Planned Project Structure

```
app/
├── (public)/[slug]/          # Public salon booking pages
├── (auth)/                   # Login, register, verify
├── dashboard/                # Salon owner dashboard
│   ├── appointments/
│   ├── services/
│   ├── settings/
│   └── calendar/
├── admin/                    # Platform admin area
└── api/
    ├── appointments/         # CRUD for bookings
    ├── services/             # Service management
    └── webhooks/             # External integrations

components/
├── ui/                       # Shadcn components
├── booking/
│   ├── ServiceSelector.tsx
│   ├── DateTimePicker.tsx   # Core availability UI
│   └── BookingForm.tsx
└── dashboard/
    └── Calendar.tsx          # Drag-and-drop scheduling

lib/
├── supabase/                 # Client & server instances
├── email/templates/          # Resend email templates
└── utils/
    ├── dates.ts              # Timezone handling
    └── availability.ts       # Slot calculation logic
```

## Critical Implementation Details

### Availability Calculation
The core business logic is `getAvailableSlots()` which must:
1. Get business hours for the requested date
2. Generate all possible time slots based on service duration
3. Filter out existing appointments + buffer time
4. Filter out manually blocked slots
5. Handle timezone conversion (salon timezone → client timezone)

This logic is performance-critical and should be cached appropriately.

### Timezone Handling
- All database times: UTC
- Display times: Salon's configured timezone
- Client sees times: Auto-detected or salon's timezone
- Use `date-fns-tz` for conversions

### Real-time Updates
Supabase Realtime subscription on `appointments` table filtered by `salon_id`:
- Enables live dashboard updates when new bookings arrive
- Prevents double-booking during concurrent booking attempts
- Updates availability in real-time for clients browsing slots

### Email Strategy
Resend handles three key emails:
1. **Booking confirmation**: Immediate, includes cancellation token link
2. **Reminder**: 24 hours before (cron job needed)
3. **Owner notification**: New booking alert

Each email must include `cancellation_token` for self-service actions.

### Security Considerations
- **RLS policies**: Salon owners filtered by `auth.uid() = salon_id`
- **Public booking**: Anonymous users can POST to `/api/appointments`
- **Cancellation**: Token-based auth via `cancellation_token` UUID
- **Rate limiting**: Implement per-IP limits on booking endpoints
- **Input validation**: Sanitize all client inputs, especially dates/times

## Development Workflow

### Starting a New Feature
1. Check `project.md` for detailed specifications
2. Ensure database schema in `project.md` is implemented in Supabase
3. Create API route first, then UI components
4. Test with real Supabase data, not mocks
5. Verify RLS policies prevent unauthorized access

### Database Changes
1. Update schema in `project.md`
2. Create migration: `npx supabase migration new [name]`
3. Write SQL in migration file
4. Apply: `npx supabase db push`
5. Update TypeScript types

### Testing Key Flows
- **Booking**: Verify no double-bookings, timezone accuracy, email delivery
- **Calendar**: Test drag-and-drop doesn't create conflicts
- **Availability**: Edge cases (closed days, blocked slots, business hours boundaries)

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # Server-side only
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Important Context from project.md

- **Booking buffer**: Configurable gap between appointments (prevents back-to-back)
- **Cancellation policy**: Minimum hours notice (e.g., 24 hours)
- **Salon approval flow**: New salons start in "pending" status, admin approves
- **Slug uniqueness**: Each salon has unique URL slug (e.g., `/stylish-cuts`)
- **No payment in MVP**: Pricing shown but not collected
- **No client accounts**: Email-based actions only

## Common Pitfalls to Avoid

1. **Double-bookings**: Always check availability before confirming, use transactions
2. **Timezone bugs**: Never mix timezones in calculations, convert at display layer only
3. **RLS bypass**: Don't use service role key on client, would bypass security
4. **Email spam**: Configure SPF/DKIM records, use verified domain
5. **Calendar performance**: Lazy load, paginate appointments, avoid loading all appointments at once
