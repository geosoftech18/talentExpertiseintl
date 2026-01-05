# Fix Google OAuth Error 400: redirect_uri_mismatch

## Problem

After changing `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your actual domain, you're getting:
- **Error 400: redirect_uri_mismatch**
- "Access blocked: This app's request is invalid"

## Solution

You need to update your **Google Cloud Console** settings to match your new domain.

## Step-by-Step Fix

### 1. Update Environment Variables

Make sure your `.env` file has the correct domain:

```env
# Use your actual domain (with https://)
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Google OAuth (keep existing values)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-secret-key
```

**Important:**
- Use `https://` (not `http://`) for production
- No trailing slash at the end
- Use your actual domain (e.g., `https://teitraining.com`)

### 2. Update Google Cloud Console

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project** (the one with your OAuth credentials)
3. **Navigate to:** APIs & Services → Credentials
4. **Click on your OAuth 2.0 Client ID** (the one you're using)

### 3. Update Authorized JavaScript Origins

In the **Authorized JavaScript origins** section:

**Add your new domain:**
```
https://yourdomain.com
```

**Important:**
- ✅ Include `https://`
- ✅ No trailing slash
- ✅ No paths (just the domain)
- ✅ Keep `http://localhost:3000` if you still need local development

**Example:**
```
http://localhost:3000
https://yourdomain.com
```

### 4. Update Authorized Redirect URIs

In the **Authorized redirect URIs** section:

**Add your new callback URL:**
```
https://yourdomain.com/api/auth/callback/google
```

**Important:**
- ✅ Must be exactly: `https://yourdomain.com/api/auth/callback/google`
- ✅ Include `https://`
- ✅ No trailing slash
- ✅ Case-sensitive
- ✅ Keep `http://localhost:3000/api/auth/callback/google` if you still need local development

**Example:**
```
http://localhost:3000/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google
```

### 5. Save Changes

1. Click **Save** at the bottom
2. Wait a few seconds for changes to propagate (usually instant, but can take up to 5 minutes)

### 6. Restart Your Application

After updating Google Cloud Console:

1. **Restart your server** (if running locally):
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **If deployed** (Vercel, Netlify, etc.):
   - Changes should apply automatically on next deployment
   - Or trigger a redeploy if needed

### 7. Clear Browser Cache

1. Clear your browser cache and cookies
2. Or try in an **incognito/private window**
3. Try logging in again

## Common Mistakes to Avoid

### ❌ Wrong Format Examples:

```
# DON'T DO THIS:
https://yourdomain.com/                    # Trailing slash
http://yourdomain.com                      # Using http instead of https
yourdomain.com                             # Missing https://
https://yourdomain.com/api/auth/callback/google/  # Trailing slash
https://yourdomain.com/callback/google     # Wrong path
```

### ✅ Correct Format:

```
# Authorized JavaScript origins:
https://yourdomain.com

# Authorized redirect URIs:
https://yourdomain.com/api/auth/callback/google
```

## Verification Checklist

Before testing, verify:

- [ ] `.env` file has `NEXTAUTH_URL=https://yourdomain.com` (no trailing slash)
- [ ] `.env` file has `NEXT_PUBLIC_APP_URL=https://yourdomain.com` (no trailing slash)
- [ ] Google Cloud Console has `https://yourdomain.com` in **Authorized JavaScript origins**
- [ ] Google Cloud Console has `https://yourdomain.com/api/auth/callback/google` in **Authorized redirect URIs**
- [ ] No trailing slashes anywhere
- [ ] Using `https://` (not `http://`) for production
- [ ] Server restarted after changes
- [ ] Browser cache cleared

## Still Not Working?

### 1. Check the Exact Error

Look at the error URL in your browser:
```
accounts.google.com/signin/oauth/error?authError=...
```

The error details will show what redirect URI was sent vs what's expected.

### 2. Verify Domain Match

Make sure:
- The domain in `.env` matches exactly what's in Google Cloud Console
- No typos in domain name
- Using the same protocol (`https://`)

### 3. Check OAuth Consent Screen

1. Go to **OAuth consent screen** in Google Cloud Console
2. Make sure it's configured
3. If in "Testing" mode, add your email as a test user

### 4. Test with Different Browser

Try in:
- Incognito/Private window
- Different browser
- Clear all cookies for your domain

### 5. Check Server Logs

Look at your server terminal for any error messages about:
- Missing environment variables
- OAuth configuration errors

## Multiple Environments

If you need both development and production:

### Development (Local):
```
http://localhost:3000
http://localhost:3000/api/auth/callback/google
```

### Production (Live Domain):
```
https://yourdomain.com
https://yourdomain.com/api/auth/callback/google
```

**Add both** to Google Cloud Console so you can test locally and use production.

## Quick Reference

**Environment Variables:**
```env
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Google Cloud Console - Authorized JavaScript origins:**
```
https://yourdomain.com
```

**Google Cloud Console - Authorized redirect URIs:**
```
https://yourdomain.com/api/auth/callback/google
```

## Need Help?

If you're still stuck:
1. Double-check the exact error message
2. Verify domain spelling
3. Make sure you're using the correct OAuth Client ID
4. Check that changes were saved in Google Cloud Console


