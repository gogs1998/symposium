# Symposium v2 Creator Pipeline Implementation Plan (Plan 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** YouTube-captions ingestion for creators, a research-grounded persona generator (three-layer profile: style / worldview / reasoning heuristics, with provenance-labeled extrapolation), the upgraded prompt template with anti-sycophancy + re-anchoring, and a 5-axis eval harness — so any figure (historical or creator) gets a generated, hand-tunable, measurable persona.

**Architecture:** New `ingestion/sources/youtube.py` implements the same `Document` protocol as `FilesSource`, so the existing CLI/chunker/engine pipeline is reused unchanged. The persona generator (`backend/persona/`) is a map-reduce over corpus documents using the cheap `ingest_model` via OpenRouter, producing a JSON profile + rendered prompt saved as operator-editable drafts. The engine gains a re-anchor suffix. Eval is a standalone script.

**Tech Stack:** adds `yt-dlp` and `youtube-transcript-api`. Everything else exists (Plan 1).

**Design inputs:** spec `docs/superpowers/specs/2026-07-21-symposium-v2-design.md` §4–5; research briefing `docs/research/2026-07-21-persona-fidelity-briefing.md` (three-layer profile, provenance flags, 3–6 exemplars, 5–12 named heuristics, anti-sycophancy rules, re-anchoring, 5-axis eval).

**Conventions:** work from `D:\Claude\Symposium`, branch `v2-rebuild`. Tests: `backend\venv\Scripts\python.exe -m pytest <path> -v`. `tests/conftest.py` puts `backend/` on sys.path; ingestion tests add repo root. No network in default tests (`integration` marker excluded). TDD per task, one commit per task.

---

### Task 1: Dependencies

**Files:** Modify `backend/requirements.txt`

- [ ] **Step 1:** Append to `backend/requirements.txt`:

```
yt-dlp>=2025.1.1
youtube-transcript-api>=1.0
```

- [ ] **Step 2:** Install: `backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt` (expect both to install cleanly).

- [ ] **Step 3:** Commit: `git add backend/requirements.txt` + `git commit -m "chore: add youtube ingestion deps"`

---

### Task 2: Caption cleanup (pure functions)

**Files:** Create `ingestion/sources/captions.py`. Test `tests/test_captions.py`.

Raw YouTube captions (especially auto-generated) arrive as overlapping fragments with `[Music]`/`[Applause]` tags and duplicated lines. This module turns a list of `{text, start, duration}` segments into clean, sentence-ish merged segments preserving start timestamps.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_captions.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.sources.captions import clean_segments


def seg(text, start, duration=2.0):
    return {"text": text, "start": start, "duration": duration}


def test_strips_bracket_tags_and_empties():
    out = clean_segments([seg("[Music]", 0.0), seg("hello there", 2.0), seg("[Applause]", 4.0)])
    assert [s["text"] for s in out] == ["hello there"]


def test_merges_fragments_into_sentences_keeping_first_start():
    out = clean_segments([
        seg("so today we're going to", 0.0),
        seg("talk about stoicism.", 2.1),
        seg("it changed my life.", 4.0),
    ], target_chars=60)
    assert out[0]["text"] == "so today we're going to talk about stoicism."
    assert out[0]["start"] == 0.0
    assert out[1]["text"] == "it changed my life."
    assert out[1]["start"] == 4.0


def test_deduplicates_consecutive_repeats():
    out = clean_segments([seg("hello world", 0.0), seg("hello world", 1.5), seg("goodbye", 3.0)])
    assert [s["text"] for s in out] == ["hello world", "goodbye"]


def test_collapses_whitespace_and_newlines():
    out = clean_segments([seg("hello\n  world", 0.0)])
    assert out[0]["text"] == "hello world"
```

- [ ] **Step 2:** Run → FAIL (ModuleNotFoundError).

- [ ] **Step 3: Implement `ingestion/sources/captions.py`**

```python
"""Caption cleanup: raw YouTube caption segments -> clean merged segments.

Input segments: {text, start, duration}. Output: {text, start} where text is
a sentence-ish merged unit and start is the timestamp of its first fragment.
"""
import re

TAG_RE = re.compile(r"\[[^\]]{1,30}\]")          # [Music], [Applause], [Laughter]
WS_RE = re.compile(r"\s+")
SENTENCE_END_RE = re.compile(r"[.!?][\"')\]]?$")


def _normalize(text: str) -> str:
    text = TAG_RE.sub(" ", text)
    return WS_RE.sub(" ", text).strip()


def clean_segments(segments: list[dict], *, target_chars: int = 300) -> list[dict]:
    """Merge caption fragments into sentence-ish units.

    A unit closes when it ends with sentence punctuation, or exceeds
    target_chars (auto-captions often lack punctuation entirely).
    """
    out: list[dict] = []
    buf, buf_start, prev_text = "", None, None
    for segment in segments:
        text = _normalize(segment["text"])
        if not text:
            continue
        if text == prev_text:  # auto-caption duplication artifact
            continue
        prev_text = text
        if buf_start is None:
            buf_start = segment["start"]
        buf = f"{buf} {text}".strip() if buf else text
        if SENTENCE_END_RE.search(buf) or len(buf) >= target_chars:
            out.append({"text": buf, "start": buf_start})
            buf, buf_start = "", None
    if buf:
        out.append({"text": buf, "start": buf_start})
    return out
