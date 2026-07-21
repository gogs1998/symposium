import React from "react";
import { IconButton } from "../core/IconButton.jsx";

/**
 * Composer — the message input. Auto-sizing textarea, an accent send control, and a
 * persistent hairline disclosure that this is an AI recreation. `busy` disables send and
 * swaps the label. Enter sends; Shift+Enter newlines.
 */
export function Composer({
  value,
  onChange,
  onSend,
  placeholder = "Write to the figure…",
  figureName,
  busy = false,
  disclosure = true,
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  const submit = () => {
    if (busy || !value || !value.trim()) return;
    onSend && onSend(value);
  };

  return (
    <div className="sym-composer" style={{ display: "flex", flexDirection: "column", gap: "8px", ...style }} {...rest}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-3) var(--space-3) var(--space-4)",
          background: "var(--surface-card)",
          border: "1px solid var(--border-line)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          transition: "border-color var(--dur-fast) var(--ease-out)",
        }}
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          placeholder={figureName ? `Write to ${figureName}…` : placeholder}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          style={{
            flex: 1,
            resize: "none",
            border: "none",
            outline: "none",
            background: "transparent",
            font: "var(--fw-regular) var(--text-md)/1.55 var(--font-serif)",
            color: "var(--text-strong)",
            maxHeight: 200,
            padding: "6px 0",
          }}
        />
        <IconButton label={busy ? "Sending" : "Send"} variant="solid" size="md" disabled={busy || !value || !value.trim()} onClick={submit}>
          {busy ? <span style={{ fontSize: 15 }}>◦</span> : <span style={{ fontSize: 16, transform: "translateX(-1px)" }}>↑</span>}
        </IconButton>
      </div>
      {disclosure && (
        <p style={{ margin: 0, textAlign: "center", font: "var(--fw-regular) var(--text-xs)/1.4 var(--font-sans)", color: "var(--text-faint)" }}>
          An AI recreation grounded in {figureName ? `${figureName}’s` : "the figure’s"} own words — not the real person. Responses may err.
        </p>
      )}
    </div>
  );
}
