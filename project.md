# Salon Booking System - Project Documentation

## Project Overview

A modern online booking system for salons, spas, and barber shops that eliminates phone tag and enables 24/7 appointment scheduling. Built with Next.js, Tailwind CSS or UI Shadcn, and Supabase.

## Core Business Requirements

### Target Users

1. **Salon Owners**: Small to medium salons, spas, barber shops, individual stylists
2. **Clients**: People wanting to book appointments online without calling
3. **Admin**: Platform administrator for salon approval and support

### Key Problems Solved

- Eliminate back-and-forth phone calls for booking
- Reduce no-shows with automated reminders
- Give clients 24/7 booking capability
- Provide owners with organized calendar view
- Handle rescheduling/cancellations efficiently

## Tech Stack

| Component      | Technology                  | Justification                                      |
| -------------- | --------------------------- | -------------------------------------------------- |
| Frontend       | Next.js 14+ with App Router | Server components, built-in optimization, great DX |
| Styling        | Tailwind CSS/UI Shacn       | Rapid development, consistent design system        |
| Backend        | Supabase                    | Auth, database, real-time, and storage in one      |
| Database       | PostgreSQL (via Supabase)   | Relational data, ACID compliance                   |
| Authentication | Supabase Auth               | Email/password with magic links option             |
| File Storage   | Supabase Storage            | Salon photos, logos                                |
| Email          | Resend                      | Developer-friendly, reliable delivery              |
| Deployment     | Vercel                      | Seamless Next.js integration                       |
| Monitoring     | Vercel Analytics            | Built-in, no extra setup                           |

## Database Schema

```sql
-- Salons table
CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- for URL: bookings.app/salon-name
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  logo_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, suspended
  business_hours JSONB, -- {"mon": {"open": "09:00", "close": "17:00"}, ...}
  booking_buffer INTEGER DEFAULT 0, -- minutes between appointments
  cancellation_hours INTEGER DEFAULT 24, -- minimum hours notice for cancellation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff table (optional for MVP)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'stylist',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  category TEXT, -- 'hair', 'nails', 'spa', etc.
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  staff_id UUID REFERENCES staff(id), -- nullable for MVP
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, completed, no-show
  notes TEXT,
  cancellation_token UUID DEFAULT gen_random_uuid(), -- for email link cancellation
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability blocks (for owner to block time)
CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id), -- nullable if blocking for whole salon
  block_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT, -- 'lunch', 'day_off', 'holiday', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'booking_created', 'booking_cancelled', etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_appointments_salon_date ON appointments(salon_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_services_salon ON services(salon_id);
CREATE INDEX idx_salons_slug ON salons(slug);
```

## Feature Specifications

### 1. Business Owner Features

#### Salon Setup Flow

1. **Registration**

   - Email/password signup
   - Email verification required
   - Basic info: salon name, address, phone
   - Generate unique slug for booking URL

2. **Business Hours Configuration**

   - Set hours for each day of week
   - Option to mark days as closed
   - Set booking buffer time between appointments
   - Set cancellation policy (hours notice required)

3. **Services Management**

   - Add/edit/delete services
   - Organize by category
   - Set name, duration, price
   - Reorder for display priority
   - Toggle active/inactive

4. **Calendar View**

   - Week view (default) and day view
   - See all appointments with client info
   - Click to view appointment details
   - Drag to reschedule (with conflict checking)
   - Color coding by service category

5. **Quick Booking Blocks**
   - Click empty calendar slots to block
   - Set recurring blocks (e.g., lunch 12-1pm daily)
   - Holiday/vacation mode

#### Appointment Management

- View upcoming appointments list
- Mark as completed/no-show
- Add walk-in appointments manually
- See client contact info
- Add internal notes to appointments

#### Notifications

- Email notification for new bookings
- Daily summary email (optional)
- Cancellation alerts

### 2. Client Features

#### Booking Flow

1. **Service Selection**

   - Browse services by category
   - See duration and price
   - Search/filter services
   - View service descriptions

