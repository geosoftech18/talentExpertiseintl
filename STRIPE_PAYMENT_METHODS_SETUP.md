# Stripe Payment Methods Setup Guide

This guide explains how to enable all payment methods in Stripe for your live website.

## Current Status

The warnings you're seeing are normal for development. Here's what they mean:

### ✅ Working Now (Development)
- **Credit/Debit Cards** - Works over HTTP in test mode
- Basic payment processing

### ⚠️ Requires Production Setup
- **Link** - Needs to be activated in Stripe Dashboard
- **Apple Pay** - Requires domain verification and HTTPS
- **Google Pay** - Requires HTTPS and proper setup
- **Other payment methods** - May need activation

## Step-by-Step Setup for All Payment Methods

### 1. Activate Payment Methods in Stripe Dashboard

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com/)**
2. **Navigate to:** Settings → Payment methods
3. **Activate the following methods:**
   - ✅ **Cards** (already active)
   - ✅ **Link** - Click "Activate" next to Link
   - ✅ **Apple Pay** - Click "Activate" (requires domain verification)
   - ✅ **Google Pay** - Click "Activate"
   - ✅ **Any other methods** you want to offer

### 2. Register Domain for Apple Pay & Google Pay

#### For Apple Pay:
1. **Go to:** Settings → Payment methods → Apple Pay
2. **Click "Add domain"**
3. **Enter your domain:** `yourdomain.com` (without `https://` or `www`)
4. **Download the verification file** Stripe provides
5. **Upload it to your website** at: `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`
6. **Click "Verify"** in Stripe Dashboard
7. **Wait for verification** (usually instant, can take up to 24 hours)

#### For Google Pay:
1. **Go to:** Settings → Payment methods → Google Pay
2. **Your domain is automatically registered** when you verify Apple Pay
3. **Ensure HTTPS is enabled** on your website

### 3. Deploy to Production (HTTPS Required)

**Why HTTPS is required:**
- Apple Pay and Google Pay only work over HTTPS
- Required for live payments
- Better security for customers

**Options:**
- **Vercel** (Recommended) - Automatic HTTPS
- **Netlify** - Automatic HTTPS
- **Your own server** - Install SSL certificate (Let's Encrypt is free)

### 4. Update Environment Variables for Production

Once deployed, update your production environment variables:

```env
# Production Stripe Keys (from Stripe Dashboard → Developers → API keys)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Production URLs
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Important:**
- Use **live keys** (`sk_live_` and `pk_live_`) for production
- Keep **test keys** (`sk_test_` and `pk_test_`) for development
- Never mix test and live keys

### 5. Set Up Stripe Webhook for Production

1. **Go to:** Developers → Webhooks
2. **Click "Add endpoint"**
3. **Endpoint URL:** `https://yourdomain.com/api/stripe/webhook`
4. **Select events to listen to:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. **Copy the Signing secret** (starts with `whsec_`)
6. **Add to production environment variables**

## Testing Payment Methods

### Test Mode (Development)
- ✅ Credit/Debit Cards - Use test card: `4242 4242 4242 4242`
- ⚠️ Link - Shows in test mode but needs activation for live
- ❌ Apple Pay - Only works over HTTPS (even in test mode)
- ❌ Google Pay - Only works over HTTPS (even in test mode)

### Live Mode (Production)
- ✅ All activated payment methods will work
- ✅ Apple Pay - Works after domain verification
- ✅ Google Pay - Works automatically
- ✅ Link - Works after activation

## Quick Checklist

Before going live, ensure:

- [ ] Website is deployed to HTTPS (production)
- [ ] Live Stripe keys are in production environment variables
- [ ] Payment methods activated in Stripe Dashboard
- [ ] Domain registered and verified for Apple Pay
- [ ] Webhook endpoint configured for production
- [ ] Test payments work correctly
- [ ] Error handling is in place

## Current Implementation

Your code is already set up correctly:
- ✅ `automatic_payment_methods: { enabled: true }` - Shows all available methods
- ✅ `allow_redirects: 'always'` - Allows redirect-based payment methods
- ✅ PaymentElement configured to show all methods
- ✅ Full-screen payment page implemented

## What Happens After Setup

Once you:
1. Deploy to HTTPS
2. Activate payment methods in Stripe
3. Verify domain for Apple Pay

**Users will see:**
- Credit/Debit Cards
- Link (Stripe's one-click checkout)
- Apple Pay (on supported devices)
- Google Pay (on supported devices)
- Other methods you've activated

## Troubleshooting

### "Link not showing"
- Activate Link in Stripe Dashboard → Settings → Payment methods

### "Apple Pay not showing"
- Domain must be verified
- Must be served over HTTPS
- User must be on a supported device/browser

### "Google Pay not showing"
- Must be served over HTTPS
- User must be on a supported device/browser

### "Only credit card showing"
- Check Stripe Dashboard → Settings → Payment methods
- Ensure methods are activated
- Check browser console for errors

## Development vs Production

### Development (localhost:3000)
- ✅ Test credit cards work
- ⚠️ Link shows but needs activation
- ❌ Apple Pay/Google Pay won't work (HTTPS required)

### Production (yourdomain.com with HTTPS)
- ✅ All activated payment methods work
- ✅ Apple Pay works (after domain verification)
- ✅ Google Pay works automatically
- ✅ Link works (after activation)

## Next Steps

1. **For now (Development):**
   - Test with credit cards using test card numbers
   - The warnings are normal and won't break functionality

2. **Before going live:**
   - Deploy to production with HTTPS
   - Activate all payment methods in Stripe Dashboard
   - Register domain for Apple Pay
   - Switch to live Stripe keys
   - Test all payment methods

Your implementation is correct - these are just setup requirements for production! 🚀

