# tests/test_generate_persona.py
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))
sys.path.insert(0, str(Path(__file__).parent.parent))

import registry
from db import connect, init_db
from generate_persona import gather_documents, run_generate, run_apply
from tests.test_persona_synthesize import VALID_PROFILE
from tests.test_persona_extract import ScriptedChat, DOC_NOTES


def test_gather_documents_from_files_dir(tmp_path):
    (tmp_path / "meditations.txt").write_text("You have power over your mind.", encoding="utf-8")
    docs = gather_documents(files_dir=tmp_path, jsonl_path=None)
    assert docs[0][0] == "meditations.txt"
    assert "power over" in docs[0][1]


def test_gather_documents_from_jsonl(tmp_path):
    jsonl = tmp_path / "transcripts.jsonl"
    record = {"video_id": "v1", "title": "My video", "url": "u", "upload_date": "20260101",
              "duration": 60, "segments": [{"text": "hello world.", "start": 0.0}]}
    jsonl.write_text(json.dumps(record) + "\n", encoding="utf-8")
    docs = gather_documents(files_dir=None, jsonl_path=jsonl)
    assert docs[0][0] == "My video"
    assert docs[0][1] == "hello world."


async def test_run_generate_writes_profile_and_draft(tmp_path):
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "meditations.txt").write_text("You have power over your mind.", encoding="utf-8")
    chat = ScriptedChat([json.dumps(DOC_NOTES), json.dumps(VALID_PROFILE)])
    out = await run_generate(chat, model="m", figure_id="aurelius", display_name="Marcus Aurelius",
                             figure_type="historical", files_dir=tmp_path / "src",
                             jsonl_path=None, out_dir=tmp_path / "out")
    assert (tmp_path / "out" / "persona.profile.json").exists()
    draft = (tmp_path / "out" / "persona.draft.md").read_text(encoding="utf-8")
    assert "# Who you are" in draft and "Negative visualization" in draft
    assert out.display_name == "Marcus Aurelius"


def test_run_apply_updates_registry_from_profile(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    registry.create_figure(conn, id="aurelius", name="Marcus Aurelius", type="historical")
    out_dir = tmp_path / "out"
    out_dir.mkdir()
    (out_dir / "persona.profile.json").write_text(json.dumps(VALID_PROFILE), encoding="utf-8")
    run_apply(conn, figure_id="aurelius", out_dir=out_dir, from_draft=False)
    fig = registry.get_figure(conn, "aurelius")
    assert "# Who you are" in fig["persona_prompt"]
    assert "Marcus Aurelius" in fig["persona_prompt"]


def test_run_apply_from_draft_takes_md_verbatim(tmp_path):
    conn = connect(tmp_path / "t.db")
    init_db(conn)
    registry.create_figure(conn, id="a", name="A", type="creator")
    out_dir = tmp_path / "out"
    out_dir.mkdir()
    (out_dir / "persona.draft.md").write_text("HAND TUNED PROMPT", encoding="utf-8")
    run_apply(conn, figure_id="a", out_dir=out_dir, from_draft=True)
    assert registry.get_figure(conn, "a")["persona_prompt"] == "HAND TUNED PROMPT"
