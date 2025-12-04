import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, storeOTP, isAdminEmail } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'

/**
 * Generate and send 6-digit OTP code to admin email
 */
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

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email is allowed for admin access
    if (!isAdminEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'This email is not authorized for admin access. Please use the correct admin email address.' },
        { status: 403 }
      )
    }

    // Generate 6-digit code
    const code = generateOTP()
    
    console.log(`[OTP Send] Generated code for ${normalizedEmail}: ${code}`)
    
    // Store OTP (in-memory, expires in 10 minutes)
    storeOTP(normalizedEmail, code)
    
    // Verify it was stored immediately
    const { logOTPStoreState } = await import('@/lib/admin-auth')
    console.log(`[OTP Send] After storing, checking store state:`)
    logOTPStoreState()
    
    console.log(`[OTP Send] OTP stored. Expires at: ${new Date(Date.now() + 10 * 60 * 1000)}`)

    // Send email with OTP code
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Admin Login Verification</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; margin-bottom: 20px; color: #4a5568;">Hello,</p>
          <p style="font-size: 16px; margin-bottom: 30px; color: #4a5568;">
            You requested to access the admin panel. Use the verification code below to complete your login:
          </p>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <div style="font-size: 42px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          <p style="font-size: 14px; color: #718096; margin-top: 30px;">
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </body>
      </html>
    `

    const emailSent = await sendEmail({
      to: normalizedEmail,
      subject: 'Admin Login Verification Code',
      html: emailHtml,
    })

    if (!emailSent) {
      console.error('Failed to send OTP email')
      // Still return success to prevent email enumeration
    }

    return NextResponse.json(
      { success: true, message: 'Verification code sent to your email' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}

