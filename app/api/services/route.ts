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

    // Get services for this salon
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salon.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      )
    }

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Error in GET /api/services:', error)
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
    const { name, description, duration, price } = body

    if (!name || !duration || price === undefined) {
      return NextResponse.json(
        { error: 'Name, duration, and price are required' },
        { status: 400 }
      )
    }

    // Create service
    const { data: service, error: createError } = await supabase
      .from('services')
      .insert({
        salon_id: salon.id,
        name,
        description,
        duration,
        price,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating service:', createError)
      return NextResponse.json(
        { error: 'Failed to create service' },
        { status: 500 }
      )
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/services:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
