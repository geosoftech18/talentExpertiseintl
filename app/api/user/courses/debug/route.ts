import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Debug endpoint to check what's in the database
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userEmail = session.user.email
    const userId = session.user.id

    // Get all registrations for this email (for debugging) - try exact match first
    let allRegistrations = await prisma.courseRegistration.findMany({
      where: {
        email: userEmail
      },
      select: {
        id: true,
        email: true,
        userId: true,
        courseTitle: true,
        courseId: true,
        createdAt: true
      },
      take: 10
    })

    // If no exact match, try case variations
    if (allRegistrations.length === 0) {
      const lowerEmail = userEmail.toLowerCase()
      allRegistrations = await prisma.courseRegistration.findMany({
        where: {
          OR: [
            { email: userEmail },
            { email: lowerEmail },
            { email: userEmail.toUpperCase() }
          ]
        },
        select: {
          id: true,
          email: true,
          userId: true,
          courseTitle: true,
          courseId: true,
          createdAt: true
        },
        take: 10
      })
    }

    // Get total count with exact match
    let totalCount = await prisma.courseRegistration.count({
      where: {
        email: userEmail
      }
    })
    
    // If no exact match, try case variations for count
    if (totalCount === 0) {
      const lowerEmail = userEmail.toLowerCase()
      totalCount = await prisma.courseRegistration.count({
        where: {
          OR: [
            { email: userEmail },
            { email: lowerEmail },
            { email: userEmail.toUpperCase() }
          ]
        }
      })
    }
    
    // Also get a sample of all registrations to see what emails exist
    const sampleRegistrations = await prisma.courseRegistration.findMany({
      select: {
        email: true,
        courseTitle: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({
      user: {
        email: userEmail,
        userId: userId,
        isValidObjectId: /^[0-9a-fA-F]{24}$/.test(userId || '')
      },
      registrations: allRegistrations,
      totalCount: totalCount,
      sampleRegistrations: sampleRegistrations,
      message: 'Debug info - check if registrations exist for this email',
      note: 'If totalCount is 0, check sampleRegistrations to see what emails exist in database'
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

