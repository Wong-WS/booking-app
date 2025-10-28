import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, timezone, phone, email, address } = body

    // Validate required fields
    if (!name || !slug || !timezone) {
      return NextResponse.json(
        { error: 'Name, slug, and timezone are required' },
        { status: 400 }
      )
    }

    // Check if slug is already taken
    const { data: existingSalon } = await supabase
      .from('salons')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSalon) {
      return NextResponse.json(
        { error: 'This slug is already taken. Please choose another.' },
        { status: 400 }
      )
    }

    // Create salon
    const { data: salon, error: createError } = await supabase
      .from('salons')
      .insert({
        owner_id: user.id,
        name,
        slug,
        description,
        timezone,
        phone,
        email,
        address,
        status: 'pending', // Requires admin approval
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating salon:', createError)
      return NextResponse.json(
        { error: 'Failed to create salon' },
        { status: 500 }
      )
    }

    return NextResponse.json({ salon }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/salons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's salons
    const { data: salons, error } = await supabase
      .from('salons')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching salons:', error)
      return NextResponse.json(
        { error: 'Failed to fetch salons' },
        { status: 500 }
      )
    }

    return NextResponse.json({ salons })
  } catch (error) {
    console.error('Error in GET /api/salons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
