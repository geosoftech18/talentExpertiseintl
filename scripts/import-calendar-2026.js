const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx')
const path = require('path')

const prisma = new PrismaClient()

// Content generation functions (copied from TypeScript file)
function extractKeywords(courseName) {
  const commonWords = ['course', 'training', 'program', 'certification', 'workshop', 'seminar', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  const words = courseName
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !commonWords.includes(word) && word.length > 2)
    .slice(0, 5)
  return words.length > 0 ? words : ['professional development']
}

function detectCourseType(courseName, category) {
  const name = courseName.toLowerCase()
  if (name.includes('management') || name.includes('leadership')) return 'management'
  if (name.includes('finance') || name.includes('accounting')) return 'finance'
  if (name.includes('hr') || name.includes('human resource')) return 'hr'
  if (name.includes('project') || name.includes('pmp')) return 'project'
  if (name.includes('it') || name.includes('technology') || name.includes('software')) return 'it'
  if (name.includes('marketing') || name.includes('sales')) return 'marketing'
  if (name.includes('quality') || name.includes('iso')) return 'quality'
  return 'general'
}

function getJobTitles(courseType) {
  const titles = {
    management: [
      'Managers and Team Leaders',
      'Supervisors and Department Heads',
      'Executives and Senior Management',
      'Project Managers',
    ],
    finance: [
      'Finance Managers and Controllers',
      'Accountants and Financial Analysts',
      'CFOs and Finance Directors',
      'Auditors and Compliance Officers',
    ],
    hr: [
      'HR Managers and Directors',
      'HR Business Partners',
      'Talent Acquisition Specialists',
      'Learning and Development Professionals',
    ],
    project: [
      'Project Managers and Coordinators',
      'Program Managers',
      'Project Team Members',
      'PMO Professionals',
    ],
    it: [
      'IT Managers and Directors',
      'Software Developers and Engineers',
      'System Administrators',
      'IT Consultants',
    ],
    marketing: [
      'Marketing Managers and Directors',
      'Brand Managers',
      'Digital Marketing Specialists',
      'Sales Professionals',
    ],
    quality: [
      'Quality Managers',
      'Quality Assurance Professionals',
      'Compliance Officers',
      'Process Improvement Specialists',
    ],
    general: [
      'Professionals seeking skill enhancement',
      'Team members looking to advance their careers',
      'Individuals interested in professional development',
    ],
  }
  return titles[courseType] || titles.general
}

function generateCourseOutline(courseName, keywords, duration) {
  const days = parseInt(duration) || 5
  const outline = []

  const dayTitles = [
    'Introduction and Fundamentals',
    'Core Concepts and Principles',
    'Advanced Applications',
    'Practical Implementation',
    'Best Practices and Case Studies',
    'Integration and Optimization',
    'Review and Action Planning',
  ]

  for (let i = 0; i < days && i < dayTitles.length; i++) {
    outline.push({
      day: `Day ${i + 1}`,
      title: dayTitles[i] || `Module ${i + 1}`,
      content: `<ul>
<li>Introduction to key concepts and learning objectives</li>
<li>Interactive sessions on ${keywords[0] || 'core topics'}</li>
<li>Practical exercises and case studies</li>
<li>Group discussions and knowledge sharing</li>
<li>Q&A and clarification sessions</li>
</ul>`,
    })
  }

  return outline
}

function generateFAQs(courseName, duration, category) {
  return [
    {
      question: `What is the duration of the ${courseName} program?`,
      answer: `The program is conducted over ${duration}, providing comprehensive coverage of all essential topics and allowing sufficient time for practical application and interactive learning.`,
    },
    {
      question: `Who should attend this ${courseName} program?`,
      answer: `This program is designed for professionals working in ${category} or related fields who seek to enhance their knowledge, skills, and competencies. It is suitable for individuals at various career levels looking to advance their professional development.`,
    },
    {
      question: `What will I learn from this program?`,
      answer: `You will gain comprehensive knowledge of ${courseName} principles, best practices, and practical applications. The program covers essential concepts, methodologies, and tools that you can immediately apply in your professional role.`,
    },
    {
      question: `Will I receive a certificate upon completion?`,
      answer: `Yes, participants who successfully complete the program will receive a certificate of completion, recognizing their achievement and professional development.`,
    },
    {
      question: `What is the training methodology used in this program?`,
      answer: `The program employs a blended learning approach combining interactive lectures, case studies, group discussions, hands-on exercises, and practical activities to ensure effective learning and skill development.`,
    },
    {
      question: `Can this program be customized for in-house delivery?`,
      answer: `Yes, we offer customized in-house training solutions tailored to your organization's specific needs and requirements. Please contact us to discuss your requirements.`,
    },
  ]
}

