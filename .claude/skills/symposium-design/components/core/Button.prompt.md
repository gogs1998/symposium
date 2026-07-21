**Button** — the primary editorial action control; use for any commit/confirm/send action. `primary` (cinnabar fill) for the one main action per view, `secondary` (ink outline) for adjacent choices, `ghost`/`quiet` for low-emphasis.

```jsx
<Button variant="primary" size="md" onClick={send}>Begin conversation</Button>
<Button variant="secondary" icon={<span>&#8592;</span>}>Back to roster</Button>
```

Variants: `primary | secondary | ghost | quiet`. Sizes: `sm | md | lg`. Props: `icon`, `iconTrailing`, `full`, `disabled`.
