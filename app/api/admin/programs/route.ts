import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Create program with related data
    const program = await prisma.program.create({
      data: {
        refCode: body.refCode,
        programName: body.programName,
        shortDescription: body.shortDescription || null,
        category: body.category,
        type: body.type || [],
        status: body.status || 'Draft',
        duration: body.duration,
        targetAudience: body.targetAudience || null,
        learningObjectives: body.learningObjectives || null,
        trainingMethodology: body.trainingMethodology || null,
        introduction: body.introduction || null,
        description: body.description || null,
        organisationalImpact: body.organisationalImpact || null,
        personalImpact: body.personalImpact || null,
        whoShouldAttend: body.whoShouldAttend || null,
        mainCourseImageUrl: body.mainCourseImageUrl || null,
        cardImageUrl: body.cardImageUrl || null,
        // Create related data
        courseOutline: {
          create: body.courseOutline?.map((item: any) => ({
            day: item.day,
            title: item.title,
            content: item.content,
          })) || [],
        },
        certificateIds: body.certificateIds || [],
        faqs: {
          create: body.faqs?.map((faq: any) => ({
            question: faq.question,
            answer: faq.answer,
          })) || [],
        },
      },
      include: {
        courseOutline: true,
        certifications: true,
        faqs: true,
      },
    })

    return NextResponse.json(
      { success: true, data: program },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create program' },
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
    const status = searchParams.get('status')
    const search = searchParams.get('search') // Search term for refCode, programName, category
    const includeDetails = searchParams.get('includeDetails') === 'true' // Only include nested data if explicitly requested

    // Build where clause
    const where: any = status ? { status } : {}
    
    // Note: We don't add search to the database query here because MongoDB with Prisma
    // doesn't support case-insensitive search well. We'll filter results after fetching.

    // Build query based on whether details are needed
    const queryOptions: any = {
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }

    if (includeDetails) {
      // Include all fields and nested relations when details are needed
      queryOptions.include = {
        courseOutline: true,
        certifications: true,
        faqs: true,
      }
      // certificateIds is already included as it's a field, not a relation
    } else {
      // Only select essential fields for list views (much faster)
      queryOptions.select = {
        id: true,
        refCode: true,
        programName: true,
        shortDescription: true,
        category: true,
        type: true,
        status: true,
        duration: true,
        certificateIds: true,
        createdAt: true,
        updatedAt: true,
      }
    }

    // Fetch programs (without search filter for now)
    const [allPrograms, totalBeforeSearch] = await Promise.all([
      prisma.program.findMany({
        where: status ? { status } : {},
        ...(includeDetails ? {
          include: {
            courseOutline: true,
            certifications: true,
            faqs: true,
          }
        } : {
          select: {
            id: true,
            refCode: true,
            programName: true,
            shortDescription: true,
            category: true,
            type: true,
            status: true,
            duration: true,
            certificateIds: true,
            createdAt: true,
            updatedAt: true,
          }
        }),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.program.count({ where: status ? { status } : {} }),
    ])

    // Apply case-insensitive search filter if provided
    let filteredPrograms = allPrograms
    let filteredTotal = totalBeforeSearch
    
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase()
      filteredPrograms = allPrograms.filter((program: any) => {
        const refCodeMatch = program.refCode?.toLowerCase().includes(searchLower) || false
        const nameMatch = program.programName?.toLowerCase().includes(searchLower) || false
        const categoryMatch = program.category?.toLowerCase().includes(searchLower) || false
        return refCodeMatch || nameMatch || categoryMatch
      })
      filteredTotal = filteredPrograms.length
    }

    // Apply pagination after filtering
    const paginatedPrograms = filteredPrograms.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      data: paginatedPrograms,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch programs' },
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
        { success: false, error: 'Program ID is required' },
        { status: 400 }
      )
    }

    // Handle course outline, certifications, and FAQs updates
    const updatePayload: any = {
      refCode: updateData.refCode,
      programName: updateData.programName,
      shortDescription: updateData.shortDescription || null,
      category: updateData.category,
      type: updateData.type || [],
      status: updateData.status,
      duration: updateData.duration,
      targetAudience: updateData.targetAudience || null,
      learningObjectives: updateData.learningObjectives || null,
      trainingMethodology: updateData.trainingMethodology || null,
      introduction: updateData.introduction || null,
      description: updateData.description || null,
      organisationalImpact: updateData.organisationalImpact || null,
      personalImpact: updateData.personalImpact || null,
      whoShouldAttend: updateData.whoShouldAttend || null,
      mainCourseImageUrl: updateData.mainCourseImageUrl || null,
      cardImageUrl: updateData.cardImageUrl || null,
    }

    // Update certificate IDs if provided
    if (updateData.certificateIds !== undefined) {
      updatePayload.certificateIds = updateData.certificateIds
    }

    // Update nested relations if provided
    if (updateData.courseOutline) {
      // Delete existing course outline and create new ones
      await prisma.courseOutline.deleteMany({ where: { programId: id } })
      updatePayload.courseOutline = {
        create: updateData.courseOutline.map((item: any) => ({
          day: item.day,
          title: item.title,
          content: item.content,
        })),
      }
    }

    if (updateData.certifications) {
      await prisma.certification.deleteMany({ where: { programId: id } })
      updatePayload.certifications = {
        create: updateData.certifications.map((cert: any) => ({
          name: cert.name,
          description: cert.description || null,
          imageUrl: cert.imageUrl || null,
        })),
      }
    }

    if (updateData.faqs) {
      await prisma.fAQ.deleteMany({ where: { programId: id } })
      updatePayload.faqs = {
        create: updateData.faqs.map((faq: any) => ({
          question: faq.question,
          answer: faq.answer,
        })),
      }
    }

    const program = await prisma.program.update({
      where: { id },
      data: updatePayload,
      include: {
        courseOutline: true,
        certifications: true,
        faqs: true,
      },
    })

    return NextResponse.json({ success: true, data: program })
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update program' },
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
        { success: false, error: 'Program ID is required' },
        { status: 400 }
      )
    }

    // Delete related data first
    await prisma.courseOutline.deleteMany({ where: { programId: id } })
    await prisma.certification.deleteMany({ where: { programId: id } })
    await prisma.fAQ.deleteMany({ where: { programId: id } })
    
    // Delete the program
    await prisma.program.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Program deleted successfully' })
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete program' },
      { status: 500 }
    )
  }
}