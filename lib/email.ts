/**
 * Email utility for sending emails
 * Supports multiple email providers (Brevo, Resend, SendGrid, Nodemailer)
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    path?: string
    content?: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, text, attachments } = options

  // Check which email provider is configured (Brevo is preferred)
  if (process.env.BREVO_API_KEY) {
    return sendViaBrevo({ to, subject, html, text, attachments })
  } else if (process.env.RESEND_API_KEY) {
    return sendViaResend({ to, subject, html, text, attachments })
  } else if (process.env.SENDGRID_API_KEY) {
    return sendViaSendGrid({ to, subject, html, text, attachments })
  } else if (process.env.SMTP_HOST) {
    return sendViaSMTP({ to, subject, html, text, attachments })
  } else {
    // Fallback: Log email in development
    console.log('📧 Email would be sent (no email provider configured):')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Body:', text || html)
    if (attachments && attachments.length > 0) {
      console.log('Attachments:', attachments.map(a => a.filename).join(', '))
    }
    console.warn('⚠️  No email provider configured! Emails are only logged to console.')
    console.warn('💡 Configure one of these in your .env file:')
    console.warn('   - BREVO_API_KEY (recommended: npm install @getbrevo/brevo)')
    console.warn('   - RESEND_API_KEY (npm install resend)')
    console.warn('   - SENDGRID_API_KEY (npm install @sendgrid/mail)')
    console.warn('   - SMTP_HOST, SMTP_USER, SMTP_PASSWORD (npm install nodemailer)')
    console.warn('   See BREVO_SETUP.md for detailed setup instructions')
    return false // Return false so caller knows email wasn't actually sent
  }
}

async function sendViaBrevo(options: EmailOptions): Promise<boolean> {
  try {
    // Dynamic import with error handling
    let brevoModule
    try {
      brevoModule = await import('@getbrevo/brevo')
    } catch (error) {
      console.error('Brevo package not installed. Install it with: npm install @getbrevo/brevo')
      return false
    }

    const fs = await import('fs')
    
    // Initialize Brevo API
    const apiInstance = new brevoModule.TransactionalEmailsApi()
    
    // Set API key
    apiInstance.setApiKey(
      brevoModule.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!
    )

    // Prepare attachments
    const brevoAttachments: any[] = []
    if (options.attachments) {
      for (const att of options.attachments) {
        let content: string
        if (att.path) {
          const fileContent = fs.readFileSync(att.path)
          content = Buffer.from(fileContent).toString('base64')
        } else if (att.content) {
          content = Buffer.isBuffer(att.content)
            ? att.content.toString('base64')
            : Buffer.from(att.content).toString('base64')
        } else {
          continue
        }

        brevoAttachments.push({
          name: att.filename,
          content: content,
        })
      }
    }

    // Prepare email using SendSmtpEmail
    const sendSmtpEmail = new brevoModule.SendSmtpEmail()
    sendSmtpEmail.subject = options.subject
    sendSmtpEmail.htmlContent = options.html
    sendSmtpEmail.textContent = options.text || options.html.replace(/<[^>]*>/g, '')
    
    // Set sender
    const sender = new brevoModule.SendSmtpEmailSender()
    sender.name = process.env.BREVO_SENDER_NAME || process.env.COMPANY_NAME || 'Talent Expertise Institute'
    sender.email = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || 'noreply@example.com'
    sendSmtpEmail.sender = sender
    
    // Set recipient
    const recipient = new brevoModule.SendSmtpEmailToInner()
    recipient.email = options.to
    sendSmtpEmail.to = [recipient]
    
    // Set attachments
    if (brevoAttachments.length > 0) {
      const attachmentObjects = brevoAttachments.map(att => {
        const attachment = new brevoModule.SendSmtpEmailAttachmentInner()
        attachment.name = att.name
        attachment.content = att.content
        return attachment
      })
      sendSmtpEmail.attachment = attachmentObjects
    }

    // Send email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)

    if (result && result.body && result.body.messageId) {
      console.log(`✅ Brevo email sent successfully. Message ID: ${result.body.messageId}`)
      return true
    }

    return false
  } catch (error: any) {
    console.error('Brevo email error:', error)
    if (error.response?.body) {
      console.error('Brevo error details:', JSON.stringify(error.response.body, null, 2))
    } else if (error.body) {
      console.error('Brevo error details:', JSON.stringify(error.body, null, 2))
    } else if (error.message) {
      console.error('Brevo error message:', error.message)
    }
    return false
  }
}

async function sendViaResend(options: EmailOptions): Promise<boolean> {
  try {
    // Dynamic import with error handling
    let resend
    try {
      resend = await import('resend')
    } catch (error) {
      console.error('Resend package not installed. Install it with: npm install resend')
      return false
    }
    
    const fs = await import('fs')
    const resendClient = new resend.Resend(process.env.RESEND_API_KEY)

    // Convert attachments to Resend format
    const attachments = options.attachments?.map((att) => {
      if (att.path) {
        const content = fs.readFileSync(att.path)
        return {
          filename: att.filename,
          content: Buffer.from(content).toString('base64'),
        }
      } else if (att.content) {
        return {
          filename: att.filename,
          content: Buffer.isBuffer(att.content)
            ? att.content.toString('base64')
            : Buffer.from(att.content).toString('base64'),
        }
      }
      return null
    }).filter(Boolean) as Array<{ filename: string; content: string }> | undefined

    // Use Resend's test domain if no FROM email is set or if domain is not verified
    // For production, verify your domain at https://resend.com/domains
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    
    const result = await resendClient.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments,
    })

    if (result.error) {
      console.error('Resend email error:', result.error)
      
      // Provide helpful error messages
      if (result.error.message?.includes('only send testing emails to your own email')) {
        console.error('')
        console.error('⚠️  RESEND TEST DOMAIN LIMITATION:')
        console.error('   When using onboarding@resend.dev, you can only send to:')
        console.error('   - Your Resend account email (londonpioneer82@gmail.com)')
        console.error('   - Emails added in Resend dashboard under "Audiences"')
        console.error('')
        console.error('💡 Solutions:')
        console.error('   1. Add recipient email in Resend dashboard: https://resend.com/audiences')
        console.error('   2. OR verify your domain for production use: https://resend.com/domains')
        console.error('')
      }
      
      return false
    }

    return true
  } catch (error) {
    console.error('Resend email error:', error)
    return false
  }
}

async function sendViaSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    // Dynamic import with error handling - only load if needed
    let sgMail
    try {
      // Use eval to prevent Next.js from analyzing this import at build time
      const sendgridModule = await import('@sendgrid/mail' as any).catch(() => null)
      if (!sendgridModule) {
        console.error('SendGrid package not installed. Install it with: npm install @sendgrid/mail')
        return false
      }
      sgMail = sendgridModule
    } catch (error) {
      console.error('SendGrid package not installed. Install it with: npm install @sendgrid/mail')
      return false
    }
    
    const fs = await import('fs')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

    // Convert attachments to SendGrid format
    const attachments = options.attachments?.map((att) => {
      if (att.path) {
        const content = fs.readFileSync(att.path)
        return {
          filename: att.filename,
          content: Buffer.from(content).toString('base64'),
          type: att.contentType || 'application/pdf',
          disposition: 'attachment',
        }
      } else if (att.content) {
        return {
          filename: att.filename,
          content: Buffer.isBuffer(att.content)
            ? att.content.toString('base64')
            : Buffer.from(att.content).toString('base64'),
          type: att.contentType || 'application/pdf',
          disposition: 'attachment',
        }
      }
      return null
    }).filter(Boolean)

    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments,
    })

    return true
  } catch (error) {
    console.error('SendGrid email error:', error)
    return false
  }
}

async function sendViaSMTP(options: EmailOptions): Promise<boolean> {
  try {
    // Dynamic import with error handling - only load if needed
    let nodemailer
    try {
      // Use eval to prevent Next.js from analyzing this import at build time
      const nodemailerModule = await import('nodemailer' as any).catch(() => null)
      if (!nodemailerModule) {
        console.error('Nodemailer package not installed. Install it with: npm install nodemailer')
        return false
      }
      nodemailer = nodemailerModule
    } catch (error) {
      console.error('Nodemailer package not installed. Install it with: npm install nodemailer')
      return false
    }
    
    const fs = await import('fs')

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Convert attachments to Nodemailer format
    const attachments = options.attachments?.map((att) => {
      if (att.path) {
        return {
          filename: att.filename,
          path: att.path,
          contentType: att.contentType || 'application/pdf',
        }
      } else if (att.content) {
        return {
          filename: att.filename,
          content: att.content,
          contentType: att.contentType || 'application/pdf',
        }
      }
      return null
    }).filter(Boolean)

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments,
    })

    return true
  } catch (error) {
    console.error('SMTP email error:', error)
    return false
  }
}

/**
 * Generate password reset email HTML
 */
export function generatePasswordResetEmail(resetLink: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Password Reset Request</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; margin-bottom: 20px;">${userName ? `Hello ${userName},` : 'Hello,'}</p>
        <p style="font-size: 16px; margin-bottom: 20px;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #e5e7eb;">
          ${resetLink}
        </p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </body>
    </html>
  `
}


