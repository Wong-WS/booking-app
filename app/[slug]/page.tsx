import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingWidget from '@/components/booking/BookingWidget'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function PublicBookingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch salon by slug
  const { data: salon, error: salonError } = await supabase
    .from('salons')
    .select('*')
    .eq('slug', slug)
    .single()

  if (salonError || !salon) {
    notFound()
  }

  // Only show approved salons
  if (salon.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Salon Not Available</h1>
          <p className="text-gray-600">
            This salon is currently not accepting online bookings.
          </p>
        </div>
      </div>
    )
  }

  // Fetch services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salon.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (servicesError) {
    console.error('Error fetching services:', servicesError)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Salon Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{salon.name}</h1>
          {salon.description && (
            <p className="text-gray-600 mb-4">{salon.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {salon.address && (
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>{salon.address}</span>
              </div>
            )}
            {salon.phone && (
              <div className="flex items-center gap-1">
                <span>📞</span>
                <span>{salon.phone}</span>
              </div>
            )}
            {salon.email && (
              <div className="flex items-center gap-1">
                <span>✉️</span>
                <span>{salon.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Widget */}
        <BookingWidget salon={salon} services={services || []} />
      </div>
    </div>
  )
}
