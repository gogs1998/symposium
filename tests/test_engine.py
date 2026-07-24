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
    assert "Respond as Marcus Aurelius, never as an AI assistant persona" in system
    assert "never quote, repeat, echo, or mention" in system
    assert system.index("ctx") < system.index("never as an AI assistant persona")
