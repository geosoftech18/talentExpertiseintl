import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_DOWNLOAD_CATEGORIES } from '@/lib/download-defaults'

/**
 * GET /api/download-categories
 * Public list of active download categories (with static fallback).
 */
export async function GET() {
  try {
    const categories = await prisma.downloadCategory.findMany({
      where: { status: 'Active' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        sortOrder: true,
      },
    })

    if (categories.length === 0) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_DOWNLOAD_CATEGORIES.map((c, i) => ({
          id: `default-${i}`,
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.imageUrl,
          sortOrder: c.sortOrder,
        })),
        fallback: true,
      })
    }

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching public download categories:', error)
    return NextResponse.json({
      success: true,
      data: DEFAULT_DOWNLOAD_CATEGORIES.map((c, i) => ({
        id: `default-${i}`,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder,
      })),
      fallback: true,
    })
  }
}
