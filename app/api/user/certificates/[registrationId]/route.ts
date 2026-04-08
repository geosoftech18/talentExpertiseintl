import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCertificatePdfBuffer } from '@/lib/utils/certificate-pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const isPreviewMode = request.nextUrl.searchParams.get('preview') === '1'
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { registrationId } = await params

    const registration = await prisma.courseRegistration.findUnique({
      where: { id: registrationId },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        courseTitle: true,
        scheduleId: true,
        orderStatus: true,
        submittedAt: true,
        createdAt: true,
      },
    })

    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 })
    }

    const userEmail = session.user.email || ''
    const ownsByUserId = !!(session.user.id && registration.userId && session.user.id === registration.userId)
    const ownsByEmail = !!(userEmail && registration.email && userEmail.toLowerCase() === registration.email.toLowerCase())
    if (!ownsByUserId && !ownsByEmail) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    if (!registration.scheduleId) {
      return NextResponse.json({ success: false, error: 'Certificate is not available for this course yet' }, { status: 400 })
    }
    if (!isPreviewMode && (registration.orderStatus || '').toLowerCase() !== 'completed') {
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
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const now = new Date()
    const endDate = schedule.endDate || schedule.startDate
    const isCompletedByDate = endDate.getTime() <= now.getTime()
    const isCompletedByStatus = (schedule.status || '').toLowerCase() === 'completed'

    if (!isPreviewMode && !isCompletedByDate && !isCompletedByStatus) {
      return NextResponse.json(
        { success: false, error: 'Certificate can be generated after course completion' },
        { status: 400 }
      )
    }

    const fullName = registration.name || session.user.name || 'Participant'
    const courseTitle = registration.courseTitle || schedule.program?.programName || 'Training Course'
    const certificateNo = `TEI/${new Date().getFullYear()}/${registration.id.slice(-4).toUpperCase()}`

    const pdfBuffer = await generateCertificatePdfBuffer({
      fullName,
      courseTitle,
      venue: schedule.venue || 'Venue',
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      certificateNo,
    })

    const filename = `certificate-${registration.id}.pdf`
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate certificate' }, { status: 500 })
  }
}

