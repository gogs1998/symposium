# tests/test_config.py
from config import Settings


def test_defaults_load_without_env():
    s = Settings(_env_file=None)
    assert s.chat_model == "google/gemini-2.5-flash"
    assert s.embedding_model == "BAAI/bge-small-en-v1.5"
    assert s.retrieval_k == 6
    assert s.admin_api_key == ""  # empty means admin routes disabled


def test_env_overrides(monkeypatch):
    monkeypatch.setenv("CHAT_MODEL", "deepseek/deepseek-chat-v3")
    s = Settings(_env_file=None)
    assert s.chat_model == "deepseek/deepseek-chat-v3"
