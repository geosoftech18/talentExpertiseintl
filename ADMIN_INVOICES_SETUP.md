# Admin Invoice Management System

Complete admin invoice management functionality has been implemented for your Next.js application.

## ✅ What's Been Implemented

### 1. Database Schema Updates
- ✅ Added `paymentDate` field to Invoice model
- ✅ Added `transactionId` field to Invoice model
- ✅ All existing fields preserved

### 2. Backend API Routes

#### GET `/api/admin/invoices`
- Fetch all invoices with pagination
- Filter by status (PENDING, PAID, CANCELLED, OVERDUE)
- Search by invoice number, customer name, email, course title, transaction ID
- Filter overdue invoices (dueDate < today and status = PENDING)
- Returns paginated results

**Query Parameters:**
- `status` - Filter by status (PENDING, PAID, CANCELLED, OVERDUE, or ALL)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `search` - Search query
- `overdue` - true/false to show only overdue invoices

#### PATCH `/api/admin/invoices/[id]`
- Update invoice status
- Set payment date when marking as PAID
- Store transaction ID
- Automatically updates related course registration when marking as PAID

**Request Body:**
```json
{
  "status": "PAID",
  "transactionId": "TXN123456" // Optional
}
```

#### POST `/api/admin/invoices/resend/[id]`
- Resend invoice email to customer
- Attaches PDF invoice
- Uses existing email service

### 3. Frontend Admin Page

**Route:** `/admin/invoices`

**Features:**
- ✅ Professional UI matching your theme
- ✅ Status tabs (All, Pending, Paid, Overdue, Cancelled)
- ✅ Search functionality
- ✅ Status badges with colors
- ✅ View PDF button
- ✅ Download PDF button
- ✅ Resend email button
- ✅ Mark as Paid button
- ✅ Cancel Invoice button
- ✅ Update status dialog with transaction ID input
- ✅ Overdue highlighting
- ✅ Responsive table layout

### 4. Navigation Integration
- ✅ Added "Invoices" to sidebar menu
- ✅ Added route handling in admin layout
- ✅ Uses Receipt icon for invoices

## 🚀 Setup Instructions

### 1. Update Database Schema

```bash
npx prisma db push
npx prisma generate
```

This will add the `paymentDate` and `transactionId` fields to your Invoice model.

### 2. Access the Admin Page

1. Navigate to: `http://localhost:3000/admin/invoices`
2. Or click "Invoices" in the sidebar

## 📋 Admin Features

### View Invoices
- See all invoices in a table
- Filter by status using tabs
- Search by invoice number, customer, email, course, or transaction ID
- View overdue invoices separately

### Mark Invoice as Paid
1. Click the green checkmark icon (✓) on any invoice
2. Enter transaction ID (optional)
3. Click "Update"
4. Invoice status changes to PAID
5. Payment date is automatically set
6. Related course registration is updated to "Paid" and "Completed"

### Cancel Invoice
1. Click the red X icon on any invoice
2. Confirm cancellation
3. Invoice status changes to CANCELLED

### Resend Invoice Email
1. Click the mail icon (✉) on any invoice
2. Email is sent to customer with PDF attachment
3. Success message is shown

### View/Download PDF
- Click eye icon (👁) to view PDF in new tab
- Click download icon (⬇) to download PDF

## 🎨 UI Features

- **Status Badges:**
  - 🟢 Green: PAID
  - 🟡 Yellow: PENDING
  - 🔴 Red: OVERDUE
  - ⚫ Gray: CANCELLED

- **Overdue Highlighting:**
  - Overdue invoices show red due date
  - Alert icon on status badge

- **Responsive Design:**
  - Works on all screen sizes
  - Follows your existing theme

## 🔄 Workflow

### When Admin Marks Invoice as Paid:
1. Invoice status → PAID
2. Payment date → Current date/time
3. Transaction ID → Saved (if provided)
4. Course Registration → Payment Status: "Paid", Order Status: "Completed"

### When Admin Cancels Invoice:
1. Invoice status → CANCELLED
2. Transaction ID → Can be added for reference

## 📊 Invoice Status Flow

```
PENDING → PAID (via admin action)
PENDING → CANCELLED (via admin action)
PENDING → OVERDUE (automatic when dueDate passes)
```

## 🧪 Testing

1. **View Invoices:**
   - Go to `/admin/invoices`
   - Should see all invoices

2. **Mark as Paid:**
   - Click checkmark on a PENDING invoice
   - Enter transaction ID
   - Verify status changes to PAID

3. **Cancel Invoice:**
   - Click X on an invoice
   - Verify status changes to CANCELLED

4. **Resend Email:**
   - Click mail icon
   - Check customer email inbox

5. **View PDF:**
   - Click eye icon
   - PDF should open in new tab

## 📁 Files Created/Modified

### Created:
- `app/api/admin/invoices/route.ts` - List invoices API
- `app/api/admin/invoices/[id]/route.ts` - Update invoice API
- `app/api/admin/invoices/resend/[id]/route.ts` - Resend email API
- `app/admin/invoices/page.tsx` - Admin invoices page route
- `components/pages/invoices.tsx` - Invoices management component

### Modified:
- `prisma/schema.prisma` - Added paymentDate and transactionId
- `components/sidebar.tsx` - Added Invoices menu item
- `components/admin-layout.tsx` - Added invoices route handling

## 🎯 Next Steps (Optional Enhancements)

1. **Export to CSV/Excel**
   - Add export button
   - Generate CSV with invoice data

2. **Bulk Actions**
   - Select multiple invoices
   - Bulk mark as paid/cancelled

3. **Invoice Details Modal**
   - Click invoice row to see full details
   - Show all customer and course information

4. **Payment History**
   - Track payment changes
   - Show payment timeline

5. **Automated Overdue Detection**
   - Cron job to mark overdue invoices
   - Send reminder emails

## ✅ All Done!

Your admin invoice management system is ready to use. Admins can now:
- ✅ View all invoices
- ✅ Filter and search invoices
- ✅ Mark invoices as paid
- ✅ Cancel invoices
- ✅ Resend invoice emails
- ✅ View/download PDFs
- ✅ Track payment dates and transaction IDs

The system automatically updates related course registrations when invoices are marked as paid.

