import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/admin/invoice-requests/[id]
 * Approve or reject invoice request
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, rejectionReason, participants, amount } = body // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Fetch the invoice request
    const invoiceRequest = await prisma.invoiceRequest.findUnique({
      where: { id },
    })

    if (!invoiceRequest) {
      return NextResponse.json(
        { success: false, error: 'Invoice request not found' },
        { status: 404 }
      )
    }

    if (invoiceRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Invoice request is already ${invoiceRequest.status}` },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Use provided participants and amount, or fall back to original values
      const finalParticipants = participants || invoiceRequest.participants || 1
      const finalAmount = amount !== undefined ? amount : invoiceRequest.amount

      // Update invoice request status with participants and amount
      await prisma.invoiceRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          participants: finalParticipants,
          amount: finalAmount,
          // approvedBy: userId, // You can add this when you have auth
        },
      })

      // Try to find user by email to link the registration
      let userId: string | null = null
      try {
        const user = await prisma.user.findUnique({
          where: { email: invoiceRequest.email },
          select: { id: true },
        })
        if (user) {
          // Validate that userId is a valid MongoDB ObjectID
          const objectIdPattern = /^[0-9a-fA-F]{24}$/
          if (objectIdPattern.test(user.id)) {
            userId = user.id
          } else {
            console.warn('Invalid userId format (not MongoDB ObjectID):', user.id)
            userId = null
          }
        }
      } catch (error) {
        // If user lookup fails, continue without userId
        console.log('Could not find user for email:', invoiceRequest.email)
      }

      // Create course registration with "In Progress" status
      const courseRegistration = await prisma.courseRegistration.create({
        data: {
          userId: userId || null, // Link to user account if found
          scheduleId: invoiceRequest.scheduleId || null,
          courseId: invoiceRequest.courseId || null,
          courseTitle: invoiceRequest.courseTitle || null,
          title: invoiceRequest.title || null,
          name: invoiceRequest.name,
          email: invoiceRequest.email,
          designation: invoiceRequest.designation || null,
          company: invoiceRequest.company || null,
          address: invoiceRequest.address,
          city: invoiceRequest.city,
          country: invoiceRequest.country,
          telephone: invoiceRequest.telephone,
          telephoneCountryCode: invoiceRequest.telephoneCountryCode,
          mobile: invoiceRequest.mobile || null,
          mobileCountryCode: invoiceRequest.mobileCountryCode || null,
          paymentMethod: 'invoice',
          paymentStatus: 'Unpaid',
          orderStatus: 'In Progress', // New status for approved invoice requests
          participants: finalParticipants,
          differentBilling: false,
          acceptTerms: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Invoice request approved and order created',
        data: {
          invoiceRequest: { ...invoiceRequest, status: 'APPROVED' },
          orderId: courseRegistration.id,
        },
      })
    } else {
      // Reject invoice request
      await prisma.invoiceRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: rejectionReason || null,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Invoice request rejected',
        data: { ...invoiceRequest, status: 'REJECTED' },
      })
    }
  } catch (error) {
    console.error('Error updating invoice request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice request' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/invoice-requests/[id]
 * Get single invoice request details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoiceRequest = await prisma.invoiceRequest.findUnique({
      where: { id },
    })

    if (!invoiceRequest) {
      return NextResponse.json(
        { success: false, error: 'Invoice request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoiceRequest,
    })
  } catch (error) {
    console.error('Error fetching invoice request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice request' },
      { status: 500 }
    )
  }
}

