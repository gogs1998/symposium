# Symposium — Design System

**Symposium** is a chat platform where you talk to AI recreations of real people, grounded in their own words. Two categories share one roster: **Historical figures** (Einstein, Marcus Aurelius, Churchill — built from their actual writings) and **Creators** (YouTubers — built from their video transcripts). Every response cites its sources: a book passage for a historical figure, or a clickable video moment (*"said in {Video Title} @ 12:34"*) for a creator.

The tension *is* the brand: 2,000-year-old philosophers next to YouTubers. The system leans **editorial, archival-meets-modern** — a beautifully typeset library/museum-catalog voice (strong serif display, generous whitespace, warm paper-and-ink neutrals, one confident accent) collided with a crisp modern chat UI. Typography does the heavy lifting.

## Sources
This system was built **from the product brief only** — no codebase, Figma, or existing brand assets were provided. All tokens, components, and screens are original interpretations of the written direction. There is **no supplied logo**; the brand name is set in the display serif wherever a mark would go (see Iconography). If a codebase or Figma exists, re-attach it and this system should be reconciled against it.

---

## CONTENT FUNDAMENTALS

**Voice (product chrome).** Literary but plain-spoken; confident, never salesy. The app speaks like a thoughtful curator, not a SaaS dashboard. Sentence case everywhere except uppercase eyebrows/labels. No exclamation marks in UI copy. No emoji — ever.

- Eyebrows / category labels: UPPERCASE, letter-spaced, grotesque — `A ROOM OF REMARKABLE PEOPLE`, `HISTORICAL`, `CREATOR`, `BEGIN WITH`.
- Headlines: serif display, sentence case, a touch of gravitas — *"Sit with the minds that shaped us — and the ones shaping us now."*
- Buttons: verbs, plain — *Begin conversation*, *Back to roster*, *Try again*, *Sources*.
- Empty/error states have a human, literary turn without being precious — error headline *"The line went quiet."* then a calm, practical next step.

**The figure's own voice.** Assistant messages are written *in the figure's register* and set in the reading serif — they should read like a passage from that person, not a chatbot. Never put words in a figure's mouth without a citation; every assistant turn carries at least one source.

**Person & address.** The figure speaks in first person ("I", "you"). Product chrome addresses the user as "you". The disclosure is unambiguous and always present: *"An AI recreation grounded in {figure}'s own words — not the real person. Responses may err."*

**Citations.** Book: `{Work} · {locator}` (e.g. *Meditations · Book IV, 3*). Video: `said in {Title} @ {mm:ss}`, the timestamp a monospace deep-link. Timestamps and locators are always monospace.

---

## VISUAL FOUNDATIONS

