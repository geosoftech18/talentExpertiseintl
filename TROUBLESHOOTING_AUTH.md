# Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. "ReflectApply is not a function" Error

**Solution Applied:**
- Removed PrismaAdapter (causing compatibility issues)
- Added manual user/account creation in `signIn` callback
- This should resolve the error

**If error persists:**
1. Restart your dev server completely
2. Clear `.next` folder: `rm -rf .next` (or delete manually on Windows)
3. Restart: `npm run dev`

### 2. Google OAuth Not Working

**Check these:**

1. **Environment Variables:**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret
   ```

2. **Google Cloud Console Settings:**
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
   - Make sure there are NO trailing slashes

3. **Verify OAuth Consent Screen:**
   - Go to Google Cloud Console → OAuth consent screen
   - Make sure it's configured (even for testing)
   - Add your email as a test user if in testing mode

4. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

### 3. LinkedIn OAuth Not Working

**Check these:**

1. **Environment Variables:**
   ```env
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   ```

2. **LinkedIn App Settings:**
   - Go to LinkedIn Developers → Your App → Auth tab
   - **Redirect URLs:** `http://localhost:3000/api/auth/callback/linkedin`
   - **Products:** Make sure "Sign In with LinkedIn using OpenID Connect" is added

3. **LinkedIn API Permissions:**
   - Request access to: `r_emailaddress` and `r_liteprofile`
   - Wait for approval (can take time)

### 4. Environment Variables Not Loading

**Solution:**
1. Make sure `.env` file is in the root directory (same level as `package.json`)
2. Restart dev server after adding/changing env variables
3. Check for typos in variable names (case-sensitive)
4. No spaces around `=` sign: `GOOGLE_CLIENT_ID=value` (not `GOOGLE_CLIENT_ID = value`)

### 5. Database Connection Issues

**Check:**
1. MongoDB connection string in `.env`
2. Run `npm run db:push` to sync schema
3. Check if User, Account, Session collections exist in MongoDB

### 6. Session Not Persisting

**Solution:**
1. Check `NEXTAUTH_SECRET` is set
2. Clear browser cookies and try again
3. Check if `SessionProvider` is wrapping your app (it is in `public-layout.tsx`)

## Testing Steps

1. **Test Environment Variables:**
   ```bash
   # In your terminal, check if variables are loaded
   node -e "console.log(process.env.GOOGLE_CLIENT_ID)"
   ```

2. **Test API Route:**
   - Visit: `http://localhost:3000/api/auth/providers`
   - Should show available providers (google, linkedin, credentials)

3. **Test Sign In:**
   - Click Login button
   - Try Google OAuth
   - Check browser console for errors
   - Check server terminal for errors

## Debug Mode

Enable debug logging by setting in `.env`:
```env
NODE_ENV=development
```

This will show detailed logs in the server console.

## Still Not Working?

1. **Check Server Logs:**
   - Look at terminal where `npm run dev` is running
   - Look for error messages

2. **Check Browser Network Tab:**
   - Open DevTools → Network
   - Try to sign in
   - Check which requests fail
   - Look at response messages

3. **Verify OAuth Credentials:**
   - Double-check Client ID and Secret are correct
   - Make sure they're from the right project/app
   - Verify redirect URIs match exactly

4. **Test with Simple Provider:**
   - Try email/password signup first
   - If that works, the issue is with OAuth setup
   - If that doesn't work, check database connection

