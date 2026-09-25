/**
 * Shared helpers for attendance certificates.
 * Number format matches /api/user/certificates/[registrationId].
 */

export function buildCertificateNumber(registrationId: string, date: Date = new Date()): string {
  return `TEI/${date.getFullYear()}/${registrationId.slice(-4).toUpperCase()}`
}

export function isOrderCompleted(orderStatus: string | null | undefined): boolean {
  return (orderStatus || '').toLowerCase() === 'completed'
}

export function isScheduleEligibleForCertificate(schedule: {
  startDate: Date
  endDate: Date | null
  status: string | null
}): boolean {
  const now = new Date()
  const endDate = schedule.endDate || schedule.startDate
  const isCompletedByDate = endDate.getTime() <= now.getTime()
  const isCompletedByStatus = (schedule.status || '').toLowerCase() === 'completed'
  return isCompletedByDate || isCompletedByStatus
}

export function formatScheduleLabel(
  startDate: Date | string,
  endDate: Date | string | null | undefined,
  venue?: string | null
): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  let dates: string
  if (end && start.getTime() !== end.getTime()) {
    dates = `${fmt(start)} - ${fmt(end)}`
  } else {
    dates = fmt(start)
  }

  if (venue?.trim()) {
    return `${dates} · ${venue.trim()}`
  }
  return dates
}
