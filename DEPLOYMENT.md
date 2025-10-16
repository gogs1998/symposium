# Deployment Guide for Symposium.ai

## Deploy to Render.com

### Prerequisites
- Render.com account (free tier works!)
- OpenAI API key

### Automatic Deployment (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Create New Blueprint**:
   - Click "New" → "Blueprint"
   - Connect your GitHub account if not already connected
   - Select the repository: `gogs1998/symposium`
   - Render will automatically detect the `render.yaml` file

3. **Set Environment Variables**:
   Render will prompt you to set these:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Optional (if using other providers):
   ```
   ANTHROPIC_API_KEY=your_anthropic_key (optional)
   OPENROUTER_API_KEY=your_openrouter_key (optional)
   ```

4. **Deploy**:
   - Click "Apply" to create both services
   - Render will:
     - Create the backend service with persistent disk for vector DB
     - Create the frontend static site
     - Automatically deploy both

5. **Wait for Build** (5-10 minutes):
   - Backend: Installing Python dependencies and starting FastAPI
   - Frontend: Building React app

6. **Access Your App**:
   - Frontend URL: `https://symposium-frontend.onrender.com`
   - Backend API: `https://symposium-backend.onrender.com`

### Manual Deployment (Alternative)

If automatic deployment doesn't work:

#### Backend Service:
1. New Web Service
2. Connect repository
3. Settings:
   - **Name**: symposium-backend
   - **Environment**: Python 3
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

4. Add Disk:
   - **Name**: vector-db
   - **Mount Path**: `/opt/render/project/src/vector_db_data`
   - **Size**: 1GB

5. Environment Variables (see above)

#### Frontend Service:
1. New Static Site
2. Connect repository
3. Settings:
   - **Name**: symposium-frontend
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variable**:
     - `VITE_API_URL` = `https://symposium-backend.onrender.com`

### Post-Deployment

1. **Initial Data Load**:
   The vector database is already included in the repository (if you've run ingestion locally).
   The ChromaDB data in `vector_db_data/` will be used.

2. **If Starting Fresh** (no vector data):
   You'll need to run ingestion scripts once:
   ```bash
   # Connect to your backend service shell (Render dashboard)
   cd ingestion
   python ingest_figure.py --figure churchill --source-dir sources/churchill
   # Repeat for each figure...
   ```

3. **Test the Deployment**:
   - Visit your frontend URL
   - Select a historical figure
   - Try asking a question
   - Check that sources load correctly

### Troubleshooting

**Backend won't start**:
- Check logs in Render dashboard
- Verify OPENAI_API_KEY is set
- Ensure PORT environment variable is not overridden

**Frontend can't connect to backend**:
- Check CORS settings in backend (ALLOWED_ORIGINS)
- Verify VITE_API_URL points to correct backend URL
- Check backend is running (visit backend URL directly)

**Vector DB data missing**:
- Check disk mount path is correct
- Verify disk is attached to service
- May need to re-run ingestion

### Updating After Deployment

Render auto-deploys on git push:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both services will automatically redeploy!

### Cost

**Free Tier Limits**:
- Backend: Spins down after 15 minutes of inactivity (30-60 second cold start)
- Frontend: Always online, CDN served
- Disk: 1GB persistent storage (included)
- Build minutes: 500/month (plenty for this project)

**To upgrade** (for always-on backend):
- Backend: $7/month for Starter plan
- Disk: $0.25/GB/month for more storage

### Notes

- Vector database persists across deploys (stored on disk)
- Environment variables are encrypted by Render
- SSL certificates are automatic and free
- Free tier services sleep after 15 min inactivity
- First request after sleep takes ~30-60 seconds (cold start)
