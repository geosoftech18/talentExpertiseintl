import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInvoice } from '@/lib/services/invoice-service'

// GET single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch course registration
    const registration = await prisma.courseRegistration.findUnique({
      where: { id },
    })

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Calculate display ID (same logic as orders list)
    // Get total count and find the index of this registration
    const total = await prisma.courseRegistration.count()
    const allRegistrations = await prisma.courseRegistration.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    const index = allRegistrations.findIndex(reg => reg.id === id)
    const displayId = index >= 0 ? total - index : total

    // Fetch schedule if available
    let schedule = null
    if (registration.scheduleId) {
      schedule = await prisma.schedule.findUnique({
        where: { id: registration.scheduleId },
        include: {
          program: {
            select: {
              id: true,
              programName: true,
              refCode: true,
            },
          },
        },
      })
    }

    // Format dates
    const date = new Date(registration.submittedAt || registration.createdAt)
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    // Format schedule date
    let scheduleDate: string | null = null
    if (schedule?.startDate) {
      const scheduleStartDate = new Date(schedule.startDate)
      const scheduleEndDate = schedule.endDate ? new Date(schedule.endDate) : null
      
      if (scheduleEndDate && scheduleStartDate.getTime() !== scheduleEndDate.getTime()) {
        scheduleDate = `${scheduleStartDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })} - ${scheduleEndDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`
      } else {
        scheduleDate = scheduleStartDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      }
    }

    // Map payment method to display name
    const paymentMethodMap: Record<string, string> = {
      credit: 'Credit Card',
      bank: 'Bank Transfer',
      invoice: 'Invoice',
      purchase: 'Purchase Order',
    }

    // Determine payment status
    let paymentStatus: 'Paid' | 'Unpaid' | 'Partially Refunded' | 'Refunded' = 
      (registration.paymentStatus as 'Paid' | 'Unpaid' | 'Partially Refunded' | 'Refunded') || 'Unpaid'
    
    if (!registration.paymentStatus) {
      if (registration.paymentMethod === 'credit' || registration.paymentMethod === 'purchase') {
        paymentStatus = 'Paid'
      } else {
        paymentStatus = 'Unpaid'
      }
    }

    // Get order status - use stored orderStatus if available, otherwise default to Incomplete
    // Order status is now independent from payment status
    let status: 'Completed' | 'Incomplete' | 'Cancelled' = 
      (registration.orderStatus as 'Completed' | 'Incomplete' | 'Cancelled') || 'Incomplete'

    const order = {
      id: displayId, // Display ID (numeric like 1, 2, 3...)
      registrationId: registration.id, // Actual MongoDB ID
      name: registration.name,
      email: registration.email,
      company: registration.company,
      title: registration.title,
      designation: registration.designation,
      courseTitle: registration.courseTitle,
      courseId: registration.courseId,
      date: formattedDate,
      rawDate: date,
      scheduleDate,
      scheduleId: registration.scheduleId,
      method: paymentMethodMap[registration.paymentMethod] || registration.paymentMethod,
      paymentMethod: registration.paymentMethod,
      paymentStatus,
      status,
      total: schedule?.fee || 0,
      // Billing/Shipping Information
      address: registration.address,
      city: registration.city,
      country: registration.country,
      telephone: registration.telephone,
      telephoneCountryCode: registration.telephoneCountryCode,
      mobile: registration.mobile,
      mobileCountryCode: registration.mobileCountryCode,
      differentBilling: registration.differentBilling,
      // Schedule and Program Info
      schedule: schedule ? {
        id: schedule.id,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        venue: schedule.venue,
        fee: schedule.fee,
        status: schedule.status,
        program: schedule.program,
      } : null,
      // Metadata
      submittedAt: registration.submittedAt,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PATCH - Update order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Build update data object
    const updateData: any = {}

    // Handle payment status update (independent from order status)
    if (body.paymentStatus !== undefined) {
      const validStatuses = ['Paid', 'Unpaid', 'Partially Refunded', 'Refunded']
      if (!validStatuses.includes(body.paymentStatus)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment status' },
          { status: 400 }
        )
      }
      updateData.paymentStatus = body.paymentStatus
    }

    // Handle order status update (independent from payment status)
    let statusChangedToCompleted = false
    if (body.status !== undefined) {
      const validStatuses = ['Completed', 'Incomplete', 'Cancelled']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid order status' },
          { status: 400 }
        )
      }
      
      // Check if status is changing to Completed
      const currentRegistration = await prisma.courseRegistration.findUnique({
        where: { id },
        select: { orderStatus: true },
      })
      
      if (currentRegistration && currentRegistration.orderStatus !== 'Completed' && body.status === 'Completed') {
        statusChangedToCompleted = true
      }
      
      updateData.orderStatus = body.status
    }

    // Update billing/shipping information
    if (body.address !== undefined) updateData.address = body.address
    if (body.city !== undefined) updateData.city = body.city
    if (body.country !== undefined) updateData.country = body.country
    if (body.telephone !== undefined) updateData.telephone = body.telephone
    if (body.mobile !== undefined) updateData.mobile = body.mobile
    if (body.email !== undefined) updateData.email = body.email
    if (body.name !== undefined) updateData.name = body.name
    if (body.company !== undefined) updateData.company = body.company

    // Update the course registration
    const updatedRegistration = await prisma.courseRegistration.update({
      where: { id },
      data: updateData,
    })

    // Fetch schedule separately if scheduleId exists
    let schedule = null
    let programName = null
    if (updatedRegistration.scheduleId) {
      schedule = await prisma.schedule.findUnique({
        where: { id: updatedRegistration.scheduleId },
        select: {
          id: true,
          fee: true,
          programId: true,
        },
      })

      // Fetch program if programId exists
      if (schedule?.programId) {
        const program = await prisma.program.findUnique({
          where: { id: schedule.programId },
          select: {
            programName: true,
          },
        })
        if (program) {
          programName = program.programName
        }
      }
    }

    // Generate invoice when order status changes to Completed
    if (statusChangedToCompleted) {
      try {
        // Check if invoice already exists for this registration
        const existingInvoice = await prisma.invoice.findFirst({
          where: { courseRegistrationId: id },
        })

        // Only create invoice if it doesn't exist
        if (!existingInvoice) {
          const amount = schedule?.fee || 0

          await createInvoice({
            courseId: updatedRegistration.courseId || null,
            scheduleId: updatedRegistration.scheduleId || null,
            courseRegistrationId: id,
            userId: null,
            amount,
            email: updatedRegistration.email,
            name: updatedRegistration.name,
            courseTitle: updatedRegistration.courseTitle || programName || null,
            address: updatedRegistration.address || null,
            city: updatedRegistration.city || null,
            country: updatedRegistration.country || null,
          })

          console.log(`✅ Invoice generated for order ${id} when status changed to Completed`)
        } else {
          console.log(`ℹ️ Invoice already exists for order ${id}, skipping generation`)
        }
      } catch (invoiceError) {
        console.error('Error generating invoice when order status changed to Completed:', invoiceError)
        // Don't fail the order update if invoice generation fails
        // The order status is already updated
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedRegistration,
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE - Move order to trash (soft delete or mark as deleted)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // For now, we'll just update the status to Cancelled
    // In a full implementation, you might want to add a deletedAt field
    const updatedRegistration = await prisma.courseRegistration.update({
      where: { id },
      data: {
        // You could add a deleted flag here if needed
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedRegistration,
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
