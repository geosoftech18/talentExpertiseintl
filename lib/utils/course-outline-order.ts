/**
 * Course outline module ordering helpers.
 * Keeps title/content untouched; only normalizes display/save sequence.
 */

export type OutlineOrderable = {
  day?: string | null
  createdAt?: Date | string | null
}

/** Extract first integer from labels like "Day 1", "Day 10", "Module 2". */
export function extractOutlineDayNumber(day: string | null | undefined): number | null {
  if (!day) return null
  const match = String(day).match(/(\d+)/)
  if (!match) return null
  const n = parseInt(match[1], 10)
  return Number.isFinite(n) ? n : null
}

/**
 * Stable outline order for admin + public:
 * 1) numeric day ("Day 1" before "Day 2" / "Day 10") — not string sort
 * 2) createdAt ascending (form save order when days collide)
 */
export function sortCourseOutlineItems<T extends OutlineOrderable>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const nA = extractOutlineDayNumber(a.day)
    const nB = extractOutlineDayNumber(b.day)
    if (nA != null && nB != null && nA !== nB) return nA - nB
    if (nA != null && nB == null) return -1
    if (nA == null && nB != null) return 1

    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    if (tA !== tB) return tA - tB
    return 0
  })
}

/**
 * Persist outline in current form/array order.
 * Rewrites day labels to Day 1..n so sequence stays stable.
 * Title and content are unchanged.
 */
export function normalizeCourseOutlineForSave<
  T extends { title?: string; content?: string; day?: string }
>(items: T[]): Array<{ day: string; title: string; content: string }> {
  return items.map((item, index) => ({
    day: `Day ${index + 1}`,
    title: item.title || '',
    content: item.content || '',
  }))
}

/** Renumber Day labels in the admin form to match current array order. */
export function renumberCourseOutlineDays<
  T extends { day: string; title: string; content: string; id: string }
>(items: T[]): T[] {
  return items.map((item, index) => ({
    ...item,
    day: `Day ${index + 1}`,
  }))
}
