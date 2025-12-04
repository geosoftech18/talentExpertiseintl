import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { cookies } from 'next/headers'

/**
 * Check if admin is authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin_token')?.value

    if (!adminToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
    }

    const { email, valid } = verifyAdminToken(adminToken)

    if (!valid) {
      // Clear invalid token
      cookieStore.delete('admin_token')
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { authenticated: true, email },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error checking admin auth:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    )
  }
}

