import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TESTIMONIALS } from '@/lib/home-content-defaults'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '1000')

    const where: any = {}
    if (status && status !== 'All') where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { course: { contains: search, mode: 'insensitive' } },
        { review: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const data = await prisma.testimonial.findMany({
      where,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body?.action === 'seed') {
      const count = await prisma.testimonial.count()
      if (count > 0) {
        return NextResponse.json({
          success: true,
          message: 'Testimonials already exist — seed skipped',
          data: { seeded: 0 },
        })
      }
      await prisma.testimonial.createMany({
        data: DEFAULT_TESTIMONIALS.map((t) => ({
          name: t.name,
          position: t.position,
          company: t.company,
          course: t.course,
          review: t.review,
          rating: t.rating,
          avatarUrl: t.avatarUrl,
          verified: t.verified,
          sortOrder: t.sortOrder,
          status: t.status,
        })),
      })
      const data = await prisma.testimonial.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      })
      return NextResponse.json({
        success: true,
        message: `Seeded ${data.length} testimonials`,
        data,
      })
    }

    if (!body.name || !body.review) {
      return NextResponse.json(
        { success: false, error: 'Name and review are required' },
        { status: 400 }
      )
    }

    const maxSort = await prisma.testimonial.aggregate({ _max: { sortOrder: true } })
    const item = await prisma.testimonial.create({
      data: {
        name: body.name,
        position: body.position || null,
        company: body.company || null,
        course: body.course || null,
        review: body.review,
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        avatarUrl: body.avatarUrl || null,
        verified: body.verified !== false,
        sortOrder:
          typeof body.sortOrder === 'number'
            ? body.sortOrder
            : (maxSort._max.sortOrder ?? 0) + 1,
        status: body.status || 'Active',
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
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

    const item = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(updateData.name !== undefined && { name: updateData.name }),
        ...(updateData.position !== undefined && { position: updateData.position || null }),
        ...(updateData.company !== undefined && { company: updateData.company || null }),
        ...(updateData.course !== undefined && { course: updateData.course || null }),
        ...(updateData.review !== undefined && { review: updateData.review }),
        ...(updateData.rating !== undefined && {
          rating: Math.min(5, Math.max(1, Number(updateData.rating) || 5)),
        }),
        ...(updateData.avatarUrl !== undefined && { avatarUrl: updateData.avatarUrl || null }),
        ...(updateData.verified !== undefined && { verified: Boolean(updateData.verified) }),
        ...(updateData.sortOrder !== undefined && { sortOrder: Number(updateData.sortOrder) }),
        ...(updateData.status !== undefined && { status: updateData.status }),
      },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update testimonial' },
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

    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}
