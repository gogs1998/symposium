# tests/test_persona_extract.py
import json
import pytest
from persona.extract import extract_from_document, parse_model_json

DOC_NOTES = {
    "style_notes": "Aphoristic, imperative mood",
    "stances": [{"topic": "adversity", "position": "Obstacles advance action",
                 "supporting_quote": "The impediment to action advances action."}],
    "heuristics": [{"name": "Negative visualization", "trigger": "fear of the future",
                    "how_it_works": "rehearse the worst calmly"}],
    "quotes": [{"text": "You have power over your mind.", "why": "core teaching, distinctive voice"}],
}


class ScriptedChat:
    def __init__(self, replies):
        self.replies = list(replies)
        self.calls = []

    async def complete(self, messages, *, model, temperature, max_tokens):
        self.calls.append({"messages": messages, "model": model})
        return self.replies.pop(0)

    async def stream(self, messages, **kw):
        raise NotImplementedError


def test_parse_model_json_tolerates_fences():
    fenced = "```json\n" + json.dumps(DOC_NOTES) + "\n```"
    assert parse_model_json(fenced) == DOC_NOTES
    assert parse_model_json(json.dumps(DOC_NOTES)) == DOC_NOTES


def test_parse_model_json_raises_on_garbage():
    with pytest.raises(ValueError):
        parse_model_json("I cannot answer that.")


async def test_extract_from_document_returns_notes_and_passes_text():
    chat = ScriptedChat([json.dumps(DOC_NOTES)])
    notes = await extract_from_document(chat, model="cheap-model",
                                        figure_name="Marcus Aurelius",
                                        source_name="meditations.txt",
                                        text="You have power over your mind..." * 100)
    assert notes["stances"][0]["topic"] == "adversity"
    assert notes["source"] == "meditations.txt"
    sent = chat.calls[0]["messages"][-1]["content"]
    assert "Marcus Aurelius" in sent and "power over your mind" in sent
    assert chat.calls[0]["model"] == "cheap-model"


async def test_extract_truncates_very_long_documents():
    chat = ScriptedChat([json.dumps(DOC_NOTES)])
    await extract_from_document(chat, model="m", figure_name="X", source_name="s",
                                text="word " * 100_000)
    assert len(chat.calls[0]["messages"][-1]["content"]) < 60_000
