'use client'

import { useEffect, useState } from 'react'
import { format, parse } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatTime } from '@/lib/utils/availability'

type Appointment = {
  id: string
  client_name: string
  client_email: string
  client_phone: string | null
  appointment_date: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  notes: string | null
  service_id: string
  created_at: string
}

type Service = {
  id: string
  name: string
  price: number
  duration: number
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

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

  const getServiceDetails = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      confirmed: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
      'no-show': 'outline',
    }
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    )
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      fetchData()
      setDetailsDialogOpen(false)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update appointment status')
    }
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setDetailsDialogOpen(true)
  }

  const filteredAppointments = appointments
    .filter((apt) => {
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          apt.client_name.toLowerCase().includes(query) ||
          apt.client_email.toLowerCase().includes(query) ||
          getServiceName(apt.service_id).toLowerCase().includes(query)
        )
      }
      return true
    })
    .sort((a, b) => {
      const dateCompare = b.appointment_date.localeCompare(a.appointment_date)
      if (dateCompare !== 0) return dateCompare
      return b.start_time.localeCompare(a.start_time)
    })

  const getAppointmentsByStatus = (status: string) => {
    if (status === 'all') return appointments
    return appointments.filter((apt) => apt.status === status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading appointments...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-gray-600 mt-1">Manage your bookings and appointments</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Appointments</CardDescription>
              <CardTitle className="text-3xl">{appointments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Confirmed</CardDescription>
              <CardTitle className="text-3xl">
                {getAppointmentsByStatus('confirmed').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">
                {getAppointmentsByStatus('completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cancelled</CardDescription>
              <CardTitle className="text-3xl">
                {getAppointmentsByStatus('cancelled').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>View and manage your bookings</CardDescription>
              </div>
              <Input
                placeholder="Search by name, email, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed ({getAppointmentsByStatus('confirmed').length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({getAppointmentsByStatus('completed').length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({getAppointmentsByStatus('cancelled').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={statusFilter} className="mt-4">
                {filteredAppointments.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    {searchQuery
                      ? 'No appointments found matching your search.'
                      : 'No appointments yet.'}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((apt) => {
                        const startTime = apt.start_time.substring(0, 5)
                        return (
                          <TableRow key={apt.id}>
                            <TableCell>
                              <div className="font-medium">
                                {format(new Date(apt.appointment_date + 'T00:00:00'), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-sm text-gray-500">{formatTime(startTime)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{apt.client_name}</div>
                              <div className="text-sm text-gray-500">{apt.client_email}</div>
                            </TableCell>
                            <TableCell>{getServiceName(apt.service_id)}</TableCell>
                            <TableCell>{getStatusBadge(apt.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(apt)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Booking ID: {selectedAppointment.id.substring(0, 8)}...
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1">
                    {format(
                      new Date(selectedAppointment.appointment_date + 'T00:00:00'),
                      'EEEE, MMMM dd, yyyy'
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Time</label>
                  <p className="mt-1">
                    {formatTime(selectedAppointment.start_time.substring(0, 5))} -{' '}
                    {formatTime(selectedAppointment.end_time.substring(0, 5))}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Service</label>
                <p className="mt-1">{getServiceName(selectedAppointment.service_id)}</p>
                {getServiceDetails(selectedAppointment.service_id) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {getServiceDetails(selectedAppointment.service_id)?.duration} minutes • $
                    {getServiceDetails(selectedAppointment.service_id)?.price.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">Client Information</label>
                <div className="mt-2 space-y-1">
                  <p><strong>Name:</strong> {selectedAppointment.client_name}</p>
                  <p><strong>Email:</strong> {selectedAppointment.client_email}</p>
                  {selectedAppointment.client_phone && (
                    <p><strong>Phone:</strong> {selectedAppointment.client_phone}</p>
                  )}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="mt-1 text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-2">{getStatusBadge(selectedAppointment.status)}</div>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              {selectedAppointment.status === 'confirmed' && (
                <>
                  <Button
                    variant="default"
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                  >
                    Mark as Completed
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'no-show')}
                  >
                    Mark as No-Show
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                  >
                    Cancel Appointment
                  </Button>
                </>
              )}
              {selectedAppointment.status === 'cancelled' && (
                <Button
                  variant="default"
                  onClick={() => handleStatusUpdate(selectedAppointment.id, 'confirmed')}
                >
                  Restore to Confirmed
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
