import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/certificates
 * Fetch all active certificates for public certificates page
 */
export async function GET(request: NextRequest) {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        status: 'Active', // Only return active certificates
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: certificates,
    })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificates' },
      { status: 500 }
    )
  }
}

