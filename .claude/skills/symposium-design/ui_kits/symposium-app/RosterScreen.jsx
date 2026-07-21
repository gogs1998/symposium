const { FigureCard, CategoryTabs, Button, Badge } = window.SymposiumDesignSystem_32eaa4;

function Masthead() {
  return (
    <header style={{ borderBottom: "1px solid var(--border-line)", background: "var(--surface-page)" }}>
      <div style={{ maxWidth: "var(--width-page)", margin: "0 auto", padding: "0 var(--space-8)", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <span style={{ font: "var(--fw-regular) 26px/1 var(--font-display)", letterSpacing: "0.02em", color: "var(--text-strong)" }}>Symposium</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
          <span className="sym-eyebrow" style={{ fontSize: 11 }}>The reading room</span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button variant="quiet" size="sm">About</Button>
          <Button variant="secondary" size="sm">Sign in</Button>
        </div>
      </div>
    </header>
  );
}

function RosterScreen({ onOpenFigure }) {
  const [cat, setCat] = React.useState("historical");
  const figures = window.SYM_DATA.figures;
  const counts = {
    historical: figures.filter((f) => f.category === "historical").length,
    creator: figures.filter((f) => f.category === "creator").length,
  };
  const shown = figures.filter((f) => f.category === cat);

  return (
    <div style={{ minHeight: "100%", background: "var(--surface-page)", backgroundImage: "var(--texture-grain)" }}>
      <Masthead />
      <main style={{ maxWidth: "var(--width-page)", margin: "0 auto", padding: "var(--space-10) var(--space-8) var(--space-12)" }}>
        {/* Hero */}
        <div style={{ maxWidth: 780, marginBottom: "var(--space-9)" }}>
          <span className="sym-eyebrow">A room of remarkable people</span>
          <h1 style={{ margin: "14px 0 0", font: "var(--fw-regular) var(--text-5xl)/1.02 var(--font-display)", color: "var(--text-strong)", textWrap: "balance" }}>
            Sit with the minds that shaped us —<br />and the ones shaping us now.
          </h1>
          <p style={{ margin: "20px 0 0", maxWidth: "58ch", font: "var(--fw-regular) var(--text-lg)/1.6 var(--font-serif)", color: "var(--text-muted)", textWrap: "pretty" }}>
            Every figure is an AI recreation, grounded in their own words. Ask, and each reply cites its source — a passage from the page, or the exact moment in a video.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "var(--space-7)", flexWrap: "wrap", gap: "16px" }}>
          <CategoryTabs value={cat} onChange={setCat} counts={counts} />
          <span style={{ font: "var(--fw-regular) var(--text-sm)/1 var(--font-mono)", color: "var(--text-faint)" }}>
            {shown.filter((f) => f.status === "published").length} available · {shown.filter((f) => f.status === "coming-soon").length} coming soon
          </span>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-5)" }}>
          {shown.map((f) => (
            <FigureCard key={f.id} {...f} onClick={() => onOpenFigure(f)} />
          ))}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { RosterScreen, Masthead });
