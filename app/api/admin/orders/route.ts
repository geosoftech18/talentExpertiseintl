import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { generateOrderNotificationEmailHTML, generateOrderNotificationEmailText } from '@/lib/utils/order-notification-email'
import { createInvoice } from '@/lib/services/invoice-service'
import path from 'path'
import fs from 'fs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    // Fetch course registrations with schedule information
    const [registrations, total] = await Promise.all([
      prisma.courseRegistration.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          // We'll need to fetch schedule separately since there's no direct relation
        },
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
          select: { id: true, fee: true, status: true, startDate: true, endDate: true },
        })
      : []

    const scheduleMap = new Map(schedules.map((s) => [s.id, s]))

    // Transform registrations to orders
    const orders = registrations.map((reg, index) => {
      const schedule = reg.scheduleId ? scheduleMap.get(reg.scheduleId) : null
      const orderTotal = schedule?.fee || 0

      // Map payment method to display name
      const paymentMethodMap: Record<string, string> = {
        credit: 'Credit Card',
        bank: 'Bank Transfer',
        invoice: 'Invoice',
        purchase: 'Purchase Order',
      }

      // Use stored payment status if available, otherwise determine based on payment method
      let paymentStatus: 'Paid' | 'Unpaid' | 'Partially Refunded' | 'Refunded' = 
        (reg.paymentStatus as 'Paid' | 'Unpaid' | 'Partially Refunded' | 'Refunded') || 'Unpaid'
      
      // If no payment status is stored, calculate it based on payment method
      if (!reg.paymentStatus) {
        if (reg.paymentMethod === 'credit' || reg.paymentMethod === 'purchase') {
          paymentStatus = 'Paid'
        } else if (reg.paymentMethod === 'bank') {
          // Bank transfers might be paid or unpaid - default to unpaid for now
          paymentStatus = 'Unpaid'
        } else if (reg.paymentMethod === 'invoice') {
          paymentStatus = 'Unpaid'
        }
      }

      // Get order status - use stored orderStatus if available, otherwise default to Incomplete
      // Order status is now independent from payment status
      let status: 'Completed' | 'Incomplete' | 'Cancelled' = 
        (reg.orderStatus as 'Completed' | 'Incomplete' | 'Cancelled') || 'Incomplete'

      // Format date
      const date = new Date(reg.submittedAt || reg.createdAt)
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
          // Date range
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
          // Single date
          scheduleDate = scheduleStartDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        }
      }

      return {
        id: total - index, // Use reverse index for display ID
        registrationId: reg.id,
        name: reg.name,
        email: reg.email,
        company: reg.company,
        courseTitle: reg.courseTitle,
        date: formattedDate,
        rawDate: date,
        scheduleDate,
        method: paymentMethodMap[reg.paymentMethod] || reg.paymentMethod,
        paymentStatus,
        status,
        total: orderTotal,
        paymentMethod: reg.paymentMethod,
        scheduleId: reg.scheduleId,
        scheduleStatus: schedule?.status,
      }
    })

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields - mobile is now required instead of telephone
    if (!body.name || !body.email || !body.address || !body.city || !body.country || !body.mobile || !body.paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get schedule fee if scheduleId is provided
    let orderTotal = 0
    if (body.scheduleId) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: body.scheduleId },
        select: { fee: true, programName: true },
      })
      if (schedule?.fee) {
        orderTotal = schedule.fee * (body.participants || 1)
      }
      // Use schedule's programName if courseTitle is not provided
      if (!body.courseTitle && schedule?.programName) {
        body.courseTitle = schedule.programName
      }
    }

    // Get courseId from schedule if not provided
    let courseId = body.courseId
    if (!courseId && body.scheduleId) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: body.scheduleId },
        select: { programId: true },
      })
      if (schedule?.programId) {
        courseId = schedule.programId
      }
    }

    // Parse participants as integer, default to 1
    const participants = body.participants 
      ? (typeof body.participants === 'string' ? parseInt(body.participants, 10) : Number(body.participants))
      : 1
    
    // Ensure participants is a valid positive integer
    const validParticipants = isNaN(participants) || participants < 1 ? 1 : participants

    // Create course registration (order)
    const courseRegistration = await prisma.courseRegistration.create({
      data: {
        scheduleId: body.scheduleId || null,
        courseId: courseId || null,
        courseTitle: body.courseTitle || null,
        title: body.title || null,
        name: body.name,
        email: body.email,
        designation: body.designation || null,
        company: body.company || null,
        address: body.address,
        city: body.city,
        country: body.country,
        telephone: body.telephone || null,
        telephoneCountryCode: '+971', // Default country code
        mobile: body.mobile,
        mobileCountryCode: '+971', // Default country code
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentStatus || 'Unpaid',
        orderStatus: body.orderStatus || 'Incomplete',
        participants: validParticipants,
        differentBilling: body.differentBilling || false,
        acceptTerms: true, // Admin created orders are assumed to accept terms
        captcha: null,
      },
    })

    // Fetch schedule details for email
    let schedule = null
    let venue = null
    let venueCity = null
    let venueCountry = null
    let amount = null

    if (body.scheduleId) {
      schedule = await prisma.schedule.findUnique({
        where: { id: body.scheduleId },
        select: {
          fee: true,
          startDate: true,
          endDate: true,
          venue: true,
        },
      })

      if (schedule) {
        amount = schedule.fee ? schedule.fee * validParticipants : null
        
        // Parse venue to extract city and country
        if (schedule.venue) {
          venue = schedule.venue
          const venueParts = schedule.venue.split(',').map((p: string) => p.trim())
          if (venueParts.length >= 2) {
            venueCity = venueParts[0]
            venueCountry = venueParts[venueParts.length - 1]
          } else {
            venueCity = schedule.venue
          }
        }
      }
    }

    // Generate order ID for display (first 8 characters of registration ID)
    const orderId = courseRegistration.id.substring(0, 8).toUpperCase()

    // Check if invoice should be generated (Paid and Completed)
    const paymentStatus = body.paymentStatus || 'Unpaid'
    const orderStatus = body.orderStatus || 'Incomplete'
    const shouldGenerateInvoice = 
      paymentStatus.toUpperCase() === 'PAID' && 
      orderStatus.toUpperCase() === 'COMPLETED'

    // Generate invoice if order is Paid and Completed
    let invoicePdfPath = null
    let invoiceNo = null
    if (shouldGenerateInvoice && amount && amount > 0) {
      try {
        const invoiceResult = await createInvoice({
          courseId: courseId || null,
          scheduleId: body.scheduleId || null,
          courseRegistrationId: courseRegistration.id,
          userId: null,
          amount: amount,
          email: body.email,
          name: body.name,
          courseTitle: body.courseTitle || null,
          address: body.address || null,
          city: body.city || null,
          country: body.country || null,
          participants: validParticipants,
          paymentStatus: paymentStatus,
          skipEmail: true, // Skip invoice email - will attach to order confirmation email
        })

        invoiceNo = invoiceResult.invoiceNo
        invoicePdfPath = path.join(process.cwd(), 'public', invoiceResult.pdfUrl)
        
        console.log(`✅ Invoice generated for order: ${invoiceResult.invoiceNo}`)
      } catch (invoiceError) {
        console.error('Error generating invoice for order:', invoiceError)
        // Continue with order creation even if invoice generation fails
      }
    }

    // Generate email HTML and text
    const emailHtml = generateOrderNotificationEmailHTML({
      customerName: body.name,
      orderId: orderId,
      courseTitle: body.courseTitle || null,
      orderStatus: orderStatus,
      paymentStatus: paymentStatus,
      paymentMethod: body.paymentMethod,
      amount: amount,
      scheduleStartDate: schedule?.startDate ? schedule.startDate.toISOString() : null,
      scheduleEndDate: schedule?.endDate ? schedule.endDate.toISOString() : null,
      venue: venue,
      city: venueCity || body.city || null,
      country: venueCountry || body.country || null,
      companyName: body.company || undefined,
      submittedDate: courseRegistration.createdAt.toISOString(),
    })

    const emailText = generateOrderNotificationEmailText({
      customerName: body.name,
      orderId: orderId,
      courseTitle: body.courseTitle || null,
      orderStatus: orderStatus,
      paymentStatus: paymentStatus,
      paymentMethod: body.paymentMethod,
      amount: amount,
      scheduleStartDate: schedule?.startDate ? schedule.startDate.toISOString() : null,
      scheduleEndDate: schedule?.endDate ? schedule.endDate.toISOString() : null,
      venue: venue,
      city: venueCity || body.city || null,
      country: venueCountry || body.country || null,
      companyName: body.company || undefined,
      submittedDate: courseRegistration.createdAt.toISOString(),
    })

    // Prepare email attachments
    const emailAttachments = []
    if (invoicePdfPath && fs.existsSync(invoicePdfPath)) {
      emailAttachments.push({
        filename: `${invoiceNo}.pdf`,
        path: invoicePdfPath,
        contentType: 'application/pdf',
      })
    }

    // Send confirmation email with invoice attachment if available
    try {
      const emailSent = await sendEmail({
        to: body.email,
        subject: `Order Confirmation - ${body.courseTitle || 'Your Order'} | Order #${orderId}${invoiceNo ? ` | Invoice ${invoiceNo}` : ''}`,
        html: emailHtml,
        text: emailText,
        attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
      })

      if (!emailSent) {
        console.warn(`⚠️ Order created but confirmation email failed to send to ${body.email}`)
        console.warn('💡 To enable email sending, configure an email provider in your .env file')
      } else {
        console.log(`✅ Order confirmation email sent successfully to ${body.email}${invoiceNo ? ` with invoice ${invoiceNo} attached` : ''}`)
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: courseRegistration,
        message: 'Order created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