2. **Date/Time Selection**

   - Calendar showing next 30 days
   - See available time slots
   - Real-time availability updates
   - Show appointment duration (2:00 PM - 3:30 PM)
   - Timezone auto-detection

3. **Contact Information**

   - Name (required)
   - Email (required)
   - Phone (optional but recommended)
   - Notes field for special requests

4. **Booking Confirmation**
   - Review all details before confirming
   - Receive confirmation email immediately
   - Add to calendar buttons (.ics file)
   - Unique cancellation link in email

#### Self-Service Actions

- Cancel appointment via email link (respects cancellation policy)
- Reschedule via email link
- Add to personal calendar

### 3. Admin Features

#### Salon Management

- Approve/reject new salon registrations
- View all salons in system
- Suspend salons if needed
- View salon details and stats

#### Support Tools

- Global appointment search
- View activity logs
- See booking trends/analytics
- Handle support tickets

## User Interface Design

### Design Principles

- **Clean and Professional**: Minimal, trustworthy design
- **Mobile-First**: Optimized for phone booking
- **Accessible**: WCAG 2.1 AA compliant
- **Fast**: Optimized Core Web Vitals
- **Intuitive**: No learning curve required

### Client Booking Interface

#### Salon Landing Page

```
[Salon Logo] [Salon Name]
📍 Address | 📞 Phone | 🕒 Hours

[Book Appointment] <- Primary CTA

-- Services --
[Category Tabs: All | Hair | Nails | Spa]

[Service Card]
- Service Name
- Duration | Price
- Brief description
[Select →]
```

#### Date/Time Selection

```
Select Date:
[Calendar Widget - 30 days]

Available Times for [Selected Date]:
Morning:
[9:00 AM] [9:30 AM] [10:00 AM]

Afternoon:
[12:00 PM] [1:00 PM] [2:30 PM]

Evening:
[5:00 PM] [6:00 PM]

Selected: 2:00 PM - 3:30 PM (90 min)
```

#### Confirmation Page

```
✅ Booking Confirmed!

Details:
- Service: Haircut & Style
- Date: Tuesday, Oct 28, 2024
- Time: 2:00 PM - 3:30 PM
- Price: $65
- Location: [Salon Name & Address]

📧 Confirmation sent to: client@email.com

[Add to Calendar] [View Salon Page]
```

### Owner Dashboard

#### Main Dashboard

```
[Salon Name] Dashboard

Today: October 28, 2024
[4] Appointments | [$420] Expected

-- Today's Schedule --
9:00 AM - Jane Doe - Haircut ($45)
10:30 AM - John Smith - Color ($120)
2:00 PM - Mary Johnson - Cut & Style ($65)
4:00 PM - Bob Wilson - Beard Trim ($30)

[View Full Calendar] [Add Appointment]

-- Quick Stats --
This Week: 18 appointments
This Month: 76 appointments
Revenue MTD: $4,250
```

#### Calendar View

```
[← Week of Oct 28 - Nov 3 →]

     Mon 28 | Tue 29 | Wed 30 | Thu 31
9AM  [Jane]  | [Tim]  | ----   | [Amy]
10AM [John]  | ----   | [Sue]  | [Pat]
11AM  ----   | [Kim]  | [Joe]  | ----
...

[Legend: ■ Hair ■ Nails ■ Spa]
```

## Technical Implementation Details

### Project Structure

