**IconButton** — square glyph-only control for composer/toolbar actions; always pass a `label` for accessibility. `solid` for the send action, `ghost` for secondary toolbar icons.

```jsx
<IconButton label="Send" variant="solid"><SendGlyph /></IconButton>
<IconButton label="Attach source" variant="ghost"><PaperclipGlyph /></IconButton>
```

Variants: `solid | outline | ghost`. Sizes: `sm | md | lg`.
