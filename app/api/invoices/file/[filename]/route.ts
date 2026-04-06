import fs from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { getInvoiceStorageDir, isValidInvoicePdfFileName } from '@/lib/invoice-storage'

/**
 * GET /api/invoices/file/[filename]
 * Serves invoice PDFs from INVOICE_STORAGE_PATH (or legacy public/invoices).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename: raw } = await params
    const decoded = decodeURIComponent(raw)

    if (!isValidInvoicePdfFileName(decoded)) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    const primary = path.join(getInvoiceStorageDir(), decoded)
    const legacy = path.join(process.cwd(), 'public', 'invoices', decoded)

    let filePath: string | null = null
    try {
      await fs.access(primary)
      filePath = primary
    } catch {
      try {
        await fs.access(legacy)
        filePath = legacy
      } catch {
        filePath = null
      }
    }

    if (!filePath) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const buf = await fs.readFile(filePath)
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${decoded}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (e) {
    console.error('Invoice file serve error:', e)
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 })
  }
}
