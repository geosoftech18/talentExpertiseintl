import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_DOWNLOAD_CATEGORIES } from '@/lib/download-defaults'

/**
 * GET /api/download-categories/[slug]
 * Public category detail + active download items.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const category = await prisma.downloadCategory.findFirst({
      where: { slug, status: 'Active' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        items: {
          where: { status: 'Active' },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            fileUrl: true,
            fileName: true,
            fileSize: true,
            sortOrder: true,
          },
        },
      },
    })

    if (category) {
      return NextResponse.json({ success: true, data: category })
    }

    const fallback = DEFAULT_DOWNLOAD_CATEGORIES.find((c) => c.slug === slug)
    if (fallback) {
      return NextResponse.json({
        success: true,
        data: {
          id: `default-${slug}`,
          name: fallback.name,
          slug: fallback.slug,
          description: fallback.description,
          imageUrl: fallback.imageUrl,
          items: [],
        },
        fallback: true,
      })
    }

    return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching download category:', error)
    const { slug } = await params
    const fallback = DEFAULT_DOWNLOAD_CATEGORIES.find((c) => c.slug === slug)
    if (fallback) {
      return NextResponse.json({
        success: true,
        data: {
          id: `default-${slug}`,
          name: fallback.name,
          slug: fallback.slug,
          description: fallback.description,
          imageUrl: fallback.imageUrl,
          items: [],
        },
        fallback: true,
      })
    }
    return NextResponse.json(
      { success: false, error: 'Failed to load category' },
      { status: 500 }
    )
  }
}
