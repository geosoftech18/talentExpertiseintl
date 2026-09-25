import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_CLIENT_LOGOS } from '@/lib/home-content-defaults'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '1000')

    const where: { status?: string } = {}
    if (status) where.status = status

    const data = await prisma.clientLogo.findMany({
      where,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching client logos:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client logos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Seed current static defaults into DB (idempotent if already seeded)
    if (body?.action === 'seed') {
      const count = await prisma.clientLogo.count()
      if (count > 0) {
        return NextResponse.json({
          success: true,
          message: 'Client logos already exist — seed skipped',
          data: { seeded: 0 },
        })
      }
      await prisma.clientLogo.createMany({
        data: DEFAULT_CLIENT_LOGOS.map(({ name, logoUrl, sortOrder, status }) => ({
          name,
          logoUrl,
          sortOrder,
          status,
        })),
      })
      const data = await prisma.clientLogo.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      })
      return NextResponse.json({
        success: true,
        message: `Seeded ${data.length} client logos`,
        data,
      })
    }

    if (!body.name || !body.logoUrl) {
      return NextResponse.json(
        { success: false, error: 'Name and logo image are required' },
        { status: 400 }
      )
    }

    const maxSort = await prisma.clientLogo.aggregate({ _max: { sortOrder: true } })
    const item = await prisma.clientLogo.create({
      data: {
        name: body.name,
        logoUrl: body.logoUrl,
        sortOrder:
          typeof body.sortOrder === 'number'
            ? body.sortOrder
            : (maxSort._max.sortOrder ?? 0) + 1,
        status: body.status || 'Active',
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating client logo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create client logo' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    const item = await prisma.clientLogo.update({
      where: { id },
      data: {
        ...(updateData.name !== undefined && { name: updateData.name }),
        ...(updateData.logoUrl !== undefined && { logoUrl: updateData.logoUrl }),
        ...(updateData.sortOrder !== undefined && { sortOrder: Number(updateData.sortOrder) }),
        ...(updateData.status !== undefined && { status: updateData.status }),
      },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Error updating client logo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update client logo' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    await prisma.clientLogo.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting client logo:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete client logo' },
      { status: 500 }
    )
  }
}
