import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// Invoice generation removed - invoices are now generated when order status changes to "Completed"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // If payment method is "invoice", create an InvoiceRequest instead of direct registration
    if (body.paymentMethod === 'invoice') {
      // Get schedule fee if scheduleId is provided
      let perParticipantAmount = 0
      if (body.scheduleId) {
        const schedule = await prisma.schedule.findUnique({
          where: { id: body.scheduleId },
          select: { fee: true },
        })
        if (schedule?.fee) {
          perParticipantAmount = schedule.fee
        }
      }

      // Get number of participants (default to 1)
      const participants = body.participants ? parseInt(body.participants) : 1
      const totalAmount = perParticipantAmount * participants

      // Create invoice request
      const invoiceRequest = await prisma.invoiceRequest.create({
        data: {
          scheduleId: body.scheduleId || null,
          courseId: body.courseId || null,
          courseTitle: body.courseTitle || null,
          title: body.title || null,
          name: body.name,
          email: body.email,
          designation: body.designation || null,
          company: body.company || null,
          address: body.address,
          city: body.city,
          country: body.country,
          telephone: body.telephone,
          telephoneCountryCode: body.telephoneCountryCode || '+971',
          mobile: body.mobile || null,
          mobileCountryCode: body.mobileCountryCode || null,
          amount: totalAmount,
          participants: participants,
          status: 'PENDING',
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: invoiceRequest,
          message: 'Invoice request submitted. It will be reviewed and approved by admin.',
        },
        { status: 201 }
      )
    }

    // For other payment methods, create course registration directly
    const participants = body.participants ? parseInt(body.participants) : 1
    
    const courseRegistration = await prisma.courseRegistration.create({
      data: {
        scheduleId: body.scheduleId || null,
        courseId: body.courseId || null,
        courseTitle: body.courseTitle || null,
        title: body.title || null,
        name: body.name,
        email: body.email,
        designation: body.designation || null,
        company: body.company || null,
        address: body.address,
        city: body.city,
        country: body.country,
        telephone: body.telephone,
        telephoneCountryCode: body.telephoneCountryCode || '+971',
        mobile: body.mobile || null,
        mobileCountryCode: body.mobileCountryCode || null,
        paymentMethod: body.paymentMethod,
        paymentStatus: null,
        orderStatus: 'Incomplete',
        participants: participants,
        differentBilling: body.differentBilling || false,
        acceptTerms: body.acceptTerms || false,
        captcha: body.captcha || null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: courseRegistration,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating course registration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit registration' },
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

    const [registrations, total] = await Promise.all([
      prisma.courseRegistration.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.courseRegistration.count(),
    ])

    // Fetch schedules for registrations that have scheduleId
    const scheduleIds = registrations
      .map((reg) => reg.scheduleId)
      .filter((id): id is string => id !== null)

    const schedules = scheduleIds.length > 0
      ? await prisma.schedule.findMany({
          where: { id: { in: scheduleIds } },
          select: { id: true, startDate: true, endDate: true },
        })
      : []

    const scheduleMap = new Map(schedules.map((s) => [s.id, s]))

    // Add schedule information to registrations
    const registrationsWithSchedules = registrations.map((reg) => {
      const schedule = reg.scheduleId ? scheduleMap.get(reg.scheduleId) : null
      return {
        ...reg,
        schedule: schedule ? {
          startDate: schedule.startDate,
          endDate: schedule.endDate,
        } : null,
      }
    })

    return NextResponse.json({
      success: true,
      data: registrationsWithSchedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching course registrations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}
