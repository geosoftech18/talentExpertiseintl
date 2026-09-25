import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_AFFILIATIONS } from '@/lib/home-content-defaults'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '1000')

    const where: { status?: string } = {}
    if (status) where.status = status

    const data = await prisma.affiliation.findMany({
      where,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching affiliations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch affiliations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body?.action === 'seed') {
      const count = await prisma.affiliation.count()
      if (count > 0) {
        return NextResponse.json({
          success: true,
          message: 'Affiliations already exist — seed skipped',
          data: { seeded: 0 },
        })
      }
      await prisma.affiliation.createMany({
        data: DEFAULT_AFFILIATIONS.map(({ name, imageUrl, url, sortOrder, status }) => ({
          name,
          imageUrl,
          url: url || '#',
          sortOrder,
          status,
        })),
      })
      const data = await prisma.affiliation.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      })
      return NextResponse.json({
        success: true,
        message: `Seeded ${data.length} affiliations`,
        data,
      })
    }

    if (!body.name || !body.imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Name and image are required' },
        { status: 400 }
      )
    }

    const maxSort = await prisma.affiliation.aggregate({ _max: { sortOrder: true } })
    const item = await prisma.affiliation.create({
      data: {
        name: body.name,
        imageUrl: body.imageUrl,
        url: body.url || '#',
        sortOrder:
          typeof body.sortOrder === 'number'
            ? body.sortOrder
            : (maxSort._max.sortOrder ?? 0) + 1,
        status: body.status || 'Active',
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating affiliation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create affiliation' },
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

    const item = await prisma.affiliation.update({
      where: { id },
      data: {
        ...(updateData.name !== undefined && { name: updateData.name }),
        ...(updateData.imageUrl !== undefined && { imageUrl: updateData.imageUrl }),
        ...(updateData.url !== undefined && { url: updateData.url }),
        ...(updateData.sortOrder !== undefined && { sortOrder: Number(updateData.sortOrder) }),
        ...(updateData.status !== undefined && { status: updateData.status }),
      },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Error updating affiliation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update affiliation' },
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

    await prisma.affiliation.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting affiliation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete affiliation' },
      { status: 500 }
    )
  }
}
