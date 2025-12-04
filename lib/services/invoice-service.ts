import { prisma } from '@/lib/prisma'
import { generateInvoicePDF } from '@/lib/utils/invoice-pdf'
import { sendEmail } from '@/lib/email'
import path from 'path'

/**
 * Generate next invoice number
 * Format: INV-YYYY-XXXX (e.g., INV-2025-0001)
 */
async function getNextInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()

  // Find or create counter for current year
  let counter = await prisma.invoiceCounter.findUnique({
    where: { year: currentYear },
  })

  if (!counter) {
    // Create new counter for this year
    counter = await prisma.invoiceCounter.create({
      data: {
        year: currentYear,
        sequence: 0,
      },
    })
  }

  // Increment sequence
  const updatedCounter = await prisma.invoiceCounter.update({
    where: { year: currentYear },
    data: {
      sequence: {
        increment: 1,
      },
    },
  })

  // Generate invoice number
  const invoiceNo = `INV-${currentYear}-${String(updatedCounter.sequence).padStart(4, '0')}`
  return invoiceNo
}

/**
 * Generate invoice email HTML template
 */
function generateInvoiceEmailHTML(
  invoiceNo: string,
  customerName: string,
  courseTitle: string,
  amount: number,
  dueDate: Date
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceNo}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Invoice Generated</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${customerName},</p>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Your invoice has been generated for the following course registration:
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Invoice Number:</strong> ${invoiceNo}</p>
          <p style="margin: 10px 0;"><strong>Course:</strong> ${courseTitle}</p>
          <p style="margin: 10px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p style="margin: 10px 0;"><strong>Due Date:</strong> ${dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">PENDING PAYMENT</span></p>
        </div>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Please find the detailed invoice PDF attached to this email. Kindly make the payment by the due date to avoid any late fees.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 14px; color: #6b7280;">
            If you have any questions, please contact us at ${process.env.COMPANY_EMAIL || 'info@example.com'}
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `
}

interface CreateInvoiceParams {
  courseId?: string | null
  scheduleId?: string | null
  courseRegistrationId?: string | null
  userId?: string | null
  amount: number
  email: string
  name: string
  courseTitle?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  participants?: number
  paymentStatus?: string // Only generate for paid orders
  skipEmail?: boolean // Skip sending invoice email (for attaching to other emails)
}

/**
 * Create invoice - core service function
 */
export async function createInvoice(params: CreateInvoiceParams) {
  const {
    courseId,
    scheduleId,
    courseRegistrationId,
    userId,
    amount,
    email,
    name,
    courseTitle,
    address,
    city,
    country,
    participants,
    paymentStatus,
  } = params

  // Only generate invoices for paid orders
  if (paymentStatus && paymentStatus.toUpperCase() !== 'PAID') {
    throw new Error('Invoices can only be generated for paid orders')
  }

  // Get course information if courseId is provided
  let courseInfo = courseTitle || 'Course Registration'
  if (courseId) {
    const course = await prisma.program.findUnique({
      where: { id: courseId },
      select: { programName: true },
    })
    if (course) {
      courseInfo = course.programName
    }
  }

  // Get schedule information and participants if scheduleId is provided
  let scheduleFee = amount
  let participantsCount = participants || 1
  if (scheduleId) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: { fee: true },
    })
    if (schedule?.fee) {
      scheduleFee = schedule.fee
    }
  }

  // Get participants from course registration if available
  if (courseRegistrationId) {
    const registration = await prisma.courseRegistration.findUnique({
      where: { id: courseRegistrationId },
    })
    if (registration && (registration as any).participants) {
      participantsCount = (registration as any).participants
    }
  }

  // Calculate total amount based on participants
  const unitPrice = scheduleFee
  const totalAmount = unitPrice * participantsCount

  // Generate invoice number
  const invoiceNo = await getNextInvoiceNumber()

  // Calculate dates
  const issueDate = new Date()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 7) // 7 days from now (for database record)

  // Create invoice record
  const invoice = await prisma.invoice.create({
    data: {
      userId: userId || null,
      courseId: courseId || null,
      courseRegistrationId: courseRegistrationId || null,
      invoiceNo,
      amount: totalAmount, // Store total amount
      status: 'PAID',
      issueDate,
      dueDate,
      customerName: name,
      customerEmail: email,
      customerAddress: address || null,
      customerCity: city || null,
      customerCountry: country || null,
      courseTitle: courseInfo,
      scheduleId: scheduleId || null,
    },
  })

  // Generate PDF
  const publicDir = path.join(process.cwd(), 'public')
  const invoicesDir = path.join(publicDir, 'invoices')
  const pdfFileName = `${invoiceNo}.pdf`
  const pdfPath = path.join(invoicesDir, pdfFileName)

  await generateInvoicePDF(
    {
      invoiceNo,
      issueDate,
      // dueDate is optional now - not shown in PDF
      customerName: name,
      customerEmail: email,
      customerAddress: address || undefined,
      customerCity: city || undefined,
      customerCountry: country || undefined,
      courseTitle: courseInfo,
      amount: totalAmount, // Total amount
      status: 'PAID',
      participants: participantsCount,
      unitPrice: unitPrice,
    },
    pdfPath
  )

  // Update invoice with PDF URL
  const pdfUrl = `/invoices/${pdfFileName}`
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl },
  })

  // Send invoice email unless skipped (for attaching to other emails)
  let emailSent = false
  if (!params.skipEmail) {
    // Generate email HTML
    const emailHtml = generateInvoiceEmailHTML(invoiceNo, name, courseInfo, totalAmount, dueDate)

    // Send email with PDF attachment
    emailSent = await sendEmail({
      to: email,
      subject: `Invoice ${invoiceNo} - ${courseInfo}`,
      html: emailHtml,
      text: `Invoice ${invoiceNo} for ${courseInfo}. Amount: $${totalAmount.toFixed(2)}${participantsCount > 1 ? ` (${participantsCount} participants × $${unitPrice.toFixed(2)})` : ''}. Please find the invoice PDF attached.`,
      attachments: [
        {
          filename: pdfFileName,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    })

    if (!emailSent) {
      console.warn(`⚠️ Invoice ${invoiceNo} created but email failed to send`)
      console.warn('💡 To enable email sending, configure an email provider in your .env file:')
      console.warn('   - RESEND_API_KEY (for Resend)')
      console.warn('   - SENDGRID_API_KEY (for SendGrid)')
      console.warn('   - SMTP_HOST, SMTP_USER, SMTP_PASSWORD (for SMTP)')
      console.warn('   See EMAIL_SETUP_INVOICE.md for setup instructions')
    } else {
      console.log(`✅ Invoice email sent successfully to ${email}`)
    }
  } else {
    console.log(`ℹ️ Invoice ${invoiceNo} created but email skipped (will be attached to order confirmation)`)
  }

  return {
    success: true,
    invoiceNo,
    invoiceId: invoice.id,
    pdfUrl,
    emailSent,
  }
}

