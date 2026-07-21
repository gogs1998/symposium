# tests/test_captions.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.sources.captions import clean_segments


def seg(text, start, duration=2.0):
    return {"text": text, "start": start, "duration": duration}


def test_strips_bracket_tags_and_empties():
    out = clean_segments([seg("[Music]", 0.0), seg("hello there", 2.0), seg("[Applause]", 4.0)])
    assert [s["text"] for s in out] == ["hello there"]


def test_merges_fragments_into_sentences_keeping_first_start():
    out = clean_segments([
        seg("so today we're going to", 0.0),
        seg("talk about stoicism.", 2.1),
        seg("it changed my life.", 4.0),
    ], target_chars=60)
    assert out[0]["text"] == "so today we're going to talk about stoicism."
    assert out[0]["start"] == 0.0
    assert out[1]["text"] == "it changed my life."
    assert out[1]["start"] == 4.0


def test_deduplicates_consecutive_repeats():
    out = clean_segments([seg("hello world", 0.0), seg("hello world", 1.5), seg("goodbye", 3.0)])
    assert [s["text"] for s in out] == ["hello world", "goodbye"]


def test_collapses_whitespace_and_newlines():
    out = clean_segments([seg("hello\n  world", 0.0)])
    assert out[0]["text"] == "hello world"
