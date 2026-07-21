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
