function Landing() {
  const { FigureCard, CitationCard, DisclosureBanner, MessageBubble } = window.SymposiumDesignSystem_7c9615;
  const Label = ({ children, style }) => <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', ...style }}>{children}</div>;
  const roster = [
    { name: 'Albert Einstein', era: '1879–1955', categories: ['Scientists'], fields: ['Physics'], description: 'Grounded in his papers, essays and letters.' },
    { name: 'Marcus Aurelius', era: '121–180 CE', categories: ['Philosophers'], fields: ['Stoicism'], description: 'Grounded in the Meditations and letters to Fronto.' },
    { name: 'Frederick Douglass', era: '1818–1895', categories: ['Reformers'], fields: ['Rhetoric'], description: 'Grounded in his narratives and collected speeches.' },
    { name: 'Joe Rogan', era: 'Creator', kind: 'creator', categories: ['Creators'], fields: ['Podcasts'], description: 'Grounded in 612 hours of long-form conversation.' },
  ];
  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-body)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 'var(--content-max)', margin: '0 auto', padding: '20px var(--space-6)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', letterSpacing: '0.08em' }}>SYMPOSIUM</span>
        <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center' }}>
          <a href="#roster" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', border: 'none' }}>The roster</a>
          <a href="#ethics" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', border: 'none' }}>Ethics</a>
          <a href="#" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', background: 'var(--ink-1)', color: 'var(--ink-inverse)', borderRadius: 'var(--radius-1)', padding: '9px 18px', border: 'none' }}>ENTER</a>
        </div>
      </nav>
      <header style={{ textAlign: 'center', padding: 'var(--space-9) var(--space-6) var(--space-8)', borderBottom: '1px solid var(--stone-line)' }}>
        <Label>An archive that answers back</Label>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-display)', maxWidth: 820, margin: '16px auto 0' }}>Converse with the people behind the books, the speeches, the episodes.</h1>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)', maxWidth: 560, margin: '20px auto 0', lineHeight: 1.6 }}>Each recreation is built only from its subject's own corpus — and every reply cites the passage it drew on.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 'var(--space-6)' }}>
          <a href="#" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.06em', background: 'var(--ink-1)', color: 'var(--ink-inverse)', borderRadius: 'var(--radius-1)', padding: '13px 26px', border: 'none' }}>BEGIN A CONVERSATION</a>
          <a href="#promise" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: 'var(--text-body)', border: '1px solid var(--stone-line-strong)', borderRadius: 'var(--radius-1)', padding: '13px 26px', background: 'var(--surface-card)' }}>HOW IT WORKS</a>
        </div>
      </header>
      <section id="promise" style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-8) var(--space-6)', display: 'grid', gridTemplateColumns: '5fr 6fr', gap: 'var(--space-7)', alignItems: 'center' }}>
        <div>
          <Label style={{ color: 'var(--bronze-deep)' }}>The promise</Label>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'var(--text-2xl)', lineHeight: 1.2, margin: '10px 0 0' }}>Every reply cites its source.</h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-body)', marginTop: 14, maxWidth: '48ch' }}>Before a persona says a word, the most relevant passages are retrieved from its corpus. The reply is written from those passages — and shows them to you. Books cite chapter and page. Videos deep-link to the exact timestamp. Where the corpus is silent, the recreation says so rather than guessing.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MessageBubble role="user">What convinced you natural selection was real?</MessageBubble>
          <MessageBubble role="assistant" author="Charles Darwin"
            citations={[<CitationCard key="c" type="book" title="On the Origin of Species" locator="ch. 4" excerpt="Natural selection acts solely by accumulating slight successive favourable variations." />]}>
            It was the accumulation of small facts that persuaded me — the finches of the Galápagos, each island with its own beak; the barnacles I dissected for eight years.
          </MessageBubble>
        </div>
      </section>
      <section id="roster" style={{ background: 'var(--surface-raised)', borderTop: '1px solid var(--stone-line)', borderBottom: '1px solid var(--stone-line)' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
          <div style={{ textAlign: 'center' }}>
            <Label>The roster</Label>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'var(--text-2xl)', margin: '10px 0 0' }}>Twenty-seven voices, one rule.</h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginTop: 10 }}>Historical figures grounded in their books. Creators grounded in their episodes and posts.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-6)', alignItems: 'start' }}>
            {roster.map(f => <FigureCard key={f.name} {...f} />)}
          </div>
        </div>
      </section>
      <section id="ethics" style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--space-8) var(--space-6)', textAlign: 'center' }}>
        <Label>On recreating a person</Label>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'var(--text-2xl)', margin: '10px 0 0' }}>Honest about what this is.</h2>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-body)', marginTop: 14, maxWidth: '54ch', marginLeft: 'auto', marginRight: 'auto' }}>These are interpretations built from documented words — not the people, and not their estates' voices. Every conversation carries a disclosure. Every source is inspectable. Creators with multiple registers are labeled by which voice a reply draws from.</p>
        <div style={{ marginTop: 'var(--space-5)' }}><DisclosureBanner /></div>
      </section>
      <footer style={{ background: 'var(--ink-1)', color: 'var(--ink-inverse)', textAlign: 'center', padding: 'var(--space-7) var(--space-6)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', letterSpacing: '0.08em' }}>SYMPOSIUM</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 10 }}>Grounded in their own words · symposium.ai</div>
      </footer>
    </div>
  );
}
window.Landing = Landing;
