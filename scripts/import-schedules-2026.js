const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx')
const path = require('path')

const prisma = new PrismaClient()

// Month name to number mapping
const monthMap = {
  'january': 0, 'jan': 0,
  'february': 1, 'feb': 1,
  'march': 2, 'mar': 2,
  'april': 3, 'apr': 3,
  'may': 4,
  'june': 5, 'jun': 5,
  'july': 6, 'jul': 6,
  'august': 7, 'aug': 7,
  'september': 8, 'sep': 8, 'sept': 8,
  'october': 9, 'oct': 9,
  'november': 10, 'nov': 10,
  'december': 11, 'dec': 11
}

// Parse date from "05 - 09 Jan" and month "January" to actual dates for 2026
function parseDates(dateStr, monthStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { startDate: null, endDate: null, error: 'No date string' }
  }

  // Clean the date string
  dateStr = dateStr.trim()
  monthStr = (monthStr || '').trim()

  // Try to extract date range (e.g., "05 - 09 Jan" or "05-09 Jan")
  const rangeMatch = dateStr.match(/(\d+)\s*[-–—]\s*(\d+)\s*([A-Za-z]+)?/i)
  if (rangeMatch) {
    const startDay = parseInt(rangeMatch[1])
    const endDay = parseInt(rangeMatch[2])
    let monthName = rangeMatch[3] || monthStr

    // Get month number
    const monthNameLower = monthName.toLowerCase().trim()
    const monthNum = monthMap[monthNameLower]

    if (monthNum === undefined) {
      return { startDate: null, endDate: null, error: `Unknown month: ${monthName}` }
    }

    // Create dates for 2026 using UTC to avoid timezone shifts
    const startDate = new Date(Date.UTC(2026, monthNum, startDay, 12, 0, 0, 0))
    const endDate = new Date(Date.UTC(2026, monthNum, endDay, 12, 0, 0, 0))

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { startDate: null, endDate: null, error: 'Invalid date values' }
    }

    return { startDate, endDate, error: null }
  }

  // Try single date (e.g., "05 Jan")
  const singleMatch = dateStr.match(/(\d+)\s*([A-Za-z]+)/i)
  if (singleMatch) {
    const day = parseInt(singleMatch[1])
    let monthName = singleMatch[2] || monthStr
    const monthNameLower = monthName.toLowerCase().trim()
    const monthNum = monthMap[monthNameLower]

    if (monthNum === undefined) {
      return { startDate: null, endDate: null, error: `Unknown month: ${monthName}` }
    }

    // Create date for 2026 using UTC to avoid timezone shifts
    const startDate = new Date(Date.UTC(2026, monthNum, day, 12, 0, 0, 0))
    if (isNaN(startDate.getTime())) {
      return { startDate: null, endDate: null, error: 'Invalid date value' }
    }

    return { startDate, endDate: null, error: null }
  }

  return { startDate: null, endDate: null, error: 'Could not parse date format' }
}

