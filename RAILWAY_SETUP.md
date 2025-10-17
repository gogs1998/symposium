# 🚂 Railway Deployment Guide

## Step 1: Create Railway Account & Project

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose: `gogs1998/symposium`

## Step 2: Configure Environment Variables

In Railway dashboard → Your project → Variables:

```
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here (optional)
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4-turbo-preview
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_PROVIDER=openai
VECTOR_DB_TYPE=chromadb
CHROMA_PERSIST_DIR=/app/backend/vector_db_data
HOST=0.0.0.0
PORT=${{PORT}}
LOG_LEVEL=info
ALLOWED_ORIGINS=https://symposium-frontend.onrender.com,https://symposium.pages.dev
ENABLE_MULTI_AGENT=true
ENABLE_CONVERSATION_HISTORY=true
ENABLE_CITATIONS=true
```

## Step 3: Deploy!

Railway will automatically:
- Detect nixpacks.toml
- Install Python 3.11
- Install dependencies
- Load pre-populated vector database (10 figures)
- Start uvicorn server

Build time: ~2-3 minutes

## Step 4: Get Your URL

After deployment:
1. Go to Settings → Networking
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://symposium-production.up.railway.app`)

## Step 5: Update Frontend

Update frontend environment variable:
- `VITE_API_URL=https://your-railway-url.up.railway.app`

Redeploy frontend (Render or Cloudflare Pages).

## Cost: ~$7-10/month

Railway provides:
- 1GB RAM (plenty for our app!)
- Persistent storage (vector DB safe)
- No cold starts
- Automatic SSL
- Deploy logs & monitoring

## Your App is Live! 🎉

Backend: `https://your-railway-url.up.railway.app`
Frontend: `https://symposium-frontend.onrender.com` or `https://symposium.pages.dev`

Test at: `https://your-railway-url.up.railway.app/figures`
