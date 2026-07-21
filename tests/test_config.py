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


def test_storage_paths_anchored_to_repo_root_not_cwd(monkeypatch, tmp_path):
    from pathlib import Path
    from config import BASE_DIR

    monkeypatch.chdir(tmp_path)  # simulate running from anywhere (e.g. backend/)
    s = Settings(_env_file=None)
    assert Path(s.db_path).is_absolute()
    assert Path(s.db_path) == BASE_DIR / "data" / "symposium.db"
    assert Path(s.chroma_dir) == BASE_DIR / "data" / "chroma"
