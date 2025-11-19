import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/invoices/by-registration/[registrationId]
 * Get invoice by course registration ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params

    const invoice = await prisma.invoice.findFirst({
      where: { courseRegistrationId: registrationId },
      orderBy: { createdAt: 'desc' }, // Get the latest invoice if multiple exist
    })

    if (!invoice) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error('Error fetching invoice by registration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

