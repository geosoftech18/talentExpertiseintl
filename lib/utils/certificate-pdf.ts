import fs from 'fs/promises'
import path from 'path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

interface CertificatePdfData {
  fullName: string
  courseTitle: string
  venue: string
  startDate: Date
  endDate: Date | null
  certificateNo: string
}

function monthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long' })
}

function ordinal(n: number): string {
  const v = n % 100
  if (v >= 11 && v <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

function formatCertificateDateRange(startDate: Date, endDate: Date | null): string {
  if (!endDate) {
    return `${ordinal(startDate.getDate())} ${monthName(startDate)} ${startDate.getFullYear()}`
  }
  const sameMonthYear =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth()
  if (sameMonthYear) {
    return `${ordinal(startDate.getDate())} to ${ordinal(endDate.getDate())} ${monthName(startDate)} ${startDate.getFullYear()}`
  }
  return `${ordinal(startDate.getDate())} ${monthName(startDate)} ${startDate.getFullYear()} to ${ordinal(endDate.getDate())} ${monthName(endDate)} ${endDate.getFullYear()}`
}

function fitFontSize(text: string, maxWidth: number, startSize: number, minSize: number, font: any): number {
  let size = startSize
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1
  }
  return size
}

export async function generateCertificatePdfBuffer(data: CertificatePdfData): Promise<Buffer> {
  const mediaDir = path.join(process.cwd(), 'public', 'certificate-media')
  const frameBytes = await fs.readFile(path.join(mediaDir, 'certificate-frame.png'))
  const logoBytes = await fs.readFile(path.join(mediaDir, 'company-logo.png'))
  const stampBytes = await fs.readFile(path.join(mediaDir, 'company-stamp.png'))
  const signatureBytes = await fs.readFile(path.join(mediaDir, 'signature.png'))

  const pdfDoc = await PDFDocument.create()

  const frame = await pdfDoc.embedPng(frameBytes)
  const logo = await pdfDoc.embedPng(logoBytes)
  const stamp = await pdfDoc.embedPng(stampBytes)
  const signature = await pdfDoc.embedPng(signatureBytes)

  // Normalize certificate size so output isn't oversized on download/preview.
  // Keep original frame aspect ratio.
  const targetWidth = 1400
  const targetHeight = Math.round((targetWidth * frame.height) / frame.width)
  const page = pdfDoc.addPage([targetWidth, targetHeight])
  const { width, height } = page.getSize()

  page.drawImage(frame, { x: 0, y: 0, width, height })

  const regular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  
  const italic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

  const blue = rgb(0.05, 0.2, 0.36)
  const gold = rgb(0.77, 0.57, 0.2)
  const black = rgb(0.12, 0.12, 0.12)

  const logoWidth = width * 0.23
  const logoHeight = (logo.height / logo.width) * logoWidth
  page.drawImage(logo, {
    x: (width - logoWidth) / 2,
    y: height * 0.83,
    width: logoWidth,
    height: logoHeight,
  })

  const title = 'Certificate of Attendance'
  const titleSize = fitFontSize(title, width * 0.8, 72, 54, regular)
  page.drawText(title, {
    x: (width - regular.widthOfTextAtSize(title, titleSize)) / 2,
    y: height * 0.795,
    size: titleSize,
    font: regular,
    color: gold,
  })

  const awardedText = 'Is Awarded to'
  const awardedSize = 40
  page.drawText(awardedText, {
    x: (width - regular.widthOfTextAtSize(awardedText, awardedSize)) / 2,
    y: height * 0.725,
    size: awardedSize,
    font: regular,
    color: black,
  })

  const nameText = data.fullName
  const nameSize = fitFontSize(nameText, width * 0.82, 86, 58, italic)
  page.drawText(nameText, {
    x: (width - italic.widthOfTextAtSize(nameText, nameSize)) / 2,
    y: height * 0.625,
    size: nameSize,
    font: italic,
    color: blue,
  })

  const attendText = 'For attending the training course'
  const attendSize = 40
  page.drawText(attendText, {
    x: (width - regular.widthOfTextAtSize(attendText, attendSize)) / 2,
    y: height * 0.525,
    size: attendSize,
    font: regular,
    color: black,
  })

  const courseSize = fitFontSize(data.courseTitle, width * 0.84, 56, 34,regular)
  page.drawText(data.courseTitle, {
    x: (width - regular.widthOfTextAtSize(data.courseTitle, courseSize)) / 2,
    y: height * 0.415,
    size: courseSize,
    font: regular,
    color: blue,
  })

  const heldText = 'Held on'
  const heldSize = 38
  page.drawText(heldText, {
    x: (width - regular.widthOfTextAtSize(heldText, heldSize)) / 2,
    y: height * 0.315,
    size: heldSize,
    font: regular,
    color: black,
  })

  const dateLine = `${data.venue} | ${formatCertificateDateRange(data.startDate, data.endDate)}`
  const dateSize = fitFontSize(dateLine, width * 0.78, 34, 24, regular)
  page.drawText(dateLine, {
    x: (width - regular.widthOfTextAtSize(dateLine, dateSize)) / 2,
    y: height * 0.255,
    size: dateSize,
    font: regular,
    color: blue,
  })

  const stampWidth = width * 0.16
  const stampHeight = (stamp.height / stamp.width) * stampWidth
  page.drawImage(stamp, {
    x: (width - stampWidth) / 2,
    y: height * 0.03,
    width: stampWidth,
    height: stampHeight,
  })

  const signatureWidth = width * 0.10
  const signatureHeight = (signature.height / signature.width) * signatureWidth
  page.drawImage(signature, {
    x: width * 0.72,
    y: height * 0.085,
    width: signatureWidth,
    height: signatureHeight,
  })

  page.drawLine({
    start: { x: width * 0.65, y: height * 0.078 },
    end: { x: width * 0.85, y: height * 0.078 },
    thickness: 1.6,
    color: rgb(0.22, 0.22, 0.62),
  })

  const director = 'Program Director'
  const directorSize = 30
  page.drawText(director, {
    x: width * 0.67,
    y: height * 0.05,
    size: directorSize,
    font: regular,
    color: black,
  })

  const certificateNo = `Certificate No. ${data.certificateNo}`
  const certNoSize = 30
  page.drawText(certificateNo, {
    x: width * 0.115,
    y: height * 0.05,
    size: certNoSize,
    font: regular,
    color: black,
  })

  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}

