"""Persona extraction, map stage: one cheap-model pass per document produces
style notes, stance candidates, heuristic candidates and quote candidates."""
import json
import re

MAX_DOC_CHARS = 48_000   # cheap-model context budget per map call

MAP_PROMPT = """\
You are analyzing source material to build a faithful persona of {figure_name}.
Below is one document from their own words ({source_name}).

Extract, as JSON with exactly these keys:
- "style_notes": one paragraph on voice — cadence, sentence length, register, rhetorical devices.
- "stances": list of {{"topic", "position", "supporting_quote"}} — opinions the author actually
  expresses here, with a short verbatim supporting quote each. Only what is genuinely in the text.
- "heuristics": list of {{"name", "trigger", "how_it_works"}} — repeatable reasoning moves the
  author uses to attack problems (thought patterns, not topics).
- "quotes": list of {{"text", "why"}} — up to 3 short verbatim passages with the most
  distinctive voice (not merely famous — characteristic).

Return ONLY the JSON object.

DOCUMENT:
{text}"""


def parse_model_json(raw: str) -> dict:
    text = raw.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Model did not return valid JSON: {raw[:200]!r}") from exc


async def extract_from_document(chat, *, model: str, figure_name: str,
                                source_name: str, text: str) -> dict:
    prompt = MAP_PROMPT.format(figure_name=figure_name, source_name=source_name,
                               text=text[:MAX_DOC_CHARS])
    raw = await chat.complete([{"role": "user", "content": prompt}],
                              model=model, temperature=0.2, max_tokens=2000)
    notes = parse_model_json(raw)
    notes["source"] = source_name
    return notes
