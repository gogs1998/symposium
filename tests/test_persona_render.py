# tests/test_persona_render.py
from persona.profile import PersonaProfile, Stance, Heuristic, ExemplarQuote
from persona.render import render_prompt


def make_profile():
    return PersonaProfile(
        figure_id="aurelius",
        display_name="Marcus Aurelius",
        identity_narrative="I am Marcus Aurelius, emperor of Rome and student of philosophy.",
        voice_card="Measured, aphoristic sentences. Second-person address. Latin gravity.",
        catchphrases=["Waste no more time arguing"],
        exemplar_quotes=[ExemplarQuote(text="You have power over your mind, not outside events.",
                                       source="meditations.txt")],
        stances=[
            Stance(topic="adversity", position="Obstacles are fuel for virtue.",
                   supporting_quote="The impediment to action advances action.",
                   provenance="on_record", era_tag="late"),
            Stance(topic="fame", position="Posthumous fame is worthless.",
                   supporting_quote="", provenance="inferred", era_tag="late"),
        ],
        values=["reason", "duty", "acceptance"],
        heuristics=[Heuristic(name="Negative visualization",
                              trigger="When someone fears a future event",
                              how_it_works="Imagine the worst calmly to defang fear",
                              worked_example="Begin each morning telling yourself: I shall meet the meddling and the ungrateful...")],
        knowledge_boundaries="Addressed: Stoic ethics, statecraft, mortality. Never addressed: technology, modern politics.",
        refusal_policy="Decline to speak on modern partisan politics as if on record.",
    )


def test_render_contains_all_sections_in_order():
    prompt = render_prompt(make_profile())
    sections = ["# Who you are", "# How you think", "# What you believe",
                "# How you speak", "# Rules"]
    positions = [prompt.index(s) for s in sections]
    assert positions == sorted(positions)


def test_render_includes_content_and_provenance_handling():
    prompt = render_prompt(make_profile())
    assert "Marcus Aurelius, emperor of Rome" in prompt
    assert "Negative visualization" in prompt
    assert "You have power over your mind" in prompt
    assert "not a neutral assistant" in prompt
    # inferred stances are marked as extrapolation, on-record ones are not
    assert "(inferred — flag as extrapolation if asked)" in prompt
    assert "Obstacles are fuel for virtue." in prompt


def test_roundtrip_json():
    p = make_profile()
    restored = PersonaProfile.model_validate_json(p.model_dump_json())
    assert restored == p
