import React from "react";

/**
 * Button — the primary editorial action control.
 * Variants: primary (cinnabar), secondary (ink outline), ghost, quiet.
 * Sizes: sm | md | lg. Optional leading/trailing glyph via `icon` / `iconTrailing`.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconTrailing,
  disabled = false,
  full = false,
  type = "button",
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: { h: "var(--control-sm)", px: "12px", fs: "var(--text-sm)" },
    md: { h: "var(--control-md)", px: "18px", fs: "var(--text-base)" },
    lg: { h: "var(--control-lg)", px: "26px", fs: "var(--text-md)" },
  }[size];

  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--text-on-accent)",
      border: "1px solid var(--accent)",
      boxShadow: "var(--shadow-xs)",
    },
    secondary: {
      background: "transparent",
      color: "var(--text-strong)",
      border: "1.5px solid var(--ink-0)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-body)",
      border: "1px solid var(--border-line)",
    },
    quiet: {
      background: "transparent",
      color: "var(--text-muted)",
      border: "1px solid transparent",
    },
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`sym-btn sym-btn--${variant}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        height: sizes.h,
        padding: `0 ${sizes.px}`,
        width: full ? "100%" : "auto",
        font: `var(--fw-semibold) ${sizes.fs}/1 var(--font-sans)`,
        letterSpacing: "0.01em",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
        whiteSpace: "nowrap",
        ...variants,
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: "inline-flex", fontSize: "1.1em" }}>{icon}</span>}
      {children}
      {iconTrailing && <span style={{ display: "inline-flex", fontSize: "1.1em" }}>{iconTrailing}</span>}
    </button>
  );
}
