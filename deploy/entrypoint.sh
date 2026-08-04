#!/usr/bin/env bash
# Cloud boot. The vector store was seeded into the image at build time, so first
# boot just installs it onto the persistent disk; later boots find it already
# there. No embedding or seeding happens at runtime — the port binds immediately.
set -e
mkdir -p /data

if [ ! -f /data/symposium.db ]; then
  echo "[entrypoint] first boot — installing baked registry + vector store onto /data"
  cp /app/seeddata/symposium.db /data/symposium.db
  cp -r /app/seeddata/chroma /data/chroma
fi

echo "[entrypoint] starting API"
cd /app/backend
exec python main.py
