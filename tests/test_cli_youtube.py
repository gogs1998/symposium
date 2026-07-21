# tests/test_cli_youtube.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import chromadb
import registry
from db import connect, init_db
from providers.fake import FakeEmbed
from rag.engine import RAGEngine
from ingestion.cli import ingest_youtube
from ingestion.sources.youtube import YouTubeSource
from tests.test_youtube_source import FakeLister, FakeTranscripts, VIDEOS, TRANSCRIPTS


def test_ingest_youtube_end_to_end(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    registry.create_figure(conn, id="creator1", name="Creator One", type="creator")
    engine = RAGEngine(chroma=chromadb.PersistentClient(path=str(tmp_path / "chroma")),
                       embedder=FakeEmbed(), chat=None, chat_model="m",
                       temperature=0.5, max_tokens=100)
    source = YouTubeSource("https://youtube.com/@creator", lister=FakeLister(VIDEOS),
                          transcripts=FakeTranscripts(TRANSCRIPTS))
    stats = ingest_youtube(conn, engine, "creator1", source, jsonl_path=tmp_path / "transcripts.jsonl")
    assert stats["done"] == 1          # v1 only
    assert stats["skipped"] >= 2       # v2 multi-speaker, v3 captionless
    assert engine.chunk_count("creator1") >= 1
    assert (tmp_path / "transcripts.jsonl").exists()
    # skips recorded in ingestion_log with reasons
    row = conn.execute("SELECT status, detail FROM ingestion_log WHERE figure_id='creator1' AND source_item_id='v2'").fetchone()
    assert row["status"] == "skipped"
    assert "multi-speaker" in row["detail"]
    # resumable: second run skips the done video
    stats2 = ingest_youtube(conn, engine, "creator1", source, jsonl_path=tmp_path / "transcripts.jsonl")
    assert stats2["done"] == 0
