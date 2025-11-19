# ngrok Setup Guide

## Problem: ngrok Not Showing URL

If you run `ngrok http 3000` and don't see a URL, here's how to fix it:

## Step 1: Check if ngrok is Installed

**Windows:**
```powershell
ngrok version
```

If you get an error like "ngrok is not recognized", ngrok is not installed.

## Step 2: Install ngrok

### Option A: Download Executable (Recommended for Windows)

1. Go to: https://ngrok.com/download
2. Download the Windows version (ZIP file)
3. Extract the ZIP file
4. You'll get `ngrok.exe`
5. **Add to PATH or use full path:**
   - Option 1: Copy `ngrok.exe` to a folder in your PATH (e.g., `C:\Windows\System32`)
   - Option 2: Use full path when running: `C:\path\to\ngrok.exe http 3000`

### Option B: Install via npm

```bash
npm install -g ngrok
```

### Option C: Install via Chocolatey (Windows)

```powershell
choco install ngrok
```

## Step 3: Sign Up for Free ngrok Account

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up for a free account
3. Get your authtoken from the dashboard
4. Run this command:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

## Step 4: Run ngrok

**Make sure your dev server is running first:**
```bash
npm run dev
```

**Then in a NEW terminal, run:**
```bash
ngrok http 3000
```

**You should see:**
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL:** `https://abc123.ngrok-free.app`

## Alternative: Use ngrok Web Interface

1. After running `ngrok http 3000`
2. Open: http://127.0.0.1:4040
3. You'll see a web interface with your URL

## Troubleshooting

### Error: "ngrok is not recognized"
- ngrok is not installed or not in PATH
- Install ngrok or use full path to ngrok.exe

### Error: "authtoken required"
- You need to sign up and add your authtoken
- Run: `ngrok config add-authtoken YOUR_TOKEN`

### No output after running command
- Make sure your dev server is running on port 3000
- Check if port 3000 is already in use
- Try a different port: `ngrok http 3001` (and change your dev server port)

### Command runs but exits immediately
- Check for error messages
- Make sure you're in the correct directory
- Try running with verbose output

## Quick Test

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **In new terminal, run ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Look for this line:**
   ```
   Forwarding   https://xxxxx.ngrok-free.app -> http://localhost:3000
   ```

4. **Copy the HTTPS URL and use in LinkedIn:**
   ```
   https://xxxxx.ngrok-free.app/privacy-policy
   ```

## Alternative Solutions

If ngrok doesn't work, use these alternatives:

### Option 1: Deploy to Vercel (Free)
1. Go to https://vercel.com
2. Sign up
3. Deploy your privacy policy page
4. Get permanent URL

### Option 2: Use Your Existing Website
- If you have a website, create privacy policy page there
- Use that URL in LinkedIn

### Option 3: Use Netlify Drop
1. Go to https://app.netlify.com/drop
2. Drag and drop your privacy policy HTML file
3. Get instant URL

