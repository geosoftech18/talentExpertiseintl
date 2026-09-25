import fs from 'fs'
import path from 'path'
import { downloadFromR2, extractKeyFromUrl, isR2Configured } from '@/lib/storage/cloudflare-r2'
import { getInvoiceStorageDir, resolveLocalInvoicePdfPath } from '@/lib/invoice-storage'

/**
 * Load invoice PDF bytes from local disk, R2, or a public HTTP URL.
 * Used by admin PDF proxy and resend email so live View/Download/Resend work.
 */
export async function loadInvoicePdfBuffer(
  pdfUrl: string,
  invoiceNo?: string
): Promise<Buffer | null> {
  if (!pdfUrl && !invoiceNo) return null

  // 1) Local disk (API path, /invoices/, or absolute URL pointing at those routes)
  if (pdfUrl) {
    const localPath = resolveLocalInvoicePdfPath(pdfUrl)
    if (localPath && fs.existsSync(localPath)) {
      return fs.readFileSync(localPath)
    }
  }

  // 2) Fallback by invoice filename in storage dir
  if (invoiceNo) {
    const byName = path.join(getInvoiceStorageDir(), `${invoiceNo}.pdf`)
    if (fs.existsSync(byName)) {
      return fs.readFileSync(byName)
    }
    const legacy = path.join(process.cwd(), 'public', 'invoices', `${invoiceNo}.pdf`)
    if (fs.existsSync(legacy)) {
      return fs.readFileSync(legacy)
    }
  }

  // 3) Cloudflare R2
  if (pdfUrl && isR2Configured()) {
    try {
      let key = extractKeyFromUrl(pdfUrl)
      if (!key && invoiceNo) {
        // Older records may only store filename or broken URLs — try current-ish key patterns
        const match = pdfUrl.match(/\d{4}\/\d{2}\/[^/?#]+/)
        if (match) key = match[0]
      }
      if (!key && invoiceNo && pdfUrl.includes(invoiceNo)) {
        const ym = pdfUrl.match(/(\d{4})\/(\d{2})/)
        if (ym) key = `${ym[1]}/${ym[2]}/${invoiceNo}.pdf`
      }
      if (key) {
        return await downloadFromR2(key)
      }
    } catch (err) {
      console.warn('R2 download failed for invoice PDF:', err)
    }
  }

  // 4) Public HTTP(S) URL (custom domain / public R2)
  if (pdfUrl && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://'))) {
    try {
      const res = await fetch(pdfUrl)
      if (res.ok) {
        return Buffer.from(await res.arrayBuffer())
      }
    } catch (err) {
      console.warn('HTTP fetch failed for invoice PDF:', err)
    }
  }

  return null
}
