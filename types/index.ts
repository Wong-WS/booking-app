export interface Salon {
  id: string
  name: string
  slug: string
  email: string
  phone?: string
  address?: string
  timezone: string
  logo_url?: string
  status: 'pending' | 'approved' | 'suspended'
  business_hours?: BusinessHours
  booking_buffer: number
  cancellation_hours: number
  created_at: string
  updated_at: string
}

export interface BusinessHours {
  [key: string]: {
    open: string
    close: string
    closed?: boolean
  }
}

export interface Staff {
  id: string
  salon_id: string
  name: string
  email?: string
  role: string
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  salon_id: string
  category?: string
  name: string
  description?: string
  duration: number
  price: number
  is_active: boolean
  display_order: number
  created_at: string
}

export interface Appointment {
  id: string
  salon_id: string
  service_id: string
  staff_id?: string
  client_name: string
  client_email: string
  client_phone?: string
  appointment_date: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  notes?: string
  cancellation_token: string
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface AvailabilityBlock {
  id: string
  salon_id: string
  staff_id?: string
  block_date: string
  start_time: string
  end_time: string
  reason?: string
  created_at: string
}

export interface ActivityLog {
  id: string
  salon_id: string
  action: string
  metadata?: Record<string, any>
  created_at: string
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface BookingFormData {
  service_id: string
  appointment_date: string
  start_time: string
  client_name: string
  client_email: string
  client_phone?: string
  notes?: string
}
