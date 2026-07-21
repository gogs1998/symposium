import React from "react";
import { FigurePortrait } from "./FigurePortrait.jsx";
import { Badge } from "../core/Badge.jsx";
import { Tag } from "../core/Tag.jsx";

/**
 * FigureCard — a single figure in the roster. Portrait, name (display serif), one-line
 * description, category tag, and availability. "Coming soon" figures render dimmed and
 * non-interactive. A hairline accent edge carries the figure's personal color.
 */
export function FigureCard({
  name,
  description,
  category = "historical",
  meta,
  accentColor,
  src,
  status = "published",
  onClick,
  style,
  ...rest
}) {
  const comingSoon = status === "coming-soon";
  const edge = accentColor || (category === "creator" ? "var(--ink-3)" : "var(--indigo-500)");

  return (
    <article
      onClick={comingSoon ? undefined : onClick}
      className="sym-figurecard"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        padding: "var(--space-5)",
        paddingLeft: "calc(var(--space-5) + 3px)",
        background: "var(--surface-card)",
        border: "1px solid var(--border-line)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
        cursor: comingSoon ? "default" : "pointer",
        opacity: comingSoon ? 0.6 : 1,
        transition: "transform var(--dur-med) var(--ease-out), box-shadow var(--dur-med) var(--ease-out)",
        overflow: "hidden",
        ...style,
      }}
      {...rest}
    >
      {/* personal accent edge */}
      <span aria-hidden style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: edge }} />

      <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
        <FigurePortrait name={name} src={src} category={category} accentColor={accentColor} size={72} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <span className="sym-eyebrow">{category === "creator" ? "Creator" : "Historical"}</span>
            <Badge tone={comingSoon ? "pending" : "live"} dot>
              {comingSoon ? "Coming soon" : "Published"}
            </Badge>
          </div>
          <h3 style={{ margin: 0, font: "var(--fw-regular) var(--text-2xl)/1.05 var(--font-display)", color: "var(--text-strong)" }}>
            {name}
          </h3>
        </div>
      </div>

      <p style={{ margin: 0, font: "var(--fw-regular) var(--text-md)/1.5 var(--font-serif)", color: "var(--text-body)", textWrap: "pretty" }}>
        {description}
      </p>

      {meta && (
        <div style={{ marginTop: "auto", paddingTop: "var(--space-2)" }}>
          <Tag kind={category === "creator" ? "channel" : "era"} accentColor={accentColor}>
            {meta}
          </Tag>
        </div>
      )}
    </article>
  );
}
