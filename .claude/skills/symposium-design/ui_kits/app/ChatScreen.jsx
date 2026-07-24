function ChatScreen({ figure, initialQuestion, onBack }) {
  const { MessageBubble: CB, CitationCard: CC, Composer: CComposer, TypingIndicator: CTyping, RegisterIndicator: CReg, DisclosureBanner: CDisc, SourcesPanel: CSources, SuggestedQuestion: CSuggested } = window.SymposiumDesignSystem_7c9615;
  const [messages, setMessages] = React.useState([]);
  const [typing, setTyping] = React.useState(false);
  const [register, setRegister] = React.useState((figure.registers || [])[1] || (figure.registers || [])[0] || 'written');
  const [showSources, setShowSources] = React.useState(false);
  const scrollRef = React.useRef(null);
  const isCreator = (figure.registers || []).length > 1;

  const reply = window.SYM_DATA.replies[figure.id] || window.SYM_DATA.replies.default;

  const send = text => {
    setMessages(m => [...m, { role: 'user', text }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: 'assistant', text: reply.text, register: isCreator ? register : reply.register, citations: reply.citations }]);
    }, 1400);
  };
  const nudge = r => {
    setRegister(r);
    setMessages(m => [...m, { role: 'system', text: `Drawing from the ${r} voice` }]);
  };
  React.useEffect(() => { if (initialQuestion) send(initialQuestion); }, []);
  React.useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages, typing]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px var(--space-6)', borderBottom: '1px solid var(--stone-line)', background: 'var(--surface-card)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', padding: 0 }}>← Roster</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>{figure.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 12 }}>{figure.era}</span>
        </div>
        {isCreator && <CReg registers={figure.registers} active={register} onNudge={nudge} />}
        <button onClick={() => setShowSources(true)} style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', background: 'var(--surface-raised)', border: '1px solid var(--stone-line-strong)', borderRadius: 'var(--radius-1)', padding: '8px 14px', cursor: 'pointer', color: 'var(--text-body)' }}>SOURCES</button>
      </header>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-5) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {messages.length === 0 && !typing && (
            <div style={{ textAlign: 'center', padding: 'var(--space-7) 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>Ask anything.</div>
              <div style={{ fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: 6 }}>Replies draw only on what {figure.name} actually {figure.kind === 'creator' ? 'said and wrote' : 'wrote'}.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginTop: 'var(--space-5)' }}>
                {(figure.openers || []).slice(0, 3).map(q => <CSuggested key={q} text={q} onClick={() => send(q)} />)}
              </div>
            </div>
          )}
          {messages.map((m, i) => m.role === 'system'
            ? <CB key={i} role="system">{m.text}</CB>
            : <CB key={i} role={m.role} author={m.role === 'assistant' ? figure.name : undefined} register={m.role === 'assistant' && isCreator ? m.register : undefined}
                citations={m.citations && m.citations.map((c, j) => <CC key={j} {...c} />)}>{m.text}</CB>)}
          {typing && <CTyping label="Consulting the corpus" />}
        </div>
      </div>
      <div style={{ background: 'var(--surface-card)' }}>
        <CDisc figureName={figure.name} basis={figure.basis} compact />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-4)' }}>
          <CComposer placeholder={`Ask ${figure.name} anything…`} disabled={typing} onSend={send} />
        </div>
      </div>
      {showSources && (
        <div onClick={() => setShowSources(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(28,43,58,.32)', display: 'flex', justifyContent: 'flex-end', zIndex: 40 }}>
          <div onClick={e => e.stopPropagation()} style={{ height: '100%' }}>
            <CSources figureName={figure.name} basis={figure.basis} totals={figure.totals} books={figure.books || []} videos={figure.videos || []} collections={figure.collections || []} onClose={() => setShowSources(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
window.ChatScreen = ChatScreen;