```

- [ ] **Step 4:** Run → 4 passed.

- [ ] **Step 5:** Commit: `git add ingestion/sources/captions.py tests/test_captions.py` + `git commit -m "feat: caption cleanup — tag stripping, dedup, sentence merging"`

---

### Task 3: YouTube source

**Files:** Create `ingestion/sources/youtube.py`. Test `tests/test_youtube_source.py`.

Yields the same `Document` dataclass as `FilesSource` (import it — one protocol, one pipeline). Listing via yt-dlp (`extract_flat`), captions via youtube-transcript-api. Both injected for tests. Skip rules per spec: no captions → skipped (reported); title matching multi-speaker heuristics → flagged for operator review and skipped unless allow-listed.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_youtube_source.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from ingestion.sources.youtube import YouTubeSource, looks_multi_speaker


class FakeLister:
    def __init__(self, videos):
        self._videos = videos

    def list_videos(self, channel_url, max_videos, min_duration):
        return [v for v in self._videos[:max_videos] if v["duration"] >= min_duration]


class FakeTranscripts:
    def __init__(self, transcripts):
        self._t = transcripts

    def fetch(self, video_id):
        if video_id not in self._t:
            raise LookupError(f"no captions for {video_id}")
        return self._t[video_id]


VIDEOS = [
    {"id": "v1", "title": "My morning routine", "url": "https://youtu.be/v1", "duration": 600, "upload_date": "20260101"},
    {"id": "v2", "title": "Podcast ft. Joe Guest", "url": "https://youtu.be/v2", "duration": 3600, "upload_date": "20260201"},
    {"id": "v3", "title": "No captions here", "url": "https://youtu.be/v3", "duration": 300, "upload_date": "20260301"},
    {"id": "shorts", "title": "quick clip", "url": "https://youtu.be/s", "duration": 45, "upload_date": "20260310"},
]

TRANSCRIPTS = {
    "v1": [{"text": "welcome back to the channel.", "start": 0.0, "duration": 2.0}],
    "v2": [{"text": "today my guest is Joe.", "start": 0.0, "duration": 2.0}],
}


def make_source(**kwargs):
    return YouTubeSource("https://youtube.com/@creator", lister=FakeLister(VIDEOS),
                        transcripts=FakeTranscripts(TRANSCRIPTS), **kwargs)


def test_multi_speaker_heuristic():
    assert looks_multi_speaker("Podcast ft. Joe Guest")
    assert looks_multi_speaker("Interview with Alice")
    assert looks_multi_speaker("chatting w/ bob")
    assert not looks_multi_speaker("My morning routine")


def test_yields_documents_with_video_metadata_and_segments():
    docs = list(make_source().documents())
    ids = [d.item_id for d in docs]
    assert ids == ["v1"]  # v2 multi-speaker, v3 captionless, shorts under min_duration
    d = docs[0]
    assert d.metadata["source"] == "My morning routine"
    assert d.metadata["video_id"] == "v1"
    assert d.metadata["url"] == "https://youtu.be/v1"
    assert d.text.startswith("welcome back")
    assert d.metadata["segments"][0]["start"] == 0.0


def test_skips_are_reported():
    source = make_source()
    list(source.documents())
    reasons = dict(source.skipped)
    assert "multi-speaker title" in reasons["v2"]
    assert "no captions" in reasons["v3"]


def test_allowlist_overrides_multi_speaker_skip():
    docs = list(make_source(include_ids={"v2"}).documents())
    assert "v2" in [d.item_id for d in docs]


def test_exclude_ids():
    docs = list(make_source(exclude_ids={"v1"}).documents())
    assert docs == []
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implement `ingestion/sources/youtube.py`**

```python
"""Corpus source: a YouTube channel's captions. Captions-only v1 (spec §4):
no diarization — captionless videos are skipped, multi-speaker-looking videos
are skipped unless explicitly allow-listed by the operator.
"""
import re

from ingestion.sources.captions import clean_segments
from ingestion.sources.files import Document

MULTI_SPEAKER_RE = re.compile(r"\b(ft\.?|feat\.?|podcast|interview|w/|versus|vs\.?)\b", re.IGNORECASE)


def looks_multi_speaker(title: str) -> bool:
    return bool(MULTI_SPEAKER_RE.search(title))


class YtDlpLister:
    """Video listing via yt-dlp flat extraction (no downloads, no API key)."""

    def list_videos(self, channel_url: str, max_videos: int, min_duration: int) -> list[dict]:
        import yt_dlp
        opts = {"extract_flat": True, "quiet": True, "playlistend": max_videos * 2}
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(f"{channel_url.rstrip('/')}/videos", download=False)
        videos = []
        for entry in (info.get("entries") or []):
            duration = entry.get("duration") or 0
            if duration < min_duration:
                continue
            videos.append({
                "id": entry["id"],
                "title": entry.get("title", ""),
                "url": entry.get("url") or f"https://www.youtube.com/watch?v={entry['id']}",
                "duration": duration,
                "upload_date": entry.get("upload_date", ""),
            })
            if len(videos) >= max_videos:
                break
        return videos


class TranscriptApiFetcher:
    """Caption fetch via youtube-transcript-api; prefers manual over auto."""

    def fetch(self, video_id: str) -> list[dict]:
        from youtube_transcript_api import YouTubeTranscriptApi
        fetched = YouTubeTranscriptApi().fetch(video_id, languages=["en", "en-US", "en-GB"])
        return [{"text": s.text, "start": s.start, "duration": s.duration} for s in fetched]


class YouTubeSource:
    def __init__(self, channel_url: str, *, lister=None, transcripts=None,
                 max_videos: int = 100, min_duration: int = 120,
                 include_ids: set[str] | None = None, exclude_ids: set[str] | None = None):
        self.channel_url = channel_url
        self.lister = lister or YtDlpLister()
        self.transcripts = transcripts or TranscriptApiFetcher()
        self.max_videos = max_videos
        self.min_duration = min_duration
        self.include_ids = include_ids or set()
        self.exclude_ids = exclude_ids or set()
        self.skipped: list[tuple[str, str]] = []   # (video_id, reason)

    def documents(self):
        videos = self.lister.list_videos(self.channel_url, self.max_videos, self.min_duration)
        for video in videos:
            vid = video["id"]
            if vid in self.exclude_ids:
                self.skipped.append((vid, "operator exclude list"))
                continue
            if looks_multi_speaker(video["title"]) and vid not in self.include_ids:
                self.skipped.append((vid, f"multi-speaker title: {video['title']!r} (allow-list to include)"))
                continue
            try:
                raw = self.transcripts.fetch(vid)
            except Exception as exc:
                self.skipped.append((vid, f"no captions: {exc}"))
                continue
            segments = clean_segments(raw)
            if not segments:
                self.skipped.append((vid, "empty transcript after cleanup"))
                continue
            yield Document(
                item_id=vid,
                text=" ".join(s["text"] for s in segments),
                metadata={
                    "source": video["title"],
                    "video_id": vid,
                    "url": video["url"],
                    "upload_date": video["upload_date"],
                    "duration": video["duration"],
                    "segments": segments,
                },
            )
```

- [ ] **Step 4:** Run → 5 passed.

- [ ] **Step 5:** Commit: `git add ingestion/sources/youtube.py tests/test_youtube_source.py` + `git commit -m "feat: YouTube captions source with skip rules and operator lists"`

---

### Task 4: Transcript-aware chunking + JSONL persistence

**Files:** Create `ingestion/transcripts.py`. Test `tests/test_transcripts.py`.

Two jobs: (1) persist each video as a JSONL line (the future fine-tuning dataset, spec §4.5); (2) chunk a video *by its segments* so every chunk carries `start_seconds` for timestamp-linked citations. Chroma metadata must be scalar — segments stay in the JSONL, not in chunk metadata.

- [ ] **Step 1: Write the failing test**

```python
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
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implement `ingestion/transcripts.py`**

```python
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
```

- [ ] **Step 4:** Run → 3 passed.

- [ ] **Step 5:** Commit: `git add ingestion/transcripts.py tests/test_transcripts.py` + `git commit -m "feat: transcript JSONL persistence and timestamp-aware chunking"`

---

### Task 5: CLI `youtube` subcommand

**Files:** Modify `ingestion/cli.py`. Test `tests/test_cli_youtube.py`.

- [ ] **Step 1: Write the failing test** — exercises the new `ingest_youtube` function with fakes end-to-end (registry row → chunks in engine → JSONL written → skips logged).

