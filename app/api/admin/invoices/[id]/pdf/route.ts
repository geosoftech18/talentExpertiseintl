import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { loadInvoicePdfBuffer } from '@/lib/services/invoice-pdf-loader'

/**
 * GET /api/admin/invoices/[id]/pdf
 * Stream invoice PDF for admin View/Download (works with local + R2 on live).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        invoiceNo: true,
        pdfUrl: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    if (!invoice.pdfUrl) {
      return NextResponse.json(
        { success: false, error: 'Invoice PDF not found. Try regenerating the invoice.' },
        { status: 404 }
      )
    }

    const buffer = await loadInvoicePdfBuffer(invoice.pdfUrl, invoice.invoiceNo)
    if (!buffer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice PDF file is missing on the server. Use Regenerate to create it again.',
        },
        { status: 404 }
      )
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoiceNo}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('Error serving admin invoice PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load invoice PDF' },
      { status: 500 }
    )
  }
}
