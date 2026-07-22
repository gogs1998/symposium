import React from "react";

/**
 * IconButton — square, glyph-only control. For toolbar / composer actions.
 * Variants: solid (accent), outline, ghost. Sizes: sm | md | lg.
 */
export function IconButton({
  children,
  label,
  variant = "ghost",
  size = "md",
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const dim = { sm: 30, md: 38, lg: 46 }[size];
  const variants = {
    solid: { background: "var(--accent)", color: "var(--text-on-accent)", border: "1px solid var(--accent)" },
    outline: { background: "var(--surface-card)", color: "var(--text-strong)", border: "1px solid var(--border-line)" },
    ghost: { background: "transparent", color: "var(--text-muted)", border: "1px solid transparent" },
  }[variant];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`sym-iconbtn sym-iconbtn--${variant}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim,
        height: dim,
        fontSize: dim * 0.46,
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
        ...variants,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