// Parse fee from string like " $5,750.00 " to number
function parseFee(feeStr) {
  if (!feeStr || typeof feeStr !== 'string') {
    return null
  }

  // Remove currency symbols, spaces, and commas
  const cleaned = feeStr.replace(/[$,\s]/g, '').trim()
  const parsed = parseFloat(cleaned)

  if (isNaN(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

async function importSchedules() {
  try {
    console.log('Reading Excel file...')
    const filePath = path.join(__dirname, '..', 'Calendar 2026.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' })

    console.log(`Total rows in file: ${data.length}`)

    // Find header row
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

    // Get column mappings
    const headerRow = data[headerRowIndex]
    const columnMap = {}
    for (const [key, value] of Object.entries(headerRow)) {
      const val = String(value).toLowerCase().trim()
      if (val.includes('category')) columnMap.category = key
      if (val.includes('ref.') || val.includes('ref') || val.includes('reference')) columnMap.refCode = key
      if (val.includes('course title') || val.includes('title') || val.includes('name')) columnMap.courseTitle = key
      if (val.includes('course date') || val.includes('date') || val.includes('dates')) columnMap.date = key
      if (val.includes('month')) columnMap.month = key
      if (val.includes('venue')) columnMap.venue = key
      if (val.includes('fee')) columnMap.fee = key
    }

    console.log('Column mappings:', columnMap)

    // Load all programs into a map for quick lookup
    console.log('\nLoading programs from database...')
    const programs = await prisma.program.findMany({
      select: { id: true, refCode: true, programName: true }
    })
    const programMap = new Map()
    programs.forEach(p => {
      programMap.set(p.refCode.trim(), p)
    })
    console.log(`Loaded ${programs.length} programs`)

    // Process data rows
    const schedules = []
    const errors = []
    let skipped = 0

    console.log('\nProcessing Excel rows...')
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i]
      const refCode = String(row[columnMap.refCode] || '').trim()
      const courseTitle = String(row[columnMap.courseTitle] || '').trim()
      const dateStr = String(row[columnMap.date] || '').trim()
      const monthStr = String(row[columnMap.month] || '').trim()
      const venue = String(row[columnMap.venue] || '').trim()
      const feeStr = String(row[columnMap.fee] || '').trim()

      // Skip completely empty rows
      if (!refCode && !courseTitle && !dateStr && !venue) {
        skipped++
        continue
      }

      // Validate required fields
      if (!refCode) {
        errors.push({
          row: i + 1,
          error: 'Missing Reference Code',
          data: { refCode, courseTitle, dateStr, monthStr, venue, feeStr }
        })
        continue
      }

      if (!dateStr) {
        errors.push({
          row: i + 1,
          error: 'Missing Course Dates',
          data: { refCode, courseTitle, dateStr, monthStr, venue, feeStr }
        })
        continue
      }

      if (!venue) {
        errors.push({
          row: i + 1,
          error: 'Missing Venue',
          data: { refCode, courseTitle, dateStr, monthStr, venue, feeStr }
        })
        continue
      }

      // Find program by refCode
      const program = programMap.get(refCode)
      if (!program) {
        errors.push({
          row: i + 1,
          error: `Program not found for refCode: ${refCode}`,
          data: { refCode, courseTitle, dateStr, monthStr, venue, feeStr }
        })
        continue
      }

      // Parse dates
      const { startDate, endDate, error: dateError } = parseDates(dateStr, monthStr)
      if (dateError || !startDate) {
        errors.push({
          row: i + 1,
          error: `Date parsing error: ${dateError || 'No start date'}`,
          data: { refCode, courseTitle, dateStr, monthStr, venue, feeStr }
        })
        continue
      }

      // Parse fee
      const fee = parseFee(feeStr)

      schedules.push({
        programId: program.id,
        programName: courseTitle || program.programName,
        startDate,
        endDate,
        venue,
        fee,
        row: i + 1,
        refCode
      })
    }

    console.log(`\nFound ${schedules.length} valid schedules to import`)
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
      console.log(`  ... and ${errors.length - 10} more`)
    }

    // Import schedules
    console.log('\nStarting schedule import...')
    const results = {
      success: [],
      failed: [],
      skipped: []
    }

    for (let idx = 0; idx < schedules.length; idx++) {
      const schedule = schedules[idx]
      try {
        // Check if schedule already exists (same program, start date, and venue)
        const existing = await prisma.schedule.findFirst({
          where: {
            programId: schedule.programId,
            startDate: schedule.startDate,
            venue: schedule.venue
          }
        })

        if (existing) {
          results.skipped.push({
            refCode: schedule.refCode,
            programName: schedule.programName,
            startDate: schedule.startDate.toISOString().split('T')[0],
            venue: schedule.venue,
            reason: 'Schedule already exists'
          })
          continue
        }

        // Create schedule
        const created = await prisma.schedule.create({
          data: {
            programId: schedule.programId,
            programName: schedule.programName,
            mentorId: null, // No mentor data in Excel
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            venue: schedule.venue,
            fee: schedule.fee,
            status: 'Open' // Default status
          }
        })

        results.success.push({
          refCode: schedule.refCode,
          programName: schedule.programName,
          startDate: schedule.startDate.toISOString().split('T')[0],
          endDate: schedule.endDate ? schedule.endDate.toISOString().split('T')[0] : null,
          venue: schedule.venue,
          fee: schedule.fee,
          row: schedule.row
        })

        if ((idx + 1) % 50 === 0) {
          console.log(`  Processed ${idx + 1}/${schedules.length} schedules...`)
        }
      } catch (error) {
        results.failed.push({
          refCode: schedule.refCode,
          error: error.message,
          row: schedule.row
        })
        console.error(`  Error importing schedule for ${schedule.refCode}: ${error.message}`)
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('SCHEDULE IMPORT SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total schedules in file: ${schedules.length}`)
    console.log(`Successfully imported: ${results.success.length}`)
    console.log(`Failed: ${results.failed.length}`)
    console.log(`Skipped (already exist): ${results.skipped.length}`)
    console.log('='.repeat(60))

    if (results.failed.length > 0) {
      console.log('\nFailed imports:')
      results.failed.slice(0, 20).forEach(f => {
        console.log(`  Row ${f.row} (${f.refCode}): ${f.error}`)
      })
      if (results.failed.length > 20) {
        console.log(`  ... and ${results.failed.length - 20} more`)
      }
    }

    if (results.success.length > 0) {
      console.log('\nSuccessfully imported schedules (first 20):')
      results.success.slice(0, 20).forEach(s => {
        console.log(`  ${s.refCode}: ${s.programName} - ${s.startDate} at ${s.venue} ($${s.fee || 'N/A'})`)
      })
      if (results.success.length > 20) {
        console.log(`  ... and ${results.success.length - 20} more`)
      }
    }

    if (results.skipped.length > 0 && results.skipped.length <= 10) {
      console.log('\nSkipped schedules (already exist):')
      results.skipped.slice(0, 10).forEach(s => {
        console.log(`  ${s.refCode}: ${s.programName} - ${s.startDate} at ${s.venue}`)
      })
    } else if (results.skipped.length > 10) {
      console.log(`\nSkipped ${results.skipped.length} schedules (already exist)`)
    }

  } catch (error) {
    console.error('Error importing schedules:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importSchedules()
  .then(() => {
    console.log('\nSchedule import completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nSchedule import failed:', error)
    process.exit(1)
  })


