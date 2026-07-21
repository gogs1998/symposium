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
