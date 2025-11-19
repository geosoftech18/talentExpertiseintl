import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const venue = await prisma.venue.create({
      data: {
        name: body.name,
        city: body.city,
        country: body.country,
        status: body.status || 'Active',
      },
    })

    return NextResponse.json(
      { success: true, data: venue },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating venue:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create venue' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.venue.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: venues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching venues:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch venues' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    const venue = await prisma.venue.update({
      where: { id: id },
      data: {
        name: updateData.name,
        city: updateData.city,
        country: updateData.country,
        status: updateData.status || 'Active',
      },
    })

    return NextResponse.json({ success: true, data: venue })
  } catch (error) {
    console.error('Error updating venue:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update venue' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Venue ID is required' },
        { status: 400 }
      )
    }

    await prisma.venue.delete({ where: { id: id } })

    return NextResponse.json({ success: true, message: 'Venue deleted successfully' })
  } catch (error) {
    console.error('Error deleting venue:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete venue' },
      { status: 500 }
    )
  }
}