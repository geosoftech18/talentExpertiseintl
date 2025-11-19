import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils/slug'

/**
 * GET /api/schedules
 * Fetch all upcoming schedules for public display (no deduplication)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    // Only fetch upcoming schedules (startDate >= today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch all schedules with their programs - NO deduplication
    const schedules = await prisma.schedule.findMany({
      where: {
        status: { in: ['Open', 'Published'] },
        startDate: {
          gte: today, // Only upcoming schedules
        },
        program: {
          status: 'Published', // Only schedules for published programs
        },
      },
      select: {
        id: true,
        programId: true,
        programName: true,
        startDate: true,
        endDate: true,
        venue: true,
        fee: true,
        program: {
          select: {
            id: true,
            refCode: true,
            programName: true,
            category: true,
          },
        },
      },
      orderBy: { startDate: 'asc' }, // Order by earliest first
      take: limit,
    })

    // Transform schedules - include ALL schedules, no deduplication
    const transformedSchedules = schedules.map((schedule) => {
      const program = schedule.program

      return {
        id: `${program.id}-${schedule.id}`,
        scheduleId: schedule.id,
        programId: program.id,
        slug: generateSlug(program.programName),
        title: program.programName,
        courseCode: program.refCode,
        price: schedule.fee || 0,
        venue: schedule.venue || null,
        startDate: schedule.startDate ? schedule.startDate.toISOString().split('T')[0] : null,
        endDate: schedule.endDate ? schedule.endDate.toISOString().split('T')[0] : null,
      }
    })

    const response = NextResponse.json({
      success: true,
      data: transformedSchedules,
    })

    // Set cache headers for production performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')

    return response
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

