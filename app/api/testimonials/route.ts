import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TESTIMONIALS } from '@/lib/home-content-defaults'

/** Public: Active testimonials for homepage (falls back to static defaults if DB empty). */
export async function GET() {
  try {
    const data = await prisma.testimonial.findMany({
      where: { status: 'Active' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    if (data.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_TESTIMONIALS,
        source: 'defaults',
      })
    }

    return NextResponse.json({ success: true, data, source: 'database' })
  } catch (error) {
    console.error('Error fetching public testimonials:', error)
    return NextResponse.json({
      success: true,
      data: DEFAULT_TESTIMONIALS,
      source: 'defaults',
    })
  }
}
