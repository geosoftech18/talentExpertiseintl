import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils/slug'

/**
 * GET /api/courses
 * Fetch all published programs for public course listing
 * 
 * Production Performance:
 * - Cached for 60 seconds using HTTP cache headers
 * - Database queries are optimized with indexes
 * - Single query with relations instead of multiple queries
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const includeExpired = searchParams.get('includeExpired') === 'true'

    const where: any = {
      status: 'Published', // Only show published programs
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { programName: { contains: search, mode: 'insensitive' } },
        { refCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Optimized: Fetch schedules directly with program data using Prisma relations
    // Only fetch upcoming schedules (startDate >= today) unless includeExpired is true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Fetch schedules with their programs in a single optimized query
    // This is much faster than fetching separately and mapping
    const allSchedules = await prisma.schedule.findMany({
      where: {
        status: { in: ['Open', 'Published'] },
        ...(includeExpired ? {} : {
          startDate: {
            gte: today, // Only upcoming schedules
          },
        }),
        program: {
          status: 'Published', // Only schedules for published programs
          ...(category && category !== 'all' ? { category } : {}),
          ...(search ? {
            OR: [
              { programName: { contains: search, mode: 'insensitive' } },
              { refCode: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ]
          } : {}),
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
            duration: true,
            description: true,
            cardImageUrl: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    })

    // Transform schedules to course entries - much faster with direct relation access
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    // Use Map for O(1) duplicate checking instead of nested loops
    const seen = new Map<string, boolean>()
    const uniqueCourses = []
    
    for (const schedule of allSchedules) {
      const program = schedule.program
      
      // Skip if no program (shouldn't happen with proper relation, but safety check)
      if (!program) continue

      // Verify schedule is upcoming (double-check) - skip if includeExpired is false
      if (!schedule.startDate) continue
      const startDate = new Date(schedule.startDate)
      startDate.setHours(0, 0, 0, 0)
      if (!includeExpired && startDate < now) continue

      // Create duplicate key: name + date + venue
      const duplicateKey = `${program.programName}-${schedule.startDate.toISOString().split('T')[0]}-${schedule.venue || 'no-venue'}`
      
      // Skip if duplicate (O(1) lookup)
      if (seen.has(duplicateKey)) continue
      seen.set(duplicateKey, true)

      // Create unique ID for this schedule entry
      const uniqueId = `${program.id}-${schedule.id}-${schedule.startDate.toISOString().split('T')[0]}-${schedule.venue || 'no-venue'}`

      uniqueCourses.push({
        id: uniqueId,
        scheduleId: schedule.id,
        programId: program.id,
        slug: generateSlug(program.programName),
        title: program.programName,
        description: program.description || '',
        duration: program.duration,
        category: program.category,
        courseCode: program.refCode,
        price: schedule.fee || 0,
        venue: schedule.venue || null,
        startDate: schedule.startDate ? schedule.startDate.toISOString().split('T')[0] : null,
        endDate: schedule.endDate ? schedule.endDate.toISOString().split('T')[0] : null,
        rating: 4.5,
        featured: false,
        trending: false,
        imageUrl: program.cardImageUrl,
      })
    }

    // Apply pagination after deduplication
    const total = uniqueCourses.length
    const paginatedCourses = uniqueCourses.slice(skip, skip + limit)

    const response = NextResponse.json({
      success: true,
      data: paginatedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })

    // Set cache headers for production performance
    // Cache for 60 seconds (1 minute)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    
    return response
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

