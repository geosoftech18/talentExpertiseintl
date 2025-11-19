# Invoice Payment System Setup

This document describes the invoice payment system implementation for course registrations.

## 🎯 Overview

When users select "Pay via Invoice" as their payment method during course registration:
1. An invoice number is generated sequentially (INV-2025-0001, INV-2025-0002, etc.)
2. A new invoice record is created in the database with status "PENDING"
3. A PDF invoice is generated and saved to `/public/invoices/`
4. The invoice PDF is emailed to the user
5. A success response is returned to the frontend

## 📦 Installation

Install the required dependencies:

```bash
npm install pdfkit
npm install --save-dev @types/pdfkit
```

Or if using pnpm:

```bash
pnpm add pdfkit
pnpm add -D @types/pdfkit
```

## 🗄️ Database Setup

1. **Update Prisma Schema**: The schema has been updated with `Invoice` and `InvoiceCounter` models.

2. **Push Schema Changes**:
   ```bash
   npx prisma db push
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

## 📁 File Structure

### New Files Created:
- `lib/utils/invoice-pdf.ts` - PDF generation helper
- `lib/services/invoice-service.ts` - Core invoice service
- `app/api/invoices/route.ts` - Invoice API endpoint

### Modified Files:
- `prisma/schema.prisma` - Added Invoice and InvoiceCounter models
- `lib/email.ts` - Added attachment support
- `app/api/forms/course-registration/route.ts` - Integrated invoice generation
- `components/course-registration-form.tsx` - Added "Pay via Invoice" option

## 🔧 Configuration

### Environment Variables (Optional)

Add these to your `.env` file for custom invoice branding:

```env
# Company Information (for invoice PDF)
COMPANY_NAME=Talent Expertise Institute
COMPANY_ADDRESS=Dubai, UAE
COMPANY_EMAIL=info@example.com
COMPANY_PHONE=+971 XX XXX XXXX
COMPANY_PAYMENT_INFO=Bank: ABC Bank | Account: 123456789 | SWIFT: ABCDEFGH

# App URL (for internal API calls)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Email Provider

Make sure you have one of these configured:
- `RESEND_API_KEY` (Resend)
- `SENDGRID_API_KEY` (SendGrid)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (SMTP/Nodemailer)

## 🚀 Usage

### Frontend

The course registration form now includes "Pay via Invoice" as a payment option. When selected and submitted:

1. The registration is created
2. An invoice is automatically generated
3. The user receives an email with the invoice PDF
4. A success message is shown with the invoice number

### API Endpoints

#### POST `/api/invoices`
Create a new invoice.

**Request Body:**
```json
{
  "courseId": "course_id_here",
  "scheduleId": "schedule_id_here",
  "amount": 4999,
  "email": "student@example.com",
  "name": "John Doe",
  "courseTitle": "Course Name",
  "address": "123 Main St",
  "city": "Dubai",
  "country": "UAE"
}
```

**Response:**
```json
{
  "success": true,
  "invoiceNo": "INV-2025-0001",
  "invoiceId": "invoice_id",
  "pdfUrl": "/invoices/INV-2025-0001.pdf",
  "emailSent": true
}
```

#### GET `/api/invoices`
Get invoices with optional filters.

**Query Parameters:**
- `userId` - Filter by user ID
- `status` - Filter by status (PENDING, PAID, OVERDUE, CANCELLED)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

## 📊 Database Models

### Invoice
- Stores invoice information
- Links to course, schedule, and registration
- Tracks status and payment dates
- Contains denormalized customer and course info

### InvoiceCounter
- Maintains sequential invoice numbers per year
- Automatically increments for each new invoice
- Format: `INV-YYYY-XXXX` (e.g., INV-2025-0001)

## 🔍 Invoice Status Flow

1. **PENDING** - Initial status when invoice is created
2. **PAID** - When payment is received (manual update)
3. **OVERDUE** - When due date has passed (can be automated)
4. **CANCELLED** - When invoice is cancelled

## 📝 Next Steps (Optional Enhancements)

1. **Admin Invoice Management Page**
   - Create `/app/admin/invoices/page.tsx`
   - List all invoices with filters
   - Mark invoices as PAID
   - View invoice PDFs
   - Send invoice reminders

2. **Automated Overdue Detection**
   - Cron job to check for overdue invoices
   - Send reminder emails for overdue invoices

3. **Invoice Payment Tracking**
   - Integration with payment gateways
   - Automatic status updates on payment

4. **Invoice Templates**
   - Customizable invoice templates
   - Multiple template options

## 🐛 Troubleshooting

### PDF Generation Fails
- Ensure `pdfkit` is installed: `npm install pdfkit`
- Check that `/public/invoices/` directory is writable
- Verify file system permissions

### Email Not Sending
- Check email provider configuration
- Verify email provider credentials
- Check email provider logs/console

### Invoice Number Not Incrementing
- Ensure `InvoiceCounter` record exists for current year
- Check database connection
- Verify Prisma client is up to date

## 📄 License

This implementation is part of the TEI Admin Panel project.

