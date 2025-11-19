import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasLinkedInClientId: !!process.env.LINKEDIN_CLIENT_ID,
    hasLinkedInClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    // Don't expose secrets, just check if they exist
  })
}

