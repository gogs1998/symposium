"""Corpus source: a YouTube channel's captions. Captions-only v1 (spec §4):
no diarization — captionless videos are skipped, multi-speaker-looking videos
are skipped unless explicitly allow-listed by the operator.
"""
import re

from ingestion.sources.captions import clean_segments
from ingestion.sources.files import Document

# NOTE: `w/` is handled by its own alternative without a trailing \b — a
# trailing \b after "/" (a non-word char) never matches before whitespace,
# which would drop "chatting w/ bob" (deviation from spec regex; see report).
MULTI_SPEAKER_RE = re.compile(r"\bw/|\b(ft\.?|feat\.?|podcast|interview|versus|vs\.?)\b", re.IGNORECASE)


def looks_multi_speaker(title: str) -> bool:
    return bool(MULTI_SPEAKER_RE.search(title))


class YtDlpLister:
    """Video listing via yt-dlp flat extraction (no downloads, no API key)."""

    def list_videos(self, channel_url: str, max_videos: int, min_duration: int) -> list[dict]:
        import yt_dlp
        opts = {"extract_flat": True, "quiet": True, "playlistend": max_videos * 2}
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(f"{channel_url.rstrip('/')}/videos", download=False)
        videos = []
        for entry in (info.get("entries") or []):
            duration = entry.get("duration") or 0
            if duration < min_duration:
                continue
            videos.append({
                "id": entry["id"],
                "title": entry.get("title", ""),
                "url": entry.get("url") or f"https://www.youtube.com/watch?v={entry['id']}",
                "duration": duration,
                "upload_date": entry.get("upload_date", ""),
            })
            if len(videos) >= max_videos:
                break
        return videos


class TranscriptApiFetcher:
    """Caption fetch via youtube-transcript-api; prefers manual over auto."""

    def fetch(self, video_id: str) -> list[dict]:
        from youtube_transcript_api import YouTubeTranscriptApi
        fetched = YouTubeTranscriptApi().fetch(video_id, languages=["en", "en-US", "en-GB"])
        return [{"text": s.text, "start": s.start, "duration": s.duration} for s in fetched]


def parse_json3(data: dict) -> list[dict]:
    """YouTube timedtext json3 -> caption segments {text, start, duration}."""
    segments = []
    for event in data.get("events", []):
        text = "".join(seg.get("utf8", "") for seg in event.get("segs") or []).strip()
        if not text:
            continue
        segments.append({
            "text": text,
            "start": event.get("tStartMs", 0) / 1000.0,
            "duration": event.get("dDurationMs", 0) / 1000.0,
        })
    return segments


class YtDlpCaptionFetcher:
    """Caption fetch via yt-dlp's timedtext extraction — a different YouTube
    endpoint than youtube-transcript-api, so it keeps working when YouTube
    IP-blocks the transcript API. Manual subtitles preferred over auto."""

    LANGS = ["en", "en-US", "en-GB", "en-orig"]

    def fetch(self, video_id: str) -> list[dict]:
        import json
        import urllib.request
        import yt_dlp
        opts = {"quiet": True, "skip_download": True,
                "writesubtitles": True, "writeautomaticsub": True}
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
        for pool_name in ("subtitles", "automatic_captions"):
            pool = info.get(pool_name) or {}
            for lang in self.LANGS:
                url = next((f["url"] for f in pool.get(lang) or [] if f.get("ext") == "json3"), None)
                if url:
                    with urllib.request.urlopen(url) as resp:
                        return parse_json3(json.loads(resp.read().decode("utf-8")))
        raise LookupError(f"no captions found via yt-dlp for {video_id}")


class ChainedFetcher:
    """Try fetchers in order; raise with all reasons if every one fails."""

    def __init__(self, fetchers):
        self.fetchers = fetchers

    def fetch(self, video_id: str) -> list[dict]:
        errors = []
        for fetcher in self.fetchers:
            try:
                return fetcher.fetch(video_id)
            except Exception as exc:
                errors.append(f"{type(fetcher).__name__}: {str(exc)[:120]}")
        raise LookupError("; ".join(errors))


class YouTubeSource:
    def __init__(self, channel_url: str, *, lister=None, transcripts=None,
                 max_videos: int = 100, min_duration: int = 120,
                 include_ids: set[str] | None = None, exclude_ids: set[str] | None = None,
                 sleep_between: float = 0.0):
        self.channel_url = channel_url
        self.lister = lister or YtDlpLister()
        self.transcripts = transcripts or ChainedFetcher(
            [TranscriptApiFetcher(), YtDlpCaptionFetcher()])
        self.max_videos = max_videos
        self.min_duration = min_duration
        self.include_ids = include_ids or set()
        self.exclude_ids = exclude_ids or set()
        self.sleep_between = sleep_between   # seconds between caption fetches (YouTube politeness)
        self.skipped: list[tuple[str, str]] = []   # (video_id, reason)
        self._fetched_any = False

    def documents(self):
        videos = self.lister.list_videos(self.channel_url, self.max_videos, self.min_duration)
        for video in videos:
            vid = video["id"]
            if vid in self.exclude_ids:
                self.skipped.append((vid, "operator exclude list"))
                continue
            if looks_multi_speaker(video["title"]) and vid not in self.include_ids:
                self.skipped.append((vid, f"multi-speaker title: {video['title']!r} (allow-list to include)"))
                continue
            try:
                if self.sleep_between and self._fetched_any:
                    import time
                    time.sleep(self.sleep_between)
                self._fetched_any = True
                raw = self.transcripts.fetch(vid)
            except Exception as exc:
                self.skipped.append((vid, f"no captions: {exc}"))
                continue
            segments = clean_segments(raw)
            if not segments:
                self.skipped.append((vid, "empty transcript after cleanup"))
                continue
            yield Document(
                item_id=vid,
                text=" ".join(s["text"] for s in segments),
                metadata={
                    "source": video["title"],
                    "video_id": vid,
                    "url": video["url"],
                    "upload_date": video["upload_date"],
                    "duration": video["duration"],
                    "segments": segments,
                },
            )
