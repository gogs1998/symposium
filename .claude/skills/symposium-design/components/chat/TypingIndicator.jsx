import React from "react";

/**
 * TypingIndicator — the "figure is thinking" state. A name rule matching MessageBubble,
 * then three rising dots in the figure's accent and a quiet status line.
 */
export function TypingIndicator({ author, accentColor, label = "is composing a reply", style, ...rest }) {
  const dot = (i) => (
    <span
      key={i}
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: accentColor || "var(--accent)",
        display: "inline-block",
        animation: "sym-thinking 1.3s var(--ease-in-out) infinite",
        animationDelay: `${i * 0.16}s`,
      }}
    />
  );
  return (
    <div className="sym-typing" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", ...style }} {...rest}>
      {author && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor || "var(--accent)", flex: "none" }} />
          <span style={{ font: "var(--fw-regular) var(--text-md)/1 var(--font-display)", color: "var(--text-strong)" }}>{author}</span>
          <span style={{ flex: 1, height: 1, background: "var(--border-hair)" }} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ display: "inline-flex", gap: "5px", alignItems: "flex-end", height: 12 }}>{[0, 1, 2].map(dot)}</span>
        <span style={{ font: "var(--fw-regular) var(--text-sm)/1 var(--font-sans)", fontStyle: "italic", color: "var(--text-muted)" }}>
          {author ? `${author} ${label}` : label}
        </span>
      </div>
    </div>
  );
}
