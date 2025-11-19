import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const certificate = await prisma.certificate.create({
      data: {
        name: body.name,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        status: body.status || 'Active',
      },
    })

    return NextResponse.json(
      { success: true, data: certificate },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create certificate' },
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
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.certificate.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: certificates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificates' },
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
        { success: false, error: 'Certificate ID is required' },
        { status: 400 }
      )
    }

    const certificate = await prisma.certificate.update({
      where: { id: id },
      data: {
        name: updateData.name,
        description: updateData.description || null,
        imageUrl: updateData.imageUrl || null,
        ...(updateData.status && { status: updateData.status }),
      },
    })

    return NextResponse.json({ success: true, data: certificate })
  } catch (error) {
    console.error('Error updating certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update certificate' },
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
        { success: false, error: 'Certificate ID is required' },
        { status: 400 }
      )
    }

    await prisma.certificate.delete({ where: { id: id } })

    return NextResponse.json({ success: true, message: 'Certificate deleted successfully' })
  } catch (error) {
    console.error('Error deleting certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete certificate' },
      { status: 500 }
    )
  }
}

