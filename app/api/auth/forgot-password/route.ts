import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generatePasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expires = new Date()
      expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

      // Delete any existing reset tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: email.toLowerCase().trim() },
      })

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          email: email.toLowerCase().trim(),
          token: resetToken,
          expires,
        },
      })

      // Generate reset link
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`

      // Send email
      const emailSent = await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: generatePasswordResetEmail(resetLink, user.name || undefined),
        text: `Hello${user.name ? ` ${user.name}` : ''},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you didn't request a password reset, please ignore this email.`,
      })

      if (!emailSent) {
        console.error('Failed to send password reset email')
        // Still return success to prevent email enumeration
      }
    }

    // Always return success message
    return NextResponse.json(
      {
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}


