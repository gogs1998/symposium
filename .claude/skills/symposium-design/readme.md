# Symposium Design System

**Symposium** (Symposium.ai) is an educational platform for having grounded conversations with recreations of historical figures and modern creators. Unlike generic AI roleplay, every persona is powered by retrieval over that person's actual corpus — books, papers, letters, speeches, videos, posts — and **every reply cites its source**. The product's trust promise is "grounded in their own words."

## Sources
- GitHub: https://github.com/gogs1998/symposium — FastAPI RAG backend (`backend/`), React chat frontend (`frontend/`), ingestion pipeline with per-figure source folders (`ingestion/sources/`). Explore this repo for real product copy, figure rosters, system prompts, and citation payload shapes when designing against this product.
- The repo frontend is an early prototype (generic purple gradient); **this design system intentionally replaces it** with an original direction, per the product owner's request.

## Product surfaces
1. **The app** — roster of figures (Historical + Creators tabs), figure detail intro, streaming chat with citations (book citations for historical figures, timestamped video citations for creators), sources panel (trust surface), session sidebar, disclosure banners.
2. **Marketing landing page** — hero, citation promise, roster showcase, ethics/disclosure.

## Roster (from `backend/agents/figures.py`)
Einstein, Caesar, Plato, Marcus Aurelius, Sun Tzu, Machiavelli, Franklin, Napoleon, Douglass, Darwin, Tesla, Confucius, Churchill, FDR (+ others); production adds modern creators (e.g. podcast/video creators) with multiple "registers" — on-camera, conversational, written voices. Each figure has `name`, `era`, `description`, `fields[]`, `categories[]`, `available` flag.

## Design direction — "Aegean" (original)
A modern-museum aesthetic: warm marble surfaces, deep sea-ink text, lapis and bronze accents, classical Marcellus display caps, Spectral body serif, plaque-like near-square cards with hairline stone borders and double-rule dividers. Quiet, credible, archival — the UI is the gallery; the figures are the exhibit.

## CONTENT FUNDAMENTALS
- **Tone**: curatorial and plainspoken — a good museum label, not marketing hype. Confident about grounding, humble about limits.
- **Voice**: product speaks as "we" sparingly; addresses the user as "you". Figures speak in first person.
- **Casing**: sentence case everywhere except two deliberate exceptions — figure names and screen titles set in Marcellus render in caps by design, and small mono META LABELS (eras, source types, registers) are uppercase with wide tracking.
- **Emoji**: never. The prototype's 🏛️ is retired; iconography is typographic and hairline-stroke only.
- **Numbers & meta**: eras ("1879–1955", "428–348 BCE"), corpus sizes ("412 pages", "3 h 12 m"), and timestamps ("01:14:32") always in IBM Plex Mono. En-dashes in ranges.
- **Honesty scaffolding is copy, not chrome**: disclosure lines appear verbatim, e.g. "This is an AI recreation built from Albert Einstein's published writings. It is not Albert Einstein." Citations read "From *On the Origin of Species*, ch. 4" or "From The Joe Rogan Experience #1169 · 01:14:32".
- **Examples of good copy**:
  - Empty chat: "Ask anything. Replies draw only on what Darwin actually wrote."
  - Sources panel intro: "Everything this recreation says is retrieved from the corpus below."
  - Register nudge: "Talk to me like the podcast, not the show intro."
  - Unavailable card: "No sources ingested yet."

