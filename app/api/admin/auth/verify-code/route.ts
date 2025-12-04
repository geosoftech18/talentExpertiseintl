import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP, isAdminEmail, generateAdminToken, logOTPStoreState } from '@/lib/admin-auth'
import { cookies } from 'next/headers'

/**
 * Verify 6-digit OTP code and create admin session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedCode = code.trim()

    console.log(`[Verify] Attempting to verify code for: ${normalizedEmail}, Code: "${normalizedCode}"`)

    // Log store state before verification
    logOTPStoreState()

    // Check if email is allowed
    if (!isAdminEmail(normalizedEmail)) {
      console.log(`[Verify] Email not authorized: ${normalizedEmail}`)
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify OTP code
    const isValid = verifyOTP(normalizedEmail, normalizedCode)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 401 }
      )
    }

    // Generate admin session token
    const adminToken = generateAdminToken(normalizedEmail)

    // Set secure cookie with admin token
    const cookieStore = await cookies()
    cookieStore.set('admin_token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    return NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}

