# Testing Program Creation

## How to Test Adding a Program to Database

### Step 1: Start Your Development Server
```bash
npm run dev
```

### Step 2: Navigate to Admin Panel
1. Open your browser: `http://localhost:3000`
2. Go to Admin Panel
3. Navigate to "Add New Program" or "Add New Course"

### Step 3: Fill Out the Form
Fill in at least these required fields:
- **Reference Code**: Auto-generated when you select category
- **Program Name**: e.g., "Advanced Project Management"
- **Category**: Select any category (e.g., "Project Management")
- **Type**: Select at least one (e.g., "Public Program")
- **Status**: Select "Draft" or "Published"
- **Duration**: e.g., "5 days"

Optional fields (can be left empty):
- Target Audience
- Learning Objectives
- Training Methodology
- Introduction
- Description
- Course Outline (can add at least one)
- Certifications (optional)
- FAQs (optional)

### Step 4: Submit the Form
1. Click "Save Course" button
2. You should see:
   - Button shows "Saving..." while processing
   - Success alert: "Program created successfully!"
   - Form closes or navigates back

### Step 5: Verify Data in Database

**Option A: Using Prisma Studio (Visual GUI)**
```bash
npm run db:studio
```
- Opens at `http://localhost:5555`
- Click on `Programs` collection
- You should see your newly created program

**Option B: Check Browser Console**
- Open browser DevTools (F12)
- Check Console tab for any errors
- Check Network tab to see API call to `/api/admin/programs`

**Option C: View Programs in Admin Panel**
- Go back to Programs/Courses list in admin panel
- Your new program should appear (if you have a GET endpoint connected)

## Expected Result

✅ **Success:**
- Alert shows "Program created successfully!"
- No errors in console
- Data visible in Prisma Studio

❌ **If it fails:**
- Check browser console for errors
- Check terminal/command prompt for server errors
- Verify MongoDB connection is working
- Check if all required fields are filled

## Troubleshooting

1. **"Failed to create program" error:**
   - Check if all required fields are filled
   - Verify at least one course type is selected
   - Check server console for detailed error

2. **Network error:**
   - Make sure dev server is running
   - Check if API route exists at `/api/admin/programs`

3. **Data not appearing:**
   - Wait a few seconds
   - Refresh Prisma Studio
   - Check MongoDB Atlas directly

