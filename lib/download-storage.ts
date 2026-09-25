import fs from 'fs'
import path from 'path'

import { slugifyDownloadCategory } from '@/lib/download-slug'

/**
 * Persistent storage for public download files (Coolify volume).
 * Set DOWNLOAD_STORAGE_PATH (e.g. /data/downloads) on Coolify.
 * Default: project `storage/downloads`.
 */
export function getDownloadStorageDir(): string {
  const raw = process.env.DOWNLOAD_STORAGE_PATH?.trim()
  if (raw) {
    return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw)
  }
  return path.join(process.cwd(), 'storage', 'downloads')
}

export function ensureDownloadStorageDir(): string {
  const dir = getDownloadStorageDir()
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'zip',
])

export function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

export function isAllowedDownloadFile(fileName: string): boolean {
  return ALLOWED_EXTENSIONS.has(getExtension(fileName))
}

export function sanitizeOriginalFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\-() ]+/g, '_')
  return base.slice(0, 180) || 'download'
}

export function buildStoredDownloadFileName(originalName: string): string {
  const sanitized = sanitizeOriginalFileName(originalName)
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${stamp}-${sanitized}`
}

export function getDownloadPublicUrl(storedFileName: string): string {
  return `/api/download-files/file/${encodeURIComponent(storedFileName)}`
}

const STORED_NAME_PATTERN = /^[\w.\-() ]+\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)$/i

export function isValidStoredDownloadFileName(name: string): boolean {
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) return false
  return STORED_NAME_PATTERN.test(name)
}

export function contentTypeForDownload(fileName: string): string {
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
    case 'ppt':
      return 'application/vnd.ms-powerpoint'
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    case 'zip':
      return 'application/zip'
    default:
      return 'application/octet-stream'
  }
}

export function resolveDownloadDiskPath(storedFileName: string): string | null {
  if (!isValidStoredDownloadFileName(storedFileName)) return null
  return path.join(getDownloadStorageDir(), storedFileName)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export { slugifyDownloadCategory } from '@/lib/download-slug'
