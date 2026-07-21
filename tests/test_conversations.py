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
