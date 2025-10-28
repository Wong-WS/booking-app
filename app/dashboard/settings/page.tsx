'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'

type DaySchedule = {
  isOpen: boolean
  openTime: string
  closeTime: string
}

type BusinessHours = {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const DEFAULT_HOURS: BusinessHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { isOpen: true, openTime: '10:00', closeTime: '16:00' },
  sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
}

export default function SettingsPage() {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_HOURS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/salons')
      const data = await response.json()

      if (data.salons && data.salons.length > 0) {
        const salon = data.salons[0]
        if (salon.business_hours) {
          setBusinessHours(salon.business_hours)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDayToggle = (day: keyof BusinessHours) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }))
  }

  const handleTimeChange = (
    day: keyof BusinessHours,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/salons/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_hours: businessHours }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your salon settings and availability</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>
              Set your regular weekly schedule. You can block specific dates separately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <div
                className={`p-3 text-sm rounded ${
                  message.includes('success')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <div className="space-y-4">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3 min-w-[140px]">
                    <Switch
                      checked={businessHours[day].isOpen}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label className="text-base font-medium cursor-pointer">
                      {DAY_LABELS[day]}
                    </Label>
                  </div>

                  {businessHours[day].isOpen ? (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1">
                        <Label htmlFor={`${day}-open`} className="text-xs text-gray-500">
                          Open
                        </Label>
                        <Input
                          id={`${day}-open`}
                          type="time"
                          value={businessHours[day].openTime}
                          onChange={(e) => handleTimeChange(day, 'openTime', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <span className="text-gray-500 pt-6">-</span>
                      <div className="flex-1">
                        <Label htmlFor={`${day}-close`} className="text-xs text-gray-500">
                          Close
                        </Label>
                        <Input
                          id={`${day}-close`}
                          type="time"
                          value={businessHours[day].closeTime}
                          onChange={(e) => handleTimeChange(day, 'closeTime', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">Closed</span>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Business Hours'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
