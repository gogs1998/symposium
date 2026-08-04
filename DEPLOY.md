# Deploying Symposium to the cloud

Goal: run the site off proper cloud infrastructure (always-on, redeploys from git)
instead of a local machine + tunnel. **Backend → Render**, **Frontend → Vercel**,
DNS on Cloudflare (already there).

The 348 MB vector store is **not** in git. The backend image rebuilds it at Docker
**build time** from the git-tracked transcripts + the committed 1.6 MB registry DB
(`deploy/symposium.db`, chat history stripped), then bakes it into the image and
copies it to a persistent disk on first boot. So `git push` → Render rebuilds →
everything's reconstructed; nothing large ever lives in git.

## 1. Backend on Render

1. Render dashboard → **New → Blueprint** → connect the GitHub repo `gogs1998/symposium`
   (branch `v2-rebuild`). Render reads `render.yaml`.
2. It creates the `symposium-api` web service (Docker, Starter plan, 1 GB disk at
   `/data`). Approve it.
3. Set the one secret in the service's **Environment**:
   `OPENROUTER_API_KEY = <your key>`  (the same one in the local `.env`).
4. Deploy. The **first build runs the seed** (embeds ~10k chunks locally in the
   image) — allow ~15-20 min. Later deploys reuse the cached seed layer unless
   backend/ingestion/scripts changed.
5. When live, note the URL, e.g. `https://symposium-api.onrender.com`. Check
   `https://symposium-api.onrender.com/figures` returns 48 figures.

> If the build ever times out on the seed step, the fallback is to ship the
> prebuilt store via Git LFS instead — ask and I'll switch the Dockerfile.

## 2. Frontend on Vercel

1. Vercel → **Add New → Project** → import `gogs1998/symposium`.
2. **Root Directory: `frontend`** (important — it's a monorepo). Framework preset:
   Vite (auto-detected). `frontend/vercel.json` handles SPA routing.
3. Add an **Environment Variable** (all environments):
   `VITE_API_URL = https://symposium-api.onrender.com`  (your Render URL from step 1).
   This is build-time — the app calls the backend directly (SSE streaming stays clean).
4. Deploy. You'll get a `*.vercel.app` URL — open it and confirm the roster loads
   and a chat works.

> CORS: the backend allows `https://thesymposium.app` (via `ALLOWED_ORIGINS` in
> render.yaml). To test from the temporary `*.vercel.app` URL before DNS cutover,
> add that exact origin to `ALLOWED_ORIGINS` in Render (comma-separated), or just
> validate on the final domain in step 3.

## 3. Point thesymposium.app at Vercel

1. In the Vercel project → **Settings → Domains → add `thesymposium.app`**.
   Vercel shows the DNS target (a CNAME/A record).
2. In **Cloudflare** (the domain's DNS): replace the current `thesymposium.app`
   record (the one pointing at the tunnel) with Vercel's target. Keep it proxied
   or DNS-only per Vercel's instruction.
3. Once it resolves, `https://thesymposium.app` serves the Vercel frontend, which
   talks to the Render backend. **Then the local machine, tunnel, and Startup task
   are no longer needed** — stop them (`scripts/stop_server.ps1`, kill cloudflared,
   delete the SymposiumStack task).

## Updating later
- Change code → `git push` → Render + Vercel auto-redeploy.
- Change the roster/personas → re-run `scripts/make_deploy_db.py` to refresh
  `deploy/symposium.db`, commit, push (Render rebuilds the seed).
