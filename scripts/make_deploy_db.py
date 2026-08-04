"""Produce deploy/symposium.db — a sanitized copy of the registry for the public
repo + cloud image. Keeps the figures table (ids, names, personas, categories,
status); drops all conversation history and the ingestion log. Nothing private
about users ever reaches git or the cloud image; chat history starts fresh there.
"""
import shutil
import sqlite3
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"C:\SymposiumData\symposium.db")
out = BASE / "deploy" / "symposium.db"
out.parent.mkdir(parents=True, exist_ok=True)

shutil.copyfile(src, out)
conn = sqlite3.connect(out)
existing = {r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
for table in ("messages", "conversations", "sessions", "ingestion_log"):
    if table in existing:
        conn.execute(f"DELETE FROM {table}")
conn.commit()
conn.execute("VACUUM")
conn.commit()
figs = conn.execute("SELECT COUNT(*) FROM figures").fetchone()[0]
pub = conn.execute("SELECT COUNT(*) FROM figures WHERE status='published'").fetchone()[0]
conn.close()
print(f"wrote {out} — {figs} figures ({pub} published), conversation history stripped, "
      f"{out.stat().st_size // 1024} KB")
