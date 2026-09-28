import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/courses/categories
 * Public category cards: count ALL published programs per category
 * (with schedules and without schedules).
 */
export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      where: { status: 'Published' },
      select: {
        category: true,
        description: true,
        shortDescription: true,
      },
    })

    const categoryMap = new Map<
      string,
      { count: number; description?: string }
    >()

    for (const program of programs) {
      const category = (program.category || '').trim()
      if (!category) continue

      const existing = categoryMap.get(category) || { count: 0 }
      existing.count += 1
      if (!existing.description) {
        existing.description =
          program.shortDescription || program.description || undefined
      }
      categoryMap.set(category, existing)
    }

    const data = Array.from(categoryMap.entries())
      .map(([category, info]) => ({
        category,
        count: info.count,
        description: info.description || null,
      }))
      .sort((a, b) => b.count - a.count)

    const response = NextResponse.json({
      success: true,
      data,
    })
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=120'
    )
    return response
  } catch (error) {
    console.error('Error fetching course categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories', data: [] },
      { status: 500 }
    )
  }
}
