# Symposium v2 — Curated Persona Chat (Historical Figures + YouTube Creators)

**Date:** 2026-07-21
**Status:** Approved design, pre-implementation
**Predecessor:** Symposium v1 (this repo) — treated as proof of concept. Every existing file is read and rewritten or explicitly re-earned; nothing is assumed good because it exists.

## 1. Product

A curated roster of chat personas, each grounded in a corpus of the person's own words:

- **Historical figures** — grounded in their writings (books, speeches, letters). The existing 16 figures are re-ingested and re-persona'd through the new pipeline; they are not grandfathered in.
- **Creators** (~10, curated) — living YouTubers grounded in the captions of their videos.

Users chat with a figure; responses mimic the person's voice (persona prompt derived from the corpus) and are grounded in what they actually said (RAG with citations — for creators, citations deep-link to the video at timestamp).

**Deliberately out of scope:**
- Self-serve "clone any creator" (quality control impossible, right-of-publicity risk for a monetized product, abuse surface). The ingestion pipeline is operator-run only.
- Speaker diarization (v2 path, documented but not built). v1 is captions-only.
- Fine-tuning per creator (v2 path; the data layer stores transcripts in a fine-tune-ready format so the door stays open).
- User accounts, billing, mobile.

**Goals ranking:** open-source portfolio quality first, eventual monetization second. Design choices favor clean architecture, one-key setup, and easy local runs.

## 2. Key decisions (with reasons)

| Decision | Choice | Why |
|---|---|---|
| Reuse v1 code? | Extend the repo, rebuild internals | Architecture proven; code is pre-Opus vintage (sequential embeddings, hardcoded figures, no tests) |
| Mimicry approach | Auto-generated persona prompt + RAG; fine-tune later | Best fidelity-per-effort, no GPU, works per-figure in minutes; transcripts stored fine-tune-ready |
| Roster model | Curated (~10 creators), operator-ingested | Quality (hand-tuned personas), legal safety, no abuse surface, one-time costs |
| Chat provider | Provider-agnostic adapter; default **OpenRouter** | One key, cheap frontier models for ingestion jobs, model swap without code change |
| Embeddings | Default **local (fastembed)**; OpenAI adapter optional | No second API key, free, adequate at this scale |
| Transcription | **Captions-only v1** | Zero cost, no GPU; no-caption videos skipped, multi-speaker videos skip-listed to avoid guest contamination |
| Figure storage | SQLite (dynamic registry), not Python code | Figures created/edited at runtime; drafts vs published |
| Stack | Keep Python/FastAPI + ChromaDB + SQLite + React/Vite | Rebuild internals, don't churn frameworks |

## 3. Architecture

```
React frontend (Vite)
    ↓ HTTP / SSE
FastAPI backend
    ├─ Figure registry (SQLite: figures, ingestion_log)
    ├─ Conversation store (SQLite: sessions, conversations, messages)
    ├─ RAG engine ── ChromaDB (per-figure collections)
    └─ Provider layer ── OpenRouter (chat) / fastembed (embeddings)

Ingestion CLI (operator-run)
    ├─ Corpus sources: files | youtube-channel
    ├─ Chunker (metadata-rich)
    ├─ Persona generator (map-reduce over corpus → draft persona file)
    └─ Writes: transcripts JSONL, chroma chunks, figure row (draft)
```

### 3.1 Dynamic figure registry

`figures` table replaces `backend/agents/figures.py`:

- `id` (slug), `name`, `type` (`historical` | `creator`), `description`, `status` (`draft` | `published`)
- `metadata` JSON — era/fields for historical; channel URL, handle, video counts for creators
- `persona_prompt` TEXT — the generated-then-hand-tuned system prompt
- timestamps

Seed script migrates the 16 v1 figures as `draft` rows (carrying their v1 prompts as placeholders until re-generated). Public API serves only `published` figures. Admin endpoints for CRUD and publish/unpublish, guarded by a static admin API key from config (absent key = admin routes disabled).

### 3.2 Provider layer

`providers/` package with two small interfaces:

- `ChatProvider.stream(messages, model, **params) -> async iterator`
- `EmbeddingProvider.embed(texts: list[str]) -> list[vector]` (batched, always)

Implementations: `OpenRouterChat` (OpenAI-compatible SDK; separate configurable model IDs for chat vs ingestion jobs — cheap frontier tier for ingestion, stronger for chat), `FastEmbedLocal` (default), `OpenAIEmbeddings` (optional). Tests use a `FakeProvider`. No LangChain dependency — v1 used it only for the splitter and embeddings wrapper.

### 3.3 RAG engine (rebuilt)

- Batched embedding at ingest (v1 embedded one chunk per API call — the single worst v1 defect).
- Async request path end-to-end; SSE streaming preserved.
- Context assembly: retrieved chunks go in a dedicated context block ahead of the conversation, not re-stuffed into each user message (v1 bloated history with repeated instructions).
- Retrieval: top-k semantic (k configurable) v1; hybrid/re-ranking is a documented later option, not built now.
- Citations preserved; for creator figures each chunk carries `video_id`, `video_title`, `url`, `start_seconds` so the UI renders "said in *<video>* @ 12:34" links.

### 3.4 Conversation store

v1's `database.py` schema (sessions → conversations → messages, citations JSON per message) survives with light cleanup: connection handling per-request instead of a shared `check_same_thread=False` connection, parameterized LIMIT, and migrations handled by a simple versioned bootstrap.

### 3.5 Frontend

