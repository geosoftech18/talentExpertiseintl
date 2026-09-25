import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import {
  buildStoredDownloadFileName,
  ensureDownloadStorageDir,
  formatFileSize,
  getDownloadPublicUrl,
  isAllowedDownloadFile,
  resolveDownloadDiskPath,
  sanitizeOriginalFileName,
} from '@/lib/download-storage'

const MAX_BYTES = 30 * 1024 * 1024 // 30MB

/**
 * POST /api/admin/download-files
 * Upload a downloadable file to Coolify persistent storage.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400 })
    }

    if (!isAllowedDownloadFile(file.name)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Allowed: PDF, Word, Excel, PowerPoint, ZIP',
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size must be 30MB or less' },
        { status: 400 }
      )
    }

    const storedFileName = buildStoredDownloadFileName(file.name)
    const diskPath = resolveDownloadDiskPath(storedFileName)
    if (!diskPath) {
      return NextResponse.json({ success: false, error: 'Invalid file name' }, { status: 400 })
    }

    ensureDownloadStorageDir()
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(diskPath, buffer)

    return NextResponse.json({
      success: true,
      data: {
        url: getDownloadPublicUrl(storedFileName),
        fileName: sanitizeOriginalFileName(file.name),
        storedFileName,
        fileSize: formatFileSize(file.size),
        size: file.size,
      },
    })
  } catch (error) {
    console.error('Error uploading download file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
