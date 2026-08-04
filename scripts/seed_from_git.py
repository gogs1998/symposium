"""Rebuild the entire chroma vector store from git-tracked sources + the committed
SQLite DB. The DB (1.6 MB) carries the figures, personas, categories and status;
this script re-embeds each published figure's corpus from the transcripts/files
that live in git, so the 348 MB vector store never has to be committed or uploaded.

Idempotent: a figure whose collection already has chunks is skipped. Safe to run
at cloud boot — seeds only what's missing.

  venv python scripts/seed_from_git.py            # seed into the configured store
  CHROMA_DIR=/tmp/x venv python scripts/seed_from_git.py   # seed elsewhere to verify
"""
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE / "backend"))
sys.path.insert(0, str(BASE))

import chromadb

import registry
from config import settings
from db import connect
from ingestion.cli import ingest, ingest_jsonl
from ingestion.sources.files import Document, FilesSource
from providers.fastembed_local import FastEmbedLocal
from rag.engine import RAGEngine

SD = BASE / "ingestion" / "sources_data"


def corpus_files(directory):
    """FilesSource over `directory`, skipping anything under a persona/ folder."""
    src = FilesSource(directory)

    def filtered():
        for path in sorted(Path(directory).rglob("*")):
            if "persona" in path.parts:
                continue
            if not (path.is_file() and path.suffix.lower() in FilesSource.EXTENSIONS):
                continue
            text = FilesSource._read(path)
            if text.strip():
                yield Document(item_id=path.name, text=text,
                               metadata={"source": path.name, "file_type": path.suffix.lower()})
    src.documents = filtered
    return src


def sources_for(fid: str):
    """Ordered (kind, path) list reproducing a figure's published corpus."""
    cdir = SD / "creators" / fid
    host, raw, written = cdir / "transcripts.host.jsonl", cdir / "transcripts.jsonl", cdir / "written"
    hist = SD / fid
    if fid == "ramsay":
        return [("jsonl", raw), ("jsonl", host)]
    out = []
    if host.exists():
        out.append(("jsonl", host))
    elif raw.exists():
        out.append(("jsonl", raw))
    if written.exists():
        out.append(("files", written))
    if not out and hist.exists():
        out.append(("files", hist))
    return out


def main():
    conn = connect(settings.db_path)
    engine = RAGEngine(
        chroma=chromadb.PersistentClient(path=settings.chroma_dir),
        embedder=FastEmbedLocal(model_name=settings.embedding_model),
        chat=None, chat_model=settings.chat_model,
        temperature=settings.temperature, max_tokens=settings.max_tokens,
    )
    figs = registry.list_figures(conn, published_only=True)
    print(f"seeding {len(figs)} figures into {settings.chroma_dir}", flush=True)
    seeded = skipped = empty = 0
    for f in figs:
        fid = f["id"]
        if engine.chunk_count(fid) > 0:
            skipped += 1
            continue
        srcs = sources_for(fid)
        if not srcs:
            print(f"  !! {fid}: NO git source — cannot seed", flush=True)
            empty += 1
            continue
        conn.execute("DELETE FROM ingestion_log WHERE figure_id = ?", (fid,))
        conn.commit()
        for kind, path in srcs:
            if kind == "jsonl":
                ingest_jsonl(conn, engine, fid, str(path))
            else:
                ingest(conn, engine, fid, corpus_files(path))
        n = engine.chunk_count(fid)
        print(f"  OK {fid}: {n} chunks", flush=True)
        seeded += 1
    print(f"\nseeded {seeded}, already-present {skipped}, no-source {empty}", flush=True)
    sys.exit(1 if empty else 0)


if __name__ == "__main__":
    main()
