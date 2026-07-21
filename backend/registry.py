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