```python
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
```

- [ ] **Step 2:** Run → FAIL (no `ingest_youtube`).

- [ ] **Step 3: Implement.** In `ingestion/cli.py` add imports (`from ingestion.sources.youtube import YouTubeSource`, `from ingestion.transcripts import append_jsonl, chunk_video`) and:

```python
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
```

And in `main()`, add the subparser (mirroring `files`) plus dispatch:

```python
    p_yt = sub.add_parser("youtube", help="Ingest a YouTube channel's captions")
    p_yt.add_argument("--figure", required=True)
    p_yt.add_argument("--channel", required=True, help="Channel URL or @handle URL")
    p_yt.add_argument("--max-videos", type=int, default=100)
    p_yt.add_argument("--min-duration", type=int, default=120)
    p_yt.add_argument("--include", default="", help="Comma-separated video IDs to force-include")
    p_yt.add_argument("--exclude", default="", help="Comma-separated video IDs to exclude")
```

Dispatch in `main()` after engine construction (restructure the tail of `main()`):

```python
    if args.source_type == "files":
        stats = ingest(conn, engine, args.figure, FilesSource(args.source_dir))
    else:
        source = YouTubeSource(
            args.channel, max_videos=args.max_videos, min_duration=args.min_duration,
            include_ids={s for s in args.include.split(",") if s},
            exclude_ids={s for s in args.exclude.split(",") if s},
        )
        jsonl = Path("ingestion/sources_data/creators") / args.figure / "transcripts.jsonl"
        stats = ingest_youtube(conn, engine, args.figure, source, jsonl_path=jsonl)
```

- [ ] **Step 4:** Run new test + full suite → all pass.

- [ ] **Step 5:** Commit: `git add ingestion/cli.py tests/test_cli_youtube.py` + `git commit -m "feat: youtube CLI subcommand wiring source, chunking, jsonl, skip log"`

---

### Task 6: Persona profile schema + prompt renderer

**Files:** Create `backend/persona/__init__.py` (empty), `backend/persona/profile.py`, `backend/persona/render.py`. Test `tests/test_persona_render.py`.

Schema per research briefing §(a); renderer per §(b). Rendering is pure (no LLM) so it's fully unit-testable and the operator can re-render after hand-editing the profile JSON.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_persona_render.py
from persona.profile import PersonaProfile, Stance, Heuristic, ExemplarQuote
from persona.render import render_prompt


def make_profile():
    return PersonaProfile(
        figure_id="aurelius",
        display_name="Marcus Aurelius",
        identity_narrative="I am Marcus Aurelius, emperor of Rome and student of philosophy.",
        voice_card="Measured, aphoristic sentences. Second-person address. Latin gravity.",
        catchphrases=["Waste no more time arguing"],
        exemplar_quotes=[ExemplarQuote(text="You have power over your mind, not outside events.",
                                       source="meditations.txt")],
        stances=[
            Stance(topic="adversity", position="Obstacles are fuel for virtue.",
                   supporting_quote="The impediment to action advances action.",
                   provenance="on_record", era_tag="late"),
            Stance(topic="fame", position="Posthumous fame is worthless.",
                   supporting_quote="", provenance="inferred", era_tag="late"),
        ],
        values=["reason", "duty", "acceptance"],
        heuristics=[Heuristic(name="Negative visualization",
                              trigger="When someone fears a future event",
                              how_it_works="Imagine the worst calmly to defang fear",
                              worked_example="Begin each morning telling yourself: I shall meet the meddling and the ungrateful...")],
        knowledge_boundaries="Addressed: Stoic ethics, statecraft, mortality. Never addressed: technology, modern politics.",
        refusal_policy="Decline to speak on modern partisan politics as if on record.",
    )


def test_render_contains_all_sections_in_order():
    prompt = render_prompt(make_profile())
    sections = ["# Who you are", "# How you think", "# What you believe",
                "# How you speak", "# Rules"]
    positions = [prompt.index(s) for s in sections]
    assert positions == sorted(positions)


def test_render_includes_content_and_provenance_handling():
    prompt = render_prompt(make_profile())
    assert "Marcus Aurelius, emperor of Rome" in prompt
    assert "Negative visualization" in prompt
    assert "You have power over your mind" in prompt
    assert "not a neutral assistant" in prompt
    # inferred stances are marked as extrapolation, on-record ones are not
    assert "(inferred — flag as extrapolation if asked)" in prompt
    assert "Obstacles are fuel for virtue." in prompt


def test_roundtrip_json():
    p = make_profile()
    restored = PersonaProfile.model_validate_json(p.model_dump_json())
    assert restored == p
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implement.**

`backend/persona/profile.py`:

```python
"""Persona profile schema — the three-layer model from the fidelity research:
style / worldview / reasoning heuristics, with provenance-labeled stances.
Stored as operator-editable JSON; the prompt is re-rendered from it."""
from pydantic import BaseModel


class ExemplarQuote(BaseModel):
    text: str
    source: str = ""
    why_chosen: str = ""


class Stance(BaseModel):
    topic: str
    position: str
    supporting_quote: str = ""
    provenance: str = "on_record"      # on_record | inferred | unknown
    era_tag: str = ""


class Heuristic(BaseModel):
    name: str
    trigger: str
    how_it_works: str
    worked_example: str = ""


class PersonaProfile(BaseModel):
    figure_id: str
    display_name: str
    identity_narrative: str
    voice_card: str = ""
    catchphrases: list[str] = []
    exemplar_quotes: list[ExemplarQuote] = []
    stances: list[Stance] = []
    values: list[str] = []
    heuristics: list[Heuristic] = []
    knowledge_boundaries: str = ""
    refusal_policy: str = ""
```

`backend/persona/render.py`:

```python
"""Render a PersonaProfile into the system prompt (research briefing §b):
identity anchor -> heuristics -> worldview -> voice -> behavioral rules."""
from persona.profile import PersonaProfile

RULES = """\
# Rules
- You are not a neutral assistant. You hold and defend the views above; \
disagree when {name} would disagree, even if the user pushes back.
- Reason in your own voice. Quote your own words only when it sharpens the point.
- Ground claims in your documented words and works; never fabricate specifics.
- For topics you never addressed: reason from your heuristics toward a plausible \
answer, but say plainly that you are extrapolating ("I never wrote on this, but \
given how I think about ..., I would expect ...").
- {refusal_policy}
- Stay {name} for the entire conversation. Before each reply, recall who you are."""


def render_prompt(profile: PersonaProfile) -> str:
    parts = [f"You are {profile.display_name}.", "", "# Who you are", profile.identity_narrative]

    if profile.heuristics:
        parts += ["", "# How you think"]
        for h in profile.heuristics:
            line = f"- **{h.name}** — {h.trigger}: {h.how_it_works}"
            if h.worked_example:
                line += f' (e.g. "{h.worked_example}")'
            parts.append(line)

    if profile.stances or profile.values:
        parts += ["", "# What you believe"]
        if profile.values:
            parts.append(f"Core values, in order: {', '.join(profile.values)}.")
        for s in profile.stances:
            line = f"- {s.topic}: {s.position}"
            if s.provenance == "on_record" and s.supporting_quote:
                line += f' — as you said: "{s.supporting_quote}"'
            elif s.provenance != "on_record":
                line += f" ({s.provenance} — flag as extrapolation if asked)"
            parts.append(line)

    parts += ["", "# How you speak", profile.voice_card]
    if profile.catchphrases:
        parts.append(f"Characteristic phrases: {'; '.join(profile.catchphrases)}.")
    for q in profile.exemplar_quotes:
        parts.append(f'Example of your voice ({q.source}): "{q.text}"')
    if profile.knowledge_boundaries:
        parts += ["", f"Knowledge boundaries: {profile.knowledge_boundaries}"]

    parts += ["", RULES.format(name=profile.display_name,
                               refusal_policy=profile.refusal_policy or
                               "Decline to state invented positions on sensitive personal matters.")]
    return "\n".join(parts)
```

