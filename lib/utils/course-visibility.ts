/**
 * Public course visibility:
 * - General site listings: show until the course start date (startDate >= today).
 * - Homepage Upcoming section only: startDate >= today + 14 days.
 * Admin / includeExpired paths are unchanged by callers.
 */

export const COURSE_VISIBILITY_LEAD_DAYS = 14

export function startOfLocalDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** General listings / course finder — earliest allowed start is today. */
export function getCourseListingMinStartDate(from: Date = new Date()): Date {
  return startOfLocalDay(from)
}

/** Upcoming section only — earliest allowed start is today + 14 days. */
export function getUpcomingMinStartDate(from: Date = new Date()): Date {
  const d = startOfLocalDay(from)
  d.setDate(d.getDate() + COURSE_VISIBILITY_LEAD_DAYS)
  return d
}

export function parseCourseDate(value: string | Date): Date {
  const d = value instanceof Date ? new Date(value) : new Date(value)
  return startOfLocalDay(d)
}

/** Course finder / category / venue / etc. — show until start date. */
export function isVisibleInCourseListings(
  startDate: string | Date | null | undefined,
  from: Date = new Date()
): boolean {
  if (!startDate) return false
  const start = parseCourseDate(startDate)
  if (Number.isNaN(start.getTime())) return false
  return start.getTime() >= getCourseListingMinStartDate(from).getTime()
}

/** Homepage Upcoming section — only start after 14 days from today. */
export function isVisibleInUpcoming(
  startDate: string | Date | null | undefined,
  from: Date = new Date()
): boolean {
  if (!startDate) return false
  const start = parseCourseDate(startDate)
  if (Number.isNaN(start.getTime())) return false
  return start.getTime() >= getUpcomingMinStartDate(from).getTime()
}
