"""Transcript persistence (JSONL, one video per line — the future fine-tuning
dataset) and transcript-aware chunking that attaches start timestamps."""
import json
from pathlib import Path

from ingestion.sources.files import Document
from rag.engine import Chunk


def append_jsonl(path, doc: Document) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "video_id": doc.metadata["video_id"],
        "title": doc.metadata["source"],
        "url": doc.metadata["url"],
        "upload_date": doc.metadata.get("upload_date", ""),
        "duration": doc.metadata.get("duration", 0),
        "segments": doc.metadata["segments"],
    }
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def chunk_video(doc: Document, *, chunk_size: int, overlap: int) -> list[Chunk]:
    """Pack segments greedily into chunks <= chunk_size, never crossing the
    video boundary. Each chunk's start_seconds = start of its first segment.
    (Overlap is intentionally ignored: segment boundaries are natural seams
    and timestamps must map 1:1 to where the text actually begins.)"""
    chunks: list[Chunk] = []
    buf: list[str] = []
    buf_start = None
    base_meta = {k: v for k, v in doc.metadata.items() if k != "segments"}

    def flush():
        nonlocal buf, buf_start
        if buf:
            chunks.append(Chunk(
                id=f"{doc.item_id}:{len(chunks)}",
                text=" ".join(buf),
                metadata=base_meta | {"start_seconds": float(buf_start),
                                      "chunk_index": len(chunks)},
            ))
        buf, buf_start = [], None

    for segment in doc.metadata["segments"]:
        text = segment["text"]
        candidate_len = len(" ".join(buf)) + (1 if buf else 0) + len(text)
        if buf and candidate_len > chunk_size:
            flush()
        if buf_start is None:
            buf_start = segment["start"]
        buf.append(text)
    flush()
    return chunks
