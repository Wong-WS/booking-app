'use client'

import { useEffect, useState } from 'react'
import { format, startOfWeek, addDays, isSameDay, parse } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

type Appointment = {
  id: string
  client_name: string
  client_email: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  service_id: string
}

type Service = {
  id: string
  name: string
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [aptsResponse, servicesResponse] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/services'),
      ])

      const aptsData = await aptsResponse.json()
      const servicesData = await servicesResponse.json()

      setAppointments(aptsData.appointments || [])
      setServices(servicesData.services || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    return service?.name || 'Unknown Service'
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getAppointmentsForDay = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd')
    return appointments
      .filter((apt) => apt.appointment_date === dayString && apt.status !== 'cancelled')
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  const goToPreviousWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7))
  }

  const goToNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading calendar...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-gray-600 mt-1">View your weekly schedule</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Week of {format(weekStart, 'MMM dd, yyyy')}</CardTitle>
                <CardDescription>
                  {appointments.length} total appointment{appointments.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goToPreviousWeek}>
                  Previous
                </Button>
                <Button variant="outline" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" onClick={goToNextWeek}>
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDay(day)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toISOString()}
                    className={`border rounded-lg p-3 min-h-[200px] ${
                      isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-2">
                      <div>{format(day, 'EEE')}</div>
                      <div className="text-2xl">{format(day, 'd')}</div>
                    </div>

                    <div className="space-y-2">
                      {dayAppointments.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No appointments</p>
                      ) : (
                        dayAppointments.map((apt) => {
                          const startTime = apt.start_time.substring(0, 5) // HH:MM
                          const endTime = apt.end_time.substring(0, 5)

                          return (
                            <div
                              key={apt.id}
                              className={`text-xs p-2 rounded ${
                                apt.status === 'confirmed'
                                  ? 'bg-green-100 border border-green-300'
                                  : apt.status === 'completed'
                                  ? 'bg-gray-100 border border-gray-300'
                                  : 'bg-yellow-100 border border-yellow-300'
                              }`}
                            >
                              <div className="font-medium">{startTime}</div>
                              <div className="text-gray-700">{apt.client_name}</div>
                              <div className="text-gray-600 truncate">
                                {getServiceName(apt.service_id)}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {appointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No appointments scheduled yet.</p>
                <p className="text-sm mt-2">
                  Share your booking page to start receiving appointments!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
