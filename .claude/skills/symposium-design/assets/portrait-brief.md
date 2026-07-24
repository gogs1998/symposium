# Symposium — Portrait Sketch Brief

Commission: one portrait sketch per roster figure, for the Symposium app (roster plaques, figure-intro screens, chat headers).

## Style (identical for every portrait)
- **Medium**: 19th-century engraving / stipple-etching style. Fine hatched linework, not painterly, not photorealistic.
- **Ink**: single dark sepia-ink (#2e2418 range) — one color only, no full black, never color.
- **Ground**: warm cream paper (#f7f5f0 — matches the app's marble surface). No background detail, no vignette, no texture overlays.
- **Framing**: head and shoulders, subject facing slightly off-axis (10–20°), neutral-to-thoughtful expression. Consistent head size across the set.
- **No**: hats/props unless historically iconic, signatures, borders, drop shadows, gradients.

## Output specs
- Square 1024×1024 (the app masks to circle and 3:4 plaque).
- Filename: `assets/portraits/<figure-id>.png` (ids below).
- Creators get the same etched treatment as historical figures — the uniform style IS the brand statement.

## The set
| id | Figure | Reference era/look |
|---|---|---|
| einstein | Albert Einstein | older, unruly hair, mustache |
| darwin | Charles Darwin | elderly, full white beard |
| aurelius | Marcus Aurelius | classical bust likeness, curled beard |
| plato | Plato | classical bust likeness, broad brow, beard |
| douglass | Frederick Douglass | mid-life, swept hair, formal coat |
| curie | Marie Curie | hair up, dark dress |
| rogan | Joe Rogan | shaved head, headphones optional but prefer none |
| mrbeast | MrBeast | short beard, casual crew-neck |

## Prompt template
> Engraved portrait of **[figure]**, 19th-century stipple etching style, fine hatched linework, single dark sepia ink on warm cream paper (#f7f5f0), head and shoulders, facing slightly off-axis, neutral thoughtful expression, plain background, no border, no signature.

## Acceptance check
Placed side by side at 48px (roster circle) and 96×128px (intro plaque), all eight should read as one commissioned series: same ink density, same head scale, same cream ground.
