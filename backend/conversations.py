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
