# Database Connection String Format

## For MongoDB Atlas (Cloud):

Your DATABASE_URL should look like this:

```env
DATABASE_URL="mongodb+srv://username:password@cluster0.pnnzcq7.mongodb.net/tei-admin-panel?retryWrites=true&w=majority"
```

**Important:** Replace:
- `username` - Your MongoDB Atlas username
- `password` - Your MongoDB Atlas password (if it contains special characters, URL encode them)
- `tei-admin-panel` - The database name (you can change this to any name you want)

## For Local MongoDB:

```env
DATABASE_URL="mongodb://localhost:27017/tei-admin-panel"
```

## Next Steps After Updating .env:

1. Make sure your `.env` file has the correct format with database name
2. Run: `npm run db:push` to create the collections in MongoDB
3. Test the connection by submitting a form

## Special Characters in Password:

If your password contains special characters like `@`, `#`, `%`, etc., you need to URL encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- `/` becomes `%2F`
- etc.

Example:
If password is `my@pass#123`, it should be: `my%40pass%23123`
