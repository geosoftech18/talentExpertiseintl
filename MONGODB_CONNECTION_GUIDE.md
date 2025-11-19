# Step-by-Step: Get Working MongoDB Connection String

## Method 1: Create NEW Database User (Recommended)

1. **Go to MongoDB Atlas → Database Access**
2. **Click "Add New Database User"**
3. **Fill in:**
   - Authentication Method: `Password`
   - Username: `tei_admin` (simple, no underscores)
   - Password: Create a simple password (only letters and numbers, NO special characters)
     - Example: `MyPassword123`
   - Database User Privileges: **"Read and write to any database"**
4. **Click "Add User"**
5. **Wait 1-2 minutes for user to be created**

## Method 2: Get Connection String from Atlas UI

1. **Go to MongoDB Atlas → Database → Connect**
2. **Click "Connect your application"**
3. **Copy the connection string shown** (it will have `<password>` placeholder)
4. **Replace `<password>` with your ACTUAL password**
5. **Add database name after `.net/` and before `?`**

Example:
```
mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/
```

Should become:
```
mongodb+srv://username:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/talent-expertise?retryWrites=true&w=majority
```

## Method 3: Build Connection String Manually

If you know your credentials, build it like this:

```
mongodb+srv://USERNAME:PASSWORD@cluster0.pnnzcq7.mongodb.net/talent-expertise?retryWrites=true&w=majority
```

**Important:**
- Replace `USERNAME` with your MongoDB username
- Replace `PASSWORD` with your MongoDB password (no angle brackets)
- Keep everything else exactly as shown

## After Creating Connection String:

1. **Update your `.env` file:**
   ```env
   DATABASE_URL="your-complete-connection-string-here"
   ```

2. **Test the connection:**
   ```bash
   npm run db:push
   ```

## Common Mistakes:

❌ Using `<password>` instead of actual password
❌ Missing database name in connection string
❌ Password with special characters not URL encoded
❌ Copy-paste errors (extra spaces, missing characters)
❌ User doesn't have "Read and write" permissions

✅ Correct format includes:
- Username
- Actual password (not placeholder)
- Database name
- Proper query parameters

