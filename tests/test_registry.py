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
