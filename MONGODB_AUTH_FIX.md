# MongoDB Authentication Error Fix

## Error: "Authentication failed"

This means your database connection string format is correct, but MongoDB can't authenticate. Check these:

### 1. Password URL Encoding
If your password contains special characters (`@`, `#`, `%`, `/`, etc.), they must be URL encoded:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `/` → `%2F`
- `:` → `%3A`
- `?` → `%3F`
- `&` → `%26`
- `=` → `%3D`

Your current password: `ibF9LCetkGYd9YRh`
- If this is the actual password (no special chars), encoding is not needed
- But double-check in MongoDB Atlas that this password is correct

### 2. Verify MongoDB Atlas Settings

**Check in MongoDB Atlas:**
1. **Database Access:**
   - Go to MongoDB Atlas → Database Access
   - Verify username: `londonpioneer82_db_user`
   - If password is wrong, reset it
   - Make sure user has "Read and write to any database" permission

2. **Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add your current IP address, OR
   - Add `0.0.0.0/0` to allow all IPs (for development only)

### 3. Test Connection String

Try this format with URL-encoded password (if needed):
```
DATABASE_URL="mongodb+srv://londonpioneer82_db_user:ENCODED_PASSWORD@cluster0.pnnzcq7.mongodb.net/talent-expertise?retryWrites=true&w=majority"
```

### 4. Reset Password (If needed)

1. Go to MongoDB Atlas → Database Access
2. Click on your user
3. Click "Edit" → "Edit Password"
4. Set a new password (avoid special characters for easier setup)
5. Update your `.env` file with the new password

### 5. Common Issues

- **Password has special characters** → Need URL encoding
- **IP not whitelisted** → Add IP in Network Access
- **Wrong username** → Verify in Database Access
- **User lacks permissions** → Grant "Read and write" permissions