```
salon-booking/
├── app/
│   ├── (public)/
│   │   ├── [slug]/          # Salon public booking page
│   │   │   ├── page.tsx
│   │   │   └── book/
│   │   │       └── page.tsx
│   │   └── page.tsx         # Landing/search page
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── verify/
│   ├── dashboard/            # Salon owner area
│   │   ├── appointments/
│   │   ├── services/
│   │   ├── settings/
│   │   └── calendar/
│   ├── admin/               # Platform admin
│   │   ├── salons/
│   │   └── analytics/
│   └── api/
│       ├── appointments/
│       ├── services/
│       └── webhooks/
├── components/
│   ├── ui/                  # Shadcn/ui components
│   ├── booking/
│   │   ├── ServiceSelector.tsx
│   │   ├── DateTimePicker.tsx
│   │   └── BookingForm.tsx
│   └── dashboard/
│       ├── Calendar.tsx
│       └── AppointmentCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── email/
│   │   └── templates/
│   └── utils/
│       ├── dates.ts
│       └── availability.ts
└── types/
    └── index.ts
```

### Key Components

#### ServiceSelector Component

```typescript
interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description?: string;
}

const ServiceSelector = ({
  services,
  onSelect,
}: {
  services: Service[];
  onSelect: (service: Service) => void;
}) => {
  // Group by category
  // Display as cards
  // Handle selection
};
```

#### DateTimePicker Component

```typescript
const DateTimePicker = ({
  serviceId,
  duration,
  onSelect,
}: {
  serviceId: string;
  duration: number;
  onSelect: (datetime: Date) => void;
}) => {
  // Fetch available slots from API
  // Display calendar
  // Show time slots
  // Handle timezone conversion
};
```

#### Availability Calculation

```typescript
function getAvailableSlots(
  date: Date,
  serviceDuration: number,
  existingAppointments: Appointment[],
  businessHours: BusinessHours,
  blockedSlots: BlockedSlot[]
): TimeSlot[] {
  // 1. Get business hours for the date
  // 2. Generate all possible time slots
  // 3. Filter out existing appointments
  // 4. Filter out blocked time
  // 5. Ensure service fits in slot
  // 6. Add buffer time
  // 7. Return available slots
}
```

### API Routes

#### GET /api/salons/[slug]

Returns public salon info and services

#### GET /api/availability

```typescript
// Query params:
// - salon_id: string
// - date: string (YYYY-MM-DD)
// - service_id: string

// Returns available time slots
```

#### POST /api/appointments

```typescript
// Body:
{
  salon_id: string,
  service_id: string,
  date: string,
  start_time: string,
  client_name: string,
  client_email: string,
  client_phone?: string,
  notes?: string
}
```

#### DELETE /api/appointments/[id]

Cancellation with token validation

### Real-time Updates

Use Supabase Realtime for:

- Live availability updates during booking
- Dashboard appointment updates
- New booking notifications

```typescript
// Subscribe to appointments table
const subscription = supabase
  .channel("appointments")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "appointments",
      filter: `salon_id=eq.${salonId}`,
    },
    (payload) => {
      // Update local state
    }
  )
  .subscribe();
```

### Email Templates

#### Booking Confirmation

```
Subject: Appointment Confirmed - [Salon Name]

Hi [Client Name],

Your appointment is confirmed!

Details:
📅 Date: [Date]
⏰ Time: [Start] - [End]
💇 Service: [Service Name]
📍 Location: [Salon Address]
💵 Price: [Price]

Need to make changes?
[Reschedule] [Cancel]

See you soon!
[Salon Name]
```

#### Reminder Email (24 hours before)

```
Subject: Reminder: Appointment Tomorrow at [Salon Name]

Hi [Client Name],

Just a reminder about your appointment tomorrow:

📅 [Date] at [Time]
💇 [Service Name]

[Get Directions] [Cancel if needed]

See you tomorrow!
[Salon Name]
```

## Security Considerations

### Authentication & Authorization

- Email verification required for salon owners
- Row Level Security (RLS) in Supabase
- Salon owners can only access their own data
- Clients don't need accounts (email-based actions)

### Data Protection

- Sanitize all user inputs
- Use parameterized queries (Supabase handles this)
- HTTPS only
- Encrypt sensitive data at rest

### Rate Limiting

- Limit booking attempts per IP
- Limit email sends per client
- API rate limiting via Vercel

### RLS Policies Example

