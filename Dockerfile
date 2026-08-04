# Symposium backend — cloud image for Render (or any Docker host).
# The 348 MB vector store is NOT committed. It's rebuilt from the git-tracked
# transcripts + the committed 1.6 MB registry DB at BUILD TIME (single process,
# so no concurrent-access risk), baked into the image, and copied onto the
# persistent disk on first boot. Boot is therefore instant; no runtime embedding.
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY deploy/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Bake the embedding model so neither build-seed nor boot needs a model download.
ENV HF_HOME=/app/.hfcache
RUN python -c "from fastembed import TextEmbedding; TextEmbedding('BAAI/bge-small-en-v1.5')"

COPY backend ./backend
COPY ingestion ./ingestion
COPY scripts ./scripts
COPY deploy ./deploy

# Build-time seed: reconstruct the vector store into /app/seeddata (baked layer).
# Uses local embeddings only — no API key needed at build.
RUN mkdir -p /app/seeddata \
    && cp deploy/symposium.db /app/seeddata/symposium.db \
    && CHROMA_DIR=/app/seeddata/chroma DB_PATH=/app/seeddata/symposium.db \
       python scripts/seed_from_git.py

# Runtime config (Render mounts a persistent disk at /data); hardened for public.
ENV CHROMA_DIR=/data/chroma \
    DB_PATH=/data/symposium.db \
    PUBLIC_MODE=1 \
    RATE_LIMIT_PER_MIN=30 \
    ALLOWED_ORIGINS=https://thesymposium.app

CMD ["bash", "deploy/entrypoint.sh"]
