import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate mentorId - must be a valid MongoDB ObjectID or null
    let mentorId = null
    if (body.mentorId && body.mentorId.trim() !== '') {
      // Check if it's a valid ObjectID format (24 hex characters)
      const objectIdPattern = /^[0-9a-fA-F]{24}$/
      if (objectIdPattern.test(body.mentorId)) {
        mentorId = body.mentorId
      } else {
        console.warn('Invalid mentorId format:', body.mentorId)
        // If invalid, set to null instead of throwing error
        mentorId = null
      }
    }

    // Handle isNewProgram - explicitly convert to boolean
    let isNewProgramValue = false
    if (body.hasOwnProperty('isNewProgram')) {
      if (typeof body.isNewProgram === 'boolean') {
        isNewProgramValue = body.isNewProgram
      } else if (typeof body.isNewProgram === 'string') {
        isNewProgramValue = body.isNewProgram === 'true'
      }
    }

    const schedule = await prisma.schedule.create({
      data: {
        programId: body.programId,
        programName: body.programName || null,
        mentorId: mentorId,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        venue: body.venue,
        fee: body.fee !== null && body.fee !== undefined ? parseFloat(String(body.fee).replace(/[^\d.]/g, '')) : null,
        status: body.status || 'Open',
        isNewProgram: isNewProgramValue, // Explicitly set boolean value
      },
    })

    return NextResponse.json(
      { success: true, data: schedule },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50') // Increased default limit
    const skip = (page - 1) * limit
    const month = searchParams.get('month') // Format: "01", "02", etc.
    const year = searchParams.get('year') // Format: "2026", etc.
    const includeExpired = searchParams.get('includeExpired') === 'true' // Allow fetching expired schedules

    // Build where clause for filtering
    const where: any = {}
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Filter by month and/or year
    if (month && year) {
      // Filter by specific month and year
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)
      const startOfMonth = new Date(yearNum, monthNum - 1, 1)
      const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999)
      
      if (includeExpired) {
        // Show all schedules in this month/year (including expired)
        where.startDate = {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      } else {
        // Only show future dates
        const filterStart = startOfMonth > today ? startOfMonth : today
        where.startDate = {
          gte: filterStart,
          lte: endOfMonth,
        }
      }
    } else if (month) {
      // Filter by month (any year) - we'll need to filter after fetching
      // For now, set a wide range and filter in memory
      // Or better: use year range from current year to future years
      const monthNum = parseInt(month)
      const currentYear = new Date().getFullYear()
      const futureYears = 5 // Look ahead 5 years
      
      if (includeExpired) {
        // Show all schedules for this month across multiple years (including expired)
        const pastYears = 2 // Look back 2 years
        const startOfMonth = new Date(currentYear - pastYears, monthNum - 1, 1)
        const endOfMonth = new Date(currentYear + futureYears, monthNum, 0, 23, 59, 59, 999)
        where.startDate = {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      } else {
        // Get the earliest possible date (current month if in future, or next year's month)
        let startOfMonth: Date
        if (monthNum > today.getMonth() + 1 || (monthNum === today.getMonth() + 1 && today.getDate() <= new Date(today.getFullYear(), monthNum, 0).getDate())) {
          startOfMonth = new Date(currentYear, monthNum - 1, 1)
          if (startOfMonth < today) {
            startOfMonth = today
          }
        } else {
          startOfMonth = new Date(currentYear + 1, monthNum - 1, 1)
        }
        
        const endOfMonth = new Date(currentYear + futureYears, monthNum, 0, 23, 59, 59, 999)
        where.startDate = {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      }
    } else if (year) {
      // Filter by year
      const yearNum = parseInt(year)
      const startOfYear = new Date(yearNum, 0, 1)
      const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59, 999)
      
      if (includeExpired) {
        // Show all schedules in this year (including expired)
        where.startDate = {
          gte: startOfYear,
          lte: endOfYear,
        }
      } else {
        // Ensure we only show future dates
        const filterStart = startOfYear > today ? startOfYear : today
        where.startDate = {
          gte: filterStart,
          lte: endOfYear,
        }
      }
    } else {
      // No month/year filter
      if (includeExpired) {
        // Show all schedules (no date filter)
        // Don't add startDate filter
      } else {
        // Just show future schedules
        where.startDate = {
          gte: today,
        }
      }
    }

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          programId: true,
          programName: true,
          mentorId: true,
          startDate: true,
          endDate: true,
          venue: true,
          fee: true,
          status: true,
          isNewProgram: true,
          createdAt: true,
          // Only include basic fields from relations
          program: {
            select: {
              id: true,
              refCode: true,
              programName: true,
              category: true,
            },
          },
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { startDate: 'asc' }, // Changed to asc for better UX (upcoming first)
      }),
      prisma.schedule.count({ where }),
    ])

    // If filtering by month only (without year), filter results to match exact month
    let filteredSchedules = schedules
    let filteredTotal = total
    if (month && !year) {
      const monthNum = parseInt(month)
      filteredSchedules = schedules.filter((schedule: any) => {
        const scheduleDate = new Date(schedule.startDate)
        return scheduleDate.getMonth() + 1 === monthNum
      })
      // Recalculate total for month-only filter by counting all matching schedules
      const allMatchingSchedules = await prisma.schedule.findMany({
        where: { startDate: { gte: today } },
        select: { startDate: true },
      })
      filteredTotal = allMatchingSchedules.filter((s: any) => {
        const scheduleDate = new Date(s.startDate)
        return scheduleDate.getMonth() + 1 === monthNum
      }).length
    }

    return NextResponse.json({
      success: true,
      data: filteredSchedules,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    // Validate mentorId
    let mentorId = null
    if (updateData.mentorId && updateData.mentorId.trim() !== '') {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/
      if (objectIdPattern.test(updateData.mentorId)) {
        mentorId = updateData.mentorId
      } else {
        mentorId = null
      }
    }

    // Handle isNewProgram - explicitly convert to boolean
    let isNewProgramValue = false
    if (updateData.hasOwnProperty('isNewProgram')) {
      if (typeof updateData.isNewProgram === 'boolean') {
        isNewProgramValue = updateData.isNewProgram
      } else if (typeof updateData.isNewProgram === 'string') {
        isNewProgramValue = updateData.isNewProgram === 'true'
      }
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        programId: updateData.programId,
        programName: updateData.programName || null,
        mentorId: mentorId,
        startDate: new Date(updateData.startDate),
        endDate: updateData.endDate ? new Date(updateData.endDate) : null,
        venue: updateData.venue,
        fee: updateData.fee !== null && updateData.fee !== undefined 
          ? parseFloat(String(updateData.fee).replace(/[^\d.]/g, '')) 
          : null,
        status: updateData.status || 'Open',
        isNewProgram: isNewProgramValue, // Explicitly set boolean value
      },
    })

    return NextResponse.json({ success: true, data: schedule })
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    await prisma.schedule.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}