# Google OAuth Error Fix Guide

## Common Error: Redirecting to `/api/auth/error`

If you're being redirected to the error page after clicking "Continue with Google", check these:

### 1. Check Environment Variables

Visit: `http://localhost:3000/api/auth/test-env`

This will show you which environment variables are missing.

**Required variables:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Verify Google Cloud Console Settings

**Critical:** The redirect URI must match EXACTLY:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Check these settings:

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
   - No trailing slash
   - Must match your app URL exactly

   **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   - Must be exactly this path
   - No trailing slash
   - Case-sensitive

### 3. OAuth Consent Screen Configuration

1. Go to **OAuth consent screen**
2. Choose **External** (for testing) or **Internal** (for Google Workspace)
3. Fill in required fields:
   - App name
   - User support email
   - Developer contact email
4. **Important:** If in "Testing" mode:
   - Add your email as a **Test user**
   - Only test users can sign in
5. Click **Save and Continue** through all steps

### 4. Check Error Details

When you're redirected to `/api/auth/error`, check the URL:
- It will show: `?error=ErrorCode`
- Common error codes:
  - `Configuration` - Missing env variables
  - `OAuthCallback` - Redirect URI mismatch
  - `OAuthAccountNotLinked` - Email already exists with different provider

### 5. Server Logs

Check your terminal where `npm run dev` is running:
- Look for error messages
- Check for warnings about missing environment variables
- Look for database connection errors

### 6. Quick Test

1. **Test providers endpoint:**
   ```
   http://localhost:3000/api/auth/providers
   ```
   Should show: `{"google": {...}, "linkedin": {...}, "credentials": {...}}`

2. **Test environment variables:**
   ```
   http://localhost:3000/api/auth/test-env
   ```
   Should show all variables as `true`

### 7. Common Fixes

**If redirect URI error:**
- Double-check the URI in Google Cloud Console
- Make sure it's exactly: `http://localhost:3000/api/auth/callback/google`
- Remove any extra spaces or characters

**If "Configuration" error:**
- Restart dev server after adding env variables
- Check `.env` file is in root directory
- Verify no typos in variable names

**If "OAuthCallback" error:**
- Verify OAuth consent screen is configured
- Add your email as test user if in testing mode
- Check that Google+ API is enabled

### 8. Still Not Working?

1. **Clear browser cache and cookies**
2. **Try incognito/private window**
3. **Check browser console (F12) for errors**
4. **Verify you're using the correct Client ID and Secret**
5. **Make sure the OAuth client is for "Web application" type**

## Debug Mode

The error page now shows detailed information about what went wrong. Check:
- The error code in the URL
- The error message on the page
- The troubleshooting tips shown

