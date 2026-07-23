# tests/test_cli_jsonl.py
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import chromadb
import registry
from db import connect, init_db
from providers.fake import FakeEmbed
from rag.engine import RAGEngine
from ingestion.cli import ingest_jsonl


def _write_jsonl(path, records):
    with path.open("w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")


def _record(vid):
    return {
        "video_id": vid,
        "title": f"Title {vid}",
        "url": f"https://youtu.be/{vid}",
        "upload_date": "20260101",
        "duration": 100,
        "segments": [
            {"text": "sentence one about stoicism and virtue and life.", "start": 0.0},
            {"text": "sentence two about death and courage and fate.", "start": 5.0},
        ],
        "attribution": {"kept": 2, "total": 3},
    }


def _engine(tmp_path):
    return RAGEngine(chroma=chromadb.PersistentClient(path=str(tmp_path / "chroma")),
                     embedder=FakeEmbed(), chat=None, chat_model="m",
                     temperature=0.5, max_tokens=100)


def test_ingest_jsonl_end_to_end(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    registry.create_figure(conn, id="creator1", name="Creator One", type="creator")
    engine = _engine(tmp_path)
    src = tmp_path / "transcripts.host.jsonl"
    _write_jsonl(src, [_record("v1"), _record("v2")])

    stats = ingest_jsonl(conn, engine, "creator1", src)
    assert stats["done"] == 2
    assert engine.chunk_count("creator1") > 0

    # ingestion_log rows namespaced with host: prefix
    rows = conn.execute(
        "SELECT source_item_id FROM ingestion_log WHERE figure_id='creator1'"
    ).fetchall()
    ids = {r["source_item_id"] for r in rows}
    assert ids == {"host:v1", "host:v2"}


def test_ingest_jsonl_replace_clears_prior(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    registry.create_figure(conn, id="creator1", name="Creator One", type="creator")
    engine = _engine(tmp_path)

    first = tmp_path / "a.jsonl"
    _write_jsonl(first, [_record("v1"), _record("v2")])
    ingest_jsonl(conn, engine, "creator1", first)
    count_after_first = engine.chunk_count("creator1")
    assert count_after_first > 0

    # a fresh jsonl with a single new video; replace wipes the collection first
    second = tmp_path / "b.jsonl"
    _write_jsonl(second, [_record("v3")])
    ingest_jsonl(conn, engine, "creator1", second, replace=True)

    per_video = engine.chunk_count("creator1")
    # only v3's chunks survive; strictly fewer than the two-video ingest
    assert 0 < per_video < count_after_first
