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
    engine = RAGEngine(chroma=chromadb.PersistentClient(path=str(tmp_path / "chroma")), embedder=FakeEmbed(),
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