```sql
-- Salons can only see their own appointments
CREATE POLICY "Salons see own appointments" ON appointments
  FOR SELECT USING (salon_id = auth.uid());

-- Anyone can create appointments (public booking)
CREATE POLICY "Public can book appointments" ON appointments
  FOR INSERT WITH CHECK (true);

-- Only appointment creator or salon can cancel
CREATE POLICY "Cancel own appointments" ON appointments
  FOR UPDATE USING (
    salon_id = auth.uid() OR
    cancellation_token = current_setting('app.cancellation_token')
  );
```

## Performance Optimization

### Frontend

- Use Next.js Image component for logos
- Lazy load calendar component
- Prefetch next month's availability
- Use React Query for data caching
- Implement virtual scrolling for long lists

### Database

- Index on (salon_id, appointment_date)
- Index on service_id
- Materialized view for analytics
- Partition appointments table by month (future)

### Caching Strategy

- Cache salon info (1 hour)
- Cache services (30 minutes)
- Real-time availability (no caching)
- Use ISR for public salon pages

## Development Phases

### Phase 1: MVP Core (Weeks 1-3)

- [ ] Setup Next.js project with TypeScript
- [ ] Configure Supabase project
- [ ] Create database schema
- [ ] Build salon registration flow
- [ ] Service management CRUD
- [ ] Basic calendar component
- [ ] Public booking page
- [ ] Email notifications
- [ ] Simple admin approval

### Phase 2: Polish (Weeks 4-5)

- [ ] Mobile responsive design
- [ ] Loading states & error handling
- [ ] Email template styling
- [ ] Calendar drag-and-drop
- [ ] Timezone handling
- [ ] Basic analytics

### Phase 3: Launch Prep (Week 6)

- [ ] Testing & bug fixes
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Deploy to production

## Testing Strategy

### Unit Tests

- Availability calculation logic
- Date/time utilities
- Price calculations

### Integration Tests

- Booking flow end-to-end
- Email sending
- Cancellation process

### E2E Tests

- Complete booking journey
- Salon onboarding
- Admin workflows

## Deployment

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Production Checklist

- [ ] Environment variables set
- [ ] Database migrations run
- [ ] RLS policies enabled
- [ ] Email domain verified
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring setup
- [ ] Error tracking (Sentry)
- [ ] Analytics configured

## Future Enhancements (Post-MVP)

### Near-term

- SMS notifications (Twilio)
- Payment processing (Stripe)
- Client accounts & booking history
- Multi-staff scheduling
- Waitlist management
- Google Calendar sync
- Service packages/bundles

### Long-term

- Mobile app (React Native)
- POS integration
- Inventory management
- Commission tracking
- Advanced analytics
- Loyalty program
- Review system
- Multi-location support

## Success Metrics

### Technical KPIs

- Page load time < 2 seconds
- Booking completion rate > 80%
- System uptime > 99.9%
- Email delivery rate > 95%

### Business KPIs

- Salons onboarded
- Bookings per month
- No-show reduction rate
- User satisfaction score

## Support Resources

### Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Resend Docs](https://resend.com/docs)

### Common Issues & Solutions

**Issue**: Double bookings occurring
**Solution**: Implement optimistic locking with version field

**Issue**: Timezone confusion
**Solution**: Store all times in UTC, display in salon's timezone

**Issue**: Email going to spam
**Solution**: Configure SPF, DKIM, DMARC records

**Issue**: Slow calendar loading
**Solution**: Paginate appointments, use virtual scrolling

## Development Commands

```bash
# Setup
npm install
npm run dev

# Database
npx supabase init
npx supabase db reset
npx supabase db push

# Testing
npm run test
npm run test:e2e

# Build
npm run build
npm run start

# Deployment
vercel --prod
```

## Contact & Support

For development questions or issues, refer to:

1. This documentation
2. Project GitHub issues
3. Supabase Discord community
4. Next.js Discord community

---

_This document should be kept updated as the project evolves. Last updated: [Current Date]_
