Roster plaque card for a figure or creator; use in the roster grid, selection flows, and landing showcases.

```jsx
<FigureCard name="Charles Darwin" era="1809–1882" kind="historical"
  categories={["Scientists"]} fields={["Biology", "Evolution"]}
  description="Naturalist and biologist, developed the theory of evolution."
  onClick={openIntro} />
```

Variants: `selected` (lapis border + tint), `available={false}` (dimmed, "No sources ingested yet"), `kind="creator"` (bronze meta line), `portrait` URL (greyscale-treated) vs monogram fallback.