function generateCourseContent(courseName, category, duration) {
  const keywords = extractKeywords(courseName)
  const courseType = detectCourseType(courseName, category)

  const shortDescription = `This comprehensive ${duration.toLowerCase()} program provides participants with essential knowledge and practical skills in ${keywords.join(', ')}. Designed for professionals seeking to enhance their expertise and advance their careers.`

  const introduction = `<p>Welcome to <strong>${courseName}</strong>, a comprehensive training program designed to equip professionals with the knowledge, skills, and tools necessary to excel in today's competitive business environment.</p>
<p>This program combines theoretical foundations with practical applications, ensuring participants gain both conceptual understanding and hands-on experience. Through interactive sessions, case studies, and real-world scenarios, participants will develop the competencies needed to drive organizational success.</p>
<p>Our expert instructors bring years of industry experience and will guide you through the latest best practices, methodologies, and tools relevant to ${keywords[0] || category}.</p>`

  const description = `<p><strong>${courseName}</strong> is a structured learning experience that covers essential concepts, methodologies, and practical applications in ${category}.</p>
<ul>
<li>Comprehensive coverage of core ${keywords[0] || category} principles and best practices</li>
<li>Interactive learning sessions with real-world case studies and examples</li>
<li>Practical exercises and hands-on activities to reinforce learning</li>
<li>Expert guidance from industry professionals with extensive experience</li>
<li>Networking opportunities with peers and industry experts</li>
<li>Certificate of completion upon successful program completion</li>
</ul>
<p>This program is designed to be highly interactive, engaging, and practical, ensuring that participants can immediately apply what they learn in their professional roles.</p>`

  const learningObjectives = `<p>Upon completion of this program, participants will be able to:</p>
<ul>
<li>Understand the fundamental concepts and principles of ${keywords[0] || category}</li>
<li>Apply best practices and methodologies in real-world scenarios</li>
<li>Develop practical skills and competencies relevant to their professional roles</li>
<li>Identify opportunities for improvement and innovation in their work</li>
<li>Create actionable plans to implement learning outcomes in their organizations</li>
<li>Enhance their professional capabilities and career prospects</li>
</ul>`

  const trainingMethodology = `<p>This program employs a blended learning approach that combines various instructional methods to maximize learning effectiveness:</p>
<ul>
<li><strong>Interactive Lectures:</strong> Expert-led sessions covering key concepts and theories</li>
<li><strong>Case Studies:</strong> Real-world scenarios and examples for practical application</li>
<li><strong>Group Discussions:</strong> Collaborative learning through peer interaction and knowledge sharing</li>
<li><strong>Hands-on Exercises:</strong> Practical activities to reinforce learning and build skills</li>
<li><strong>Role Plays & Simulations:</strong> Experiential learning opportunities to practice new skills</li>
<li><strong>Q&A Sessions:</strong> Opportunities to clarify doubts and deepen understanding</li>
</ul>
<p>This methodology ensures active participation, engagement, and practical application of learning outcomes.</p>`

  const targetAudience = `<p>This program is designed for professionals who:</p>
<ul>
<li>Work in ${category} or related fields</li>
<li>Seek to enhance their knowledge and skills in ${keywords[0] || category}</li>
<li>Want to stay updated with latest industry trends and best practices</li>
<li>Are looking to advance their careers through professional development</li>
<li>Need practical tools and methodologies to improve their performance</li>
</ul>`

  const whoShouldAttend = `<p>This program is ideal for:</p>
<ul>
<li>${getJobTitles(courseType).join('</li><li>')}</li>
<li>Anyone seeking to enhance their professional skills and knowledge</li>
</ul>`

  const organisationalImpact = `<p>Organizations will benefit from this program through:</p>
<ul>
<li>Improved employee performance and productivity</li>
<li>Enhanced organizational capabilities and competitiveness</li>
<li>Better alignment with industry best practices and standards</li>
<li>Increased innovation and problem-solving capabilities</li>
<li>Strengthened team collaboration and effectiveness</li>
<li>Higher employee engagement and retention</li>
</ul>`

  const personalImpact = `<p>Participants will experience personal growth through:</p>
<ul>
<li>Enhanced professional knowledge and expertise</li>
<li>Improved confidence in applying new skills and methodologies</li>
<li>Better career prospects and advancement opportunities</li>
<li>Expanded professional network and connections</li>
<li>Increased job satisfaction and professional fulfillment</li>
<li>Recognition through professional certification</li>
</ul>`

  const courseOutline = generateCourseOutline(courseName, keywords, duration)
  const faqs = generateFAQs(courseName, duration, category)

  return {
    shortDescription,
    introduction,
    description,
    learningObjectives,
    trainingMethodology,
    targetAudience,
    whoShouldAttend,
    organisationalImpact,
    personalImpact,
    courseOutline,
    faqs,
  }
}

