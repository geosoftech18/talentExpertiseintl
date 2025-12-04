import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
// Invoice generation removed - invoices are now generated when order status changes to "Completed"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get user session if logged in (optional - for backward compatibility)
    let userId: string | null = null
    try {
      const session = await auth()
      if (session?.user?.id) {
        // Validate that userId is a valid MongoDB ObjectID (24 hex characters)
        const objectIdPattern = /^[0-9a-fA-F]{24}$/
        if (objectIdPattern.test(session.user.id)) {
          userId = session.user.id
        } else {
          // If userId is not a valid ObjectID (e.g., UUID format), skip it
          console.warn('Invalid userId format (not MongoDB ObjectID):', session.user.id)
          userId = null
        }
      }
    } catch (error) {
      // If session check fails, continue without userId (anonymous registration)
      console.log('No user session found, creating anonymous registration')
    }

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
      // Note: InvoiceRequest doesn't have userId field, but when approved and converted to CourseRegistration, it will be linked
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
        userId: userId || null, // Link to user account if logged in
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
