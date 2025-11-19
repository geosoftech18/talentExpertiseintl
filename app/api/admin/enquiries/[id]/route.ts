import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/enquiries/[id]
 * Get single enquiry details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const enquiry = await prisma.courseEnquiry.findUnique({
      where: { id },
    })

    if (!enquiry) {
      return NextResponse.json(
        { success: false, error: 'Enquiry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: enquiry,
    })
  } catch (error) {
    console.error('Error fetching enquiry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enquiry' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/enquiries/[id]
 * Update enquiry (status or full update)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // If only status is being updated
    if (body.status && Object.keys(body).length === 1) {
      if (!['Pending', 'Approved', 'Cancelled'].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status. Must be Pending, Approved, or Cancelled' },
          { status: 400 }
        )
      }

      const enquiry = await prisma.courseEnquiry.update({
        where: { id },
        data: { status: body.status },
      })

      return NextResponse.json({
        success: true,
        data: enquiry,
      })
    }

    // Full update - validate and update all fields
    const updateData: any = {}
    
    if (body.status !== undefined) {
      if (!['Pending', 'Approved', 'Cancelled'].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status. Must be Pending, Approved, or Cancelled' },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.countryCode !== undefined) updateData.countryCode = body.countryCode
    if (body.company !== undefined) updateData.company = body.company
    if (body.jobTitle !== undefined) updateData.jobTitle = body.jobTitle || null
    if (body.courseId !== undefined) updateData.courseId = body.courseId || null
    if (body.courseTitle !== undefined) updateData.courseTitle = body.courseTitle || null
    if (body.schedulePreference !== undefined) updateData.schedulePreference = body.schedulePreference || null
    if (body.participants !== undefined) updateData.participants = body.participants || null
    if (body.message !== undefined) updateData.message = body.message || null

    const enquiry = await prisma.courseEnquiry.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: enquiry,
    })
  } catch (error) {
    console.error('Error updating enquiry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update enquiry' },
      { status: 500 }
    )
  }
}

