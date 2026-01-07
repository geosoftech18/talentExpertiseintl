/**
 * Admin Authentication Utility
 * Simple in-memory OTP storage (no database required)
 */

// Use global variable to persist across Next.js hot reloads in development
declare global {
  var __adminOTPStore: Map<string, { code: string; expires: number; email: string }> | undefined
}

// In-memory storage for OTP codes
// Use global variable in development to persist across hot reloads
// In production, consider using Redis or similar for multi-server deployments
const otpStore = 
  typeof global !== 'undefined' && global.__adminOTPStore
    ? global.__adminOTPStore
    : (global.__adminOTPStore = new Map<string, { code: string; expires: number; email: string }>())

// Clean up expired OTPs every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of otpStore.entries()) {
      if (value.expires < now) {
        otpStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

// Debug function to log store state
export function logOTPStoreState() {
  console.log(`[OTP Store] Current state:`)
  console.log(`  Total entries: ${otpStore.size}`)
  for (const [email, data] of otpStore.entries()) {
    console.log(`  - ${email}: code="${data.code}", expires=${new Date(data.expires).toISOString()}`)
  }
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Store OTP code for email verification
 * @param email Admin email
 * @param code 6-digit code
 * @returns true if stored successfully
 */
export function storeOTP(email: string, code: string): void {
  const normalizedEmail = email.toLowerCase().trim()
  const normalizedCode = String(code).trim() // Ensure it's a string
  
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutes expiry
  otpStore.set(normalizedEmail, { 
    code: normalizedCode, 
    expires, 
    email: normalizedEmail 
  })
  
  console.log(`[OTP Store] Stored OTP for ${normalizedEmail}: "${normalizedCode}" (type: ${typeof normalizedCode}, length: ${normalizedCode.length})`)
  console.log(`[OTP Store] Expires at: ${new Date(expires).toISOString()}`)
}

/**
 * Verify OTP code
 * @param email Admin email
 * @param code 6-digit code to verify
 * @returns true if code is valid and not expired
 */
export function verifyOTP(email: string, code: string): boolean {
  const normalizedEmail = email.toLowerCase().trim()
  const normalizedCode = String(code).trim().replace(/\s/g, '') // Ensure string, remove all whitespace
  
  console.log(`[OTP Verify] Starting verification for: ${normalizedEmail}`)
  console.log(`[OTP Verify] Code to verify: "${normalizedCode}" (type: ${typeof normalizedCode}, length: ${normalizedCode.length})`)
  
  const stored = otpStore.get(normalizedEmail)
  
  if (!stored) {
    console.log(`[OTP Verify] ❌ No OTP found for email: ${normalizedEmail}`)
    console.log(`[OTP Verify] Available emails in store:`, Array.from(otpStore.keys()))
    return false
  }
  
  console.log(`[OTP Verify] Found stored OTP: "${stored.code}" (type: ${typeof stored.code}, length: ${stored.code.length})`)
  
  // Check if expired
  const now = Date.now()
  const timeRemaining = stored.expires - now
  if (stored.expires < now) {
    console.log(`[OTP Verify] ❌ OTP expired. Expires: ${new Date(stored.expires).toISOString()}, Now: ${new Date(now).toISOString()}`)
    otpStore.delete(normalizedEmail)
    return false
  }
  
  console.log(`[OTP Verify] OTP not expired. Time remaining: ${Math.floor(timeRemaining / 1000)} seconds`)
  
  // Verify code - compare as strings, both trimmed
  const storedCode = String(stored.code).trim().replace(/\s/g, '')
  const providedCode = normalizedCode
  
  console.log(`[OTP Verify] Comparing codes:`)
  console.log(`  Stored:   "${storedCode}" (length: ${storedCode.length})`)
  console.log(`  Provided: "${providedCode}" (length: ${providedCode.length})`)
  console.log(`  Equal: ${storedCode === providedCode}`)
  
  if (storedCode !== providedCode) {
    console.log(`[OTP Verify] ❌ Code mismatch!`)
    // Character-by-character comparison for debugging
    for (let i = 0; i < Math.max(storedCode.length, providedCode.length); i++) {
      const storedChar = storedCode[i] || 'MISSING'
      const providedChar = providedCode[i] || 'MISSING'
      if (storedChar !== providedChar) {
        console.log(`  Position ${i}: stored="${storedChar}" (charCode: ${storedChar.charCodeAt ? storedChar.charCodeAt(0) : 'N/A'}) vs provided="${providedChar}" (charCode: ${providedChar.charCodeAt ? providedChar.charCodeAt(0) : 'N/A'})`)
      }
    }
    return false
  }
  
  console.log(`[OTP Verify] ✅ Success! Code verified for ${normalizedEmail}`)
  // Remove OTP after successful verification
  otpStore.delete(normalizedEmail)
  return true
}

/**
 * Check if email is allowed for admin access
 */
export function isAdminEmail(email: string): boolean {
  const allowedEmails = [
'pranavkhandekar152@gmail.com'
  ]
  return allowedEmails.includes(email.toLowerCase())
}

/**
 * Generate admin session token (simple JWT-like string)
 */
export function generateAdminToken(email: string): string {
  const payload = {
    email: email.toLowerCase(),
    role: 'admin',
    timestamp: Date.now()
  }
  // Simple base64 encoding (in production, use proper JWT with signing)
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/**
 * Verify admin session token
 */
export function verifyAdminToken(token: string): { email: string; valid: boolean } {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    const isValid = payload.role === 'admin' && 
                    isAdminEmail(payload.email) &&
                    (Date.now() - payload.timestamp) < maxAge
    
    return {
      email: payload.email,
      valid: isValid
    }
  } catch {
    return { email: '', valid: false }
  }
}

/**
 * Debug function to get OTP store state (for debugging only)
 */
export function getOTPStoreState() {
  const state: Record<string, { code: string; expires: Date; email: string }> = {}
  for (const [key, value] of otpStore.entries()) {
    state[key] = {
      code: value.code,
      expires: new Date(value.expires),
      email: value.email
    }
  }
  return state
}

