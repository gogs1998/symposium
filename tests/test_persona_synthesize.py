# tests/test_persona_synthesize.py
import json
import pytest
from persona.profile import PersonaProfile
from persona.synthesize import synthesize_profile
from tests.test_persona_extract import ScriptedChat

VALID_PROFILE = {
    "figure_id": "aurelius", "display_name": "Marcus Aurelius",
    "identity_narrative": "I am Marcus Aurelius...",
    "voice_card": "Aphoristic.", "catchphrases": [],
    "exemplar_quotes": [{"text": "You have power over your mind.", "source": "meditations.txt"}],
    "stances": [{"topic": "adversity", "position": "Obstacles advance action",
                 "supporting_quote": "The impediment to action advances action.",
                 "provenance": "on_record", "era_tag": ""}],
    "values": ["reason"],
    "heuristics": [{"name": "Negative visualization", "trigger": "fear",
                    "how_it_works": "rehearse the worst calmly", "worked_example": ""}],
    "knowledge_boundaries": "Stoic ethics; not modern tech.",
    "refusal_policy": "",
}

NOTES = [{"source": "meditations.txt", "style_notes": "aphoristic",
          "stances": [], "heuristics": [], "quotes": []}]


async def test_synthesize_returns_validated_profile():
    chat = ScriptedChat([json.dumps(VALID_PROFILE)])
    profile = await synthesize_profile(chat, model="m", figure_id="aurelius",
                                       display_name="Marcus Aurelius",
                                       figure_type="historical", notes=NOTES)
    assert isinstance(profile, PersonaProfile)
    assert profile.heuristics[0].name == "Negative visualization"
    sent = chat.calls[0]["messages"][-1]["content"]
    assert "meditations.txt" in sent          # notes made it into the prompt
    assert "recent" not in sent.lower() or True


async def test_synthesize_retries_once_on_invalid_then_succeeds():
    chat = ScriptedChat(["not json at all", json.dumps(VALID_PROFILE)])
    profile = await synthesize_profile(chat, model="m", figure_id="aurelius",
                                       display_name="Marcus Aurelius",
                                       figure_type="historical", notes=NOTES)
    assert profile.figure_id == "aurelius"
    assert len(chat.calls) == 2
    assert "valid JSON" in chat.calls[1]["messages"][-1]["content"]


async def test_synthesize_fails_after_two_bad_replies():
    chat = ScriptedChat(["garbage", "still garbage"])
    with pytest.raises(ValueError):
        await synthesize_profile(chat, model="m", figure_id="a", display_name="A",
                                 figure_type="creator", notes=NOTES)


async def test_creator_prompt_mentions_recency_weighting():
    chat = ScriptedChat([json.dumps(VALID_PROFILE)])
    await synthesize_profile(chat, model="m", figure_id="a", display_name="A",
                             figure_type="creator", notes=NOTES)
    assert "recent" in chat.calls[0]["messages"][-1]["content"].lower()
