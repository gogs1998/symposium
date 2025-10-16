# 🚂 Deploy to Railway in 5 Minutes

## One-Click Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/symposium?referralCode=symposium)

## Manual Deployment (Recommended)

### Step 1: Create Railway Account
- Go to: https://railway.app/
- Sign up with GitHub (easiest)

### Step 2: Deploy Backend

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Click:** "New Project" → "Deploy from GitHub repo"
3. **Select:** `gogs1998/symposium`
4. **Configure:**
   - Service name: `backend`
   - Root directory: `/backend`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables** (Settings → Variables):
   ```
   OPENAI_API_KEY=your_key_here
   PYTHONUNBUFFERED=1
   PORT=8000
   ```

6. **Add Volume** (for persistent vector DB):
   - Settings → Volumes → Add Volume
   - Mount path: `/app/vector_db_data`
   - Size: 1GB

7. **Generate Domain:**
   - Settings → Networking → Generate Domain
   - Copy the URL (e.g., `https://backend-production-abc.up.railway.app`)

### Step 3: Deploy Frontend

1. **In same project, click:** "New Service" → "GitHub Repo"
2. **Select:** `gogs1998/symposium` (same repo)
3. **Configure:**
   - Service name: `frontend`
   - Root directory: `/frontend`
   - Build command: `npm install && npm run build`
   - Start command: `npx serve -s dist -l $PORT`

4. **Add Environment Variables:**
   ```
   VITE_API_URL=https://backend-production-abc.up.railway.app
   ```
   (Use your actual backend URL from Step 2)

5. **Generate Domain:**
   - Settings → Networking → Generate Domain
   - This is your app URL!

### Step 4: Initialize Vector Database

**First time only:**

1. Go to backend service → Deployments
2. Click latest deployment → View Logs
3. Run initialization:
   ```bash
   # In Railway backend shell (Settings → Service → Connect)
   cd /app
   python init_vector_db.py
   ```

This will ingest all 16 figures (takes 10-15 minutes).

### Step 5: Access Your App

Visit your frontend URL: `https://frontend-production-xyz.up.railway.app`

## Automatic Redeployment

Push to GitHub and Railway auto-deploys:
```bash
git push origin main
```

## Free Tier Details

- **$5/month free credit** (plenty for this app)
- **Always on** (no cold starts unlike Render)
- **512 MB RAM** per service
- **1GB disk** for vector DB
- **Unlimited bandwidth**

## Troubleshooting

**Build fails:**
- Check logs in Railway dashboard
- Verify root directory is set correctly

**Frontend can't reach backend:**
- Check VITE_API_URL in frontend env vars
- Verify backend domain is generated
- Check CORS settings

**Vector DB empty:**
- Run `init_vector_db.py` in backend shell
- Check volume is mounted at `/app/vector_db_data`

## Cost Estimate

With Railway's $5 free credit:
- Backend: ~$1-2/month
- Frontend: ~$1-2/month
- Volume (1GB): Included
- **Total: $2-4/month** (covered by free credit!)
