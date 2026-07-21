# Symposium — App UI Kit

Interactive click-through recreation of the Symposium product: a chat platform for AI recreations of real people, grounded in their own words.

## Run it
Open `index.html`. It boots the roster (landing), lets you open any published figure, shows the first-visit empty state with suggested openers, then simulates a thinking → streaming → cited reply when you send a message. `states.html` isolates the empty / thinking / error states side by side.

## Files
- `index.html` — mounts the app (React + Babel + the compiled DS bundle).
- `data.js` — demo content: `window.SYM_DATA` (figures, sessions, canned replies with citations). Not production data.
- `RosterScreen.jsx` — landing page: masthead, hero, `CategoryTabs`, `FigureCard` grid.
- `ChatScreen.jsx` — conversation view: `SessionSidebar`, chat header, `DisclosureBanner`, thread of `MessageBubble` + `CitationCard`, `TypingIndicator`, `Composer`; plus `EmptyState` and `ErrorState`.
- `App.jsx` — routes roster ↔ chat.
- `states.html` — empty / thinking / error specimen.

## Notes
- Screens compose the published DS primitives (`window.SymposiumDesignSystem_32eaa4`) — they do not re-implement them.
- Streaming, timings, and replies are faked for the demo; wire to a real backend in production.
- Figure portraits use the monogram fallback (no likeness images shipped) — pass real `src` URLs in production.
