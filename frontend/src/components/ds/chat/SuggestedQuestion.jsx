import React from "react";

/**
 * SuggestedQuestion — an opening-question chip for the empty chat. Serif prompt with a
 * quiet arrow; hover lifts the accent edge. Used in a stacked list on first visit.
 */
export function SuggestedQuestion({ children, accentColor, onClick, style, ...rest }) {
  return (
    <button
      onClick={onClick}
      className="sym-suggested"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        width: "100%",
        textAlign: "left",
        padding: "var(--space-4) var(--space-5)",
        background: "var(--surface-card)",
        border: "1px solid var(--border-line)",
        borderLeft: `3px solid ${accentColor || "var(--border-line)"}`,
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        font: "var(--fw-regular) var(--text-lg)/1.4 var(--font-serif)",
        color: "var(--text-strong)",
        transition: "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
        textWrap: "pretty",
        ...style,
      }}
      {...rest}
    >
      <span>{children}</span>
      <span aria-hidden style={{ color: accentColor || "var(--accent)", fontSize: 18, flex: "none" }}>→</span>
    </button>
  );
}
