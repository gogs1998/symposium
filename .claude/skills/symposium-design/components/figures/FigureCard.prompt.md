**FigureCard** — one figure in the roster grid. Composes FigurePortrait + Badge + Tag. `status="coming-soon"` dims it and disables the click. Pass `accentColor` for the figure's personal edge (era hue or creator channel color).

```jsx
<FigureCard
  name="Marcus Aurelius"
  category="historical"
  description="Roman emperor and Stoic. Speaks from the Meditations — duty, mortality, the discipline of the mind."
  meta="Stoic · 121–180 AD"
  accentColor="#40507A"
  onClick={openFigure}
/>
<FigureCard name="Kurzgesagt" category="creator" description="..." meta="Science & Education" accentColor="#E0563B" status="coming-soon" />
```
