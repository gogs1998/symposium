import React from "react";

/**
 * Tag — a quiet inline label for category, era, or channel. More editorial than Badge:
 * mixed-case serif/sans, optional accent color hook for a creator's channel color.
 * `accentColor` overrides the dot + text hue (used for creator channel colors).
 */
export function Tag({ children, kind = "category", accentColor, onClick, style, ...rest }) {
  const interactive = !!onClick;
  const base = {
    category: { border: "var(--border-line)", color: "var(--text-muted)" },
    era: { border: "var(--indigo-200)", color: "var(--indigo-500)" },
    channel: { border: "var(--border-line)", color: "var(--text-muted)" },
  }[kind];
  const hue = accentColor || (kind === "era" ? "var(--indigo-500)" : "var(--ink-3)");

  return (
    <span
      onClick={onClick}
      role={interactive ? "button" : undefined}
      className={`sym-tag sym-tag--${kind}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "2px 10px 3px",
        border: `1px solid ${base.border}`,
        color: base.color,
        background: "transparent",
        font: "var(--fw-medium) var(--text-xs)/1.3 var(--font-sans)",
        letterSpacing: "0.01em",
        borderRadius: "var(--radius-pill)",
        cursor: interactive ? "pointer" : "default",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: hue, flex: "none" }} />
      {children}
    </span>
  );
}
