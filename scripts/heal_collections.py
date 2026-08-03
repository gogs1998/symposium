"""Detect and heal collections whose HNSW segment dir went missing on disk
("Nothing found on disk"). Probes every published figure by trying a retrieval;
rebuilds the broken ones from their source corpus; then a vacuum forces a full
on-disk compaction so the segments actually persist across restarts.

Run with the server STOPPED (needs exclusive chroma access).
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
    """Ordered (kind, path) list reproducing the figure's published corpus."""
    cdir = SD / "creators" / fid
    host = cdir / "transcripts.host.jsonl"
    raw = cdir / "transcripts.jsonl"
    written = cdir / "written"
    hist = SD / fid

    if fid == "ramsay":                       # savage (raw) + reflective (host)
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
    broken = []
    for f in figs:
        try:
            engine.retrieve(f["id"], "test", 1)
        except Exception as exc:
            if "Nothing found on disk" in str(exc) or "hnsw" in str(exc).lower():
                broken.append(f["id"])
            else:
                print(f"  ?? {f['id']}: unexpected error {exc}")
    print(f"broken: {broken or 'none'}\n")

    for fid in broken:
        srcs = sources_for(fid)
        if not srcs:
            print(f"== {fid}: NO SOURCE FOUND — skipping (manual attention)")
            continue
        print(f"== {fid}: rebuilding from {[str(p.name) for _, p in srcs]}")
        try:
            engine.chroma.delete_collection(name=f"figure_{fid}")
        except Exception:
            pass
        conn.execute("DELETE FROM ingestion_log WHERE figure_id = ?", (fid,))
        conn.commit()
        for kind, path in srcs:
            if kind == "jsonl":
                ingest_jsonl(conn, engine, fid, str(path))
            else:
                ingest(conn, engine, fid, corpus_files(path))
        print(f"   {fid}: {engine.chunk_count(fid)} chunks")

    print("\nHealed" if broken else "\nNothing to heal")


if __name__ == "__main__":
    main()
