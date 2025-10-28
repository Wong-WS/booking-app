import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { parse, format, addMinutes } from 'date-fns'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      salon_id,
      service_id,
      appointment_date,
      start_time,
      client_name,
      client_email,
      client_phone,
      notes,
    } = body

    // Validate required fields
    if (!salon_id || !service_id || !appointment_date || !start_time || !client_name || !client_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get service details to calculate end time
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Calculate end time
    const startDateTime = parse(`${appointment_date} ${start_time}`, 'yyyy-MM-dd HH:mm', new Date())
    const endDateTime = addMinutes(startDateTime, service.duration)
    const end_time = format(endDateTime, 'HH:mm')

    // Check for conflicts (double-booking prevention)
    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('salon_id', salon_id)
      .eq('appointment_date', appointment_date)
      .neq('status', 'cancelled')
      .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time})`)

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError)
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      )
    }

    // Create appointment
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        salon_id,
        service_id,
        appointment_date,
        start_time,
        end_time,
        client_name,
        client_email,
        client_phone,
        notes,
        status: 'confirmed',
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating appointment:', createError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // TODO: Send confirmation email via Resend
    // For now, we'll just return success

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
