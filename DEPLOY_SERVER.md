# Deploy Symposium to Your Own Server

## Quick Start (5 minutes)

### 1. Prerequisites
- Docker and Docker Compose installed on your server
- Your server has port 8000 available (or any port you want)

### 2. Clone and Setup

```bash
# Clone the repo
git clone https://github.com/gogs1998/symposium.git
cd symposium

# Copy environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
nano .env  # or use vim, vi, etc.
```

### 3. Deploy

```bash
# Build and start the container
docker-compose up -d

# Watch logs
docker-compose logs -f backend
```

### 4. Test

Visit: `http://your-server-ip:8000/figures`

You should see 10 historical figures with their source counts.

### 5. Setup Nginx Reverse Proxy (Optional but Recommended)

```nginx
server {
    listen 80;
    server_name symposium.yourdomain.com;

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

Then get SSL certificate:
```bash
sudo certbot --nginx -d symposium.yourdomain.com
```

## Management Commands

```bash
# Stop the service
docker-compose down

# Restart the service
docker-compose restart

# View logs
docker-compose logs -f backend

# Rebuild after code changes
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Environment Variables

All configured in `.env` file. Key ones:

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PORT` - Port to run on (default: 8000)
- `ALLOWED_ORIGINS` - CORS origins (use `*` for development, specific domains for production)

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs backend
```

**Need to rebuild:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Check if it's running:**
```bash
docker-compose ps
curl http://localhost:8000/health
```

## Cost

**$0/month** - You're using your own server!

## Performance

With your server specs (Xeon Gold, 192GB RAM):
- Can handle 100+ concurrent users easily
- No cold starts
- Full control over resources
