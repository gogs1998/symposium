# tests/test_files_source.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.sources.files import FilesSource


def test_loads_txt_and_md_with_metadata(tmp_path):
    (tmp_path / "meditations.txt").write_text("You have power over your mind.", encoding="utf-8")
    (tmp_path / "biography.md").write_text("# Marcus\n\nEmperor of Rome.", encoding="utf-8")
    (tmp_path / "notes.docx").write_text("ignored", encoding="utf-8")
    docs = list(FilesSource(tmp_path).documents())
    sources = {d.metadata["source"] for d in docs}
    assert sources == {"meditations.txt", "biography.md"}
    assert all(d.text.strip() for d in docs)
    assert all(d.item_id == d.metadata["source"] for d in docs)


def test_skips_empty_and_unreadable(tmp_path):
    (tmp_path / "empty.txt").write_text("", encoding="utf-8")
    docs = list(FilesSource(tmp_path).documents())
    assert docs == []
