# LinkedIn App Setup Guide for Authentication

## Quick Reference: What to Fill in Each Field

### 1. LinkedIn Page (Required) ⭐

**What to enter:**
- **Option A (If you have a Company LinkedIn Page):**
  - Enter your company's LinkedIn Page URL
  - Example: `https://www.linkedin.com/company/talent-expertise-international/`
  - Or just the company name if LinkedIn can find it
  - **Must be a Company Page, NOT a personal profile**

- **Option B (If you're an Individual Developer):**
  - Select the default Company page that LinkedIn assigns to you
  - This is automatically provided for individual developers
  - You must select this default page to proceed

- **Option C (If you don't have a Company Page):**
  - Click the "+ Create a new LinkedIn Page" link
  - Create a LinkedIn Company Page first
  - Then come back and enter that page's URL

**Important:**
- ⚠️ This action can't be undone once the app is saved
- Must be a Company Page, not a member profile
- For verification, a Page Admin needs to approve

### 2. Privacy Policy URL (Required) ⭐

**What to enter:**
- Full URL to your privacy policy page
- Must start with `http://` or `https://`
- Example: `https://www.yourdomain.com/privacy-policy`

**For Development/Testing:**
- You can use a placeholder URL temporarily
- Example: `https://yourdomain.com/privacy`
- Make sure the URL is accessible (even if it's a simple page)

**Best Practices:**
- Create a proper privacy policy page on your website
- Include information about:
  - What data you collect
  - How you use LinkedIn authentication
  - How you store user data
  - User rights and data deletion

### 3. Terms of Service URL (Optional)

**What to enter:**
- Full URL to your terms of service page
- Example: `https://www.yourdomain.com/terms`
- Not required, but recommended for production apps

### 4. App Logo

**What to upload:**
- Square image (recommended: 200x200px or larger)
- PNG or JPG format
- Your company logo or app icon
- This appears when users see your app in LinkedIn

## Complete Setup Checklist

- [ ] App Name entered
- [ ] LinkedIn Page selected/entered (Company Page, not personal profile)
- [ ] Privacy Policy URL added (must be accessible)
- [ ] App Logo uploaded (optional but recommended)
- [ ] "Sign In with LinkedIn using OpenID Connect" product requested
- [ ] Redirect URLs added:
  - [ ] `http://localhost:3000/api/auth/callback/linkedin` (development)
  - [ ] `https://yourdomain.com/api/auth/callback/linkedin` (production)
- [ ] Client ID copied to `.env` file
- [ ] Client Secret copied to `.env` file
- [ ] App saved and submitted for review (if required)

## Example Values for TEI Training & Consultancy

**LinkedIn Page:**
```
https://www.linkedin.com/company/talent-expertise-international/
```
Or just:
```
Talent Expertise International
```

**Privacy Policy URL:**
```
https://www.yourdomain.com/privacy-policy
```

**Terms of Service URL:**
```
https://www.yourdomain.com/terms
```

## Troubleshooting

**"This action can't be undone" warning:**
- Make sure you select the correct LinkedIn Page
- Double-check it's a Company Page, not a personal profile
- If you make a mistake, you may need to create a new app

**"Privacy Policy URL must start with http:// or https://":**
- Make sure your URL includes the protocol
- Example: ✅ `https://example.com/privacy`
- Example: ❌ `example.com/privacy` (missing https://)

**"LinkedIn Page not found":**
- Make sure the Company Page exists and is public
- Try using the full URL instead of just the name
- Verify you're using a Company Page, not a personal profile

## After Creating the App

1. Go to **Auth** tab
2. Copy **Client ID** and **Client Secret**
3. Add to your `.env` file:
   ```env
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   ```
4. Restart your dev server
5. Test the login functionality

