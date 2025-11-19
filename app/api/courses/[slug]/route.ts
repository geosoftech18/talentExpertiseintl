import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils/slug'

/**
 * GET /api/courses/[slug]
 * Fetch a single program by slug for course detail page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Fetch all published programs (with minimal fields) to find matching slug
    // We need to fetch all to match by slug since we don't store slug in DB
    const allPrograms = await prisma.program.findMany({
      where: {
        status: 'Published',
      },
      select: {
        id: true,
        programName: true,
      },
    })

    // Find program matching the slug
    const matchingProgram = allPrograms.find(
      (p) => generateSlug(p.programName) === slug
    )

    if (!matchingProgram) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Now fetch the full program data with relations
    const program = await prisma.program.findUnique({
      where: {
        id: matchingProgram.id,
      },
      include: {
        courseOutline: {
          orderBy: { day: 'asc' },
        },
        certifications: true,
        faqs: true,
        schedules: {
          where: {
            status: {
              in: ['Open', 'Published'],
            },
          },
          orderBy: { startDate: 'asc' },
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Transform data to match CourseDetailClient expected format
    const course = {
      id: program.id,
      slug: slug,
      title: program.programName,
      subtitle: program.introduction || null,
      description: program.description || '',
      duration: program.duration,
      category: program.category,
      price: 0, // Default, will be overridden by schedule fees
      image_url: program.mainCourseImageUrl || program.cardImageUrl || null,
      course_code: program.refCode,
    }

    // Transform schedules
    const schedules = program.schedules.map((schedule) => ({
      id: schedule.id,
      course_id: program.id,
      start_date: schedule.startDate.toISOString().split('T')[0],
      end_date: schedule.endDate?.toISOString().split('T')[0] || null,
      venue: schedule.venue,
      city: schedule.venue.split(',')[0]?.trim() || schedule.venue,
      country: schedule.venue.includes(',') 
        ? schedule.venue.split(',').slice(1).join(',').trim() 
        : schedule.venue,
      price: schedule.fee || 0,
      fees: schedule.fee || 0,
      seats_available: 20, // Placeholder - add to schema if needed
      status: schedule.status.toLowerCase(),
    }))

    // Transform course outline
    const outline = program.courseOutline.map((item, index) => {
      // Check if content is HTML or plain text
      const isHTML = item.content && item.content.includes('<')
      
      return {
        id: item.id,
        course_id: program.id,
        day_number: index + 1,
        day_title: item.title,
        content: item.content || '', // Keep original content for HTML rendering
        topics: isHTML ? [] : (item.content ? item.content.split('\n').filter(Boolean) : []),
        isHTML: isHTML,
      }
    })

    // Transform sections from program fields
    const sections = []
    if (program.introduction) {
      sections.push({
        id: 'intro',
        course_id: program.id,
        section_type: 'introduction',
        content: program.introduction,
      })
    }
    if (program.learningObjectives) {
      sections.push({
        id: 'objectives',
        course_id: program.id,
        section_type: 'objectives',
        content: program.learningObjectives,
      })
    }
    if (program.trainingMethodology) {
      sections.push({
        id: 'methodology',
        course_id: program.id,
        section_type: 'methodology',
        content: program.trainingMethodology,
      })
    }
    if (program.whoShouldAttend) {
      sections.push({
        id: 'who_should_attend',
        course_id: program.id,
        section_type: 'who_should_attend',
        content: program.whoShouldAttend,
      })
    }

    // Transform benefits
    const benefits = []
    if (program.organisationalImpact) {
      benefits.push({
        id: 'org-impact',
        course_id: program.id,
        benefit_type: 'organizational',
        description: program.organisationalImpact,
      })
    }
    if (program.personalImpact) {
      benefits.push({
        id: 'personal-impact',
        course_id: program.id,
        benefit_type: 'personal',
        description: program.personalImpact,
      })
    }

    // Transform FAQs
    const faqs = program.faqs.map((faq) => ({
      id: faq.id,
      course_id: program.id,
      question: faq.question,
      answer: faq.answer,
    }))

    // Get related courses (same category, different program)
    const relatedPrograms = await prisma.program.findMany({
      where: {
        category: program.category,
        status: 'Published',
        id: { not: program.id },
      },
      take: 3,
      select: {
        id: true,
        programName: true,
        duration: true,
        description: true,
        category: true,
        cardImageUrl: true,
      },
    })

    const relatedCourses = relatedPrograms.map((p) => ({
      id: p.id,
      slug: generateSlug(p.programName),
      title: p.programName,
      duration: p.duration,
      description: p.description,
      category: p.category,
      price: 0,
      image_url: p.cardImageUrl || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        course,
        schedules,
        sections,
        outline,
        benefits,
        faqs,
        relatedCourses,
      },
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

