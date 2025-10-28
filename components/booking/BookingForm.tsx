'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Service } from '@/types'
import { formatTime } from '@/lib/utils/availability'

type Salon = {
  id: string
  name: string
}

type BookingFormProps = {
  salon: Salon
  service: Service
  date: Date
  time: string
  onComplete: (bookingId: string) => void
  onBack: () => void
}

export default function BookingForm({
  salon,
  service,
  date,
  time,
  onComplete,
  onBack,
}: BookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salon_id: salon.id,
          service_id: service.id,
          appointment_date: format(date, 'yyyy-MM-dd'),
          start_time: time,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      onComplete(data.appointment.id)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
        <CardDescription>Please provide your contact details</CardDescription>
        <Button variant="outline" size="sm" onClick={onBack} className="mt-2">
          ← Back to Date & Time
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Summary */}
          <div className="p-4 bg-gray-50 border rounded-lg">
            <h3 className="font-semibold mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>Service:</strong> {service.name}</p>
              <p><strong>Date:</strong> {format(date, 'EEEE, MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> {formatTime(time)}</p>
              <p><strong>Duration:</strong> {service.duration} minutes</p>
              <p><strong>Price:</strong> ${service.price.toFixed(2)}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          {/* Client Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Full Name *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_name: e.target.value }))
                }
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">Email *</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_email: e.target.value }))
                }
                placeholder="john@example.com"
                required
              />
              <p className="text-xs text-gray-500">
                We'll send your confirmation and cancellation link to this email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_phone">Phone Number</Label>
              <Input
                id="client_phone"
                type="tel"
                value={formData.client_phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_phone: e.target.value }))
                }
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Confirming Booking...' : 'Confirm Booking'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By booking, you agree to receive appointment confirmation and reminder emails.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
