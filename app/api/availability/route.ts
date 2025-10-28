import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { parse } from 'date-fns'
import { getAvailableSlots } from '@/lib/utils/availability'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')
    const dateString = searchParams.get('date')
    const serviceDuration = parseInt(searchParams.get('serviceDuration') || '30')

    if (!salonId || !dateString) {
      return NextResponse.json(
        { error: 'Salon ID and date are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get salon details
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('*')
      .eq('id', salonId)
      .single()

    if (salonError || !salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Get appointments for the date
    const { data: appointments, error: aptsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .eq('appointment_date', dateString)
      .neq('status', 'cancelled')

    if (aptsError) {
      console.error('Error fetching appointments:', aptsError)
    }

    // Get availability blocks for the date
    const { data: blocks, error: blocksError } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('salon_id', salonId)
      .eq('block_date', dateString)

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError)
    }

    // Parse date
    const date = parse(dateString, 'yyyy-MM-dd', new Date())

    // Calculate available slots
    const slots = getAvailableSlots({
      date,
      serviceDuration,
      businessHours: salon.business_hours || {},
      appointments: appointments || [],
      blocks: blocks || [],
      timezone: salon.timezone || 'America/New_York',
      bufferMinutes: salon.booking_buffer || 0,
    })

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error in GET /api/availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
