import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

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

      // Create course registration with "In Progress" status and "Unpaid" payment status
      // Invoice will be generated later when admin changes payment status to "Paid" or order status to "Completed"
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

      // Store company invoice details in a custom field or note for later use when generating invoice
      // We'll use the invoice request data when generating invoice later
      // Note: Invoice will be generated when payment status changes to "Paid" or order status to "Completed"

      return NextResponse.json({
        success: true,
        message: 'Invoice request approved and order created. Invoice will be generated when payment status is changed to "Paid" or order status to "Completed".',
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

      // Send rejection email to user with all details
      try {
        const rejectionEmailHtml = generateInvoiceRejectionEmail({
          customerName: invoiceRequest.name,
          courseTitle: invoiceRequest.courseTitle || 'Course Registration',
          invoiceRequestId: invoiceRequest.id,
          // User Details
          title: invoiceRequest.title || '',
          name: invoiceRequest.name,
          email: invoiceRequest.email,
          designation: invoiceRequest.designation || '',
          company: invoiceRequest.company || '',
          address: invoiceRequest.address,
          city: invoiceRequest.city,
          country: invoiceRequest.country,
          telephone: `${invoiceRequest.telephoneCountryCode} ${invoiceRequest.telephone}`,
          mobile: invoiceRequest.mobile ? `${invoiceRequest.mobileCountryCode || invoiceRequest.telephoneCountryCode} ${invoiceRequest.mobile}` : '',
          // Course Details
          participants: invoiceRequest.participants || 1,
          amount: invoiceRequest.amount,
          perParticipantAmount: invoiceRequest.amount / (invoiceRequest.participants || 1),
          // Rejection Details
          rejectionReason: rejectionReason || 'No reason provided',
          rejectedAt: new Date(),
        })

        await sendEmail({
          to: invoiceRequest.email,
          subject: `Invoice Request Rejected - ${invoiceRequest.courseTitle || 'Course Registration'}`,
          html: rejectionEmailHtml,
          text: `Your invoice request for ${invoiceRequest.courseTitle || 'Course Registration'} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        })

        console.log(`✅ Rejection email sent successfully to ${invoiceRequest.email}`)
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError)
        // Don't fail the rejection if email fails
      }

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

/**
 * Generate HTML email for invoice request rejection notification
 */
function generateInvoiceRejectionEmail(data: {
  customerName: string
  courseTitle: string
  invoiceRequestId: string
  title: string
  name: string
  email: string
  designation: string
  company: string
  address: string
  city: string
  country: string
  telephone: string
  mobile: string
  participants: number
  amount: number
  perParticipantAmount: number
  rejectionReason: string
  rejectedAt: Date
}): string {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const companyName = process.env.COMPANY_NAME || 'Talent Expertise Institute'
  const companyEmail = process.env.COMPANY_EMAIL || 'info@example.com'
  const companyPhone = process.env.COMPANY_PHONE || '+971 XX XXX XXXX'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .section-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; font-size: 16px; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: bold; color: #4b5563; font-size: 13px; }
        .field-value { color: #111827; margin-left: 8px; }
        .rejection-box { background: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .rejection-title { font-weight: bold; color: #dc2626; font-size: 16px; margin-bottom: 10px; }
        .footer { margin-top: 20px; padding: 15px; background: #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        .contact-info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice Request Rejected</h1>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          
          <p>We regret to inform you that your invoice request has been rejected. Please find the details below:</p>

          <div class="rejection-box">
            <div class="rejection-title">Rejection Reason</div>
            <p style="color: #991b1b; margin: 0;">${data.rejectionReason}</p>
          </div>

          <div class="section">
            <div class="section-title">Course Information</div>
            <div class="field">
              <span class="field-label">Course Title:</span>
              <span class="field-value">${data.courseTitle}</span>
            </div>
            <div class="field">
              <span class="field-label">Invoice Request ID:</span>
              <span class="field-value">${data.invoiceRequestId.slice(-8).toUpperCase()}</span>
            </div>
            <div class="field">
              <span class="field-label">Number of Participants:</span>
              <span class="field-value">${data.participants}</span>
            </div>
            <div class="field">
              <span class="field-label">Fee per Participant:</span>
              <span class="field-value">$${data.perParticipantAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="field">
              <span class="field-label">Total Amount:</span>
              <span class="field-value">$${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Your Registration Details</div>
            ${data.title ? `<div class="field"><span class="field-label">Title:</span><span class="field-value">${data.title}</span></div>` : ''}
            <div class="field">
              <span class="field-label">Full Name:</span>
              <span class="field-value">${data.name}</span>
            </div>
            <div class="field">
              <span class="field-label">Email:</span>
              <span class="field-value">${data.email}</span>
            </div>
            ${data.designation ? `<div class="field"><span class="field-label">Designation:</span><span class="field-value">${data.designation}</span></div>` : ''}
            ${data.company ? `<div class="field"><span class="field-label">Company:</span><span class="field-value">${data.company}</span></div>` : ''}
            <div class="field">
              <span class="field-label">Address:</span>
              <span class="field-value">${data.address}</span>
            </div>
            <div class="field">
              <span class="field-label">City:</span>
              <span class="field-value">${data.city}</span>
            </div>
            <div class="field">
              <span class="field-label">Country:</span>
              <span class="field-value">${data.country}</span>
            </div>
            <div class="field">
              <span class="field-label">Telephone:</span>
              <span class="field-value">${data.telephone}</span>
            </div>
            ${data.mobile ? `<div class="field"><span class="field-label">Mobile:</span><span class="field-value">${data.mobile}</span></div>` : ''}
          </div>

          <div class="contact-info">
            <p style="margin: 0 0 10px 0;"><strong>If you have any questions or would like to discuss this decision, please contact us:</strong></p>
            <p style="margin: 5px 0;">Email: ${companyEmail}</p>
            <p style="margin: 5px 0;">Phone: ${companyPhone}</p>
          </div>

          <p style="margin-top: 20px;">Thank you for your interest in our courses.</p>
          
          <p>Best regards,<br>${companyName}</p>
        </div>
        <div class="footer">
          <p>This is an automated notification regarding your invoice request.</p>
          <p>Rejected on: ${formatDate(data.rejectedAt)}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

