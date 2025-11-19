# Email Setup for Invoice System

## 🚨 Why Emails Aren't Sending

The invoice system **IS** sending emails, but you need to configure an email provider first. Without one, emails are only logged to the console.

## ✅ Quick Setup Options

### Option 1: Resend (Easiest - Recommended) ⭐

1. **Sign up** at [resend.com](https://resend.com) (free tier available)
2. **Get your API key** from the dashboard
3. **Add to `.env` file**:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```
   > Note: For Resend, you need to verify your domain first, or use their test domain for development

4. **Install Resend package**:
   ```bash
   npm install resend
   ```

### Option 2: Gmail SMTP (Free)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Generate a new app password
   - Copy the 16-character password

3. **Add to `.env` file**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   ```

4. **Install Nodemailer**:
   ```bash
   npm install nodemailer
   ```

### Option 3: SendGrid

1. **Sign up** at [sendgrid.com](https://sendgrid.com)
2. **Get API key** from dashboard
3. **Add to `.env` file**:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Install SendGrid package**:
   ```bash
   npm install @sendgrid/mail
   ```

## 📝 Complete `.env` Example

```env
# Choose ONE email provider:

# Option 1: Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# OR Option 2: Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# OR Option 3: SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Company Info (for invoices)
COMPANY_NAME=Talent Expertise Institute
COMPANY_ADDRESS=Dubai, UAE
COMPANY_EMAIL=info@example.com
COMPANY_PHONE=+971 XX XXX XXXX
```

## 🧪 Testing

After configuring, test by:
1. Submitting a course registration with "Pay via Invoice"
2. Check your email inbox
3. Check server console for any errors

## 🔍 Troubleshooting

### Emails still not sending?

1. **Check console logs** - Look for email errors
2. **Verify environment variables** - Make sure they're in `.env` file
3. **Restart dev server** - `npm run dev`
4. **Check email provider dashboard** - Look for delivery logs

### Common Issues:

- **Gmail**: Make sure you're using App Password, not regular password
- **Resend**: Verify your domain or use their test domain
- **SendGrid**: Check API key permissions

## 📧 What Gets Emailed

When a user selects "Pay via Invoice":
- ✅ Invoice PDF attached
- ✅ Invoice number
- ✅ Course details
- ✅ Amount and due date
- ✅ Payment instructions

