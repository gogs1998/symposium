import React from "react";

/**
 * CategoryTabs — the Historical / Creators toggle that governs the roster. Editorial
 * underline-tab treatment (not pills). `counts` optionally shows per-tab totals.
 */
export function CategoryTabs({ value, onChange, tabs, counts = {}, style, ...rest }) {
  const items = tabs || [
    { id: "historical", label: "Historical" },
    { id: "creator", label: "Creators" },
  ];

  return (
    <div
      role="tablist"
      className="sym-tabs"
      style={{
        display: "inline-flex",
        gap: "var(--space-7)",
        borderBottom: "1px solid var(--border-line)",
        ...style,
      }}
      {...rest}
    >
      {items.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange && onChange(t.id)}
            className="sym-tab"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "baseline",
              gap: "8px",
              padding: "0 2px 14px",
              marginBottom: "-1px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: active ? "var(--text-strong)" : "var(--text-muted)",
              font: `var(--fw-regular) var(--text-xl)/1 var(--font-display)`,
              transition: "color var(--dur-fast) var(--ease-out)",
            }}
          >
            {t.label}
            {counts[t.id] != null && (
              <span style={{ font: "var(--fw-medium) var(--text-sm)/1 var(--font-mono)", color: active ? "var(--accent)" : "var(--text-faint)" }}>
                {counts[t.id]}
              </span>
            )}
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -1,
                height: 2,
                background: active ? "var(--accent)" : "transparent",
                transition: "background var(--dur-med) var(--ease-out)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
