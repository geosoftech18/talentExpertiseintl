import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  buildCertificateNumber,
  formatScheduleLabel,
  isOrderCompleted,
  isScheduleEligibleForCertificate,
} from '@/lib/utils/certificate-helpers'

/**
 * GET /api/admin/issued-certificates
 * Lists attendance certificates for completed course registrations.
 * Certificates are generated on demand (not stored); this surfaces all eligible ones.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const limit = Math.min(parseInt(searchParams.get('limit') || '2000', 10) || 2000, 5000)

    const registrations = await prisma.courseRegistration.findMany({
      where: {
        scheduleId: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        courseTitle: true,
        scheduleId: true,
        orderStatus: true,
        submittedAt: true,
        createdAt: true,
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
    })

    const completed = registrations.filter((r) => isOrderCompleted(r.orderStatus) && r.scheduleId)
    if (completed.length === 0) {
      return NextResponse.json({ success: true, data: [], total: 0 })
    }

    const scheduleIds = [...new Set(completed.map((r) => r.scheduleId!))]
    const schedules = await prisma.schedule.findMany({
      where: { id: { in: scheduleIds } },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        venue: true,
        status: true,
        program: {
          select: {
            programName: true,
          },
        },
      },
    })

    const scheduleMap = new Map(schedules.map((s) => [s.id, s]))

    let certificates = completed
      .map((reg) => {
        const schedule = scheduleMap.get(reg.scheduleId!)
        if (!schedule) return null
        if (!isScheduleEligibleForCertificate(schedule)) return null

        const courseName =
          reg.courseTitle || schedule.program?.programName || 'Training Course'
        const certificateNumber = buildCertificateNumber(reg.id)
        const scheduleLabel = formatScheduleLabel(
          schedule.startDate,
          schedule.endDate,
          schedule.venue
        )

        return {
          id: reg.id,
          registrationId: reg.id,
          name: reg.name,
          email: reg.email,
          courseName,
          certificateNumber,
          schedule: scheduleLabel,
          scheduleId: schedule.id,
          venue: schedule.venue,
          startDate: schedule.startDate.toISOString(),
          endDate: schedule.endDate?.toISOString() ?? null,
          orderStatus: reg.orderStatus,
          submittedAt: (reg.submittedAt || reg.createdAt).toISOString(),
        }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)

    if (search) {
      certificates = certificates.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.courseName.toLowerCase().includes(search) ||
          c.certificateNumber.toLowerCase().includes(search) ||
          c.schedule.toLowerCase().includes(search)
      )
    }

    return NextResponse.json({
      success: true,
      data: certificates,
      total: certificates.length,
    })
  } catch (error) {
    console.error('Error listing issued certificates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load issued certificates' },
      { status: 500 }
    )
  }
}
