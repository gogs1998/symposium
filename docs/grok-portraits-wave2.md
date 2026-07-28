# Grok portrait master prompt — wave 2 (21 new figures)

These must match the existing roster's portrait series exactly so the whole wall
reads as one collection. Same treatment for every figure: **19th-century stipple
etching, single dark sepia ink on warm cream paper (#f7f5f0), fine hatched linework,
head and shoulders, facing slightly off-axis, neutral thoughtful expression, plain
background, no border, no signature, no text.** Square (1:1), head-and-shoulders,
consistent framing and ink weight across all of them.

Deliver one PNG per figure, transparent or #f7f5f0 background, named exactly
`<id>.png`, dropped into `frontend/public/portraits/`.

---

## Master prompt (paste to Grok, once per figure)

> Engraved portrait of **{LOOK}**, 19th-century stipple etching style, fine hatched
> linework, single dark sepia ink on warm cream paper (#f7f5f0), head and shoulders,
> facing slightly off-axis, neutral thoughtful expression, plain background, no
> border, no signature, no text. Square 1:1.

Replace `{LOOK}` with each row below. Keep everything else identical every time —
the uniformity is the brand.

| filename | {LOOK} |
|---|---|
| `feynman.png` | Richard Feynman, mid-century physicist, warm animated face, short dark hair, open collar |
| `watts.png` | Alan Watts, 1960s philosopher, neat beard and mustache, receding hairline, tweed jacket |
| `hitchens.png` | Christopher Hitchens, middle-aged essayist, tousled hair, slight world-weary smile, open-collar shirt |
| `sapolsky.png` | Robert Sapolsky, huge grey beard and wild grey hair, warm crinkled eyes |
| `kaku.png` | Michio Kaku, older physicist, long swept silver hair, calm smile |
| `neiltyson.png` | Neil deGrasse Tyson, astrophysicist, close-cropped hair, trimmed mustache and goatee, broad build |
| `goggins.png` | David Goggins, shaved head, lean intense face, strong jaw, direct hard gaze |
| `arnold.png` | Arnold Schwarzenegger, older, square jaw, side-swept hair, faint smile |
| `ramsay.png` | Gordon Ramsay, weathered chef, deeply lined face, tousled fair hair, intense look |
| `mcconaughey.png` | Matthew McConaughey, lean Southern features, swept-back hair, easy half-smile |
| `rubin.png` | Rick Rubin, long grey beard, bald head, serene eyes, plain shirt |
| `theovon.png` | Theo Von, younger man, voluminous swept-up hair, mischievous grin, stubble |
| `naval.png` | Naval Ravikant, shaved head, calm thoughtful face, trimmed stubble |
| `buffett.png` | Warren Buffett, elderly, large glasses, thin white hair, folksy warm smile |
| `bezos.png` | Jeff Bezos, bald, strong jaw, broad confident grin |
| `jensen.png` | Jensen Huang, silver hair swept back, glasses, slight smile, high collar (evokes the leather jacket) |
| `altman.png` | Sam Altman, youthful, short tidy hair, calm measured expression |
| `jobs.png` | Steve Jobs, close-cropped hair, round rimless glasses, short grey beard, black turtleneck |
| `lex.png` | Lex Fridman, dark hair, dark suit and black tie, sincere earnest expression, slight stubble |
| `hormozi.png` | Alex Hormozi, shaved head, thick dark beard, broad muscular build, direct gaze |
| `samharris.png` | Sam Harris, balding with short hair, lean face, calm neutral expression |

---

## Notes
- If Grok drifts toward photorealism or colour, re-emphasise "stipple etching,
  single sepia ink, hatched linework, no colour" — the series look is the point.
- Living figures: keep them recognisable but rendered as the same antique etching,
  not a photo. That antique treatment is also what keeps the roster tasteful and
  consistent rather than a mix of stock photos.
- After they land in `frontend/public/portraits/`, the app picks them up
  automatically (the card/portrait components already point at `/portraits/<id>.png`
  and fall back to the monogram until the file exists).