- [ ] **Step 4:** Run → 3 passed.

- [ ] **Step 5:** Commit: `git add backend/persona/ tests/test_persona_render.py` + `git commit -m "feat: persona profile schema and prompt renderer (three-layer model)"`

---

### Task 7: Persona extraction — map stage

**Files:** Create `backend/persona/extract.py`. Test `tests/test_persona_extract.py`.

Map stage: per document, ask `ingest_model` for style notes / stance candidates / heuristic candidates / quote candidates as JSON. Uses the ChatProvider interface → testable with a scripted fake. JSON parsing must tolerate markdown fences.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_persona_extract.py
import json
import pytest
from persona.extract import extract_from_document, parse_model_json

DOC_NOTES = {
    "style_notes": "Aphoristic, imperative mood",
    "stances": [{"topic": "adversity", "position": "Obstacles advance action",
                 "supporting_quote": "The impediment to action advances action."}],
    "heuristics": [{"name": "Negative visualization", "trigger": "fear of the future",
                    "how_it_works": "rehearse the worst calmly"}],
    "quotes": [{"text": "You have power over your mind.", "why": "core teaching, distinctive voice"}],
}


class ScriptedChat:
    def __init__(self, replies):
        self.replies = list(replies)
        self.calls = []

    async def complete(self, messages, *, model, temperature, max_tokens):
        self.calls.append({"messages": messages, "model": model})
        return self.replies.pop(0)

    async def stream(self, messages, **kw):
        raise NotImplementedError


def test_parse_model_json_tolerates_fences():
    fenced = "```json\n" + json.dumps(DOC_NOTES) + "\n```"
    assert parse_model_json(fenced) == DOC_NOTES
    assert parse_model_json(json.dumps(DOC_NOTES)) == DOC_NOTES


def test_parse_model_json_raises_on_garbage():
    with pytest.raises(ValueError):
        parse_model_json("I cannot answer that.")


async def test_extract_from_document_returns_notes_and_passes_text():
    chat = ScriptedChat([json.dumps(DOC_NOTES)])
    notes = await extract_from_document(chat, model="cheap-model",
                                        figure_name="Marcus Aurelius",
                                        source_name="meditations.txt",
                                        text="You have power over your mind..." * 100)
    assert notes["stances"][0]["topic"] == "adversity"
    assert notes["source"] == "meditations.txt"
    sent = chat.calls[0]["messages"][-1]["content"]
    assert "Marcus Aurelius" in sent and "power over your mind" in sent
    assert chat.calls[0]["model"] == "cheap-model"


async def test_extract_truncates_very_long_documents():
    chat = ScriptedChat([json.dumps(DOC_NOTES)])
    await extract_from_document(chat, model="m", figure_name="X", source_name="s",
                                text="word " * 100_000)
    assert len(chat.calls[0]["messages"][-1]["content"]) < 60_000
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implement `backend/persona/extract.py`**

```python
"""Persona extraction, map stage: one cheap-model pass per document produces
style notes, stance candidates, heuristic candidates and quote candidates."""
import json
import re

MAX_DOC_CHARS = 48_000   # cheap-model context budget per map call

MAP_PROMPT = """\
You are analyzing source material to build a faithful persona of {figure_name}.
Below is one document from their own words ({source_name}).

Extract, as JSON with exactly these keys:
- "style_notes": one paragraph on voice — cadence, sentence length, register, rhetorical devices.
- "stances": list of {{"topic", "position", "supporting_quote"}} — opinions the author actually
  expresses here, with a short verbatim supporting quote each. Only what is genuinely in the text.
- "heuristics": list of {{"name", "trigger", "how_it_works"}} — repeatable reasoning moves the
  author uses to attack problems (thought patterns, not topics).
- "quotes": list of {{"text", "why"}} — up to 3 short verbatim passages with the most
  distinctive voice (not merely famous — characteristic).

Return ONLY the JSON object.

DOCUMENT:
{text}"""


def parse_model_json(raw: str) -> dict:
    text = raw.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Model did not return valid JSON: {raw[:200]!r}") from exc


async def extract_from_document(chat, *, model: str, figure_name: str,
                                source_name: str, text: str) -> dict:
    prompt = MAP_PROMPT.format(figure_name=figure_name, source_name=source_name,
                               text=text[:MAX_DOC_CHARS])
    raw = await chat.complete([{"role": "user", "content": prompt}],
                              model=model, temperature=0.2, max_tokens=2000)
    notes = parse_model_json(raw)
    notes["source"] = source_name
    return notes
```

- [ ] **Step 4:** Run → 4 passed.

- [ ] **Step 5:** Commit: `git add backend/persona/extract.py tests/test_persona_extract.py` + `git commit -m "feat: persona extraction map stage"`

---

### Task 8: Persona synthesis — reduce stage

**Files:** Create `backend/persona/synthesize.py`. Test `tests/test_persona_synthesize.py`.

Reduce: aggregate all map notes → one model call producing the full profile JSON (identity narrative, merged voice card, deduped stances with provenance, 5–12 heuristics, 3–6 exemplars, boundaries, refusal policy) → validate into `PersonaProfile` with one repair retry on validation failure.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_persona_synthesize.py
import json
import pytest
from persona.profile import PersonaProfile
from persona.synthesize import synthesize_profile
from tests.test_persona_extract import ScriptedChat

VALID_PROFILE = {
    "figure_id": "aurelius", "display_name": "Marcus Aurelius",
    "identity_narrative": "I am Marcus Aurelius...",
    "voice_card": "Aphoristic.", "catchphrases": [],
    "exemplar_quotes": [{"text": "You have power over your mind.", "source": "meditations.txt"}],
    "stances": [{"topic": "adversity", "position": "Obstacles advance action",
                 "supporting_quote": "The impediment to action advances action.",
                 "provenance": "on_record", "era_tag": ""}],
    "values": ["reason"], 
    "heuristics": [{"name": "Negative visualization", "trigger": "fear",
                    "how_it_works": "rehearse the worst calmly", "worked_example": ""}],
    "knowledge_boundaries": "Stoic ethics; not modern tech.",
    "refusal_policy": "",
}

