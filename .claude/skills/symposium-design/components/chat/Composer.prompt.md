**Composer** — the chat input. Auto-sizing serif textarea + accent send button, with a persistent AI-recreation disclosure beneath (keep it on). Enter sends, Shift+Enter newlines.

```jsx
<Composer value={draft} onChange={setDraft} onSend={send} figureName="Churchill" busy={streaming} />
```
