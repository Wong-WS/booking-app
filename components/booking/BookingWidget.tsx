'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ServiceSelector from './ServiceSelector'
import DateTimePicker from './DateTimePicker'
import BookingForm from './BookingForm'
import { Service } from '@/types'

type Salon = {
  id: string
  name: string
  slug: string
  timezone: string
  business_hours: any
  booking_buffer: number
}

type BookingWidgetProps = {
  salon: Salon
  services: Service[]
}

type BookingStep = 'service' | 'datetime' | 'details' | 'confirmed'

export default function BookingWidget({ salon, services }: BookingWidgetProps) {
  const [step, setStep] = useState<BookingStep>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep('datetime')
  }

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setStep('details')
  }

  const handleBookingComplete = (id: string) => {
    setBookingId(id)
    setStep('confirmed')
  }

  const handleReset = () => {
    setStep('service')
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setBookingId(null)
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Services Available</CardTitle>
          <CardDescription>
            This salon hasn't added any services yet. Please check back later.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={`flex items-center ${step === 'service' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step === 'service' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
          }`}>
            1
          </div>
          <span className="ml-2 hidden sm:inline">Service</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center ${step === 'datetime' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step === 'datetime' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
          }`}>
            2
          </div>
          <span className="ml-2 hidden sm:inline">Date & Time</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center ${step === 'details' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step === 'details' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
          }`}>
            3
          </div>
          <span className="ml-2 hidden sm:inline">Details</span>
        </div>
      </div>

      {/* Step Content */}
      {step === 'service' && (
        <ServiceSelector services={services} onSelect={handleServiceSelect} />
      )}

      {step === 'datetime' && selectedService && (
        <DateTimePicker
          salon={salon}
          service={selectedService}
          onSelect={handleDateTimeSelect}
          onBack={() => setStep('service')}
        />
      )}

      {step === 'details' && selectedService && selectedDate && selectedTime && (
        <BookingForm
          salon={salon}
          service={selectedService}
          date={selectedDate}
          time={selectedTime}
          onComplete={handleBookingComplete}
          onBack={() => setStep('datetime')}
        />
      )}

      {step === 'confirmed' && selectedService && selectedDate && selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Confirmed! ✓</CardTitle>
            <CardDescription>
              You'll receive a confirmation email shortly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Appointment Details</h3>
              <div className="space-y-1 text-sm text-green-800">
                <p><strong>Service:</strong> {selectedService.name}</p>
                <p><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> {selectedService.duration} minutes</p>
                <p><strong>Price:</strong> ${selectedService.price.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              A cancellation link has been sent to your email. Please contact the salon directly
              if you need to make any changes.
            </p>
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            >
              Book Another Appointment
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
