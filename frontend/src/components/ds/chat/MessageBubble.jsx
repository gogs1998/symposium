import React from "react";
import { CitationCard } from "./CitationCard.jsx";

/**
 * MessageBubble — one turn in the conversation. User turns are quiet ink-on-paper aligned
 * right; assistant turns read like a passage from the figure, left-aligned with a name rule
 * and an expandable citations tray. Set `streaming` to render the in-progress caret.
 */
export function MessageBubble({
  role = "assistant",
  author,
  accentColor,
  children,
  citations = [],
  streaming = false,
  defaultOpen = false,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const isUser = role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", ...style }} {...rest}>
        <div
          style={{
            maxWidth: "80%",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--paper-3)",
            border: "1px solid var(--border-line)",
            borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-xs) var(--radius-lg)",
            font: "var(--fw-regular) var(--text-md)/1.55 var(--font-serif)",
            color: "var(--text-strong)",
            textWrap: "pretty",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="sym-message" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", ...style }} {...rest}>
      {author && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor || "var(--accent)", flex: "none" }} />
          <span style={{ font: "var(--fw-regular) var(--text-md)/1 var(--font-display)", color: "var(--text-strong)" }}>{author}</span>
          <span style={{ flex: 1, height: 1, background: "var(--border-hair)" }} />
        </div>
      )}
      <div
        style={{
          font: "var(--fw-regular) var(--text-lg)/1.68 var(--font-serif)",
          color: "var(--text-body)",
          textWrap: "pretty",
          maxWidth: "var(--measure-reading)",
        }}
      >
        {children}
        {streaming && (
          <span
            className="sym-caret"
            style={{ display: "inline-block", width: "0.5ch", height: "1.05em", marginLeft: "2px", background: "var(--accent)", verticalAlign: "-0.12em", animation: "sym-blink 1s steps(2) infinite" }}
          />
        )}
      </div>

      {citations.length > 0 && !streaming && (
        <div style={{ marginTop: "var(--space-1)" }}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="sym-cite-toggle"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px 5px 10px",
              background: open ? "var(--accent-soft)" : "transparent",
              border: `1px solid ${open ? "var(--accent-border)" : "var(--border-line)"}`,
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              font: "var(--fw-semibold) var(--text-xs)/1 var(--font-sans)",
              letterSpacing: "var(--tracking-caps)",
              textTransform: "uppercase",
              color: open ? "var(--accent-press)" : "var(--text-muted)",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{citations.length}</span>
            {citations.length === 1 ? "Source" : "Sources"}
            <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform var(--dur-fast) var(--ease-out)", fontSize: 9 }}>▾</span>
          </button>
          {open && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginTop: "var(--space-3)", maxWidth: "var(--measure-reading)" }}>
              {citations.map((c, i) => (
                <CitationCard key={i} index={i + 1} {...c} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
