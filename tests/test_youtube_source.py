# tests/test_youtube_source.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from ingestion.sources.youtube import YouTubeSource, looks_multi_speaker


class FakeLister:
    def __init__(self, videos):
        self._videos = videos

    def list_videos(self, channel_url, max_videos, min_duration):
        return [v for v in self._videos[:max_videos] if v["duration"] >= min_duration]


class FakeTranscripts:
    def __init__(self, transcripts):
        self._t = transcripts

    def fetch(self, video_id):
        if video_id not in self._t:
            raise LookupError(f"no captions for {video_id}")
        return self._t[video_id]


VIDEOS = [
    {"id": "v1", "title": "My morning routine", "url": "https://youtu.be/v1", "duration": 600, "upload_date": "20260101"},
    {"id": "v2", "title": "Podcast ft. Joe Guest", "url": "https://youtu.be/v2", "duration": 3600, "upload_date": "20260201"},
    {"id": "v3", "title": "No captions here", "url": "https://youtu.be/v3", "duration": 300, "upload_date": "20260301"},
    {"id": "shorts", "title": "quick clip", "url": "https://youtu.be/s", "duration": 45, "upload_date": "20260310"},
]

TRANSCRIPTS = {
    "v1": [{"text": "welcome back to the channel.", "start": 0.0, "duration": 2.0}],
    "v2": [{"text": "today my guest is Joe.", "start": 0.0, "duration": 2.0}],
}


def make_source(**kwargs):
    return YouTubeSource("https://youtube.com/@creator", lister=FakeLister(VIDEOS),
                        transcripts=FakeTranscripts(TRANSCRIPTS), **kwargs)


def test_multi_speaker_heuristic():
    assert looks_multi_speaker("Podcast ft. Joe Guest")
    assert looks_multi_speaker("Interview with Alice")
    assert looks_multi_speaker("chatting w/ bob")
    assert not looks_multi_speaker("My morning routine")


def test_yields_documents_with_video_metadata_and_segments():
    docs = list(make_source().documents())
    ids = [d.item_id for d in docs]
    assert ids == ["v1"]  # v2 multi-speaker, v3 captionless, shorts under min_duration
    d = docs[0]
    assert d.metadata["source"] == "My morning routine"
    assert d.metadata["video_id"] == "v1"
    assert d.metadata["url"] == "https://youtu.be/v1"
    assert d.text.startswith("welcome back")
    assert d.metadata["segments"][0]["start"] == 0.0


def test_skips_are_reported():
    source = make_source()
    list(source.documents())
    reasons = dict(source.skipped)
    assert "multi-speaker title" in reasons["v2"]
    assert "no captions" in reasons["v3"]


def test_allowlist_overrides_multi_speaker_skip():
    docs = list(make_source(include_ids={"v2"}).documents())
    assert "v2" in [d.item_id for d in docs]


def test_exclude_ids():
    docs = list(make_source(exclude_ids={"v1"}).documents())
    assert docs == []
