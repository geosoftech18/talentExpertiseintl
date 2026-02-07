import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
// Invoice generation removed - invoices are now generated when order status changes to "Completed"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get user session if logged in (optional - for backward compatibility)
    let userId: string | null = null
    try {
      const session = await auth()
      if (session?.user?.id) {
        // Validate that userId is a valid MongoDB ObjectID (24 hex characters)
        const objectIdPattern = /^[0-9a-fA-F]{24}$/
        if (objectIdPattern.test(session.user.id)) {
          userId = session.user.id
        } else {
          // If userId is not a valid ObjectID (e.g., UUID format), skip it
          console.warn('Invalid userId format (not MongoDB ObjectID):', session.user.id)
          userId = null
        }
      }
    } catch (error) {
      // If session check fails, continue without userId (anonymous registration)
      console.log('No user session found, creating anonymous registration')
    }

    // If payment method is "invoice", create an InvoiceRequest instead of direct registration
    if (body.paymentMethod === 'invoice') {
      // Get schedule fee if scheduleId is provided
      let perParticipantAmount = 0
      if (body.scheduleId) {
        const schedule = await prisma.schedule.findUnique({
          where: { id: body.scheduleId },
          select: { fee: true },
        })
        if (schedule?.fee) {
          perParticipantAmount = schedule.fee
        }
      }

      // Get number of participants (default to 1)
      const participants = body.participants ? parseInt(body.participants) : 1
      const totalAmount = perParticipantAmount * participants

      // Create invoice request with company details
      // Note: InvoiceRequest doesn't have userId field, but when approved and converted to CourseRegistration, it will be linked
      const invoiceRequest = await prisma.invoiceRequest.create({
        data: {
          scheduleId: body.scheduleId || null,
          courseId: body.courseId || null,
          courseTitle: body.courseTitle || null,
          title: body.title || null,
          name: body.name,
          email: body.email, // User email (always use the original user email)
          designation: body.designation || null,
          company: body.company || null,
          address: body.address,
          city: body.city,
          country: body.country,
          telephone: body.telephone,
          telephoneCountryCode: body.telephoneCountryCode || '+971',
          mobile: body.mobile || null,
          mobileCountryCode: body.mobileCountryCode || null,
          // Company Information (from step 3)
          contactPerson: body.contactPerson || null,
          department: body.department || null,
          invoiceEmail: body.invoiceEmail || null, // Company email (don't fall back to user email)
          invoiceAddress: body.invoiceAddress || null, // Company address (don't fall back to user address)
          amount: totalAmount,
          participants: participants,
          status: 'PENDING',
        },
      })

      // Send confirmation email to user
      try {
        const userConfirmationEmailHtml = generateInvoiceRequestConfirmationEmail({
          customerName: body.name,
          courseTitle: body.courseTitle || 'Course Registration',
          invoiceRequestId: invoiceRequest.id,
          participants: participants,
          amount: totalAmount,
          perParticipantAmount: perParticipantAmount,
          submittedAt: invoiceRequest.submittedAt,
        })

        await sendEmail({
          to: body.email,
          subject: `Invoice Request Submitted - ${body.courseTitle || 'Course Registration'}`,
          html: userConfirmationEmailHtml,
          text: `Your invoice request for ${body.courseTitle || 'Course Registration'} has been submitted successfully. Request ID: ${invoiceRequest.id}. Amount: $${totalAmount.toFixed(2)} for ${participants} participant(s). We will review your request and get back to you soon.`,
        })
        console.log(`✅ User confirmation email sent successfully to ${body.email}`)
      } catch (emailError) {
        console.error('Error sending user confirmation email:', emailError)
        // Don't fail the request if email fails
      }

      // Send notification email to company (if company email is provided and different from user email)
      const companyEmail = body.invoiceEmail
      if (companyEmail && companyEmail.trim() && companyEmail !== body.email) {
        try {
          const companyNotificationEmailHtml = generateInvoiceRequestCompanyNotificationEmail({
            companyName: body.company || 'Company',
            contactPerson: body.contactPerson || body.name,
            courseTitle: body.courseTitle || 'Course Registration',
            invoiceRequestId: invoiceRequest.id,
            // User Details
            userName: body.name,
            userTitle: body.title || '',
            userEmail: body.email,
            userDesignation: body.designation || '',
            // Course Details
            participants: participants,
            amount: totalAmount,
            perParticipantAmount: perParticipantAmount,
            submittedAt: invoiceRequest.submittedAt,
          })

          await sendEmail({
            to: companyEmail,
            subject: `Invoice Request Submitted - ${body.courseTitle || 'Course Registration'}`,
            html: companyNotificationEmailHtml,
            text: `An invoice request has been submitted for ${body.courseTitle || 'Course Registration'} by ${body.name} (${body.email}). Amount: $${totalAmount.toFixed(2)} for ${participants} participant(s).`,
          })
          console.log(`✅ Company notification email sent successfully to ${companyEmail}`)
        } catch (emailError) {
          console.error('Error sending company notification email:', emailError)
          // Don't fail the request if email fails
        }
      }

      // Send notification email to owner/admin with user and company details
      const adminEmail = process.env.ADMIN_EMAIL || process.env.COMPANY_EMAIL || 'info@example.com'
      try {
        const invoiceRequestEmailHtml = generateInvoiceRequestNotificationEmail({
          invoiceRequestId: invoiceRequest.id,
          courseTitle: body.courseTitle || 'Course Registration',
          // User Details
          userName: body.name,
          userTitle: body.title || '',
          userEmail: body.email,
          userDesignation: body.designation || '',
          userAddress: body.address,
          userCity: body.city,
          userCountry: body.country,
          userTelephone: `${body.telephoneCountryCode || '+971'} ${body.telephone}`,
          userMobile: body.mobile ? `${body.mobileCountryCode || '+971'} ${body.mobile}` : '',
          // Company Details (from step 3)
          contactPerson: body.contactPerson || '',
          department: body.department || '',
          companyName: body.company || '',
          companyEmail: body.invoiceEmail || body.email,
          companyAddress: body.invoiceAddress || body.address,
          companyMobile: body.mobile ? `${body.mobileCountryCode || '+971'} ${body.mobile}` : '',
          // Course Details
          participants: participants,
          amount: totalAmount,
          perParticipantAmount: perParticipantAmount,
          submittedAt: invoiceRequest.submittedAt,
        })

        await sendEmail({
          to: adminEmail,
          subject: `New Invoice Request - ${body.courseTitle || 'Course Registration'}`,
          html: invoiceRequestEmailHtml,
          text: `New invoice request received for ${body.courseTitle || 'Course Registration'} from ${body.name} (${body.email}). Amount: $${totalAmount.toFixed(2)} for ${participants} participant(s).`,
        })
        console.log(`✅ Admin notification email sent successfully to ${adminEmail}`)
      } catch (emailError) {
        console.error('Error sending invoice request notification email:', emailError)
        // Don't fail the request if email fails
      }

      return NextResponse.json(
        {
          success: true,
          data: invoiceRequest,
          message: 'Invoice request submitted. It will be reviewed and approved by admin.',
        },
        { status: 201 }
      )
    }

    // For other payment methods, create course registration directly
    const participants = body.participants ? parseInt(body.participants) : 1
    
    // Get schedule details for email
    let scheduleDetails = null
    if (body.scheduleId) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: body.scheduleId },
        select: { startDate: true, endDate: true, venue: true, city: true, country: true, fee: true },
      })
      if (schedule) {
        scheduleDetails = schedule
      }
    }
    
    const courseRegistration = await prisma.courseRegistration.create({
      data: {
        userId: userId || null, // Link to user account if logged in
        scheduleId: body.scheduleId || null,
        courseId: body.courseId || null,
        courseTitle: body.courseTitle || null,
        title: body.title || null,
        name: body.name,
        email: body.email,
        designation: body.designation || null,
        company: body.company || null,
        address: body.address,
        city: body.city,
        country: body.country,
        telephone: body.telephone,
        telephoneCountryCode: body.telephoneCountryCode || '+971',
        mobile: body.mobile || null,
        mobileCountryCode: body.mobileCountryCode || null,
        paymentMethod: body.paymentMethod,
        paymentStatus: null,
        orderStatus: 'Incomplete',
        participants: participants,
        differentBilling: body.differentBilling || false,
        acceptTerms: body.acceptTerms || false,
        captcha: body.captcha || null,
      },
    })

    // Send notification email to owner/admin with all registration details
    const adminEmail = process.env.ADMIN_EMAIL || process.env.COMPANY_EMAIL || 'info@example.com'
    try {
      const registrationEmailHtml = generateCourseRegistrationNotificationEmail({
        registrationId: courseRegistration.id,
        courseTitle: body.courseTitle || 'Course Registration',
        // Personal Information
        title: body.title || '',
        name: body.name,
        email: body.email,
        designation: body.designation || '',
        company: body.company || '',
        // Address Information
        address: body.address,
        city: body.city,
        country: body.country,
        telephone: `${body.telephoneCountryCode || '+971'} ${body.telephone}`,
        mobile: body.mobile ? `${body.mobileCountryCode || '+971'} ${body.mobile}` : '',
        // Course & Payment Information
        paymentMethod: body.paymentMethod,
        participants: participants,
        scheduleStartDate: scheduleDetails?.startDate,
        scheduleEndDate: scheduleDetails?.endDate,
        venue: scheduleDetails?.venue,
        scheduleCity: scheduleDetails?.city,
        scheduleCountry: scheduleDetails?.country,
        fee: scheduleDetails?.fee,
        submittedAt: courseRegistration.createdAt,
      })

      await sendEmail({
        to: adminEmail,
        subject: `New Course Registration - ${body.courseTitle || 'Course Registration'}`,
        html: registrationEmailHtml,
        text: `New course registration received for ${body.courseTitle || 'Course Registration'} from ${body.name} (${body.email}). Payment Method: ${body.paymentMethod}.`,
      })
    } catch (emailError) {
      console.error('Error sending course registration notification email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: courseRegistration,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating course registration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit registration' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [registrations, total] = await Promise.all([
      prisma.courseRegistration.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.courseRegistration.count(),
    ])

    // Fetch schedules for registrations that have scheduleId
    const scheduleIds = registrations
      .map((reg) => reg.scheduleId)
      .filter((id): id is string => id !== null)

    const schedules = scheduleIds.length > 0
      ? await prisma.schedule.findMany({
          where: { id: { in: scheduleIds } },
          select: { id: true, startDate: true, endDate: true },
        })
      : []

    const scheduleMap = new Map(schedules.map((s) => [s.id, s]))

    // Add schedule information to registrations
    const registrationsWithSchedules = registrations.map((reg) => {
      const schedule = reg.scheduleId ? scheduleMap.get(reg.scheduleId) : null
      return {
        ...reg,
        schedule: schedule ? {
          startDate: schedule.startDate,
          endDate: schedule.endDate,
        } : null,
      }
    })

    return NextResponse.json({
      success: true,
      data: registrationsWithSchedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching course registrations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

/**
 * Generate HTML email for course registration notification to admin
 */
function generateCourseRegistrationNotificationEmail(data: {
  registrationId: string
  courseTitle: string
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
  paymentMethod: string
  participants: number
  scheduleStartDate?: Date | null
  scheduleEndDate?: Date | null
  venue?: string | null
  scheduleCity?: string | null
  scheduleCountry?: string | null
  fee?: number | null
  submittedAt: Date
}): string {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'TBA'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; margin-top: 20px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; font-size: 16px; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: bold; color: #4b5563; }
        .field-value { color: #111827; }
        .footer { margin-top: 20px; padding: 15px; background: #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Course Registration</h1>
        </div>
        <div class="content">
          <div class="section">
            <div class="section-title">Course Information</div>
            <div class="field"><span class="field-label">Course:</span> <span class="field-value">${data.courseTitle}</span></div>
            <div class="field"><span class="field-label">Registration ID:</span> <span class="field-value">${data.registrationId}</span></div>
            ${data.scheduleStartDate ? `<div class="field"><span class="field-label">Start Date:</span> <span class="field-value">${formatDate(data.scheduleStartDate)}</span></div>` : ''}
            ${data.scheduleEndDate ? `<div class="field"><span class="field-label">End Date:</span> <span class="field-value">${formatDate(data.scheduleEndDate)}</span></div>` : ''}
            ${data.venue ? `<div class="field"><span class="field-label">Venue:</span> <span class="field-value">${data.venue}</span></div>` : ''}
            ${data.scheduleCity || data.scheduleCountry ? `<div class="field"><span class="field-label">Location:</span> <span class="field-value">${[data.scheduleCity, data.scheduleCountry].filter(Boolean).join(', ')}</span></div>` : ''}
            ${data.fee ? `<div class="field"><span class="field-label">Fee per Participant:</span> <span class="field-value">$${data.fee.toLocaleString()}</span></div>` : ''}
            <div class="field"><span class="field-label">Number of Participants:</span> <span class="field-value">${data.participants}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Personal Information</div>
            ${data.title ? `<div class="field"><span class="field-label">Title:</span> <span class="field-value">${data.title}</span></div>` : ''}
            <div class="field"><span class="field-label">Name:</span> <span class="field-value">${data.name}</span></div>
            <div class="field"><span class="field-label">Email:</span> <span class="field-value">${data.email}</span></div>
            ${data.designation ? `<div class="field"><span class="field-label">Designation:</span> <span class="field-value">${data.designation}</span></div>` : ''}
            ${data.company ? `<div class="field"><span class="field-label">Company:</span> <span class="field-value">${data.company}</span></div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">Contact Information</div>
            <div class="field"><span class="field-label">Address:</span> <span class="field-value">${data.address}</span></div>
            <div class="field"><span class="field-label">City:</span> <span class="field-value">${data.city}</span></div>
            <div class="field"><span class="field-label">Country:</span> <span class="field-value">${data.country}</span></div>
            <div class="field"><span class="field-label">Telephone:</span> <span class="field-value">${data.telephone}</span></div>
            ${data.mobile ? `<div class="field"><span class="field-label">Mobile:</span> <span class="field-value">${data.mobile}</span></div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="field"><span class="field-label">Payment Method:</span> <span class="field-value">${data.paymentMethod}</span></div>
          </div>

          <div class="section">
            <div class="field"><span class="field-label">Submitted At:</span> <span class="field-value">${formatDate(data.submittedAt)}</span></div>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from the course registration system.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML email for invoice request notification to admin (with user and company details)
 */
// Generate user confirmation email for invoice request submission
function generateInvoiceRequestConfirmationEmail(data: {
  customerName: string
  courseTitle: string
  invoiceRequestId: string
  participants: number
  amount: number
  perParticipantAmount: number
  submittedAt: Date
}): string {
  const formattedDate = new Date(data.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice Request Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0A3049 0%, #0A3049 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ffffff; margin: 0;">Invoice Request Confirmation</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Dear ${data.customerName},</p>
        
        <p>Thank you for submitting your invoice request. We have received your request and it is currently under review.</p>
        
        <div style="background: #ffffff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0A3049;">
          <h2 style="color: #0A3049; margin-top: 0;">Request Details</h2>
          <p><strong>Course:</strong> ${data.courseTitle}</p>
          <p><strong>Request ID:</strong> ${data.invoiceRequestId.substring(0, 8).toUpperCase()}</p>
          <p><strong>Participants:</strong> ${data.participants}</p>
          <p><strong>Amount per Participant:</strong> $${data.perParticipantAmount.toFixed(2)}</p>
          <p><strong>Total Amount:</strong> $${data.amount.toFixed(2)}</p>
          <p><strong>Submitted Date:</strong> ${formattedDate}</p>
        </div>
        
        <p>Our team will review your request and get back to you soon. You will receive a notification once your request has been processed.</p>
        
        <p>If you have any questions or need to make changes to your request, please contact us.</p>
        
        <p>Best regards,<br>Training Team</p>
      </div>
    </body>
    </html>
  `
}

// Generate company notification email for invoice request submission
function generateInvoiceRequestCompanyNotificationEmail(data: {
  companyName: string
  contactPerson: string
  courseTitle: string
  invoiceRequestId: string
  userName: string
  userTitle: string
  userEmail: string
  userDesignation: string
  participants: number
  amount: number
  perParticipantAmount: number
  submittedAt: Date
}): string {
  const formattedDate = new Date(data.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice Request Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0A3049 0%, #0A3049 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ffffff; margin: 0;">Invoice Request Notification</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Dear ${data.contactPerson},</p>
        
        <p>An invoice request has been submitted for <strong>${data.companyName}</strong> and requires your attention.</p>
        
        <div style="background: #ffffff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0A3049;">
          <h2 style="color: #0A3049; margin-top: 0;">Request Details</h2>
          <p><strong>Course:</strong> ${data.courseTitle}</p>
          <p><strong>Request ID:</strong> ${data.invoiceRequestId.substring(0, 8).toUpperCase()}</p>
          <p><strong>Participants:</strong> ${data.participants}</p>
          <p><strong>Amount per Participant:</strong> $${data.perParticipantAmount.toFixed(2)}</p>
          <p><strong>Total Amount:</strong> $${data.amount.toFixed(2)}</p>
          <p><strong>Submitted Date:</strong> ${formattedDate}</p>
        </div>
        
        <div style="background: #ffffff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0A3049;">
          <h2 style="color: #0A3049; margin-top: 0;">Submitted By</h2>
          <p><strong>Name:</strong> ${data.userTitle} ${data.userName}</p>
          <p><strong>Email:</strong> ${data.userEmail}</p>
          <p><strong>Designation:</strong> ${data.userDesignation || 'N/A'}</p>
        </div>
        
        <p>This invoice request is currently under review. You will be notified once the request has been processed.</p>
        
        <p>If you have any questions, please contact us.</p>
        
        <p>Best regards,<br>Training Team</p>
      </div>
    </body>
    </html>
  `
}

function generateInvoiceRequestNotificationEmail(data: {
  invoiceRequestId: string
  courseTitle: string
  userName: string
  userTitle: string
  userEmail: string
  userDesignation: string
  userAddress: string
  userCity: string
  userCountry: string
  userTelephone: string
  userMobile: string
  contactPerson: string
  department: string
  companyName: string
  companyEmail: string
  companyAddress: string
  companyMobile: string
  participants: number
  amount: number
  perParticipantAmount: number
  submittedAt: Date
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; margin-top: 20px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; font-size: 16px; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: bold; color: #4b5563; }
        .field-value { color: #111827; }
        .footer { margin-top: 20px; padding: 15px; background: #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Invoice Request</h1>
        </div>
        <div class="content">
          <div class="section">
            <div class="section-title">Course Information</div>
            <div class="field"><span class="field-label">Course:</span> <span class="field-value">${data.courseTitle}</span></div>
            <div class="field"><span class="field-label">Invoice Request ID:</span> <span class="field-value">${data.invoiceRequestId}</span></div>
            <div class="field"><span class="field-label">Number of Participants:</span> <span class="field-value">${data.participants}</span></div>
            <div class="field"><span class="field-label">Fee per Participant:</span> <span class="field-value">$${data.perParticipantAmount.toLocaleString()}</span></div>
            <div class="field"><span class="field-label">Total Amount:</span> <span class="field-value">$${data.amount.toLocaleString()}</span></div>
          </div>

          <div class="section">
            <div class="section-title">User Details</div>
            ${data.userTitle ? `<div class="field"><span class="field-label">Title:</span> <span class="field-value">${data.userTitle}</span></div>` : ''}
            <div class="field"><span class="field-label">Name:</span> <span class="field-value">${data.userName}</span></div>
            <div class="field"><span class="field-label">Email:</span> <span class="field-value">${data.userEmail}</span></div>
            ${data.userDesignation ? `<div class="field"><span class="field-label">Designation:</span> <span class="field-value">${data.userDesignation}</span></div>` : ''}
            <div class="field"><span class="field-label">Address:</span> <span class="field-value">${data.userAddress}</span></div>
            <div class="field"><span class="field-label">City:</span> <span class="field-value">${data.userCity}</span></div>
            <div class="field"><span class="field-label">Country:</span> <span class="field-value">${data.userCountry}</span></div>
            <div class="field"><span class="field-label">Telephone:</span> <span class="field-value">${data.userTelephone}</span></div>
            ${data.userMobile ? `<div class="field"><span class="field-label">Mobile:</span> <span class="field-value">${data.userMobile}</span></div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">Company Details</div>
            ${data.contactPerson ? `<div class="field"><span class="field-label">Contact Person:</span> <span class="field-value">${data.contactPerson}</span></div>` : ''}
            ${data.department ? `<div class="field"><span class="field-label">Department:</span> <span class="field-value">${data.department}</span></div>` : ''}
            ${data.companyName ? `<div class="field"><span class="field-label">Company Name:</span> <span class="field-value">${data.companyName}</span></div>` : ''}
            <div class="field"><span class="field-label">Company Email:</span> <span class="field-value">${data.companyEmail}</span></div>
            ${data.companyAddress ? `<div class="field"><span class="field-label">Company Address:</span> <span class="field-value">${data.companyAddress}</span></div>` : ''}
            ${data.companyMobile ? `<div class="field"><span class="field-label">Company Mobile:</span> <span class="field-value">${data.companyMobile}</span></div>` : ''}
          </div>

          <div class="section">
            <div class="field"><span class="field-label">Submitted At:</span> <span class="field-value">${formatDate(data.submittedAt)}</span></div>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from the invoice request system.</p>
          <p>Please review and approve/reject this request in the admin panel.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
