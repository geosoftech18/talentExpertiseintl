import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Public: Active gallery images for /gallery */
export async function GET() {
  try {
    const data = await prisma.galleryImage.findMany({
      where: { status: 'Active' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        imageUrl: true,
        sortOrder: true,
      },
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching public gallery images:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery images', data: [] },
      { status: 500 }
    )
  }
}
