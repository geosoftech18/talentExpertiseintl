import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const courseEnquiry = await prisma.courseEnquiry.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        countryCode: body.countryCode || '+971',
        company: body.company,
        jobTitle: body.jobTitle || null,
        courseId: body.courseId || null,
        courseTitle: body.courseTitle || null,
        schedulePreference: body.schedulePreference || null,
        participants: body.participants || '1',
        message: body.message || null,
        status: 'Pending', // Default status
      },
    })

    return NextResponse.json(
      { success: true, data: courseEnquiry },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating course enquiry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit enquiry' },
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

    const [courseEnquiries, total] = await Promise.all([
      prisma.courseEnquiry.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.courseEnquiry.count(),
    ])

    return NextResponse.json({
      success: true,
      data: courseEnquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching course enquiries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enquiries' },
      { status: 500 }
    )
  }
}
