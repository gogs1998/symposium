const { SessionSidebar, MessageBubble, TypingIndicator, Composer, SuggestedQuestion, DisclosureBanner, FigurePortrait, IconButton, Button, Badge } = window.SymposiumDesignSystem_32eaa4;

function ChatHeader({ figure, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border-line)", background: "var(--surface-page)" }}>
      <IconButton label="Back to roster" variant="ghost" onClick={onBack}>←</IconButton>
      <FigurePortrait name={figure.name} category={figure.category} accentColor={figure.accentColor} shape="round" size={38} grain={false} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ font: "var(--fw-regular) var(--text-xl)/1 var(--font-display)", color: "var(--text-strong)" }}>{figure.name}</span>
          <DisclosureBanner figureName={figure.name} inline />
        </div>
        <span style={{ font: "var(--fw-regular) var(--text-xs)/1.4 var(--font-sans)", color: "var(--text-faint)" }}>{figure.meta}</span>
      </div>
      <Button variant="ghost" size="sm">Sources</Button>
    </div>
  );
}

function EmptyState({ figure, onAsk }) {
  return (
    <div style={{ maxWidth: "var(--width-chat)", margin: "0 auto", padding: "var(--space-10) var(--space-6)", textAlign: "center" }}>
      <FigurePortrait name={figure.name} category={figure.category} accentColor={figure.accentColor} size={92} style={{ margin: "0 auto" }} />
      <h2 style={{ margin: "var(--space-5) 0 0", font: "var(--fw-regular) var(--text-3xl)/1.1 var(--font-display)", color: "var(--text-strong)" }}>{figure.name}</h2>
      <p style={{ margin: "12px auto 0", maxWidth: "46ch", font: "var(--fw-regular) var(--text-md)/1.6 var(--font-serif)", color: "var(--text-muted)", textWrap: "pretty" }}>{figure.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "var(--space-8) 0 var(--space-4)" }}>
        <span style={{ flex: 1, height: 1, background: "var(--border-hair)" }} />
        <span className="sym-eyebrow">Begin with</span>
        <span style={{ flex: 1, height: 1, background: "var(--border-hair)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
        {figure.openers.map((q, i) => (
          <SuggestedQuestion key={i} accentColor={figure.accentColor} onClick={() => onAsk(q)}>{q}</SuggestedQuestion>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ accentColor, onRetry }) {
  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "var(--space-9) var(--space-6)", textAlign: "center" }}>
      <div style={{ width: 44, height: 44, margin: "0 auto", borderRadius: "50%", border: "1.5px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", font: "var(--fw-regular) 22px/1 var(--font-display)" }}>!</div>
      <h3 style={{ margin: "var(--space-4) 0 0", font: "var(--fw-regular) var(--text-2xl)/1.15 var(--font-display)", color: "var(--text-strong)" }}>The line went quiet.</h3>
      <p style={{ margin: "10px auto 0", maxWidth: "38ch", font: "var(--fw-regular) var(--text-md)/1.55 var(--font-serif)", color: "var(--text-muted)", textWrap: "pretty" }}>
        We couldn't reach the archive to compose a reply. Your message is safe — try again in a moment.
      </p>
      <div style={{ marginTop: "var(--space-5)" }}>
        <Button variant="secondary" onClick={onRetry}>Try again</Button>
      </div>
    </div>
  );
}

function ChatScreen({ figure, onBack, onSelectSession, activeSession, onNewConversation }) {
  const [messages, setMessages] = React.useState([]);
  const [draft, setDraft] = React.useState("");
  const [phase, setPhase] = React.useState("idle"); // idle | thinking | streaming | error
  const [streamText, setStreamText] = React.useState("");
  const threadRef = React.useRef(null);
  const timers = React.useRef([]);

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, phase, streamText]);

  const reply = window.SYM_DATA.replies[figure.id] || window.SYM_DATA.replies.marcus;

  function send(text, { fail = false } = {}) {
    if (!text.trim()) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", text }]);
    setPhase("thinking");
    timers.current.push(setTimeout(() => {
      if (fail) { setPhase("error"); return; }
      setPhase("streaming");
      const full = reply.text;
      let i = 0;
      const step = () => {
        i += Math.max(2, Math.round(full.length / 60));
        setStreamText(full.slice(0, i));
        if (i < full.length) timers.current.push(setTimeout(step, 30));
        else {
          setStreamText("");
          setMessages((m) => [...m, { role: "assistant", text: full, citations: reply.citations }]);
          setPhase("idle");
        }
      };
      step();
    }, 1400));
  }

  const empty = messages.length === 0 && phase === "idle";

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--surface-page)" }}>
      <SessionSidebar
        sessions={window.SYM_DATA.sessions}
        activeId={activeSession}
        onSelect={onSelectSession}
        onNew={onNewConversation}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <ChatHeader figure={figure} onBack={onBack} />
        <DisclosureBanner figureName={figure.name} />
        <div ref={threadRef} style={{ flex: 1, overflowY: "auto", backgroundImage: "var(--texture-grain)" }}>
          {empty ? (
            <EmptyState figure={figure} onAsk={(q) => send(q)} />
          ) : phase === "error" ? (
            <div style={{ maxWidth: "var(--width-chat)", margin: "0 auto", padding: "var(--space-6)" }}>
              {messages.map((m, i) => <Msg key={i} m={m} figure={figure} />)}
              <ErrorState accentColor={figure.accentColor} onRetry={() => { setPhase("idle"); const last = [...messages].reverse().find((x) => x.role === "user"); if (last) send(last.text); }} />
            </div>
          ) : (
            <div style={{ maxWidth: "var(--width-chat)", margin: "0 auto", padding: "var(--space-7) var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-7)" }}>
              {messages.map((m, i) => <Msg key={i} m={m} figure={figure} />)}
              {phase === "thinking" && <TypingIndicator author={figure.name} accentColor={figure.accentColor} label={figure.category === "creator" ? "is scanning the transcripts" : "is consulting the text"} />}
              {phase === "streaming" && <MessageBubble role="assistant" author={figure.name} accentColor={figure.accentColor} streaming>{streamText}</MessageBubble>}
            </div>
          )}
        </div>
        <div style={{ borderTop: "1px solid var(--border-line)", background: "var(--surface-page)", padding: "var(--space-4) var(--space-6) var(--space-5)" }}>
          <div style={{ maxWidth: "var(--width-chat)", margin: "0 auto" }}>
            <Composer value={draft} onChange={setDraft} onSend={(t) => send(t)} figureName={figure.name} busy={phase === "thinking" || phase === "streaming"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Msg({ m, figure }) {
  if (m.role === "user") return <MessageBubble role="user">{m.text}</MessageBubble>;
  return <MessageBubble role="assistant" author={figure.name} accentColor={figure.accentColor} citations={m.citations}>{m.text}</MessageBubble>;
}

Object.assign(window, { ChatScreen, ChatHeader, EmptyState, ErrorState });
