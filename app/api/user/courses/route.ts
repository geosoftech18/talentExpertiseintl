import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    let session
    try {
      session = await auth()
    } catch (authError) {
      console.error('Error calling auth():', authError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication error'
        },
        { status: 500 }
      )
    }
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate that userId is a valid MongoDB ObjectID (24 hex characters)
    const objectIdPattern = /^[0-9a-fA-F]{24}$/
    const userId = session.user.id
    const userEmail = session.user.email
    
    // Build where clause - query by userId if valid, OR by email as fallback
    // This handles cases where registrations were created before userId linking was implemented
    let whereClause: any = {}
    
    if (objectIdPattern.test(userId || '') && userEmail) {
      // Valid ObjectID and email - query by both (OR condition)
      whereClause = {
        OR: [
          { userId: userId },
          { email: userEmail }
        ]
      }
    } else if (objectIdPattern.test(userId || '')) {
      // Valid ObjectID but no email - query by userId only
      whereClause = { userId: userId }
    } else if (userEmail) {
      // Invalid ObjectID but have email - query by email as fallback
      whereClause = { email: userEmail }
    } else {
      // No valid userId or email
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      })
    }

    // Fetch user's course registrations
    let registrations = await prisma.courseRegistration.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        courseId: true,
        courseTitle: true,
        scheduleId: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        submittedAt: true,
        email: true, // Include for debugging
        userId: true, // Include for debugging
      },
    })

    // If no results and we have email, try email variations (case sensitivity)
    if (registrations.length === 0 && userEmail) {
      const lowerEmail = userEmail.toLowerCase()
      const upperEmail = userEmail.toUpperCase()
      
      // Try different case variations
      registrations = await prisma.courseRegistration.findMany({
        where: {
          OR: [
            { email: userEmail },
            { email: lowerEmail },
            { email: upperEmail }
          ]
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          courseId: true,
          courseTitle: true,
          scheduleId: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
          submittedAt: true,
          email: true,
          userId: true,
        },
      })
      
      // If still no results, try case-insensitive matching
      if (registrations.length === 0) {
        // Get recent registrations and check case-insensitively
        const allRegs = await prisma.courseRegistration.findMany({
          select: {
            id: true,
            email: true,
            courseTitle: true,
            userId: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        })
        
        // Find matching email (case-insensitive)
        const matchingReg = allRegs.find(r => 
          r.email.toLowerCase() === userEmail.toLowerCase()
        )
        
        if (matchingReg) {
          // Found match! Re-fetch with the exact email from database
          registrations = await prisma.courseRegistration.findMany({
            where: {
              email: matchingReg.email
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              courseId: true,
              courseTitle: true,
              scheduleId: true,
              orderStatus: true,
              paymentStatus: true,
              createdAt: true,
              submittedAt: true,
              email: true,
              userId: true,
            },
          })
        }
      }
    }

    // Fetch schedule details for registrations that have scheduleId
    const scheduleIds = registrations
      .map((reg) => reg.scheduleId)
      .filter((id): id is string => id !== null)

    const schedules = scheduleIds.length > 0
      ? await prisma.schedule.findMany({
          where: { id: { in: scheduleIds } },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            venue: true,
            status: true,
            programId: true,
          },
        })
      : []

    const scheduleMap = new Map(schedules.map((s) => [s.id, s]))

    // Fetch program details for courses
    const courseIds = registrations
      .map((reg) => reg.courseId)
      .filter((id): id is string => id !== null)

    const programs = courseIds.length > 0
      ? await prisma.program.findMany({
          where: { id: { in: courseIds } },
          select: {
            id: true,
            refCode: true,
            programName: true,
            category: true,
            cardImageUrl: true,
          },
        })
      : []

    const programMap = new Map(programs.map((p) => [p.id, p]))

    // Combine registration data with schedule and program info
    const courses = registrations.map((reg) => {
      const schedule = reg.scheduleId ? scheduleMap.get(reg.scheduleId) : null
      const program = reg.courseId ? programMap.get(reg.courseId) : null

      return {
        id: reg.id,
        courseId: reg.courseId,
        courseTitle: reg.courseTitle || program?.programName || 'Course',
        courseCode: program?.refCode || null,
        category: program?.category || null,
        imageUrl: program?.cardImageUrl || null,
        schedule: schedule
          ? {
              id: schedule.id,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              venue: schedule.venue,
              status: schedule.status,
            }
          : null,
        orderStatus: reg.orderStatus,
        paymentStatus: reg.paymentStatus,
        enrolledDate: reg.submittedAt || reg.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: courses,
      count: courses.length,
    })
  } catch (error) {
    console.error('Error fetching user courses:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch courses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

