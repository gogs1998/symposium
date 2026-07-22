import React from "react";

/**
 * Badge — small status marker. Used for availability ("Published" / "Coming soon")
 * and counts. Tones map to semantic colors; `dot` prepends a status dot.
 */
export function Badge({ children, tone = "neutral", dot = false, style, ...rest }) {
  const tones = {
    neutral: { bg: "var(--paper-3)", fg: "var(--text-muted)", dc: "var(--ink-3)" },
    accent: { bg: "var(--accent-soft)", fg: "var(--accent-press)", dc: "var(--accent)" },
    live: { bg: "var(--success-soft)", fg: "var(--success)", dc: "var(--success)" },
    pending: { bg: "var(--warning-soft)", fg: "var(--warning)", dc: "var(--warning)" },
    danger: { bg: "var(--danger-soft)", fg: "var(--danger)", dc: "var(--danger)" },
  }[tone];

  return (
    <span
      className={`sym-badge sym-badge--${tone}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 9px",
        background: tones.bg,
        color: tones.fg,
        font: "var(--fw-semibold) var(--text-2xs)/1 var(--font-sans)",
        letterSpacing: "var(--tracking-caps)",
        textTransform: "uppercase",
        borderRadius: "var(--radius-pill)",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: tones.dc, flex: "none" }} />
      )}
      {children}
    </span>
  );
}