Same stack (React/Vite), full visual redesign. The operator produces the visual direction in Claude Design; implementation follows it using the frontend-design skill to production quality (distinctive look, not the v1 generic purple-gradient). Structure: `App.jsx` (18KB single file) split into components (FigureGrid, ChatView, MessageList, CitationCard, Composer). Features: Historical/Creators category tabs, streaming chat, timestamp-linked citation cards for creators. Frontend implementation is blocked on the Claude Design mockups; backend and pipeline work proceed independently.

## 4. Ingestion pipeline

One pipeline, two corpus sources implementing a common `CorpusSource -> iterator[Document]` interface. A `Document` is text + metadata (source name, and for videos: id, title, url, upload date, duration, per-segment timestamps).

**Files source (historical):** v1's .txt/.md/.pdf loading, improved (encoding handling, PDF extraction quality checks).

**YouTube source (creator):**
1. Resolve channel URL/handle → video list via **yt-dlp** (no API key). Filters: `max_videos` (default 100, most-viewed first), `min_duration` (default 120s, excludes Shorts), optional include/exclude ID lists.
2. Fetch captions via **youtube-transcript-api** (prefer manual captions, fall back to auto-generated; segment timestamps preserved). yt-dlp subtitle extraction as fallback path.
3. Cleanup pass: strip auto-caption duplication artifacts, merge fragments into sentence-ish segments, drop `[Music]`/`[Applause]` tags.
4. **Skip rules (captions-only v1):** videos with no captions are skipped and reported. Multi-speaker videos (podcasts, interviews, collabs) go on a per-creator skip list maintained by the operator — unattributed guest speech would contaminate the persona. Heuristic assist: flag likely-multi-speaker videos by title keywords (ft., podcast, interview, w/) for operator review; the operator decides.
5. Persist raw cleaned transcripts to `sources/creators/<figure_id>/transcripts.jsonl` (one video per line: metadata + segments). This file is the future fine-tuning dataset; nothing else needs to change later to enable that path.

**Chunking:** transcript-aware — chunk within a video, never across videos; chunk metadata carries video info + start timestamp of first segment. Historical documents chunk as in v1 (recursive splitter behavior reimplemented without LangChain) with source-file metadata.

**Resumability:** `ingestion_log` table keyed on (figure_id, source_item_id) with status (pending/done/skipped/error + reason). Re-runs skip `done`, retry `error`, report a summary. A failed video never aborts the run.

## 5. Persona generator

Runs over any corpus (books or transcripts) using the cheap ingestion model via OpenRouter:

1. **Map:** per document/video, extract style notes — tone, characteristic phrasings, catchphrases, opinions and stances, recurring themes, how they open/close, audience relationship, topics they avoid.
2. **Reduce:** aggregate notes into a structured persona profile (JSON: voice, lexicon, stances, do/don't list, sample phrasings with sources).
3. **Render:** profile → system prompt via template. Template also encodes grounding rules (stay within corpus knowledge, acknowledge limits in-voice) and, for creators, an explicit "AI recreation, not the real person" self-disclosure rule.

Output is written to `sources/<type>/<figure_id>/persona.draft.md` plus the profile JSON. **The operator hand-edits the draft, then publishes** — this human pass is the curation that makes "10 done well" real. Publishing copies the final prompt into the figure row and flips status.

## 6. Repo hygiene (before open-sourcing)

- Remove the committed `.env` from the repo and rotate the key in it; verify `.gitignore` covers it; add `.env.example` only.
- Remove controversial v1 source corpora (hitler/, stalin/ directories — including the 32MB PDF) from the public repo; operator decides which historical figures ship in the seed set.
- Large raw source texts move out of git (download-on-demand script for Gutenberg texts) to keep the repo clonable.
- Delete the stray `nul` file and dead deployment docs that no longer match reality; keep one deployment guide.

## 7. Error handling

- **Ingestion:** per-item try/except → `ingestion_log` with reason; end-of-run summary (done/skipped/error counts). Rate-limit responses from YouTube endpoints back off and retry a bounded number of times.
- **Chat path:** provider errors surface as SSE `error` events with a user-readable message; conversation state is saved only on successful completion (v1 behavior kept). Retrieval returning zero chunks for a published figure is a 500-with-log, not a 404 — a published figure must have a corpus (enforced at publish time).
- **Publish gate:** a figure cannot be `published` unless its collection has chunks and its persona prompt is non-empty.

## 8. Testing & evaluation

- **pytest** suite, written alongside the rebuild (TDD): provider layer against `FakeProvider`, chunker and caption-cleanup as pure-function tests with fixture transcripts, registry/publish-gate logic, API endpoints via httpx test client. No network in tests.
- **Walking skeleton:** one solo, caption-rich pilot creator taken end-to-end (ingest → persona → hand-tune → chat) before scaling to ten; one historical figure (Marcus Aurelius — clean single-work corpus) re-done the same way to validate the unified pipeline.
- **Eval harness (small, v1):** per-figure canned question set; automated checks that answers cite real chunks (grounding) and an LLM-judge score of style match against the persona profile. Runs as a script, not CI-blocking.

## 9. Future paths (explicitly deferred)

- Diarization (WhisperX/pyannote or cloud STT) to unlock podcast-heavy creators.
- Fine-tuning per figure from the stored JSONL transcripts.
- Hybrid retrieval / re-ranking.
- Self-serve ingestion behind auth, if the legal/quality story ever supports it.
- Monetization layer (accounts, tiers) — separate spec when relevant.
