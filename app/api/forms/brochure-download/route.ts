import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const brochureDownload = await prisma.brochureDownload.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        countryCode: body.countryCode || '+971',
        courseId: body.courseId || null,
        courseTitle: body.courseTitle || null,
      },
    })

    return NextResponse.json(
      { success: true, data: brochureDownload },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating brochure download:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit download request' },
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

    const [downloads, total] = await Promise.all([
      prisma.brochureDownload.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.brochureDownload.count(),
    ])

    return NextResponse.json({
      success: true,
      data: downloads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching brochure downloads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch downloads' },
      { status: 500 }
    )
  }
}
