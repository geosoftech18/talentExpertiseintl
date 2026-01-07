# Stripe Payment Gateway Setup Guide

This guide explains the environment variables required for Stripe payment gateway integration.

## 🔑 Required Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe API Version (Optional - defaults to latest)
STRIPE_API_VERSION=2024-11-20.acacia
```

## 📝 Environment Variable Details

### 1. STRIPE_SECRET_KEY
- **Type**: Secret key (server-side only)
- **Format**: Starts with `sk_test_` (test mode) or `sk_live_` (production)
- **Purpose**: Used for server-side API calls (creating payments, managing customers, etc.)
- **Security**: ⚠️ **NEVER expose this in client-side code**

### 2. STRIPE_PUBLISHABLE_KEY
- **Type**: Public key (can be used in client-side)
- **Format**: Starts with `pk_test_` (test mode) or `pk_live_` (production)
- **Purpose**: Used in frontend to initialize Stripe.js and create payment elements
- **Security**: ✅ Safe to use in client-side code

### 3. STRIPE_WEBHOOK_SECRET (Optional but Recommended)
- **Type**: Webhook signing secret
- **Format**: Starts with `whsec_`
- **Purpose**: Used to verify webhook events from Stripe
- **Security**: ⚠️ **Keep this secret, server-side only**

### 4. STRIPE_API_VERSION (Optional)
- **Type**: API version string
- **Format**: `YYYY-MM-DD.variant` (e.g., `2024-11-20.acacia`)
- **Purpose**: Pins your integration to a specific Stripe API version
- **Default**: Latest version if not specified

## 🚀 Getting Your Stripe Keys

### Step 1: Create a Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account setup

### Step 2: Get Your API Keys

1. **Log in to Stripe Dashboard**
2. **Go to Developers → API Keys**
3. **Test Mode Keys** (for development):
   - Copy **Publishable key** (starts with `pk_test_`)
   - Click **Reveal test key** to see **Secret key** (starts with `sk_test_`)

4. **Live Mode Keys** (for production):
   - Toggle to **Live mode** in the dashboard
   - Copy **Publishable key** (starts with `pk_live_`)
   - Click **Reveal live key** to see **Secret key** (starts with `sk_live_`)

### Step 3: Set Up Webhooks (Optional but Recommended)

1. **Go to Developers → Webhooks**
2. **Click "Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe` (or your webhook endpoint)
4. **Events to send**: Select events you want to listen to (e.g., `payment_intent.succeeded`, `payment_intent.payment_failed`)
5. **Copy the Signing secret** (starts with `whsec_`)

## 📋 Complete .env Example

```env
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# For Production (use live keys)
# STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
# STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use test keys** during development
3. **Switch to live keys** only in production
4. **Keep secret keys secure** - never expose in client-side code
5. **Use environment variables** in your hosting platform (Vercel, Netlify, etc.)

## 🧪 Testing

1. **Test Mode**: Use test keys (`sk_test_`, `pk_test_`)
   - Use test card numbers: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

2. **Live Mode**: Use live keys (`sk_live_`, `pk_live_`)
   - Real payment processing
   - Real money transactions

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

## ⚠️ Important Notes

- **Test vs Live Keys**: Always use test keys during development
- **Key Rotation**: Rotate keys if compromised
- **Rate Limits**: Stripe has rate limits - check your dashboard
- **Webhooks**: Set up webhooks for production to handle payment events securely


