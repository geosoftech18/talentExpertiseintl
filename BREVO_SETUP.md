# Brevo Email Setup Guide

Brevo (formerly Sendinblue) has been integrated as the primary email provider for invoice emails.

## 🚀 Quick Setup

### 1. Sign Up for Brevo

1. Go to [brevo.com](https://www.brevo.com) (formerly sendinblue.com)
2. Create a free account (300 emails/day free tier)
3. Verify your email address

### 2. Get Your API Key

1. Log in to Brevo dashboard
2. Go to **Settings** → **SMTP & API** → **API Keys**
3. Click **Generate a new API key**
4. Copy the API key (starts with `xkeysib-...`)

### 3. Verify Sender Email

1. Go to **Settings** → **Senders**
2. Click **Add a sender**
3. Enter your email address (e.g., `noreply@yourdomain.com`)
4. Verify the email (Brevo will send a verification email)
5. Click the verification link in your email

### 4. Configure Environment Variables

Add to your `.env` file:

```env
# Brevo Configuration (Primary Email Provider)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Talent Expertise Institute
BREVO_SENDER_EMAIL=noreply@yourdomain.com
```

**Note:** 
- `BREVO_FROM_EMAIL` and `BREVO_SENDER_EMAIL` should be the same verified sender email
- `BREVO_SENDER_NAME` is optional (shows as sender name in emails)

## 📧 What Gets Emailed

When an invoice is generated or resent:
- ✅ Professional HTML email
- ✅ Invoice PDF attached
- ✅ Invoice number and details
- ✅ Course information
- ✅ Amount and due date
- ✅ Payment instructions

## 🧪 Testing

1. **Restart your dev server** (if running):
   ```bash
   # Stop server (Ctrl+C) then:
   npm run dev
   ```

2. **Test by submitting a course registration:**
   - Go to a course page
   - Click "Register Now"
   - Select "Pay via Invoice"
   - Submit the form

3. **Check the console** for:
   - ✅ `Brevo email sent successfully. Message ID: ...`
   - ❌ Any error messages

4. **Check customer email inbox** (and spam folder)

## 🔍 Troubleshooting

### Email not sending?

1. **Check API Key:**
   - Verify `BREVO_API_KEY` is correct in `.env`
   - Should start with `xkeysib-`

2. **Verify Sender Email:**
   - Must be verified in Brevo dashboard
   - Go to Settings → Senders
   - Status should be "Verified"

3. **Check Brevo Dashboard:**
   - Go to **Statistics** → **Emails**
   - See delivery status and any errors

4. **Check Console Logs:**
   - Look for Brevo error messages
   - Check error details in console

### Common Errors:

- **"Invalid API key"** - Check your API key in `.env`
- **"Sender not verified"** - Verify sender email in Brevo dashboard
- **"Daily limit exceeded"** - Free tier: 300 emails/day. Upgrade plan if needed

## 📊 Brevo Free Tier Limits

- **300 emails/day** (free tier)
- **Unlimited contacts**
- **Email support included**
- **No credit card required**

## 🎯 Production Setup

For production:

1. **Verify your domain** (optional but recommended):
   - Go to **Settings** → **Domains**
   - Add your domain
   - Add DNS records (SPF, DKIM, DMARC)
   - Improves deliverability

2. **Use verified sender email:**
   ```env
   BREVO_FROM_EMAIL=noreply@yourdomain.com
   BREVO_SENDER_EMAIL=noreply@yourdomain.com
   ```

3. **Monitor email delivery:**
   - Check Brevo dashboard for delivery stats
   - Monitor bounce rates
   - Check spam reports

## ✅ Success Indicators

When emails are working:
- ✅ Console shows: `Brevo email sent successfully. Message ID: ...`
- ✅ Customer receives email with PDF attachment
- ✅ No errors in console
- ✅ Brevo dashboard shows sent emails

## 🔄 Migration from Resend

If you were using Resend:

1. **Remove Resend config** from `.env`:
   ```env
   # Remove these:
   # RESEND_API_KEY=...
   # RESEND_FROM_EMAIL=...
   ```

2. **Add Brevo config**:
   ```env
   BREVO_API_KEY=xkeysib-...
   BREVO_FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Restart dev server**

4. **Test invoice email**

## 📝 Complete .env Example

```env
# Brevo Email Configuration
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Talent Expertise Institute
BREVO_SENDER_EMAIL=noreply@yourdomain.com

# Company Info (for invoices)
COMPANY_NAME=Talent Expertise Institute
COMPANY_ADDRESS=Dubai, UAE
COMPANY_EMAIL=info@yourdomain.com
COMPANY_PHONE=+971 XX XXX XXXX
```

## 🎉 Ready!

Once configured, all invoice emails will be sent via Brevo automatically. The system will:
- ✅ Generate invoice PDFs
- ✅ Send emails with PDF attachments
- ✅ Track delivery in Brevo dashboard
- ✅ Handle errors gracefully

