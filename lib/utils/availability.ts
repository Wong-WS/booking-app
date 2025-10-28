import { format, parse, addMinutes, isWithinInterval, isBefore, isAfter } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

type BusinessHours = {
  [key: string]: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
}

type AvailabilityBlock = {
  block_date: string
  start_time: string
  end_time: string
}

type Appointment = {
  appointment_date: string
  start_time: string
  end_time: string
  status: string
}

type TimeSlot = {
  time: string
  available: boolean
}

/**
 * Get available time slots for a given date
 * This is the core availability calculation logic
 */
export function getAvailableSlots(params: {
  date: Date
  serviceDuration: number
  businessHours: BusinessHours
  appointments: Appointment[]
  blocks: AvailabilityBlock[]
  timezone: string
  bufferMinutes?: number
}): TimeSlot[] {
  const { date, serviceDuration, businessHours, appointments, blocks, timezone, bufferMinutes = 0 } = params

  // Get day of week (lowercase)
  const dayOfWeek = format(date, 'EEEE').toLowerCase()
  const dayHours = businessHours[dayOfWeek]

  // If closed, return empty array
  if (!dayHours || !dayHours.isOpen) {
    return []
  }

  // Parse open and close times for the day
  const openTime = parse(dayHours.openTime, 'HH:mm', date)
  const closeTime = parse(dayHours.closeTime, 'HH:mm', date)

  // Generate all possible time slots
  const slots: TimeSlot[] = []
  let currentTime = openTime

  while (isBefore(addMinutes(currentTime, serviceDuration), closeTime) ||
         format(addMinutes(currentTime, serviceDuration), 'HH:mm') === format(closeTime, 'HH:mm')) {
    const timeString = format(currentTime, 'HH:mm')
    const slotEnd = addMinutes(currentTime, serviceDuration + bufferMinutes)

    // Check if slot conflicts with appointments
    const hasAppointmentConflict = appointments.some((apt) => {
      if (apt.status === 'cancelled') return false

      const aptDate = apt.appointment_date
      const dateString = format(date, 'yyyy-MM-dd')

      if (aptDate !== dateString) return false

      const aptStart = parse(apt.start_time, 'HH:mm:ss', date)
      const aptEnd = parse(apt.end_time, 'HH:mm:ss', date)

      // Check if slot overlaps with appointment
      return (
        (isWithinInterval(currentTime, { start: aptStart, end: aptEnd }) ||
         isWithinInterval(slotEnd, { start: aptStart, end: aptEnd }) ||
         (isBefore(currentTime, aptStart) && isAfter(slotEnd, aptEnd)))
      )
    })

    // Check if slot conflicts with blocked times
    const hasBlockConflict = blocks.some((block) => {
      const blockDate = block.block_date
      const dateString = format(date, 'yyyy-MM-dd')

      if (blockDate !== dateString) return false

      const blockStart = parse(block.start_time, 'HH:mm:ss', date)
      const blockEnd = parse(block.end_time, 'HH:mm:ss', date)

      // Check if slot overlaps with block
      return (
        (isWithinInterval(currentTime, { start: blockStart, end: blockEnd }) ||
         isWithinInterval(slotEnd, { start: blockStart, end: blockEnd }) ||
         (isBefore(currentTime, blockStart) && isAfter(slotEnd, blockEnd)))
      )
    })

    slots.push({
      time: timeString,
      available: !hasAppointmentConflict && !hasBlockConflict,
    })

    // Move to next slot (15-minute intervals)
    currentTime = addMinutes(currentTime, 15)
  }

  return slots
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

/**
 * Check if a time slot is in the past
 */
export function isPastSlot(date: Date, time: string): boolean {
  const slotDateTime = parse(time, 'HH:mm', date)
  return isBefore(slotDateTime, new Date())
}
