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


def _new_chroma():
    return chromadb.PersistentClient(path=settings.chroma_dir)


def get_engine() -> RAGEngine:
    if "engine" not in _state:
        _state["engine"] = RAGEngine(
            chroma=_new_chroma(),
            chroma_factory=_new_chroma,   # lets the engine self-heal stale segment readers
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
