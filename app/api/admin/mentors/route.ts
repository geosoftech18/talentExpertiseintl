import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const mentor = await prisma.mentor.create({
      data: {
        name: body.name,
        email: body.email,
        bio: body.bio || null,
        yearsOfExperience: body.yearsOfExperience ? parseInt(body.yearsOfExperience) : null,
        imageUrl: body.imageUrl || null,
      },
    })

    return NextResponse.json(
      { success: true, data: mentor },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating mentor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create mentor' },
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

    const [mentors, total] = await Promise.all([
      prisma.mentor.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          yearsOfExperience: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mentor.count(),
    ])

    return NextResponse.json({
      success: true,
      data: mentors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching mentors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentors' },
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
        { success: false, error: 'Mentor ID is required' },
        { status: 400 }
      )
    }

    const mentor = await prisma.mentor.update({
      where: { id },
      data: {
        name: updateData.name,
        email: updateData.email,
        bio: updateData.bio || null,
        yearsOfExperience: updateData.yearsOfExperience 
          ? parseInt(updateData.yearsOfExperience) 
          : null,
        imageUrl: updateData.imageUrl || null,
      },
    })

    return NextResponse.json({ success: true, data: mentor })
  } catch (error) {
    console.error('Error updating mentor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update mentor' },
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
        { success: false, error: 'Mentor ID is required' },
        { status: 400 }
      )
    }

    await prisma.mentor.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Mentor deleted successfully' })
  } catch (error) {
    console.error('Error deleting mentor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete mentor' },
      { status: 500 }
    )
  }
}