// Calculate duration from date string (e.g., "05 - 09 Jan" = 5 days)
function calculateDuration(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return '5 Days'
  }

  // Try to extract date range (e.g., "05 - 09 Jan")
  const rangeMatch = dateStr.match(/(\d+)\s*-\s*(\d+)/)
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1])
    const end = parseInt(rangeMatch[2])
    const days = end - start + 1 // +1 to include both start and end days
    return `${days} Days`
  }

  // Check for duration keywords
  const durationMatch = dateStr.match(/(\d+)\s*(day|days|week|weeks)/i)
  if (durationMatch) {
    const num = parseInt(durationMatch[1])
    const unit = durationMatch[2].toLowerCase()
    if (unit.startsWith('week')) {
      return `${num * 5} Days`
    }
    return `${num} Days`
  }

  return '5 Days' // Default
}

async function importCourses() {
  try {
    console.log('Reading Excel file...')
    const filePath = path.join(__dirname, '..', 'Calendar 2026.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' })

    console.log(`Total rows in file: ${data.length}`)

    // Find header row (should contain "Category", "Ref.", "Course Title")
    let headerRowIndex = -1
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i]
      const values = Object.values(row).map(v => String(v).toLowerCase())
      if (values.includes('category') && (values.includes('ref.') || values.includes('ref')) && values.includes('course title')) {
        headerRowIndex = i
        break
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('Could not find header row')
    }

    console.log(`Header row found at index: ${headerRowIndex}`)

    // Get column mappings from header row
    const headerRow = data[headerRowIndex]
    const columnMap = {}
    for (const [key, value] of Object.entries(headerRow)) {
      const val = String(value).toLowerCase().trim()
      if (val.includes('category')) columnMap.category = key
      if (val.includes('ref.') || val.includes('ref') || val.includes('reference')) columnMap.refCode = key
      if (val.includes('course title') || val.includes('title') || val.includes('name')) columnMap.courseTitle = key
      if (val.includes('course date') || val.includes('date') || val.includes('dates')) columnMap.date = key
    }

    console.log('Column mappings:', columnMap)

    // Process data rows (start from row after header)
    const courses = []
    const errors = []
    let skipped = 0

    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i]
      const category = String(row[columnMap.category] || '').trim()
      const refCode = String(row[columnMap.refCode] || '').trim()
      const courseTitle = String(row[columnMap.courseTitle] || '').trim()
      const dateStr = String(row[columnMap.date] || '').trim()

      // Skip empty rows
      if (!category && !refCode && !courseTitle) {
        skipped++
        continue
      }

      // Validate required fields
      if (!refCode || !category || !courseTitle) {
        errors.push({
          row: i + 1,
          error: `Missing required fields: ${!refCode ? 'Ref Code' : ''} ${!category ? 'Category' : ''} ${!courseTitle ? 'Course Title' : ''}`.trim(),
          data: { category, refCode, courseTitle, dateStr }
        })
        continue
      }

      courses.push({
        refCode,
        category,
        courseTitle,
        dateStr,
        row: i + 1
      })
    }

    console.log(`\nFound ${courses.length} courses to import`)
    console.log(`Skipped ${skipped} empty rows`)
    console.log(`Found ${errors.length} invalid rows`)

    if (errors.length > 0 && errors.length <= 20) {
      console.log('\nErrors:')
      errors.forEach(err => {
        console.log(`  Row ${err.row}: ${err.error}`)
      })
    } else if (errors.length > 20) {
      console.log('\nFirst 10 errors:')
      errors.slice(0, 10).forEach(err => {
        console.log(`  Row ${err.row}: ${err.error}`)
      })
      console.log(`  ... and ${errors.length - 10} more errors`)
    }

    // Import courses
    console.log('\nStarting import...')
    const results = {
      success: [],
      failed: [],
      skipped: []
    }

    for (let idx = 0; idx < courses.length; idx++) {
      const course = courses[idx]
      try {
        // Check if course already exists
        const existing = await prisma.program.findUnique({
          where: { refCode: course.refCode }
        })

        if (existing) {
          results.skipped.push({
            refCode: course.refCode,
            reason: 'Already exists'
          })
          continue
        }

        // Calculate duration
        const duration = calculateDuration(course.dateStr)

        // Generate content
        const generatedContent = generateCourseContent(
          course.courseTitle,
          course.category,
          duration
        )

        // Create program
        const program = await prisma.program.create({
          data: {
            refCode: course.refCode,
            programName: course.courseTitle,
            shortDescription: generatedContent.shortDescription,
            category: course.category,
            type: ['Public Program'],
            status: 'Published',
            duration: duration,
            targetAudience: generatedContent.targetAudience,
            learningObjectives: generatedContent.learningObjectives,
            trainingMethodology: generatedContent.trainingMethodology,
            introduction: generatedContent.introduction,
            description: generatedContent.description,
            organisationalImpact: generatedContent.organisationalImpact,
            personalImpact: generatedContent.personalImpact,
            whoShouldAttend: generatedContent.whoShouldAttend,
            courseOutline: {
              create: generatedContent.courseOutline
            },
            faqs: {
              create: generatedContent.faqs
            }
          }
        })

        results.success.push({
          refCode: program.refCode,
          programName: program.programName,
          row: course.row
        })

        if ((idx + 1) % 10 === 0) {
          console.log(`  Processed ${idx + 1}/${courses.length} courses...`)
        }
      } catch (error) {
        results.failed.push({
          refCode: course.refCode,
          error: error.message,
          row: course.row
        })
        console.error(`  Error importing ${course.refCode}: ${error.message}`)
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('IMPORT SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total courses in file: ${courses.length}`)
    console.log(`Successfully imported: ${results.success.length}`)
    console.log(`Failed: ${results.failed.length}`)
    console.log(`Skipped (already exist): ${results.skipped.length}`)
    console.log('='.repeat(50))

    if (results.failed.length > 0) {
      console.log('\nFailed imports:')
      results.failed.slice(0, 20).forEach(f => {
        console.log(`  ${f.refCode}: ${f.error}`)
      })
      if (results.failed.length > 20) {
        console.log(`  ... and ${results.failed.length - 20} more`)
      }
    }

    if (results.success.length > 0) {
      console.log('\nSuccessfully imported courses (first 20):')
      results.success.slice(0, 20).forEach(s => {
        console.log(`  ${s.refCode}: ${s.programName}`)
      })
      if (results.success.length > 20) {
        console.log(`  ... and ${results.success.length - 20} more`)
      }
    }

  } catch (error) {
    console.error('Error importing courses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importCourses()
  .then(() => {
    console.log('\nImport completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nImport failed:', error)
    process.exit(1)
  })
