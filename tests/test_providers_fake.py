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
