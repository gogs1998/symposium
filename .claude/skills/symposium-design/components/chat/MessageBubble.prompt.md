**MessageBubble** — one conversation turn. User turns are quiet, right-aligned. Assistant turns read as a passage from the figure, with a name rule and a collapsible `citations` tray (renders CitationCard). Requires `@keyframes sym-blink` for the streaming caret (see effects/global card).

```jsx
<MessageBubble role="user">What did you mean by "the obstacle is the way"?</MessageBubble>

<MessageBubble role="assistant" author="Marcus Aurelius" accentColor="#40507A"
  citations={[{ variant:"book", excerpt:"The impediment to action advances action. What stands in the way becomes the way.", source:"Meditations", detail:"Book V, 20" }]}>
  Consider that every obstacle carries within it the material for its own overcoming…
</MessageBubble>

<MessageBubble role="assistant" author="Marcus Aurelius" streaming>The mind adapts and converts to its own purposes the obstacle</MessageBubble>
```
