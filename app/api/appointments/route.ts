import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's salon
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!salon) {
      return NextResponse.json({ error: 'No salon found' }, { status: 404 })
    }

    // Get appointments for this salon
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salon.id)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Error in GET /api/appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
