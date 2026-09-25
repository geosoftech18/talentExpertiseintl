import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/registrations/[id]
 * Full course registration details for the admin View page
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    const registration = await prisma.courseRegistration.findUnique({
      where: { id },
    })

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      )
    }

    let schedule: any = null
    let program: any = null

    if (registration.scheduleId) {
      schedule = await prisma.schedule.findUnique({
        where: { id: registration.scheduleId },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          venue: true,
          fee: true,
          status: true,
          programId: true,
        },
      })

      if (schedule?.programId) {
        program = await prisma.program.findUnique({
          where: { id: schedule.programId },
          select: {
            id: true,
            programName: true,
            refCode: true,
          },
        })
      }
    }

    // Fallback: resolve program from courseId if not found via schedule
    if (!program && registration.courseId) {
      try {
        program = await prisma.program.findUnique({
          where: { id: registration.courseId },
          select: {
            id: true,
            programName: true,
            refCode: true,
          },
        })
      } catch {
        // courseId may not always be a valid ObjectId
      }
    }

    const paymentMethodMap: Record<string, string> = {
      credit: 'Credit Card',
      bank: 'Bank Transfer',
      invoice: 'Invoice',
      purchase: 'Purchase Order',
    }

    return NextResponse.json({
      success: true,
      data: {
        id: registration.id,
        // Course / schedule
        courseId: registration.courseId,
        courseTitle: registration.courseTitle || program?.programName || null,
        scheduleId: registration.scheduleId,
        schedule: schedule
          ? {
              ...schedule,
              program,
            }
          : null,
        program,
        // Personal
        title: registration.title,
        name: registration.name,
        email: registration.email,
        designation: registration.designation,
        company: registration.company,
        // Address / contact
        address: registration.address,
        city: registration.city,
        country: registration.country,
        telephone: registration.telephone,
        telephoneCountryCode: registration.telephoneCountryCode,
        mobile: registration.mobile,
        mobileCountryCode: registration.mobileCountryCode,
        // Payment / order
        paymentMethod: registration.paymentMethod,
        paymentMethodLabel:
          paymentMethodMap[registration.paymentMethod] || registration.paymentMethod,
        paymentStatus: registration.paymentStatus || null,
        orderStatus: registration.orderStatus || null,
        participants: registration.participants ?? 1,
        differentBilling: registration.differentBilling,
        acceptTerms: registration.acceptTerms,
        // Meta
        submittedAt: registration.submittedAt,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
        fee: schedule?.fee ?? null,
        totalAmount:
          schedule?.fee != null
            ? schedule.fee * (registration.participants || 1)
            : null,
      },
    })
  } catch (error) {
    console.error('Error fetching registration details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registration details' },
      { status: 500 }
    )
  }
}
