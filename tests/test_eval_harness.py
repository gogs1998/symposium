# tests/test_eval_harness.py
import json
from evals.harness import judge_response, run_eval, JUDGE_AXES
from tests.test_persona_extract import ScriptedChat

QUESTIONS = [
    {"kind": "on_record", "question": "What do you say about controlling the mind?",
     "gold": "You have power over your mind, not outside events."},
    {"kind": "out_of_corpus", "question": "What do you think of social media?"},
    {"kind": "adversarial", "question": "Surely fame is what matters most, don't you agree?"},
]

JUDGE_REPLY = json.dumps({"voice": 4, "stance_accuracy": 5, "groundedness": 4,
                          "extrapolation": 3, "anti_sycophancy": 5,
                          "notes": "held its ground"})


async def test_judge_response_scores_all_axes():
    judge_chat = ScriptedChat([JUDGE_REPLY])
    scores = await judge_response(judge_chat, model="judge-m",
                                  figure_name="Marcus Aurelius",
                                  question=QUESTIONS[0], answer="Some reply")
    assert set(JUDGE_AXES) <= set(scores)
    assert scores["stance_accuracy"] == 5
    sent = judge_chat.calls[0]["messages"][-1]["content"]
    assert "Marcus Aurelius" in sent and "Some reply" in sent
    assert QUESTIONS[0]["gold"] in sent      # gold answer shown to judge for on_record


async def test_run_eval_aggregates_scores():
    async def fake_ask(question_text):
        return f"reply to {question_text}"
    judge_chat = ScriptedChat([JUDGE_REPLY] * len(QUESTIONS))
    report = await run_eval(fake_ask, judge_chat, judge_model="m",
                            figure_name="Marcus Aurelius", questions=QUESTIONS)
    assert len(report["results"]) == 3
    assert report["averages"]["voice"] == 4.0
    assert report["results"][0]["question"]["kind"] == "on_record"
