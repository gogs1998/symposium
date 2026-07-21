"""Operator CLI: ingest a corpus for a figure.

Usage:
  venv python ingestion/cli.py files --figure aurelius --source-dir ingestion/sources_data/aurelius
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
sys.path.insert(0, str(Path(__file__).parent.parent))

import chromadb

import registry
from config import settings
from db import connect, init_db
from ingestion.sources.files import FilesSource
from providers.fastembed_local import FastEmbedLocal
from rag.chunker import chunk_text
from rag.engine import Chunk, RAGEngine


def log_item(conn, figure_id: str, item_id: str, status: str, detail: str = "") -> None:
    conn.execute(
        "INSERT INTO ingestion_log (figure_id, source_item_id, status, detail, updated_at) "
        "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) "
        "ON CONFLICT(figure_id, source_item_id) DO UPDATE SET "
        "status = excluded.status, detail = excluded.detail, updated_at = CURRENT_TIMESTAMP",
        (figure_id, item_id, status, detail),
    )
    conn.commit()


def already_done(conn, figure_id: str, item_id: str) -> bool:
    row = conn.execute(
        "SELECT status FROM ingestion_log WHERE figure_id = ? AND source_item_id = ?",
        (figure_id, item_id),
    ).fetchone()
    return row is not None and row["status"] == "done"


def ingest(conn, engine: RAGEngine, figure_id: str, source) -> dict:
    registry.get_figure(conn, figure_id)  # raises FigureNotFound early
    stats = {"done": 0, "skipped": 0, "error": 0}
    for doc in source.documents():
        if already_done(conn, figure_id, doc.item_id):
            stats["skipped"] += 1
            continue
        try:
            texts = chunk_text(doc.text, chunk_size=settings.chunk_size, overlap=settings.chunk_overlap)
            chunks = [
                Chunk(id=f"{doc.item_id}:{i}", text=t, metadata=doc.metadata | {"chunk_index": i})
                for i, t in enumerate(texts)
            ]
            n = engine.ingest_chunks(figure_id, chunks)
            log_item(conn, figure_id, doc.item_id, "done", f"{n} chunks")
            stats["done"] += 1
            print(f"  OK   {doc.item_id}: {n} chunks")
        except Exception as exc:
            log_item(conn, figure_id, doc.item_id, "error", str(exc))
            stats["error"] += 1
            print(f"  FAIL {doc.item_id}: {exc}")
    return stats


def main():
    parser = argparse.ArgumentParser(description="Ingest a corpus for a figure")
    sub = parser.add_subparsers(dest="source_type", required=True)
    p_files = sub.add_parser("files", help="Ingest local files")
    p_files.add_argument("--figure", required=True)
    p_files.add_argument("--source-dir", required=True)
    args = parser.parse_args()

    conn = connect(settings.db_path)
    init_db(conn)
    engine = RAGEngine(
        chroma=chromadb.PersistentClient(path=settings.chroma_dir),
        embedder=FastEmbedLocal(model_name=settings.embedding_model),
        chat=None,  # not needed for ingestion
        chat_model=settings.chat_model, temperature=settings.temperature, max_tokens=settings.max_tokens,
    )
    stats = ingest(conn, engine, args.figure, FilesSource(args.source_dir))
    print(f"\nSummary: {stats['done']} done, {stats['skipped']} skipped, {stats['error']} errors")
    print(f"Total chunks for {args.figure}: {engine.chunk_count(args.figure)}")
    sys.exit(1 if stats["error"] and not stats["done"] else 0)


if __name__ == "__main__":
    main()
