# 🚀 Deploy Symposium.ai to Render in 5 Minutes

## One-Click Deployment

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/gogs1998/symposium)

## Manual Deployment Steps

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Click "New" → "Blueprint"**

3. **Connect Repository**: `gogs1998/symposium`

4. **Add Environment Variables** (when prompted):
   ```
   OPENAI_API_KEY = your_openai_api_key_here
   ```

5. **Click "Apply"**

6. **Wait 15-20 minutes** for:
   - Initial build
   - Automatic ingestion of all 16 historical figures
   - Service startup

7. **Done!** Your app will be live at:
   - Frontend: `https://symposium-frontend.onrender.com`
   - Backend API: `https://symposium-backend.onrender.com`

## What Gets Deployed

- ✅ **Backend**: FastAPI server with RAG engine
- ✅ **Frontend**: React app with interactive UI
- ✅ **Vector DB**: ChromaDB with 16 historical figures (auto-initialized)
- ✅ **Persistent Storage**: 1GB disk for vector database
- ✅ **SSL**: Automatic HTTPS certificates
- ✅ **CI/CD**: Auto-deploys on git push

## First-Time Setup Notes

- First build takes ~15-20 minutes (ingestion runs automatically)
- Subsequent deploys are faster (~3-5 minutes)
- Free tier services sleep after 15 min inactivity
- Cold start takes 30-60 seconds after sleep

## Need Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.
