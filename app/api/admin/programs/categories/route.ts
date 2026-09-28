import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/programs/categories
 * Distinct program categories from the database (for admin filters).
 */
export async function GET() {
  try {
    const rows = await prisma.program.findMany({
      select: { category: true },
    })

    const categories = Array.from(
      new Set(
        rows
          .map((r) => (r.category || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Error fetching program categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories', data: [] },
      { status: 500 }
    )
  }
}
