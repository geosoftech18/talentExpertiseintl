/**
 * Cloudflare R2 Storage Utility
 * 
 * This utility handles file uploads to Cloudflare R2 (S3-compatible object storage)
 * with folder structure: year/month (e.g., 2025/02 for February 2025)
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

// Initialize S3 client for Cloudflare R2
// R2 is S3-compatible, so we use the AWS SDK
const s3Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto' as the region
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || ''
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || '' // Public URL for accessing files

/**
 * Get folder path based on current date (year/month)
 * @returns Folder path like "2025/02" for February 2025
 */
function getFolderPath(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Month is 0-indexed, so +1
  return `${year}/${month}`
}

/**
 * Upload a file to Cloudflare R2
 * @param fileBuffer - Buffer containing the file data
 * @param fileName - Name of the file (e.g., "INV-2025-0001.pdf")
 * @param contentType - MIME type of the file (e.g., "application/pdf")
 * @returns Public URL of the uploaded file
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'application/pdf'
): Promise<string> {
  try {
    // Validate environment variables
    if (!BUCKET_NAME) {
      throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not set in environment variables')
    }
    if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
      throw new Error('Cloudflare R2 credentials are not set in environment variables')
    }

    // Get folder path (year/month)
    const folderPath = getFolderPath()
    
    // Full key (path) in R2: year/month/filename
    const key = `${folderPath}/${fileName}`

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Make file publicly accessible (if your R2 bucket allows public access)
      // You can also use presigned URLs if you prefer private storage
    })

    await s3Client.send(command)

    // Return public URL
    // If PUBLIC_URL is set, use it; otherwise construct from endpoint
    if (PUBLIC_URL) {
      // Ensure PUBLIC_URL doesn't end with a slash
      const baseUrl = PUBLIC_URL.endsWith('/') ? PUBLIC_URL.slice(0, -1) : PUBLIC_URL
      return `${baseUrl}/${key}`
    } else {
      // Fallback: construct URL from endpoint (may require custom domain setup)
      const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
      return `${endpoint}/${BUCKET_NAME}/${key}`
    }
  } catch (error) {
    console.error('Error uploading file to Cloudflare R2:', error)
    throw error
  }
}

/**
 * Download a file from Cloudflare R2
 * @param key - Full key (path) of the file in R2 (e.g., "2025/02/INV-2025-0001.pdf")
 * @returns Buffer containing the file data
 */
export async function downloadFromR2(key: string): Promise<Buffer> {
  try {
    if (!BUCKET_NAME) {
      throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not set in environment variables')
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const response = await s3Client.send(command)
    
    if (!response.Body) {
      throw new Error('File not found in R2')
    }

    // Convert stream to buffer
    const stream = response.Body as Readable
    const chunks: Buffer[] = []
    
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }

    return Buffer.concat(chunks)
  } catch (error) {
    console.error('Error downloading file from Cloudflare R2:', error)
    throw error
  }
}

/**
 * Extract R2 key from a public URL
 * @param url - Public URL of the file
 * @returns R2 key (path) or null if URL doesn't match expected pattern
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    // If URL contains the folder structure pattern (year/month/filename)
    const match = url.match(/\d{4}\/\d{2}\/[^/]+$/)
    if (match) {
      return match[0]
    }
    
    // Try to extract from public URL
    if (PUBLIC_URL && url.startsWith(PUBLIC_URL)) {
      return url.replace(PUBLIC_URL, '').replace(/^\//, '')
    }
    
    return null
  } catch (error) {
    console.error('Error extracting key from URL:', error)
    return null
  }
}

/**
 * Check if Cloudflare R2 is configured
 * @returns true if R2 is properly configured, false otherwise
 */
export function isR2Configured(): boolean {
  return !!(
    BUCKET_NAME &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  )
}




