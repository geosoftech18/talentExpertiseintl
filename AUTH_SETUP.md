# Authentication Setup Guide

This guide will help you set up Google and LinkedIn OAuth authentication for the application.

## Prerequisites

1. NextAuth.js is already installed
2. Database schema has been updated with User, Account, Session, and VerificationToken models
3. Prisma has been configured

## Environment Variables

Add these to your `.env` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** (if not already enabled)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. **Authorized JavaScript origins** (Base URL of your application):
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
   - **Note:** This should be just the base URL, no paths or trailing slashes
7. **Authorized redirect URIs** (Full callback URLs):
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
8. Copy the **Client ID** and **Client Secret** to your `.env` file

## LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **"Create app"** to create a new app

### Step 1: App Details

**App Name:**
- Enter your app name (e.g., "TEI Training & Consultancy" or "Your Company Name")

**LinkedIn Page (Required):**
- **For Companies:** Enter your company's LinkedIn Page URL
  - Example: `https://www.linkedin.com/company/your-company-name/`
  - Or just enter your company's LinkedIn Page name
  - **Note:** This cannot be a personal profile page, must be a Company Page
  - If you don't have one, click "+ Create a new LinkedIn Page" link
- **For Individual Developers:** Select the default Company page provided to you
  - Individual developers get a default Company page assigned
  - You must select that default page to proceed

**Privacy Policy URL (Required):**
- Enter the full URL to your privacy policy page
- Must start with `https://` (LinkedIn requires HTTPS and does NOT accept localhost)
- **⚠️ Important:** LinkedIn does NOT accept `http://localhost:3000` URLs
- **✅ Best Option: Use Your Existing Domain:**
  - If you have an existing website/domain that's currently active
  - Use that domain's privacy policy URL: `https://yourdomain.com/privacy-policy`
  - This works immediately and you don't need to change it later
  - When you deploy this new app to that domain, the URL will still work
  - Example: `https://teitraining.com/privacy-policy` or `https://yourdomain.com/privacy`
- **For Development - Use ngrok (if no existing domain):**
  1. Install ngrok: Download from https://ngrok.com/download
  2. Start your dev server: `npm run dev`
  3. In a new terminal, run: `ngrok http 3000`
  4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
  5. Use: `https://abc123.ngrok-free.app/privacy-policy` in LinkedIn
- **For Development - Alternative (Free Hosting):**
  - Deploy privacy policy page to Vercel/Netlify (free)
  - Get a permanent public URL
  - Use that URL in LinkedIn

**Terms of Service URL (Optional but recommended):**
- Enter your terms of service URL if you have one
- Example: `https://yourdomain.com/terms`

**App Logo:**
- Upload your app logo (square image, recommended: 200x200px)

**App Use:**
- Select how you'll use the app (e.g., "Sign in with LinkedIn")

### Step 2: Products & Permissions

1. Go to the **"Products"** tab
2. Request access to:
   - **Sign In with LinkedIn using OpenID Connect** (Required)
   - This will automatically include basic profile access

### Step 3: Auth Settings

1. Go to the **"Auth"** tab
2. Add **Redirect URLs:**
   - `http://localhost:3000/api/auth/callback/linkedin` (for development)
   - `https://yourdomain.com/api/auth/callback/linkedin` (for production)
   - **Important:** No trailing slashes, exact match required

### Step 4: Get Credentials

1. In the **"Auth"** tab, you'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "Show" to reveal and copy
2. Add these to your `.env` file:
   ```env
   LINKEDIN_CLIENT_ID=your-client-id-here
   LINKEDIN_CLIENT_SECRET=your-client-secret-here
   ```

### Important Notes:

- **Verification:** Your app may need to be verified by a LinkedIn Page Admin
- **Review Process:** LinkedIn may review your app before it goes live
- **Testing:** You can test with your own LinkedIn account during development
- **Privacy Policy:** Make sure your privacy policy URL is accessible and working

## Features Implemented

✅ **Google OAuth Login** - Users can sign in with their Google account
✅ **LinkedIn OAuth Login** - Users can sign in with their LinkedIn account
✅ **Email/Password Authentication** - Traditional login and signup
✅ **User Registration** - New users can create accounts
✅ **Password Hashing** - Passwords are securely hashed using bcrypt
✅ **Session Management** - JWT-based sessions
✅ **Database Integration** - User data stored in MongoDB via Prisma

## How It Works

1. **Social Login (Google/LinkedIn)**:
   - User clicks "Continue with Google" or "Continue with LinkedIn"
   - Redirects to provider's OAuth page
   - User authorizes the application
   - Provider redirects back with authorization code
   - NextAuth exchanges code for user info
   - User is automatically created/updated in database
   - Session is created and user is logged in

2. **Email/Password Login**:
   - User enters email and password
   - Credentials are validated against database
   - Password is verified using bcrypt
   - Session is created if valid

3. **Sign Up**:
   - User fills in registration form
   - Password is hashed with bcrypt
   - User is created in database
   - User is automatically logged in

## Testing

1. Start your development server: `npm run dev`
2. Click the "Login" button in the header
3. Try each authentication method:
   - Google OAuth
   - LinkedIn OAuth
   - Email/Password signup
   - Email/Password login

## Troubleshooting

### "Invalid credentials" error
- Check that environment variables are set correctly
- Verify OAuth client IDs and secrets
- Ensure redirect URIs match exactly

### OAuth redirect not working
- Check that redirect URIs in provider settings match your app URLs
- Verify `NEXTAUTH_URL` matches your current domain

### Database errors
- Run `npm run db:push` to sync schema
- Check MongoDB connection string
- Verify database collections were created

## Security Notes

- Never commit `.env` file to version control
- Use strong, unique `NEXTAUTH_SECRET`
- Keep OAuth client secrets secure
- Use HTTPS in production
- Regularly update dependencies

