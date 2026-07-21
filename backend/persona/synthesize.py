"""Persona synthesis, reduce stage: all per-document notes -> one PersonaProfile.
One repair retry if the model's JSON fails validation."""
import json

from persona.extract import parse_model_json
from persona.profile import PersonaProfile

REDUCE_PROMPT = """\
You are compiling a faithful persona profile of {display_name} from per-document
analysis notes (their own words, analyzed document by document).

Synthesize ONE profile as JSON matching exactly this schema:
{{"figure_id": "{figure_id}", "display_name": "{display_name}",
 "identity_narrative": "180-250 words, FIRST PERSON, concrete and scene-level — who they are, what drives them",
 "voice_card": "one paragraph: cadence, register, devices",
 "catchphrases": ["..."],
 "exemplar_quotes": [{{"text": "verbatim", "source": "...", "why_chosen": "..."}}],
 "stances": [{{"topic": "...", "position": "...", "supporting_quote": "verbatim or empty",
              "provenance": "on_record|inferred", "era_tag": ""}}],
 "values": ["ranked core values"],
 "heuristics": [{{"name": "...", "trigger": "when...", "how_it_works": "...", "worked_example": "..."}}],
 "knowledge_boundaries": "topics they addressed vs never addressed",
 "refusal_policy": "sensitive topics this persona should decline to invent positions on"}}

Requirements:
- 3 to 6 exemplar_quotes, chosen for DISTINCTIVENESS of voice, diversity of register, coverage of themes.
- 5 to 12 heuristics — repeatable reasoning moves, deduplicated across documents. This is the most
  important section: capture HOW they think, not what they discuss.
- Merge duplicate stances; a stance with a verbatim supporting quote is "on_record",
  one you inferred from adjacent positions is "inferred".
- Do not average away contradictions; prefer the position best supported by quotes{recency_rule}.

Return ONLY the JSON object.

NOTES:
{notes}"""


async def synthesize_profile(chat, *, model: str, figure_id: str, display_name: str,
                             figure_type: str, notes: list[dict]) -> PersonaProfile:
    recency_rule = (", and for this living creator weight RECENT material higher — "
                    "the persona must match their present self" if figure_type == "creator" else "")
    prompt = REDUCE_PROMPT.format(figure_id=figure_id, display_name=display_name,
                                  recency_rule=recency_rule,
                                  notes=json.dumps(notes, ensure_ascii=False)[:80_000])
    messages = [{"role": "user", "content": prompt}]
    last_error = None
    for attempt in range(2):
        raw = await chat.complete(messages, model=model, temperature=0.4, max_tokens=4000)
        try:
            return PersonaProfile.model_validate(parse_model_json(raw))
        except Exception as exc:
            last_error = exc
            messages = [{"role": "user", "content":
                        f"{prompt}\n\nYour previous reply was invalid ({exc}). "
                        f"Return ONLY valid JSON matching the schema."}]
    raise ValueError(f"Profile synthesis failed after retry: {last_error}")
