import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    // Fetch course registrations with schedule information
    const [registrations, total] = await Promise.all([
      prisma.courseRegistration.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          // We'll need to fetch schedule separately since there's no direct relation
        },
      }),
      prisma.courseRegistration.count(),
    ])

    // Fetch schedules for registrations that have scheduleId
    const scheduleIds = registrations
      .map((reg) => reg.scheduleId)
      .filter((id): id is string => id !== null)

    const schedules = scheduleIds.length > 0
      ? await prisma.schedule.findMany({
          where: { id: { in: scheduleIds } },
          select: { id: true, fee: true, status: true, startDate: true, endDate: true },
        })
      : []

    const scheduleMap = new Map(schedules.map((s) => [s.id, s]))

    // Transform registrations to orders
    const orders = registrations.map((reg, index) => {
      const schedule = reg.scheduleId ? scheduleMap.get(reg.scheduleId) : null
      const orderTotal = schedule?.fee || 0

      // Map payment method to display name
      const paymentMethodMap: Record<string, string> = {
        credit: 'Credit Card',
        bank: 'Bank Transfer',
        invoice: 'Invoice',
        purchase: 'Purchase Order',
      }

      // Use stored payment status if available, otherwise determine based on payment method
      let paymentStatus: 'Paid' | 'Unpaid' | 'Partially Refunded' | 'Refunded' = 
        (reg.paymentStatus as 'Paid' | 'Unpaid' | 'Partially Refunded' | 'Refunded') || 'Unpaid'
      
      // If no payment status is stored, calculate it based on payment method
      if (!reg.paymentStatus) {
        if (reg.paymentMethod === 'credit' || reg.paymentMethod === 'purchase') {
          paymentStatus = 'Paid'
        } else if (reg.paymentMethod === 'bank') {
          // Bank transfers might be paid or unpaid - default to unpaid for now
          paymentStatus = 'Unpaid'
        } else if (reg.paymentMethod === 'invoice') {
          paymentStatus = 'Unpaid'
        }
      }

      // Get order status - use stored orderStatus if available, otherwise default to Incomplete
      // Order status is now independent from payment status
      let status: 'Completed' | 'Incomplete' | 'Cancelled' = 
        (reg.orderStatus as 'Completed' | 'Incomplete' | 'Cancelled') || 'Incomplete'

      // Format date
      const date = new Date(reg.submittedAt || reg.createdAt)
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })

      // Format schedule date
      let scheduleDate: string | null = null
      if (schedule?.startDate) {
        const scheduleStartDate = new Date(schedule.startDate)
        const scheduleEndDate = schedule.endDate ? new Date(schedule.endDate) : null
        
        if (scheduleEndDate && scheduleStartDate.getTime() !== scheduleEndDate.getTime()) {
          // Date range
          scheduleDate = `${scheduleStartDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })} - ${scheduleEndDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}`
        } else {
          // Single date
          scheduleDate = scheduleStartDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        }
      }

      return {
        id: total - index, // Use reverse index for display ID
        registrationId: reg.id,
        name: reg.name,
        email: reg.email,
        company: reg.company,
        courseTitle: reg.courseTitle,
        date: formattedDate,
        rawDate: date,
        scheduleDate,
        method: paymentMethodMap[reg.paymentMethod] || reg.paymentMethod,
        paymentStatus,
        status,
        total: orderTotal,
        paymentMethod: reg.paymentMethod,
        scheduleId: reg.scheduleId,
        scheduleStatus: schedule?.status,
      }
    })

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

