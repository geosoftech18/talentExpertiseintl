import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCertificatePdfBuffer } from '@/lib/utils/certificate-pdf'
import {
  buildCertificateNumber,
  isOrderCompleted,
  isScheduleEligibleForCertificate,
} from '@/lib/utils/certificate-helpers'

/**
 * GET /api/admin/issued-certificates/[registrationId]
 * Generate attendance certificate PDF for admin view/download.
 * Query: ?download=1 for attachment; default is inline preview.
 * Query: ?preview=1 skips completion checks (same as user preview).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const isPreviewMode = request.nextUrl.searchParams.get('preview') === '1'
    const asDownload = request.nextUrl.searchParams.get('download') === '1'
    const { registrationId } = await params

    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    const registration = await prisma.courseRegistration.findUnique({
      where: { id: registrationId },
      select: {
        id: true,
        name: true,
        courseTitle: true,
        scheduleId: true,
        orderStatus: true,
      },
    })

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      )
    }

    if (!registration.scheduleId) {
      return NextResponse.json(
        { success: false, error: 'Certificate is not available for this course yet' },
        { status: 400 }
      )
    }

    if (!isPreviewMode && !isOrderCompleted(registration.orderStatus)) {
      return NextResponse.json(
        { success: false, error: 'Certificate is available only for completed enrollments' },
        { status: 400 }
      )
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: registration.scheduleId },
      select: {
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

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      )
    }

    if (!isPreviewMode && !isScheduleEligibleForCertificate(schedule)) {
      return NextResponse.json(
        { success: false, error: 'Certificate can be generated after course completion' },
        { status: 400 }
      )
    }

    const fullName = registration.name || 'Participant'
    const courseTitle =
      registration.courseTitle || schedule.program?.programName || 'Training Course'
    const certificateNo = buildCertificateNumber(registration.id)

    const pdfBuffer = await generateCertificatePdfBuffer({
      fullName,
      courseTitle,
      venue: schedule.venue || 'Venue',
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      certificateNo,
    })

    const filename = `certificate-${registration.id}.pdf`
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': asDownload
          ? `attachment; filename="${filename}"`
          : `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error generating admin certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate certificate' },
      { status: 500 }
    )
  }
}
