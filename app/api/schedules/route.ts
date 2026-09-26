import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils/slug'
import {
  getUpcomingMinStartDate,
  startOfLocalDay,
} from '@/lib/utils/course-visibility'

type ScheduleRow = {
  id: string
  programId: string
  programName: string | null
  startDate: Date
  endDate: Date | null
  venue: string
  fee: number | null
  isUpcomingProgram?: boolean
  program: {
    id: string
    refCode: string
    programName: string
    category: string
  }
}

function transformSchedule(schedule: ScheduleRow) {
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
    isUpcomingProgram: schedule.isUpcomingProgram === true,
  }
}

const programSelect = {
  id: true,
  refCode: true,
  programName: true,
  category: true,
}

const scheduleSelect = {
  id: true,
  programId: true,
  programName: true,
  startDate: true,
  endDate: true,
  venue: true,
  fee: true,
  isUpcomingProgram: true,
  program: { select: programSelect },
}

/**
 * GET /api/schedules
 * - Default: all future schedules (startDate >= today) — enquiry / general use
 * - upcomingPrograms / forCarousel: only startDate >= today + 14 days (Upcoming section)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const upcomingProgramsOnly = searchParams.get('upcomingPrograms') === 'true'
    const forCarousel = searchParams.get('forCarousel') === 'true'

    const today = startOfLocalDay()
    const minStartAfterLead = getUpcomingMinStartDate()

    const allFutureWhere = {
      status: { in: ['Open', 'Published'] as string[] },
      startDate: { gte: today },
      program: { status: 'Published' as const },
    }

    // Upcoming carousel: only programs that start 14+ days from today
    const upcomingWhere = {
      status: { in: ['Open', 'Published'] as string[] },
      startDate: { gte: minStartAfterLead },
      program: { status: 'Published' as const },
    }

    if (forCarousel) {
      const [allUpcoming, toggledUpcoming] = await Promise.all([
        prisma.schedule.findMany({
          where: upcomingWhere,
          select: scheduleSelect,
          orderBy: { startDate: 'asc' },
          take: Math.max(limit, 100),
        }),
        prisma.schedule.findMany({
          where: { ...upcomingWhere, isUpcomingProgram: true },
          select: scheduleSelect,
          orderBy: { startDate: 'asc' },
        }),
      ])

      const transformed = allUpcoming.map(transformSchedule)
      const sorted = transformed
        .filter((item) => item.startDate)
        .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())

      const topTen = sorted.slice(0, 10)
      const topTenIds = new Set(topTen.map((p) => p.id))

      const toggledExtras = toggledUpcoming
        .map(transformSchedule)
        .filter((p) => p.isUpcomingProgram && p.startDate && !topTenIds.has(p.id))
        .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())

      const merged = [...topTen, ...toggledExtras]

      const response = NextResponse.json({ success: true, data: merged })
      response.headers.set('Cache-Control', 'no-store')
      return response
    }

    const where = upcomingProgramsOnly
      ? { ...upcomingWhere, isUpcomingProgram: true }
      : allFutureWhere

    const schedules = await prisma.schedule.findMany({
      where,
      select: scheduleSelect,
      orderBy: { startDate: 'asc' },
      take: limit,
    })

    const transformedSchedules = schedules.map(transformSchedule)

    const response = NextResponse.json({
      success: true,
      data: transformedSchedules,
    })

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
