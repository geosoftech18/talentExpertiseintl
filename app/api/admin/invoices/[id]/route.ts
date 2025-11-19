import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/admin/invoices/[id]
 * Update invoice status (PAID, CANCELLED, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, transactionId } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'PAID', 'CANCELLED', 'OVERDUE']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Update invoice
    const updateData: any = {
      status,
    }

    // Set payment date if marking as PAID
    if (status === 'PAID') {
      updateData.paymentDate = new Date()
      if (transactionId) {
        updateData.transactionId = transactionId
      }
    }

    // If cancelling, optionally store transaction ID for reference
    if (status === 'CANCELLED' && transactionId) {
      updateData.transactionId = transactionId
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
    })

    // If marking as PAID, also update related course registration if exists
    if (status === 'PAID' && updated.courseRegistrationId) {
      try {
        await prisma.courseRegistration.update({
          where: { id: updated.courseRegistrationId },
          data: {
            paymentStatus: 'Paid',
            orderStatus: 'Completed',
          },
        })
      } catch (error) {
        console.warn('Failed to update course registration:', error)
        // Don't fail the invoice update if registration update fails
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/invoices/[id]
 * Get single invoice details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

