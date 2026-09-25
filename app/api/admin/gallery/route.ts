import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '1000', 10)

    const where: { status?: string } = {}
    if (status) where.status = status

    const data = await prisma.galleryImage.findMany({
      where,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery images' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name?.trim() || !body.imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Name and image are required' },
        { status: 400 }
      )
    }

    const maxSort = await prisma.galleryImage.aggregate({ _max: { sortOrder: true } })
    const item = await prisma.galleryImage.create({
      data: {
        name: body.name.trim(),
        imageUrl: body.imageUrl,
        sortOrder:
          typeof body.sortOrder === 'number'
            ? body.sortOrder
            : (maxSort._max.sortOrder ?? 0) + 1,
        status: body.status || 'Active',
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create gallery image' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    const item = await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(updateData.name !== undefined && { name: String(updateData.name).trim() }),
        ...(updateData.imageUrl !== undefined && { imageUrl: updateData.imageUrl }),
        ...(updateData.sortOrder !== undefined && { sortOrder: Number(updateData.sortOrder) }),
        ...(updateData.status !== undefined && { status: updateData.status }),
      },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Error updating gallery image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update gallery image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    await prisma.galleryImage.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete gallery image' },
      { status: 500 }
    )
  }
}
