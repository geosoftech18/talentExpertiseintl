import fs from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import {
  contentTypeForDownload,
  isValidStoredDownloadFileName,
  resolveDownloadDiskPath,
} from '@/lib/download-storage'

/**
 * GET /api/download-files/file/[filename]
 * Serves download files from DOWNLOAD_STORAGE_PATH (Coolify volume).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename: raw } = await params
    const decoded = decodeURIComponent(raw)

    if (!isValidStoredDownloadFileName(decoded)) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    const filePath = resolveDownloadDiskPath(decoded)
    if (!filePath) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const buf = await fs.readFile(filePath)
    const asDownload = request.nextUrl.searchParams.get('download') !== '0'
    const displayName = decoded.replace(/^\d+-[a-z0-9]+-/i, '') || decoded

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': contentTypeForDownload(decoded),
        'Content-Disposition': `${asDownload ? 'attachment' : 'inline'}; filename="${displayName.replace(/"/g, '')}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (e) {
    console.error('Download file serve error:', e)
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 })
  }
}
