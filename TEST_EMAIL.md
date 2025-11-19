# Testing Email Setup

## ✅ Resend Package Installed

The `resend` package has been installed successfully.

## 🔧 Verify Your .env Configuration

Make sure your `.env` file has:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Important Notes:**
- `RESEND_API_KEY` should start with `re_`
- `RESEND_FROM_EMAIL` must be a verified domain in Resend, OR use Resend's test domain for development

### For Development/Testing:
If you haven't verified a domain yet, you can use Resend's test domain:
```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## 🧪 Test the Email Functionality

1. **Restart your dev server** (if it's running):
   ```bash
   # Stop the server (Ctrl+C) then:
   npm run dev
   ```

2. **Test by submitting a course registration**:
   - Go to a course page
   - Click "Register Now"
   - Fill out the form
   - Select **"Pay via Invoice"** as payment method
   - Submit the form

3. **Check the console** for email status:
   - ✅ Success: `✅ Invoice email sent successfully to user@example.com`
   - ❌ Error: Check the error message

4. **Check the user's email inbox** (and spam folder)

## 🔍 Troubleshooting

### Email not sending?

1. **Check console logs** - Look for Resend errors
2. **Verify API key** - Make sure it's correct in `.env`
3. **Check Resend dashboard** - Look for delivery logs at https://resend.com/emails
4. **Verify FROM email** - Must be verified domain or use `onboarding@resend.dev`

### Common Errors:

- **"Invalid API key"** - Check your API key in `.env`
- **"Domain not verified"** - Use `onboarding@resend.dev` or verify your domain
- **"Rate limit exceeded"** - You've hit Resend's free tier limit

## 📧 What Gets Emailed

When invoice is generated:
- ✅ Professional HTML email
- ✅ Invoice PDF attached
- ✅ Invoice number
- ✅ Course details
- ✅ Amount and due date
- ✅ Payment instructions

## 🎉 Success!

If you see `✅ Invoice email sent successfully` in the console, emails are working!

