import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_AFFILIATIONS } from '@/lib/home-content-defaults'

/** Public: Active affiliations for homepage (falls back to static defaults if DB empty). */
export async function GET() {
  try {
    const data = await prisma.affiliation.findMany({
      where: { status: 'Active' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    if (data.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_AFFILIATIONS,
        source: 'defaults',
      })
    }

    return NextResponse.json({ success: true, data, source: 'database' })
  } catch (error) {
    console.error('Error fetching public affiliations:', error)
    return NextResponse.json({
      success: true,
      data: DEFAULT_AFFILIATIONS,
      source: 'defaults',
    })
  }
}