## VISUAL FOUNDATIONS
- **Color**: warm marble neutrals (#f7f5f0 page → #fdfcf9 cards) with cool deep sea-ink text (#1c2b3a) — the stone-and-ink contrast is the brand. One primary accent (lapis #24589e) for interaction; bronze (#a3742c) reserved for source/corpus material and the on-camera register; verdigris (#3e7d6c) for live/affirmative and the written register; madder (#a43b2e) for caution. Tints of each for surfaces. Max one accent per component.
- **Type**: Marcellus (display, single 400 weight, slight tracking) for names/titles; Spectral (300–600 + italic) for everything readable; IBM Plex Mono for metadata. Scale 11/13/15/17/21/28/40/60. Body 15px/1.6. Meta labels 11px uppercase, 0.14em tracking.
- **Backgrounds**: flat marble fills only. No gradients, no textures, no full-bleed photography in the UI. Portraits are the only imagery — duotone/greyscale, in circular or 3:4 plaque masks.
- **Borders & cards**: cards are plaques — #fdfcf9 face, 1px hairline stone border (#dcd6c8), radius 2–4px, near-flat shadow (0 1px 2px rgba(28,43,58,.06)). The signature divider is a 3px `double` rule in #c3bba7. No colored left-border cards.
- **Shadows**: two levels only — hairline shadow for cards, one soft overlay shadow for panels/dialogs. No inner shadows, no glows.
- **Radii**: 2px controls, 4px cards/panels, round only for dots and portrait masks. Nothing pill-shaped except the register indicator chip.
- **Spacing**: 4px base scale (4→96). Generous padding; density comes from hairline rules, not tight packing.
- **Motion**: fades and 4–8px vertical slides, 120–280ms, ease-out. No bounces, no springs. Typing indicator is three dots stepping opacity, not bouncing.
- **Hover**: border darkens to #c3bba7 + background warms one marble step; text links darken. **Press**: translateY(1px), no color change. **Selected**: lapis border + lapis tint fill.
- **Transparency/blur**: only the sources-panel scrim (ink at 32% opacity, no blur).
- **Imagery**: portraits treated as archival — greyscale or subtle warm duotone, never full-saturation photos beside marble. Commissioned style: 19th-century stipple-etching sketches, single sepia ink on cream — see `assets/portrait-brief.md`. Drop finished files at `assets/portraits/<figure-id>.png`.
- **Layout**: app max-width 1120px; chat column max 720px; fixed chat header + composer, messages scroll between.

## ICONOGRAPHY
- The source repo contains **no logo and no icon set** (only the default Vite favicon and emoji in prototype copy). **No logo exists** — wherever a mark would go, set the wordmark "SYMPOSIUM" in Marcellus. Do not draw a mark.
- Icons: hairline-stroke glyphs from **Lucide** (CDN, `lucide` UMD or copied SVGs), stroke-width 1.5, 16–18px, in current text color. This is a substitution (no icon set exists in source) — flagged for the owner. Used sparingly: book, video, file-text, clock, chevron, x, arrow-up (send).
- Unicode used deliberately as type, not icon: · separators, § in citations, — em-dash openers.
- No emoji, ever.

## Index
- `styles.css` — global entry; imports `tokens/` (colors, typography, spacing, effects, base).
- `guidelines/` — foundation specimen cards (Design System tab).
- `components/roster/` — FigureCard, CategoryTabs, SuggestedQuestion.
- `components/chat/` — MessageBubble, CitationCard, Composer, TypingIndicator, RegisterIndicator, SessionSidebar.
- `components/trust/` — DisclosureBanner, SourcesPanel.
- `ui_kits/app/` — interactive app recreation: Roster → Figure intro → Chat (sources panel, register nudge).
- `ui_kits/landing/` — marketing landing page.
- `SKILL.md` — agent skill entry point.

## Intentional additions
- **RegisterIndicator, SourcesPanel, FigureIntro screen, Landing** — explicitly commissioned by the product owner (priority list in the brief).
- **Lucide icons** — no icon system exists in source; nearest hairline match, flagged.

## Caveats
- Fonts load from Google Fonts (`tokens/typography.css` @import) — no font binaries exist in the source repo. Ask the owner for licensed files to vendor.
- Portraits are placeholder monograms/image-slots; the production app's portrait assets were not in the repo.
- Stalin/Hitler exist in the repo registry with heavy ethical framing; they are deliberately excluded from sample content here.
