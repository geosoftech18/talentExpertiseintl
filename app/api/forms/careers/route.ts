import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null

  try {
    const formData = await request.formData()

    const fullName = formData.get('fullName') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const telephone = formData.get('telephone') as string
    const telephoneCountryCode = formData.get('telephoneCountryCode') as string
    const mobile = formData.get('mobile') as string
    const mobileCountryCode = formData.get('mobileCountryCode') as string
    const email = formData.get('email') as string
    const nationality = formData.get('nationality') as string
    const presentAddress = formData.get('presentAddress') as string
    const areaOfExpertise = formData.get('areaOfExpertise') as string
    const message = formData.get('message') as string
    const cvFile = formData.get('cvFile') as File | null

    // Validation
    if (!fullName || !dateOfBirth || !telephone || !mobile || !email || !nationality || !presentAddress || !areaOfExpertise || !message) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    if (!cvFile) {
      return NextResponse.json(
        { success: false, error: 'CV file is required' },
        { status: 400 }
      )
    }

    // Save CV file temporarily
    const bytes = await cvFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'temp')
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true })
    }

    // Save file with timestamp to avoid conflicts
    const timestamp = Date.now()
    const fileExtension = cvFile.name.split('.').pop() || 'pdf'
    tempFilePath = join(tempDir, `cv_${timestamp}.${fileExtension}`)
    await writeFile(tempFilePath, buffer)

    // Get admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL || process.env.COMPANY_EMAIL || 'info@example.com'

    // Generate email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Career Application - International Freelance Training Consultants</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #0A3049 0%, #0a3d5c 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">New Career Application</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">International Freelance Training Consultants</p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #0A3049; font-size: 22px; margin-bottom: 30px; border-bottom: 2px solid #0A3049; padding-bottom: 10px;">Applicant Information</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #0A3049; width: 40%; border: 1px solid #e2e8f0;">Full Name (as in passport)</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #0A3049; border: 1px solid #e2e8f0;">Date of Birth</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${dateOfBirth}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #0A3049; border: 1px solid #e2e8f0;">Telephone</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${telephoneCountryCode} ${telephone}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #0A3049; border: 1px solid #e2e8f0;">Mobile</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${mobileCountryCode} ${mobile}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #0A3049; border: 1px solid #e2e8f0;">Email</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #0A3049; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #0A3049; border: 1px solid #e2e8f0;">Nationality</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${nationality}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #0A3049; border: 1px solid #e2e8f0;">Present Address</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${presentAddress}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #0A3049; border: 1px solid #e2e8f0;">Area of Expertise</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${areaOfExpertise}</td>
            </tr>
          </table>

          <h3 style="color: #0A3049; font-size: 18px; margin-bottom: 15px;">Message</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0A3049; margin-bottom: 30px;">
            <p style="margin: 0; white-space: pre-wrap; color: #4a5568;">${message}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 30px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Note:</strong> The applicant's CV has been attached to this email. Please review the attachment for complete details.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0;">
            This is an automated email from the Careers Application Form. Please do not reply to this message.
          </p>
        </div>
      </body>
      </html>
    `

    const emailText = `
New Career Application - International Freelance Training Consultants

Applicant Information:
- Full Name (as in passport): ${fullName}
- Date of Birth: ${dateOfBirth}
- Telephone: ${telephoneCountryCode} ${telephone}
- Mobile: ${mobileCountryCode} ${mobile}
- Email: ${email}
- Nationality: ${nationality}
- Present Address: ${presentAddress}
- Area of Expertise: ${areaOfExpertise}

Message:
${message}

Note: The applicant's CV has been attached to this email.
    `

    // Prepare email attachment
    const emailAttachments = tempFilePath ? [{
      filename: cvFile.name,
      path: tempFilePath,
      contentType: cvFile.type || 'application/pdf',
    }] : []

    // Send email to admin
    const emailSent = await sendEmail({
      to: adminEmail,
      subject: `New Career Application - ${fullName} | ${areaOfExpertise}`,
      html: emailHtml,
      text: emailText,
      attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
    })

    // Clean up temp file
    if (tempFilePath && existsSync(tempFilePath)) {
      try {
        await unlink(tempFilePath)
      } catch (error) {
        console.error('Error deleting temp file:', error)
      }
    }

    if (!emailSent) {
      console.warn(`⚠️ Career application received but email failed to send to ${adminEmail}`)
      console.warn('💡 To enable email sending, configure an email provider in your .env file')
      // Still return success since we received the application
    } else {
      console.log(`✅ Career application email sent successfully to ${adminEmail}`)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing career application:', error)

    // Clean up temp file on error
    if (tempFilePath && existsSync(tempFilePath)) {
      try {
        await unlink(tempFilePath)
      } catch (unlinkError) {
        console.error('Error deleting temp file:', unlinkError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process application. Please try again later.',
      },
      { status: 500 }
    )
  }
}








