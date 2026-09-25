import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import {
  buildStoredStudyMaterialFileName,
  ensureStudyMaterialStorageDir,
  getStudyMaterialPublicUrl,
  isAllowedStudyMaterialFile,
  resolveStudyMaterialDiskPath,
  sanitizeOriginalFileName,
} from '@/lib/study-material-storage'

const MAX_BYTES = 20 * 1024 * 1024 // 20MB

/**
 * POST /api/admin/programs/study-material
 * Upload optional study material (PDF / Word / Excel) to Coolify persistent disk.
 * Returns URL path to store on Program.studyMaterialUrl.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      )
    }

    if (!isAllowedStudyMaterialFile(file.name, file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Allowed: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)',
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size must be 20MB or less' },
        { status: 400 }
      )
    }

    const storedFileName = buildStoredStudyMaterialFileName(file.name)
    const diskPath = resolveStudyMaterialDiskPath(storedFileName)
    if (!diskPath) {
      return NextResponse.json(
        { success: false, error: 'Invalid file name' },
        { status: 400 }
      )
    }

    ensureStudyMaterialStorageDir()
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(diskPath, buffer)

    const url = getStudyMaterialPublicUrl(storedFileName)
    const originalName = sanitizeOriginalFileName(file.name)

    return NextResponse.json({
      success: true,
      data: {
        url,
        fileName: originalName,
        storedFileName,
        size: file.size,
      },
    })
  } catch (error) {
    console.error('Error uploading study material:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload study material' },
      { status: 500 }
    )
  }
}
