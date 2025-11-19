import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import path from 'path'
import fs from 'fs'

/**
 * POST /api/admin/invoices/resend/[id]
 * Resend invoice email to customer with PDF attachment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    if (!invoice.pdfUrl) {
      return NextResponse.json(
        { success: false, error: 'Invoice PDF not found' },
        { status: 404 }
      )
    }

    // Get PDF path
    const pdfPath = path.join(process.cwd(), 'public', invoice.pdfUrl)

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { success: false, error: 'Invoice PDF file not found on server' },
        { status: 404 }
      )
    }

    // Generate email HTML
    const emailHtml = generateInvoiceEmailHTML(
      invoice.invoiceNo,
      invoice.customerName,
      invoice.courseTitle || 'Course Registration',
      invoice.amount,
      invoice.dueDate
    )

    // Send email with PDF attachment
    const emailSent = await sendEmail({
      to: invoice.customerEmail,
      subject: `Invoice ${invoice.invoiceNo} - ${invoice.courseTitle || 'Course Registration'}`,
      html: emailHtml,
      text: `Invoice ${invoice.invoiceNo} for ${invoice.courseTitle || 'Course Registration'}. Amount: $${invoice.amount.toFixed(2)}. Due date: ${invoice.dueDate.toLocaleDateString()}. Please find the invoice PDF attached.`,
      attachments: [
        {
          filename: `${invoice.invoiceNo}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    })

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully',
    })
  } catch (error) {
    console.error('Error resending invoice email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to resend invoice email' },
      { status: 500 }
    )
  }
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
        <h1 style="color: white; margin: 0;">Invoice Reminder</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${customerName},</p>
        <p style="font-size: 16px; margin-bottom: 20px;">
          This is a reminder for your invoice:
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Invoice Number:</strong> ${invoiceNo}</p>
          <p style="margin: 10px 0;"><strong>Course:</strong> ${courseTitle}</p>
          <p style="margin: 10px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p style="margin: 10px 0;"><strong>Due Date:</strong> ${dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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

