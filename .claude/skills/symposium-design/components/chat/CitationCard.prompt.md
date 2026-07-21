**CitationCard** — the source behind an assistant message; every response cites at least one. This is the system's most precisely-specified component; two variants.

**Book** (historical figures) — italic serif excerpt with a hanging quotation mark and a source rule:
```jsx
<CitationCard
  variant="book"
  index={1}
  excerpt="You have power over your mind — not outside events. Realize this, and you will find strength."
  source="Meditations"
  detail="Book IV, 3"
/>
```

**Video** (creators) — thumbnail with timestamp chip and a clickable `said in {title} @ {time}` deep-link:
```jsx
<CitationCard
  variant="video"
  index={2}
  excerpt="The universe is not obligated to make sense to you."
  videoTitle="Why Is The Universe Flat?"
  timestamp="12:34"
  channelColor="#2A6DF4"
  href="https://youtu.be/…?t=754"
  onOpen={openMoment}
/>
```
