"""LLM speaker attribution for podcast-format caption transcripts.

Multi-speaker caption transcripts (e.g. Joe Rogan) carry no speaker labels and
no audio for diarization. To build a faithful persona we must keep only the
HOST's speech. This module runs a cheap-model labeling pass over caption
segments in overlapping windows: the model returns the window-relative indices
spoken by the host; everything else (guest / other / unknown) is dropped.

Conservative by design: on repeated invalid JSON for a window we drop that
window's segments rather than guess — unattributed speech never leaks in.
"""
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from persona.extract import parse_model_json

logger = logging.getLogger(__name__)

PROMPT = """\
You are labeling speaker turns in a podcast caption transcript. The captions have
NO speaker labels. Your job is to identify which lines are spoken by the TARGET
speaker, {host_name}, versus anyone else.

Video title: {title}

{cues}
{hints}
Below are numbered caption segments. Return ONLY a JSON object of the form
{{"host_indices": [i, j, ...]}} listing the indices (as shown) spoken by
{host_name}. Include only lines you are confident are the target. Return no prose.

SEGMENTS:
{listing}"""

HOST_CUES = """\
Strong cues — the target is the HOST:
- The host asks the questions and steers the conversation.
- The host addresses the producer/crew and does ad reads, intros, and outros.
- Guests answer questions and tell their own stories."""

GUEST_CUES = """\
Strong cues — the target is the GUEST:
- The guest answers questions at length about their own life, work, and opinions.
- The HOST (not the target) asks the questions, does intros, outros, and ad reads.
- The guest's speech centers on their own projects and experiences."""


def windows(segments, size, overlap):
    """Yield (global_start_index, window_segments), stepping by size - overlap.

    The last `overlap` segments of each window are repeated as the leading
    context of the next, so the model always sees a bit of the prior speaker.
    """
    if size <= 0:
        raise ValueError("size must be positive")
    step = size - overlap
    if step <= 0:
        raise ValueError("overlap must be smaller than size")
    n = len(segments)
    start = 0
    while start < n:
        yield start, segments[start:start + size]
        if start + size >= n:
            break
        start += step


def _listing(window_segments) -> str:
    return "\n".join(f"[{i}] {s['text']}" for i, s in enumerate(window_segments))


async def _host_indices(chat, *, model, prompt) -> list[int] | None:
    """One repair retry on invalid JSON; None means give up on this window."""
    messages = [{"role": "user", "content": prompt}]
    for attempt in range(2):
        raw = await chat.complete(messages, model=model, temperature=0.0, max_tokens=2000)
        try:
            data = parse_model_json(raw)
            indices = data.get("host_indices", [])
            return [int(i) for i in indices]
        except (ValueError, TypeError, AttributeError):
            if attempt == 0:
                messages = messages + [
                    {"role": "assistant", "content": raw},
                    {"role": "user", "content": 'Return ONLY the JSON object '
                                                '{"host_indices": [...]}. No prose, no fences.'},
                ]
    return None


async def attribute_host_segments(chat, *, model: str, host_name: str, title: str,
                                  segments: list[dict], window_size: int = 60,
                                  overlap: int = 5, hints: str = "",
                                  role: str = "host") -> list[dict]:
    """Return the subset of `segments` (original order) spoken by the target.

    `role` selects the cue block: "host" (default) extracts the show's host;
    "guest" extracts a named guest (e.g. Elon Musk on someone else's podcast).
    Segments the model does not flag are dropped. If a window's JSON is
    unrecoverable after one repair retry, that whole window is dropped.
    Overlap disagreement resolves permissively: a segment is kept if EITHER
    window covering it labels it the target.
    """
    hint_line = (hints.strip() + "\n") if hints and hints.strip() else ""
    cues = GUEST_CUES if role == "guest" else HOST_CUES
    host_global: set[int] = set()

    for global_start, window_segs in windows(segments, window_size, overlap):
        prompt = PROMPT.format(host_name=host_name, title=title, hints=hint_line,
                               cues=cues, listing=_listing(window_segs))
        indices = await _host_indices(chat, model=model, prompt=prompt)
        if indices is None:
            logger.warning("Dropping window at segment %d (%d segments): "
                           "model returned invalid JSON after retry.",
                           global_start, len(window_segs))
            continue
        for rel in indices:
            if 0 <= rel < len(window_segs):
                host_global.add(global_start + rel)

    return [seg for i, seg in enumerate(segments) if i in host_global]
