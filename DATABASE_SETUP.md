# MongoDB Database Setup Guide

This project uses MongoDB with Prisma ORM to store all form submissions and admin panel data.

## Prerequisites

- Node.js installed
- MongoDB database (local or cloud like MongoDB Atlas)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will automatically run `prisma generate` after installation (via postinstall script).

### 2. Configure Database Connection

Create a `.env` file in the root directory:

```env
DATABASE_URL="mongodb://localhost:27017/tei-admin-panel"
```

**For MongoDB Atlas (Cloud):**
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/tei-admin-panel?retryWrites=true&w=majority"
```

**For Local MongoDB:**
```env
DATABASE_URL="mongodb://localhost:27017/tei-admin-panel"
```

### 3. Push Schema to Database

```bash
npm run db:push
```

This will create all the collections in your MongoDB database based on the Prisma schema.

### 4. Generate Prisma Client (if needed)

```bash
npm run db:generate
```

## Available API Routes

### Public Form Submissions

- `POST /api/forms/course-enquiry` - Submit course enquiry form
- `GET /api/forms/course-enquiry` - Get all course enquiries (paginated)

- `POST /api/forms/course-registration` - Submit course registration form
- `GET /api/forms/course-registration` - Get all course registrations (paginated)

- `POST /api/forms/in-house-course` - Submit in-house course request
- `GET /api/forms/in-house-course` - Get all in-house course requests (paginated)

- `POST /api/forms/brochure-download` - Submit brochure download request
- `GET /api/forms/brochure-download` - Get all brochure downloads (paginated)

- `POST /api/forms/online-session` - Submit online session request
- `GET /api/forms/online-session` - Get all online session requests (paginated)

### Admin Panel Entities

- `POST /api/admin/programs` - Create new program/course
- `GET /api/admin/programs` - Get all programs (paginated)

- `POST /api/admin/schedules` - Create new schedule
- `GET /api/admin/schedules` - Get all schedules (paginated)

- `POST /api/admin/mentors` - Create new mentor
- `GET /api/admin/mentors` - Get all mentors (paginated)

- `POST /api/admin/team-members` - Create new team member
- `GET /api/admin/team-members` - Get all team members (paginated)

- `POST /api/admin/venues` - Create new venue
- `GET /api/admin/venues` - Get all venues (paginated)

## Database Schema Overview

### Public Forms Collections
- `course_enquiries` - Course enquiry form submissions
- `course_registrations` - Course registration form submissions
- `in_house_course_requests` - In-house course request submissions
- `brochure_downloads` - Brochure download requests
- `online_session_requests` - Online session requests

### Admin Collections
- `programs` - Courses/programs created by admin
- `course_outlines` - Course outline items (related to programs)
- `certifications` - Certifications (related to programs)
- `faqs` - FAQs (related to programs)
- `schedules` - Course schedules (related to programs and mentors)
- `mentors` - Mentor profiles
- `team_members` - Team member profiles
- `venues` - Training venue locations

## Using Prisma Studio

To view and manage your database through a GUI:

```bash
npm run db:studio
```

This will open Prisma Studio at `http://localhost:5555`

## Important Notes

1. **Password Hashing**: Team member passwords should be hashed before storing. Consider using bcrypt or similar.
2. **File Uploads**: Image uploads (for programs, mentors, etc.) should be handled separately (e.g., upload to cloud storage) and store the URL in the database.
3. **Environment Variables**: Never commit your `.env` file to version control.

## Troubleshooting

### Connection Issues

- Verify your MongoDB is running (if local)
- Check your DATABASE_URL format
- Ensure network access if using MongoDB Atlas

### Schema Changes

After modifying `prisma/schema.prisma`:
1. Run `npm run db:push` to sync changes
2. Run `npm run db:generate` to regenerate Prisma Client

## Next Steps

To integrate forms with the API:
1. Update form submission handlers to call the respective API endpoints
2. Handle file uploads separately (images, documents)
3. Add authentication/authorization for admin routes
4. Implement proper error handling and validation
