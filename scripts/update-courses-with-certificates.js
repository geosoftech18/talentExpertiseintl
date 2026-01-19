const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx')
const path = require('path')

const prisma = new PrismaClient()

async function updateCoursesWithCertificates() {
  try {
    console.log('Reading Certified Programs Excel file...')
    const filePath = path.join(__dirname, '..', 'Certified Programs.xlsx')
    
    if (!require('fs').existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const workbook = XLSX.readFile(filePath)
    console.log(`Found ${workbook.SheetNames.length} sheets:`, workbook.SheetNames)

    // Fetch all active certificates to match with sheet names
    console.log('\nLoading certificates from database...')
    const allCertificates = await prisma.certificate.findMany({
      where: { status: 'Active' },
      select: { id: true, name: true },
    })
    
    // Create a map of certificate names to IDs (case-insensitive)
    const certificateMap = new Map()
    for (const cert of allCertificates) {
      certificateMap.set(cert.name.toLowerCase().trim(), cert.id)
    }
    
    console.log(`Loaded ${allCertificates.length} active certificates:`)
    allCertificates.forEach(cert => {
      console.log(`  - ${cert.name} (ID: ${cert.id})`)
    })

    const results = {
      updated: [],
      notFound: [],
      noCertificate: [],
      errors: [],
    }

    // Process each sheet in the workbook
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n\nProcessing sheet: "${sheetName}"`)
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' })

      if (!data || data.length === 0) {
        console.log(`  Sheet "${sheetName}" is empty, skipping...`)
        continue
      }

      // Try to match sheet name to a certificate
      const sheetNameLower = sheetName.toLowerCase().trim()
      const matchedCertificateId = certificateMap.get(sheetNameLower)
      
      if (!matchedCertificateId) {
        console.log(`  ⚠️  No matching certificate found for sheet "${sheetName}"`)
        console.log(`  Available certificates: ${Array.from(certificateMap.keys()).join(', ')}`)
        results.noCertificate.push({
          sheet: sheetName,
          reason: 'No matching certificate found',
        })
        continue
      }

      const matchedCert = allCertificates.find(c => c.id === matchedCertificateId)
      console.log(`  ✓ Matched to certificate: "${matchedCert.name}" (ID: ${matchedCertificateId})`)

      // Find header row to get column mappings
      let headerRowIndex = -1
      for (let i = 0; i < Math.min(10, data.length); i++) {
        const row = data[i]
        const values = Object.values(row).map(v => String(v).toLowerCase())
        if (values.includes('ref.') || values.includes('ref') || values.includes('reference') || values.includes('refcode')) {
          headerRowIndex = i
          break
        }
      }

      if (headerRowIndex === -1) {
        console.log(`  ⚠️  Could not find header row in sheet "${sheetName}", skipping...`)
        results.errors.push({
          sheet: sheetName,
          error: 'Could not find header row',
        })
        continue
      }

      // Get column mappings from header row
      const headerRow = data[headerRowIndex]
      const columnMap = {}
      for (const [key, value] of Object.entries(headerRow)) {
        const val = String(value).toLowerCase().trim()
        if (val.includes('ref.') || val.includes('ref') || val.includes('reference') || val.includes('refcode')) {
          columnMap.refCode = key
        }
      }

      if (!columnMap.refCode) {
        console.log(`  ⚠️  Could not find Reference Code column in sheet "${sheetName}", skipping...`)
        results.errors.push({
          sheet: sheetName,
          error: 'Could not find Reference Code column',
        })
        continue
      }

      // Extract all reference codes from this sheet
      const refCodes = new Set()
      for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i]
        const refCode = String(row[columnMap.refCode] || '').trim()
        if (refCode) {
          refCodes.add(refCode)
        }
      }

      console.log(`  Found ${refCodes.size} unique reference codes in this sheet`)

      // Update courses with this certificate
      let updatedCount = 0
      let notFoundCount = 0

      for (const refCode of refCodes) {
        try {
          // Find the program by refCode
          const program = await prisma.program.findUnique({
            where: { refCode: refCode },
            select: { id: true, refCode: true, programName: true, certificateIds: true },
          })

          if (!program) {
            console.log(`    ⚠️  Course with refCode "${refCode}" not found in database`)
            results.notFound.push({
              sheet: sheetName,
              refCode: refCode,
            })
            notFoundCount++
            continue
          }

          // Check if certificate is already linked
          const existingCertIds = program.certificateIds || []
          if (existingCertIds.includes(matchedCertificateId)) {
            console.log(`    ⊙ Course "${program.programName}" (${refCode}) already has this certificate, skipping...`)
            continue
          }

          // Update the program with the certificate
          const updatedCertIds = [...existingCertIds, matchedCertificateId]
          await prisma.program.update({
            where: { id: program.id },
            data: {
              certificateIds: updatedCertIds,
            },
          })

          console.log(`    ✓ Updated "${program.programName}" (${refCode}) with certificate "${matchedCert.name}"`)
          results.updated.push({
            sheet: sheetName,
            refCode: refCode,
            programName: program.programName,
            certificateName: matchedCert.name,
          })
          updatedCount++
        } catch (error) {
          console.error(`    ✗ Error updating course "${refCode}":`, error.message)
          results.errors.push({
            sheet: sheetName,
            refCode: refCode,
            error: error.message,
          })
        }
      }

      console.log(`  Summary for sheet "${sheetName}":`)
      console.log(`    - Updated: ${updatedCount} courses`)
      console.log(`    - Not found: ${notFoundCount} courses`)
    }

    // Final summary
    console.log('\n\n' + '='.repeat(60))
    console.log('FINAL SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total courses updated: ${results.updated.length}`)
    console.log(`Total courses not found: ${results.notFound.length}`)
    console.log(`Total sheets without matching certificates: ${results.noCertificate.length}`)
    console.log(`Total errors: ${results.errors.length}`)

    if (results.updated.length > 0) {
      console.log('\nUpdated courses:')
      results.updated.forEach(item => {
        console.log(`  - ${item.programName} (${item.refCode}) - ${item.certificateName}`)
      })
    }

    if (results.notFound.length > 0) {
      console.log('\nCourses not found in database:')
      results.notFound.forEach(item => {
        console.log(`  - ${item.refCode} (from sheet: ${item.sheet})`)
      })
    }

    if (results.noCertificate.length > 0) {
      console.log('\nSheets without matching certificates:')
      results.noCertificate.forEach(item => {
        console.log(`  - ${item.sheet}`)
      })
    }

    if (results.errors.length > 0) {
      console.log('\nErrors:')
      results.errors.forEach(item => {
        console.log(`  - ${item.sheet}: ${item.error || 'Unknown error'}`)
      })
    }

    console.log('\n✓ Update process completed!')
  } catch (error) {
    console.error('Error updating courses with certificates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateCoursesWithCertificates()
  .then(() => {
    console.log('\nScript completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nScript failed:', error)
    process.exit(1)
  })

