import React from "react";

/**
 * SessionSidebar — the conversation history rail. Groups sessions by figure or recency,
 * each row showing a figure dot, title, and last-active line. A "New conversation" action
 * sits at the top. `activeId` highlights the current session.
 */
export function SessionSidebar({
  sessions = [],
  activeId,
  onSelect,
  onNew,
  header = "Conversations",
  style,
  ...rest
}) {
  return (
    <aside
      className="sym-sidebar"
      style={{
        width: "var(--sidebar-w)",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-page)",
        borderRight: "1px solid var(--border-line)",
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-5) var(--space-5) var(--space-4)" }}>
        <span className="sym-eyebrow">{header}</span>
        <button
          onClick={onNew}
          aria-label="New conversation"
          style={{ width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-line)", borderRadius: "var(--radius-sm)", background: "var(--surface-card)", color: "var(--text-body)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
        >
          +
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 var(--space-3) var(--space-4)" }}>
        {sessions.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              onClick={() => onSelect && onSelect(s.id)}
              className="sym-session-row"
              style={{
                width: "100%",
                textAlign: "left",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                padding: "var(--space-3)",
                marginBottom: "2px",
                border: "1px solid " + (active ? "var(--border-line)" : "transparent"),
                borderRadius: "var(--radius-sm)",
                background: active ? "var(--surface-card)" : "transparent",
                cursor: "pointer",
                transition: "background var(--dur-fast) var(--ease-out)",
              }}
            >
              <span style={{ width: 8, height: 8, marginTop: 6, borderRadius: "50%", background: s.accentColor || "var(--ink-3)", flex: "none" }} />
              <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ font: "var(--fw-medium) var(--text-base)/1.3 var(--font-sans)", color: active ? "var(--text-strong)" : "var(--text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.title}
                </span>
                <span style={{ font: "var(--fw-regular) var(--text-xs)/1.3 var(--font-sans)", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.figure}{s.figure && s.time ? " · " : ""}{s.time}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
