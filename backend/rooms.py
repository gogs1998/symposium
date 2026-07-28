"""Multi-figure rooms: a symposium. Several personas share one conversation,
see each other's replies, and are prompted to engage — agree, push back, build.

A turn works like this:
  1. pick_responders() — @-mentions win; otherwise a cheap moderator call chooses
     the 1-2 figures who would most naturally react (capped for cost + readability).
  2. Each responder replies in sequence. Its prompt carries its own persona, its
     own RAG retrieval, and the full room transcript SO FAR THIS TURN — so the
     second speaker actually hears the first and can respond to them.

The transcript is a list of {"speaker": <name|"You">, "content": str}. Figures
are dicts from the registry (id, name, persona_prompt, ...).
"""
import json
import re

MAX_RESPONDERS = 2

ROOM_PREAMBLE = (
    "\n\n# The room\n"
    "You are in a live group conversation — a symposium — with: {others}. "
    "This is a discussion, not a monologue. React to what has just been said: agree and "
    "extend it, disagree and say why, or turn to another guest by name and put a question "
    "to them. Speak once, briefly — a paragraph or two, the length of a real spoken turn — "
    "then stop and let the room continue. Never speak for anyone but yourself, and never "
    "narrate the scene; just say your piece as {name}."
)

MODERATOR_PROMPT = (
    "You are moderating a group conversation between these people:\n{roster}\n\n"
    "Conversation so far:\n{transcript}\n\n"
    "The most recent message is from the user. Choose the 1 or 2 participants who would "
    "most naturally respond next — by relevance to the topic and the friction or agreement "
    "that would make the best exchange. Reply with ONLY a JSON object: "
    '{{"responders": ["Name", ...]}} using their exact names from the roster.'
)


def _transcript_text(transcript: list[dict]) -> str:
    return "\n".join(f'{t["speaker"]}: {t["content"]}' for t in transcript) or "(empty)"


def mentioned_figures(message: str, figures: list[dict]) -> list[str]:
    """Figure ids explicitly named in the message (first name or full name, word-boundary)."""
    hits = []
    low = message.lower()
    for f in figures:
        names = {f["name"].lower(), f["name"].split()[0].lower(), f["id"].lower()}
        if any(re.search(rf"\b{re.escape(n)}\b", low) for n in names if len(n) > 2):
            hits.append(f["id"])
    return hits


async def pick_responders(chat, *, model, figures: list[dict], transcript: list[dict],
                          user_message: str) -> list[str]:
    """Return the ordered figure ids that should respond (1..MAX_RESPONDERS)."""
    mentioned = mentioned_figures(user_message, figures)
    if mentioned:
        return mentioned[:MAX_RESPONDERS]

    roster = "\n".join(f'- {f["name"]}: {f["description"]}' for f in figures)
    convo = _transcript_text(transcript + [{"speaker": "User", "content": user_message}])
    prompt = MODERATOR_PROMPT.format(roster=roster, transcript=convo)
    by_name = {f["name"].lower(): f["id"] for f in figures}
    try:
        raw = await chat.complete(
            [{"role": "user", "content": prompt}], model=model, temperature=0.3, max_tokens=200
        )
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        names = json.loads(match.group(0))["responders"] if match else []
        ids = [by_name[n.lower()] for n in names if n.lower() in by_name]
        if ids:
            return ids[:MAX_RESPONDERS]
    except Exception:
        pass
    # Fallback: the figure who has spoken least recently (keep everyone involved).
    spoken = [t["speaker"] for t in transcript]
    order = sorted(figures, key=lambda f: (spoken[::-1].index(f["name"]) if f["name"] in spoken else 1e9), reverse=True)
    return [order[0]["id"]]


def build_room_messages(engine, *, figure: dict, others: list[str], context: list[dict],
                        transcript: list[dict], user_message: str) -> list[dict]:
    """Messages for `figure` to take its turn: persona + RAG context + room rules,
    then the whole transcript (incl. this turn's earlier speakers) as the prompt."""
    context_block = "\n\n".join(
        f"[{c['metadata'].get('source', 'unknown')}]\n{c['text']}" for c in context
    )
    system = (figure["persona_prompt"] + engine_context_header() + context_block
              + ROOM_PREAMBLE.format(others=", ".join(others), name=figure["name"]))
    convo = _transcript_text(transcript + [{"speaker": "You", "content": user_message}])
    trigger = (f"{convo}\n\n(You are {figure['name']}. It is your turn — respond in your own "
               f"voice to what has just been said. Do not prefix your reply with your name.)")
    return [{"role": "system", "content": system}, {"role": "user", "content": trigger}]


def engine_context_header() -> str:
    from rag.engine import CONTEXT_HEADER
    return CONTEXT_HEADER
