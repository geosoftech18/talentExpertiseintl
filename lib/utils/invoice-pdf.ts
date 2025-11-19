// Server-side only - PDF generation using pdf-lib
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

interface InvoiceData {
  invoiceNo: string
  issueDate: Date
  dueDate: Date
  customerName: string
  customerEmail: string
  customerAddress?: string
  customerCity?: string
  customerCountry?: string
  courseTitle: string
  amount: number
  status: string
}

/**
 * Generate PDF invoice with professional layout
 */
export async function generateInvoicePDF(
  invoiceData: InvoiceData,
  outputPath: string
): Promise<string> {
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size in points
    const { width, height } = page.getSize()

    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Colors
    const primaryBlue = rgb(0.12, 0.25, 0.69) // #1e40af
    const darkGray = rgb(0.31, 0.35, 0.41) // #4b5563
    const mediumGray = rgb(0.55, 0.58, 0.63) // #8b9199
    const lightGray = rgb(0.82, 0.84, 0.92) // #d1d5db
    const black = rgb(0.07, 0.09, 0.15) // #111827
    const white = rgb(1, 1, 1) // #ffffff

    // Margins
    const margin = 50
    const contentWidth = width - (margin * 2)
    let currentY = height - margin

    // ==========================================
    // HEADER SECTION
    // ==========================================
    
    // Company Logo/Name Area (Left)
    const companyName = process.env.COMPANY_NAME || 'Talent Expertise Institute'
    const companyAddress = process.env.COMPANY_ADDRESS || 'Dubai, UAE'
    const companyEmail = process.env.COMPANY_EMAIL || 'info@example.com'
    const companyPhone = process.env.COMPANY_PHONE || '+971 XX XXX XXXX'

    // Draw company name
    page.drawText(companyName, {
      x: margin,
      y: currentY,
      size: 18,
      font: helveticaBoldFont,
      color: primaryBlue,
    })
    currentY -= 25

    // Company details
    const companyDetails = [companyAddress, companyEmail, companyPhone]
    for (const detail of companyDetails) {
      page.drawText(detail, {
        x: margin,
        y: currentY,
        size: 9,
        font: helveticaFont,
        color: darkGray,
      })
      currentY -= 14
    }

    // Invoice Title and Details (Right)
    currentY = height - margin
    page.drawText('INVOICE', {
      x: width - margin - 100,
      y: currentY,
      size: 28,
      font: helveticaBoldFont,
      color: primaryBlue,
    })
    currentY -= 35

    // Invoice details
    const invoiceDetails = [
      { label: 'Invoice No:', value: invoiceData.invoiceNo },
      { label: 'Issue Date:', value: formatDate(invoiceData.issueDate) },
      { label: 'Due Date:', value: formatDate(invoiceData.dueDate) },
    ]

    for (const detail of invoiceDetails) {
      // Label
      page.drawText(detail.label, {
        x: width - margin - 100,
        y: currentY,
        size: 9,
        font: helveticaFont,
        color: mediumGray,
      })
      // Value
      const labelWidth = helveticaFont.widthOfTextAtSize(detail.label, 9)
      page.drawText(detail.value, {
        x: width - margin - 100 + labelWidth + 5,
        y: currentY,
        size: 9,
        font: helveticaBoldFont,
        color: black,
      })
      currentY -= 16
    }

    // ==========================================
    // BILLING INFORMATION SECTION
    // ==========================================
    
    currentY -= 30 // Space between header and billing info
    
    // Calculate the lowest Y position from company info
    const companyInfoBottom = height - margin - 25 - (companyDetails.length * 14)
    const billingStartY = Math.max(currentY, companyInfoBottom) - 20

    // Bill To Section
    currentY = billingStartY
    page.drawText('Bill To:', {
      x: width - margin - 200,
      y: currentY,
      size: 11,
      font: helveticaBoldFont,
      color: black,
    })
    currentY -= 18

    // Customer details
    const customerDetails: string[] = [invoiceData.customerName, invoiceData.customerEmail]
    if (invoiceData.customerAddress) {
      customerDetails.push(invoiceData.customerAddress)
    }
    if (invoiceData.customerCity && invoiceData.customerCountry) {
      customerDetails.push(`${invoiceData.customerCity}, ${invoiceData.customerCountry}`)
    } else if (invoiceData.customerCity) {
      customerDetails.push(invoiceData.customerCity)
    } else if (invoiceData.customerCountry) {
      customerDetails.push(invoiceData.customerCountry)
    }

    for (const detail of customerDetails) {
      page.drawText(detail, {
        x: width - margin - 200,
        y: currentY,
        size: 9,
        font: helveticaFont,
        color: darkGray,
      })
      currentY -= 14
    }

    // ==========================================
    // ITEMS TABLE SECTION
    // ==========================================
    
    currentY -= 30 // Space before table
    
    // Table header background
    const tableHeaderY = currentY + 5
    page.drawRectangle({
      x: margin,
      y: tableHeaderY - 20,
      width: contentWidth,
      height: 25,
      color: primaryBlue,
      opacity: 0.1,
    })

    // Table header text
    page.drawText('Description', {
      x: margin + 10,
      y: tableHeaderY - 5,
      size: 10,
      font: helveticaBoldFont,
      color: black,
    })

    page.drawText('Amount', {
      x: width - margin - 120,
      y: tableHeaderY - 5,
      size: 10,
      font: helveticaBoldFont,
      color: black,
    })

    // Header underline
    page.drawLine({
      start: { x: margin, y: tableHeaderY - 20 },
      end: { x: width - margin, y: tableHeaderY - 20 },
      thickness: 1,
      color: lightGray,
    })

    // Table row
    currentY = tableHeaderY - 35
    const courseTitle = invoiceData.courseTitle || 'Course Registration'
    
    // Wrap long course titles
    const maxTitleWidth = width - margin - 150
    const titleLines = wrapText(courseTitle, maxTitleWidth, helveticaFont, 10)
    
    let rowHeight = Math.max(20, titleLines.length * 15)
    
    // Draw course title (may be multiple lines)
    let titleY = currentY + (rowHeight - 10)
    for (const line of titleLines) {
      page.drawText(line, {
        x: margin + 10,
        y: titleY,
        size: 10,
        font: helveticaFont,
        color: darkGray,
      })
      titleY -= 15
    }

    // Amount (right aligned)
    page.drawText(formatCurrency(invoiceData.amount), {
      x: width - margin - 120,
      y: currentY + (rowHeight - 10),
      size: 10,
      font: helveticaBoldFont,
      color: darkGray,
    })

    // Row bottom line
    currentY -= rowHeight
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: width - margin, y: currentY },
      thickness: 0.5,
      color: lightGray,
    })

    // ==========================================
    // TOTALS SECTION
    // ==========================================
    
    currentY -= 25

    // Total label and amount
    const totalLabel = 'Total Amount:'
    const totalAmount = formatCurrency(invoiceData.amount)
    
    page.drawText(totalLabel, {
      x: width - margin - 200,
      y: currentY,
      size: 11,
      font: helveticaBoldFont,
      color: black,
    })

    const totalLabelWidth = helveticaBoldFont.widthOfTextAtSize(totalLabel, 11)
    page.drawText(totalAmount, {
      x: width - margin - 120,
      y: currentY,
      size: 12,
      font: helveticaBoldFont,
      color: primaryBlue,
    })

    // Total underline
    currentY -= 5
    page.drawLine({
      start: { x: width - margin - 200, y: currentY },
      end: { x: width - margin, y: currentY },
      thickness: 1.5,
      color: primaryBlue,
    })

    // ==========================================
    // STATUS BADGE
    // ==========================================
    
    currentY -= 30
    
    const statusColor = getStatusColor(invoiceData.status)
    const statusText = invoiceData.status.toUpperCase()
    const statusFontSize = 9
    const statusTextWidth = helveticaBoldFont.widthOfTextAtSize(statusText, statusFontSize)
    const statusPadding = 8
    const statusBoxWidth = statusTextWidth + (statusPadding * 2)
    const statusBoxHeight = 18
    const statusX = width - margin - statusBoxWidth
    const statusY = currentY

    // Status badge background
    page.drawRectangle({
      x: statusX,
      y: statusY,
      width: statusBoxWidth,
      height: statusBoxHeight,
      color: statusColor,
      opacity: 0.15,
    })

    // Status badge border
    page.drawRectangle({
      x: statusX,
      y: statusY,
      width: statusBoxWidth,
      height: statusBoxHeight,
      borderColor: statusColor,
      borderWidth: 1.5,
    })

    // Status text
    page.drawText(statusText, {
      x: statusX + statusPadding,
      y: statusY + 4,
      size: statusFontSize,
      font: helveticaBoldFont,
      color: statusColor,
    })

    // ==========================================
    // FOOTER SECTION
    // ==========================================
    
    currentY -= 50

    // Thank you message
    const thankYouText = 'Thank you for your business!'
    const thankYouWidth = helveticaFont.widthOfTextAtSize(thankYouText, 9)
    page.drawText(thankYouText, {
      x: (width - thankYouWidth) / 2,
      y: currentY,
      size: 9,
      font: helveticaFont,
      color: mediumGray,
    })

    currentY -= 18

    // Payment instructions
    const paymentText = 'Please make payment by the due date to avoid any late fees.'
    const paymentWidth = helveticaFont.widthOfTextAtSize(paymentText, 8)
    page.drawText(paymentText, {
      x: (width - paymentWidth) / 2,
      y: currentY,
      size: 8,
      font: helveticaFont,
      color: mediumGray,
    })

    // Payment info if provided
    if (process.env.COMPANY_PAYMENT_INFO) {
      currentY -= 15
      const paymentInfo = process.env.COMPANY_PAYMENT_INFO
      const paymentInfoWidth = helveticaFont.widthOfTextAtSize(paymentInfo, 8)
      page.drawText(paymentInfo, {
        x: (width - paymentInfoWidth) / 2,
        y: currentY,
        size: 8,
        font: helveticaFont,
        color: mediumGray,
      })
    }

    // Bottom border
    page.drawLine({
      start: { x: margin, y: margin },
      end: { x: width - margin, y: margin },
      thickness: 1,
      color: lightGray,
    })

    // ==========================================
    // SAVE PDF
    // ==========================================
    
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, pdfBytes)

    return outputPath
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

/**
 * Wrap text to fit within a maximum width
 */
function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = font.widthOfTextAtSize(testLine, fontSize)

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.length > 0 ? lines : [text]
}

/**
 * Format date to readable string
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Get status color for badge
 */
function getStatusColor(status: string) {
  const statusUpper = status.toUpperCase()
  switch (statusUpper) {
    case 'PAID':
      return rgb(0.06, 0.73, 0.51) // green #10b981
    case 'PENDING':
      return rgb(0.96, 0.62, 0.04) // amber #f59e0b
    case 'OVERDUE':
      return rgb(0.94, 0.27, 0.27) // red #ef4444
    case 'CANCELLED':
      return rgb(0.42, 0.45, 0.50) // gray #6b7280
    default:
      return rgb(0.42, 0.45, 0.50) // gray #6b7280
  }
}
