import React from "react";

/**
 * FigurePortrait — a figure's likeness. Accepts an image `src`; when absent, renders a
 * dignified typographic monogram plate (initials in display serif over a warm plate that
 * carries a subtle personal accent — an era tint for historical figures, the channel color
 * for creators). Shape: portrait (default), square, or round.
 */
export function FigurePortrait({
  src,
  name = "",
  accentColor,
  category = "historical",
  shape = "portrait",
  size = 96,
  grain = true,
  style,
  ...rest
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const ratio = { portrait: 4 / 5, square: 1, round: 1 }[shape];
  const w = size;
  const h = shape === "portrait" ? Math.round(size / ratio) : size;
  const radius = shape === "round" ? "50%" : "var(--radius-sm)";
  const plate = accentColor
    ? `color-mix(in oklab, ${accentColor} 16%, var(--paper-2))`
    : category === "creator"
    ? "var(--paper-2)"
    : "var(--indigo-100)";
  const ink = accentColor
    ? `color-mix(in oklab, ${accentColor} 62%, var(--ink-0))`
    : category === "creator"
    ? "var(--ink-1)"
    : "var(--indigo-500)";

  return (
    <div
      className="sym-portrait"
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: radius,
        overflow: "hidden",
        background: src ? "var(--paper-2)" : plate,
        border: "1px solid var(--border-line)",
        boxShadow: "var(--shadow-inset)",
        flex: "none",
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "saturate(0.92) contrast(1.02)" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: `var(--fw-regular) ${Math.round(size * 0.42)}px/1 var(--font-display)`,
            color: ink,
            letterSpacing: "0.01em",
          }}
        >
          {initials || "—"}
        </div>
      )}
      {grain && (
        <div
          aria-hidden
          style={{ position: "absolute", inset: 0, backgroundImage: "var(--texture-grain)", pointerEvents: "none", mixBlendMode: "multiply" }}
        />
      )}
    </div>
  );
}
