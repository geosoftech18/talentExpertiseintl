import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate mentorId - must be a valid MongoDB ObjectID or null
    let mentorId = null
    if (body.mentorId && body.mentorId.trim() !== '') {
      // Check if it's a valid ObjectID format (24 hex characters)
      const objectIdPattern = /^[0-9a-fA-F]{24}$/
      if (objectIdPattern.test(body.mentorId)) {
        mentorId = body.mentorId
      } else {
        console.warn('Invalid mentorId format:', body.mentorId)
        // If invalid, set to null instead of throwing error
        mentorId = null
      }
    }

    const schedule = await prisma.schedule.create({
      data: {
        programId: body.programId,
        programName: body.programName || null,
        mentorId: mentorId,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        venue: body.venue,
        fee: body.fee !== null && body.fee !== undefined ? parseFloat(String(body.fee).replace(/[^\d.]/g, '')) : null,
        status: body.status || 'Open',
      },
    })

    return NextResponse.json(
      { success: true, data: schedule },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50') // Increased default limit
    const skip = (page - 1) * limit

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          programId: true,
          programName: true,
          mentorId: true,
          startDate: true,
          endDate: true,
          venue: true,
          fee: true,
          status: true,
          createdAt: true,
          // Only include basic fields from relations
          program: {
            select: {
              id: true,
              refCode: true,
              programName: true,
              category: true,
            },
          },
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
      prisma.schedule.count(),
    ])

    return NextResponse.json({
      success: true,
      data: schedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
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
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    // Validate mentorId
    let mentorId = null
    if (updateData.mentorId && updateData.mentorId.trim() !== '') {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/
      if (objectIdPattern.test(updateData.mentorId)) {
        mentorId = updateData.mentorId
      } else {
        mentorId = null
      }
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        programId: updateData.programId,
        programName: updateData.programName || null,
        mentorId: mentorId,
        startDate: new Date(updateData.startDate),
        endDate: updateData.endDate ? new Date(updateData.endDate) : null,
        venue: updateData.venue,
        fee: updateData.fee !== null && updateData.fee !== undefined 
          ? parseFloat(String(updateData.fee).replace(/[^\d.]/g, '')) 
          : null,
        status: updateData.status || 'Open',
      },
    })

    return NextResponse.json({ success: true, data: schedule })
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule' },
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
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    await prisma.schedule.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}