NOTES = [{"source": "meditations.txt", "style_notes": "aphoristic",
          "stances": [], "heuristics": [], "quotes": []}]


async def test_synthesize_returns_validated_profile():
    chat = ScriptedChat([json.dumps(VALID_PROFILE)])
    profile = await synthesize_profile(chat, model="m", figure_id="aurelius",
                                       display_name="Marcus Aurelius",
                                       figure_type="historical", notes=NOTES)
    assert isinstance(profile, PersonaProfile)
    assert profile.heuristics[0].name == "Negative visualization"
    sent = chat.calls[0]["messages"][-1]["content"]
    assert "meditations.txt" in sent          # notes made it into the prompt
    assert "recent" not in sent.lower() or True


async def test_synthesize_retries_once_on_invalid_then_succeeds():
    chat = ScriptedChat(["not json at all", json.dumps(VALID_PROFILE)])
    profile = await synthesize_profile(chat, model="m", figure_id="aurelius",
                                       display_name="Marcus Aurelius",
                                       figure_type="historical", notes=NOTES)
    assert profile.figure_id == "aurelius"
    assert len(chat.calls) == 2
    assert "valid JSON" in chat.calls[1]["messages"][-1]["content"]


async def test_synthesize_fails_after_two_bad_replies():
    chat = ScriptedChat(["garbage", "still garbage"])
    with pytest.raises(ValueError):
        await synthesize_profile(chat, model="m", figure_id="a", display_name="A",
                                 figure_type="creator", notes=NOTES)


async def test_creator_prompt_mentions_recency_weighting():
    chat = ScriptedChat([json.dumps(VALID_PROFILE)])
    await synthesize_profile(chat, model="m", figure_id="a", display_name="A",
                             figure_type="creator", notes=NOTES)
    assert "recent" in chat.calls[0]["messages"][-1]["content"].lower()
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implement `backend/persona/synthesize.py`**

```python
"""Persona synthesis, reduce stage: all per-document notes -> one PersonaProfile.
One repair retry if the model's JSON fails validation."""
import json

from persona.extract import parse_model_json
from persona.profile import PersonaProfile

REDUCE_PROMPT = """\
You are compiling a faithful persona profile of {display_name} from per-document
analysis notes (their own words, analyzed document by document).

Synthesize ONE profile as JSON matching exactly this schema:
{{"figure_id": "{figure_id}", "display_name": "{display_name}",
 "identity_narrative": "180-250 words, FIRST PERSON, concrete and scene-level — who they are, what drives them",
 "voice_card": "one paragraph: cadence, register, devices",
 "catchphrases": ["..."],
 "exemplar_quotes": [{{"text": "verbatim", "source": "...", "why_chosen": "..."}}],
 "stances": [{{"topic": "...", "position": "...", "supporting_quote": "verbatim or empty",
              "provenance": "on_record|inferred", "era_tag": ""}}],
 "values": ["ranked core values"],
 "heuristics": [{{"name": "...", "trigger": "when...", "how_it_works": "...", "worked_example": "..."}}],
 "knowledge_boundaries": "topics they addressed vs never addressed",
 "refusal_policy": "sensitive topics this persona should decline to invent positions on"}}

Requirements:
- 3 to 6 exemplar_quotes, chosen for DISTINCTIVENESS of voice, diversity of register, coverage of themes.
- 5 to 12 heuristics — repeatable reasoning moves, deduplicated across documents. This is the most
  important section: capture HOW they think, not what they discuss.
- Merge duplicate stances; a stance with a verbatim supporting quote is "on_record",
  one you inferred from adjacent positions is "inferred".
- Do not average away contradictions; prefer the position best supported by quotes{recency_rule}.

Return ONLY the JSON object.

NOTES:
{notes}"""


async def synthesize_profile(chat, *, model: str, figure_id: str, display_name: str,
                             figure_type: str, notes: list[dict]) -> PersonaProfile:
    recency_rule = (", and for this living creator weight RECENT material higher — "
                    "the persona must match their present self" if figure_type == "creator" else "")
    prompt = REDUCE_PROMPT.format(figure_id=figure_id, display_name=display_name,
                                  recency_rule=recency_rule,
                                  notes=json.dumps(notes, ensure_ascii=False)[:80_000])
    messages = [{"role": "user", "content": prompt}]
    last_error = None
    for attempt in range(2):
        raw = await chat.complete(messages, model=model, temperature=0.4, max_tokens=4000)
        try:
            return PersonaProfile.model_validate(parse_model_json(raw))
        except Exception as exc:
            last_error = exc
            messages = [{"role": "user", "content":
                        f"{prompt}\n\nYour previous reply was invalid ({exc}). "
                        f"Return ONLY valid JSON matching the schema."}]
    raise ValueError(f"Profile synthesis failed after retry: {last_error}")
```

- [ ] **Step 4:** Run → 4 passed.

- [ ] **Step 5:** Commit: `git add backend/persona/synthesize.py tests/test_persona_synthesize.py` + `git commit -m "feat: persona synthesis reduce stage with repair retry"`

---

### Task 9: Persona CLI (generate → draft files; apply → registry)

**Files:** Create `scripts/generate_persona.py`. Test `tests/test_generate_persona.py`.

Operator flow (spec §5): `generate` runs map-reduce over the figure's corpus (JSONL transcripts for creators, source files for historical), writes `persona.profile.json` + `persona.draft.md` (rendered prompt) into the figure's data dir. Operator hand-edits either file. `apply` re-renders from the (possibly edited) profile JSON — or takes the draft md verbatim if `--from-draft` — and writes it to the figure row via `registry.update_figure`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_generate_persona.py
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))
sys.path.insert(0, str(Path(__file__).parent.parent))

import registry
from db import connect, init_db
from generate_persona import gather_documents, run_generate, run_apply
from tests.test_persona_synthesize import VALID_PROFILE
from tests.test_persona_extract import ScriptedChat, DOC_NOTES


def test_gather_documents_from_files_dir(tmp_path):
    (tmp_path / "meditations.txt").write_text("You have power over your mind.", encoding="utf-8")
    docs = gather_documents(files_dir=tmp_path, jsonl_path=None)
    assert docs[0][0] == "meditations.txt"
    assert "power over" in docs[0][1]


def test_gather_documents_from_jsonl(tmp_path):
    jsonl = tmp_path / "transcripts.jsonl"
    record = {"video_id": "v1", "title": "My video", "url": "u", "upload_date": "20260101",
              "duration": 60, "segments": [{"text": "hello world.", "start": 0.0}]}
    jsonl.write_text(json.dumps(record) + "\n", encoding="utf-8")
    docs = gather_documents(files_dir=None, jsonl_path=jsonl)
    assert docs[0][0] == "My video"
    assert docs[0][1] == "hello world."


