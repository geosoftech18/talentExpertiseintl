import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { generateCourseContent } from '@/lib/utils/generate-course-content'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    // Fetch all active certificates to match with sheet names
    const allCertificates = await prisma.certificate.findMany({
      where: { status: 'Active' },
      select: { id: true, name: true },
    })
    
    // Create a map of certificate names to IDs (case-insensitive)
    const certificateMap = new Map<string, string>()
    for (const cert of allCertificates) {
      certificateMap.set(cert.name.toLowerCase().trim(), cert.id)
    }

    // Process each row
    const results = {
      success: [] as any[],
      errors: [] as any[],
    }

    // Process all sheets in the workbook
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { raw: false })

      if (!data || data.length === 0) {
        continue // Skip empty sheets
      }

      // Try to match sheet name to a certificate
      const sheetNameLower = sheetName.toLowerCase().trim()
      const matchedCertificateId = certificateMap.get(sheetNameLower)
      const certificateIds: string[] = matchedCertificateId ? [matchedCertificateId] : []

      // Log certificate matching for debugging
      if (matchedCertificateId) {
        console.log(`Sheet "${sheetName}" matched to certificate ID: ${matchedCertificateId}`)
      } else {
        console.log(`Sheet "${sheetName}" - no matching certificate found`)
      }

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any
        try {
          // Extract data from Excel row (case-insensitive column matching)
          const refCode = findColumnValue(row, ['refcode', 'reference code', 'reference_code', 'code'])
          const category = findColumnValue(row, ['category', 'cat'])
          const courseName = findColumnValue(row, ['course name', 'course_name', 'title', 'name', 'program name', 'program_name'])
          const dateStr = findColumnValue(row, ['date', 'from date', 'from_date', 'start date', 'start_date'])

          // Validate required fields
          if (!refCode || !category || !courseName) {
            results.errors.push({
              row: i + 2, // +2 because Excel rows start at 1 and we have header
              sheet: sheetName,
              error: `Missing required fields: ${!refCode ? 'Reference Code' : ''} ${!category ? 'Category' : ''} ${!courseName ? 'Course Name' : ''}`.trim(),
              data: row,
            })
            continue
          }

          // Check if reference code already exists
          const existingProgram = await prisma.program.findUnique({
            where: { refCode: String(refCode).trim() },
          })

          if (existingProgram) {
            results.errors.push({
              row: i + 2,
              sheet: sheetName,
              error: `Reference code "${refCode}" already exists`,
              data: row,
            })
            continue
          }

          // Calculate duration from date
          let duration = '5 Days' // Default
          if (dateStr) {
            duration = calculateDuration(dateStr)
          }

          // Generate course content based on course name
          const generatedContent = generateCourseContent(String(courseName).trim(), String(category).trim(), duration)

          // Create program
          const program = await prisma.program.create({
            data: {
              refCode: String(refCode).trim(),
              programName: String(courseName).trim(),
              shortDescription: generatedContent.shortDescription,
              category: String(category).trim(),
              type: ['Public Program'], // Default type
              status: 'Published', // Set to Published as requested
              duration: duration,
              targetAudience: generatedContent.targetAudience,
              learningObjectives: generatedContent.learningObjectives,
              trainingMethodology: generatedContent.trainingMethodology,
              introduction: generatedContent.introduction,
              description: generatedContent.description,
              organisationalImpact: generatedContent.organisationalImpact,
              personalImpact: generatedContent.personalImpact,
              whoShouldAttend: generatedContent.whoShouldAttend,
              certificateIds: certificateIds, // Link certificates based on sheet name
              courseOutline: {
                create: generatedContent.courseOutline,
              },
              faqs: {
                create: generatedContent.faqs,
              },
            },
            include: {
              courseOutline: true,
              faqs: true,
            },
          })

          results.success.push({
            row: i + 2,
            sheet: sheetName,
            refCode: program.refCode,
            programName: program.programName,
            certificateLinked: certificateIds.length > 0,
          })
        } catch (error: any) {
          results.errors.push({
            row: i + 2,
            sheet: sheetName,
            error: error.message || 'Unknown error',
            data: row,
          })
        }
      } // End of row loop
    } // End of sheet loop

    // Calculate total rows processed across all sheets
    const totalRows = results.success.length + results.errors.length

    return NextResponse.json({
      success: true,
      results: {
        total: totalRows,
        successful: results.success.length,
        failed: results.errors.length,
        success: results.success,
        errors: results.errors,
      },
    })
  } catch (error: any) {
    console.error('Error in bulk import:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process bulk import' },
      { status: 500 }
    )
  }
}

// Helper function to find column value (case-insensitive)
function findColumnValue(row: any, possibleKeys: string[]): string | null {
  const rowKeys = Object.keys(row)
  for (const key of possibleKeys) {
    const foundKey = rowKeys.find(
      (rk) => rk.toLowerCase().trim() === key.toLowerCase().trim()
    )
    if (foundKey && row[foundKey]) {
      return String(row[foundKey]).trim()
    }
  }
  return null
}

// Calculate duration from date string
// If date is provided, try to extract duration info, otherwise default to 5 Days
function calculateDuration(dateStr: string): string {
  try {
    // Try to parse the date to validate it
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return '5 Days' // Default if parsing fails
    }

    // Check if date string contains duration information (e.g., "2026-01-15 to 2026-01-19")
    const dateRangeMatch = dateStr.match(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/)
    if (dateRangeMatch) {
      const startDate = new Date(dateRangeMatch[1])
      const endDate = new Date(dateRangeMatch[2])
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end days
        return `${diffDays} Days`
      }
    }

    // Check if string contains duration keywords
    const durationMatch = dateStr.match(/(\d+)\s*(day|days|week|weeks)/i)
    if (durationMatch) {
      const num = parseInt(durationMatch[1])
      const unit = durationMatch[2].toLowerCase()
      if (unit.startsWith('week')) {
        return `${num * 5} Days` // Convert weeks to days (assuming 5 working days per week)
      }
      return `${num} Days`
    }

    // Default duration
    return '5 Days'
  } catch {
    return '5 Days'
  }
}

