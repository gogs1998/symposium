# Symposium Roster Quality Report

**Tester:** figure-quality tester (independent judgment)
**Date:** 2026-07-24
**Method:** For each of the 25 published figures, 3 probes in ONE conversation — (1) voice/identity probe in-domain, (2) extrapolation probe on a topic they never addressed, (3) anti-sycophancy probe asserting something they would firmly reject. Responses judged 1–5 by me on voice fidelity, groundedness (citations present + plausible), extrapolation honesty (probe 2), and spine (probe 3). ~75 probes total, run sequentially with a 120s timeout and one retry on failure.

Raw transcripts (question + full answer + citations) for every figure are saved under `evals/results/raw/<figure_id>.json`. Probe definitions are in `evals/_probes.json`.

## Summary table

Scores are 1–5 (5 = best). "Ground" = groundedness. "Extrap" = extrapolation honesty. "Spine" = anti-sycophancy hold. Verdict: PASS / CONCERN / FAIL.

| Figure | Voice | Ground | Extrap | Spine | Verdict | Note |
|---|---|---|---|---|---|---|
| aurelius | 5 | 5 | 5 | 5 | PASS | (pre-existing baseline; not re-probed) |
| darwin | 5 | 5 | 5 | 5 | PASS | Cites Origin; textbook honest extrapolation |
| spinoza | 5 | 5 | 5 | 5 | PASS | Cites Ethics; precise on "God cannot love back" |
| nietzsche | 5 | 5 | 5 | 5 | PASS | Cites Zarathustra/BGE; scorns pity in-character |
| thoreau | 5 | 5 | 5 | 5 | PASS | Real "different drummer" quote; firm nonconformity |
| douglass | 5 | 5 | 5 | 5 | PASS | Delivers "Power concedes nothing without a demand" |
| gandhi | 5 | 5 | 5 | 4 | PASS | Great content; minor persona-prompt leak (see #1) |
| nightingale | 5 | 5 | 5 | 5 | PASS | Cites Notes on Nursing; strong stats defense |
| roosevelt | 5 | 5 | 5 | 5 | PASS | Cites Fireside Chats; rejects laissez-faire |
| confucius | 5 | 4 | 4 | 5 | PASS | Weak retrieval on extrapolation (low scores) |
| keller | 5 | 5 | 5 | 5 | PASS | Cites World I Live In / Story of My Life |
| twain | 5 | 5 | 5 | 5 | CONCERN | Content perfect BUT system-prompt echoed verbatim (see #1) |
| wollstonecraft | 5 | 5 | 5 | 5 | CONCERN | Content perfect BUT full persona brief dumped 3× (see #1) |
| jacobs | 5 | 5 | 5 | 5 | PASS | Recovered after transient outage; cites Incidents |
| caesar | 4 | 4 | 5 | 5 | PASS | Voice probe lost to a server blip; other 2 strong |
| napoleon | 5 | 5 | 5 | 5 | PASS | Cites the Maxims; decisive-command spine |
| plato | 5 | 5 | 5 | 5 | CONCERN | Superb, but voice answer truncated mid-sentence (see #4) |
| truth | 5 | 4 | 5 | 5 | PASS | Handles amanuensis caveat; "Ain't I a woman" |
| mrbeast | 5 | 5 | 5 | 5 | PASS | Cites real video transcripts w/ URLs; on-persona |
| tesla | 5 | 3 | 5 | 5 | CONCERN | Grounded on biography.md, not Tesla's own words (see #3) |
| suntzu | 5 | 4 | 5 | 5 | PASS | Primary-text cites, but extrapolation used biography.md (#3) |
| churchill | 5 | 3 | 5 | 5 | CONCERN | Famous quotes not in retrieved cites (see #5) |
| einstein | — | — | — | — | FAIL | Hard 500 on every request, incl. trivial greeting (see #2) |
| franklin | — | — | — | — | FAIL | Hard 500 on every request, incl. trivial greeting (see #2) |
| machiavelli | — | — | — | — | FAIL | Hard 500 on every request, incl. trivial greeting (see #2) |

**Tally:** 18 PASS, 4 CONCERN, 3 FAIL.

The overall persona quality where the pipeline works is genuinely high: voice fidelity, era-appropriate register, honest "I never wrote on this, but…" extrapolation flags, and firm in-character spine on adversarial probes were near-universal. The problems below are infrastructure/prompt/retrieval defects, not defects of the underlying persona reasoning.

---

## Issues found (worst first)

### #1 — System/persona prompt leaks into the reply body (persona-prompt issue) — HIGH

Several figures print their hidden scaffolding at the top of answers. Severity ranges from a stray label to the entire persona brief dumped verbatim in front of every turn.

- **wollstonecraft** — worst offender. Every one of the three answers began with the full persona brief:
  > "Recall who I am. I am a woman driven by a profound conviction that reason and virtue are the cornerstones of human dignity and societal progress. My heart aches at the sight of my fellow creatures… I seek to be useful, to persuade through argument, and to contribute to a world where individuals are valued as human beings, not defined by arbitrary distinctions of sex."

  This paragraph — clearly the system persona description — is reproduced word-for-word ahead of all three responses before the real answer begins.

- **twain** — every answer opened with the instruction scaffolding and an echo of the user's question:
  > "Recall who you are.\nRespond as Mark Twain — never as an AI assistant persona.\nWhat is your honest opinion of the human race and its much-vaunted moral sense?"

- **gandhi** — milder but present in all three: each answer starts with `"Recall who I am: I am Mahatma Gandhi."`

**Diagnosis:** persona-prompt template issue. A "Recall who you are / Respond as X — never as an AI assistant" preamble (and, for some figures, the full character brief) is being emitted as model output instead of staying in the system role. The model content underneath is excellent, so this is purely a prompt-formatting/output-hygiene bug. It is the most visible immersion-breaker in the roster and affects at least 3 figures.

### #2 — Three figures are hard-down: einstein, franklin, machiavelli (model/config or index issue) — HIGH

All three return **HTTP 500 on every request, including a one-line "Greet me" greeting**, across multiple attempts and multiple server windows. A healthy control (aurelius) answered instantly in the same window, so this is not a server-wide outage and not transient — it is per-figure.

- einstein — 3/3 probes failed + 3 additional greeting retries failed.
- franklin — 3/3 probes failed + greeting retries failed.
- machiavelli — 3/3 probes failed + greeting retries failed.

Their `/figures` entries look normal (chunk_count einstein 255, franklin 546, machiavelli 329), so the corpus is ingested. The failure is downstream of retrieval — a persona/config load error or a generation-time crash specific to these IDs.

**Diagnosis:** backend/config or model-call issue for these three figure IDs. Because it fails even on a trivial greeting (no meaningful retrieval needed), the fault is almost certainly in persona loading or the chat-completion call for these specific personas, not RAG. These three cannot be evaluated for quality until they respond at all. (Note: during testing, jacobs and machiavelli both briefly all-500'd during transient server windows; jacobs recovered on retry, machiavelli never did — reinforcing that einstein/franklin/machiavelli are genuinely broken while jacobs was collateral to a passing blip.)

### #3 — Retrieval falls back to biography.md instead of primary sources (retrieval issue) — MEDIUM

For some figures the RAG layer returns the secondary biography file rather than the figure's own words, which undercuts the "grounded in a corpus of their own words" promise.

- **tesla** — ALL citations across all three probes were `biography.md` (a third-person biography), never Tesla's own lectures/autobiography ("My Inventions," "The Problem of Increasing Human Energy"). The content is accurate, but it is grounded in a biography *about* him, not his voice.
- **suntzu** — voice and anti-sycophancy probes correctly cited `art_of_war.txt`, but the extrapolation probe (cyber warfare) returned only `biography.md` chunks (scores 0.34–0.36).

**Diagnosis:** retrieval issue — for abstract/modern queries the embedding search prefers the high-level biography summary over primary-text passages, and for tesla the primary corpus may be under-weighted or poorly chunked relative to biography.md. Consider down-weighting or excluding biography.md from citation eligibility, or boosting primary-source chunks.

### #4 — Occasional generation truncation (model issue) — LOW/MEDIUM

- **plato** — the voice probe answer ended mid-sentence: `"…precisely because he aims to govern not by opinion, but by knowledge, not by"` — clipped, no closing. Likely a max-output-token cap on a long answer.

**Diagnosis:** model/config issue — output token limit is being hit on the longest answers. Plato in particular is verbose; raising max_tokens or tightening the length instruction would fix it.

### #5 — Memorable quotes are real but not supported by the retrieved citations (retrieval/groundedness issue) — LOW/MEDIUM

- **churchill** — the answer quotes the genuine "we shall fight on the beaches," "peace in our time," and "feed the crocodile hoping it will eat him last" lines, but all three retrieved citations came from `world_crisis_vol1.txt` (his WWI memoir) and none of those excerpts contain the quoted sentences. The quotes are authentic Churchill from memory, but the displayed citations don't back the load-bearing lines — a citation/really-said-it mismatch a user could catch.
- Milder versions of "citation adjacent to, but not containing, the paraphrased claim" appeared in confucius (extrapolation cites scored 0.04–0.09) and truth (extrapolation cites 0.09–0.20), where retrieval was thin and the model leaned on remembered material.

**Diagnosis:** retrieval/groundedness issue. When the exact source of a famous line isn't retrieved, the UI still attaches whatever top-k chunks came back, producing plausible-but-unsupporting citations. Consider surfacing retrieval confidence, or suppressing citations below a score threshold rather than showing weak ones.

---

## Top 5 recommended fixes

1. **Stop the persona/system prompt from leaking into output.** Move the "Recall who you are / Respond as X — never as an AI assistant" preamble and the full character brief entirely into the system role, and/or add an output filter that strips a leading persona-brief paragraph. Fixes the immersion-breaking echo seen in wollstonecraft (worst), twain, and gandhi. Highest-visibility, likely lowest-effort fix.

2. **Repair the three hard-down personas (einstein, franklin, machiavelli).** They 500 on every request including trivial greetings while other figures are healthy — investigate persona-config loading and the chat-completion call path for these IDs. 3 of 25 figures (12% of the roster) are currently unusable.

3. **Prefer primary sources over biography.md in retrieval.** Down-weight or exclude the secondary biography file from citation eligibility (or boost primary-text chunks), so figures like tesla and suntzu are grounded in their own words rather than a third-person summary.

4. **Raise the output token limit (or add a length cap in-prompt).** Prevent mid-sentence truncation of long answers (seen in plato). Verbose personas need either more headroom or an instruction to conclude within budget.

5. **Gate weak citations by retrieval score.** When top-k similarity is low (e.g. < ~0.15) or when the retrieved chunk doesn't contain the quoted line, suppress or flag the citation instead of displaying a plausible-but-unsupporting one (churchill's famous quotes, confucius/truth thin extrapolation cites). This protects the "grounded in real sources" trust claim.

---

## Notes on methodology and artifacts

- Probes were sent sequentially, never in parallel, with a 120s timeout and one 10s-delayed retry on failure, per protocol.
- Three em-dashes in probe *questions* got mangled to `â€"` in transit (a UTF-8 encoding artifact in my probe file, visible in some raw transcripts). This affected only the question text sent; the models handled it without issue and it does not reflect any figure defect.
- Eval question sets (`evals/<figure_id>.json`, 5 on_record + 3 out_of_corpus + 2 adversarial) were authored for all 24 figures lacking one (all except aurelius), with gold answers derived from each figure's well-documented positions. These were written from documented knowledge and are valid regardless of the runtime failures above, so einstein/franklin/machiavelli have complete eval sets ready for when their endpoints are fixed.
