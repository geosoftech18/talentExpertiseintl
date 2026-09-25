import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInvoice, regenerateInvoicePdf } from '@/lib/services/invoice-service'
import { sendEmail } from '@/lib/email'
import {
  generateOrderNotificationEmailHTML,
  generateOrderNotificationEmailText,
} from '@/lib/utils/order-notification-email'

async function resolveInvoiceCustomer(registration: {
  email: string
  address: string | null
  courseId: string | null
}) {
  let invoiceEmail = registration.email
  let invoiceAddress = registration.address || null

  try {
    const invoiceRequest = await prisma.invoiceRequest.findFirst({
      where: {
        email: registration.email,
        courseId: registration.courseId,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (invoiceRequest) {
      invoiceEmail = invoiceRequest.invoiceEmail || invoiceRequest.email
      invoiceAddress =
        invoiceRequest.invoiceAddress || invoiceRequest.address || invoiceAddress
    }
  } catch {
    // Fall back to registration data
  }

  return { invoiceEmail, invoiceAddress }
}

// POST - Execute order action
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    const registration = await prisma.courseRegistration.findUnique({
      where: { id },
    })

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Fetch schedule separately if scheduleId exists
    let schedule = null
    let programName = null
    if (registration.scheduleId) {
      schedule = await prisma.schedule.findUnique({
        where: { id: registration.scheduleId },
        select: {
          id: true,
          fee: true,
          programId: true,
          venue: true,
          startDate: true,
          endDate: true,
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

    // Handle different actions
    switch (action) {
      case 'mark_completed':
        // Update order status to Completed (independent from payment status)
        await prisma.courseRegistration.update({
          where: { id },
          data: { orderStatus: 'Completed' },
        })

        // Generate invoice when order is marked as completed (only for paid orders)
        try {
          // Only generate invoice for paid orders
          const paymentStatus = registration.paymentStatus || 'Unpaid'
          if (paymentStatus.toUpperCase() !== 'PAID') {
            console.log(`ℹ️ Invoice not generated for order ${id}: payment status is ${paymentStatus} (only paid orders generate invoices)`)
            break
          }

          // Check if invoice already exists for this registration
          const existingInvoice = await prisma.invoice.findFirst({
            where: { courseRegistrationId: id },
          })

          if (existingInvoice) {
            console.log(`ℹ️ Invoice already exists for order ${id}, skipping generation`)
            break
          }

          // Try to find invoice request to get company email/address
          let invoiceEmail = registration.email
          let invoiceAddress = registration.address || null
          
          try {
            const invoiceRequest = await prisma.invoiceRequest.findFirst({
              where: {
                email: registration.email,
                courseId: registration.courseId,
                status: 'APPROVED',
              },
              orderBy: { createdAt: 'desc' },
            })

            if (invoiceRequest) {
              // Use company email/address if available, otherwise use user email/address
              invoiceEmail = invoiceRequest.invoiceEmail || invoiceRequest.email
              invoiceAddress = invoiceRequest.invoiceAddress || invoiceRequest.address || invoiceAddress
            }
          } catch (error) {
            console.log('Could not find invoice request, using registration data')
          }

          const amount = schedule?.fee ? schedule.fee * (registration.participants || 1) : 0

          if (amount <= 0) {
            console.warn(`⚠️ Cannot generate invoice for order ${id}: amount is 0 or invalid`)
          } else {
            const invoiceResult = await createInvoice({
              courseId: registration.courseId || null,
              scheduleId: registration.scheduleId || null,
              courseRegistrationId: id,
              userId: null,
              amount,
              email: invoiceEmail,
              name: registration.name,
              courseTitle: registration.courseTitle || programName || null,
              address: invoiceAddress,
              city: registration.city || null,
              country: registration.country || null,
              participants: registration.participants || 1,
              paymentStatus: paymentStatus,
            })

            console.log(`✅ Invoice generated for order ${id} when marked as completed: ${invoiceResult.invoiceNo} (sent to ${invoiceEmail})`)
          }
        } catch (invoiceError) {
          console.error('Error generating invoice when marking order as completed:', invoiceError)
          console.error('Invoice error details:', {
            message: invoiceError instanceof Error ? invoiceError.message : String(invoiceError),
            stack: invoiceError instanceof Error ? invoiceError.stack : undefined,
          })
          // Don't fail the order update if invoice generation fails
          // The order status is already updated
        }
        break

      case 'mark_incomplete':
        // Update order status to Incomplete (independent from payment status)
        await prisma.courseRegistration.update({
          where: { id },
          data: { orderStatus: 'Incomplete' },
        })
        break

      case 'mark_cancelled':
        // Update order status to Cancelled (independent from payment status)
        await prisma.courseRegistration.update({
          where: { id },
          data: { orderStatus: 'Cancelled' },
        })
        break

      case 'notify_customer':
        // Send order status notification email to customer
        try {
          // Get venue information from schedule (venue is stored as string in Schedule model)
          const venue = schedule?.venue || null
          // Use registration's city/country for location info
          const venueCity = registration.city || null
          const venueCountry = registration.country || null

          // Get amount from schedule or set to null
          const amount = schedule?.fee || null

          // Generate email content
          const emailHtml = generateOrderNotificationEmailHTML({
            customerName: registration.name,
            orderId: id.substring(0, 8).toUpperCase(), // Short order ID for display
            courseTitle: registration.courseTitle || programName || null,
            orderStatus: registration.orderStatus || 'Incomplete',
            paymentStatus: registration.paymentStatus || null,
            paymentMethod: registration.paymentMethod || 'N/A',
            amount,
            scheduleStartDate: schedule?.startDate ? schedule.startDate.toISOString() : null,
            scheduleEndDate: schedule?.endDate ? schedule.endDate.toISOString() : null,
            venue,
            city: venueCity || registration.city || null,
            country: venueCountry || registration.country || null,
            companyName: registration.company || undefined,
            submittedDate: (registration.submittedAt || registration.createdAt).toISOString(),
          })

          const emailText = generateOrderNotificationEmailText({
            customerName: registration.name,
            orderId: id.substring(0, 8).toUpperCase(),
            courseTitle: registration.courseTitle || programName || null,
            orderStatus: registration.orderStatus || 'Incomplete',
            paymentStatus: registration.paymentStatus || null,
            paymentMethod: registration.paymentMethod || 'N/A',
            amount,
            scheduleStartDate: schedule?.startDate ? schedule.startDate.toISOString() : null,
            scheduleEndDate: schedule?.endDate ? schedule.endDate.toISOString() : null,
            venue,
            city: venueCity || registration.city || null,
            country: venueCountry || registration.country || null,
            companyName: registration.company || undefined,
            submittedDate: (registration.submittedAt || registration.createdAt).toISOString(),
          })

          // Send email
          const emailSent = await sendEmail({
            to: registration.email,
            subject: `Order Status Update - ${registration.courseTitle || 'Your Order'}`,
            html: emailHtml,
            text: emailText,
          })

          if (!emailSent) {
            console.warn(`⚠️ Order notification email failed to send to ${registration.email}`)
            // Still return success, but log the warning
          } else {
            console.log(`✅ Order notification email sent successfully to ${registration.email}`)
          }
        } catch (emailError) {
          console.error('Error sending order notification email:', emailError)
          // Don't fail the action if email fails
          // Log error but continue
        }
        break

      case 'generate_invoice':
      case 'send_invoice':
      case 'regenerate_invoice': {
        const existingInvoice = await prisma.invoice.findFirst({
          where: { courseRegistrationId: id },
          orderBy: { createdAt: 'desc' },
        })

        // Regenerate PDF (+ email for send_invoice) when invoice already exists
        if (existingInvoice && (action === 'regenerate_invoice' || action === 'send_invoice')) {
          try {
            const result = await regenerateInvoicePdf(existingInvoice.id, {
              sendEmail: action === 'send_invoice',
            })
            return NextResponse.json({
              success: true,
              message:
                action === 'send_invoice'
                  ? `Invoice ${result.invoiceNo} emailed successfully`
                  : `Invoice ${result.invoiceNo} PDF regenerated`,
              data: result,
            })
          } catch (invoiceError) {
            const msg =
              invoiceError instanceof Error
                ? invoiceError.message
                : 'Failed to regenerate invoice'
            return NextResponse.json({ success: false, error: msg }, { status: 500 })
          }
        }

        if (existingInvoice && action === 'generate_invoice') {
          return NextResponse.json({
            success: true,
            message: `Invoice already exists (${existingInvoice.invoiceNo})`,
            data: { invoiceId: existingInvoice.id, invoiceNo: existingInvoice.invoiceNo },
          })
        }

        // Create new invoice (admin may generate for unpaid → PENDING)
        try {
          const { invoiceEmail, invoiceAddress } = await resolveInvoiceCustomer({
            email: registration.email,
            address: registration.address || null,
            courseId: registration.courseId || null,
          })

          const unitFee = schedule?.fee ?? 0
          if (unitFee <= 0) {
            return NextResponse.json(
              {
                success: false,
                error:
                  'Cannot generate invoice: schedule fee is missing or zero. Set a fee on the schedule first.',
              },
              { status: 400 }
            )
          }

          const paymentStatus = registration.paymentStatus || 'Unpaid'
          const invoiceResult = await createInvoice({
            courseId: registration.courseId || null,
            scheduleId: registration.scheduleId || null,
            courseRegistrationId: id,
            userId: null,
            amount: unitFee,
            email: invoiceEmail,
            name: registration.name,
            courseTitle: registration.courseTitle || programName || null,
            address: invoiceAddress,
            city: registration.city || null,
            country: registration.country || null,
            participants: registration.participants || 1,
            paymentStatus,
            allowUnpaid: true,
            skipEmail: false,
          })

          return NextResponse.json({
            success: true,
            message: `Invoice ${invoiceResult.invoiceNo} generated successfully`,
            data: invoiceResult,
          })
        } catch (invoiceError) {
          const msg =
            invoiceError instanceof Error ? invoiceError.message : 'Failed to generate invoice'
          return NextResponse.json({ success: false, error: msg }, { status: 500 })
        }
      }

      case 'send_email':
        // Placeholder for sending email
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Action "${action}" executed successfully`,
    })
  } catch (error) {
    console.error('Error executing order action:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to execute order action'
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}

