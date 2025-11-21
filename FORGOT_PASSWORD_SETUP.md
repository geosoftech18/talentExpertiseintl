# Forgot Password Functionality Setup Guide

This guide explains how to set up and use the forgot password functionality.

## Features

✅ **Forgot Password Request**: Users can request a password reset via email
✅ **Secure Token Generation**: Cryptographically secure tokens with 1-hour expiration
✅ **Password Reset Page**: Dedicated page for resetting passwords
✅ **Email Integration**: Supports multiple email providers
✅ **Security**: Prevents email enumeration attacks

## Database Setup

1. **Update Prisma Schema** (Already done):
   ```bash
   npx prisma db push
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

## Email Provider Setup

Choose one of the following email providers:

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Add to `.env`:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

### Option 3: SMTP (Gmail, Outlook, etc.)

1. Add to `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   ```

**Note**: For Gmail, you need to:
- Enable 2-factor authentication
- Generate an "App Password" (not your regular password)
- Use the app password in `SMTP_PASSWORD`

### Option 4: Development (No Email Provider)

If no email provider is configured, emails will be logged to the console in development mode. This is useful for testing.

## Environment Variables

Add these to your `.env` file:

```env
# Base URL for password reset links
NEXTAUTH_URL=http://localhost:3000
# OR
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How It Works

### 1. User Requests Password Reset

- User clicks "Forgot password?" on the login page
- Enters their email address
- System generates a secure token and sends reset email

### 2. User Receives Email

- Email contains a link like: `http://localhost:3000/auth/reset-password?token=xxxxx`
- Token expires in 1 hour

### 3. User Resets Password

- User clicks the link in email
- System validates the token
- User enters new password
- Password is updated and token is deleted

## API Endpoints

### POST `/api/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, we have sent a password reset link."
}
```

### POST `/api/auth/reset-password`

Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "new-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

### GET `/api/auth/reset-password?token=xxxxx`

Verify if a reset token is valid.

**Response:**
```json
{
  "success": true,
  "valid": true
}
```

## Security Features

1. **Email Enumeration Prevention**: Always returns success message, even if email doesn't exist
2. **Token Expiration**: Tokens expire after 1 hour
3. **One-Time Use**: Tokens are deleted after successful password reset
4. **Secure Token Generation**: Uses `crypto.randomBytes(32)` for token generation
5. **Password Hashing**: Passwords are hashed using bcrypt before storage

## Testing

1. **Without Email Provider** (Development):
   - Check console logs for email content
   - Copy the reset link from console
   - Test the reset flow

2. **With Email Provider**:
   - Request password reset
   - Check your email inbox
   - Click the reset link
   - Enter new password

## Troubleshooting

### Emails Not Sending

1. Check email provider configuration in `.env`
2. Verify API keys are correct
3. Check console for error messages
4. For SMTP: Ensure app passwords are used (not regular passwords)

### Token Invalid/Expired

- Tokens expire after 1 hour
- Each token can only be used once
- Request a new reset link if token expires

### Reset Link Not Working

1. Ensure `NEXTAUTH_URL` or `NEXT_PUBLIC_APP_URL` is set correctly
2. Check that the token hasn't expired
3. Verify the token hasn't been used already

## Next Steps

1. Run `npx prisma db push` to update database
2. Configure an email provider (see options above)
3. Test the forgot password flow
4. Customize email template in `lib/email.ts` if needed















