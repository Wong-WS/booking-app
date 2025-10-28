import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has a salon
  const { data: salons } = await supabase
    .from('salons')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)

  if (!salons || salons.length === 0) {
    redirect('/dashboard/setup')
  }

  const salon = salons[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{salon.name}</h1>
          <p className="text-gray-600 mt-1">Welcome back to your dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Manage your salon services</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/services">
                <Button className="w-full">Manage Services</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>View and manage bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/appointments">
                <Button className="w-full">View Appointments</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>View your schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/calendar">
                <Button className="w-full">View Calendar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Business hours and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/settings">
                <Button className="w-full">Manage Settings</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blocked Times</CardTitle>
              <CardDescription>Manage unavailable periods</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/availability">
                <Button className="w-full">Manage Blocks</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Page</CardTitle>
              <CardDescription>View your public booking page</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/${salon.slug}`} target="_blank">
                <Button className="w-full" variant="outline">
                  View Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {salon.status === 'pending' && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-900">
              <strong>Pending Approval:</strong> Your salon is currently under review.
              You can set up services, but bookings will only be accepted once approved by an admin.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
