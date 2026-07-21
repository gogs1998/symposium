# tests/test_transcripts.py
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.sources.files import Document
from ingestion.transcripts import append_jsonl, chunk_video


def make_doc():
    segments = [
        {"text": "sentence one about stoicism.", "start": 0.0},
        {"text": "sentence two about virtue.", "start": 5.0},
        {"text": "sentence three about death.", "start": 11.0},
    ]
    return Document(item_id="v1", text=" ".join(s["text"] for s in segments),
                    metadata={"source": "My video", "video_id": "v1",
                              "url": "https://youtu.be/v1", "upload_date": "20260101",
                              "duration": 600, "segments": segments})


def test_chunk_video_carries_timestamp_and_scalar_metadata():
    chunks = chunk_video(make_doc(), chunk_size=60, overlap=0)
    assert len(chunks) >= 2
    first = chunks[0]
    assert first.id == "v1:0"
    assert first.metadata["video_id"] == "v1"
    assert first.metadata["start_seconds"] == 0.0
    assert chunks[1].metadata["start_seconds"] >= 5.0
    assert "segments" not in first.metadata          # scalars only for chroma
    assert all(isinstance(v, (str, int, float)) for v in first.metadata.values())


def test_chunks_never_cross_videos_and_respect_size():
    chunks = chunk_video(make_doc(), chunk_size=60, overlap=0)
    assert all(len(c.text) <= 60 for c in chunks)
    assert all(c.metadata["video_id"] == "v1" for c in chunks)


def test_append_jsonl_roundtrip(tmp_path):
    path = tmp_path / "transcripts.jsonl"
    append_jsonl(path, make_doc())
    append_jsonl(path, make_doc())
    lines = [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines()]
    assert len(lines) == 2
    assert lines[0]["video_id"] == "v1"
    assert lines[0]["segments"][2]["start"] == 11.0
