import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_DOWNLOAD_CATEGORIES } from '@/lib/download-defaults'
import { slugifyDownloadCategory } from '@/lib/download-slug'

async function seedDefaultsIfEmpty() {
  const count = await prisma.downloadCategory.count()
  if (count > 0) return null

  await prisma.downloadCategory.createMany({
    data: DEFAULT_DOWNLOAD_CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      sortOrder: c.sortOrder,
      status: 'Active',
    })),
  })

  return prisma.downloadCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10) || 500, 1000)

    if (id) {
      const category = await prisma.downloadCategory.findUnique({
        where: { id },
        include: { items: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] } },
      })
      if (!category) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: category })
    }

    let categories = await prisma.downloadCategory.findMany({
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: { select: { items: true } },
      },
    })

    if (categories.length === 0) {
      const seeded = await seedDefaultsIfEmpty()
      if (seeded) {
        categories = seeded.map((c) => ({ ...c, _count: { items: 0 } }))
      }
    }

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching download categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch download categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.action === 'seed') {
      const seeded = await seedDefaultsIfEmpty()
      const data =
        seeded ||
        (await prisma.downloadCategory.findMany({
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        }))
      return NextResponse.json({ success: true, data })
    }

    const name = (body.name || '').trim()
    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    let slug = (body.slug || slugifyDownloadCategory(name)).trim()
    if (!slug) slug = `category-${Date.now()}`

    const existing = await prisma.downloadCategory.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.downloadCategory.create({
      data: {
        name,
        slug,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
        status: body.status || 'Active',
      },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error('Error creating download category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create download category' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...rest } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    const name = (rest.name || '').trim()
    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    let slug = (rest.slug || slugifyDownloadCategory(name)).trim()
    if (!slug) slug = `category-${Date.now()}`

    const conflict = await prisma.downloadCategory.findFirst({
      where: { slug, NOT: { id } },
    })
    if (conflict) {
      return NextResponse.json(
        { success: false, error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.downloadCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description: rest.description || null,
        imageUrl: rest.imageUrl || null,
        sortOrder: typeof rest.sortOrder === 'number' ? rest.sortOrder : 0,
        status: rest.status || 'Active',
      },
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error updating download category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update download category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    await prisma.downloadItem.deleteMany({ where: { categoryId: id } })
    await prisma.downloadCategory.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    console.error('Error deleting download category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete download category' },
      { status: 500 }
    )
  }
}
