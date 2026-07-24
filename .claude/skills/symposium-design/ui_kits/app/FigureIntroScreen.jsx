function FigureIntroScreen({ figure, onBegin, onBack, onOpenWith }) {
  const { SuggestedQuestion: IntroSuggested, DisclosureBanner: IntroDisclosure } = window.SymposiumDesignSystem_7c9615;
  const regMeta = { 'on-camera': ['var(--register-oncamera)', 'On-camera voice'], 'conversational': ['var(--register-conversational)', 'Conversational voice'], 'written': ['var(--register-written)', 'Written voice'] };
  const initials = figure.name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const srcBits = [];
  if (figure.books && figure.books.length) srcBits.push(`${figure.books.length} books`);
  if (figure.videos && figure.videos.length) srcBits.push(`${figure.videos.length} video sources`);
  if (figure.collections && figure.collections.length) srcBits.push(`${figure.collections.length} post collections`);
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--space-6)' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', padding: 0 }}>← The roster</button>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--stone-line)', borderRadius: 'var(--radius-2)', boxShadow: 'var(--shadow-1)', marginTop: 'var(--space-4)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 'var(--space-5)', padding: 'var(--space-6)', alignItems: 'center' }}>
          <div style={{ width: 96, height: 128, flexShrink: 0, borderRadius: 'var(--radius-1)', background: 'var(--surface-inset)', border: '1px solid var(--stone-line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--text-muted)' }}>{initials}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: figure.kind === 'creator' ? 'var(--bronze-deep)' : 'var(--text-muted)' }}>{figure.categories[0]} · {figure.era}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', lineHeight: 'var(--leading-tight)', marginTop: 4 }}>{figure.name}</div>
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginTop: 8 }}>{figure.description}</div>
          </div>
        </div>
        <div style={{ borderTop: 'var(--rule-double)', padding: 'var(--space-5) var(--space-6)', background: 'var(--surface-raised)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>How this recreation was built</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {srcBits.map(b => <span key={b} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--bronze-deep)', background: 'var(--bronze-tint)', border: '1px solid var(--stone-line)', borderRadius: 'var(--radius-1)', padding: '3px 9px' }}>{b}</span>)}
            {(figure.registers || []).map(r => <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', border: '1px solid var(--stone-line)', borderRadius: 999, padding: '3px 10px', background: 'var(--surface-card)' }}><span style={{ width: 6, height: 6, borderRadius: 999, background: regMeta[r][0] }}></span>{regMeta[r][1]}</span>)}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 10, maxWidth: '58ch' }}>{figure.builtNote}</div>
        </div>
        <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Openers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            {(figure.openers || []).map(q => <IntroSuggested key={q} text={q} onClick={() => onOpenWith(q)} />)}
          </div>
          <button onClick={onBegin} style={{ marginTop: 'var(--space-5)', width: '100%', fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', letterSpacing: '0.08em', background: 'var(--ink-1)', color: 'var(--ink-inverse)', border: 'none', borderRadius: 'var(--radius-1)', padding: '14px 0', cursor: 'pointer' }}>BEGIN THE CONVERSATION</button>
        </div>
      </div>
      <div style={{ marginTop: 'var(--space-4)' }}><IntroDisclosure figureName={figure.name} basis={figure.basis} compact /></div>
    </div>
  );
}
window.FigureIntroScreen = FigureIntroScreen;
