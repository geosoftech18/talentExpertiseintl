# Cloudflare R2 Storage Setup

This guide explains how to configure Cloudflare R2 for storing invoice PDFs with automatic year/month folder structure.

## Overview

Invoice PDFs are now stored in Cloudflare R2 (S3-compatible object storage) with the following folder structure:
- **Format**: `YYYY/MM/filename.pdf` (e.g., `2025/02/INV-2025-0001.pdf`)
- **Automatic**: The folder structure is automatically created based on the current date when the invoice is generated

## Prerequisites

1. A Cloudflare account (free tier is sufficient)
2. An R2 bucket created in your Cloudflare dashboard

## Step 1: Create R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the left sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `invoice-pdfs`)
5. Click **Create bucket**

## Step 2: Get R2 Credentials

1. In the R2 dashboard, click on **Manage R2 API Tokens**
2. Click **Create API Token**
3. Set the following:
   - **Token name**: `Invoice Storage` (or any name you prefer)
   - **Permissions**: **Object Read & Write**
   - **TTL**: Leave empty (or set expiration if desired)
   - **Bucket**: Select your bucket or leave as "All buckets"
4. Click **Create API Token**
5. **Important**: Copy the following values immediately (they won't be shown again):
   - **Access Key ID**
   - **Secret Access Key**

## Step 3: Set Up Public Access (Optional but Recommended)

To make invoices publicly accessible via URL:

1. In your R2 bucket, go to **Settings**
2. Under **Public Access**, you can either:
   - **Option A**: Use Cloudflare's public URL (automatic)
   - **Option B**: Set up a custom domain (recommended for production)

### Option A: Use Cloudflare Public URL

1. Enable **Public Access** in bucket settings
2. Note the public URL format: `https://pub-<account-id>.r2.dev/<bucket-name>`

### Option B: Custom Domain (Recommended)

1. In bucket settings, go to **Custom Domains**
2. Add your custom domain (e.g., `invoices.yourdomain.com`)
3. Follow Cloudflare's instructions to configure DNS
4. Once configured, you can use this domain as your public URL

## Step 4: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_BUCKET_NAME=invoice-pdfs
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_R2_PUBLIC_URL=https://pub-<account-id>.r2.dev/invoice-pdfs
# OR if using custom domain:
# CLOUDFLARE_R2_PUBLIC_URL=https://invoices.yourdomain.com

# Optional: Custom endpoint (usually not needed)
# CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

### Environment Variable Details

- **CLOUDFLARE_R2_BUCKET_NAME**: The name of your R2 bucket
- **CLOUDFLARE_R2_ACCESS_KEY_ID**: The Access Key ID from Step 2
- **CLOUDFLARE_R2_SECRET_ACCESS_KEY**: The Secret Access Key from Step 2
- **CLOUDFLARE_R2_PUBLIC_URL**: The public URL where invoices will be accessible (from Step 3)
- **CLOUDFLARE_R2_ENDPOINT**: (Optional) Custom endpoint URL (usually auto-detected)

## Step 5: Verify Configuration

After setting up the environment variables:

1. Restart your development server or redeploy your application
2. Generate a test invoice
3. Check your R2 bucket - you should see a folder structure like:
   ```
   2025/
     02/
       INV-2025-0001.pdf
   ```
4. Verify the invoice PDF is accessible via the public URL

## Fallback Behavior

If R2 is not configured or if an upload fails:
- The system will automatically fall back to local storage (`/public/invoices/`)
- Existing invoices stored locally will continue to work
- No functionality will be disrupted

## Folder Structure

Invoices are automatically organized by year and month:
- **2025/02/** - February 2025 invoices
- **2025/03/** - March 2025 invoices
- etc.

This makes it easy to:
- Organize invoices chronologically
- Find invoices by date
- Manage storage efficiently

## Troubleshooting

### Error: "CLOUDFLARE_R2_BUCKET_NAME is not set"
- Make sure all required environment variables are set in your `.env` file
- Restart your server after adding environment variables

### Error: "Access Denied" or "Invalid credentials"
- Verify your Access Key ID and Secret Access Key are correct
- Check that your API token has the correct permissions (Object Read & Write)

### Invoices not accessible via public URL
- Verify public access is enabled in your R2 bucket settings
- Check that `CLOUDFLARE_R2_PUBLIC_URL` matches your bucket's public URL
- If using a custom domain, ensure DNS is properly configured

### Upload fails but local storage works
- Check R2 bucket permissions
- Verify network connectivity
- Check Cloudflare R2 service status
- Review server logs for detailed error messages

## Cost

Cloudflare R2 offers:
- **10 GB storage** free per month
- **1 million Class A operations** (writes) free per month
- **10 million Class B operations** (reads) free per month

For most use cases, the free tier is more than sufficient.

## Security Notes

- Never commit your R2 credentials to version control
- Use environment variables for all sensitive information
- Consider using Cloudflare's Access policies for additional security
- Regularly rotate your API tokens

## Support

For issues or questions:
1. Check Cloudflare R2 documentation: https://developers.cloudflare.com/r2/
2. Review server logs for detailed error messages
3. Verify all environment variables are correctly set




