/**
 * Generate order status notification email HTML template
 */

interface OrderNotificationData {
  customerName: string
  orderId: string
  courseTitle: string | null
  orderStatus: string
  paymentStatus: string | null
  paymentMethod: string
  amount: number | null
  scheduleStartDate: string | null
  scheduleEndDate: string | null
  venue: string | null
  city: string | null
  country: string | null
  companyName?: string
  submittedDate: string
}

export function generateOrderNotificationEmailHTML(data: OrderNotificationData): string {
  const {
    customerName,
    orderId,
    courseTitle,
    orderStatus,
    paymentStatus,
    paymentMethod,
    amount,
    scheduleStartDate,
    scheduleEndDate,
    venue,
    city,
    country,
    companyName,
    submittedDate,
  } = data

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Get status color and message
  const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return {
          color: '#10b981',
          bgColor: '#d1fae5',
          message: 'Your order has been completed successfully!',
        }
      case 'IN PROGRESS':
        return {
          color: '#3b82f6',
          bgColor: '#dbeafe',
          message: 'Your order is currently in progress.',
        }
      case 'INCOMPLETE':
        return {
          color: '#f59e0b',
          bgColor: '#fef3c7',
          message: 'Your order is incomplete. Please complete the required steps.',
        }
      case 'CANCELLED':
        return {
          color: '#ef4444',
          bgColor: '#fee2e2',
          message: 'Your order has been cancelled.',
        }
      default:
        return {
          color: '#6b7280',
          bgColor: '#f3f4f6',
          message: `Your order status: ${status}`,
        }
    }
  }

  const statusInfo = getStatusInfo(orderStatus)

  // Get payment status info
  const getPaymentStatusInfo = (status: string | null) => {
    if (!status) return { color: '#6b7280', text: 'Not Set' }
    switch (status.toUpperCase()) {
      case 'PAID':
        return { color: '#10b981', text: 'Paid' }
      case 'UNPAID':
        return { color: '#ef4444', text: 'Unpaid' }
      case 'PARTIALLY REFUNDED':
        return { color: '#f59e0b', text: 'Partially Refunded' }
      case 'REFUNDED':
        return { color: '#6b7280', text: 'Refunded' }
      default:
        return { color: '#6b7280', text: status }
    }
  }

  const paymentStatusInfo = getPaymentStatusInfo(paymentStatus)

  // Format payment method
  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      credit: 'Credit Card',
      bank: 'Bank Transfer',
      invoice: 'Invoice',
      purchase: 'Purchase Order',
    }
    return methods[method.toLowerCase()] || method
  }

  // Get next steps based on status
  const getNextSteps = (status: string, paymentStatus: string | null) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return paymentStatus?.toUpperCase() === 'PAID'
          ? 'Thank you for your payment. Your course registration is complete. You will receive further details about the course schedule and materials shortly.'
          : 'Your order has been completed. Please complete the payment to finalize your registration.'
      case 'IN PROGRESS':
        return 'Your order is being processed. We will notify you once it has been completed. If you have any questions, please contact our support team.'
      case 'INCOMPLETE':
        return 'Please complete the required information or payment to proceed with your order. If you need assistance, please contact our support team.'
      case 'CANCELLED':
        return 'If you believe this cancellation was made in error, please contact our support team immediately.'
      default:
        return 'If you have any questions about your order, please contact our support team.'
    }
  }

  const nextSteps = getNextSteps(orderStatus, paymentStatus)

  // Company name from env or default
  const companyNameEnv = process.env.COMPANY_NAME || 'Talent Expertise Institute'
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.BREVO_FROM_EMAIL || 'support@example.com'
  const supportPhone = process.env.SUPPORT_PHONE || '+971-XXX-XXXX'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update - ${orderId}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Order Status Update</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear ${customerName}${companyName ? ` (${companyName})` : ''},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We are writing to inform you about the current status of your order. Please find the details below:
    </p>

    <!-- Status Banner -->
    <div style="background: ${statusInfo.bgColor}; border-left: 4px solid ${statusInfo.color}; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: ${statusInfo.color};">
        ${statusInfo.message}
      </p>
    </div>

    <!-- Order Details Card -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
      <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 15px; color: #1f2937;">Order Details</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Order ID:</td>
          <td style="padding: 8px 0; font-weight: 600; font-size: 14px; color: #1f2937;">#${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Course:</td>
          <td style="padding: 8px 0; font-size: 14px; color: #1f2937;">${courseTitle || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order Status:</td>
          <td style="padding: 8px 0;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: ${statusInfo.color}; background: ${statusInfo.bgColor};">
              ${orderStatus}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Status:</td>
          <td style="padding: 8px 0;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: ${paymentStatusInfo.color}; background: ${paymentStatusInfo.color === '#10b981' ? '#d1fae5' : paymentStatusInfo.color === '#ef4444' ? '#fee2e2' : '#f3f4f6'};">
              ${paymentStatusInfo.text}
            </span>
          </td>
        </tr>
        ${amount ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
          <td style="padding: 8px 0; font-weight: 600; font-size: 14px; color: #1f2937;">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Method:</td>
          <td style="padding: 8px 0; font-size: 14px; color: #1f2937;">${formatPaymentMethod(paymentMethod)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Submitted Date:</td>
          <td style="padding: 8px 0; font-size: 14px; color: #1f2937;">${formatDateTime(submittedDate)}</td>
        </tr>
      </table>
    </div>

    <!-- Schedule Information -->
    ${scheduleStartDate ? `
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
      <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 15px; color: #1f2937;">Schedule Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${scheduleStartDate ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Start Date:</td>
          <td style="padding: 8px 0; font-size: 14px; color: #1f2937;">${formatDate(scheduleStartDate)}</td>
        </tr>
        ` : ''}
        ${scheduleEndDate ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">End Date:</td>
          <td style="padding: 8px 0; font-size: 14px; color: #1f2937;">${formatDate(scheduleEndDate)}</td>
        </tr>
        ` : ''}
        ${venue ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Venue:</td>
          <td style="padding: 8px 0; font-size: 14px; color: #1f2937;">${venue}${city ? `, ${city}` : ''}${country ? `, ${country}` : ''}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    ` : ''}

    <!-- Next Steps -->
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="font-size: 16px; margin-top: 0; margin-bottom: 10px; color: #1e40af;">Next Steps</h3>
      <p style="margin: 0; font-size: 14px; color: #1f2937; line-height: 1.6;">
        ${nextSteps}
      </p>
    </div>

    <!-- Contact Information -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
      <h3 style="font-size: 16px; margin-top: 0; margin-bottom: 10px; color: #1f2937;">Need Help?</h3>
      <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">
        If you have any questions or concerns about your order, please don't hesitate to contact us:
      </p>
      <p style="margin: 5px 0; font-size: 14px; color: #1f2937;">
        📧 Email: <a href="mailto:${supportEmail}" style="color: #3b82f6; text-decoration: none;">${supportEmail}</a><br>
        📞 Phone: <a href="tel:${supportPhone}" style="color: #3b82f6; text-decoration: none;">${supportPhone}</a>
      </p>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Thank you for choosing ${companyNameEnv}. We appreciate your business!
    </p>

    <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
      Best regards,<br>
      <strong style="color: #1f2937;">${companyNameEnv} Team</strong>
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">
      This is an automated email. Please do not reply to this message.<br>
      © ${new Date().getFullYear()} ${companyNameEnv}. All rights reserved.
    </p>
  </div>
</body>
</html>
  `
}

export function generateOrderNotificationEmailText(data: OrderNotificationData): string {
  const {
    customerName,
    orderId,
    courseTitle,
    orderStatus,
    paymentStatus,
    paymentMethod,
    amount,
    scheduleStartDate,
    scheduleEndDate,
    venue,
    city,
    country,
    companyName,
    submittedDate,
  } = data

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      credit: 'Credit Card',
      bank: 'Bank Transfer',
      invoice: 'Invoice',
      purchase: 'Purchase Order',
    }
    return methods[method.toLowerCase()] || method
  }

  const companyNameEnv = process.env.COMPANY_NAME || 'Talent Expertise Institute'
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.BREVO_FROM_EMAIL || 'support@example.com'
  const supportPhone = process.env.SUPPORT_PHONE || '+971-XXX-XXXX'

  return `
Dear ${customerName}${companyName ? ` (${companyName})` : ''},

We are writing to inform you about the current status of your order.

ORDER DETAILS:
- Order ID: #${orderId}
- Course: ${courseTitle || 'N/A'}
- Order Status: ${orderStatus}
- Payment Status: ${paymentStatus || 'Not Set'}
${amount ? `- Amount: $${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
- Payment Method: ${formatPaymentMethod(paymentMethod)}
- Submitted Date: ${formatDateTime(submittedDate)}

${scheduleStartDate ? `
SCHEDULE INFORMATION:
- Start Date: ${formatDate(scheduleStartDate)}
${scheduleEndDate ? `- End Date: ${formatDate(scheduleEndDate)}` : ''}
${venue ? `- Venue: ${venue}${city ? `, ${city}` : ''}${country ? `, ${country}` : ''}` : ''}
` : ''}

If you have any questions or concerns about your order, please contact us:
Email: ${supportEmail}
Phone: ${supportPhone}

Thank you for choosing ${companyNameEnv}!

Best regards,
${companyNameEnv} Team
  `.trim()
}

