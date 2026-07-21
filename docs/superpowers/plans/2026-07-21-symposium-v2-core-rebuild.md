# Symposium v2 Core Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Symposium's backend to spec — dynamic SQLite figure registry, provider-agnostic layer (OpenRouter chat + local fastembed embeddings), batched async RAG engine, cleaned conversation store, files ingestion CLI — leaving a working historical-figures app ready for the creator pipeline (Plan 2).

**Architecture:** FastAPI + ChromaDB + SQLite, no LangChain. Figures live in SQLite (draft/published), personas are data not code. Providers are injected behind two small interfaces so tests run on fakes with zero network. Ingestion is a CLI that feeds a shared engine.

**Tech Stack:** Python 3.11+, FastAPI, uvicorn, pydantic v2 + pydantic-settings, openai SDK (pointed at OpenRouter), fastembed, chromadb, pypdf, pytest + pytest-asyncio + httpx.

**Spec:** `docs/superpowers/specs/2026-07-21-symposium-v2-design.md`

**Conventions for all tasks:**
- Run commands from `D:\Claude\Symposium` unless stated.
- Python is invoked via the backend venv: `backend\venv\Scripts\python` (create in Task 1 if missing).
- Tests live in `tests/` at repo root. Run with `backend\venv\Scripts\python -m pytest`.
- Multi-agent chat from v1 is dropped (YAGNI — not in the v2 spec). The old React frontend will partially break against the new API on this branch; that is expected, it gets redesigned in Plan 3.

---

### Task 0: Snapshot v1 and branch

v1 has uncommitted work (streaming/persistence changes). Snapshot it before demolition so the rebuild has a clean diff base.

**Files:**
- Modify: none (git only)

- [ ] **Step 1: Commit the v1 snapshot**

```bash
git add backend/main.py backend/rag/engine.py backend/database.py frontend/src/App.jsx STREAMING_AND_PERSISTENCE.md CONNECT_CLOUDFLARE.md QUICK_DEPLOY.md
git commit -m "chore: snapshot v1 streaming/persistence work before v2 rebuild"
```

Do NOT add `nul` (broken filename, removed in Task 12) or `.claude/settings.local.json`.

- [ ] **Step 2: Create the rebuild branch**

```bash
git checkout -b v2-rebuild
```

Expected: `Switched to a new branch 'v2-rebuild'`. All subsequent tasks commit to this branch.

---

### Task 1: Test scaffolding and dependencies

**Files:**
- Create: `backend/requirements.txt` (overwrite existing)
- Create: `pytest.ini`
- Create: `tests/__init__.py` (empty)
- Create: `tests/conftest.py`

- [ ] **Step 1: Write requirements.txt**

```
fastapi>=0.115
uvicorn[standard]>=0.30
pydantic>=2.8
pydantic-settings>=2.4
openai>=1.50
fastembed>=0.4
chromadb>=0.5
pypdf>=5.0
```

- [ ] **Step 2: Write pytest.ini**

```ini
[pytest]
testpaths = tests
asyncio_mode = auto
markers =
    integration: needs model downloads or network; excluded by default
addopts = -m "not integration"
```

- [ ] **Step 3: Write tests/conftest.py**

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
```

- [ ] **Step 4: Create venv and install**

```bash
cd backend
python -m venv venv
venv\Scripts\python -m pip install -r requirements.txt
venv\Scripts\python -m pip install pytest pytest-asyncio httpx
cd ..
```

- [ ] **Step 5: Verify pytest runs (collects nothing, exits clean)**

Run: `backend\venv\Scripts\python -m pytest`
Expected: `no tests ran`

- [ ] **Step 6: Commit**

```bash
git add backend/requirements.txt pytest.ini tests/
git commit -m "chore: v2 test scaffolding and dependencies"
```

---

### Task 2: Settings (pydantic-settings)

**Files:**
- Create: `backend/config.py` (overwrite existing)
- Test: `tests/test_config.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_config.py
from config import Settings


def test_defaults_load_without_env():
    s = Settings(_env_file=None)
    assert s.chat_model == "google/gemini-2.5-flash"
    assert s.embedding_model == "BAAI/bge-small-en-v1.5"
    assert s.retrieval_k == 6
    assert s.admin_api_key == ""  # empty means admin routes disabled


