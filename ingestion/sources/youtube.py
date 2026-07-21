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


class YouTubeSource:
    def __init__(self, channel_url: str, *, lister=None, transcripts=None,
                 max_videos: int = 100, min_duration: int = 120,
                 include_ids: set[str] | None = None, exclude_ids: set[str] | None = None):
        self.channel_url = channel_url
        self.lister = lister or YtDlpLister()
        self.transcripts = transcripts or TranscriptApiFetcher()
        self.max_videos = max_videos
        self.min_duration = min_duration
        self.include_ids = include_ids or set()
        self.exclude_ids = exclude_ids or set()
        self.skipped: list[tuple[str, str]] = []   # (video_id, reason)

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
