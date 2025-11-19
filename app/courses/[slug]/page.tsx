import CourseDetailClient from '@/components/course-detail-client'
import { notFound } from 'next/navigation'

async function getCourseData(slug: string) {
  try {
    // Use internal API call (faster, no network overhead)
    const { prisma } = await import('@/lib/prisma')
    const { generateSlug } = await import('@/lib/utils/slug')

    // Fetch all published programs to find matching slug
    const allPrograms = await prisma.program.findMany({
      where: { status: 'Published' },
      select: { id: true, programName: true },
    })

    const matchingProgram = allPrograms.find(
      (p) => generateSlug(p.programName) === slug
    )

    if (!matchingProgram) {
      return null
    }

    // Fetch full program data with relations
    const program = await prisma.program.findUnique({
      where: { id: matchingProgram.id },
      include: {
        courseOutline: { orderBy: { day: 'asc' } },
        certifications: true,
        faqs: true,
        schedules: {
          where: { status: { in: ['Open', 'Published'] } },
          orderBy: { startDate: 'asc' },
          include: {
            mentor: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    if (!program) {
      return null
    }

    // Transform data (same logic as API route)
    const programWithShortDesc = program as typeof program & { shortDescription?: string | null }
    const course = {
      id: program.id,
      slug: slug,
      title: program.programName,
      subtitle: programWithShortDesc.shortDescription || null,
      shortDescription: programWithShortDesc.shortDescription || null,
      description: program.description || '',
      duration: program.duration,
      category: program.category,
      price: program.schedules[0]?.fee || 0,
      image_url: program.mainCourseImageUrl || program.cardImageUrl || null,
      course_code: program.refCode,
    }

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
      seats_available: 20,
      status: schedule.status.toLowerCase(),
    }))

    const outline = program.courseOutline.map((item, index) => {
      const isHTML = item.content && item.content.includes('<')
      
      return {
        id: item.id,
        course_id: program.id,
        day_number: index + 1,
        day_title: item.title,
        content: item.content || '',
        topics: isHTML ? [] : (item.content ? item.content.split('\n').filter(Boolean) : []),
        isHTML: isHTML,
      }
    })

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

    const faqs = program.faqs.map((faq) => ({
      id: faq.id,
      course_id: program.id,
      question: faq.question,
      answer: faq.answer,
    }))

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

    return {
      course,
      schedules,
      sections,
      outline,
      benefits,
      faqs,
      relatedCourses,
    }
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getCourseData(slug)

  if (!data) {
    notFound()
  }

  return (
    <CourseDetailClient
      course={data.course as any}
      schedules={data.schedules as any}
      sections={data.sections as any}
      outline={data.outline as any}
      benefits={data.benefits as any}
      faqs={data.faqs as any}
      relatedCourses={data.relatedCourses as any}
    />
  )
}
