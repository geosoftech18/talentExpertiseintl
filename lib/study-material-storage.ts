import fs from 'fs'
import path from 'path'

/**
 * Absolute directory for course study material files.
 * Set STUDY_MATERIAL_STORAGE_PATH in Coolify (e.g. /data/study-materials) for persistent storage.
 * Default: project `storage/study-materials` (outside public; served via API).
 */
export function getStudyMaterialStorageDir(): string {
  const raw = process.env.STUDY_MATERIAL_STORAGE_PATH?.trim()
  if (raw) {
    return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw)
  }
  return path.join(process.cwd(), 'storage', 'study-materials')
}

export function ensureStudyMaterialStorageDir(): string {
  const dir = getStudyMaterialStorageDir()
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx'])

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Some browsers send these
  'application/octet-stream',
])

export function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

export function isAllowedStudyMaterialFile(fileName: string, mimeType?: string | null): boolean {
  const ext = getExtension(fileName)
  if (!ALLOWED_EXTENSIONS.has(ext)) return false
  if (!mimeType || mimeType === 'application/octet-stream') return true
  return ALLOWED_MIME_TYPES.has(mimeType)
}

export function sanitizeOriginalFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\-() ]+/g, '_')
  return base.slice(0, 180) || 'study-material'
}

export function buildStoredStudyMaterialFileName(originalName: string): string {
  const sanitized = sanitizeOriginalFileName(originalName)
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${stamp}-${sanitized}`
}

/** URL stored in Program.studyMaterialUrl */
export function getStudyMaterialPublicUrl(storedFileName: string): string {
  return `/api/study-materials/file/${encodeURIComponent(storedFileName)}`
}

const STORED_NAME_PATTERN = /^[\w.\-() ]+\.(pdf|doc|docx|xls|xlsx)$/i

export function isValidStoredStudyMaterialFileName(name: string): boolean {
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) return false
  return STORED_NAME_PATTERN.test(name)
}

export function contentTypeForStudyMaterial(fileName: string): string {
  switch (getExtension(fileName)) {
    case 'pdf':
      return 'application/pdf'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xls':
      return 'application/vnd.ms-excel'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    default:
      return 'application/octet-stream'
  }
}

export function resolveStudyMaterialDiskPath(storedFileName: string): string | null {
  if (!isValidStoredStudyMaterialFileName(storedFileName)) return null
  return path.join(getStudyMaterialStorageDir(), storedFileName)
}

export function extractStoredFileNameFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    let pathname = url
    if (url.startsWith('http://') || url.startsWith('https://')) {
      pathname = new URL(url).pathname
    }
    const match = pathname.match(/\/api\/study-materials\/file\/([^/?#]+)/)
    if (!match) return null
    const name = decodeURIComponent(match[1])
    return isValidStoredStudyMaterialFileName(name) ? name : null
  } catch {
    return null
  }
}
