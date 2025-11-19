import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)

    // Get all stats in parallel for better performance
    const [
      totalPublishedPrograms,
      totalActiveVenues,
      newRegistrationsCount,
      previousRegistrationsCount,
      newEnquiriesCount,
      previousEnquiriesCount,
      recentRegistrations,
      recentEnquiries,
    ] = await Promise.all([
      // Total published programs
      prisma.program.count({
        where: { status: 'Published' },
      }),
      // Total active venues
      prisma.venue.count({
        where: { status: 'Active' },
      }),
      // New registrations in last 30 days
      prisma.courseRegistration.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      // Previous period registrations (30-60 days ago) for comparison
      prisma.courseRegistration.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
            lt: thirtyDaysAgo,
          },
        },
      }),
      // New enquiries in last 30 days
      prisma.courseEnquiry.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      // Previous period enquiries (30-60 days ago) for comparison
      prisma.courseEnquiry.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
            lt: thirtyDaysAgo,
          },
        },
      }),
      // Recent registrations for pending items
      prisma.courseRegistration.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          courseTitle: true,
          createdAt: true,
        },
      }),
      // Recent enquiries for pending items
      prisma.courseEnquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          courseTitle: true,
          createdAt: true,
        },
      }),
    ])

    // Calculate registration data for last 6 months for chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Create month ranges for the last 6 months
    const monthRanges = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
      monthRanges.push({ monthStart, monthEnd, monthIndex: monthStart.getMonth() })
    }
    
    // Fetch counts for all months in parallel
    const monthCounts = await Promise.all(
      monthRanges.map(({ monthStart, monthEnd }) =>
        prisma.courseRegistration.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        })
      )
    )
    
    // Combine month names with counts
    const months = monthRanges.map(({ monthIndex }, idx) => ({
      month: monthNames[monthIndex],
      registrations: monthCounts[idx],
    }))

    // Calculate changes
    const registrationsChange = previousRegistrationsCount > 0
      ? newRegistrationsCount - previousRegistrationsCount
      : newRegistrationsCount > 0 ? newRegistrationsCount : 0
    
    const enquiriesChange = previousEnquiriesCount > 0
      ? newEnquiriesCount - previousEnquiriesCount
      : newEnquiriesCount > 0 ? newEnquiriesCount : 0

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalPublishedPrograms,
          totalActiveVenues,
          newRegistrations: newRegistrationsCount,
          registrationsChange: registrationsChange >= 0 ? `+${registrationsChange}` : `${registrationsChange}`,
          newEnquiries: newEnquiriesCount,
          enquiriesChange: enquiriesChange >= 0 ? `+${enquiriesChange}` : `${enquiriesChange}`,
        },
        chartData: months,
        pendingItems: {
          recentRegistrations: recentRegistrations.map((reg) => ({
            name: reg.name,
            program: reg.courseTitle || 'General Registration',
            date: reg.createdAt.toISOString().split('T')[0],
          })),
          recentEnquiries: recentEnquiries.map((enq) => ({
            name: `${enq.firstName} ${enq.lastName}`,
            program: enq.courseTitle || 'General Contact',
            date: enq.createdAt.toISOString().split('T')[0],
          })),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