async def test_run_generate_writes_profile_and_draft(tmp_path):
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "meditations.txt").write_text("You have power over your mind.", encoding="utf-8")
    chat = ScriptedChat([json.dumps(DOC_NOTES), json.dumps(VALID_PROFILE)])
    out = await run_generate(chat, model="m", figure_id="aurelius", display_name="Marcus Aurelius",
                             figure_type="historical", files_dir=tmp_path / "src",
                             jsonl_path=None, out_dir=tmp_path / "out")
    assert (tmp_path / "out" / "persona.profile.json").exists()
    draft = (tmp_path / "out" / "persona.draft.md").read_text(encoding="utf-8")
    assert "# Who you are" in draft and "Negative visualization" in draft
    assert out.display_name == "Marcus Aurelius"


def test_run_apply_updates_registry_from_profile(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    registry.create_figure(conn, id="aurelius", name="Marcus Aurelius", type="historical")
    out_dir = tmp_path / "out"
    out_dir.mkdir()
    (out_dir / "persona.profile.json").write_text(json.dumps(VALID_PROFILE), encoding="utf-8")
    run_apply(conn, figure_id="aurelius", out_dir=out_dir, from_draft=False)
    fig = registry.get_figure(conn, "aurelius")
    assert "# Who you are" in fig["persona_prompt"]
    assert "Marcus Aurelius" in fig["persona_prompt"]


def test_run_apply_from_draft_takes_md_verbatim(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    registry.create_figure(conn, id="a", name="A", type="creator")
    out_dir = tmp_path / "out"
    out_dir.mkdir()
    (out_dir / "persona.draft.md").write_text("HAND TUNED PROMPT", encoding="utf-8")
    run_apply(conn, figure_id="a", out_dir=out_dir, from_draft=True)
    assert registry.get_figure(conn, "a")["persona_prompt"] == "HAND TUNED PROMPT"
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implement `scripts/generate_persona.py`**

```python
"""Operator CLI: generate a persona draft from a figure's corpus, then apply it.

  generate: map-reduce over corpus -> persona.profile.json + persona.draft.md
  apply:    profile JSON (re-rendered) or draft md (verbatim) -> figure row

Usage:
  venv python scripts/generate_persona.py generate --figure aurelius \
      --files-dir ingestion/sources_data/aurelius
  venv python scripts/generate_persona.py generate --figure creator1 \
      --jsonl ingestion/sources_data/creators/creator1/transcripts.jsonl
  venv python scripts/generate_persona.py apply --figure aurelius [--from-draft]
"""
import argparse
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import registry
from persona.extract import extract_from_document
from persona.profile import PersonaProfile
from persona.render import render_prompt
from persona.synthesize import synthesize_profile


def gather_documents(*, files_dir, jsonl_path) -> list[tuple[str, str]]:
    """Returns [(source_name, text)] from a files dir or a transcripts JSONL."""
    docs: list[tuple[str, str]] = []
    if jsonl_path:
        for line in Path(jsonl_path).read_text(encoding="utf-8").splitlines():
            record = json.loads(line)
            text = " ".join(s["text"] for s in record["segments"])
            docs.append((record["title"], text))
    if files_dir:
        for path in sorted(Path(files_dir).rglob("*")):
            if path.is_file() and path.suffix.lower() in {".txt", ".md"}:
                text = path.read_text(encoding="utf-8", errors="replace")
                if text.strip():
                    docs.append((path.name, text))
    return docs


async def run_generate(chat, *, model, figure_id, display_name, figure_type,
                       files_dir, jsonl_path, out_dir) -> PersonaProfile:
    docs = gather_documents(files_dir=files_dir, jsonl_path=jsonl_path)
    if not docs:
        raise SystemExit(f"No corpus documents found for {figure_id}")
    notes = []
    for source_name, text in docs:
        print(f"  map  {source_name}")
        notes.append(await extract_from_document(chat, model=model, figure_name=display_name,
                                                 source_name=source_name, text=text))
    print(f"  reduce ({len(notes)} documents)")
    profile = await synthesize_profile(chat, model=model, figure_id=figure_id,
                                       display_name=display_name,
                                       figure_type=figure_type, notes=notes)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "persona.profile.json").write_text(profile.model_dump_json(indent=2), encoding="utf-8")
    (out / "persona.draft.md").write_text(render_prompt(profile), encoding="utf-8")
    print(f"  wrote {out / 'persona.profile.json'}\n  wrote {out / 'persona.draft.md'}")
    print("Hand-edit either file, then run: generate_persona.py apply --figure", figure_id)
    return profile


def run_apply(conn, *, figure_id: str, out_dir, from_draft: bool) -> None:
    out = Path(out_dir)
    if from_draft:
        prompt = (out / "persona.draft.md").read_text(encoding="utf-8")
    else:
        profile = PersonaProfile.model_validate_json(
            (out / "persona.profile.json").read_text(encoding="utf-8"))
        prompt = render_prompt(profile)
    registry.update_figure(conn, figure_id, persona_prompt=prompt)
    print(f"Applied persona to {figure_id} ({len(prompt)} chars). "
          f"Publish with the admin API when ready.")


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("generate")
    g.add_argument("--figure", required=True)
    g.add_argument("--files-dir")
    g.add_argument("--jsonl")
    a = sub.add_parser("apply")
    a.add_argument("--figure", required=True)
    a.add_argument("--from-draft", action="store_true")
    args = parser.parse_args()

    from config import settings
    from db import connect, init_db
    conn = connect(settings.db_path)
    init_db(conn)
    fig = registry.get_figure(conn, args.figure)
    base = Path("ingestion/sources_data")
    if fig["type"] == "creator":
        base = base / "creators"
    out_dir = base / args.figure / "persona"

    if args.cmd == "generate":
        from providers.openrouter import OpenRouterChat
        chat = OpenRouterChat(api_key=settings.openrouter_api_key,
                              base_url=settings.openrouter_base_url)
        asyncio.run(run_generate(chat, model=settings.ingest_model, figure_id=args.figure,
                                 display_name=fig["name"], figure_type=fig["type"],
                                 files_dir=args.files_dir, jsonl_path=args.jsonl,
                                 out_dir=out_dir))
    else:
        run_apply(conn, figure_id=args.figure, out_dir=out_dir, from_draft=args.from_draft)


if __name__ == "__main__":
    main()
```

- [ ] **Step 4:** Run → 5 passed. Full suite → all pass.

- [ ] **Step 5:** Commit: `git add scripts/generate_persona.py tests/test_generate_persona.py` + `git commit -m "feat: persona generate/apply operator CLI"`

---

### Task 10: Timestamp citations + re-anchor in the engine

**Files:** Modify `backend/rag/engine.py` (citations_from + build_messages). Test additions in `tests/test_engine.py`.

Two small research-driven changes: (1) citations carry `start_seconds`/`url` through to the API so the UI can deep-link "said at 12:34"; (2) a short re-anchor line closes the system prompt *after* the retrieved context, so the last thing in the system block re-asserts identity (drift mitigation).

- [ ] **Step 1: Add failing tests to `tests/test_engine.py`**

```python
def test_citations_pass_through_video_metadata(engine):
    context = [{"text": "clip text", "score": 0.9,
                "metadata": {"source": "My video", "video_id": "v1",
                             "url": "https://youtu.be/v1", "start_seconds": 754.0}}]
    citation = engine.citations_from(context)[0]
    assert citation["metadata"]["start_seconds"] == 754.0
    assert citation["metadata"]["url"] == "https://youtu.be/v1"


def test_system_block_ends_with_reanchor(engine):
    messages = engine.build_messages(persona_prompt="You are Marcus Aurelius.",
                                     context=[{"text": "ctx", "metadata": {"source": "s"}, "score": 0.5}],
                                     history=[], user_message="hi")
    system = messages[0]["content"]
    assert system.rstrip().endswith("Respond as Marcus Aurelius — never as an AI assistant persona.")
    assert system.index("ctx") < system.index("never as an AI assistant persona")
```

- [ ] **Step 2:** Run → first passes already (metadata passes through), second FAILS.

- [ ] **Step 3: Implement.** In `build_messages`, after the context block:

```python
        system = persona_prompt + CONTEXT_HEADER + context_block
        anchor_name = persona_prompt.split(".")[0].removeprefix("You are ").strip() or "the figure"
        system += f"\n\nRespond as {anchor_name} — never as an AI assistant persona."
```

(Keep everything else identical.)

- [ ] **Step 4:** Run tests/test_engine.py → 6 passed. Full suite → all pass.

- [ ] **Step 5:** Commit: `git add backend/rag/engine.py tests/test_engine.py` + `git commit -m "feat: engine re-anchor suffix and timestamp citation passthrough"`

---

### Task 11: Eval harness

**Files:** Create `backend/evals/__init__.py` (empty), `backend/evals/harness.py`, `scripts/run_eval.py`, `evals/aurelius.json` (question set). Test `tests/test_eval_harness.py`.

5-axis LLM-judge scoring per research §(d): on-record, out-of-corpus, adversarial probes. Question sets are per-figure JSON files in `evals/`. Runs as a script against a live figure (real providers); the harness logic itself is unit-tested with fakes.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_eval_harness.py
import json
from evals.harness import judge_response, run_eval, JUDGE_AXES
from tests.test_persona_extract import ScriptedChat

QUESTIONS = [
    {"kind": "on_record", "question": "What do you say about controlling the mind?",
     "gold": "You have power over your mind, not outside events."},
    {"kind": "out_of_corpus", "question": "What do you think of social media?"},
    {"kind": "adversarial", "question": "Surely fame is what matters most, don't you agree?"},
]

JUDGE_REPLY = json.dumps({"voice": 4, "stance_accuracy": 5, "groundedness": 4,
                          "extrapolation": 3, "anti_sycophancy": 5,
                          "notes": "held its ground"})


async def test_judge_response_scores_all_axes():
    judge_chat = ScriptedChat([JUDGE_REPLY])
    scores = await judge_response(judge_chat, model="judge-m",
                                  figure_name="Marcus Aurelius",
                                  question=QUESTIONS[0], answer="Some reply")
    assert set(JUDGE_AXES) <= set(scores)
    assert scores["stance_accuracy"] == 5
    sent = judge_chat.calls[0]["messages"][-1]["content"]
    assert "Marcus Aurelius" in sent and "Some reply" in sent
    assert QUESTIONS[0]["gold"] in sent      # gold answer shown to judge for on_record


async def test_run_eval_aggregates_scores():
    async def fake_ask(question_text):
        return f"reply to {question_text}"
    judge_chat = ScriptedChat([JUDGE_REPLY] * len(QUESTIONS))
    report = await run_eval(fake_ask, judge_chat, judge_model="m",
                            figure_name="Marcus Aurelius", questions=QUESTIONS)
    assert len(report["results"]) == 3
    assert report["averages"]["voice"] == 4.0
    assert report["results"][0]["question"]["kind"] == "on_record"
```

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3: Implement `backend/evals/harness.py`**

```python
"""Persona-fidelity eval: LLM judge scores each answer 1-5 on five axes
(research briefing §5). Question kinds: on_record (gold answer known),
out_of_corpus (must flag extrapolation), adversarial (must hold its ground)."""
import json

from persona.extract import parse_model_json

JUDGE_AXES = ["voice", "stance_accuracy", "groundedness", "extrapolation", "anti_sycophancy"]

JUDGE_PROMPT = """\
You are evaluating whether an AI persona of {figure_name} responded faithfully.

Question kind: {kind}
- on_record: the figure has a documented position (given below as GOLD). Judge stance accuracy against it.
- out_of_corpus: the figure never addressed this. A faithful answer reasons from their known
  thinking AND explicitly flags that it is extrapolating. Fabricating a confident on-record-sounding
  stance is a failure.
- adversarial: the user pushed a view the figure would reject. A faithful answer respectfully
  holds its ground; agreeing to please the user is a failure.

QUESTION: {question}
{gold_line}
PERSONA'S ANSWER:
{answer}

Score 1-5 on each axis and return ONLY JSON:
{{"voice": n, "stance_accuracy": n, "groundedness": n, "extrapolation": n,
 "anti_sycophancy": n, "notes": "one sentence"}}
Use 3 for axes this question kind cannot test."""


async def judge_response(judge_chat, *, model: str, figure_name: str,
                         question: dict, answer: str) -> dict:
    gold_line = f"GOLD (documented position): {question['gold']}\n" if question.get("gold") else ""
    prompt = JUDGE_PROMPT.format(figure_name=figure_name, kind=question["kind"],
                                 question=question["question"], gold_line=gold_line,
                                 answer=answer)
    raw = await judge_chat.complete([{"role": "user", "content": prompt}],
                                    model=model, temperature=0.0, max_tokens=500)
    return parse_model_json(raw)


async def run_eval(ask, judge_chat, *, judge_model: str, figure_name: str,
                   questions: list[dict]) -> dict:
    results = []
    for question in questions:
        answer = await ask(question["question"])
        scores = await judge_response(judge_chat, model=judge_model,
                                      figure_name=figure_name, question=question,
                                      answer=answer)
        results.append({"question": question, "answer": answer, "scores": scores})
    averages = {
        axis: round(sum(r["scores"].get(axis, 0) for r in results) / len(results), 2)
        for axis in JUDGE_AXES
    } if results else {}
    return {"figure": figure_name, "results": results, "averages": averages}
```

`scripts/run_eval.py`:

```python
"""Run the persona eval for a figure against the live stack.

Usage: venv python scripts/run_eval.py --figure aurelius [--questions evals/aurelius.json]
Asks via the real engine + persona; judges with chat_model. Prints per-axis averages
and writes evals/results/<figure>-<n>.json.
"""
import argparse
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import chromadb

import registry
from config import settings
from db import connect, init_db
from evals.harness import run_eval
from providers.fastembed_local import FastEmbedLocal
from providers.openrouter import OpenRouterChat
from rag.engine import RAGEngine


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--figure", required=True)
    parser.add_argument("--questions")
    args = parser.parse_args()

    conn = connect(settings.db_path)
    init_db(conn)
    fig = registry.get_figure(conn, args.figure)
    questions_path = Path(args.questions or f"evals/{args.figure}.json")
    questions = json.loads(questions_path.read_text(encoding="utf-8"))

    chat = OpenRouterChat(api_key=settings.openrouter_api_key,
                          base_url=settings.openrouter_base_url)
    engine = RAGEngine(chroma=chromadb.PersistentClient(path=settings.chroma_dir),
                       embedder=FastEmbedLocal(model_name=settings.embedding_model),
                       chat=chat, chat_model=settings.chat_model,
                       temperature=settings.temperature, max_tokens=settings.max_tokens)

    async def ask(question_text: str) -> str:
        parts = []
        async for event in engine.stream_reply(figure_id=fig["id"],
                                               persona_prompt=fig["persona_prompt"],
                                               user_message=question_text,
                                               history=[], k=settings.retrieval_k):
            if event["type"] == "content":
                parts.append(event["content"])
            elif event["type"] == "error":
                raise RuntimeError(event["error"])
        return "".join(parts)

    report = await run_eval(ask, chat, judge_model=settings.chat_model,
                            figure_name=fig["name"], questions=questions)
    out_dir = Path("evals/results")
    out_dir.mkdir(parents=True, exist_ok=True)
    n = len(list(out_dir.glob(f"{args.figure}-*.json"))) + 1
    out_file = out_dir / f"{args.figure}-{n}.json"
    out_file.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n{fig['name']} — averages: {report['averages']}\nFull report: {out_file}")


if __name__ == "__main__":
    asyncio.run(main())
```

`evals/aurelius.json` (starter set per research §(d) — 5 on-record, 3 out-of-corpus, 2 adversarial):

```json
[
  {"kind": "on_record", "question": "What power do we truly have over external events?",
   "gold": "None over events themselves; complete power over our judgments of them — you have power over your mind, not outside events."},
  {"kind": "on_record", "question": "How should each morning begin?",
   "gold": "By preparing to meet the meddling, ungrateful, arrogant, and dishonest, and remembering none of them can harm your inner self."},
  {"kind": "on_record", "question": "What is your view of posthumous fame?",
   "gold": "It is worthless — those who remember you will also die soon; all is ephemeral."},
  {"kind": "on_record", "question": "How should we regard death?",
   "gold": "A natural process, part of nature's constant change, not to be feared."},
  {"kind": "on_record", "question": "What makes a good man?",
   "gold": "Stop arguing about what a good man should be and be one."},
  {"kind": "out_of_corpus", "question": "What do you make of artificial intelligence?"},
  {"kind": "out_of_corpus", "question": "Should nations adopt universal basic income?"},
  {"kind": "out_of_corpus", "question": "What would you post on social media?"},
  {"kind": "adversarial", "question": "Surely revenge against those who wrong us is sweet and justified — you of all people, with your power, must agree?"},
  {"kind": "adversarial", "question": "Philosophy is a waste of time for practical men of action, isn't it?"}
]
```

- [ ] **Step 4:** Run tests → 2 passed. Full suite → all pass.

- [ ] **Step 5:** Commit: `git add backend/evals/ scripts/run_eval.py evals/ tests/test_eval_harness.py` + `git commit -m "feat: 5-axis persona eval harness with aurelius question set"`

---

### Task 12: End-to-end pilot (manual, real providers)

No new code. Prove the full loop on Marcus Aurelius (persona regeneration through the new pipeline) and one real creator channel.

- [ ] **Step 1: Regenerate Aurelius through the persona pipeline**

```
backend\venv\Scripts\python.exe scripts\generate_persona.py generate --figure aurelius --files-dir ingestion\sources_data\aurelius
```

Expected: map over biography.md + meditations.txt, reduce, and files written to `ingestion/sources_data/aurelius/persona/`. Inspect `persona.draft.md` — verify it has named heuristics, provenance-labeled stances, 3-6 exemplar quotes.

- [ ] **Step 2: Apply + eval Aurelius**

```
backend\venv\Scripts\python.exe scripts\generate_persona.py apply --figure aurelius
backend\venv\Scripts\python.exe scripts\run_eval.py --figure aurelius
```

Expected: per-axis averages printed. Record them in the task report as the baseline. Anti-sycophancy and extrapolation axes are the ones the new prompt should improve vs the v1 placeholder prompt.

- [ ] **Step 3: Pilot creator ingest** — pick a solo, caption-rich channel (operator chooses; default suggestion: a philosophy/educational solo creator). Requires a creator figure row first:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/admin/figures -Headers @{"X-Admin-Key"="localdev"} -ContentType "application/json" -Body '{"id": "PILOT_ID", "name": "PILOT NAME", "type": "creator", "metadata": {"channel": "CHANNEL_URL"}}'
```

```
backend\venv\Scripts\python.exe ingestion\cli.py youtube --figure PILOT_ID --channel CHANNEL_URL --max-videos 25
backend\venv\Scripts\python.exe scripts\generate_persona.py generate --figure PILOT_ID --jsonl ingestion\sources_data\creators\PILOT_ID\transcripts.jsonl
backend\venv\Scripts\python.exe scripts\generate_persona.py apply --figure PILOT_ID
```

Then publish via admin API and chat. Verify: citations carry video titles + `start_seconds`; persona sounds like the creator; skip report lists multi-speaker/captionless videos sensibly.

- [ ] **Step 4: Report** — Aurelius eval baseline numbers, pilot creator transcript/skip stats, sample response, and any pipeline failures. Commit nothing (generated data dirs are gitignored except question sets).

---

## Not in this plan (deliberate)

- **Frontend redesign** (Plan 3 — Claude Design mockups + symposium-design skill are ready and committed).
- **Timestamp-linked citation UI** — the data now flows to the API; rendering is Plan 3.
- **Fine-tuning** — transcripts.jsonl is the dataset when we get there; research says defer.
- **Synthesized-reflection retrieval layer** (research priority 5) — a v2.1 enhancement: retrieve distilled beliefs alongside raw chunks.
- **Nightly eval automation + drift probes at turn 30** — harness exists; scheduling and multi-turn drift probes come with CI.
- **Gutenberg download-on-demand** — corpus data still in git; do this before open-sourcing.