def test_env_overrides(monkeypatch):
    monkeypatch.setenv("CHAT_MODEL", "deepseek/deepseek-chat-v3")
    s = Settings(_env_file=None)
    assert s.chat_model == "deepseek/deepseek-chat-v3"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_config.py -v`
Expected: FAIL (ImportError or AttributeError — old config.py has different fields)

- [ ] **Step 3: Write backend/config.py**

```python
"""Application settings. All values overridable via environment or .env."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Providers
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    chat_model: str = "google/gemini-2.5-flash"          # user-facing chat
    ingest_model: str = "google/gemini-2.5-flash-lite"   # cheap tier for pipeline jobs
    embedding_model: str = "BAAI/bge-small-en-v1.5"      # fastembed local

    # Storage
    db_path: str = "data/symposium.db"
    chroma_dir: str = "data/chroma"

    # RAG
    chunk_size: int = 1200
    chunk_overlap: int = 150
    retrieval_k: int = 6
    temperature: float = 0.7
    max_tokens: int = 1024

    # API
    admin_api_key: str = ""   # empty = admin routes disabled
    allowed_origins: str = "http://localhost:3000"
    host: str = "0.0.0.0"
    port: int = 8000

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_config.py -v`
Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add backend/config.py tests/test_config.py
git commit -m "feat: pydantic-settings config for v2"
```

---

### Task 3: Provider interfaces and fakes

**Files:**
- Create: `backend/providers/__init__.py`
- Create: `backend/providers/base.py`
- Create: `backend/providers/fake.py`
- Test: `tests/test_providers_fake.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_providers_fake.py
import pytest
from providers.fake import FakeChat, FakeEmbed


async def test_fake_chat_complete_returns_canned_and_records():
    chat = FakeChat(reply="hello there")
    out = await chat.complete([{"role": "user", "content": "hi"}], model="m", temperature=0.5, max_tokens=10)
    assert out == "hello there"
    assert chat.calls[0]["messages"][0]["content"] == "hi"


async def test_fake_chat_stream_yields_chunks():
    chat = FakeChat(reply="a b c")
    chunks = [c async for c in chat.stream([{"role": "user", "content": "hi"}], model="m", temperature=0.5, max_tokens=10)]
    assert "".join(chunks) == "a b c"


def test_fake_embed_deterministic_and_correct_shape():
    emb = FakeEmbed(dim=8)
    v = emb.embed(["alpha", "beta", "alpha"])
    assert len(v) == 3 and len(v[0]) == 8
    assert v[0] == v[2]      # same text -> same vector
    assert v[0] != v[1]      # different text -> different vector
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_providers_fake.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'providers'`

- [ ] **Step 3: Implement**

`backend/providers/__init__.py`:

```python
```

(empty file)

`backend/providers/base.py`:

```python
"""Provider interfaces. Chat providers are async; embedding providers are sync
(fastembed is CPU-bound local work — callers run it off the event loop if needed)."""
from typing import AsyncIterator, Protocol


class ChatProvider(Protocol):
    async def complete(self, messages: list[dict], *, model: str, temperature: float, max_tokens: int) -> str: ...

    def stream(self, messages: list[dict], *, model: str, temperature: float, max_tokens: int) -> AsyncIterator[str]: ...


class EmbeddingProvider(Protocol):
    def embed(self, texts: list[str]) -> list[list[float]]: ...
```

`backend/providers/fake.py`:

```python
"""In-memory providers for tests. No network, deterministic."""
import hashlib


class FakeChat:
    def __init__(self, reply: str = "fake reply"):
        self.reply = reply
        self.calls: list[dict] = []

    async def complete(self, messages, *, model, temperature, max_tokens) -> str:
        self.calls.append({"messages": messages, "model": model})
        return self.reply

    async def stream(self, messages, *, model, temperature, max_tokens):
        self.calls.append({"messages": messages, "model": model})
        for i, word in enumerate(self.reply.split(" ")):
            yield word if i == 0 else " " + word


class FakeEmbed:
    def __init__(self, dim: int = 8):
        self.dim = dim

    def embed(self, texts: list[str]) -> list[list[float]]:
        out = []
        for t in texts:
            h = hashlib.sha256(t.encode()).digest()
            out.append([h[i] / 255.0 for i in range(self.dim)])
        return out
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_providers_fake.py -v`
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add backend/providers/ tests/test_providers_fake.py
git commit -m "feat: provider interfaces with fake implementations"
```

---

### Task 4: OpenRouter chat provider

**Files:**
- Create: `backend/providers/openrouter.py`
- Test: `tests/test_openrouter.py`

- [ ] **Step 1: Write the failing test** (stub client injected — no network)

```python
# tests/test_openrouter.py
from types import SimpleNamespace
from providers.openrouter import OpenRouterChat


class StubCompletions:
    def __init__(self):
        self.kwargs = None

    async def create(self, **kwargs):
        self.kwargs = kwargs
        if kwargs.get("stream"):
            async def gen():
                for text in ["Hel", "lo"]:
                    yield SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=text))])
            return gen()
        msg = SimpleNamespace(content="Hello")
        return SimpleNamespace(choices=[SimpleNamespace(message=msg)])


def make_provider():
    stub = StubCompletions()
    client = SimpleNamespace(chat=SimpleNamespace(completions=stub))
    return OpenRouterChat(client=client), stub


async def test_complete_passes_params_and_returns_text():
    provider, stub = make_provider()
    out = await provider.complete([{"role": "user", "content": "hi"}], model="m1", temperature=0.2, max_tokens=50)
    assert out == "Hello"
    assert stub.kwargs["model"] == "m1"
    assert stub.kwargs["temperature"] == 0.2
    assert stub.kwargs["max_tokens"] == 50


async def test_stream_yields_deltas():
    provider, _ = make_provider()
    chunks = [c async for c in provider.stream([{"role": "user", "content": "hi"}], model="m1", temperature=0.2, max_tokens=50)]
    assert "".join(chunks) == "Hello"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_openrouter.py -v`
Expected: FAIL with `ModuleNotFoundError`

- [ ] **Step 3: Implement backend/providers/openrouter.py**

```python
"""OpenRouter chat via the OpenAI-compatible API."""
from openai import AsyncOpenAI


class OpenRouterChat:
    def __init__(self, api_key: str = "", base_url: str = "https://openrouter.ai/api/v1", client=None):
        self._client = client or AsyncOpenAI(api_key=api_key, base_url=base_url)

    async def complete(self, messages, *, model, temperature, max_tokens) -> str:
        resp = await self._client.chat.completions.create(
            model=model, messages=messages, temperature=temperature, max_tokens=max_tokens
        )
        return resp.choices[0].message.content or ""

    async def stream(self, messages, *, model, temperature, max_tokens):
        resp = await self._client.chat.completions.create(
            model=model, messages=messages, temperature=temperature, max_tokens=max_tokens, stream=True
        )
        async for chunk in resp:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_openrouter.py -v`
Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add backend/providers/openrouter.py tests/test_openrouter.py
git commit -m "feat: OpenRouter chat provider"
```

---

### Task 5: Local fastembed embedding provider

**Files:**
- Create: `backend/providers/fastembed_local.py`
- Test: `tests/test_fastembed.py`

- [ ] **Step 1: Write the test** (integration-marked — downloads the model on first run; excluded from the default suite)

```python
# tests/test_fastembed.py
import pytest
from providers.fastembed_local import FastEmbedLocal


@pytest.mark.integration
def test_embed_returns_vectors_batched():
    emb = FastEmbedLocal(model_name="BAAI/bge-small-en-v1.5")
    vectors = emb.embed(["the meaning of life", "stoic philosophy"])
    assert len(vectors) == 2
    assert len(vectors[0]) == 384
    assert isinstance(vectors[0][0], float)
```

- [ ] **Step 2: Implement backend/providers/fastembed_local.py**

```python
"""Local embeddings via fastembed (ONNX, no API key). Model is lazy-loaded
on first embed call so importing this module stays cheap."""
from fastembed import TextEmbedding


class FastEmbedLocal:
    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        self.model_name = model_name
        self._model = None

    def embed(self, texts: list[str]) -> list[list[float]]:
        if self._model is None:
            self._model = TextEmbedding(model_name=self.model_name)
        return [list(map(float, v)) for v in self._model.embed(texts)]
```

- [ ] **Step 3: Run the integration test once to prove it works**

Run: `backend\venv\Scripts\python -m pytest tests/test_fastembed.py -v -m integration`
Expected: 1 passed (first run downloads ~130MB model; allow a few minutes)

- [ ] **Step 4: Verify it is excluded by default**

Run: `backend\venv\Scripts\python -m pytest tests/test_fastembed.py -v`
Expected: `1 deselected`

- [ ] **Step 5: Commit**

```bash
git add backend/providers/fastembed_local.py tests/test_fastembed.py
git commit -m "feat: local fastembed embedding provider"
```

---

### Task 6: Database bootstrap (schema + migrations)

**Files:**
- Create: `backend/db.py`
- Test: `tests/test_db.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_db.py
import sqlite3
from db import connect, init_db


def table_names(conn):
    rows = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    return {r["name"] for r in rows}


def test_init_creates_all_tables(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    assert {"figures", "ingestion_log", "sessions", "conversations", "messages", "schema_version"} <= table_names(conn)


def test_init_is_idempotent(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    init_db(conn)  # must not raise
    assert conn.execute("SELECT version FROM schema_version").fetchone()["version"] == 1


def test_foreign_keys_enforced(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    import pytest
    with pytest.raises(sqlite3.IntegrityError):
        conn.execute("INSERT INTO messages (conversation_id, role, content) VALUES ('nope', 'user', 'x')")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_db.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'db'`

- [ ] **Step 3: Implement backend/db.py**

```python
"""SQLite bootstrap. One connection per call site; row_factory=Row; FKs on."""
import sqlite3
from pathlib import Path

SCHEMA_VERSION = 1

SCHEMA = """
CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS figures (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('historical', 'creator')),
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    metadata TEXT NOT NULL DEFAULT '{}',
    persona_prompt TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingestion_log (
    figure_id TEXT NOT NULL,
    source_item_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'done', 'skipped', 'error')),
    detail TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (figure_id, source_item_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    figure_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    citations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
"""


def connect(db_path) -> sqlite3.Connection:
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA)
    if conn.execute("SELECT COUNT(*) AS c FROM schema_version").fetchone()["c"] == 0:
        conn.execute("INSERT INTO schema_version (version) VALUES (?)", (SCHEMA_VERSION,))
    conn.commit()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_db.py -v`
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add backend/db.py tests/test_db.py
git commit -m "feat: sqlite schema bootstrap for v2"
```

---

### Task 7: Figure registry with publish gate

**Files:**
- Create: `backend/registry.py`
- Test: `tests/test_registry.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_registry.py
import pytest
from db import connect, init_db
import registry


@pytest.fixture
def conn(tmp_path):
    c = connect(tmp_path / "t.db")
    init_db(c)
    return c


def test_create_and_get(conn):
    registry.create_figure(conn, id="aurelius", name="Marcus Aurelius", type="historical",
                           description="Roman emperor and Stoic", metadata={"era": "121-180 AD"})
    fig = registry.get_figure(conn, "aurelius")
    assert fig["name"] == "Marcus Aurelius"
    assert fig["status"] == "draft"
    assert fig["metadata"]["era"] == "121-180 AD"


def test_get_missing_raises(conn):
    with pytest.raises(registry.FigureNotFound):
        registry.get_figure(conn, "ghost")


def test_list_published_only_filters_drafts(conn):
    registry.create_figure(conn, id="a", name="A", type="historical")
    registry.create_figure(conn, id="b", name="B", type="creator")
    registry.update_figure(conn, "b", persona_prompt="You are B.")
    registry.publish(conn, "b", chunk_count=10)
    published = registry.list_figures(conn, published_only=True)
    assert [f["id"] for f in published] == ["b"]
    assert len(registry.list_figures(conn, published_only=False)) == 2


def test_publish_gate_requires_chunks_and_persona(conn):
    registry.create_figure(conn, id="a", name="A", type="creator")
    with pytest.raises(registry.PublishError):
        registry.publish(conn, "a", chunk_count=0)       # no corpus
    registry.update_figure(conn, "a", persona_prompt="")
    with pytest.raises(registry.PublishError):
        registry.publish(conn, "a", chunk_count=5)       # empty persona
    registry.update_figure(conn, "a", persona_prompt="You are A.")
    registry.publish(conn, "a", chunk_count=5)
    assert registry.get_figure(conn, "a")["status"] == "published"


def test_delete(conn):
    registry.create_figure(conn, id="a", name="A", type="historical")
    registry.delete_figure(conn, "a")
    with pytest.raises(registry.FigureNotFound):
        registry.get_figure(conn, "a")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_registry.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'registry'`

- [ ] **Step 3: Implement backend/registry.py**

```python
"""Dynamic figure registry. Figures are rows, not code."""
import json
import sqlite3


class FigureNotFound(Exception):
    pass


class PublishError(Exception):
    pass


def _row_to_figure(row: sqlite3.Row) -> dict:
    fig = dict(row)
    fig["metadata"] = json.loads(fig["metadata"])
    return fig


def create_figure(conn, *, id: str, name: str, type: str,
                  description: str = "", metadata: dict | None = None,
                  persona_prompt: str = "") -> dict:
    conn.execute(
        "INSERT INTO figures (id, name, type, description, metadata, persona_prompt) VALUES (?, ?, ?, ?, ?, ?)",
        (id, name, type, description, json.dumps(metadata or {}), persona_prompt),
    )
    conn.commit()
    return get_figure(conn, id)


def get_figure(conn, figure_id: str) -> dict:
    row = conn.execute("SELECT * FROM figures WHERE id = ?", (figure_id,)).fetchone()
    if row is None:
        raise FigureNotFound(figure_id)
    return _row_to_figure(row)


def list_figures(conn, *, published_only: bool = True) -> list[dict]:
    q = "SELECT * FROM figures"
    if published_only:
        q += " WHERE status = 'published'"
    q += " ORDER BY name"
    return [_row_to_figure(r) for r in conn.execute(q).fetchall()]


def update_figure(conn, figure_id: str, **fields) -> dict:
    allowed = {"name", "description", "persona_prompt", "metadata"}
    unknown = set(fields) - allowed
    if unknown:
        raise ValueError(f"Cannot update fields: {unknown}")
    get_figure(conn, figure_id)  # raises if missing
    for key, value in fields.items():
        if key == "metadata":
            value = json.dumps(value)
        conn.execute(f"UPDATE figures SET {key} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (value, figure_id))
    conn.commit()
    return get_figure(conn, figure_id)


def publish(conn, figure_id: str, *, chunk_count: int) -> dict:
    fig = get_figure(conn, figure_id)
    if chunk_count <= 0:
        raise PublishError(f"{figure_id}: no ingested chunks — ingest a corpus before publishing")
    if not fig["persona_prompt"].strip():
        raise PublishError(f"{figure_id}: persona_prompt is empty — generate and tune a persona first")
    conn.execute("UPDATE figures SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (figure_id,))
    conn.commit()
    return get_figure(conn, figure_id)


def unpublish(conn, figure_id: str) -> dict:
    get_figure(conn, figure_id)
    conn.execute("UPDATE figures SET status = 'draft', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (figure_id,))
    conn.commit()
    return get_figure(conn, figure_id)


def delete_figure(conn, figure_id: str) -> None:
    get_figure(conn, figure_id)
    conn.execute("DELETE FROM figures WHERE id = ?", (figure_id,))
    conn.commit()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_registry.py -v`
Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
git add backend/registry.py tests/test_registry.py
git commit -m "feat: dynamic figure registry with publish gate"
```

---

### Task 8: Conversation store (port, cleaned)

**Files:**
- Create: `backend/conversations.py`
- Delete: `backend/database.py` (superseded)
- Test: `tests/test_conversations.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_conversations.py
import pytest
from db import connect, init_db
import conversations as convo


@pytest.fixture
def conn(tmp_path):
    c = connect(tmp_path / "t.db")
    init_db(c)
    return c


def test_session_conversation_message_roundtrip(conn):
    sid = convo.create_session(conn, user_id="u1")
    cid = convo.get_or_create_conversation(conn, sid, "aurelius")
    assert convo.get_or_create_conversation(conn, sid, "aurelius") == cid  # idempotent
    convo.save_message(conn, cid, "user", "hello")
    convo.save_message(conn, cid, "assistant", "greetings", citations=[{"source": "meditations.txt"}])
    history = convo.get_history(conn, cid)
    assert [m["role"] for m in history] == ["user", "assistant"]
    assert history[1]["citations"][0]["source"] == "meditations.txt"


def test_history_limit_returns_most_recent(conn):
    sid = convo.create_session(conn)
    cid = convo.get_or_create_conversation(conn, sid, "f")
    for i in range(5):
        convo.save_message(conn, cid, "user", f"m{i}")
    history = convo.get_history(conn, cid, limit=2)
    assert [m["content"] for m in history] == ["m3", "m4"]


def test_delete_session_cascades(conn):
    sid = convo.create_session(conn)
    cid = convo.get_or_create_conversation(conn, sid, "f")
    convo.save_message(conn, cid, "user", "x")
    convo.delete_session(conn, sid)
    assert convo.get_history(conn, cid) == []
    assert convo.get_session_conversations(conn, sid) == []


def test_user_sessions_listing(conn):
    sid = convo.create_session(conn, user_id="u1", title="Chat A")
    cid = convo.get_or_create_conversation(conn, sid, "f")
    convo.save_message(conn, cid, "user", "x")
    sessions = convo.get_user_sessions(conn, "u1")
    assert sessions[0]["title"] == "Chat A"
    assert sessions[0]["message_count"] == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_conversations.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'conversations'`

- [ ] **Step 3: Implement backend/conversations.py**

Note the v1 bug fixed here: v1's `LIMIT n` on an ASC query returned the *oldest* n messages as "recent history". v2 takes the newest n, returned in chronological order.

```python
"""Conversation persistence: sessions -> conversations -> messages."""
import json
import uuid


def create_session(conn, user_id: str | None = None, title: str | None = None,
                   metadata: dict | None = None) -> str:
    session_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO sessions (id, user_id, title, metadata) VALUES (?, ?, ?, ?)",
        (session_id, user_id, title or "New Conversation", json.dumps(metadata) if metadata else None),
    )
    conn.commit()
    return session_id


def session_exists(conn, session_id: str) -> bool:
    return conn.execute("SELECT 1 FROM sessions WHERE id = ?", (session_id,)).fetchone() is not None


def get_or_create_conversation(conn, session_id: str, figure_id: str) -> str:
    row = conn.execute(
        "SELECT id FROM conversations WHERE session_id = ? AND figure_id = ?", (session_id, figure_id)
    ).fetchone()
    if row:
        return row["id"]
    conversation_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO conversations (id, session_id, figure_id) VALUES (?, ?, ?)",
        (conversation_id, session_id, figure_id),
    )
    conn.commit()
    return conversation_id


def save_message(conn, conversation_id: str, role: str, content: str,
                 citations: list[dict] | None = None) -> None:
    conn.execute(
        "INSERT INTO messages (conversation_id, role, content, citations) VALUES (?, ?, ?, ?)",
        (conversation_id, role, content, json.dumps(citations) if citations else None),
    )
    conn.execute("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (conversation_id,))
    conn.execute(
        "UPDATE sessions SET updated_at = CURRENT_TIMESTAMP "
        "WHERE id = (SELECT session_id FROM conversations WHERE id = ?)",
        (conversation_id,),
    )
    conn.commit()


def get_history(conn, conversation_id: str, limit: int | None = None) -> list[dict]:
    if limit is not None:
        rows = conn.execute(
            "SELECT * FROM (SELECT role, content, citations, created_at, id FROM messages "
            "WHERE conversation_id = ? ORDER BY id DESC LIMIT ?) ORDER BY id ASC",
            (conversation_id, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT role, content, citations, created_at, id FROM messages "
            "WHERE conversation_id = ? ORDER BY id ASC",
            (conversation_id,),
        ).fetchall()
    history = []
    for row in rows:
        msg = {"role": row["role"], "content": row["content"], "created_at": row["created_at"]}
        if row["citations"]:
            msg["citations"] = json.loads(row["citations"])
        history.append(msg)
    return history


def get_session_conversations(conn, session_id: str) -> list[dict]:
    rows = conn.execute(
        "SELECT c.id, c.figure_id, c.created_at, c.updated_at, COUNT(m.id) AS message_count "
        "FROM conversations c LEFT JOIN messages m ON c.id = m.conversation_id "
        "WHERE c.session_id = ? GROUP BY c.id ORDER BY c.updated_at DESC",
        (session_id,),
    ).fetchall()
    return [dict(r) for r in rows]


def get_user_sessions(conn, user_id: str, limit: int = 50) -> list[dict]:
    rows = conn.execute(
        "SELECT s.id, s.title, s.created_at, s.updated_at, s.metadata, "
        "COUNT(DISTINCT c.id) AS conversation_count, COUNT(m.id) AS message_count "
        "FROM sessions s LEFT JOIN conversations c ON s.id = c.session_id "
        "LEFT JOIN messages m ON c.id = m.conversation_id "
        "WHERE s.user_id = ? GROUP BY s.id ORDER BY s.updated_at DESC LIMIT ?",
        (user_id, limit),
    ).fetchall()
    sessions = []
    for row in rows:
        s = dict(row)
        s["metadata"] = json.loads(s["metadata"]) if s["metadata"] else None
        sessions.append(s)
    return sessions


def update_session_title(conn, session_id: str, title: str) -> None:
    conn.execute("UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (title, session_id))
    conn.commit()


def delete_session(conn, session_id: str) -> None:
    conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_conversations.py -v`
Expected: 4 passed

- [ ] **Step 5: Delete superseded v1 module and commit**

```bash
git rm backend/database.py
git add backend/conversations.py tests/test_conversations.py
git commit -m "feat: cleaned conversation store; fix recent-history LIMIT bug from v1"
```

---

### Task 9: Chunker (replaces LangChain splitter)

**Files:**
- Create: `backend/rag/chunker.py`
- Create: `backend/rag/__init__.py` (empty, if missing)
- Test: `tests/test_chunker.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_chunker.py
from rag.chunker import chunk_text


def test_short_text_is_single_chunk():
    assert chunk_text("hello world", chunk_size=100, overlap=10) == ["hello world"]


def test_splits_on_paragraphs_first():
    text = ("A" * 80) + "\n\n" + ("B" * 80)
    chunks = chunk_text(text, chunk_size=100, overlap=0)
    assert chunks == ["A" * 80, "B" * 80]


def test_respects_max_size():
    text = ". ".join(["sentence " + str(i) for i in range(200)])
    chunks = chunk_text(text, chunk_size=300, overlap=50)
    assert all(len(c) <= 300 for c in chunks)
    assert len(chunks) > 1


def test_overlap_carries_tail_context():
    text = ". ".join(["sentence " + str(i) for i in range(200)])
    chunks = chunk_text(text, chunk_size=300, overlap=50)
    # Each chunk after the first begins with the tail of the previous chunk
    for prev, cur in zip(chunks, chunks[1:]):
        assert cur[:10] in prev[-60:]


def test_no_empty_chunks():
    chunks = chunk_text("a\n\n\n\nb", chunk_size=1, overlap=0)
    assert all(c.strip() for c in chunks)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_chunker.py -v`
Expected: FAIL with `ModuleNotFoundError` (or ImportError against old rag package)

- [ ] **Step 3: Implement backend/rag/chunker.py**

```python
"""Recursive character chunking: split on the coarsest separator that fits,
then greedily pack pieces up to chunk_size with a tail overlap."""

SEPARATORS = ["\n\n", "\n", ". ", " "]


def chunk_text(text: str, *, chunk_size: int, overlap: int) -> list[str]:
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]
    pieces = _split(text, chunk_size)
    return _pack(pieces, chunk_size, overlap)


def _split(text: str, chunk_size: int) -> list[str]:
    if len(text) <= chunk_size:
        return [text]
    for sep in SEPARATORS:
        if sep in text:
            parts = [p for p in text.split(sep) if p.strip()]
            if len(parts) > 1:
                out = []
                for i, part in enumerate(parts):
                    if i < len(parts) - 1:
                        part = part + sep.rstrip(" ") if sep == ". " else part
                    out.extend(_split(part, chunk_size))
                return out
    # No separator worked: hard cut
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]


def _pack(pieces: list[str], chunk_size: int, overlap: int) -> list[str]:
    chunks: list[str] = []
    current = ""
    for piece in pieces:
        candidate = (current + " " + piece).strip() if current else piece
        if len(candidate) <= chunk_size:
            current = candidate
        else:
            if current:
                chunks.append(current)
            tail = current[-overlap:] if overlap and current else ""
            current = (tail + " " + piece).strip()
            if len(current) > chunk_size:
                chunks.append(current[:chunk_size])
                current = current[chunk_size - overlap if overlap else chunk_size:]
    if current.strip():
        chunks.append(current.strip())
    return [c for c in chunks if c.strip()]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_chunker.py -v`
Expected: 5 passed

- [ ] **Step 5: Commit**

```bash
git add backend/rag/chunker.py backend/rag/__init__.py tests/test_chunker.py
git commit -m "feat: standalone recursive chunker, no LangChain"
```

---

### Task 10: RAG engine (batched ingest, retrieval, generation)

**Files:**
- Create: `backend/rag/engine.py` (overwrite existing)
- Test: `tests/test_engine.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_engine.py
import chromadb
import pytest
from providers.fake import FakeChat, FakeEmbed
from rag.engine import RAGEngine, Chunk


@pytest.fixture
def engine():
    return RAGEngine(
        chroma=chromadb.EphemeralClient(),
        embedder=FakeEmbed(dim=8),
        chat=FakeChat(reply="Marcus says hello"),
        chat_model="test-model",
        temperature=0.5,
        max_tokens=100,
    )


def make_chunks():
    return [
        Chunk(id="meditations:0", text="You have power over your mind, not outside events.",
              metadata={"source": "meditations.txt"}),
        Chunk(id="meditations:1", text="The happiness of your life depends on the quality of your thoughts.",
              metadata={"source": "meditations.txt"}),
    ]


def test_ingest_is_batched_and_idempotent(engine):
    count = engine.ingest_chunks("aurelius", make_chunks())
    assert count == 2
    count = engine.ingest_chunks("aurelius", make_chunks())  # upsert, not duplicate
    assert engine.chunk_count("aurelius") == 2


def test_retrieve_returns_scored_chunks_with_metadata(engine):
    engine.ingest_chunks("aurelius", make_chunks())
    results = engine.retrieve("aurelius", "power over mind", k=2)
    assert len(results) == 2
    assert {"text", "metadata", "score"} <= set(results[0])
    assert results[0]["metadata"]["source"] == "meditations.txt"


def test_build_messages_puts_context_in_system_not_user(engine):
    context = [{"text": "ctx one", "metadata": {"source": "s"}, "score": 0.9}]
    messages = engine.build_messages(
        persona_prompt="You are Marcus Aurelius.",
        context=context,
        history=[{"role": "user", "content": "earlier"}, {"role": "assistant", "content": "reply"}],
        user_message="What is virtue?",
    )
    assert messages[0]["role"] == "system"
    assert "You are Marcus Aurelius." in messages[0]["content"]
    assert "ctx one" in messages[0]["content"]
    assert messages[-1] == {"role": "user", "content": "What is virtue?"}
    assert "ctx one" not in messages[-1]["content"]  # context never stuffed into user turns


async def test_stream_reply_yields_events(engine):
    engine.ingest_chunks("aurelius", make_chunks())
    events = [e async for e in engine.stream_reply(
        figure_id="aurelius", persona_prompt="You are Marcus.", user_message="hello", history=[], k=2
    )]
    assert events[0]["type"] == "citations"
    assert len(events[0]["citations"]) <= 3
    content = "".join(e["content"] for e in events if e["type"] == "content")
    assert content == "Marcus says hello"
    assert events[-1]["type"] == "end"
    assert events[-1]["full_response"] == "Marcus says hello"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_engine.py -v`
Expected: FAIL with ImportError (old engine has no RAGEngine constructor like this / no Chunk)

- [ ] **Step 3: Implement backend/rag/engine.py** (full overwrite)

```python
"""RAG engine: batched ingest into per-figure Chroma collections,
retrieval, and grounded generation with context in the system block."""
from dataclasses import dataclass
from typing import AsyncIterator

CONTEXT_HEADER = (
    "\n\n# Source material\n"
    "Ground your answer in these excerpts from your own words. If the question goes "
    "beyond them, say so in character rather than inventing specifics.\n"
)


@dataclass
class Chunk:
    id: str
    text: str
    metadata: dict


class RAGEngine:
    def __init__(self, *, chroma, embedder, chat, chat_model: str,
                 temperature: float, max_tokens: int):
        self.chroma = chroma
        self.embedder = embedder
        self.chat = chat
        self.chat_model = chat_model
        self.temperature = temperature
        self.max_tokens = max_tokens

    def _collection(self, figure_id: str):
        return self.chroma.get_or_create_collection(name=f"figure_{figure_id}")

    # --- Ingest ---

    def ingest_chunks(self, figure_id: str, chunks: list[Chunk]) -> int:
        if not chunks:
            return 0
        embeddings = self.embedder.embed([c.text for c in chunks])  # ONE batched call
        self._collection(figure_id).upsert(
            ids=[c.id for c in chunks],
            embeddings=embeddings,
            documents=[c.text for c in chunks],
            metadatas=[c.metadata for c in chunks],
        )
        return len(chunks)

    def chunk_count(self, figure_id: str) -> int:
        return self._collection(figure_id).count()

    # --- Retrieve ---

    def retrieve(self, figure_id: str, query: str, k: int) -> list[dict]:
        query_vec = self.embedder.embed([query])[0]
        res = self._collection(figure_id).query(
            query_embeddings=[query_vec], n_results=k,
            include=["documents", "metadatas", "distances"],
        )
        out = []
        if res["documents"] and res["documents"][0]:
            for doc, meta, dist in zip(res["documents"][0], res["metadatas"][0], res["distances"][0]):
                out.append({"text": doc, "metadata": meta, "score": 1 - dist})
        return out

    # --- Generate ---

    def build_messages(self, *, persona_prompt: str, context: list[dict],
                       history: list[dict], user_message: str) -> list[dict]:
        context_block = "\n\n".join(
            f"[{c['metadata'].get('source', 'unknown')}]\n{c['text']}" for c in context
        )
        system = persona_prompt + CONTEXT_HEADER + context_block
        messages = [{"role": "system", "content": system}]
        messages += [{"role": m["role"], "content": m["content"]} for m in history]
        messages.append({"role": "user", "content": user_message})
        return messages

    @staticmethod
    def citations_from(context: list[dict]) -> list[dict]:
        return [
            {
                "source": c["metadata"].get("source", "unknown"),
                "excerpt": c["text"][:200],
                "score": round(c["score"], 3),
                "metadata": c["metadata"],
            }
            for c in context[:3]
        ]

    async def stream_reply(self, *, figure_id: str, persona_prompt: str,
                           user_message: str, history: list[dict], k: int) -> AsyncIterator[dict]:
        context = self.retrieve(figure_id, user_message, k)
        yield {"type": "citations", "citations": self.citations_from(context)}
        messages = self.build_messages(
            persona_prompt=persona_prompt, context=context,
            history=history, user_message=user_message,
        )
        full = ""
        try:
            async for delta in self.chat.stream(
                messages, model=self.chat_model,
                temperature=self.temperature, max_tokens=self.max_tokens,
            ):
                full += delta
                yield {"type": "content", "content": delta}
        except Exception as exc:  # provider failure surfaces as an event, not a crash
            yield {"type": "error", "error": str(exc)}
            return
        yield {"type": "end", "full_response": full}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_engine.py -v`
Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add backend/rag/engine.py tests/test_engine.py
git commit -m "feat: rebuilt RAG engine — batched ingest, upsert ids, context in system block"
```

---

### Task 11: API schemas and FastAPI app

**Files:**
- Create: `backend/schemas.py`
- Create: `backend/deps.py`
- Create: `backend/main.py` (overwrite existing)
- Delete: `backend/models/schemas.py`, `backend/agents/figures.py` — but FIRST copy figures.py to `scripts/legacy_figures.py` (Task 12 seeds from it)
- Test: `tests/test_api.py`

- [ ] **Step 1: Preserve legacy figures for the seed task**

```bash
mkdir scripts
copy backend\agents\figures.py scripts\legacy_figures.py
git add scripts/legacy_figures.py
git commit -m "chore: preserve v1 figure prompts as seed data"
```

- [ ] **Step 2: Write the failing test**

```python
# tests/test_api.py
import pytest
from httpx import ASGITransport, AsyncClient

import deps
import registry
from db import connect, init_db
from providers.fake import FakeChat, FakeEmbed
from rag.engine import RAGEngine, Chunk
import chromadb


@pytest.fixture
def app(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    engine = RAGEngine(chroma=chromadb.EphemeralClient(), embedder=FakeEmbed(),
                       chat=FakeChat(reply="in character reply"),
                       chat_model="m", temperature=0.5, max_tokens=100)
    deps.override(conn=conn, engine=engine, admin_key="test-admin")
    # One published figure with corpus, one draft
    registry.create_figure(conn, id="aurelius", name="Marcus Aurelius", type="historical",
                           persona_prompt="You are Marcus Aurelius.")
    engine.ingest_chunks("aurelius", [Chunk(id="m:0", text="Waste no more time arguing what a good man should be. Be one.",
                                            metadata={"source": "meditations.txt"})])
    registry.publish(conn, "aurelius", chunk_count=1)
    registry.create_figure(conn, id="draftguy", name="Draft Guy", type="creator")
    from main import app as fastapi_app
    yield fastapi_app
    deps.reset()


@pytest.fixture
async def client(app):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


async def test_figures_lists_published_only(client):
    r = await client.get("/figures")
    assert r.status_code == 200
    ids = [f["id"] for f in r.json()]
    assert ids == ["aurelius"]


async def test_get_figure_404_for_draft(client):
    r = await client.get("/figures/draftguy")
    assert r.status_code == 404


async def test_chat_returns_reply_citations_and_session(client):
    r = await client.post("/chat", json={"figure": "aurelius", "message": "What is virtue?"})
    assert r.status_code == 200
    body = r.json()
    assert body["message"] == "in character reply"
    assert body["citations"][0]["source"] == "meditations.txt"
    sid = body["conversation_id"]
    # History persists across turns
    r2 = await client.post("/chat", json={"figure": "aurelius", "message": "Go on.", "conversation_id": sid})
    assert r2.json()["conversation_id"] == sid


async def test_chat_stream_sends_sse_events(client):
    async with client.stream("POST", "/chat/stream",
                             json={"figure": "aurelius", "message": "hello"}) as r:
        assert r.status_code == 200
        body = ""
        async for line in r.aiter_lines():
            body += line + "\n"
    assert '"type": "start"' in body
    assert '"type": "citations"' in body
    assert '"type": "content"' in body
    assert '"type": "end"' in body


async def test_chat_with_unknown_figure_404(client):
    r = await client.post("/chat", json={"figure": "ghost", "message": "hi"})
    assert r.status_code == 404


async def test_admin_requires_key(client):
    r = await client.post("/admin/figures", json={"id": "x", "name": "X", "type": "creator"})
    assert r.status_code == 401
    r = await client.post("/admin/figures", json={"id": "x", "name": "X", "type": "creator"},
                          headers={"X-Admin-Key": "test-admin"})
    assert r.status_code == 200
    assert r.json()["status"] == "draft"


async def test_admin_publish_gate_enforced(client):
    headers = {"X-Admin-Key": "test-admin"}
    await client.post("/admin/figures", json={"id": "empty", "name": "E", "type": "creator"}, headers=headers)
    r = await client.post("/admin/figures/empty/publish", headers=headers)
    assert r.status_code == 409  # no chunks, no persona


async def test_sessions_endpoints(client):
    r = await client.post("/chat", json={"figure": "aurelius", "message": "hi"})
    sid = r.json()["conversation_id"]
    r = await client.get(f"/sessions/{sid}/history")
    assert r.status_code == 200
    assert "aurelius" in r.json()["history"]
    r = await client.delete(f"/sessions/{sid}")
    assert r.status_code == 200
```

- [ ] **Step 3: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_api.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'deps'`

- [ ] **Step 4: Implement backend/deps.py**

App-level singletons with test override. FastAPI `Depends` would also work; this stays minimal and testable.

```python
"""Runtime dependencies (db connection, engine, admin key) with test overrides."""
import chromadb

from config import settings
from db import connect, init_db
from providers.fastembed_local import FastEmbedLocal
from providers.openrouter import OpenRouterChat
from rag.engine import RAGEngine

_state: dict = {}


def override(*, conn, engine, admin_key: str) -> None:
    _state.update(conn=conn, engine=engine, admin_key=admin_key)


def reset() -> None:
    _state.clear()


def get_conn():
    if "conn" not in _state:
        c = connect(settings.db_path)
        init_db(c)
        _state["conn"] = c
    return _state["conn"]


def get_engine() -> RAGEngine:
    if "engine" not in _state:
        _state["engine"] = RAGEngine(
            chroma=chromadb.PersistentClient(path=settings.chroma_dir),
            embedder=FastEmbedLocal(model_name=settings.embedding_model),
            chat=OpenRouterChat(api_key=settings.openrouter_api_key,
                                base_url=settings.openrouter_base_url),
            chat_model=settings.chat_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
        )
    return _state["engine"]


def get_admin_key() -> str:
    return _state.get("admin_key", settings.admin_api_key)
```

- [ ] **Step 5: Implement backend/schemas.py**

```python
"""API request/response models."""
from pydantic import BaseModel


class ChatRequest(BaseModel):
    figure: str
    message: str
    conversation_id: str | None = None
    include_citations: bool = True


class Citation(BaseModel):
    source: str
    excerpt: str
    score: float
    metadata: dict = {}


class ChatResponse(BaseModel):
    figure: str
    message: str
    citations: list[Citation] | None = None
    conversation_id: str


class FigureInfo(BaseModel):
    id: str
    name: str
    type: str
    description: str
    metadata: dict
    chunk_count: int


class FigureCreate(BaseModel):
    id: str
    name: str
    type: str
    description: str = ""
    metadata: dict = {}
    persona_prompt: str = ""


class FigureUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    metadata: dict | None = None
    persona_prompt: str | None = None
```

- [ ] **Step 6: Implement backend/main.py** (full overwrite)

```python
"""Symposium v2 API."""
import json
import logging

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import conversations as convo
import deps
import registry
from config import settings
from schemas import (ChatRequest, ChatResponse, Citation, FigureCreate,
                     FigureInfo, FigureUpdate)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Symposium API", version="2.0.0")
app.add_middleware(
    CORSMiddleware, allow_origins=settings.allowed_origins_list,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)


def _figure_info(fig: dict) -> FigureInfo:
    return FigureInfo(
        id=fig["id"], name=fig["name"], type=fig["type"],
        description=fig["description"], metadata=fig["metadata"],
        chunk_count=deps.get_engine().chunk_count(fig["id"]),
    )


def _published_figure_or_404(figure_id: str) -> dict:
    try:
        fig = registry.get_figure(deps.get_conn(), figure_id)
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")
    if fig["status"] != "published":
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")
    return fig


# --- Public: figures ---

@app.get("/figures", response_model=list[FigureInfo])
async def list_figures():
    return [_figure_info(f) for f in registry.list_figures(deps.get_conn(), published_only=True)]


@app.get("/figures/{figure_id}", response_model=FigureInfo)
async def get_figure(figure_id: str):
    return _figure_info(_published_figure_or_404(figure_id))


# --- Public: chat ---

def _prepare_turn(request: ChatRequest):
    """Shared setup for /chat and /chat/stream. Returns (fig, session_id, conversation_id, history)."""
    conn = deps.get_conn()
    fig = _published_figure_or_404(request.figure)
    session_id = request.conversation_id
    if not session_id or not convo.session_exists(conn, session_id):
        session_id = convo.create_session(conn)
    conversation_id = convo.get_or_create_conversation(conn, session_id, request.figure)
    history = [
        {"role": m["role"], "content": m["content"]}
        for m in convo.get_history(conn, conversation_id, limit=10)
    ]
    return fig, session_id, conversation_id, history


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    conn = deps.get_conn()
    engine = deps.get_engine()
    fig, session_id, conversation_id, history = _prepare_turn(request)

    full, citations = "", None
    async for event in engine.stream_reply(
        figure_id=fig["id"], persona_prompt=fig["persona_prompt"],
        user_message=request.message, history=history, k=settings.retrieval_k,
    ):
        if event["type"] == "citations":
            citations = event["citations"]
        elif event["type"] == "content":
            full += event["content"]
        elif event["type"] == "error":
            raise HTTPException(status_code=502, detail=event["error"])

    convo.save_message(conn, conversation_id, "user", request.message)
    convo.save_message(conn, conversation_id, "assistant", full, citations=citations)
    return ChatResponse(
        figure=fig["id"], message=full, conversation_id=session_id,
        citations=[Citation(**c) for c in citations] if request.include_citations and citations else None,
    )


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    conn = deps.get_conn()
    engine = deps.get_engine()
    fig, session_id, conversation_id, history = _prepare_turn(request)

    async def sse():
        yield f"data: {json.dumps({'type': 'start', 'conversation_id': session_id, 'figure': fig['id']})}\n\n"
        full, citations = "", None
        async for event in engine.stream_reply(
            figure_id=fig["id"], persona_prompt=fig["persona_prompt"],
            user_message=request.message, history=history, k=settings.retrieval_k,
        ):
            if event["type"] == "citations":
                citations = event["citations"]
                if request.include_citations:
                    yield f"data: {json.dumps({'type': 'citations', 'citations': citations})}\n\n"
            elif event["type"] == "content":
                full += event["content"]
                yield f"data: {json.dumps({'type': 'content', 'content': event['content']})}\n\n"
            elif event["type"] == "error":
                yield f"data: {json.dumps({'type': 'error', 'error': event['error']})}\n\n"
                return
            elif event["type"] == "end":
                convo.save_message(conn, conversation_id, "user", request.message)
                convo.save_message(conn, conversation_id, "assistant", full, citations=citations)
                yield f"data: {json.dumps({'type': 'end'})}\n\n"

    return StreamingResponse(sse(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# --- Public: sessions ---

@app.get("/sessions")
async def list_sessions(user_id: str = "default", limit: int = 50):
    return {"sessions": convo.get_user_sessions(deps.get_conn(), user_id, limit)}


@app.get("/sessions/{session_id}/history")
async def session_history(session_id: str):
    conn = deps.get_conn()
    history = {}
    for c in convo.get_session_conversations(conn, session_id):
        history[c["figure_id"]] = convo.get_history(conn, c["id"])
    return {"session_id": session_id, "history": history}


@app.put("/sessions/{session_id}/title")
async def rename_session(session_id: str, title: str):
    convo.update_session_title(deps.get_conn(), session_id, title)
    return {"session_id": session_id, "title": title}


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    convo.delete_session(deps.get_conn(), session_id)
    return {"deleted": session_id}


# --- Admin (X-Admin-Key header; disabled when no key configured) ---

def require_admin(x_admin_key: str = Header(default="")):
    expected = deps.get_admin_key()
    if not expected or x_admin_key != expected:
        raise HTTPException(status_code=401, detail="Admin key required")


@app.post("/admin/figures", dependencies=[Depends(require_admin)])
async def admin_create_figure(body: FigureCreate):
    try:
        return registry.create_figure(deps.get_conn(), **body.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@app.get("/admin/figures", dependencies=[Depends(require_admin)])
async def admin_list_figures():
    return registry.list_figures(deps.get_conn(), published_only=False)


@app.put("/admin/figures/{figure_id}", dependencies=[Depends(require_admin)])
async def admin_update_figure(figure_id: str, body: FigureUpdate):
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    try:
        return registry.update_figure(deps.get_conn(), figure_id, **fields)
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")


@app.post("/admin/figures/{figure_id}/publish", dependencies=[Depends(require_admin)])
async def admin_publish(figure_id: str):
    try:
        return registry.publish(deps.get_conn(), figure_id,
                                chunk_count=deps.get_engine().chunk_count(figure_id))
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")
    except registry.PublishError as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@app.post("/admin/figures/{figure_id}/unpublish", dependencies=[Depends(require_admin)])
async def admin_unpublish(figure_id: str):
    try:
        return registry.unpublish(deps.get_conn(), figure_id)
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")


@app.delete("/admin/figures/{figure_id}", dependencies=[Depends(require_admin)])
async def admin_delete(figure_id: str):
    try:
        registry.delete_figure(deps.get_conn(), figure_id)
        return {"deleted": figure_id}
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port)
```

- [ ] **Step 7: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_api.py -v`
Expected: 8 passed

- [ ] **Step 8: Delete superseded v1 modules, run full suite, commit**

```bash
git rm backend/models/schemas.py backend/agents/figures.py
```

(Remove the now-empty `backend/models/` and `backend/agents/` directories if nothing else remains; also delete `backend/init_vector_db.py` — superseded by the ingestion CLI in Task 13: `git rm backend/init_vector_db.py`.)

Run: `backend\venv\Scripts\python -m pytest`
Expected: all tests pass, none deselected except the fastembed integration test

```bash
git add backend/main.py backend/schemas.py backend/deps.py tests/test_api.py
git commit -m "feat: v2 API — dynamic figures, admin routes, SSE chat, sessions"
```

---

### Task 12: Seed script (migrate v1 figures as drafts)

**Files:**
- Create: `scripts/seed_v1_figures.py`
- Test: `tests/test_seed.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_seed.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

from db import connect, init_db
import registry
from seed_v1_figures import seed


def test_seed_creates_draft_figures(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    count = seed(conn)
    assert count >= 16
    figs = registry.list_figures(conn, published_only=False)
    assert all(f["status"] == "draft" for f in figs)
    einstein = registry.get_figure(conn, "einstein")
    assert einstein["type"] == "historical"
    assert "Einstein" in einstein["persona_prompt"]  # v1 prompt carried as placeholder


def test_seed_is_idempotent(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    seed(conn)
    seed(conn)  # second run must not raise or duplicate
    assert len(registry.list_figures(conn, published_only=False)) == len(set(
        f["id"] for f in registry.list_figures(conn, published_only=False)))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_seed.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'seed_v1_figures'`

- [ ] **Step 3: Implement scripts/seed_v1_figures.py**

```python
"""Seed the v2 registry from v1's hardcoded figures (scripts/legacy_figures.py).
All figures land as drafts: v1 prompts are placeholders until the Plan 2
persona generator re-derives them from each corpus."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
sys.path.insert(0, str(Path(__file__).parent))

import registry
from legacy_figures import FIGURE_REGISTRY


def seed(conn) -> int:
    count = 0
    for figure_id, fig in FIGURE_REGISTRY.items():
        try:
            registry.get_figure(conn, figure_id)
            continue  # already seeded
        except registry.FigureNotFound:
            pass
        registry.create_figure(
            conn,
            id=figure_id,
            name=fig.name,
            type="historical",
            description=fig.description,
            metadata={"era": fig.era, "fields": fig.fields, "categories": fig.categories},
            persona_prompt=fig.system_prompt,
        )
        count += 1
    return count


if __name__ == "__main__":
    from config import settings
    from db import connect, init_db
    conn = connect(settings.db_path)
    init_db(conn)
    print(f"Seeded {seed(conn)} figures as drafts")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python -m pytest tests/test_seed.py -v`
Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/seed_v1_figures.py tests/test_seed.py
git commit -m "feat: seed script migrating v1 figures to registry as drafts"
```

---

### Task 13: Files ingestion CLI

**Files:**
- Create: `ingestion/sources/__init__.py` (empty)
- Create: `ingestion/sources/files.py`
- Create: `ingestion/cli.py`
- Delete: `ingestion/ingest_figure.py`, `ingestion/chunkers/` (superseded)
- Test: `tests/test_files_source.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_files_source.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.sources.files import FilesSource


def test_loads_txt_and_md_with_metadata(tmp_path):
    (tmp_path / "meditations.txt").write_text("You have power over your mind.", encoding="utf-8")
    (tmp_path / "biography.md").write_text("# Marcus\n\nEmperor of Rome.", encoding="utf-8")
    (tmp_path / "notes.docx").write_text("ignored", encoding="utf-8")
    docs = list(FilesSource(tmp_path).documents())
    sources = {d.metadata["source"] for d in docs}
    assert sources == {"meditations.txt", "biography.md"}
    assert all(d.text.strip() for d in docs)
    assert all(d.item_id == d.metadata["source"] for d in docs)


def test_skips_empty_and_unreadable(tmp_path):
    (tmp_path / "empty.txt").write_text("", encoding="utf-8")
    docs = list(FilesSource(tmp_path).documents())
    assert docs == []
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python -m pytest tests/test_files_source.py -v`
Expected: FAIL with `ModuleNotFoundError`

- [ ] **Step 3: Implement ingestion/sources/files.py**

```python
"""Corpus source: local files (.txt, .md, .pdf). Yields Documents."""
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Document:
    item_id: str      # stable id for ingestion_log + chunk ids
    text: str
    metadata: dict


class FilesSource:
    EXTENSIONS = {".txt", ".md", ".pdf"}

    def __init__(self, directory):
        self.directory = Path(directory)

    def documents(self):
        for path in sorted(self.directory.rglob("*")):
            if not (path.is_file() and path.suffix.lower() in self.EXTENSIONS):
                continue
            try:
                text = self._read(path)
            except Exception as exc:
                print(f"  SKIP {path.name}: {exc}")
                continue
            if not text.strip():
                continue
            yield Document(
                item_id=path.name,
                text=text,
                metadata={"source": path.name, "file_type": path.suffix.lower()},
            )

    @staticmethod
    def _read(path: Path) -> str:
        if path.suffix.lower() == ".pdf":
            from pypdf import PdfReader
            return "\n\n".join((page.extract_text() or "") for page in PdfReader(str(path)).pages)
        return path.read_text(encoding="utf-8", errors="replace")
```

- [ ] **Step 4: Implement ingestion/cli.py**

```python
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
```

- [ ] **Step 5: Run tests, delete superseded v1 ingestion, commit**

Run: `backend\venv\Scripts\python -m pytest tests/test_files_source.py -v`
Expected: 2 passed

```bash
git rm ingestion/ingest_figure.py -r ingestion/chunkers
git add ingestion/
git commit -m "feat: files ingestion CLI with resumable ingestion_log"
```

---

### Task 14: Repo hygiene

**Files:**
- Delete: `.env` (from git and disk — key inside must be rotated by the operator), `nul`, `ingestion/sources/hitler/`, `ingestion/sources/stalin/`, redundant deploy docs
- Modify: `.gitignore`, rename `ingestion/sources/` → `ingestion/sources_data/` (avoid clash with the `ingestion.sources` Python package created in Task 13)

- [ ] **Step 1: Move corpus data out of the Python package directory**

Task 13 created `ingestion/sources/` as a Python package, but v1's corpus data folders also live there. Move ONLY the figure data subdirectories (`__init__.py` and `files.py` stay put):

```powershell
New-Item -ItemType Directory -Force ingestion/sources_data
$figures = "aurelius","caesar","churchill","confucius","darwin","douglass","einstein","franklin","hitler","machiavelli","napoleon","plato","roosevelt","stalin","suntzu","tesla"
foreach ($f in $figures) { git mv "ingestion/sources/$f" "ingestion/sources_data/$f" }
```

Verify afterward: `ingestion/sources/` contains only `__init__.py` and `files.py`.

- [ ] **Step 2: Remove controversial corpora and junk files**

```bash
git rm -r ingestion/sources_data/hitler ingestion/sources_data/stalin
del nul
git rm --cached .env
del .env
git rm CONNECT_CLOUDFLARE.md DEPLOY_CLOUDFLARE.md DEPLOY_NOW.md DEPLOY_SERVER.md QUICK_DEPLOY.md RAILWAY_DEPLOY.md RAILWAY_SETUP.md railway.json render.yaml
```

(`DEPLOYMENT.md` survives as the single deployment guide; it gets rewritten when deployment is actually revisited. If `del nul` fails on Windows, use: `Remove-Item "\\?\D:\Claude\Symposium\nul"` in PowerShell.)

- [ ] **Step 3: Verify .gitignore covers secrets and data**

`.gitignore` must contain (append any that are missing):

```
.env
data/
vector_db_data/
backend/venv/
__pycache__/
*.pyc
```

- [ ] **Step 4: Flag key rotation to the operator**

The removed `.env` contained a live API key. **Tell the user explicitly in the task report: the old key must be rotated at the provider dashboard** — deleting the file does not un-leak it from git history. (Full history scrub via `git filter-repo` is the operator's call — note it, don't do it.)

- [ ] **Step 5: Run full suite and commit**

Run: `backend\venv\Scripts\python -m pytest`
Expected: all pass

```bash
git add -A
git commit -m "chore: repo hygiene — remove .env, controversial corpora, dead deploy docs"
```

---

### Task 15: End-to-end verification (manual, real providers)

No new files. Proves the walking skeleton with a real historical figure.

- [ ] **Step 1: Configure environment**

Create a fresh `.env` in the repo root (never committed) with a NEW OpenRouter key:

```
OPENROUTER_API_KEY=sk-or-...
```

- [ ] **Step 2: Seed and ingest Marcus Aurelius**

```bash
backend\venv\Scripts\python scripts\seed_v1_figures.py
backend\venv\Scripts\python ingestion\cli.py files --figure aurelius --source-dir ingestion\sources_data\aurelius
```

Expected: `Summary: 2 done, 0 skipped, 0 errors` and a nonzero total chunk count (meditations.txt is ~425KB → roughly 400+ chunks; first run downloads the fastembed model).

- [ ] **Step 3: Publish via admin API**

Set `ADMIN_API_KEY=localdev` in `.env`, start the server:

```bash
backend\venv\Scripts\python backend\main.py
```

In a second terminal:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/admin/figures/aurelius/publish -Headers @{"X-Admin-Key"="localdev"}
```

Expected: JSON with `"status": "published"`.

- [ ] **Step 4: Chat and verify grounding**

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/chat -ContentType "application/json" -Body '{"figure": "aurelius", "message": "How should I deal with a difficult colleague?"}'
```

Expected: an in-character response; `citations` present with `source: meditations.txt` entries. Then verify streaming works:

```powershell
curl.exe -N -X POST http://localhost:8000/chat/stream -H "Content-Type: application/json" -d '{\"figure\": \"aurelius\", \"message\": \"What is death?\"}'
```

Expected: SSE events (`start`, `citations`, `content`×N, `end`).

- [ ] **Step 5: Report results to the user** — including sample response text so they can judge persona quality, and commit nothing (this task produces no code).

---

## Not in this plan (deliberate)

- **YouTube source, caption cleanup, persona generator, transcripts JSONL** → Plan 2 (`2026-07-XX-symposium-v2-creator-pipeline.md`), written after this plan lands so it targets the real interfaces. The `ingestion_log` and `Chunk`/`Document`/source-adapter shapes here were designed for it.
- **Frontend redesign** → Plan 3, blocked on the operator's Claude Design mockups. The v1 frontend will be broken against the new API on this branch until then; `/chat` and `/chat/stream` shapes stay close to v1 to minimize rework.
- **Eval harness** → folded into Plan 2 alongside the persona generator (it judges persona quality, which doesn't exist until then).
- **Gutenberg download-on-demand script** (spec §6, large sources out of git) → Plan 2, with the corpus data reorganization.
