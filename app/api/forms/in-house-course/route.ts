import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const inHouseRequest = await prisma.inHouseCourseRequest.create({
      data: {
        title: body.title || null,
        name: body.name,
        email: body.email,
        designation: body.designation || null,
        company: body.company,
        address: body.address,
        city: body.city,
        country: body.country,
        telephone: body.telephone,
        telephoneCountryCode: body.telephoneCountryCode || '+971',
        mobile: body.mobile || null,
        mobileCountryCode: body.mobileCountryCode || null,
        courseId: body.courseId || null,
        courseTitle: body.courseTitle || null,
        preferredDates: body.preferredDates || null,
        participants: body.participants,
        location: body.location || null,
        message: body.message || null,
        captcha: body.captcha || null,
      },
    })

    return NextResponse.json(
      { success: true, data: inHouseRequest },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating in-house course request:', error)
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
      prisma.inHouseCourseRequest.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inHouseCourseRequest.count(),
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
    console.error('Error fetching in-house course requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}
