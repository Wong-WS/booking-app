import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Delete block
    const { error: deleteError } = await supabase
      .from('availability_blocks')
      .delete()
      .eq('id', id)
      .eq('salon_id', salon.id)

    if (deleteError) {
      console.error('Error deleting availability block:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete block' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/availability-blocks/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
