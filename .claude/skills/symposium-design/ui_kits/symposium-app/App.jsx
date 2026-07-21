function App() {
  const [view, setView] = React.useState("roster"); // roster | chat
  const [figure, setFigure] = React.useState(null);
  const [activeSession, setActiveSession] = React.useState(null);

  function openFigure(f) {
    if (f.status === "coming-soon") return;
    setFigure(f);
    setActiveSession(null);
    setView("chat");
  }
  function openSession(id) {
    const s = window.SYM_DATA.sessions.find((x) => x.id === id);
    if (!s) return;
    const f = window.SYM_DATA.figures.find((x) => x.id === s.figureId);
    setFigure(f);
    setActiveSession(id);
  }

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {view === "roster" ? (
        <div style={{ height: "100%", overflowY: "auto" }}>
          <RosterScreen onOpenFigure={openFigure} />
        </div>
      ) : (
        <ChatScreen
          figure={figure}
          onBack={() => setView("roster")}
          activeSession={activeSession}
          onSelectSession={openSession}
          onNewConversation={() => setView("roster")}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
