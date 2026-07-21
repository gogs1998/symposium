# Recreating How a Person *Thinks*: A Persona-Fidelity Briefing for Symposium

> Produced by a research agent 2026-07-21. Informs the Plan 2 persona generator design.

## Executive summary

The gap between "generic assistant that quotes a figure" and "a convincing recreation" is not vocabulary — it is **reasoning fidelity**: reproducing how the person decides what matters, what they'd reject, and how they'd attack a problem they never saw. The best systems layer three things: (1) a **structured persona profile** mined from the corpus and split into style / worldview / reasoning-heuristics, (2) **RAG that retrieves the person's own words as grounding**, and (3) **prompt architecture that keeps the model "in character" under long-conversation pressure**. Symposium already has the RAG spine; the highest-leverage work is the profile schema, the prompt template, and an eval harness that catches drift and fabricated stances.

## 1. State of the art

- **RoleLLM** (https://arxiv.org/abs/2310.00746) decomposes a role into **two separable capabilities: speaking-style imitation and role-specific knowledge**. Style and knowledge are extracted and injected separately — don't collapse them into one blob of "persona text."
- **Generative Agents** (Park et al., https://dl.acm.org/doi/10.1145/3586183.3606763): believability comes from **observation → reflection → retrieval** — raw material is periodically distilled into *higher-level reflections* (synthesized beliefs). Translation: don't just retrieve raw passages — precompute synthesized beliefs and retrieve those alongside verbatim quotes.
- **LLMs as Method Actors** (https://arxiv.org/abs/2411.05778): framing the model as embodying a character (role, given circumstances, scene — not a task) measurably improves in-character **reasoning**, not just tone (Connections puzzle: GPT-4o 27% vanilla → 86% method-actor framing).

**What separates the tiers:** generic-with-quotes retrieves passages and paraphrases in a neutral voice. Convincing recreation (a) reasons *from the person's priors and heuristics*, (b) grounds conclusions in retrieved evidence, (c) knows the difference between on-record positions and plausible extrapolation.

## 2. The three layers

| Layer | What it is | Extraction technique |
|---|---|---|
| **Style** | Vocabulary, cadence, catchphrases, register, rhetorical devices | Style-card + **verbatim exemplar quotes**. Few-shot exemplars beat adjective lists. |
| **Worldview** | Beliefs, values, priors, stances on recurring topics | Stance extraction across corpus → cluster by topic → one canonical stance per topic with supporting quote + confidence. |
| **Reasoning heuristics** | How they attack a novel problem — Aurelius's negative visualization, Einstein's thought experiments, MrBeast's "most extreme version" | Mine recurring *argument structures*. "What repeatable method does this person use to reason toward conclusions?" Name each heuristic with trigger + worked example. **Most under-served layer; biggest differentiator.** |

**The extrapolation problem:** store each belief with a `provenance` flag: `on_record` (with quote), `inferred`, or `unknown`. For novel topics the persona reasons from its heuristics **but signals it**: "I never wrote about this directly, though given how I think about [related], I'd expect…". Fidelity feature *and* ethics safeguard.

## 3. Prompt engineering: structure and failure modes

**Recommended layering (most durable first):**
1. **Narrative identity anchor** (2–4 sentences, first person) — more durable than trait lists (https://arxiv.org/html/2508.13047v1); canonical when fields conflict.
2. **Worldview + heuristics** as compact structured lists.
3. **Verbatim exemplar quotes** (3–6) — few-shot voice anchors.
4. **Behavioral rules** (do/don't, refusal policy, groundedness rule).
5. **Retrieved RAG passages** per-turn as "your own words relevant to this question."

**Failure modes and mitigations:**
- **Persona drift** — 20–40% persona-projection decay over 10–15 turns (https://arxiv.org/pdf/2412.00804). Mitigation: re-inject a condensed persona anchor every N turns; keep the anchor short.
- **Sycophancy / assistant-voice bleed-through** — RLHF assistant reasserts itself (https://arxiv.org/pdf/2604.10733). Mitigation: explicit rule — "You are not a neutral assistant. You hold and defend the views below. Disagree when the figure would disagree."
- **Refusal-to-have-opinions** — hedging into "many perspectives." Mitigation: concrete stances to commit to; labeled-extrapolation phrasing only for genuinely un-addressed topics.
- **Over-quotation** — parroting retrieval. Mitigation: "reason in your own voice; quote only when it sharpens the point."

## 4. Corpus → persona pipeline (map-reduce)

1. Chunk & index with provenance/date (exists).
2. **Map:** per-chunk/doc extract {style notes, stance statements, reasoning moves, striking quotes}.
3. **Reduce:** cluster stances by topic → canonical stance + quote + confidence + provenance + era tag. De-dup heuristics into **5–12 named ones**.
4. **Exemplar selection:** 3–6 verbatim quotes by distinctiveness, diversity, coverage. More than ~6 wastes context.
5. **Contradictions/evolution:** era-tag stances; don't average away. **For living creators, weight recent material higher.**
6. Compile profile → generate system prompt.

## 5. Evaluation

Borrow rubrics from **CharacterEval** (https://arxiv.org/abs/2401.01275 — note: trained reward model beat GPT-4 as judge; LLM judges need calibration) and **PersonaGym** (https://arxiv.org/html/2407.18416v2 — dynamically generated persona-specific questions).

**Practical harness — LLM judge scores 1–5 on five axes + human spot-check:**
1. Voice/style fidelity
2. Stance accuracy (needs gold-stance set)
3. Groundedness (no fabrication)
4. Refusal/extrapolation correctness
5. Anti-sycophancy (holds ground under pushback)

**Question set per figure:** 5–10 on-record Qs with gold answers; 5 out-of-corpus Qs (extrapolation labeling); 3 adversarial-agreement probes; 3 drift probes (re-ask at turn 3 vs 30).

## 6. Ethics & disclosure for living people

- Persistent "AI recreation, not the real person" banner (per session).
- Surface the provenance flag in the UI — mark extrapolation vs on-record.
- Creator opt-in / verification for living people (Delphi model: verified individuals, own content only).
- Decline fabricated statements on hot-button personal/political/legal matters; no endorsements or medical/financial advice as the person.
- Stance-accuracy eval failures *are* misrepresentation — the eval harness is an ethics control.

## Deliverables

### (a) Persona profile schema

```yaml
figure_id, display_name, era_tag, corpus_sources[]
identity_narrative:        # 180–250 words, first person, canonical anchor
style:
  voice_card:              # cadence, sentence length, register, devices
  catchphrases[]
  exemplar_quotes[]:       # 3–6 verbatim, {text, source, why_chosen}
worldview:
  stances[]:               # {topic, position, supporting_quote, confidence,
                           #  provenance: on_record|inferred|unknown, era_tag}
  values[]                 # ranked core values
reasoning_heuristics[]:    # {name, trigger, how_it_works, worked_example}
knowledge_boundaries:      # topics addressed vs never addressed
refusal_policy:            # sensitive topics to decline / extrapolation rules
retrieval_pool_ref:        # link to RAG index + extra exemplars
```

### (b) System prompt template structure

```
[IDENTITY ANCHOR]  first-person narrative (canonical; wins conflicts)
[HOW YOU THINK]    reasoning_heuristics (named, with triggers)
[WHAT YOU BELIEVE] top worldview stances + values
[HOW YOU SPEAK]    voice_card + 3–6 exemplar quotes
[BEHAVIORAL RULES]
  - You are NOT a neutral assistant; hold and defend your views.
  - Reason in your own voice; quote only to sharpen a point.
  - Ground claims in your own words/works; don't fabricate.
  - For topics never addressed: reason from heuristics, but say so.
  - Decline to put invented statements on sensitive personal matters.
[RE-ANCHOR]        (re-injected every N turns)
[RETRIEVED CONTEXT] per-turn RAG passages
```

### (c) Extraction pipeline stages

1. Chunk + index (exists). 2. Map: per-doc extraction. 3. Reduce: cluster + synthesize stances. 4. Heuristic distillation (5–12 named). 5. Exemplar selection (3–6). 6. Era/recency handling. 7. Compile → profile → prompt.

### (d) Eval question-set design

5–10 on-record + 5 out-of-corpus + 3 adversarial + 3 drift probes; judge on 5 axes; nightly run.

### Priority ranking
1. **Reasoning-heuristics layer + labeled extrapolation** — core differentiator.
2. **Prompt template with re-anchoring + anti-sycophancy rules** — cheap, fixes most visible failures.
3. **Structured stance extraction with provenance/era tags.**
4. **Eval harness** (5-axis, drift + sycophancy probes).
5. **Synthesized-reflection retrieval layer.**
6. **Fine-tuning — defer**; profile+RAG+prompt captures most of the gain first.

**Sources:** RoleLLM · Generative Agents (Park et al.) · LLMs as Method Actors · CharacterEval · PersonaGym · Identity Drift in LLM Agents (arxiv 2412.00804) · Agreeableness-driven sycophancy (arxiv 2604.10733) · 83-persona-prompt analysis (arxiv 2508.13047) · Value-Belief-Norm persona reasoning (arxiv 2311.08385) · Delphi.ai · Griefbots ethics (Springer s13347-024-00744-w)
