import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/invoices
 * Fetch all invoices with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''
    const overdue = searchParams.get('overdue') === 'true'

    // Build where clause
    const where: any = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    // Search filter - Prisma MongoDB supports contains but case-sensitive
    // We'll filter in application layer for case-insensitive search
    // Note: For better performance, you could use MongoDB aggregation pipeline
    if (search) {
      // Basic contains search (case-sensitive in MongoDB)
      where.OR = [
        { invoiceNo: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { courseTitle: { contains: search } },
        { transactionId: { contains: search } },
      ]
    }

    // Overdue filter (dueDate < today and status = PENDING)
    if (overdue) {
      where.status = 'PENDING'
      where.dueDate = {
        lt: new Date(),
      }
    }

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

