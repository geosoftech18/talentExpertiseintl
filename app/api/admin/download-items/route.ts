import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const categoryId = searchParams.get('categoryId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000', 10) || 1000, 2000)

    if (id) {
      const item = await prisma.downloadItem.findUnique({
        where: { id },
        include: { category: { select: { id: true, name: true, slug: true } } },
      })
      if (!item) {
        return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: item })
    }

    const where = categoryId ? { categoryId } : {}
    const items = await prisma.downloadItem.findMany({
      where,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { category: { select: { id: true, name: true, slug: true } } },
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Error fetching download items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch download items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = (body.name || '').trim()
    const categoryId = body.categoryId
    const fileUrl = (body.fileUrl || '').trim()

    if (!name || !categoryId || !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Name, category, and file are required' },
        { status: 400 }
      )
    }

    const category = await prisma.downloadCategory.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    const item = await prisma.downloadItem.create({
      data: {
        categoryId,
        name,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        fileUrl,
        fileName: body.fileName || null,
        fileSize: body.fileSize || null,
        sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
        status: body.status || 'Active',
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating download item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create download item' },
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
    if (!name || !rest.categoryId || !rest.fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Name, category, and file are required' },
        { status: 400 }
      )
    }

    const item = await prisma.downloadItem.update({
      where: { id },
      data: {
        categoryId: rest.categoryId,
        name,
        description: rest.description || null,
        imageUrl: rest.imageUrl || null,
        fileUrl: rest.fileUrl,
        fileName: rest.fileName || null,
        fileSize: rest.fileSize || null,
        sortOrder: typeof rest.sortOrder === 'number' ? rest.sortOrder : 0,
        status: rest.status || 'Active',
      },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Error updating download item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update download item' },
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

    await prisma.downloadItem.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Item deleted' })
  } catch (error) {
    console.error('Error deleting download item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete download item' },
      { status: 500 }
    )
  }
}
