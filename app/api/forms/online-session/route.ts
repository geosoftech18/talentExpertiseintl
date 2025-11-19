import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const onlineSessionRequest = await prisma.onlineSessionRequest.create({
      data: {
        courseId: body.courseId || null,
        courseTitle: body.courseTitle || null,
      },
    })

    return NextResponse.json(
      { success: true, data: onlineSessionRequest },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating online session request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit request' },
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

    const [requests, total] = await Promise.all([
      prisma.onlineSessionRequest.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.onlineSessionRequest.count(),
    ])

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching online session requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}
