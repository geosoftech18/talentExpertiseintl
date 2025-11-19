import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Note: Password should be hashed before storing
    const teamMember = await prisma.teamMember.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        role: body.role,
        department: body.department || null,
        status: body.status || 'Active',
        password: body.password || null, // Should be hashed
        imageUrl: body.imageUrl || null,
        notes: body.notes || null,
        sendWelcomeEmail: body.sendWelcomeEmail !== undefined ? body.sendWelcomeEmail : true,
      },
    })

    return NextResponse.json(
      { success: true, data: teamMember },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const [teamMembers, total] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teamMember.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: teamMembers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
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
        { success: false, error: 'Team member ID is required' },
        { status: 400 }
      )
    }

    const teamMember = await prisma.teamMember.update({
      where: { id: parseInt(id) },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phone: updateData.phone || null,
        role: updateData.role,
        department: updateData.department || null,
        status: updateData.status || 'Active',
        password: updateData.password || undefined, // Only update if provided
        imageUrl: updateData.imageUrl || null,
        notes: updateData.notes || null,
      },
    })

    return NextResponse.json({ success: true, data: teamMember })
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
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
        { success: false, error: 'Team member ID is required' },
        { status: 400 }
      )
    }

    await prisma.teamMember.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ success: true, message: 'Team member deleted successfully' })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete team member' },
      { status: 500 }
    )
  }
}