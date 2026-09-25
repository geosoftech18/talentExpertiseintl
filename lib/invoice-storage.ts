import fs from 'fs'
import path from 'path'

/**
 * Absolute directory where invoice PDFs are written on disk.
 * Set INVOICE_STORAGE_PATH in Coolify (e.g. /data/invoices) for persistent storage.
 * Default: project `public/invoices` (served as static files in dev; use API route for consistency).
 */
export function getInvoiceStorageDir(): string {
  const raw = process.env.INVOICE_STORAGE_PATH?.trim()
  if (raw) {
    return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw)
  }
  return path.join(process.cwd(), 'public', 'invoices')
}

const INV_PDF_NAME = /^INV-\d{4}-\d{4}\.pdf$/i

/** URL stored in Invoice.pdfUrl for disk-backed PDFs (works outside `public/`). */
export function getLocalInvoicePdfUrl(pdfFileName: string): string {
  return `/api/invoices/file/${encodeURIComponent(pdfFileName)}`
}

/**
 * Resolve a local filesystem path for an invoice PDF from DB `pdfUrl`.
 * Returns null for remote URLs (R2, etc.).
 */
export function resolveLocalInvoicePdfPath(pdfUrl: string): string | null {
  if (!pdfUrl) return null

  // Absolute same-origin URLs that still point at local invoice routes
  let normalized = pdfUrl
  try {
    if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      const parsed = new URL(pdfUrl)
      // Keep path for local API / public invoice routes; treat other hosts as remote
      if (
        parsed.pathname.includes('/api/invoices/file/') ||
        parsed.pathname.startsWith('/invoices/')
      ) {
        normalized = parsed.pathname
      } else {
        return null
      }
    }
  } catch {
    return null
  }

  const apiMatch = normalized.match(/\/api\/invoices\/file\/([^/?#]+)/)
  if (apiMatch) {
    const name = decodeURIComponent(apiMatch[1])
    if (!INV_PDF_NAME.test(name)) return null
    return path.join(getInvoiceStorageDir(), name)
  }

  if (normalized.startsWith('/invoices/')) {
    const base = path.basename(normalized)
    if (!INV_PDF_NAME.test(base)) return null
    const legacyPublic = path.join(process.cwd(), 'public', 'invoices', base)
    const storage = path.join(getInvoiceStorageDir(), base)
    if (fs.existsSync(legacyPublic)) return legacyPublic
    if (fs.existsSync(storage)) return storage
    return legacyPublic
  }

  return null
}

export function isValidInvoicePdfFileName(name: string): boolean {
  return INV_PDF_NAME.test(name)
}
