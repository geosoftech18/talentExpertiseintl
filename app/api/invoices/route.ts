import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInvoice } from '@/lib/services/invoice-service'

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { amount, email, name } = body

    if (!amount || !email || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: amount, email, name' },
        { status: 400 }
      )
    }

    // Create invoice using service
    const result = await createInvoice({
      courseId: body.courseId || null,
      scheduleId: body.scheduleId || null,
      courseRegistrationId: body.courseRegistrationId || null,
      userId: body.userId || null,
      amount,
      email,
      name,
      courseTitle: body.courseTitle || null,
      address: body.address || null,
      city: body.city || null,
      country: body.country || null,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/invoices
 * Get invoices (with optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (userId) where.userId = userId
    if (status) where.status = status

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}


