# 🚀 Deploy to Cloudflare Pages (FREE)

## Overview

**Frontend**: Cloudflare Pages (Free, Global CDN)
**Backend**: Your own server or localhost

---

## Part 1: Deploy Backend to Your Server

### Option A: Deploy to Server (192.168.50.50 or any server)

```bash
# SSH into your server
ssh user@192.168.50.50

# Clone the repo
git clone https://github.com/gogs1998/symposium.git
cd symposium

# Copy and configure environment
cp .env.example .env
nano .env  # Add your OPENAI_API_KEY

# Start with Docker
docker-compose up -d

# Check it's running
curl http://localhost:8000/health
```

**Your backend will be at**: `http://192.168.50.50:8000`

### Option B: Keep Backend Local (For Testing)

If you want to test with local backend first, you'll need to expose it:
```bash
# Use ngrok to expose localhost:8000
ngrok http 8000
```

This gives you a public URL like: `https://abc123.ngrok.io`

---

## Part 2: Deploy Frontend to Cloudflare Pages

### Step 1: Go to Cloudflare Dashboard

1. **Login**: https://dash.cloudflare.com/
2. **Click**: "Workers & Pages" in the left sidebar
3. **Click**: "Create application" → "Pages" → "Connect to Git"

### Step 2: Connect GitHub Repository

1. **Authorize Cloudflare** to access your GitHub
2. **Select repository**: `gogs1998/symposium`
3. **Click**: "Begin setup"

### Step 3: Configure Build Settings

```
Project name: symposium-ai
Production branch: main

Build settings:
├── Framework preset: Vite
├── Build command: cd frontend && npm install && npm run build
├── Build output directory: frontend/dist
└── Root directory: (leave empty)
```

### Step 4: Add Environment Variables

**CRITICAL**: Add this environment variable:

```
Variable name: VITE_API_URL
Value: http://192.168.50.50:8000
```

Replace `192.168.50.50:8000` with:
- Your server IP and port, OR
- Your ngrok URL (if using ngrok), OR
- `https://your-backend-domain.com` if you have a domain

### Step 5: Deploy!

1. **Click**: "Save and Deploy"
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://symposium-ai.pages.dev`

---

## Part 3: Custom Domain (Optional)

### Add Your Own Domain

1. In Cloudflare Pages, go to: **Custom domains**
2. **Click**: "Set up a custom domain"
3. **Enter**: `symposium.yourdomain.com`
4. Cloudflare will add DNS records automatically

---

## Part 4: CORS Configuration

Your backend needs to allow requests from Cloudflare Pages:

Edit `docker-compose.yml` on your server:

```yaml
environment:
  - ALLOWED_ORIGINS=https://symposium-ai.pages.dev,http://localhost:3000
```

Or for development, keep it as `*`:
```yaml
environment:
  - ALLOWED_ORIGINS=*
```

Then restart:
```bash
docker-compose restart
```

---

## Part 5: Test Your Deployment

1. **Visit**: `https://symposium-ai.pages.dev`
2. **Select** a historical figure
3. **Send** a test message

If you see an error:
- Check browser console (F12)
- Verify `VITE_API_URL` is correct in Cloudflare Pages settings
- Verify backend is running: `curl http://your-backend-url/health`
- Check CORS settings in backend

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│  User's Browser                         │
│  https://symposium-ai.pages.dev        │
└────────────┬────────────────────────────┘
             │
             │ (HTTPS via Cloudflare CDN)
             ▼
┌─────────────────────────────────────────┐
│  Cloudflare Pages (Frontend)            │
│  - React App                            │
│  - Static Files                         │
│  - Global CDN                           │
└────────────┬────────────────────────────┘
             │
             │ (API Requests)
             ▼
┌─────────────────────────────────────────┐
│  Your Server (Backend)                  │
│  http://192.168.50.50:8000             │
│  - FastAPI                              │
│  - ChromaDB (16 figures)                │
│  - OpenAI API                           │
└─────────────────────────────────────────┘
```

---

## Costs

**Frontend (Cloudflare Pages)**:
- ✅ **FREE** (500 builds/month, unlimited bandwidth)

**Backend (Your Server)**:
- ✅ **FREE** (you already have the server)

**Total**: **$0/month** 🎉

---

## Automatic Deployments

Cloudflare Pages automatically rebuilds when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update frontend"
git push origin main

# Cloudflare automatically deploys in 2-3 minutes!
```

---

## Troubleshooting

### Frontend shows "Cannot connect to backend"

1. **Check VITE_API_URL** in Cloudflare Pages:
   - Go to Settings → Environment variables
   - Verify the URL is correct

2. **Check backend is accessible**:
   ```bash
   curl http://your-backend-url/health
   ```

3. **Check CORS**:
   - Make sure `ALLOWED_ORIGINS` includes your Cloudflare Pages URL

### Backend returns CORS errors

Update `docker-compose.yml`:
```yaml
environment:
  - ALLOWED_ORIGINS=https://symposium-ai.pages.dev
```

Restart:
```bash
docker-compose restart
```

### Need to update environment variables

In Cloudflare Dashboard:
1. Go to Workers & Pages → Your project
2. Settings → Environment variables
3. Update `VITE_API_URL`
4. Click "Redeploy site" (or push a new commit)

---

## Next Steps

Once deployed, you can:

1. **Add more historical figures** by running ingestion scripts
2. **Set up a custom domain** (symposium.yourdomain.com)
3. **Monitor usage** in Cloudflare analytics
4. **Scale backend** if needed (add more server resources)

---

## Security Notes

- ✅ Frontend served over HTTPS (automatic with Cloudflare)
- ⚠️ Backend on HTTP (consider adding SSL with nginx/certbot)
- ✅ API keys stored securely in environment variables
- ✅ CORS properly configured

To add HTTPS to backend, see: `DEPLOY_SERVER.md` (nginx + certbot section)

---

**Need help?** Check the logs:
- Frontend: Cloudflare Dashboard → Deployments → Build logs
- Backend: `docker-compose logs -f backend`
