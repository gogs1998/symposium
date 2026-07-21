"""Persona profile schema — the three-layer model from the fidelity research:
style / worldview / reasoning heuristics, with provenance-labeled stances.
Stored as operator-editable JSON; the prompt is re-rendered from it."""
from pydantic import BaseModel


class ExemplarQuote(BaseModel):
    text: str
    source: str = ""
    why_chosen: str = ""


class Stance(BaseModel):
    topic: str
    position: str
    supporting_quote: str = ""
    provenance: str = "on_record"      # on_record | inferred | unknown
    era_tag: str = ""


class Heuristic(BaseModel):
    name: str
    trigger: str
    how_it_works: str
    worked_example: str = ""


class PersonaProfile(BaseModel):
    figure_id: str
    display_name: str
    identity_narrative: str
    voice_card: str = ""
    catchphrases: list[str] = []
    exemplar_quotes: list[ExemplarQuote] = []
    stances: list[Stance] = []
    values: list[str] = []
    heuristics: list[Heuristic] = []
    knowledge_boundaries: str = ""
    refusal_policy: str = ""
