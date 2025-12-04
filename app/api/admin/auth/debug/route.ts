import { NextRequest, NextResponse } from 'next/server'
import { getOTPStoreState } from '@/lib/admin-auth'

/**
 * Debug endpoint to check OTP store state
 */
export async function GET(request: NextRequest) {
  try {
    const state = getOTPStoreState()
    return NextResponse.json({
      success: true,
      otpStore: state,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting OTP store state:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get OTP store state' },
      { status: 500 }
    )
  }
}

