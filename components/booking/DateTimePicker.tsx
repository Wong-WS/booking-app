'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfDay, isBefore } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Service } from '@/types'
import { formatTime } from '@/lib/utils/availability'

type Salon = {
  id: string
  name: string
  timezone: string
  business_hours: any
  booking_buffer: number
}

type DateTimePickerProps = {
  salon: Salon
  service: Service
  onSelect: (date: Date, time: string) => void
  onBack: () => void
}

type TimeSlot = {
  time: string
  available: boolean
}

export default function DateTimePicker({ salon, service, onSelect, onBack }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [availableDates, setAvailableDates] = useState<Date[]>([])

  // Generate next 14 days as available booking dates
  useEffect(() => {
    const dates: Date[] = []
    const today = startOfDay(new Date())
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(today, i))
    }
    setAvailableDates(dates)
  }, [])

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const fetchAvailableSlots = async (date: Date) => {
    setLoading(true)
    try {
      const dateString = format(date, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/availability?salonId=${salon.id}&date=${dateString}&serviceDuration=${service.duration}`
      )
      const data = await response.json()
      setAvailableSlots(data.slots || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      onSelect(selectedDate, time)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Date & Time</CardTitle>
        <CardDescription>
          {service.name} - {service.duration} minutes
        </CardDescription>
        <Button variant="outline" size="sm" onClick={onBack} className="mt-2">
          ← Back to Services
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div>
          <h3 className="font-semibold mb-3">Choose a Date</h3>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {availableDates.map((date) => {
              const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
              const isPast = isBefore(date, startOfDay(new Date()))

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isPast && handleDateSelect(date)}
                  disabled={isPast}
                  className={`p-2 text-center border rounded transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isPast
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-xs">{format(date, 'EEE')}</div>
                  <div className="text-lg font-semibold">{format(date, 'd')}</div>
                  <div className="text-xs">{format(date, 'MMM')}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div>
            <h3 className="font-semibold mb-3">
              Available Times for {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading available times...</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No available times for this date. Please select another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {availableSlots
                  .filter((slot) => slot.available)
                  .map((slot) => (
                    <Button
                      key={slot.time}
                      variant="outline"
                      onClick={() => handleTimeSelect(slot.time)}
                      className="hover:bg-blue-600 hover:text-white"
                    >
                      {formatTime(slot.time)}
                    </Button>
                  ))}
              </div>
            )}
            {availableSlots.filter((slot) => slot.available).length === 0 &&
              availableSlots.length > 0 && (
                <p className="text-center py-8 text-gray-500">
                  All time slots are booked for this date. Please select another date.
                </p>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
