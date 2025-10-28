import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { business_hours } = body

    if (!business_hours) {
      return NextResponse.json(
        { error: 'Business hours are required' },
        { status: 400 }
      )
    }

    // Update salon business hours
    const { data: salon, error: updateError } = await supabase
      .from('salons')
      .update({ business_hours })
      .eq('owner_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating salon settings:', updateError)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ salon })
  } catch (error) {
    console.error('Error in PUT /api/salons/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
