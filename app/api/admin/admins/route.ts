import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAILS } from '@/lib/admin-auth'

/**
 * GET /api/admin/admins
 * Get list of admin emails (read-only)
 * This reads from the single source of truth in lib/admin-auth.ts
 */
export async function GET(request: NextRequest) {
  try {
    // Return the admin emails from the single source of truth
    return NextResponse.json({
      success: true,
      data: ADMIN_EMAILS.map(email => ({ email })),
    })
  } catch (error) {
    console.error('Error fetching admin emails:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin emails' },
      { status: 500 }
    )
  }
}

