# tests/test_attribute_host_script.py
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.attribute_host import run
from tests.test_persona_extract import ScriptedChat


def _write_jsonl(path, records):
    with path.open("w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")


def _record(vid):
    return {
        "video_id": vid,
        "title": f"Title {vid}",
        "url": f"https://youtu.be/{vid}",
        "upload_date": "20260101",
        "duration": 100,
        "segments": [
            {"text": "host line one.", "start": 0.0},
            {"text": "guest line.", "start": 5.0},
            {"text": "host line two.", "start": 10.0},
        ],
    }


async def test_run_writes_host_only_jsonl(tmp_path):
    src = tmp_path / "transcripts.jsonl"
    _write_jsonl(src, [_record("v1"), _record("v2")])
    # model keeps indices 0 and 2 for each video (2 videos -> 2 replies)
    chat = ScriptedChat([
        json.dumps({"host_indices": [0, 2]}),
        json.dumps({"host_indices": [0, 2]}),
    ])
    out = await run(chat, model="m", jsonl_path=src, host_name="Joe Rogan",
                    hints="", window_size=60, overlap=5)

    assert out == tmp_path / "transcripts.host.jsonl"
    lines = out.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 2
    rec = json.loads(lines[0])
    assert rec["video_id"] == "v1"
    assert [s["start"] for s in rec["segments"]] == [0.0, 10.0]
    assert rec["attribution"] == {"kept": 2, "total": 3}
    # other record shape preserved
    assert rec["title"] == "Title v1"
    assert rec["url"] == "https://youtu.be/v1"
