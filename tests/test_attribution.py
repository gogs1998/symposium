# tests/test_attribution.py
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from ingestion.attribution import attribute_host_segments, windows
from tests.test_persona_extract import ScriptedChat


def seg(i):
    return {"text": f"segment {i}.", "start": float(i)}


def test_windows_split_with_overlap():
    segments = [seg(i) for i in range(150)]
    ws = list(windows(segments, size=60, overlap=5))
    assert len(ws) == 3
    first_start, first_items = ws[0]
    assert first_start == 0 and len(first_items) == 60
    second_start, second_items = ws[1]
    assert second_start == 55         # 60 - overlap
    third_start, _ = ws[2]
    assert third_start == 110


async def test_attribute_keeps_only_host_segments():
    segments = [seg(i) for i in range(4)]
    # model says indices 0 and 2 are host (window-relative)
    chat = ScriptedChat([json.dumps({"host_indices": [0, 2]})])
    kept = await attribute_host_segments(chat, model="m", host_name="Joe Rogan",
                                         title="JRE #100 - Guest", segments=segments,
                                         window_size=60, overlap=5)
    assert [s["start"] for s in kept] == [0.0, 2.0]
    sent = chat.calls[0]["messages"][-1]["content"]
    assert "Joe Rogan" in sent and "segment 3." in sent


async def test_attribute_multiwindow_dedupes_overlap():
    segments = [seg(i) for i in range(80)]
    chat = ScriptedChat([
        json.dumps({"host_indices": list(range(0, 60, 2))}),   # window 1: evens 0..58
        json.dumps({"host_indices": [0, 1]}),                  # window 2 starts at 55 -> global 55, 56
    ])
    kept = await attribute_host_segments(chat, model="m", host_name="H", title="t",
                                         segments=segments, window_size=60, overlap=5)
    starts = [s["start"] for s in kept]
    assert 56.0 in starts and 55.0 not in starts or 55.0 in starts  # overlap region resolved once
    assert len(starts) == len(set(starts))                          # no duplicates


async def test_attribute_bad_json_keeps_window_conservatively_empty():
    segments = [seg(i) for i in range(3)]
    chat = ScriptedChat(["not json", "still not json"])
    kept = await attribute_host_segments(chat, model="m", host_name="H", title="t",
                                         segments=segments, window_size=60, overlap=5)
    assert kept == []   # one repair retry, then drop the window (never guess)


async def test_guest_role_uses_guest_cues():
    segments = [seg(i) for i in range(3)]
    chat = ScriptedChat([json.dumps({"host_indices": [1]})])
    kept = await attribute_host_segments(chat, model="m", host_name="Elon Musk",
                                         title="JRE #1169 - Elon Musk", segments=segments,
                                         window_size=60, overlap=5, role="guest")
    assert [s["start"] for s in kept] == [1.0]
    sent = chat.calls[0]["messages"][-1]["content"]
    assert "target is the GUEST" in sent
    assert "ad reads" in sent  # host-cue line describing who the target is NOT
