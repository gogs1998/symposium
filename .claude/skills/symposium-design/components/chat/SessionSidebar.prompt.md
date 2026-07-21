**SessionSidebar** — the conversation-history rail on the chat view. Each row: figure dot, title, meta line. `activeId` highlights the current session; `onNew` starts a fresh one.

```jsx
<SessionSidebar
  activeId="s1"
  onSelect={openSession} onNew={startNew}
  sessions={[
    { id:"s1", title:"On facing hardship", figure:"Marcus Aurelius", time:"just now", accentColor:"#40507A" },
    { id:"s2", title:"Is the universe deterministic?", figure:"Veritasium", time:"2h ago", accentColor:"#2A6DF4" },
  ]}
/>
```
