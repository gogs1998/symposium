import React from "react";

/**
 * DisclosureBanner — the persistent "AI recreation, not the real person" notice. A quiet
 * ruled strip, not an alert. `inline` renders a compact one-line version for headers.
 */
export function DisclosureBanner({ figureName, inline = false, style, ...rest }) {
  if (inline) {
    return (
      <span
        className="sym-disclosure sym-disclosure--inline"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", font: "var(--fw-medium) var(--text-xs)/1 var(--font-sans)", color: "var(--text-faint)", ...style }}
        {...rest}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--text-faint)" }} />
        AI recreation
      </span>
    );
  }
  return (
    <div
      className="sym-disclosure"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px var(--space-4)",
        background: "var(--surface-sunken)",
        borderTop: "1px solid var(--border-hair)",
        borderBottom: "1px solid var(--border-hair)",
        font: "var(--fw-regular) var(--text-sm)/1.4 var(--font-sans)",
        color: "var(--text-muted)",
        ...style,
      }}
      {...rest}
    >
      <span aria-hidden style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-faint)" }}>ⓘ</span>
      <span style={{ textWrap: "pretty" }}>
        You’re speaking with an AI recreation of {figureName || "this figure"}, grounded in their own words. It is not the real person, and every claim is cited to a source.
      </span>
    </div>
  );
}
