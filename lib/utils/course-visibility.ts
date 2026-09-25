/**
 * Public course visibility: only show programs that start 14+ days from today.
 * Within 14 days of start → hidden from public listings and Upcoming carousel.
 * Admin / includeExpired paths are unchanged by callers.
 */

export const COURSE_VISIBILITY_LEAD_DAYS = 14

export function startOfLocalDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Earliest start date allowed on the public site (today + 14 days). */
export function getCourseListingMinStartDate(from: Date = new Date()): Date {
  const d = startOfLocalDay(from)
  d.setDate(d.getDate() + COURSE_VISIBILITY_LEAD_DAYS)
  return d
}

export function parseCourseDate(value: string | Date): Date {
  const d = value instanceof Date ? new Date(value) : new Date(value)
  return startOfLocalDay(d)
}

/** Course finder / category / venue / etc. — start is at least 14 days away. */
export function isVisibleInCourseListings(
  startDate: string | Date | null | undefined,
  from: Date = new Date()
): boolean {
  if (!startDate) return false
  const start = parseCourseDate(startDate)
  if (Number.isNaN(start.getTime())) return false
  return start.getTime() >= getCourseListingMinStartDate(from).getTime()
}

/** Homepage Upcoming carousel — same rule: only start after 14 days from today. */
export function isVisibleInUpcoming(
  startDate: string | Date | null | undefined,
  from: Date = new Date()
): boolean {
  return isVisibleInCourseListings(startDate, from)
}
