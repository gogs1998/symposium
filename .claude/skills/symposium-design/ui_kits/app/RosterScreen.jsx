function RosterScreen({ figures, onOpen }) {
  const { FigureCard, CategoryTabs } = window.SymposiumDesignSystem_7c9615;
  const [tab, setTab] = React.useState('Historical');
  const shown = figures.filter(f => tab === 'Creators' ? f.kind === 'creator' : f.kind === 'historical');
  const counts = { Historical: figures.filter(f => f.kind === 'historical').length, Creators: figures.filter(f => f.kind === 'creator').length };
  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 var(--space-6) var(--space-8)' }}>
      <header style={{ padding: 'var(--space-7) 0 var(--space-5)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', letterSpacing: '0.06em' }}>SYMPOSIUM</div>
        <div style={{ fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: 6 }}>Conversations grounded in their own words — every reply cites its source.</div>
      </header>
      <CategoryTabs tabs={['Historical', 'Creators']} active={tab} onChange={setTab} counts={counts} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-5)', alignItems: 'start' }}>
        {shown.map(f => <FigureCard key={f.id} {...f} onClick={() => onOpen(f)} />)}
      </div>
    </div>
  );
}
window.RosterScreen = RosterScreen;
