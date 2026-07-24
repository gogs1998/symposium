"""Operator CLI: ingest a corpus for a figure.

Usage:
  venv python ingestion/cli.py files --figure aurelius --source-dir ingestion/sources_data/aurelius
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
sys.path.insert(0, str(Path(__file__).parent.parent))

import chromadb

import registry
from config import settings
from db import connect, init_db
from ingestion.sources.files import Document, FilesSource
from ingestion.sources.youtube import ExplicitVideosLister, YouTubeSource
from ingestion.transcripts import append_jsonl, chunk_video
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


def ingest_youtube(conn, engine: RAGEngine, figure_id: str, source, *, jsonl_path) -> dict:
    registry.get_figure(conn, figure_id)
    stats = {"done": 0, "skipped": 0, "error": 0}
    for doc in source.documents():
        if already_done(conn, figure_id, doc.item_id):
            stats["skipped"] += 1
            continue
        try:
            chunks = chunk_video(doc, chunk_size=settings.chunk_size, overlap=settings.chunk_overlap)
            n = engine.ingest_chunks(figure_id, chunks)
            append_jsonl(jsonl_path, doc)
            log_item(conn, figure_id, doc.item_id, "done", f"{n} chunks")
            stats["done"] += 1
            print(f"  OK   {doc.item_id} {doc.metadata['source'][:50]!r}: {n} chunks")
        except Exception as exc:
            log_item(conn, figure_id, doc.item_id, "error", str(exc))
            stats["error"] += 1
            print(f"  FAIL {doc.item_id}: {exc}")
    for vid, reason in source.skipped:
        log_item(conn, figure_id, vid, "skipped", reason)
        stats["skipped"] += 1
        print(f"  SKIP {vid}: {reason}")
    return stats


def ingest_jsonl(conn, engine: RAGEngine, figure_id: str, path, *, replace: bool = False) -> dict:
    """Ingest a transcripts JSONL (typically host-attributed) into the figure's
    collection. Item ids are namespaced `host:<video_id>` so re-ingesting after
    attribution is not skipped by the earlier YouTube ingest log.

    `replace=True` deletes the figure's chroma collection first (guarded), so a
    re-ingest reflects only the new records rather than accumulating old chunks.
    """
    registry.get_figure(conn, figure_id)  # raises FigureNotFound early
    if replace:
        try:
            engine.chroma.delete_collection(name=f"figure_{figure_id}")
        except Exception as exc:
            print(f"  (no existing collection to replace: {exc})")

    stats = {"done": 0, "skipped": 0, "error": 0}
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        record = json.loads(line)
        video_id = record["video_id"]
        item_id = f"host:{video_id}"
        if already_done(conn, figure_id, item_id):
            stats["skipped"] += 1
            continue
        try:
            doc = Document(
                item_id=item_id,
                text=" ".join(s["text"] for s in record["segments"]),
                metadata={
                    "source": record["title"],
                    "video_id": video_id,
                    "url": record.get("url", ""),
                    "upload_date": record.get("upload_date", ""),
                    "duration": record.get("duration", 0),
                    "segments": record["segments"],
                },
            )
            chunks = chunk_video(doc, chunk_size=settings.chunk_size, overlap=settings.chunk_overlap)
            n = engine.ingest_chunks(figure_id, chunks)
            log_item(conn, figure_id, item_id, "done", f"{n} chunks")
            stats["done"] += 1
            print(f"  OK   {item_id} {record['title'][:50]!r}: {n} chunks")
        except Exception as exc:
            log_item(conn, figure_id, item_id, "error", str(exc))
            stats["error"] += 1
            print(f"  FAIL {item_id}: {exc}")
    return stats


def main():
    parser = argparse.ArgumentParser(description="Ingest a corpus for a figure")
    sub = parser.add_subparsers(dest="source_type", required=True)
    p_files = sub.add_parser("files", help="Ingest local files")
    p_files.add_argument("--figure", required=True)
    p_files.add_argument("--source-dir", required=True)
    p_yt = sub.add_parser("youtube", help="Ingest a YouTube channel's captions")
    p_yt.add_argument("--figure", required=True)
    p_yt.add_argument("--channel", required=True, help="Channel URL or @handle URL")
    p_yt.add_argument("--max-videos", type=int, default=100)
    p_yt.add_argument("--min-duration", type=int, default=120)
    p_yt.add_argument("--include", default="", help="Comma-separated video IDs to force-include")
    p_yt.add_argument("--exclude", default="", help="Comma-separated video IDs to exclude")
    p_yt.add_argument("--sleep", type=float, default=4.0,
                      help="Seconds between caption fetches (avoid YouTube rate limits)")
    p_yt.add_argument("--cookies-from-browser", default=None, dest="cookies_browser",
                      help="Browser to read YouTube cookies from (chrome/edge/firefox) â€” defeats bot checks")
    p_yt.add_argument("--video-ids", default="", dest="video_ids",
                      help="Comma-separated explicit video IDs (bypasses channel listing "
                           "and multi-speaker skip; for guest appearances / archival clips)")
    p_jsonl = sub.add_parser("jsonl", help="Ingest a transcripts JSONL (e.g. host-attributed)")
    p_jsonl.add_argument("--figure", required=True)
    p_jsonl.add_argument("--path", required=True, help="Path to the transcripts JSONL")
    p_jsonl.add_argument("--replace", action="store_true",
                         help="Delete the figure's chroma collection before ingesting")
    args = parser.parse_args()

    conn = connect(settings.db_path)
    init_db(conn)
    engine = RAGEngine(
        chroma=chromadb.PersistentClient(path=settings.chroma_dir),
        embedder=FastEmbedLocal(model_name=settings.embedding_model),
        chat=None,  # not needed for ingestion
        chat_model=settings.chat_model, temperature=settings.temperature, max_tokens=settings.max_tokens,
    )
    if args.source_type == "files":
        stats = ingest(conn, engine, args.figure, FilesSource(args.source_dir))
    elif args.source_type == "jsonl":
        stats = ingest_jsonl(conn, engine, args.figure, args.path, replace=args.replace)
    else:
        explicit_ids = [s for s in args.video_ids.split(",") if s]
        lister = ExplicitVideosLister(explicit_ids, browser=args.cookies_browser) if explicit_ids else None
        source = YouTubeSource(
            args.channel, max_videos=args.max_videos, min_duration=args.min_duration,
            lister=lister,
            include_ids={s for s in args.include.split(",") if s} | set(explicit_ids),
            exclude_ids={s for s in args.exclude.split(",") if s},
            sleep_between=args.sleep, cookies_browser=args.cookies_browser,
        )
        jsonl = Path("ingestion/sources_data/creators") / args.figure / "transcripts.jsonl"
        stats = ingest_youtube(conn, engine, args.figure, source, jsonl_path=jsonl)
    print(f"\nSummary: {stats['done']} done, {stats['skipped']} skipped, {stats['error']} errors")
    print(f"Total chunks for {args.figure}: {engine.chunk_count(args.figure)}")
    sys.exit(1 if stats["error"] and not stats["done"] else 0)


if __name__ == "__main__":
    main()
