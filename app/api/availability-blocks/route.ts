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

    // Get availability blocks for this salon
    const { data: blocks, error } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('salon_id', salon.id)
      .order('block_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching availability blocks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch blocks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Error in GET /api/availability-blocks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { block_date, start_time, end_time, reason } = body

    if (!block_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Date, start time, and end time are required' },
        { status: 400 }
      )
    }

    // Create availability block
    const { data: block, error: createError } = await supabase
      .from('availability_blocks')
      .insert({
        salon_id: salon.id,
        block_date,
        start_time,
        end_time,
        reason,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating availability block:', createError)
      return NextResponse.json(
        { error: 'Failed to create block' },
        { status: 500 }
      )
    }

    return NextResponse.json({ block }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/availability-blocks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