**Color.** Warm **paper-and-ink** neutrals plus **one** confident accent — **Cinnabar** (`--accent`, #C0442C), a rubricated-manuscript / wax-seal red. Paper ramps (`--paper-0…4`) are warm creams for surfaces; ink ramps (`--ink-0…4`) are warm near-blacks for text and lines. A quiet secondary **Indigo** tints historical-era elements and reading-text links. Semantic colors (success/warning/danger) are muted and warm-leaning. Max one accent per view; figure cards may carry a *personal* accent (era hue or creator channel color) on a 3px edge without breaking the system. **No purple→blue gradients, no glassmorphism, no floating blobs.**

**Type.** Four families: **Libre Caslon Display** (museum-catalog headlines, figure names), **Newsreader** (reading serif — figure voices, excerpts, body), **Archivo** (grotesque sans — eyebrows, labels, buttons, meta), **IBM Plex Mono** (timestamps, source locators, counts). Scale runs 11 → 82px. Reading measure capped ~66ch. Eyebrows are the one uppercase, letter-spaced role.

**Spacing & layout.** 4px base grid; generous whitespace — the catalog breathes. Page max `--width-page` 1240px, chat column `--width-chat` 760px, sidebar 288px. Roster is an `auto-fill minmax(300px)` grid.

**Backgrounds & texture.** Flat warm paper — no photographic hero washes. A very subtle SVG **paper grain** (`--texture-grain`, ~3.5% noise) overlays page and thread backgrounds for archival warmth. No gradients as decoration (the only gradient is a portrait-plate fallback behind a missing video thumbnail).

**Borders, corners, cards.** Confident, mostly-sharp corners: radii are small (2–10px); pills reserved for chips, badges, and citation toggles. Cards = warm paper surface + 1px `--border-line` + soft low shadow; FigureCard adds a 3px personal-accent edge on the left. Editorial hairlines (`--border-hair`) separate meta; a full-strength `--rule-ink` is available for mastheads/section rules.

**Shadows.** Warm-tinted, soft, low — never blue/black glow, never glossy. `--shadow-xs → lg` all use rgba(40,30,16,…). An inset highlight (`--shadow-inset`) gives portrait plates a printed feel.

**Motion.** Measured and editorial — fades and gentle ease (`--ease-out`, `--ease-in-out`), 120/220/420ms. **No bounce, no spring.** Streaming caret blinks (`sym-blink`); the thinking state uses three softly rising dots (`sym-thinking`); content can rise-fade in (`sym-rise`).

**Hover / press.** Hover = subtle surface darkening or accent-edge reveal (never scale-up on cards). Buttons darken toward `--accent-hover/press` on press. Focus uses a 3px soft cinnabar ring (`--ring`). Interactive rows fill to `--surface-card`.

**Transparency & blur.** Used sparingly and only where physical: the video-thumbnail play scrim and timestamp chip use `rgba(20,17,12,…)`. No frosted-glass panels anywhere.

**Imagery vibe.** Portraits render slightly desaturated, warm, with a printed grain (`saturate .92, contrast 1.02` + grain overlay) so a photo and a monogram plate sit together. When no likeness exists, a dignified typographic **monogram plate** stands in, tinted by the figure's era/channel accent.

**Dark mode.** A warm dark scope (`[data-theme="dark"]`) — near-black warm surfaces, cream ink, a slightly brighter cinnabar. Same structure, same rules.

---

## ICONOGRAPHY

Symposium is **type-first and glyph-light** by design — the editorial voice carries the UI, so iconography is deliberately minimal.

- **No custom icon set / icon font / SVG sprite is shipped.** The few glyphs in use are simple Unicode characters rendered in the UI font: arrows (`←`, `→`, `↑`, `▶`, `▾`), a plus (`+`), an ellipsis (`⋯`), and an info mark (`ⓘ`). This keeps the surface calm and avoids a decorative icon language competing with the serif.
- **Status is shown with dots, badges, and rules,** not icons — a colored dot for availability/figure identity, `Badge` for Published/Coming soon, hairlines for structure.
- **No emoji.** Ever. (The brief forbids the generic AI-startup look; emoji cards are part of what we avoid.)
- **If a project needs a broader icon set,** substitute a restrained, thin-stroke line set (e.g. **Lucide** via CDN, ~1.5px stroke) to match the hairline weight — and flag the substitution. Do not hand-draw brand marks or portraits.

**Logo:** none supplied. The wordmark is simply **"Symposium"** set in Libre Caslon Display, optionally followed by a small cinnabar dot. Do not fabricate a logotype or symbol.

---

## VISUAL ASSETS

No logo, portrait, or illustration assets were provided, and none were fabricated (per policy — never draw a company's mark or a real person's likeness from memory). Portraits therefore use the **monogram-plate fallback** built into `FigurePortrait`; pass real `src` URLs in production. There is no `assets/` folder for this reason.

---

## COMPONENTS

Built in React, grouped by concern. Consume via `const { X } = window.SymposiumDesignSystem_32eaa4`.

**core/** — `Button`, `IconButton`, `Badge`, `Tag`
**figures/** — `FigureCard`, `CategoryTabs`, `FigurePortrait`
**chat/** — `MessageBubble`, `CitationCard`, `Composer`, `SessionSidebar`, `TypingIndicator`, `DisclosureBanner`, `SuggestedQuestion`

The brief's named inventory — FigureCard, CategoryTabs, MessageBubble, CitationCard, Composer, SessionSidebar — is fully covered. **Intentional additions** (needed to build the specified screens): `Button`/`IconButton` (actions), `Badge`/`Tag` (availability, category/era/channel), `FigurePortrait` (likeness + monogram fallback), `TypingIndicator` (the required "figure thinking" state), `DisclosureBanner` (the required persistent AI-recreation disclosure), `SuggestedQuestion` (the required first-visit openers). `CitationCard` ships in both required variants — **book excerpt** and **video timestamp**.

Each component directory has `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and one `@dsCard` HTML specimen.

## UI KITS

**ui_kits/symposium-app/** — interactive recreation of the whole product: roster (landing) → chat with streaming + citations, plus empty / thinking / error states. See its `README.md`. Open `index.html`.

---

## INDEX / MANIFEST

- `styles.css` — root entry; `@import`s all tokens + fonts (link this one file).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `animations.css`, `fonts.css`.
- `components/{core,figures,chat}/` — reusable primitives (`.jsx` + `.d.ts` + `.prompt.md` + card).
- `guidelines/` — foundation specimen cards (Type, Colors, Spacing).
- `ui_kits/symposium-app/` — full interactive product recreation.
- `thumbnail.html` — homepage tile.
- `SKILL.md` — Agent-Skills wrapper.

**CAVEATS**
- **Fonts are loaded from the Google Fonts CDN**, not self-hosted binaries — swap for licensed self-hosted files before production.
- **No logo/portrait/illustration assets** were supplied; the wordmark is type and portraits use the monogram fallback. Provide real assets to complete the brand.
- All content in the UI kit (figures, replies, citations) is **demo data**.
