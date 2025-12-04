import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Logout admin by clearing session cookie
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_token')

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error logging out:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    )
  }
}

