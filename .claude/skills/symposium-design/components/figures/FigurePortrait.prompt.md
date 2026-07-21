**FigurePortrait** — a figure's likeness. Pass `src` for a real portrait; without one it renders a dignified monogram plate tinted by `accentColor` (era hue or creator channel color). Use inside FigureCard, chat headers, and message avatars.

```jsx
<FigurePortrait name="Marcus Aurelius" category="historical" shape="portrait" size={120} />
<FigurePortrait name="Veritasium" category="creator" accentColor="#2A6DF4" shape="round" size={40} />
```

Shapes: `portrait | square | round`.
