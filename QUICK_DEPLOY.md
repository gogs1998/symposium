# Quick Deploy - Connect Cloudflare to Local Backend

## Option 1: Use ngrok (Testing - 2 minutes)

### Step 1: Install ngrok

**Download ngrok:**
1. Go to: https://ngrok.com/download
2. Download for Windows
3. Extract to a folder (e.g., `C:\ngrok`)
4. Add to PATH or use full path

OR use winget:
```bash
winget install ngrok.ngrok
```

OR use chocolatey:
```bash
choco install ngrok
```

### Step 2: Expose Your Backend

```bash
# Your backend is running on localhost:8000
# Expose it with ngrok:
ngrok http 8000
```

You'll see something like:
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:8000
```

**Copy that HTTPS URL!** (e.g., `https://abc123.ngrok-free.app`)

### Step 3: Update Cloudflare Pages

1. Go to: https://dash.cloudflare.com/
2. Workers & Pages → Your project (symposium-ai)
3. Settings → Environment variables → Production
4. Find `VITE_API_URL` and change it to your ngrok URL:
   ```
   VITE_API_URL=https://abc123.ngrok-free.app
   ```
5. Click "Save"
6. Go to Deployments → Click "Retry deployment" or "Redeploy"

### Step 4: Test!

Visit your Cloudflare Pages URL and test the chat!

---

## Option 2: Deploy to Server (192.168.50.50) - Production

### Step 1: SSH to Server

```bash
ssh user@192.168.50.50
```

### Step 2: Clone and Deploy

```bash
# Clone repository
git clone https://github.com/gogs1998/symposium.git
cd symposium

# Copy environment file
cp .env.example .env

# Edit and add your OpenAI API key
nano .env
# or
vim .env
```

Add this to .env:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Start Backend

```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Wait for "Application startup complete"
# Press Ctrl+C to exit logs
```

### Step 4: Test Backend

```bash
# From the server
curl http://localhost:8000/health

# From your local machine (or any computer on network)
curl http://192.168.50.50:8000/health
```

Should return: `{"status":"healthy",...}`

### Step 5: Update Cloudflare Pages

1. Go to: https://dash.cloudflare.com/
2. Workers & Pages → Your project
3. Settings → Environment variables → Production
4. Update `VITE_API_URL`:
   ```
   VITE_API_URL=http://192.168.50.50:8000
   ```
5. Save and redeploy

### Step 6: Configure Firewall (if needed)

If you can't access from outside the server:

```bash
# Allow port 8000
sudo ufw allow 8000/tcp

# Or if using firewalld
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### Step 7: Add HTTPS (Optional but Recommended)

Install nginx and certbot:

```bash
sudo apt install nginx certbot python3-certbot-nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/symposium
```

Add this config:
```nginx
server {
    listen 80;
    server_name symposium.yourdomain.com;  # or your server IP

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/symposium /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d symposium.yourdomain.com
```

Then use `https://symposium.yourdomain.com` as VITE_API_URL

---

## Current Status Check

### Check Local Backend
```bash
curl http://localhost:8000/health
docker-compose ps
```

### Check Cloudflare Pages
- Visit your Cloudflare URL
- Open browser console (F12)
- Check for API connection errors

### Check CORS
If you see CORS errors, update `docker-compose.yml`:
```yaml
environment:
  - ALLOWED_ORIGINS=https://your-cloudflare-url.pages.dev
```

Then:
```bash
docker-compose restart
```

---

## Troubleshooting

### Backend not accessible from outside
- Check firewall: `sudo ufw status`
- Check Docker: `docker-compose ps`
- Check logs: `docker-compose logs backend`

### Frontend can't connect to backend
- Verify VITE_API_URL in Cloudflare settings
- Check CORS settings in docker-compose.yml
- Test backend URL in browser: `http://your-backend-url/health`

### ngrok session expired
- Free ngrok URLs expire when you close the terminal
- Restart ngrok and update Cloudflare with new URL
- Consider paid ngrok or deploy to server for permanent solution

---

## What's Your Cloudflare Pages URL?

Once you tell me your Cloudflare URL, I can help you test the connection!
