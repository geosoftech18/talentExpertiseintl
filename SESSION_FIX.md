# Session Endpoint Fix

## Problem
The session endpoint (`/api/auth/session`) is returning a 500 error because `NEXTAUTH_SECRET` is missing.

## Solution

### 1. Add NEXTAUTH_SECRET to your `.env` file

Open your `.env` file and add this line:

```env
NEXTAUTH_SECRET=your-generated-secret-here
```

**Use the secret generated below** (or generate a new one).

### 2. Generate a Secret (if needed)

Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use OpenSSL:
```bash
openssl rand -base64 32
```

### 3. Restart Your Dev Server

**IMPORTANT:** After adding `NEXTAUTH_SECRET` to your `.env` file:

1. Stop your dev server (Ctrl+C)
2. Start it again: `npm run dev`

### 4. Verify It's Working

1. Visit: `http://localhost:3000/api/auth/session`
   - Should return: `{"user":null}` (if not logged in)
   - Should NOT return a 500 error

2. Check your server terminal:
   - Should NOT show: "❌ NEXTAUTH_SECRET is missing"
   - Should show: No errors

## Complete .env File Example

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"

# NextAuth (REQUIRED)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## Why This Is Required

`NEXTAUTH_SECRET` is used to:
- Encrypt session tokens
- Sign JWT tokens
- Secure cookies

Without it, NextAuth cannot:
- Create sessions
- Validate tokens
- Handle authentication

## After Adding the Secret

Once you've added `NEXTAUTH_SECRET` and restarted:
- ✅ Session endpoint will work
- ✅ Google OAuth will work
- ✅ LinkedIn OAuth will work
- ✅ Email/password login will work

