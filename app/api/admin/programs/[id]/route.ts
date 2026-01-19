import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/programs/[id]
 * Fetch a single program by ID with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        courseOutline: {
          orderBy: { day: 'asc' },
        },
        certifications: true,
        faqs: true,
      },
    })

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: program,
    })
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch program' },
      { status: 500 }
    )
  }
}

