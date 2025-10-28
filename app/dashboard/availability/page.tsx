'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

type AvailabilityBlock = {
  id: string
  block_date: string
  start_time: string
  end_time: string
  reason: string | null
}

export default function AvailabilityPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    block_date: '',
    start_time: '09:00',
    end_time: '17:00',
    reason: '',
  })

  useEffect(() => {
    fetchBlocks()
  }, [])

  const fetchBlocks = async () => {
    try {
      const response = await fetch('/api/availability-blocks')
      const data = await response.json()
      setBlocks(data.blocks || [])
    } catch (error) {
      console.error('Error fetching blocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/availability-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create block')
      }

      setDialogOpen(false)
      setFormData({ block_date: '', start_time: '09:00', end_time: '17:00', reason: '' })
      fetchBlocks()
    } catch (error) {
      console.error('Error creating block:', error)
      alert('Failed to create block')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blocked time?')) return

    try {
      const response = await fetch(`/api/availability-blocks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete block')
      }

      fetchBlocks()
    } catch (error) {
      console.error('Error deleting block:', error)
      alert('Failed to delete block')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blocked Times</h1>
            <p className="text-gray-600 mt-1">Manage specific dates/times when you're unavailable</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Availability Blocks</CardTitle>
              <CardDescription>
                Block out times for vacations, lunch breaks, or other unavailable periods
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Block</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Block Time</DialogTitle>
                    <DialogDescription>
                      Set a date and time range when you'll be unavailable
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="block_date">Date *</Label>
                      <Input
                        id="block_date"
                        type="date"
                        value={formData.block_date}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, block_date: e.target.value }))
                        }
                        min={format(new Date(), 'yyyy-MM-dd')}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time *</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={formData.start_time}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, start_time: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_time">End Time *</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={formData.end_time}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, end_time: e.target.value }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (optional)</Label>
                      <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, reason: e.target.value }))
                        }
                        placeholder="e.g., Vacation, Lunch break, etc."
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Block</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading blocks...</p>
            ) : blocks.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No blocked times. Click "Add Block" to create one.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocks.map((block) => (
                    <TableRow key={block.id}>
                      <TableCell className="font-medium">
                        {format(new Date(block.block_date + 'T00:00:00'), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {block.start_time} - {block.end_time}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {block.reason || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(block.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
