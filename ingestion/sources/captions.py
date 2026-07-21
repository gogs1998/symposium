"""Caption cleanup: raw YouTube caption segments -> clean merged segments.

Input segments: {text, start, duration}. Output: {text, start} where text is
a sentence-ish merged unit and start is the timestamp of its first fragment.
"""
import re

TAG_RE = re.compile(r"\[[^\]]{1,30}\]")          # [Music], [Applause], [Laughter]
WS_RE = re.compile(r"\s+")
SENTENCE_END_RE = re.compile(r"[.!?][\"')\]]?$")


def _normalize(text: str) -> str:
    text = TAG_RE.sub(" ", text)
    return WS_RE.sub(" ", text).strip()


def clean_segments(segments: list[dict], *, target_chars: int = 300) -> list[dict]:
    """Merge caption fragments into sentence-ish units.

    A unit closes when it ends with sentence punctuation, or exceeds
    target_chars (auto-captions often lack punctuation entirely).
    """
    out: list[dict] = []
    buf, buf_start, prev_text = "", None, None
    for segment in segments:
        text = _normalize(segment["text"])
        if not text:
            continue
        if text == prev_text:  # auto-caption duplication artifact
            if buf:
                out.append({"text": buf, "start": buf_start})
                buf, buf_start = "", None
            continue
        prev_text = text
        if buf_start is None:
            buf_start = segment["start"]
        buf = f"{buf} {text}".strip() if buf else text
        if SENTENCE_END_RE.search(buf) or len(buf) >= target_chars:
            out.append({"text": buf, "start": buf_start})
            buf, buf_start = "", None
    if buf:
        out.append({"text": buf, "start": buf_start})
    return out
