# Connect Cloudflare Pages to Your Backend - 2 Minute Fix

## The Problem
Your Cloudflare Pages frontend is trying to connect to `http://localhost:8000` or an undefined backend URL, but localhost doesn't work from Cloudflare's servers.

## The Solution - Use ngrok

### Step 1: Download ngrok (1 minute)

**Windows Quick Install:**

Option A - Download directly:
1. Go to: https://ngrok.com/download
2. Click "Download for Windows"
3. Extract the zip file to a folder (e.g., `C:\Tools\ngrok`)

Option B - Use winget (if you have it):
```bash
winget install ngrok.ngrok
```

Option C - Use chocolatey (if you have it):
```bash
choco install ngrok
```

### Step 2: Sign up (free, 30 seconds)
1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with GitHub (fastest)
3. Copy your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

### Step 3: Authenticate ngrok (one-time)
```bash
# If you extracted to C:\Tools\ngrok
cd C:\Tools\ngrok
ngrok config add-authtoken YOUR_TOKEN_HERE

# Or if installed via winget, just:
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### Step 4: Start ngrok (keep this running)
```bash
# Make sure your Docker backend is running first!
# Then run:
ngrok http 8000
```

You'll see something like this:
```
Session Status                online
Account                       your-email@gmail.com
Forwarding                    https://abc123-456-789.ngrok-free.app -> http://localhost:8000
```

**⚠️ IMPORTANT: Keep this terminal window open!**

**Copy that HTTPS URL** (e.g., `https://abc123-456-789.ngrok-free.app`)

### Step 5: Update Cloudflare Pages (1 minute)

1. **Go to**: https://dash.cloudflare.com/
2. **Navigate**: Workers & Pages → Your project (probably "symposium" or similar name)
3. **Click**: Settings → Environment variables
4. **Find or Add**: `VITE_API_URL`
5. **Set value to your ngrok URL**:
   ```
   https://abc123-456-789.ngrok-free.app
   ```
6. **Click**: "Save"

### Step 6: Redeploy (1 minute)

Option A - Push a change to GitHub:
```bash
# Make a small change (add a space to README)
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

Option B - Manual redeploy:
1. Go to: Deployments tab
2. Click the three dots (...) on latest deployment
3. Click "Retry deployment"

### Step 7: Wait & Test (1-2 minutes)
1. Wait for Cloudflare to rebuild (watch the Deployments tab)
2. Once it says "Success", visit your Cloudflare URL
3. You should now see all 16 historical figures!

---

## Important Notes

### ✅ Pros:
- Works immediately
- Free (for testing)
- HTTPS included

### ⚠️ Limitations:
- ngrok must stay running (don't close the terminal!)
- Free ngrok URLs change when you restart ngrok
- If you restart ngrok, you'll need to update Cloudflare again with the new URL

### 🔄 If ngrok restarts:
1. Start ngrok again: `ngrok http 8000`
2. Copy the NEW URL
3. Update Cloudflare Pages environment variable
4. Redeploy

---

## For Production (Permanent Solution)

Once you're ready for production, deploy the backend to:
- Your server (192.168.50.50)
- A VPS (DigitalOcean, AWS, etc.)
- Any server with a static IP/domain

Then you won't need ngrok anymore.

---

## Troubleshooting

### "Command not found: ngrok"
If you extracted ngrok manually, use full path:
```bash
C:\Tools\ngrok\ngrok.exe http 8000
```

Or add to PATH:
1. Search "Environment Variables" in Windows
2. Edit "Path" variable
3. Add the folder where ngrok.exe is located

### Backend not running
Make sure Docker is running first:
```bash
docker-compose ps
```

Should show "Up" status. If not:
```bash
docker-compose up -d
```

### Still no figures showing
1. Open browser console (F12) on your Cloudflare Pages site
2. Check Network tab for errors
3. Look for the API URL it's trying to reach
4. Verify it matches your ngrok URL

### CORS errors
Update `docker-compose.yml`:
```yaml
environment:
  - ALLOWED_ORIGINS=*
```

Then restart:
```bash
docker-compose restart
```

---

## What's Your Cloudflare URL?

Tell me your Cloudflare Pages URL and I can help verify everything is working!
